"use strict";
(globalThis["webpackChunkdocs"] = globalThis["webpackChunkdocs"] || []).push([[41462],{

/***/ 52184
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  assets: () => (/* binding */ assets),
  contentTitle: () => (/* binding */ contentTitle),
  "default": () => (/* binding */ MDXContent),
  frontMatter: () => (/* binding */ frontMatter),
  metadata: () => (/* reexport */ site_api_podman_desktop_namespaces_net_functions_get_free_port_md_d44_namespaceObject),
  toc: () => (/* binding */ toc)
});

;// ./.docusaurus/docusaurus-plugin-content-docs/api/site-api-podman-desktop-namespaces-net-functions-get-free-port-md-d44.json
const site_api_podman_desktop_namespaces_net_functions_get_free_port_md_d44_namespaceObject = /*#__PURE__*/JSON.parse('{"id":"@podman-desktop/namespaces/net/functions/getFreePort","title":"Function: getFreePort()","description":"getFreePort(port): Promise\\\\","source":"@site/api/@podman-desktop/namespaces/net/functions/getFreePort.md","sourceDirName":"@podman-desktop/namespaces/net/functions","slug":"/@podman-desktop/namespaces/net/functions/getFreePort","permalink":"/api/@podman-desktop/namespaces/net/functions/getFreePort","draft":false,"unlisted":false,"tags":[],"version":"current","frontMatter":{},"sidebar":"typedocSidebar","previous":{"title":"net","permalink":"/api/@podman-desktop/namespaces/net/"},"next":{"title":"process","permalink":"/api/@podman-desktop/namespaces/process/"}}');
// EXTERNAL MODULE: ../node_modules/react/jsx-runtime.js
var jsx_runtime = __webpack_require__(62540);
// EXTERNAL MODULE: ../node_modules/@mdx-js/react/lib/index.js
var lib = __webpack_require__(43023);
;// ./api/@podman-desktop/namespaces/net/functions/getFreePort.md


const frontMatter = {};
const contentTitle = 'Function: getFreePort()';

const assets = {

};



const toc = [{
  "value": "Parameters",
  "id": "parameters",
  "level": 2
}, {
  "value": "port",
  "id": "port",
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
        id: "function-getfreeport",
        children: "Function: getFreePort()"
      })
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.strong, {
          children: "getFreePort"
        }), "(", (0,jsx_runtime.jsx)(_components.code, {
          children: "port"
        }), "): ", (0,jsx_runtime.jsx)(_components.code, {
          children: "Promise"
        }), "<", (0,jsx_runtime.jsx)(_components.code, {
          children: "number"
        }), ">"]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/11b3dada6a91c7d34c20f0c83ff25becdbcbd003/packages/extension-api/src/extension-api.d.ts#L5076",
        children: "packages/extension-api/src/extension-api.d.ts:5076"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Finds a free port starting from the specified port and returns it."
    }), "\n", (0,jsx_runtime.jsx)(_components.h2, {
      id: "parameters",
      children: "Parameters"
    }), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "port",
      children: "port"
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        children: "number"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "The starting port number to search for a free port. Must be between 0 and 65535.\nIf less than 1024, it defaults to 9000."
    }), "\n", (0,jsx_runtime.jsx)(_components.h2, {
      id: "returns",
      children: "Returns"
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: [(0,jsx_runtime.jsx)(_components.code, {
        children: "Promise"
      }), "<", (0,jsx_runtime.jsx)(_components.code, {
        children: "number"
      }), ">"]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "A promise that resolves to a free port number."
    }), "\n", (0,jsx_runtime.jsx)(_components.h2, {
      id: "throws",
      children: "Throws"
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Error if the port is invalid (NaN or > 65535) or if no free port is found within the valid range (0-65535)."
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