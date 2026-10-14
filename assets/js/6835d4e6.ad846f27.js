"use strict";
(globalThis["webpackChunkdocs"] = globalThis["webpackChunkdocs"] || []).push([[68568],{

/***/ 20888
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  assets: () => (/* binding */ assets),
  contentTitle: () => (/* binding */ contentTitle),
  "default": () => (/* binding */ MDXContent),
  frontMatter: () => (/* binding */ frontMatter),
  metadata: () => (/* reexport */ site_api_podman_desktop_namespaces_proxy_variables_on_did_update_proxy_md_683_namespaceObject),
  toc: () => (/* binding */ toc)
});

;// ./.docusaurus/docusaurus-plugin-content-docs/api/site-api-podman-desktop-namespaces-proxy-variables-on-did-update-proxy-md-683.json
const site_api_podman_desktop_namespaces_proxy_variables_on_did_update_proxy_md_683_namespaceObject = /*#__PURE__*/JSON.parse('{"id":"@podman-desktop/namespaces/proxy/variables/onDidUpdateProxy","title":"Variable: onDidUpdateProxy","description":"const onDidUpdateProxy: Event\\\\","source":"@site/api/@podman-desktop/namespaces/proxy/variables/onDidUpdateProxy.md","sourceDirName":"@podman-desktop/namespaces/proxy/variables","slug":"/@podman-desktop/namespaces/proxy/variables/onDidUpdateProxy","permalink":"/api/@podman-desktop/namespaces/proxy/variables/onDidUpdateProxy","draft":false,"unlisted":false,"tags":[],"version":"current","frontMatter":{},"sidebar":"typedocSidebar","previous":{"title":"onDidStateChange","permalink":"/api/@podman-desktop/namespaces/proxy/variables/onDidStateChange"},"next":{"title":"getProxySettings","permalink":"/api/@podman-desktop/namespaces/proxy/functions/getProxySettings"}}');
// EXTERNAL MODULE: ../node_modules/react/jsx-runtime.js
var jsx_runtime = __webpack_require__(62540);
// EXTERNAL MODULE: ../node_modules/@mdx-js/react/lib/index.js
var lib = __webpack_require__(43023);
;// ./api/@podman-desktop/namespaces/proxy/variables/onDidUpdateProxy.md


const frontMatter = {};
const contentTitle = 'Variable: onDidUpdateProxy';

const assets = {

};



const toc = [];
function _createMdxContent(props) {
  const _components = {
    a: "a",
    blockquote: "blockquote",
    code: "code",
    h1: "h1",
    header: "header",
    p: "p",
    strong: "strong",
    ...(0,lib/* useMDXComponents */.R)(),
    ...props.components
  };
  return (0,jsx_runtime.jsxs)(jsx_runtime.Fragment, {
    children: [(0,jsx_runtime.jsx)(_components.header, {
      children: (0,jsx_runtime.jsx)(_components.h1, {
        id: "variable-ondidupdateproxy",
        children: "Variable: onDidUpdateProxy"
      })
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "const"
        }), " ", (0,jsx_runtime.jsx)(_components.strong, {
          children: "onDidUpdateProxy"
        }), ": ", (0,jsx_runtime.jsx)(_components.a, {
          href: "/api/interfaces/Event",
          children: (0,jsx_runtime.jsx)(_components.code, {
            children: "Event"
          })
        }), "<", (0,jsx_runtime.jsx)(_components.a, {
          href: "/api/interfaces/ProxySettings",
          children: (0,jsx_runtime.jsx)(_components.code, {
            children: "ProxySettings"
          })
        }), ">"]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/a146fc599f3b0bbd9253f34b68008911562e9a04/packages/extension-api/src/extension-api.d.ts#L1160",
        children: "packages/extension-api/src/extension-api.d.ts:1160"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Listen for changes on the proxy settings. The listener will be called with the new settings\nevery time the settings change."
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["For examples, see ", (0,jsx_runtime.jsx)(_components.a, {
        href: "/api/@podman-desktop/namespaces/proxy/",
        children: "proxy"
      }), " and ", (0,jsx_runtime.jsx)(_components.a, {
        href: "/api/interfaces/Event",
        children: "Event"
      }), "."]
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