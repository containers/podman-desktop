"use strict";
(globalThis["webpackChunkdocs"] = globalThis["webpackChunkdocs"] || []).push([[94054],{

/***/ 76819
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  assets: () => (/* binding */ assets),
  contentTitle: () => (/* binding */ contentTitle),
  "default": () => (/* binding */ MDXContent),
  frontMatter: () => (/* binding */ frontMatter),
  metadata: () => (/* reexport */ site_api_interfaces_quick_pick_options_md_6e3_namespaceObject),
  toc: () => (/* binding */ toc)
});

;// ./.docusaurus/docusaurus-plugin-content-docs/api/site-api-interfaces-quick-pick-options-md-6e3.json
const site_api_interfaces_quick_pick_options_md_6e3_namespaceObject = /*#__PURE__*/JSON.parse('{"id":"interfaces/QuickPickOptions","title":"Interface: QuickPickOptions","description":"Defined in1565","source":"@site/api/interfaces/QuickPickOptions.md","sourceDirName":"interfaces","slug":"/interfaces/QuickPickOptions","permalink":"/api/interfaces/QuickPickOptions","draft":false,"unlisted":false,"tags":[],"version":"current","frontMatter":{},"sidebar":"typedocSidebar","previous":{"title":"QuickPickItem","permalink":"/api/interfaces/QuickPickItem"},"next":{"title":"RegisterContainerConnectionEvent","permalink":"/api/interfaces/RegisterContainerConnectionEvent"}}');
// EXTERNAL MODULE: ../node_modules/react/jsx-runtime.js
var jsx_runtime = __webpack_require__(62540);
// EXTERNAL MODULE: ../node_modules/@mdx-js/react/lib/index.js
var lib = __webpack_require__(43023);
;// ./api/interfaces/QuickPickOptions.md


const frontMatter = {};
const contentTitle = 'Interface: QuickPickOptions';

const assets = {

};



const toc = [{
  "value": "Properties",
  "id": "properties",
  "level": 2
}, {
  "value": "canPickMany?",
  "id": "canpickmany",
  "level": 3
}, {
  "value": "ignoreFocusOut?",
  "id": "ignorefocusout",
  "level": 3
}, {
  "value": "matchOnDescription?",
  "id": "matchondescription",
  "level": 3
}, {
  "value": "matchOnDetail?",
  "id": "matchondetail",
  "level": 3
}, {
  "value": "placeHolder?",
  "id": "placeholder",
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
  "value": "onDidSelectItem()?",
  "id": "ondidselectitem",
  "level": 3
}, {
  "value": "Parameters",
  "id": "parameters",
  "level": 4
}, {
  "value": "item",
  "id": "item",
  "level": 5
}, {
  "value": "Returns",
  "id": "returns",
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
        id: "interface-quickpickoptions",
        children: "Interface: QuickPickOptions"
      })
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/11b3dada6a91c7d34c20f0c83ff25becdbcbd003/packages/extension-api/src/extension-api.d.ts#L1565",
        children: "packages/extension-api/src/extension-api.d.ts:1565"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Options to configure the behavior of the quick pick UI."
    }), "\n", (0,jsx_runtime.jsx)(_components.h2, {
      id: "properties",
      children: "Properties"
    }), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "canpickmany",
      children: "canPickMany?"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "optional"
        }), " ", (0,jsx_runtime.jsx)(_components.strong, {
          children: "canPickMany?"
        }), ": ", (0,jsx_runtime.jsx)(_components.code, {
          children: "boolean"
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/11b3dada6a91c7d34c20f0c83ff25becdbcbd003/packages/extension-api/src/extension-api.d.ts#L1595",
        children: "packages/extension-api/src/extension-api.d.ts:1595"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "An optional flag to make the picker accept multiple selections, if true the result is an array of picks."
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "ignorefocusout",
      children: "ignoreFocusOut?"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "optional"
        }), " ", (0,jsx_runtime.jsx)(_components.strong, {
          children: "ignoreFocusOut?"
        }), ": ", (0,jsx_runtime.jsx)(_components.code, {
          children: "boolean"
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/11b3dada6a91c7d34c20f0c83ff25becdbcbd003/packages/extension-api/src/extension-api.d.ts#L1590",
        children: "packages/extension-api/src/extension-api.d.ts:1590"
      })]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Set to ", (0,jsx_runtime.jsx)(_components.code, {
        children: "true"
      }), " to keep the picker open when focus moves to another part of the editor or to another window.\nThis setting is ignored on iPad and is always false."]
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "matchondescription",
      children: "matchOnDescription?"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "optional"
        }), " ", (0,jsx_runtime.jsx)(_components.strong, {
          children: "matchOnDescription?"
        }), ": ", (0,jsx_runtime.jsx)(_components.code, {
          children: "boolean"
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/11b3dada6a91c7d34c20f0c83ff25becdbcbd003/packages/extension-api/src/extension-api.d.ts#L1574",
        children: "packages/extension-api/src/extension-api.d.ts:1574"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "An optional flag to include the description when filtering the picks."
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "matchondetail",
      children: "matchOnDetail?"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "optional"
        }), " ", (0,jsx_runtime.jsx)(_components.strong, {
          children: "matchOnDetail?"
        }), ": ", (0,jsx_runtime.jsx)(_components.code, {
          children: "boolean"
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/11b3dada6a91c7d34c20f0c83ff25becdbcbd003/packages/extension-api/src/extension-api.d.ts#L1579",
        children: "packages/extension-api/src/extension-api.d.ts:1579"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "An optional flag to include the detail when filtering the picks."
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "placeholder",
      children: "placeHolder?"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "optional"
        }), " ", (0,jsx_runtime.jsx)(_components.strong, {
          children: "placeHolder?"
        }), ": ", (0,jsx_runtime.jsx)(_components.code, {
          children: "string"
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/11b3dada6a91c7d34c20f0c83ff25becdbcbd003/packages/extension-api/src/extension-api.d.ts#L1584",
        children: "packages/extension-api/src/extension-api.d.ts:1584"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "An optional string to show as placeholder in the input box to guide the user what to pick on."
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
        href: "https://github.com/podman-desktop/podman-desktop/blob/11b3dada6a91c7d34c20f0c83ff25becdbcbd003/packages/extension-api/src/extension-api.d.ts#L1569",
        children: "packages/extension-api/src/extension-api.d.ts:1569"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "An optional string that represents the title of the quick pick."
    }), "\n", (0,jsx_runtime.jsx)(_components.h2, {
      id: "methods",
      children: "Methods"
    }), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "ondidselectitem",
      children: "onDidSelectItem()?"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "optional"
        }), " ", (0,jsx_runtime.jsx)(_components.strong, {
          children: "onDidSelectItem"
        }), "(", (0,jsx_runtime.jsx)(_components.code, {
          children: "item"
        }), "): ", (0,jsx_runtime.jsx)(_components.code, {
          children: "any"
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/11b3dada6a91c7d34c20f0c83ff25becdbcbd003/packages/extension-api/src/extension-api.d.ts#L1601",
        children: "packages/extension-api/src/extension-api.d.ts:1601"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "An optional function that is invoked whenever an item is selected."
    }), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "parameters",
      children: "Parameters"
    }), "\n", (0,jsx_runtime.jsx)(_components.h5, {
      id: "item",
      children: "item"
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: [(0,jsx_runtime.jsx)(_components.code, {
        children: "string"
      }), " | ", (0,jsx_runtime.jsx)(_components.a, {
        href: "/api/interfaces/QuickPickItem",
        children: (0,jsx_runtime.jsx)(_components.code, {
          children: "QuickPickItem"
        })
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "returns",
      children: "Returns"
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        children: "any"
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