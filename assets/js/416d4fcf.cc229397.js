"use strict";
(globalThis["webpackChunkdocs"] = globalThis["webpackChunkdocs"] || []).push([[53125],{

/***/ 94258
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  assets: () => (/* binding */ assets),
  contentTitle: () => (/* binding */ contentTitle),
  "default": () => (/* binding */ MDXContent),
  frontMatter: () => (/* binding */ frontMatter),
  metadata: () => (/* reexport */ site_api_interfaces_container_create_result_md_416_namespaceObject),
  toc: () => (/* binding */ toc)
});

;// ./.docusaurus/docusaurus-plugin-content-docs/api/site-api-interfaces-container-create-result-md-416.json
const site_api_interfaces_container_create_result_md_416_namespaceObject = /*#__PURE__*/JSON.parse('{"id":"interfaces/ContainerCreateResult","title":"Interface: ContainerCreateResult","description":"Defined in3560","source":"@site/api/interfaces/ContainerCreateResult.md","sourceDirName":"interfaces","slug":"/interfaces/ContainerCreateResult","permalink":"/api/interfaces/ContainerCreateResult","draft":false,"unlisted":false,"tags":[],"version":"current","frontMatter":{},"sidebar":"typedocSidebar","previous":{"title":"ContainerCreateOptions","permalink":"/api/interfaces/ContainerCreateOptions"},"next":{"title":"ContainerEngineInfo","permalink":"/api/interfaces/ContainerEngineInfo"}}');
// EXTERNAL MODULE: ../node_modules/react/jsx-runtime.js
var jsx_runtime = __webpack_require__(62540);
// EXTERNAL MODULE: ../node_modules/@mdx-js/react/lib/index.js
var lib = __webpack_require__(43023);
;// ./api/interfaces/ContainerCreateResult.md


const frontMatter = {};
const contentTitle = 'Interface: ContainerCreateResult';

const assets = {

};



const toc = [{
  "value": "Properties",
  "id": "properties",
  "level": 2
}, {
  "value": "engineId",
  "id": "engineid",
  "level": 3
}, {
  "value": "id",
  "id": "id",
  "level": 3
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
    hr: "hr",
    p: "p",
    strong: "strong",
    ...(0,lib/* useMDXComponents */.R)(),
    ...props.components
  };
  return (0,jsx_runtime.jsxs)(jsx_runtime.Fragment, {
    children: [(0,jsx_runtime.jsx)(_components.header, {
      children: (0,jsx_runtime.jsx)(_components.h1, {
        id: "interface-containercreateresult",
        children: "Interface: ContainerCreateResult"
      })
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/d9155c1c9fec793d45fddd68620abd9a7a266a8a/packages/extension-api/src/extension-api.d.ts#L3560",
        children: "packages/extension-api/src/extension-api.d.ts:3560"
      })]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Information about the container created by calling the ", (0,jsx_runtime.jsx)(_components.a, {
        href: "/api/@podman-desktop/namespaces/containerEngine/functions/createContainer",
        children: "containerEngine.createContainer"
      }), " method"]
    }), "\n", (0,jsx_runtime.jsx)(_components.h2, {
      id: "properties",
      children: "Properties"
    }), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "engineid",
      children: "engineId"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.strong, {
          children: "engineId"
        }), ": ", (0,jsx_runtime.jsx)(_components.code, {
          children: "string"
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/d9155c1c9fec793d45fddd68620abd9a7a266a8a/packages/extension-api/src/extension-api.d.ts#L3568",
        children: "packages/extension-api/src/extension-api.d.ts:3568"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "the engineId where the container is running"
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "id",
      children: "id"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.strong, {
          children: "id"
        }), ": ", (0,jsx_runtime.jsx)(_components.code, {
          children: "string"
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/d9155c1c9fec793d45fddd68620abd9a7a266a8a/packages/extension-api/src/extension-api.d.ts#L3564",
        children: "packages/extension-api/src/extension-api.d.ts:3564"
      })]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["a string uniquely identifying the created container, which can be used to execute other methods on the container (", (0,jsx_runtime.jsx)(_components.a, {
        href: "/api/@podman-desktop/namespaces/containerEngine/functions/deleteContainer",
        children: "containerEngine.deleteContainer"
      }), ", ", (0,jsx_runtime.jsx)(_components.a, {
        href: "/api/@podman-desktop/namespaces/containerEngine/functions/inspectContainer",
        children: "containerEngine.inspectContainer"
      }), ", ", (0,jsx_runtime.jsx)(_components.a, {
        href: "/api/@podman-desktop/namespaces/containerEngine/functions/startContainer",
        children: "containerEngine.startContainer"
      }), ", ", (0,jsx_runtime.jsx)(_components.a, {
        href: "/api/@podman-desktop/namespaces/containerEngine/functions/stopContainer",
        children: "containerEngine.stopContainer"
      }), ", ", (0,jsx_runtime.jsx)(_components.a, {
        href: "/api/@podman-desktop/namespaces/containerEngine/functions/logsContainer",
        children: "containerEngine.logsContainer"
      }), ")"]
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