"use strict";
(globalThis["webpackChunkdocs"] = globalThis["webpackChunkdocs"] || []).push([[76228],{

/***/ 58886
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  assets: () => (/* binding */ assets),
  contentTitle: () => (/* binding */ contentTitle),
  "default": () => (/* binding */ MDXContent),
  frontMatter: () => (/* binding */ frontMatter),
  metadata: () => (/* reexport */ site_api_interfaces_quick_pick_item_md_43b_namespaceObject),
  toc: () => (/* binding */ toc)
});

;// ./.docusaurus/docusaurus-plugin-content-docs/api/site-api-interfaces-quick-pick-item-md-43b.json
const site_api_interfaces_quick_pick_item_md_43b_namespaceObject = /*#__PURE__*/JSON.parse('{"id":"interfaces/QuickPickItem","title":"Interface: QuickPickItem","description":"Defined in1608","source":"@site/api/interfaces/QuickPickItem.md","sourceDirName":"interfaces","slug":"/interfaces/QuickPickItem","permalink":"/api/interfaces/QuickPickItem","draft":false,"unlisted":false,"tags":[],"version":"current","frontMatter":{},"sidebar":"typedocSidebar","previous":{"title":"QuickInputButton","permalink":"/api/interfaces/QuickInputButton"},"next":{"title":"QuickPickOptions","permalink":"/api/interfaces/QuickPickOptions"}}');
// EXTERNAL MODULE: ../node_modules/react/jsx-runtime.js
var jsx_runtime = __webpack_require__(62540);
// EXTERNAL MODULE: ../node_modules/@mdx-js/react/lib/index.js
var lib = __webpack_require__(43023);
;// ./api/interfaces/QuickPickItem.md


const frontMatter = {};
const contentTitle = 'Interface: QuickPickItem';

const assets = {

};



const toc = [{
  "value": "Properties",
  "id": "properties",
  "level": 2
}, {
  "value": "alwaysShow?",
  "id": "alwaysshow",
  "level": 3
}, {
  "value": "buttons?",
  "id": "buttons",
  "level": 3
}, {
  "value": "description?",
  "id": "description",
  "level": 3
}, {
  "value": "detail?",
  "id": "detail",
  "level": 3
}, {
  "value": "kind?",
  "id": "kind",
  "level": 3
}, {
  "value": "label",
  "id": "label",
  "level": 3
}, {
  "value": "picked?",
  "id": "picked",
  "level": 3
}, {
  "value": "See",
  "id": "see",
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
        id: "interface-quickpickitem",
        children: "Interface: QuickPickItem"
      })
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/e7cf46b1cce9d95c73effcba926d40af1243e1d7/packages/extension-api/src/extension-api.d.ts#L1608",
        children: "packages/extension-api/src/extension-api.d.ts:1608"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Represents an item that can be selected from\na list of items."
    }), "\n", (0,jsx_runtime.jsx)(_components.h2, {
      id: "properties",
      children: "Properties"
    }), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "alwaysshow",
      children: "alwaysShow?"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "optional"
        }), " ", (0,jsx_runtime.jsx)(_components.strong, {
          children: "alwaysShow?"
        }), ": ", (0,jsx_runtime.jsx)(_components.code, {
          children: "boolean"
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/e7cf46b1cce9d95c73effcba926d40af1243e1d7/packages/extension-api/src/extension-api.d.ts#L1655",
        children: "packages/extension-api/src/extension-api.d.ts:1655"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Always show this item."
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Note: this property is ignored when ", (0,jsx_runtime.jsx)(_components.a, {
        href: "#kind",
        children: "kind"
      }), " is set to ", (0,jsx_runtime.jsx)(_components.a, {
        href: "/api/enumerations/QuickPickItemKind#separator",
        children: "QuickPickItemKind.Separator"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "buttons",
      children: "buttons?"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "optional"
        }), " ", (0,jsx_runtime.jsx)(_components.strong, {
          children: "buttons?"
        }), ": readonly ", (0,jsx_runtime.jsx)(_components.a, {
          href: "/api/interfaces/QuickInputButton",
          children: (0,jsx_runtime.jsx)(_components.code, {
            children: "QuickInputButton"
          })
        }), "[]"]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/e7cf46b1cce9d95c73effcba926d40af1243e1d7/packages/extension-api/src/extension-api.d.ts#L1665",
        children: "packages/extension-api/src/extension-api.d.ts:1665"
      })]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Optional buttons that will be rendered on this particular item. These buttons will trigger\nan QuickPickItemButtonEvent when clicked. Buttons are only rendered when using a quickpick\ncreated by the window.createQuickPick createQuickPick() API. Buttons are not rendered when using\nthe ", (0,jsx_runtime.jsx)(_components.a, {
        href: "/api/@podman-desktop/namespaces/window/functions/showQuickPick",
        children: "showQuickPick()"
      }), " API."]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Note: this property is ignored when ", (0,jsx_runtime.jsx)(_components.a, {
        href: "#kind",
        children: "kind"
      }), " is set to ", (0,jsx_runtime.jsx)(_components.a, {
        href: "/api/enumerations/QuickPickItemKind#separator",
        children: "QuickPickItemKind.Separator"
      })]
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
        href: "https://github.com/podman-desktop/podman-desktop/blob/e7cf46b1cce9d95c73effcba926d40af1243e1d7/packages/extension-api/src/extension-api.d.ts#L1627",
        children: "packages/extension-api/src/extension-api.d.ts:1627"
      })]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["A human-readable string which is rendered less prominent in the same line. Supports rendering of\nThemeIcon theme icons via the ", (0,jsx_runtime.jsx)(_components.code, {
        children: "$(<name>)"
      }), "-syntax."]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Note: this property is ignored when ", (0,jsx_runtime.jsx)(_components.a, {
        href: "#kind",
        children: "kind"
      }), " is set to ", (0,jsx_runtime.jsx)(_components.a, {
        href: "/api/enumerations/QuickPickItemKind#separator",
        children: "QuickPickItemKind.Separator"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "detail",
      children: "detail?"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "optional"
        }), " ", (0,jsx_runtime.jsx)(_components.strong, {
          children: "detail?"
        }), ": ", (0,jsx_runtime.jsx)(_components.code, {
          children: "string"
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/e7cf46b1cce9d95c73effcba926d40af1243e1d7/packages/extension-api/src/extension-api.d.ts#L1635",
        children: "packages/extension-api/src/extension-api.d.ts:1635"
      })]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["A human-readable string which is rendered less prominent in a separate line. Supports rendering of\nThemeIcon theme icons via the ", (0,jsx_runtime.jsx)(_components.code, {
        children: "$(<name>)"
      }), "-syntax."]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Note: this property is ignored when ", (0,jsx_runtime.jsx)(_components.a, {
        href: "#kind",
        children: "kind"
      }), " is set to ", (0,jsx_runtime.jsx)(_components.a, {
        href: "/api/enumerations/QuickPickItemKind#separator",
        children: "QuickPickItemKind.Separator"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "kind",
      children: "kind?"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "optional"
        }), " ", (0,jsx_runtime.jsx)(_components.strong, {
          children: "kind?"
        }), ": ", (0,jsx_runtime.jsx)(_components.a, {
          href: "/api/enumerations/QuickPickItemKind",
          children: (0,jsx_runtime.jsx)(_components.code, {
            children: "QuickPickItemKind"
          })
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/e7cf46b1cce9d95c73effcba926d40af1243e1d7/packages/extension-api/src/extension-api.d.ts#L1619",
        children: "packages/extension-api/src/extension-api.d.ts:1619"
      })]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["The kind of QuickPickItem that will determine how this item is rendered in the quick pick. When not specified,\nthe default is ", (0,jsx_runtime.jsx)(_components.a, {
        href: "/api/enumerations/QuickPickItemKind#default",
        children: "QuickPickItemKind.Default"
      }), "."]
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "label",
      children: "label"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.strong, {
          children: "label"
        }), ": ", (0,jsx_runtime.jsx)(_components.code, {
          children: "string"
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/e7cf46b1cce9d95c73effcba926d40af1243e1d7/packages/extension-api/src/extension-api.d.ts#L1613",
        children: "packages/extension-api/src/extension-api.d.ts:1613"
      })]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["A human-readable string which is rendered prominent. Supports rendering of ThemeIcon theme icons via\nthe ", (0,jsx_runtime.jsx)(_components.code, {
        children: "$(<name>)"
      }), "-syntax."]
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "picked",
      children: "picked?"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "optional"
        }), " ", (0,jsx_runtime.jsx)(_components.strong, {
          children: "picked?"
        }), ": ", (0,jsx_runtime.jsx)(_components.code, {
          children: "boolean"
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/e7cf46b1cce9d95c73effcba926d40af1243e1d7/packages/extension-api/src/extension-api.d.ts#L1648",
        children: "packages/extension-api/src/extension-api.d.ts:1648"
      })]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Optional flag indicating if this item is picked initially. This is only honored when using\nthe ", (0,jsx_runtime.jsx)(_components.a, {
        href: "/api/@podman-desktop/namespaces/window/functions/showQuickPick",
        children: "showQuickPick()"
      }), " API. To do the same thing with\nthe window.createQuickPick createQuickPick() API, simply set the QuickPick.selectedItems\nto the items you want picked initially.\n(", (0,jsx_runtime.jsx)(_components.em, {
        children: "Note:"
      }), " This is only honored when the picker allows multiple selections.)"]
    }), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "see",
      children: "See"
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: (0,jsx_runtime.jsx)(_components.a, {
        href: "/api/interfaces/QuickPickOptions#canpickmany",
        children: "QuickPickOptions.canPickMany"
      })
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Note: this property is ignored when ", (0,jsx_runtime.jsx)(_components.a, {
        href: "#kind",
        children: "kind"
      }), " is set to ", (0,jsx_runtime.jsx)(_components.a, {
        href: "/api/enumerations/QuickPickItemKind#separator",
        children: "QuickPickItemKind.Separator"
      })]
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