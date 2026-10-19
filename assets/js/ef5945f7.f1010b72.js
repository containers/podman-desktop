"use strict";
(globalThis["webpackChunkdocs"] = globalThis["webpackChunkdocs"] || []).push([[70540],{

/***/ 60416
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  assets: () => (/* binding */ assets),
  contentTitle: () => (/* binding */ contentTitle),
  "default": () => (/* binding */ MDXContent),
  frontMatter: () => (/* binding */ frontMatter),
  metadata: () => (/* reexport */ site_api_interfaces_extension_md_ef5_namespaceObject),
  toc: () => (/* binding */ toc)
});

;// ./.docusaurus/docusaurus-plugin-content-docs/api/site-api-interfaces-extension-md-ef5.json
const site_api_interfaces_extension_md_ef5_namespaceObject = /*#__PURE__*/JSON.parse('{"id":"interfaces/Extension","title":"Interface: Extension\\\\<T\\\\>","description":"Defined in214","source":"@site/api/interfaces/Extension.md","sourceDirName":"interfaces","slug":"/interfaces/Extension","permalink":"/api/interfaces/Extension","draft":false,"unlisted":false,"tags":[],"version":"current","frontMatter":{},"sidebar":"typedocSidebar","previous":{"title":"Event","permalink":"/api/interfaces/Event"},"next":{"title":"ExtensionContext","permalink":"/api/interfaces/ExtensionContext"}}');
// EXTERNAL MODULE: ../node_modules/react/jsx-runtime.js
var jsx_runtime = __webpack_require__(62540);
// EXTERNAL MODULE: ../node_modules/@mdx-js/react/lib/index.js
var lib = __webpack_require__(43023);
;// ./api/interfaces/Extension.md


const frontMatter = {};
const contentTitle = 'Interface: Extension<T>';

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
  "value": "exports",
  "id": "exports",
  "level": 3
}, {
  "value": "extensionPath",
  "id": "extensionpath",
  "level": 3
}, {
  "value": "extensionUri",
  "id": "extensionuri",
  "level": 3
}, {
  "value": "id",
  "id": "id",
  "level": 3
}, {
  "value": "packageJSON",
  "id": "packagejson",
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
        id: "interface-extensiont",
        children: "Interface: Extension<T>"
      })
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/3e0a638c921ca99ec48c37450484da7e0cbc23b3/packages/extension-api/src/extension-api.d.ts#L214",
        children: "packages/extension-api/src/extension-api.d.ts:214"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Represents an extension."
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["To get an instance of an ", (0,jsx_runtime.jsx)(_components.code, {
        children: "Extension"
      }), " use ", (0,jsx_runtime.jsx)(_components.a, {
        href: "/api/@podman-desktop/namespaces/extensions/functions/getExtension",
        children: "getExtension"
      }), "."]
    }), "\n", (0,jsx_runtime.jsx)(_components.h2, {
      id: "type-parameters",
      children: "Type Parameters"
    }), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "t",
      children: "T"
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        children: "T"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.h2, {
      id: "properties",
      children: "Properties"
    }), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "exports",
      children: "exports"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "readonly"
        }), " ", (0,jsx_runtime.jsx)(_components.strong, {
          children: "exports"
        }), ": ", (0,jsx_runtime.jsx)(_components.code, {
          children: "T"
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/3e0a638c921ca99ec48c37450484da7e0cbc23b3/packages/extension-api/src/extension-api.d.ts#L241",
        children: "packages/extension-api/src/extension-api.d.ts:241"
      })]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["The public API exported by this extension (return value of ", (0,jsx_runtime.jsx)(_components.code, {
        children: "activate"
      }), ").\nIt is an invalid action to access this field before this extension has been activated."]
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "extensionpath",
      children: "extensionPath"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "readonly"
        }), " ", (0,jsx_runtime.jsx)(_components.strong, {
          children: "extensionPath"
        }), ": ", (0,jsx_runtime.jsx)(_components.code, {
          children: "string"
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/3e0a638c921ca99ec48c37450484da7e0cbc23b3/packages/extension-api/src/extension-api.d.ts#L229",
        children: "packages/extension-api/src/extension-api.d.ts:229"
      })]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["The absolute file path of the directory containing this extension. Shorthand\nnotation for ", (0,jsx_runtime.jsx)(_components.a, {
        href: "#extensionuri",
        children: "Extension.extensionUri.fsPath"
      }), " (independent of the uri scheme)."]
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "extensionuri",
      children: "extensionUri"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "readonly"
        }), " ", (0,jsx_runtime.jsx)(_components.strong, {
          children: "extensionUri"
        }), ": ", (0,jsx_runtime.jsx)(_components.a, {
          href: "/api/classes/Uri",
          children: (0,jsx_runtime.jsx)(_components.code, {
            children: "Uri"
          })
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/3e0a638c921ca99ec48c37450484da7e0cbc23b3/packages/extension-api/src/extension-api.d.ts#L223",
        children: "packages/extension-api/src/extension-api.d.ts:223"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "The uri of the directory containing the extension."
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "id",
      children: "id"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "readonly"
        }), " ", (0,jsx_runtime.jsx)(_components.strong, {
          children: "id"
        }), ": ", (0,jsx_runtime.jsx)(_components.code, {
          children: "string"
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/3e0a638c921ca99ec48c37450484da7e0cbc23b3/packages/extension-api/src/extension-api.d.ts#L218",
        children: "packages/extension-api/src/extension-api.d.ts:218"
      })]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["The canonical extension identifier in the form of: ", (0,jsx_runtime.jsx)(_components.code, {
        children: "publisher.name"
      }), "."]
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "packagejson",
      children: "packageJSON"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "readonly"
        }), " ", (0,jsx_runtime.jsx)(_components.strong, {
          children: "packageJSON"
        }), ": ", (0,jsx_runtime.jsx)(_components.code, {
          children: "any"
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/3e0a638c921ca99ec48c37450484da7e0cbc23b3/packages/extension-api/src/extension-api.d.ts#L235",
        children: "packages/extension-api/src/extension-api.d.ts:235"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "The parsed contents of the extension's package.json."
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