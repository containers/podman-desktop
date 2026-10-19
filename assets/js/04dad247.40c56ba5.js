"use strict";
(globalThis["webpackChunkdocs"] = globalThis["webpackChunkdocs"] || []).push([[21563],{

/***/ 84903
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  assets: () => (/* binding */ assets),
  contentTitle: () => (/* binding */ contentTitle),
  "default": () => (/* binding */ MDXContent),
  frontMatter: () => (/* binding */ frontMatter),
  metadata: () => (/* reexport */ site_api_interfaces_provider_connection_shell_access_md_04d_namespaceObject),
  toc: () => (/* binding */ toc)
});

;// ./.docusaurus/docusaurus-plugin-content-docs/api/site-api-interfaces-provider-connection-shell-access-md-04d.json
const site_api_interfaces_provider_connection_shell_access_md_04d_namespaceObject = /*#__PURE__*/JSON.parse('{"id":"interfaces/ProviderConnectionShellAccess","title":"Interface: ProviderConnectionShellAccess","description":"Defined in883","source":"@site/api/interfaces/ProviderConnectionShellAccess.md","sourceDirName":"interfaces","slug":"/interfaces/ProviderConnectionShellAccess","permalink":"/api/interfaces/ProviderConnectionShellAccess","draft":false,"unlisted":false,"tags":[],"version":"current","frontMatter":{},"sidebar":"typedocSidebar","previous":{"title":"ProviderConnectionLifecycle","permalink":"/api/interfaces/ProviderConnectionLifecycle"},"next":{"title":"ProviderConnectionShellAccessData","permalink":"/api/interfaces/ProviderConnectionShellAccessData"}}');
// EXTERNAL MODULE: ../node_modules/react/jsx-runtime.js
var jsx_runtime = __webpack_require__(62540);
// EXTERNAL MODULE: ../node_modules/@mdx-js/react/lib/index.js
var lib = __webpack_require__(43023);
;// ./api/interfaces/ProviderConnectionShellAccess.md


const frontMatter = {};
const contentTitle = 'Interface: ProviderConnectionShellAccess';

const assets = {

};



const toc = [{
  "value": "Methods",
  "id": "methods",
  "level": 2
}, {
  "value": "open()",
  "id": "open",
  "level": 3
}, {
  "value": "Returns",
  "id": "returns",
  "level": 4
}, {
  "value": "Example",
  "id": "example",
  "level": 4
}];
function _createMdxContent(props) {
  const _components = {
    a: "a",
    blockquote: "blockquote",
    code: "code",
    h1: "h1",
    h2: "h2",
    h3: "h3",
    h4: "h4",
    header: "header",
    p: "p",
    pre: "pre",
    strong: "strong",
    ...(0,lib/* useMDXComponents */.R)(),
    ...props.components
  };
  return (0,jsx_runtime.jsxs)(jsx_runtime.Fragment, {
    children: [(0,jsx_runtime.jsx)(_components.header, {
      children: (0,jsx_runtime.jsx)(_components.h1, {
        id: "interface-providerconnectionshellaccess",
        children: "Interface: ProviderConnectionShellAccess"
      })
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/d9155c1c9fec793d45fddd68620abd9a7a266a8a/packages/extension-api/src/extension-api.d.ts#L883",
        children: "packages/extension-api/src/extension-api.d.ts:883"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Callback for openning shell session"
    }), "\n", (0,jsx_runtime.jsx)(_components.h2, {
      id: "methods",
      children: "Methods"
    }), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "open",
      children: "open()"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.strong, {
          children: "open"
        }), "(): ", (0,jsx_runtime.jsx)(_components.a, {
          href: "/api/interfaces/ProviderConnectionShellAccessSession",
          children: (0,jsx_runtime.jsx)(_components.code, {
            children: "ProviderConnectionShellAccessSession"
          })
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/d9155c1c9fec793d45fddd68620abd9a7a266a8a/packages/extension-api/src/extension-api.d.ts#L921",
        children: "packages/extension-api/src/extension-api.d.ts:921"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Opens new session using ProviderConnectionShellAccessImpl class"
    }), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "returns",
      children: "Returns"
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: (0,jsx_runtime.jsx)(_components.a, {
        href: "/api/interfaces/ProviderConnectionShellAccessSession",
        children: (0,jsx_runtime.jsx)(_components.code, {
          children: "ProviderConnectionShellAccessSession"
        })
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "example",
      children: "Example"
    }), "\n", (0,jsx_runtime.jsx)(_components.pre, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        className: "language-ts",
        children: "import * as api from '@podman-desktop/api';\n\nclass ProviderConnectionShellAccessImpl implements ProviderConnectionShellAccess {\n open(): ProviderConnectionShellAccessSession {\n   // This is client that will connect to your shell\n   #client = new Client();\n\n   // You need to listen to events from client and forward them to the caller by using the object returned below\n\n   return {\n     onData,\n     onError,\n     onEnd,\n     write,\n     resize,\n     close,\n   };\n }\n}\n\nexport async function activate(extensionContext: api.ExtensionContext): Promise<void> {\n const providerConnectionShellAccess = new ProviderConnectionShellAccessImpl(machineInfo);\n\n // Create containerProviderConnection object\n const containerProviderConnection: extensionApi.ContainerProviderConnection = {\n   ...\n   shellAccess: providerConnectionShellAccess,\n   ...\n };\n\n const disposable = provider.registerContainerProviderConnection(containerProviderConnection);\n extensionContext.subscriptions.push(disposable);\n}\n"
      })
    })]
  });
}
function MDXContent(props = {}) {
  const {wrapper: MDXLayout} = {
    ...(0,lib/* useMDXComponents */.R)(),
    ...props.components
  };
  return MDXLayout ? (0,jsx_runtime.jsx)(MDXLayout, {
    ...props,
    children: (0,jsx_runtime.jsx)(_createMdxContent, {
      ...props
    })
  }) : _createMdxContent(props);
}



/***/ },

/***/ 43023
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   R: () => (/* binding */ useMDXComponents),
/* harmony export */   x: () => (/* binding */ MDXProvider)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(63696);
/**
 * @import {MDXComponents} from 'mdx/types.js'
 * @import {Component, ReactElement, ReactNode} from 'react'
 */

/**
 * @callback MergeComponents
 *   Custom merge function.
 * @param {Readonly<MDXComponents>} currentComponents
 *   Current components from the context.
 * @returns {MDXComponents}
 *   Additional components.
 *
 * @typedef Props
 *   Configuration for `MDXProvider`.
 * @property {ReactNode | null | undefined} [children]
 *   Children (optional).
 * @property {Readonly<MDXComponents> | MergeComponents | null | undefined} [components]
 *   Additional components to use or a function that creates them (optional).
 * @property {boolean | null | undefined} [disableParentContext=false]
 *   Turn off outer component context (default: `false`).
 */



/** @type {Readonly<MDXComponents>} */
const emptyComponents = {}

const MDXContext = react__WEBPACK_IMPORTED_MODULE_0__.createContext(emptyComponents)

/**
 * Get current components from the MDX Context.
 *
 * @param {Readonly<MDXComponents> | MergeComponents | null | undefined} [components]
 *   Additional components to use or a function that creates them (optional).
 * @returns {MDXComponents}
 *   Current components.
 */
function useMDXComponents(components) {
  const contextComponents = react__WEBPACK_IMPORTED_MODULE_0__.useContext(MDXContext)

  // Memoize to avoid unnecessary top-level context changes
  return react__WEBPACK_IMPORTED_MODULE_0__.useMemo(
    function () {
      // Custom merge via a function prop
      if (typeof components === 'function') {
        return components(contextComponents)
      }

      return {...contextComponents, ...components}
    },
    [contextComponents, components]
  )
}

/**
 * Provider for MDX context.
 *
 * @param {Readonly<Props>} properties
 *   Properties.
 * @returns {ReactElement}
 *   Element.
 * @satisfies {Component}
 */
function MDXProvider(properties) {
  /** @type {Readonly<MDXComponents>} */
  let allComponents

  if (properties.disableParentContext) {
    allComponents =
      typeof properties.components === 'function'
        ? properties.components(emptyComponents)
        : properties.components || emptyComponents
  } else {
    allComponents = useMDXComponents(properties.components)
  }

  return react__WEBPACK_IMPORTED_MODULE_0__.createElement(
    MDXContext.Provider,
    {value: allComponents},
    properties.children
  )
}


/***/ }

}]);