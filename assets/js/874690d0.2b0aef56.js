"use strict";
(globalThis["webpackChunkdocs"] = globalThis["webpackChunkdocs"] || []).push([[88041],{

/***/ 17166
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  assets: () => (/* binding */ assets),
  contentTitle: () => (/* binding */ contentTitle),
  "default": () => (/* binding */ MDXContent),
  frontMatter: () => (/* binding */ frontMatter),
  metadata: () => (/* reexport */ site_api_interfaces_status_bar_item_md_874_namespaceObject),
  toc: () => (/* binding */ toc)
});

;// ./.docusaurus/docusaurus-plugin-content-docs/api/site-api-interfaces-status-bar-item-md-874.json
const site_api_interfaces_status_bar_item_md_874_namespaceObject = /*#__PURE__*/JSON.parse('{"id":"interfaces/StatusBarItem","title":"Interface: StatusBarItem","description":"Defined in1836","source":"@site/api/interfaces/StatusBarItem.md","sourceDirName":"interfaces","slug":"/interfaces/StatusBarItem","permalink":"/api/interfaces/StatusBarItem","draft":false,"unlisted":false,"tags":[],"version":"current","frontMatter":{},"sidebar":"typedocSidebar","previous":{"title":"SecretStorageChangeEvent","permalink":"/api/interfaces/SecretStorageChangeEvent"},"next":{"title":"StorageStats","permalink":"/api/interfaces/StorageStats"}}');
// EXTERNAL MODULE: ../node_modules/react/jsx-runtime.js
var jsx_runtime = __webpack_require__(62540);
// EXTERNAL MODULE: ../node_modules/@mdx-js/react/lib/index.js
var lib = __webpack_require__(43023);
;// ./api/interfaces/StatusBarItem.md


const frontMatter = {};
const contentTitle = 'Interface: StatusBarItem';

const assets = {

};



const toc = [{
  "value": "Properties",
  "id": "properties",
  "level": 2
}, {
  "value": "alignment",
  "id": "alignment",
  "level": 3
}, {
  "value": "command?",
  "id": "command",
  "level": 3
}, {
  "value": "commandArgs?",
  "id": "commandargs",
  "level": 3
}, {
  "value": "enabled",
  "id": "enabled",
  "level": 3
}, {
  "value": "iconClass?",
  "id": "iconclass",
  "level": 3
}, {
  "value": "priority",
  "id": "priority",
  "level": 3
}, {
  "value": "text?",
  "id": "text",
  "level": 3
}, {
  "value": "tooltip?",
  "id": "tooltip",
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
        id: "interface-statusbaritem",
        children: "Interface: StatusBarItem"
      })
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/3ac8e0951023982b58c717ba869e7f7374702e83/packages/extension-api/src/extension-api.d.ts#L1836",
        children: "packages/extension-api/src/extension-api.d.ts:1836"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "A status bar item is a status bar contribution that can\nshow text and icons and run a command on click."
    }), "\n", (0,jsx_runtime.jsx)(_components.h2, {
      id: "properties",
      children: "Properties"
    }), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "alignment",
      children: "alignment"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "readonly"
        }), " ", (0,jsx_runtime.jsx)(_components.strong, {
          children: "alignment"
        }), ": ", (0,jsx_runtime.jsx)(_components.a, {
          href: "/api/type-aliases/StatusBarAlignment",
          children: (0,jsx_runtime.jsx)(_components.code, {
            children: "StatusBarAlignment"
          })
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/3ac8e0951023982b58c717ba869e7f7374702e83/packages/extension-api/src/extension-api.d.ts#L1840",
        children: "packages/extension-api/src/extension-api.d.ts:1840"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "The alignment of this item."
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "command",
      children: "command?"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "optional"
        }), " ", (0,jsx_runtime.jsx)(_components.strong, {
          children: "command?"
        }), ": ", (0,jsx_runtime.jsx)(_components.code, {
          children: "string"
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/3ac8e0951023982b58c717ba869e7f7374702e83/packages/extension-api/src/extension-api.d.ts#L1868",
        children: "packages/extension-api/src/extension-api.d.ts:1868"
      })]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["The identifier of a command, previously registered with ", (0,jsx_runtime.jsx)(_components.a, {
        href: "/api/@podman-desktop/namespaces/commands/functions/registerCommand",
        children: "commands.registerCommand"
      }), ", to run on click."]
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "commandargs",
      children: "commandArgs?"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "optional"
        }), " ", (0,jsx_runtime.jsx)(_components.strong, {
          children: "commandArgs?"
        }), ": ", (0,jsx_runtime.jsx)(_components.code, {
          children: "any"
        }), "[]"]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/3ac8e0951023982b58c717ba869e7f7374702e83/packages/extension-api/src/extension-api.d.ts#L1873",
        children: "packages/extension-api/src/extension-api.d.ts:1873"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Arguments that the command handler should be invoked with."
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "enabled",
      children: "enabled"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.strong, {
          children: "enabled"
        }), ": ", (0,jsx_runtime.jsx)(_components.code, {
          children: "boolean"
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/3ac8e0951023982b58c717ba869e7f7374702e83/packages/extension-api/src/extension-api.d.ts#L1864",
        children: "packages/extension-api/src/extension-api.d.ts:1864"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Marks an item as disabled. When property is set to true, then icon will be changed to inactive\nand there won't be possible to execute a command if it is provided in the following configuration."
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "iconclass",
      children: "iconClass?"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "optional"
        }), " ", (0,jsx_runtime.jsx)(_components.strong, {
          children: "iconClass?"
        }), ": ", (0,jsx_runtime.jsx)(_components.code, {
          children: "string"
        }), " | { ", (0,jsx_runtime.jsx)(_components.code, {
          children: "active"
        }), ": ", (0,jsx_runtime.jsx)(_components.code, {
          children: "string"
        }), "; ", (0,jsx_runtime.jsx)(_components.code, {
          children: "inactive"
        }), ": ", (0,jsx_runtime.jsx)(_components.code, {
          children: "string"
        }), "; }"]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/3ac8e0951023982b58c717ba869e7f7374702e83/packages/extension-api/src/extension-api.d.ts#L1859",
        children: "packages/extension-api/src/extension-api.d.ts:1859"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Icon class that is used to display the particular icon from the Font Awesome icon set.\nIcon class should be in format e.g. 'fa fa-toggle-on'. It is possible to provide an icons\nfor state which can be enabled or disabled."
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "priority",
      children: "priority"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "readonly"
        }), " ", (0,jsx_runtime.jsx)(_components.strong, {
          children: "priority"
        }), ": ", (0,jsx_runtime.jsx)(_components.code, {
          children: "number"
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/3ac8e0951023982b58c717ba869e7f7374702e83/packages/extension-api/src/extension-api.d.ts#L1845",
        children: "packages/extension-api/src/extension-api.d.ts:1845"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "The priority of this item. Higher value means the item should be shown more to the left\nor more to the right."
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "text",
      children: "text?"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "optional"
        }), " ", (0,jsx_runtime.jsx)(_components.strong, {
          children: "text?"
        }), ": ", (0,jsx_runtime.jsx)(_components.code, {
          children: "string"
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/3ac8e0951023982b58c717ba869e7f7374702e83/packages/extension-api/src/extension-api.d.ts#L1849",
        children: "packages/extension-api/src/extension-api.d.ts:1849"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "The text to show for the entry."
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "tooltip",
      children: "tooltip?"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "optional"
        }), " ", (0,jsx_runtime.jsx)(_components.strong, {
          children: "tooltip?"
        }), ": ", (0,jsx_runtime.jsx)(_components.code, {
          children: "string"
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/3ac8e0951023982b58c717ba869e7f7374702e83/packages/extension-api/src/extension-api.d.ts#L1853",
        children: "packages/extension-api/src/extension-api.d.ts:1853"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "The tooltip text when you hover over this entry."
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
        href: "https://github.com/podman-desktop/podman-desktop/blob/3ac8e0951023982b58c717ba869e7f7374702e83/packages/extension-api/src/extension-api.d.ts#L1887",
        children: "packages/extension-api/src/extension-api.d.ts:1887"
      })]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Dispose and free associated resources. Call\n", (0,jsx_runtime.jsx)(_components.a, {
        href: "#hide",
        children: "StatusBarItem.hide"
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
        href: "https://github.com/podman-desktop/podman-desktop/blob/3ac8e0951023982b58c717ba869e7f7374702e83/packages/extension-api/src/extension-api.d.ts#L1881",
        children: "packages/extension-api/src/extension-api.d.ts:1881"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Hides the entry in the status bar."
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
        href: "https://github.com/podman-desktop/podman-desktop/blob/3ac8e0951023982b58c717ba869e7f7374702e83/packages/extension-api/src/extension-api.d.ts#L1877",
        children: "packages/extension-api/src/extension-api.d.ts:1877"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Shows the entry in the status bar."
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