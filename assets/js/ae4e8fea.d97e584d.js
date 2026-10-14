"use strict";
(globalThis["webpackChunkdocs"] = globalThis["webpackChunkdocs"] || []).push([[94724],{

/***/ 772
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  assets: () => (/* binding */ assets),
  contentTitle: () => (/* binding */ contentTitle),
  "default": () => (/* binding */ MDXContent),
  frontMatter: () => (/* binding */ frontMatter),
  metadata: () => (/* reexport */ site_api_podman_desktop_namespaces_window_functions_create_status_bar_item_md_ae4_namespaceObject),
  toc: () => (/* binding */ toc)
});

;// ./.docusaurus/docusaurus-plugin-content-docs/api/site-api-podman-desktop-namespaces-window-functions-create-status-bar-item-md-ae4.json
const site_api_podman_desktop_namespaces_window_functions_create_status_bar_item_md_ae4_namespaceObject = /*#__PURE__*/JSON.parse('{"id":"@podman-desktop/namespaces/window/functions/createStatusBarItem","title":"Function: createStatusBarItem()","description":"createStatusBarItem(alignment?, priority?): StatusBarItem","source":"@site/api/@podman-desktop/namespaces/window/functions/createStatusBarItem.md","sourceDirName":"@podman-desktop/namespaces/window/functions","slug":"/@podman-desktop/namespaces/window/functions/createStatusBarItem","permalink":"/api/@podman-desktop/namespaces/window/functions/createStatusBarItem","draft":false,"unlisted":false,"tags":[],"version":"current","frontMatter":{},"sidebar":"typedocSidebar","previous":{"title":"createCustomPick","permalink":"/api/@podman-desktop/namespaces/window/functions/createCustomPick"},"next":{"title":"createWebviewPanel","permalink":"/api/@podman-desktop/namespaces/window/functions/createWebviewPanel"}}');
// EXTERNAL MODULE: ../node_modules/react/jsx-runtime.js
var jsx_runtime = __webpack_require__(62540);
// EXTERNAL MODULE: ../node_modules/@mdx-js/react/lib/index.js
var lib = __webpack_require__(43023);
;// ./api/@podman-desktop/namespaces/window/functions/createStatusBarItem.md


const frontMatter = {};
const contentTitle = 'Function: createStatusBarItem()';

const assets = {

};



const toc = [{
  "value": "Parameters",
  "id": "parameters",
  "level": 2
}, {
  "value": "alignment?",
  "id": "alignment",
  "level": 3
}, {
  "value": "priority?",
  "id": "priority",
  "level": 3
}, {
  "value": "Returns",
  "id": "returns",
  "level": 2
}, {
  "value": "Example",
  "id": "example",
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
    pre: "pre",
    strong: "strong",
    ...(0,lib/* useMDXComponents */.R)(),
    ...props.components
  };
  return (0,jsx_runtime.jsxs)(jsx_runtime.Fragment, {
    children: [(0,jsx_runtime.jsx)(_components.header, {
      children: (0,jsx_runtime.jsx)(_components.h1, {
        id: "function-createstatusbaritem",
        children: "Function: createStatusBarItem()"
      })
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.strong, {
          children: "createStatusBarItem"
        }), "(", (0,jsx_runtime.jsx)(_components.code, {
          children: "alignment?"
        }), ", ", (0,jsx_runtime.jsx)(_components.code, {
          children: "priority?"
        }), "): ", (0,jsx_runtime.jsx)(_components.a, {
          href: "/api/interfaces/StatusBarItem",
          children: (0,jsx_runtime.jsx)(_components.code, {
            children: "StatusBarItem"
          })
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/f8b21e19ee75a8e1d2fd5e6276100ef158e1a042/packages/extension-api/src/extension-api.d.ts#L2354",
        children: "packages/extension-api/src/extension-api.d.ts:2354"
      })]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Creates a status bar ", (0,jsx_runtime.jsx)(_components.a, {
        href: "/api/interfaces/StatusBarItem",
        children: "StatusBarItem"
      }), " item."]
    }), "\n", (0,jsx_runtime.jsx)(_components.h2, {
      id: "parameters",
      children: "Parameters"
    }), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "alignment",
      children: "alignment?"
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: (0,jsx_runtime.jsx)(_components.a, {
        href: "/api/type-aliases/StatusBarAlignment",
        children: (0,jsx_runtime.jsx)(_components.code, {
          children: "StatusBarAlignment"
        })
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "The alignment of the item."
    }), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "priority",
      children: "priority?"
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        children: "number"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "The priority of the item. Higher values mean more to the left or more to the right."
    }), "\n", (0,jsx_runtime.jsx)(_components.h2, {
      id: "returns",
      children: "Returns"
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: (0,jsx_runtime.jsx)(_components.a, {
        href: "/api/interfaces/StatusBarItem",
        children: (0,jsx_runtime.jsx)(_components.code, {
          children: "StatusBarItem"
        })
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "A new status bar item."
    }), "\n", (0,jsx_runtime.jsx)(_components.h2, {
      id: "example",
      children: "Example"
    }), "\n", (0,jsx_runtime.jsx)(_components.pre, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        className: "language-typescript",
        children: "import * as api from '@podman-desktop/api';\n\nexport async function activate(extensionContext: api.ExtensionContext): Promise<void> {\n  const statusBarItem = api.window.createStatusBarItem();\n  statusBarItem.text = 'Information';\n  statusBarItem.tooltip = 'A problem occurred';\n  statusBarItem.command = 'extension-name.my-command';\n  statusBarItem.iconClass = 'fa fa-exclamation-triangle';\n  extensionContext.subscriptions.push(\n    api.commands.registerCommand('extension-name.my-command', () => { console.log('command executed'); }),\n    statusBarItem,\n  );\n  statusBarItem.show();\n}\n"
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