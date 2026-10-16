"use strict";
(globalThis["webpackChunkdocs"] = globalThis["webpackChunkdocs"] || []).push([[22051],{

/***/ 29668
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  assets: () => (/* binding */ assets),
  contentTitle: () => (/* binding */ contentTitle),
  "default": () => (/* binding */ MDXContent),
  frontMatter: () => (/* binding */ frontMatter),
  metadata: () => (/* reexport */ site_api_interfaces_custom_pick_md_adf_namespaceObject),
  toc: () => (/* binding */ toc)
});

;// ./.docusaurus/docusaurus-plugin-content-docs/api/site-api-interfaces-custom-pick-md-adf.json
const site_api_interfaces_custom_pick_md_adf_namespaceObject = /*#__PURE__*/JSON.parse('{"id":"interfaces/CustomPick","title":"Interface: CustomPick\\\\<T\\\\>","description":"Defined in1720","source":"@site/api/interfaces/CustomPick.md","sourceDirName":"interfaces","slug":"/interfaces/CustomPick","permalink":"/api/interfaces/CustomPick","draft":false,"unlisted":false,"tags":[],"version":"current","frontMatter":{},"sidebar":"typedocSidebar","previous":{"title":"CPUUsage","permalink":"/api/interfaces/CPUUsage"},"next":{"title":"CustomPickItem","permalink":"/api/interfaces/CustomPickItem"}}');
// EXTERNAL MODULE: ../node_modules/react/jsx-runtime.js
var jsx_runtime = __webpack_require__(62540);
// EXTERNAL MODULE: ../node_modules/@mdx-js/react/lib/index.js
var lib = __webpack_require__(43023);
;// ./api/interfaces/CustomPick.md


const frontMatter = {};
const contentTitle = 'Interface: CustomPick<T>';

const assets = {

};



const toc = [{
  "value": "Type Parameters",
  "id": "type-parameters",
  "level": 2
}, {
  "value": "T",
  "id": "t",
  "level": 3
}, {
  "value": "Properties",
  "id": "properties",
  "level": 2
}, {
  "value": "canSelectMany",
  "id": "canselectmany",
  "level": 3
}, {
  "value": "description?",
  "id": "description",
  "level": 3
}, {
  "value": "hideItemSections",
  "id": "hideitemsections",
  "level": 3
}, {
  "value": "icon?",
  "id": "icon",
  "level": 3
}, {
  "value": "items",
  "id": "items",
  "level": 3
}, {
  "value": "minHeight?",
  "id": "minheight",
  "level": 3
}, {
  "value": "onDidConfirmSelection",
  "id": "ondidconfirmselection",
  "level": 3
}, {
  "value": "onDidHide",
  "id": "ondidhide",
  "level": 3
}, {
  "value": "title?",
  "id": "title",
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
  "value": "hide()",
  "id": "hide",
  "level": 3
}, {
  "value": "Returns",
  "id": "returns-1",
  "level": 4
}, {
  "value": "show()",
  "id": "show",
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
    em: "em",
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
        id: "interface-custompickt",
        children: "Interface: CustomPick<T>"
      })
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/e815a7ddef53911b2d9e53654b731d219f39dbe1/packages/extension-api/src/extension-api.d.ts#L1720",
        children: "packages/extension-api/src/extension-api.d.ts:1720"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "A concrete CustomPick to let the user pick an item from a list of items of type T.\nThe items are rendered using a custom UI."
    }), "\n", (0,jsx_runtime.jsx)(_components.h2, {
      id: "type-parameters",
      children: "Type Parameters"
    }), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "t",
      children: "T"
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: [(0,jsx_runtime.jsx)(_components.code, {
        children: "T"
      }), " ", (0,jsx_runtime.jsx)(_components.em, {
        children: "extends"
      }), " ", (0,jsx_runtime.jsx)(_components.a, {
        href: "/api/interfaces/CustomPickItem",
        children: (0,jsx_runtime.jsx)(_components.code, {
          children: "CustomPickItem"
        })
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.h2, {
      id: "properties",
      children: "Properties"
    }), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "canselectmany",
      children: "canSelectMany"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.strong, {
          children: "canSelectMany"
        }), ": ", (0,jsx_runtime.jsx)(_components.code, {
          children: "boolean"
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/e815a7ddef53911b2d9e53654b731d219f39dbe1/packages/extension-api/src/extension-api.d.ts#L1740",
        children: "packages/extension-api/src/extension-api.d.ts:1740"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "If multiple items can be selected at the same time. Defaults to false."
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "description",
      children: "description?"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "optional"
        }), " ", (0,jsx_runtime.jsx)(_components.strong, {
          children: "description?"
        }), ": ", (0,jsx_runtime.jsx)(_components.code, {
          children: "string"
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/e815a7ddef53911b2d9e53654b731d219f39dbe1/packages/extension-api/src/extension-api.d.ts#L1728",
        children: "packages/extension-api/src/extension-api.d.ts:1728"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "An optional human-readable string which is rendered less prominent in a separate line."
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "hideitemsections",
      children: "hideItemSections"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.strong, {
          children: "hideItemSections"
        }), ": ", (0,jsx_runtime.jsx)(_components.code, {
          children: "boolean"
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/e815a7ddef53911b2d9e53654b731d219f39dbe1/packages/extension-api/src/extension-api.d.ts#L1746",
        children: "packages/extension-api/src/extension-api.d.ts:1746"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "If the additional sections of an item should be hidden by default when the dialog opens up.\nThe user can still open them by clicking on the 'show more' button.\nDefaults to false."
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "icon",
      children: "icon?"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "optional"
        }), " ", (0,jsx_runtime.jsx)(_components.strong, {
          children: "icon?"
        }), ": ", (0,jsx_runtime.jsx)(_components.code, {
          children: "string"
        }), " | { ", (0,jsx_runtime.jsx)(_components.code, {
          children: "dark"
        }), ": ", (0,jsx_runtime.jsx)(_components.code, {
          children: "string"
        }), "; ", (0,jsx_runtime.jsx)(_components.code, {
          children: "light"
        }), ": ", (0,jsx_runtime.jsx)(_components.code, {
          children: "string"
        }), "; }"]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/e815a7ddef53911b2d9e53654b731d219f39dbe1/packages/extension-api/src/extension-api.d.ts#L1732",
        children: "packages/extension-api/src/extension-api.d.ts:1732"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "An optional base64 PNG image"
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "items",
      children: "items"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.strong, {
          children: "items"
        }), ": ", (0,jsx_runtime.jsx)(_components.code, {
          children: "T"
        }), "[]"]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/e815a7ddef53911b2d9e53654b731d219f39dbe1/packages/extension-api/src/extension-api.d.ts#L1736",
        children: "packages/extension-api/src/extension-api.d.ts:1736"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Items to pick from. This can be read and updated by the extension."
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "minheight",
      children: "minHeight?"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "optional"
        }), " ", (0,jsx_runtime.jsx)(_components.strong, {
          children: "minHeight?"
        }), ": ", (0,jsx_runtime.jsx)(_components.code, {
          children: "string"
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/e815a7ddef53911b2d9e53654b731d219f39dbe1/packages/extension-api/src/extension-api.d.ts#L1752",
        children: "packages/extension-api/src/extension-api.d.ts:1752"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "When a custompick is closed (the sections are hidden) it is possible to set a minimum height so to force different items to have the same height.\nIt must be set using pixels or percentage (e.g 100px or 50%)\nUse it carefully as it could break the layout."
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "ondidconfirmselection",
      children: "onDidConfirmSelection"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "readonly"
        }), " ", (0,jsx_runtime.jsx)(_components.strong, {
          children: "onDidConfirmSelection"
        }), ": ", (0,jsx_runtime.jsx)(_components.a, {
          href: "/api/interfaces/Event",
          children: (0,jsx_runtime.jsx)(_components.code, {
            children: "Event"
          })
        }), "<", (0,jsx_runtime.jsx)(_components.code, {
          children: "number"
        }), "[]>"]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/e815a7ddef53911b2d9e53654b731d219f39dbe1/packages/extension-api/src/extension-api.d.ts#L1756",
        children: "packages/extension-api/src/extension-api.d.ts:1756"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "An event signaling when the user indicated confirmation of the selected item(s) index(es)."
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "ondidhide",
      children: "onDidHide"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "readonly"
        }), " ", (0,jsx_runtime.jsx)(_components.strong, {
          children: "onDidHide"
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
        href: "https://github.com/podman-desktop/podman-desktop/blob/e815a7ddef53911b2d9e53654b731d219f39dbe1/packages/extension-api/src/extension-api.d.ts#L1760",
        children: "packages/extension-api/src/extension-api.d.ts:1760"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "An event signaling when this input UI is hidden."
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "title",
      children: "title?"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "optional"
        }), " ", (0,jsx_runtime.jsx)(_components.strong, {
          children: "title?"
        }), ": ", (0,jsx_runtime.jsx)(_components.code, {
          children: "string"
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/e815a7ddef53911b2d9e53654b731d219f39dbe1/packages/extension-api/src/extension-api.d.ts#L1724",
        children: "packages/extension-api/src/extension-api.d.ts:1724"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "An optional human-readable string which is rendered prominent."
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
        href: "https://github.com/podman-desktop/podman-desktop/blob/e815a7ddef53911b2d9e53654b731d219f39dbe1/packages/extension-api/src/extension-api.d.ts#L1774",
        children: "packages/extension-api/src/extension-api.d.ts:1774"
      })]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Dispose and free associated resources. Call\n", (0,jsx_runtime.jsx)(_components.a, {
        href: "#hide",
        children: "CustomPick.hide"
      }), "."]
    }), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "returns",
      children: "Returns"
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        children: "void"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "hide",
      children: "hide()"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.strong, {
          children: "hide"
        }), "(): ", (0,jsx_runtime.jsx)(_components.code, {
          children: "void"
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/e815a7ddef53911b2d9e53654b731d219f39dbe1/packages/extension-api/src/extension-api.d.ts#L1768",
        children: "packages/extension-api/src/extension-api.d.ts:1768"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Hides the custom pick."
    }), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "returns-1",
      children: "Returns"
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        children: "void"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "show",
      children: "show()"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.strong, {
          children: "show"
        }), "(): ", (0,jsx_runtime.jsx)(_components.code, {
          children: "void"
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/e815a7ddef53911b2d9e53654b731d219f39dbe1/packages/extension-api/src/extension-api.d.ts#L1764",
        children: "packages/extension-api/src/extension-api.d.ts:1764"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Shows the custom pick."
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