"use strict";
(globalThis["webpackChunkdocs"] = globalThis["webpackChunkdocs"] || []).push([[84052],{

/***/ 36557
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  assets: () => (/* binding */ assets),
  contentTitle: () => (/* binding */ contentTitle),
  "default": () => (/* binding */ MDXContent),
  frontMatter: () => (/* binding */ frontMatter),
  metadata: () => (/* reexport */ site_api_enumerations_progress_location_md_b7b_namespaceObject),
  toc: () => (/* binding */ toc)
});

;// ./.docusaurus/docusaurus-plugin-content-docs/api/site-api-enumerations-progress-location-md-b7b.json
const site_api_enumerations_progress_location_md_b7b_namespaceObject = /*#__PURE__*/JSON.parse('{"id":"enumerations/ProgressLocation","title":"Enumeration: ProgressLocation","description":"Defined in1328","source":"@site/api/enumerations/ProgressLocation.md","sourceDirName":"enumerations","slug":"/enumerations/ProgressLocation","permalink":"/api/enumerations/ProgressLocation","draft":false,"unlisted":false,"tags":[],"version":"current","frontMatter":{},"sidebar":"typedocSidebar","previous":{"title":"InputBoxValidationSeverity","permalink":"/api/enumerations/InputBoxValidationSeverity"},"next":{"title":"QuickPickItemKind","permalink":"/api/enumerations/QuickPickItemKind"}}');
// EXTERNAL MODULE: ../node_modules/react/jsx-runtime.js
var jsx_runtime = __webpack_require__(62540);
// EXTERNAL MODULE: ../node_modules/@mdx-js/react/lib/index.js
var lib = __webpack_require__(43023);
;// ./api/enumerations/ProgressLocation.md


const frontMatter = {};
const contentTitle = 'Enumeration: ProgressLocation';

const assets = {

};



const toc = [{
  "value": "Enumeration Members",
  "id": "enumeration-members",
  "level": 2
}, {
  "value": "<del>APP_ICON</del>",
  "id": "app_icon",
  "level": 3
}, {
  "value": "Deprecated",
  "id": "deprecated",
  "level": 4
}, {
  "value": "See",
  "id": "see",
  "level": 4
}, {
  "value": "TASK_WIDGET",
  "id": "task_widget",
  "level": 3
}];
function _createMdxContent(props) {
  const _components = {
    a: "a",
    blockquote: "blockquote",
    code: "code",
    del: "del",
    h1: "h1",
    h2: "h2",
    h3: "h3",
    h4: "h4",
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
        id: "enumeration-progresslocation",
        children: "Enumeration: ProgressLocation"
      })
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/87545b1bf92a7687c27e27c78a6980b70b04552b/packages/extension-api/src/extension-api.d.ts#L1328",
        children: "packages/extension-api/src/extension-api.d.ts:1328"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "A location in the editor at which progress information can be shown. It depends on the\nlocation how progress is visually represented."
    }), "\n", (0,jsx_runtime.jsx)(_components.h2, {
      id: "enumeration-members",
      children: "Enumeration Members"
    }), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "app_icon",
      children: (0,jsx_runtime.jsx)(_components.del, {
        children: "APP_ICON"
      })
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.strong, {
          children: "APP_ICON"
        }), ": ", (0,jsx_runtime.jsx)(_components.code, {
          children: "1"
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/87545b1bf92a7687c27e27c78a6980b70b04552b/packages/extension-api/src/extension-api.d.ts#L1336",
        children: "packages/extension-api/src/extension-api.d.ts:1336"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Show progress bar under app icon in launcher bar."
    }), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "deprecated",
      children: "Deprecated"
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "This value is deprecated as it does not render equally on various supported platforms. It will be\nremoved in future versions of Podman Desktop. We strongly encourage to use TASK_WIDGET instead."
    }), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "see",
      children: "See"
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "TASK_WIDGET"
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "task_widget",
      children: "TASK_WIDGET"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.strong, {
          children: "TASK_WIDGET"
        }), ": ", (0,jsx_runtime.jsx)(_components.code, {
          children: "2"
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/87545b1bf92a7687c27e27c78a6980b70b04552b/packages/extension-api/src/extension-api.d.ts#L1341",
        children: "packages/extension-api/src/extension-api.d.ts:1341"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Show progress in the task manager widget"
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