"use strict";
(globalThis["webpackChunkdocs"] = globalThis["webpackChunkdocs"] || []).push([[86693],{

/***/ 60437
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  assets: () => (/* binding */ assets),
  contentTitle: () => (/* binding */ contentTitle),
  "default": () => (/* binding */ MDXContent),
  frontMatter: () => (/* binding */ frontMatter),
  metadata: () => (/* reexport */ site_api_interfaces_open_dialog_options_md_c7c_namespaceObject),
  toc: () => (/* binding */ toc)
});

;// ./.docusaurus/docusaurus-plugin-content-docs/api/site-api-interfaces-open-dialog-options-md-c7c.json
const site_api_interfaces_open_dialog_options_md_c7c_namespaceObject = /*#__PURE__*/JSON.parse('{"id":"interfaces/OpenDialogOptions","title":"Interface: OpenDialogOptions","description":"Defined in2149","source":"@site/api/interfaces/OpenDialogOptions.md","sourceDirName":"interfaces","slug":"/interfaces/OpenDialogOptions","permalink":"/api/interfaces/OpenDialogOptions","draft":false,"unlisted":false,"tags":[],"version":"current","frontMatter":{},"sidebar":"typedocSidebar","previous":{"title":"NotificationOptions","permalink":"/api/interfaces/NotificationOptions"},"next":{"title":"PidsStats","permalink":"/api/interfaces/PidsStats"}}');
// EXTERNAL MODULE: ../node_modules/react/jsx-runtime.js
var jsx_runtime = __webpack_require__(62540);
// EXTERNAL MODULE: ../node_modules/@mdx-js/react/lib/index.js
var lib = __webpack_require__(43023);
;// ./api/interfaces/OpenDialogOptions.md


const frontMatter = {};
const contentTitle = 'Interface: OpenDialogOptions';

const assets = {

};



const toc = [{
  "value": "Properties",
  "id": "properties",
  "level": 2
}, {
  "value": "defaultUri?",
  "id": "defaulturi",
  "level": 3
}, {
  "value": "filters?",
  "id": "filters",
  "level": 3
}, {
  "value": "extensions",
  "id": "extensions",
  "level": 4
}, {
  "value": "name",
  "id": "name",
  "level": 4
}, {
  "value": "openLabel?",
  "id": "openlabel",
  "level": 3
}, {
  "value": "selectors?",
  "id": "selectors",
  "level": 3
}, {
  "value": "title?",
  "id": "title",
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
        id: "interface-opendialogoptions",
        children: "Interface: OpenDialogOptions"
      })
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/d26848fa786d95ebd0360003b1d092451cfe0509/packages/extension-api/src/extension-api.d.ts#L2149",
        children: "packages/extension-api/src/extension-api.d.ts:2149"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Options to configure the behaviour of a file open dialog."
    }), "\n", (0,jsx_runtime.jsx)(_components.h2, {
      id: "properties",
      children: "Properties"
    }), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "defaulturi",
      children: "defaultUri?"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "optional"
        }), " ", (0,jsx_runtime.jsx)(_components.strong, {
          children: "defaultUri?"
        }), ": ", (0,jsx_runtime.jsx)(_components.a, {
          href: "/api/classes/Uri",
          children: (0,jsx_runtime.jsx)(_components.code, {
            children: "Uri"
          })
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/d26848fa786d95ebd0360003b1d092451cfe0509/packages/extension-api/src/extension-api.d.ts#L2153",
        children: "packages/extension-api/src/extension-api.d.ts:2153"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "The resource the dialog shows when opened."
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "filters",
      children: "filters?"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "optional"
        }), " ", (0,jsx_runtime.jsx)(_components.strong, {
          children: "filters?"
        }), ": ", (0,jsx_runtime.jsx)(_components.code, {
          children: "object"
        }), "[]"]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/d26848fa786d95ebd0360003b1d092451cfe0509/packages/extension-api/src/extension-api.d.ts#L2169",
        children: "packages/extension-api/src/extension-api.d.ts:2169"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "A set of file filters that are used by the dialog."
    }), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "extensions",
      children: "extensions"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.strong, {
          children: "extensions"
        }), ": ", (0,jsx_runtime.jsx)(_components.code, {
          children: "string"
        }), "[]"]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "name",
      children: "name"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.strong, {
          children: "name"
        }), ": ", (0,jsx_runtime.jsx)(_components.code, {
          children: "string"
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "openlabel",
      children: "openLabel?"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "optional"
        }), " ", (0,jsx_runtime.jsx)(_components.strong, {
          children: "openLabel?"
        }), ": ", (0,jsx_runtime.jsx)(_components.code, {
          children: "string"
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/d26848fa786d95ebd0360003b1d092451cfe0509/packages/extension-api/src/extension-api.d.ts#L2158",
        children: "packages/extension-api/src/extension-api.d.ts:2158"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "A human-readable string for the open button."
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "selectors",
      children: "selectors?"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "optional"
        }), " ", (0,jsx_runtime.jsx)(_components.strong, {
          children: "selectors?"
        }), ": (", (0,jsx_runtime.jsx)(_components.code, {
          children: "\"openFile\""
        }), " | ", (0,jsx_runtime.jsx)(_components.code, {
          children: "\"openDirectory\""
        }), " | ", (0,jsx_runtime.jsx)(_components.code, {
          children: "\"multiSelections\""
        }), " | ", (0,jsx_runtime.jsx)(_components.code, {
          children: "\"showHiddenFiles\""
        }), ")[]"]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/d26848fa786d95ebd0360003b1d092451cfe0509/packages/extension-api/src/extension-api.d.ts#L2164",
        children: "packages/extension-api/src/extension-api.d.ts:2164"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Contains which features the dialog should use. The following values are\nsupported:"
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
        href: "https://github.com/podman-desktop/podman-desktop/blob/d26848fa786d95ebd0360003b1d092451cfe0509/packages/extension-api/src/extension-api.d.ts#L2177",
        children: "packages/extension-api/src/extension-api.d.ts:2177"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Dialog title."
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