import { transform } from 'esbuild';
import { readFile } from 'fs/promises';
import { extname } from 'path';

const MODULE_NOT_FOUND_CODE = 'ERR_MODULE_NOT_FOUND';

global.__esbuildMock = {
  INTERNALS_SYMBOL: Symbol(),
  ACTIONS_SYMBOL: Symbol(),
  REGISTER_SYMBOL: Symbol(),
  MODULE_CACHE: new Map(),
  counter: 1,
  metaUrl: '',
};

const EXTENSIONS = {
  '.ts': 'ts',
};

const ESBUILD_QUERY_PREFIX = '__esbuild';
const ESBUILD_ORIGINAL_QUERY = '__esbuild_original';

export class VerificationError extends Error {
  constructor(actions) {
    super('Error verifying that all of the actions for these parameters were used');
    this.actions = actions;
  }
}

// object and array is fine, null is not
function isObject(value) {
  return typeof value === 'object' && value !== null;
}

function createMock() {
  const calls = [];
  const mockActions = new Map();

  function mock(...params) {
    const paramIdentifier = JSON.stringify(params);

    calls.push({
      ident: JSON.stringify(params),
      params,
    });

    const actionSequence = mockActions.get(paramIdentifier) || [];

    const currentAction = actionSequence.shift();

    if (!currentAction) {
      throw new Error('esbuild-mocks: No action found for this mock.');
    }

    switch (currentAction.type) {
      case 'return':
        return currentAction.value;

      case 'resolve':
        return Promise.resolve(currentAction.value);

      case 'reject':
        return Promise.reject(currentAction.value);

      case 'callback':
        const callbackFunc = params[params.length - 1];
        if (typeof callbackFunc !== 'function') {
          throw new Error('thenCallback did not find a function callback parameter.');
        }
        setImmediate(() => callbackFunc(...currentAction.value));
        return undefined;

      case 'callbackreturn':
        const callbackReturnFunc = params[params.length - 1];
        if (typeof callbackReturnFunc !== 'function') {
          throw new Error('thenCallback did not find a function callback parameter.');
        }
        const [returnValue, ...callbackValues] = currentAction.value;
        setImmediate(() => callbackReturnFunc(...callbackValues));
        return returnValue;

      case 'throw':
        throw currentAction.value;

      case 'do':
        const doFunc = currentAction.value;
        const result = doFunc(...params);
        return result;
    }
  }

  Object.defineProperty(mock, 'calls', {
    get() {
      return calls.map(({ params }) => (params));
    },
  });

  Object.defineProperty(mock, global.__esbuildMock.ACTIONS_SYMBOL, {
    get() {
      return (params) => {
        const paramIdent = JSON.stringify(params);
        return mockActions.get(paramIdent).slice();
      };
    },
  });

  Object.defineProperty(mock, global.__esbuildMock.REGISTER_SYMBOL, {
    get() {
      return (params) => {
        const paramIdent = JSON.stringify(params);

        if (!mockActions.has(paramIdent)) {
          mockActions.set(paramIdent, []);
        }

        return paramIdent;
      };
    },
  })

  Object.defineProperty(mock, global.__esbuildMock.INTERNALS_SYMBOL, {
    get() {
      return (parameterIdent) => {
        const actionsRef = mockActions.get(parameterIdent);

        return {
          get actions() {
            const actions = actionsRef;
            return actions ? actions.slice() : [];
          },

          thenReturn(...values) {
            registerValuesActions('return', actionsRef, values);
            return this;
          },

          thenResolve(...values) {
            registerValuesActions('resolve', actionsRef, values);
            return this;
          },

          thenReject(...values) {
            registerValuesActions('reject', actionsRef, values);
            return this;
          },

          thenCallback(value) {
            registerValuesActions('callback', actionsRef, [value]);
            return this;
          },

          thenCallbackWithReturn(...values) {
            registerValuesActions('callbackreturn', actionsRef, [values]);
            return this;
          },

          thenThrow(...values) {
            registerValuesActions('throw', actionsRef, values);
            return this;
          },

          thenDo(value) {
            registerValuesActions('do', actionsRef, [value]);
            return this;
          }
        };
      }
    },
  });

  return mock;
}

function registerValuesActions(type, actions, values) {
  values.forEach((value) => {
    actions.push({
      type,
      value,
    });
  })
}

export async function resolve(specifier, context, defaultResolve) {
  console.log('resolve', specifier);
  // console.log('resolve context', context);

  const defaultResolveReturn = (specifier) => {
    const updatedContext = {
      ...context,
    };

    if (global.__esbuildMock.metaUrl && specifier.includes(ESBUILD_QUERY_PREFIX)) {
      updatedContext.parentURL = global.__esbuildMock.metaUrl;
    }

    // console.log('resolve updated context', updatedContext);

    return defaultResolve(
      specifier.includes(ESBUILD_QUERY_PREFIX)
        ? specifier.replace(`?${ESBUILD_ORIGINAL_QUERY}`, '').replace(`?${ESBUILD_QUERY_PREFIX}`, '')
        : specifier,
      updatedContext
    );
  };

  if (specifier.includes('node_modules')) {
    return defaultResolveReturn(specifier);
  }

  const { parentURL } = context;

  try {
    if (specifier.includes(ESBUILD_ORIGINAL_QUERY)) {
      const result = await defaultResolveReturn(specifier);
      return result;
    }

    const { url } = await defaultResolveReturn(specifier);
    const parsedUrl = new URL(url);

    if (url.startsWith('node:') && !getStub(parsedUrl.pathname)) {
      return { url };
    }

    const count = global.__esbuildMock.counter

    const buildUrl = `${parsedUrl}?${ESBUILD_QUERY_PREFIX}=${count}`;

    return {
      url: buildUrl,
    };
  } catch (error) {
    if (error.code === MODULE_NOT_FOUND_CODE) {
      if (extname(specifier) === '') {
        const parts = specifier.split('?');
        parts[0] += '.ts';
        const newSpecifier = parts.join('?');

        return resolve(newSpecifier, context, defaultResolve);
      }

      const constructedUrl = parentURL ? `${new URL(specifier, parentURL).href}?${ESBUILD_QUERY_PREFIX}=${count}` : new URL(specifier).href;

      return {
        url: constructedUrl,
      };
    } else {
      throw error;
    }
  }
};

function getStub(specifier) {
  return global.__esbuildMock.MODULE_CACHE.get(specifier);
}

export async function load(url, context, defaultLoad) {
  const parsedUrl = new URL(url);
  console.log('looking up stub for', parsedUrl.pathname);
  console.log(global.__esbuildMock.MODULE_CACHE);
  const stub = getStub(parsedUrl.pathname);
  // console.log('stub', stub);

  if (stub) {
    return { source: constructMockedModuleSource(parsedUrl.pathname, stub), format: 'module' };
  }

  const extension = extname(parsedUrl.pathname);

  if (extension === '') {
    parsedUrl.pathname += '.ts';
  }

  const shouldTranspile = EXTENSIONS[extname(parsedUrl.pathname)];

  if (shouldTranspile) {
    const file = await readFile(parsedUrl.pathname, { encoding: 'utf-8' });

    const transpilation = await transform(file, {
      format: 'esm',
      sourcefile: url,
      loader: EXTENSIONS[extname(parsedUrl.pathname)],
      logLevel: 'error',
      target: [`node${process.version.slice(1)}`],
      minify: false,
      sourcemap: 'inline',
    });

    return { source: transpilation.code, format: 'module' }
  }

  return defaultLoad(url, context, defaultLoad);
}

function constructMockedModuleSource(moduleIdent, { namedExports, defaultExport }) {
  return `
${Object.keys(namedExports || {})
      .map(
        (name) =>
          `export const ${name} = global.__esbuildMock.MODULE_CACHE.get(${JSON.stringify(
            moduleIdent
          )}).namedExports["${name}"]`
      )
      .join(';\n')};
${defaultExport
      ? `export default global.__esbuildMock.MODULE_CACHE.get(${JSON.stringify(
        moduleIdent
      )}).defaultExport;`
      : ''
    }
export const __esbuildMocked = true;
`;
}

function isSupportedExtension(filename) {
  const extensionName = extname(filename);
  return extensionName in EXTENSIONS;
}

export async function replace(path) {
  const module = await import(`${path}?${ESBUILD_ORIGINAL_QUERY}`);

  const { namedExports, defaultExport } = constructModuleMocks(module);

  const absolutePath = await getAbsoluteUrl(path);

  global.__esbuildMock.MODULE_CACHE.set(absolutePath, {
    namedExports,
    defaultExport,
  });

  ++global.__esbuildMock.counter;

  const mockedModule = await import(`${path}?${ESBUILD_QUERY_PREFIX}`);

  console.log('mocked module', mockedModule);

  return mockedModule;
}

function constructModuleMocks(module) {
  const mockReturn = {
    namedExports: {},
  };

  const { default: defaultExportValue, ...namedExportValues } = module;

  const iterateChildren = (moduleObject, mock, lookup) => {
    Object.keys(moduleObject).forEach((name) => {
      if (typeof moduleObject[name] !== 'function') {
        mock[name] = moduleObject[name];
        return;
      }

      if (lookup && lookup[name]) {
        mock[name] = lookup[name];
      }

      mock[name] = createMock();
    });
  };

  iterateChildren(namedExportValues, mockReturn.namedExports);

  if (typeof defaultExportValue === 'function') {
    mock.defaultExport = createMock();
  } else if (isObject(defaultExportValue)) {
    mockReturn.defaultExport = {};
    iterateChildren(defaultExportValue, mockReturn.defaultExport, mockReturn.namedExports);
  } else {
    mockReturn.defaultExport = defaultExportValue;
  }

  return mockReturn;
}

export function reset() {
  delete global.__esbuildMock.MODULE_CACHE;
  delete global.__esbuildMock.metaUrl;
  global.__esbuildMock.MODULE_CACHE = new Map();
  global.__esbuildMock.metaUrl = '';
}

export function when(fn, ...params) {
  console.log(fn);
  console.log(fn[global.__esbuildMock.REGISTER_SYMBOL]);
  const ident = fn[global.__esbuildMock.REGISTER_SYMBOL](params);
  const mock = fn[global.__esbuildMock.INTERNALS_SYMBOL](ident);
  return mock;
}

export function verify(fn, ...params) {
  const actions = fn[global.__esbuildMock.ACTIONS_SYMBOL](params);

  if (actions.length === 0) {
    return;
  }

  throw new VerificationError(actions);
}

export function registerImportMetaUrl(url) {
  // console.log('registering meta url', url);
  global.__esbuildMock.metaUrl = url.replace(`?${ESBUILD_QUERY_PREFIX}`, '');
}

async function getAbsoluteUrl(specifier) {
  const metaUrl = global.__esbuildMock.metaUrl;

  if (!metaUrl) {
    throw new Error('Please call \"registerImportMetaUrl\" from this library before mocking modules.');
  }

  const path = await import.meta.resolve(specifier, metaUrl);

  const url = new URL(path);

  console.log('absolute url path', url.pathname);

  return url.pathname;
}
