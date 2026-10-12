"use strict";
(globalThis["webpackChunkdocs"] = globalThis["webpackChunkdocs"] || []).push([[77546],{

/***/ 3153
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  assets: () => (/* binding */ assets),
  contentTitle: () => (/* binding */ contentTitle),
  "default": () => (/* binding */ MDXContent),
  frontMatter: () => (/* binding */ frontMatter),
  metadata: () => (/* reexport */ site_api_classes_cancellation_token_source_md_1df_namespaceObject),
  toc: () => (/* binding */ toc)
});

;// ./.docusaurus/docusaurus-plugin-content-docs/api/site-api-classes-cancellation-token-source-md-1df.json
const site_api_classes_cancellation_token_source_md_1df_namespaceObject = /*#__PURE__*/JSON.parse('{"id":"classes/CancellationTokenSource","title":"Class: CancellationTokenSource","description":"Defined in1418","source":"@site/api/classes/CancellationTokenSource.md","sourceDirName":"classes","slug":"/classes/CancellationTokenSource","permalink":"/api/classes/CancellationTokenSource","draft":false,"unlisted":false,"tags":[],"version":"current","frontMatter":{},"sidebar":"typedocSidebar","previous":{"title":"QuickPickItemKind","permalink":"/api/enumerations/QuickPickItemKind"},"next":{"title":"Disposable","permalink":"/api/classes/Disposable"}}');
// EXTERNAL MODULE: ../node_modules/react/jsx-runtime.js
var jsx_runtime = __webpack_require__(62540);
// EXTERNAL MODULE: ../node_modules/@mdx-js/react/lib/index.js
var lib = __webpack_require__(43023);
;// ./api/classes/CancellationTokenSource.md


const frontMatter = {};
const contentTitle = 'Class: CancellationTokenSource';

const assets = {

};



const toc = [{
  "value": "Constructors",
  "id": "constructors",
  "level": 2
}, {
  "value": "Constructor",
  "id": "constructor",
  "level": 3
}, {
  "value": "Returns",
  "id": "returns",
  "level": 4
}, {
  "value": "Properties",
  "id": "properties",
  "level": 2
}, {
  "value": "token",
  "id": "token",
  "level": 3
}, {
  "value": "Methods",
  "id": "methods",
  "level": 2
}, {
  "value": "cancel()",
  "id": "cancel",
  "level": 3
}, {
  "value": "Returns",
  "id": "returns-1",
  "level": 4
}, {
  "value": "dispose()",
  "id": "dispose",
  "level": 3
}, {
  "value": "Returns",
  "id": "returns-2",
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
    hr: "hr",
    p: "p",
    strong: "strong",
    ...(0,lib/* useMDXComponents */.R)(),
    ...props.components
  };
  return (0,jsx_runtime.jsxs)(jsx_runtime.Fragment, {
    children: [(0,jsx_runtime.jsx)(_components.header, {
      children: (0,jsx_runtime.jsx)(_components.h1, {
        id: "class-cancellationtokensource",
        children: "Class: CancellationTokenSource"
      })
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/278764c44a9f62c3dccbb0d3eb23ba1bd9bee7e1/packages/extension-api/src/extension-api.d.ts#L1418",
        children: "packages/extension-api/src/extension-api.d.ts:1418"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.h2, {
      id: "constructors",
      children: "Constructors"
    }), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "constructor",
      children: "Constructor"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.strong, {
          children: "new CancellationTokenSource"
        }), "(): ", (0,jsx_runtime.jsx)(_components.code, {
          children: "CancellationTokenSource"
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "returns",
      children: "Returns"
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        children: "CancellationTokenSource"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.h2, {
      id: "properties",
      children: "Properties"
    }), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "token",
      children: "token"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.strong, {
          children: "token"
        }), ": ", (0,jsx_runtime.jsx)(_components.a, {
          href: "/api/interfaces/CancellationToken",
          children: (0,jsx_runtime.jsx)(_components.code, {
            children: "CancellationToken"
          })
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/278764c44a9f62c3dccbb0d3eb23ba1bd9bee7e1/packages/extension-api/src/extension-api.d.ts#L1422",
        children: "packages/extension-api/src/extension-api.d.ts:1422"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "The cancellation token of this source."
    }), "\n", (0,jsx_runtime.jsx)(_components.h2, {
      id: "methods",
      children: "Methods"
    }), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "cancel",
      children: "cancel()"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.strong, {
          children: "cancel"
        }), "(): ", (0,jsx_runtime.jsx)(_components.code, {
          children: "void"
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/278764c44a9f62c3dccbb0d3eb23ba1bd9bee7e1/packages/extension-api/src/extension-api.d.ts#L1427",
        children: "packages/extension-api/src/extension-api.d.ts:1427"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Signal cancellation on the token."
    }), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "returns-1",
      children: "Returns"
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        children: "void"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "dispose",
      children: "dispose()"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.strong, {
          children: "dispose"
        }), "(): ", (0,jsx_runtime.jsx)(_components.code, {
          children: "void"
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/278764c44a9f62c3dccbb0d3eb23ba1bd9bee7e1/packages/extension-api/src/extension-api.d.ts#L1432",
        children: "packages/extension-api/src/extension-api.d.ts:1432"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Dispose object and free resources."
    }), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "returns-2",
      children: "Returns"
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        children: "void"
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