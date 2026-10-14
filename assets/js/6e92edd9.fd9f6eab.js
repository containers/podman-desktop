"use strict";
(globalThis["webpackChunkdocs"] = globalThis["webpackChunkdocs"] || []).push([[90735],{

/***/ 27968
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  assets: () => (/* binding */ assets),
  contentTitle: () => (/* binding */ contentTitle),
  "default": () => (/* binding */ MDXContent),
  frontMatter: () => (/* binding */ frontMatter),
  metadata: () => (/* reexport */ site_api_interfaces_configuration_md_6e9_namespaceObject),
  toc: () => (/* binding */ toc)
});

;// ./.docusaurus/docusaurus-plugin-content-docs/api/site-api-interfaces-configuration-md-6e9.json
const site_api_interfaces_configuration_md_6e9_namespaceObject = /*#__PURE__*/JSON.parse('{"id":"interfaces/Configuration","title":"Interface: Configuration","description":"Defined in1258","source":"@site/api/interfaces/Configuration.md","sourceDirName":"interfaces","slug":"/interfaces/Configuration","permalink":"/api/interfaces/Configuration","draft":false,"unlisted":false,"tags":[],"version":"current","frontMatter":{},"sidebar":"typedocSidebar","previous":{"title":"Command","permalink":"/api/interfaces/Command"},"next":{"title":"ConfigurationChangeEvent","permalink":"/api/interfaces/ConfigurationChangeEvent"}}');
// EXTERNAL MODULE: ../node_modules/react/jsx-runtime.js
var jsx_runtime = __webpack_require__(62540);
// EXTERNAL MODULE: ../node_modules/@mdx-js/react/lib/index.js
var lib = __webpack_require__(43023);
;// ./api/interfaces/Configuration.md


const frontMatter = {};
const contentTitle = 'Interface: Configuration';

const assets = {

};



const toc = [{
  "value": "Indexable",
  "id": "indexable",
  "level": 2
}, {
  "value": "Methods",
  "id": "methods",
  "level": 2
}, {
  "value": "get()",
  "id": "get",
  "level": 3
}, {
  "value": "Call Signature",
  "id": "call-signature",
  "level": 4
}, {
  "value": "Type Parameters",
  "id": "type-parameters",
  "level": 5
}, {
  "value": "T",
  "id": "t",
  "level": 6
}, {
  "value": "Parameters",
  "id": "parameters",
  "level": 5
}, {
  "value": "section",
  "id": "section",
  "level": 6
}, {
  "value": "Returns",
  "id": "returns",
  "level": 5
}, {
  "value": "Call Signature",
  "id": "call-signature-1",
  "level": 4
}, {
  "value": "Type Parameters",
  "id": "type-parameters-1",
  "level": 5
}, {
  "value": "T",
  "id": "t-1",
  "level": 6
}, {
  "value": "Parameters",
  "id": "parameters-1",
  "level": 5
}, {
  "value": "section",
  "id": "section-1",
  "level": 6
}, {
  "value": "defaultValue",
  "id": "defaultvalue",
  "level": 6
}, {
  "value": "Returns",
  "id": "returns-1",
  "level": 5
}, {
  "value": "has()",
  "id": "has",
  "level": 3
}, {
  "value": "Parameters",
  "id": "parameters-2",
  "level": 4
}, {
  "value": "section",
  "id": "section-2",
  "level": 5
}, {
  "value": "Returns",
  "id": "returns-2",
  "level": 4
}, {
  "value": "update()",
  "id": "update",
  "level": 3
}, {
  "value": "Parameters",
  "id": "parameters-3",
  "level": 4
}, {
  "value": "section",
  "id": "section-3",
  "level": 5
}, {
  "value": "value",
  "id": "value",
  "level": 5
}, {
  "value": "Returns",
  "id": "returns-3",
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
    h5: "h5",
    h6: "h6",
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
        id: "interface-configuration",
        children: "Interface: Configuration"
      })
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/d26848fa786d95ebd0360003b1d092451cfe0509/packages/extension-api/src/extension-api.d.ts#L1258",
        children: "packages/extension-api/src/extension-api.d.ts:1258"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.h2, {
      id: "indexable",
      children: "Indexable"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: ["[", (0,jsx_runtime.jsx)(_components.code, {
          children: "key"
        }), ": ", (0,jsx_runtime.jsx)(_components.code, {
          children: "string"
        }), "]: ", (0,jsx_runtime.jsx)(_components.code, {
          children: "any"
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Readable dictionary that backs this configuration."
    }), "\n", (0,jsx_runtime.jsx)(_components.h2, {
      id: "methods",
      children: "Methods"
    }), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "get",
      children: "get()"
    }), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "call-signature",
      children: "Call Signature"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.strong, {
          children: "get"
        }), "<", (0,jsx_runtime.jsx)(_components.code, {
          children: "T"
        }), ">(", (0,jsx_runtime.jsx)(_components.code, {
          children: "section"
        }), "): ", (0,jsx_runtime.jsx)(_components.code, {
          children: "T"
        }), " | ", (0,jsx_runtime.jsx)(_components.code, {
          children: "undefined"
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/d26848fa786d95ebd0360003b1d092451cfe0509/packages/extension-api/src/extension-api.d.ts#L1265",
        children: "packages/extension-api/src/extension-api.d.ts:1265"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Return a value from this configuration."
    }), "\n", (0,jsx_runtime.jsx)(_components.h5, {
      id: "type-parameters",
      children: "Type Parameters"
    }), "\n", (0,jsx_runtime.jsx)(_components.h6, {
      id: "t",
      children: "T"
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        children: "T"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.h5, {
      id: "parameters",
      children: "Parameters"
    }), "\n", (0,jsx_runtime.jsx)(_components.h6, {
      id: "section",
      children: "section"
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        children: "string"
      })
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Configuration name, supports ", (0,jsx_runtime.jsx)(_components.em, {
        children: "dotted"
      }), " names."]
    }), "\n", (0,jsx_runtime.jsx)(_components.h5, {
      id: "returns",
      children: "Returns"
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: [(0,jsx_runtime.jsx)(_components.code, {
        children: "T"
      }), " | ", (0,jsx_runtime.jsx)(_components.code, {
        children: "undefined"
      })]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["The value ", (0,jsx_runtime.jsx)(_components.code, {
        children: "section"
      }), " denotes or ", (0,jsx_runtime.jsx)(_components.code, {
        children: "undefined"
      }), "."]
    }), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "call-signature-1",
      children: "Call Signature"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.strong, {
          children: "get"
        }), "<", (0,jsx_runtime.jsx)(_components.code, {
          children: "T"
        }), ">(", (0,jsx_runtime.jsx)(_components.code, {
          children: "section"
        }), ", ", (0,jsx_runtime.jsx)(_components.code, {
          children: "defaultValue"
        }), "): ", (0,jsx_runtime.jsx)(_components.code, {
          children: "T"
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/d26848fa786d95ebd0360003b1d092451cfe0509/packages/extension-api/src/extension-api.d.ts#L1274",
        children: "packages/extension-api/src/extension-api.d.ts:1274"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Return a value from this configuration."
    }), "\n", (0,jsx_runtime.jsx)(_components.h5, {
      id: "type-parameters-1",
      children: "Type Parameters"
    }), "\n", (0,jsx_runtime.jsx)(_components.h6, {
      id: "t-1",
      children: "T"
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        children: "T"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.h5, {
      id: "parameters-1",
      children: "Parameters"
    }), "\n", (0,jsx_runtime.jsx)(_components.h6, {
      id: "section-1",
      children: "section"
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        children: "string"
      })
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Configuration name, supports ", (0,jsx_runtime.jsx)(_components.em, {
        children: "dotted"
      }), " names."]
    }), "\n", (0,jsx_runtime.jsx)(_components.h6, {
      id: "defaultvalue",
      children: "defaultValue"
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        children: "T"
      })
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["A value should be returned when no value could be found, is ", (0,jsx_runtime.jsx)(_components.code, {
        children: "undefined"
      }), "."]
    }), "\n", (0,jsx_runtime.jsx)(_components.h5, {
      id: "returns-1",
      children: "Returns"
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        children: "T"
      })
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["The value ", (0,jsx_runtime.jsx)(_components.code, {
        children: "section"
      }), " denotes or the default."]
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "has",
      children: "has()"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.strong, {
          children: "has"
        }), "(", (0,jsx_runtime.jsx)(_components.code, {
          children: "section"
        }), "): ", (0,jsx_runtime.jsx)(_components.code, {
          children: "boolean"
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/d26848fa786d95ebd0360003b1d092451cfe0509/packages/extension-api/src/extension-api.d.ts#L1282",
        children: "packages/extension-api/src/extension-api.d.ts:1282"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Check if this configuration has a certain value."
    }), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "parameters-2",
      children: "Parameters"
    }), "\n", (0,jsx_runtime.jsx)(_components.h5, {
      id: "section-2",
      children: "section"
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        children: "string"
      })
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Configuration name, supports ", (0,jsx_runtime.jsx)(_components.em, {
        children: "dotted"
      }), " names."]
    }), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "returns-2",
      children: "Returns"
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        children: "boolean"
      })
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: [(0,jsx_runtime.jsx)(_components.code, {
        children: "true"
      }), " if the section doesn't resolve to ", (0,jsx_runtime.jsx)(_components.code, {
        children: "undefined"
      }), "."]
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "update",
      children: "update()"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.strong, {
          children: "update"
        }), "(", (0,jsx_runtime.jsx)(_components.code, {
          children: "section"
        }), ", ", (0,jsx_runtime.jsx)(_components.code, {
          children: "value"
        }), "): ", (0,jsx_runtime.jsx)(_components.code, {
          children: "Promise"
        }), "<", (0,jsx_runtime.jsx)(_components.code, {
          children: "void"
        }), ">"]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/d26848fa786d95ebd0360003b1d092451cfe0509/packages/extension-api/src/extension-api.d.ts#L1288",
        children: "packages/extension-api/src/extension-api.d.ts:1288"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Update a configuration value. The updated configuration values are persisted."
    }), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "parameters-3",
      children: "Parameters"
    }), "\n", (0,jsx_runtime.jsx)(_components.h5, {
      id: "section-3",
      children: "section"
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        children: "string"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.h5, {
      id: "value",
      children: "value"
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        children: "any"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "returns-3",
      children: "Returns"
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: [(0,jsx_runtime.jsx)(_components.code, {
        children: "Promise"
      }), "<", (0,jsx_runtime.jsx)(_components.code, {
        children: "void"
      }), ">"]
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