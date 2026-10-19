"use strict";
(globalThis["webpackChunkdocs"] = globalThis["webpackChunkdocs"] || []).push([[93652],{

/***/ 45281
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  assets: () => (/* binding */ assets),
  contentTitle: () => (/* binding */ contentTitle),
  "default": () => (/* binding */ MDXContent),
  frontMatter: () => (/* binding */ frontMatter),
  metadata: () => (/* reexport */ site_api_podman_desktop_namespaces_provider_functions_get_provider_lifecycle_context_md_8c9_namespaceObject),
  toc: () => (/* binding */ toc)
});

;// ./.docusaurus/docusaurus-plugin-content-docs/api/site-api-podman-desktop-namespaces-provider-functions-get-provider-lifecycle-context-md-8c9.json
const site_api_podman_desktop_namespaces_provider_functions_get_provider_lifecycle_context_md_8c9_namespaceObject = /*#__PURE__*/JSON.parse('{"id":"@podman-desktop/namespaces/provider/functions/getProviderLifecycleContext","title":"Function: getProviderLifecycleContext()","description":"getProviderLifecycleContext(providerId, containerProviderConnection): LifecycleContext","source":"@site/api/@podman-desktop/namespaces/provider/functions/getProviderLifecycleContext.md","sourceDirName":"@podman-desktop/namespaces/provider/functions","slug":"/@podman-desktop/namespaces/provider/functions/getProviderLifecycleContext","permalink":"/api/@podman-desktop/namespaces/provider/functions/getProviderLifecycleContext","draft":false,"unlisted":false,"tags":[],"version":"current","frontMatter":{},"sidebar":"typedocSidebar","previous":{"title":"getContainerConnections","permalink":"/api/@podman-desktop/namespaces/provider/functions/getContainerConnections"},"next":{"title":"proxy","permalink":"/api/@podman-desktop/namespaces/proxy/"}}');
// EXTERNAL MODULE: ../node_modules/react/jsx-runtime.js
var jsx_runtime = __webpack_require__(62540);
// EXTERNAL MODULE: ../node_modules/@mdx-js/react/lib/index.js
var lib = __webpack_require__(43023);
;// ./api/@podman-desktop/namespaces/provider/functions/getProviderLifecycleContext.md


const frontMatter = {};
const contentTitle = 'Function: getProviderLifecycleContext()';

const assets = {

};



const toc = [{
  "value": "Parameters",
  "id": "parameters",
  "level": 2
}, {
  "value": "providerId",
  "id": "providerid",
  "level": 3
}, {
  "value": "containerProviderConnection",
  "id": "containerproviderconnection",
  "level": 3
}, {
  "value": "Returns",
  "id": "returns",
  "level": 2
}, {
  "value": "Throws",
  "id": "throws",
  "level": 2
}];
function _createMdxContent(props) {
  const _components = {
    a: "a",
    blockquote: "blockquote",
    code: "code",
    h1: "h1",
    h2: "h2",
    h3: "h3",
    header: "header",
    p: "p",
    strong: "strong",
    ...(0,lib/* useMDXComponents */.R)(),
    ...props.components
  };
  return (0,jsx_runtime.jsxs)(jsx_runtime.Fragment, {
    children: [(0,jsx_runtime.jsx)(_components.header, {
      children: (0,jsx_runtime.jsx)(_components.h1, {
        id: "function-getproviderlifecyclecontext",
        children: "Function: getProviderLifecycleContext()"
      })
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.strong, {
          children: "getProviderLifecycleContext"
        }), "(", (0,jsx_runtime.jsx)(_components.code, {
          children: "providerId"
        }), ", ", (0,jsx_runtime.jsx)(_components.code, {
          children: "containerProviderConnection"
        }), "): ", (0,jsx_runtime.jsx)(_components.a, {
          href: "/api/interfaces/LifecycleContext",
          children: (0,jsx_runtime.jsx)(_components.code, {
            children: "LifecycleContext"
          })
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/b68ff8467424d04aaef668a41eb67df5d5c65d2e/packages/extension-api/src/extension-api.d.ts#L1082",
        children: "packages/extension-api/src/extension-api.d.ts:1082"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "It returns the lifecycle context for the provider connection.\nIf no context is found it throws an error"
    }), "\n", (0,jsx_runtime.jsx)(_components.h2, {
      id: "parameters",
      children: "Parameters"
    }), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "providerid",
      children: "providerId"
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        children: "string"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "the provider id"
    }), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "containerproviderconnection",
      children: "containerProviderConnection"
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: (0,jsx_runtime.jsx)(_components.a, {
        href: "/api/interfaces/ContainerProviderConnection",
        children: (0,jsx_runtime.jsx)(_components.code, {
          children: "ContainerProviderConnection"
        })
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "the connection to retrieve the lifecycle context for"
    }), "\n", (0,jsx_runtime.jsx)(_components.h2, {
      id: "returns",
      children: "Returns"
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: (0,jsx_runtime.jsx)(_components.a, {
        href: "/api/interfaces/LifecycleContext",
        children: (0,jsx_runtime.jsx)(_components.code, {
          children: "LifecycleContext"
        })
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "the lifecycle context"
    }), "\n", (0,jsx_runtime.jsx)(_components.h2, {
      id: "throws",
      children: "Throws"
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "if no provider with the id has been found or there is no context associate to it."
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