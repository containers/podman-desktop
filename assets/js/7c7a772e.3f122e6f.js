"use strict";
(globalThis["webpackChunkdocs"] = globalThis["webpackChunkdocs"] || []).push([[38788],{

/***/ 78455
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  assets: () => (/* binding */ assets),
  contentTitle: () => (/* binding */ contentTitle),
  "default": () => (/* binding */ MDXContent),
  frontMatter: () => (/* binding */ frontMatter),
  metadata: () => (/* reexport */ site_api_interfaces_webview_panel_md_7c7_namespaceObject),
  toc: () => (/* binding */ toc)
});

;// ./.docusaurus/docusaurus-plugin-content-docs/api/site-api-interfaces-webview-panel-md-7c7.json
const site_api_interfaces_webview_panel_md_7c7_namespaceObject = /*#__PURE__*/JSON.parse('{"id":"interfaces/WebviewPanel","title":"Interface: WebviewPanel","description":"Defined in2073","source":"@site/api/interfaces/WebviewPanel.md","sourceDirName":"interfaces","slug":"/interfaces/WebviewPanel","permalink":"/api/interfaces/WebviewPanel","draft":false,"unlisted":false,"tags":[],"version":"current","frontMatter":{},"sidebar":"typedocSidebar","previous":{"title":"WebviewOptions","permalink":"/api/interfaces/WebviewOptions"},"next":{"title":"WebviewPanelOnDidChangeViewStateEvent","permalink":"/api/interfaces/WebviewPanelOnDidChangeViewStateEvent"}}');
// EXTERNAL MODULE: ../node_modules/react/jsx-runtime.js
var jsx_runtime = __webpack_require__(62540);
// EXTERNAL MODULE: ../node_modules/@mdx-js/react/lib/index.js
var lib = __webpack_require__(43023);
;// ./api/interfaces/WebviewPanel.md


const frontMatter = {};
const contentTitle = 'Interface: WebviewPanel';

const assets = {

};



const toc = [{
  "value": "Properties",
  "id": "properties",
  "level": 2
}, {
  "value": "active",
  "id": "active",
  "level": 3
}, {
  "value": "iconPath?",
  "id": "iconpath",
  "level": 3
}, {
  "value": "Union Members",
  "id": "union-members",
  "level": 4
}, {
  "value": "Type Literal",
  "id": "type-literal",
  "level": 5
}, {
  "value": "dark",
  "id": "dark",
  "level": 5
}, {
  "value": "light",
  "id": "light",
  "level": 5
}, {
  "value": "onDidChangeViewState",
  "id": "ondidchangeviewstate",
  "level": 3
}, {
  "value": "onDidDispose",
  "id": "ondiddispose",
  "level": 3
}, {
  "value": "title",
  "id": "title",
  "level": 3
}, {
  "value": "viewType",
  "id": "viewtype",
  "level": 3
}, {
  "value": "visible",
  "id": "visible",
  "level": 3
}, {
  "value": "webview",
  "id": "webview",
  "level": 3
}, {
  "value": "Methods",
  "id": "methods",
  "level": 2
}, {
  "value": "dispose()",
  "id": "dispose",
  "level": 3
}, {
  "value": "Returns",
  "id": "returns",
  "level": 4
}, {
  "value": "reveal()",
  "id": "reveal",
  "level": 3
}, {
  "value": "Parameters",
  "id": "parameters",
  "level": 4
}, {
  "value": "preserveFocus?",
  "id": "preservefocus",
  "level": 5
}, {
  "value": "Returns",
  "id": "returns-1",
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
    h5: "h5",
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
        id: "interface-webviewpanel",
        children: "Interface: WebviewPanel"
      })
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/278764c44a9f62c3dccbb0d3eb23ba1bd9bee7e1/packages/extension-api/src/extension-api.d.ts#L2073",
        children: "packages/extension-api/src/extension-api.d.ts:2073"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "A panel that contains a webview."
    }), "\n", (0,jsx_runtime.jsx)(_components.h2, {
      id: "properties",
      children: "Properties"
    }), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "active",
      children: "active"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "readonly"
        }), " ", (0,jsx_runtime.jsx)(_components.strong, {
          children: "active"
        }), ": ", (0,jsx_runtime.jsx)(_components.code, {
          children: "boolean"
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/278764c44a9f62c3dccbb0d3eb23ba1bd9bee7e1/packages/extension-api/src/extension-api.d.ts#L2108",
        children: "packages/extension-api/src/extension-api.d.ts:2108"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Whether the panel is active (focused by the user)."
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "iconpath",
      children: "iconPath?"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "optional"
        }), " ", (0,jsx_runtime.jsx)(_components.strong, {
          children: "iconPath?"
        }), ": ", (0,jsx_runtime.jsx)(_components.a, {
          href: "/api/classes/Uri",
          children: (0,jsx_runtime.jsx)(_components.code, {
            children: "Uri"
          })
        }), " | { ", (0,jsx_runtime.jsx)(_components.code, {
          children: "dark"
        }), ": ", (0,jsx_runtime.jsx)(_components.a, {
          href: "/api/classes/Uri",
          children: (0,jsx_runtime.jsx)(_components.code, {
            children: "Uri"
          })
        }), "; ", (0,jsx_runtime.jsx)(_components.code, {
          children: "light"
        }), ": ", (0,jsx_runtime.jsx)(_components.a, {
          href: "/api/classes/Uri",
          children: (0,jsx_runtime.jsx)(_components.code, {
            children: "Uri"
          })
        }), "; }"]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/278764c44a9f62c3dccbb0d3eb23ba1bd9bee7e1/packages/extension-api/src/extension-api.d.ts#L2087",
        children: "packages/extension-api/src/extension-api.d.ts:2087"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Icon for the panel shown in UI."
    }), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "union-members",
      children: "Union Members"
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: (0,jsx_runtime.jsx)(_components.a, {
        href: "/api/classes/Uri",
        children: (0,jsx_runtime.jsx)(_components.code, {
          children: "Uri"
        })
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h5, {
      id: "type-literal",
      children: "Type Literal"
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["{ ", (0,jsx_runtime.jsx)(_components.code, {
        children: "dark"
      }), ": ", (0,jsx_runtime.jsx)(_components.a, {
        href: "/api/classes/Uri",
        children: (0,jsx_runtime.jsx)(_components.code, {
          children: "Uri"
        })
      }), "; ", (0,jsx_runtime.jsx)(_components.code, {
        children: "light"
      }), ": ", (0,jsx_runtime.jsx)(_components.a, {
        href: "/api/classes/Uri",
        children: (0,jsx_runtime.jsx)(_components.code, {
          children: "Uri"
        })
      }), "; }"]
    }), "\n", (0,jsx_runtime.jsx)(_components.h5, {
      id: "dark",
      children: "dark"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "readonly"
        }), " ", (0,jsx_runtime.jsx)(_components.strong, {
          children: "dark"
        }), ": ", (0,jsx_runtime.jsx)(_components.a, {
          href: "/api/classes/Uri",
          children: (0,jsx_runtime.jsx)(_components.code, {
            children: "Uri"
          })
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "The icon path for the dark theme."
    }), "\n", (0,jsx_runtime.jsx)(_components.h5, {
      id: "light",
      children: "light"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "readonly"
        }), " ", (0,jsx_runtime.jsx)(_components.strong, {
          children: "light"
        }), ": ", (0,jsx_runtime.jsx)(_components.a, {
          href: "/api/classes/Uri",
          children: (0,jsx_runtime.jsx)(_components.code, {
            children: "Uri"
          })
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "The icon path for the light theme."
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "ondidchangeviewstate",
      children: "onDidChangeViewState"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "readonly"
        }), " ", (0,jsx_runtime.jsx)(_components.strong, {
          children: "onDidChangeViewState"
        }), ": ", (0,jsx_runtime.jsx)(_components.a, {
          href: "/api/interfaces/Event",
          children: (0,jsx_runtime.jsx)(_components.code, {
            children: "Event"
          })
        }), "<", (0,jsx_runtime.jsx)(_components.a, {
          href: "/api/interfaces/WebviewPanelOnDidChangeViewStateEvent",
          children: (0,jsx_runtime.jsx)(_components.code, {
            children: "WebviewPanelOnDidChangeViewStateEvent"
          })
        }), ">"]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/278764c44a9f62c3dccbb0d3eb23ba1bd9bee7e1/packages/extension-api/src/extension-api.d.ts#L2118",
        children: "packages/extension-api/src/extension-api.d.ts:2118"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Fired when the panel's view state changes."
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "ondiddispose",
      children: "onDidDispose"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "readonly"
        }), " ", (0,jsx_runtime.jsx)(_components.strong, {
          children: "onDidDispose"
        }), ": ", (0,jsx_runtime.jsx)(_components.a, {
          href: "/api/interfaces/Event",
          children: (0,jsx_runtime.jsx)(_components.code, {
            children: "Event"
          })
        }), "<", (0,jsx_runtime.jsx)(_components.code, {
          children: "void"
        }), ">"]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/278764c44a9f62c3dccbb0d3eb23ba1bd9bee7e1/packages/extension-api/src/extension-api.d.ts#L2128",
        children: "packages/extension-api/src/extension-api.d.ts:2128"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Fired when the panel is disposed."
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["This may be because the user closed the panel or because ", (0,jsx_runtime.jsx)(_components.code, {
        children: ".dispose()"
      }), " was\ncalled on it."]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Trying to use the panel after it has been disposed throws an exception."
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "title",
      children: "title"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.strong, {
          children: "title"
        }), ": ", (0,jsx_runtime.jsx)(_components.code, {
          children: "string"
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/278764c44a9f62c3dccbb0d3eb23ba1bd9bee7e1/packages/extension-api/src/extension-api.d.ts#L2082",
        children: "packages/extension-api/src/extension-api.d.ts:2082"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Title of the panel shown in UI."
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "viewtype",
      children: "viewType"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "readonly"
        }), " ", (0,jsx_runtime.jsx)(_components.strong, {
          children: "viewType"
        }), ": ", (0,jsx_runtime.jsx)(_components.code, {
          children: "string"
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/278764c44a9f62c3dccbb0d3eb23ba1bd9bee7e1/packages/extension-api/src/extension-api.d.ts#L2077",
        children: "packages/extension-api/src/extension-api.d.ts:2077"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Identifies the type of the webview panel."
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "visible",
      children: "visible"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "readonly"
        }), " ", (0,jsx_runtime.jsx)(_components.strong, {
          children: "visible"
        }), ": ", (0,jsx_runtime.jsx)(_components.code, {
          children: "boolean"
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/278764c44a9f62c3dccbb0d3eb23ba1bd9bee7e1/packages/extension-api/src/extension-api.d.ts#L2113",
        children: "packages/extension-api/src/extension-api.d.ts:2113"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Whether the panel is visible."
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "webview",
      children: "webview"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "readonly"
        }), " ", (0,jsx_runtime.jsx)(_components.strong, {
          children: "webview"
        }), ": ", (0,jsx_runtime.jsx)(_components.a, {
          href: "/api/interfaces/Webview",
          children: (0,jsx_runtime.jsx)(_components.code, {
            children: "Webview"
          })
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/278764c44a9f62c3dccbb0d3eb23ba1bd9bee7e1/packages/extension-api/src/extension-api.d.ts#L2103",
        children: "packages/extension-api/src/extension-api.d.ts:2103"
      })]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: [(0,jsx_runtime.jsx)(_components.a, {
        href: "/api/interfaces/Webview",
        children: (0,jsx_runtime.jsx)(_components.code, {
          children: "Webview"
        })
      }), " belonging to the panel."]
    }), "\n", (0,jsx_runtime.jsx)(_components.h2, {
      id: "methods",
      children: "Methods"
    }), "\n", (0,jsx_runtime.jsx)(_components.h3, {
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
        href: "https://github.com/podman-desktop/podman-desktop/blob/278764c44a9f62c3dccbb0d3eb23ba1bd9bee7e1/packages/extension-api/src/extension-api.d.ts#L2143",
        children: "packages/extension-api/src/extension-api.d.ts:2143"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Dispose of the webview panel."
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["This closes the panel if it showing and disposes of the resources owned by the webview.\nWebview panels are also disposed when the user closes the webview panel. Both cases\nfire the ", (0,jsx_runtime.jsx)(_components.code, {
        children: "onDispose"
      }), " event."]
    }), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "returns",
      children: "Returns"
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        children: "void"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "reveal",
      children: "reveal()"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.strong, {
          children: "reveal"
        }), "(", (0,jsx_runtime.jsx)(_components.code, {
          children: "preserveFocus?"
        }), "): ", (0,jsx_runtime.jsx)(_components.code, {
          children: "void"
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/278764c44a9f62c3dccbb0d3eb23ba1bd9bee7e1/packages/extension-api/src/extension-api.d.ts#L2134",
        children: "packages/extension-api/src/extension-api.d.ts:2134"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Show the webview panel."
    }), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "parameters",
      children: "Parameters"
    }), "\n", (0,jsx_runtime.jsx)(_components.h5, {
      id: "preservefocus",
      children: "preserveFocus?"
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        children: "boolean"
      })
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["When ", (0,jsx_runtime.jsx)(_components.code, {
        children: "true"
      }), ", the webview will not take focus."]
    }), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "returns-1",
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