"use strict";
(globalThis["webpackChunkdocs"] = globalThis["webpackChunkdocs"] || []).push([[87246],{

/***/ 51866
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  assets: () => (/* binding */ assets),
  contentTitle: () => (/* binding */ contentTitle),
  "default": () => (/* binding */ MDXContent),
  frontMatter: () => (/* binding */ frontMatter),
  metadata: () => (/* reexport */ site_api_interfaces_registry_md_b4d_namespaceObject),
  toc: () => (/* binding */ toc)
});

;// ./.docusaurus/docusaurus-plugin-content-docs/api/site-api-interfaces-registry-md-b4d.json
const site_api_interfaces_registry_md_b4d_namespaceObject = /*#__PURE__*/JSON.parse('{"id":"interfaces/Registry","title":"Interface: Registry","description":"Defined in1188","source":"@site/api/interfaces/Registry.md","sourceDirName":"interfaces","slug":"/interfaces/Registry","permalink":"/api/interfaces/Registry","draft":false,"unlisted":false,"tags":[],"version":"current","frontMatter":{},"sidebar":"typedocSidebar","previous":{"title":"RegisterVmConnectionEvent","permalink":"/api/interfaces/RegisterVmConnectionEvent"},"next":{"title":"RegistryConfig","permalink":"/api/interfaces/RegistryConfig"}}');
// EXTERNAL MODULE: ../node_modules/react/jsx-runtime.js
var jsx_runtime = __webpack_require__(62540);
// EXTERNAL MODULE: ../node_modules/@mdx-js/react/lib/index.js
var lib = __webpack_require__(43023);
;// ./api/interfaces/Registry.md


const frontMatter = {};
const contentTitle = 'Interface: Registry';

const assets = {

};



const toc = [{
  "value": "Extends",
  "id": "extends",
  "level": 2
}, {
  "value": "Properties",
  "id": "properties",
  "level": 2
}, {
  "value": "alias?",
  "id": "alias",
  "level": 3
}, {
  "value": "Inherited from",
  "id": "inherited-from",
  "level": 4
}, {
  "value": "icon?",
  "id": "icon",
  "level": 3
}, {
  "value": "insecure?",
  "id": "insecure",
  "level": 3
}, {
  "value": "Inherited from",
  "id": "inherited-from-1",
  "level": 4
}, {
  "value": "name?",
  "id": "name",
  "level": 3
}, {
  "value": "secret",
  "id": "secret",
  "level": 3
}, {
  "value": "Inherited from",
  "id": "inherited-from-2",
  "level": 4
}, {
  "value": "serverUrl",
  "id": "serverurl",
  "level": 3
}, {
  "value": "Inherited from",
  "id": "inherited-from-3",
  "level": 4
}, {
  "value": "source",
  "id": "source",
  "level": 3
}, {
  "value": "username",
  "id": "username",
  "level": 3
}, {
  "value": "Inherited from",
  "id": "inherited-from-4",
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
    li: "li",
    p: "p",
    strong: "strong",
    ul: "ul",
    ...(0,lib/* useMDXComponents */.R)(),
    ...props.components
  };
  return (0,jsx_runtime.jsxs)(jsx_runtime.Fragment, {
    children: [(0,jsx_runtime.jsx)(_components.header, {
      children: (0,jsx_runtime.jsx)(_components.h1, {
        id: "interface-registry",
        children: "Interface: Registry"
      })
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/6c9518088de3d8bdc1a521e03434508c61ddc31a/packages/extension-api/src/extension-api.d.ts#L1188",
        children: "packages/extension-api/src/extension-api.d.ts:1188"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.h2, {
      id: "extends",
      children: "Extends"
    }), "\n", (0,jsx_runtime.jsxs)(_components.ul, {
      children: ["\n", (0,jsx_runtime.jsx)(_components.li, {
        children: (0,jsx_runtime.jsx)(_components.a, {
          href: "/api/interfaces/RegistryCreateOptions",
          children: (0,jsx_runtime.jsx)(_components.code, {
            children: "RegistryCreateOptions"
          })
        })
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsx)(_components.h2, {
      id: "properties",
      children: "Properties"
    }), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "alias",
      children: "alias?"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "optional"
        }), " ", (0,jsx_runtime.jsx)(_components.strong, {
          children: "alias?"
        }), ": ", (0,jsx_runtime.jsx)(_components.code, {
          children: "string"
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/6c9518088de3d8bdc1a521e03434508c61ddc31a/packages/extension-api/src/extension-api.d.ts#L1201",
        children: "packages/extension-api/src/extension-api.d.ts:1201"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "inherited-from",
      children: "Inherited from"
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: [(0,jsx_runtime.jsx)(_components.a, {
        href: "/api/interfaces/RegistryCreateOptions",
        children: (0,jsx_runtime.jsx)(_components.code, {
          children: "RegistryCreateOptions"
        })
      }), ".", (0,jsx_runtime.jsx)(_components.a, {
        href: "/api/interfaces/RegistryCreateOptions#alias",
        children: (0,jsx_runtime.jsx)(_components.code, {
          children: "alias"
        })
      })]
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
        href: "https://github.com/podman-desktop/podman-desktop/blob/6c9518088de3d8bdc1a521e03434508c61ddc31a/packages/extension-api/src/extension-api.d.ts#L1193",
        children: "packages/extension-api/src/extension-api.d.ts:1193"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "insecure",
      children: "insecure?"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "optional"
        }), " ", (0,jsx_runtime.jsx)(_components.strong, {
          children: "insecure?"
        }), ": ", (0,jsx_runtime.jsx)(_components.code, {
          children: "boolean"
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/6c9518088de3d8bdc1a521e03434508c61ddc31a/packages/extension-api/src/extension-api.d.ts#L1200",
        children: "packages/extension-api/src/extension-api.d.ts:1200"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "inherited-from-1",
      children: "Inherited from"
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: [(0,jsx_runtime.jsx)(_components.a, {
        href: "/api/interfaces/RegistryCreateOptions",
        children: (0,jsx_runtime.jsx)(_components.code, {
          children: "RegistryCreateOptions"
        })
      }), ".", (0,jsx_runtime.jsx)(_components.a, {
        href: "/api/interfaces/RegistryCreateOptions#insecure",
        children: (0,jsx_runtime.jsx)(_components.code, {
          children: "insecure"
        })
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "name",
      children: "name?"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "optional"
        }), " ", (0,jsx_runtime.jsx)(_components.strong, {
          children: "name?"
        }), ": ", (0,jsx_runtime.jsx)(_components.code, {
          children: "string"
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/6c9518088de3d8bdc1a521e03434508c61ddc31a/packages/extension-api/src/extension-api.d.ts#L1192",
        children: "packages/extension-api/src/extension-api.d.ts:1192"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "secret",
      children: "secret"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.strong, {
          children: "secret"
        }), ": ", (0,jsx_runtime.jsx)(_components.code, {
          children: "string"
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/6c9518088de3d8bdc1a521e03434508c61ddc31a/packages/extension-api/src/extension-api.d.ts#L1199",
        children: "packages/extension-api/src/extension-api.d.ts:1199"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "inherited-from-2",
      children: "Inherited from"
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: [(0,jsx_runtime.jsx)(_components.a, {
        href: "/api/interfaces/RegistryCreateOptions",
        children: (0,jsx_runtime.jsx)(_components.code, {
          children: "RegistryCreateOptions"
        })
      }), ".", (0,jsx_runtime.jsx)(_components.a, {
        href: "/api/interfaces/RegistryCreateOptions#secret",
        children: (0,jsx_runtime.jsx)(_components.code, {
          children: "secret"
        })
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "serverurl",
      children: "serverUrl"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.strong, {
          children: "serverUrl"
        }), ": ", (0,jsx_runtime.jsx)(_components.code, {
          children: "string"
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/6c9518088de3d8bdc1a521e03434508c61ddc31a/packages/extension-api/src/extension-api.d.ts#L1197",
        children: "packages/extension-api/src/extension-api.d.ts:1197"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "inherited-from-3",
      children: "Inherited from"
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: [(0,jsx_runtime.jsx)(_components.a, {
        href: "/api/interfaces/RegistryCreateOptions",
        children: (0,jsx_runtime.jsx)(_components.code, {
          children: "RegistryCreateOptions"
        })
      }), ".", (0,jsx_runtime.jsx)(_components.a, {
        href: "/api/interfaces/RegistryCreateOptions#serverurl",
        children: (0,jsx_runtime.jsx)(_components.code, {
          children: "serverUrl"
        })
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "source",
      children: "source"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.strong, {
          children: "source"
        }), ": ", (0,jsx_runtime.jsx)(_components.code, {
          children: "string"
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/6c9518088de3d8bdc1a521e03434508c61ddc31a/packages/extension-api/src/extension-api.d.ts#L1189",
        children: "packages/extension-api/src/extension-api.d.ts:1189"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "username",
      children: "username"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.strong, {
          children: "username"
        }), ": ", (0,jsx_runtime.jsx)(_components.code, {
          children: "string"
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/6c9518088de3d8bdc1a521e03434508c61ddc31a/packages/extension-api/src/extension-api.d.ts#L1198",
        children: "packages/extension-api/src/extension-api.d.ts:1198"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "inherited-from-4",
      children: "Inherited from"
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: [(0,jsx_runtime.jsx)(_components.a, {
        href: "/api/interfaces/RegistryCreateOptions",
        children: (0,jsx_runtime.jsx)(_components.code, {
          children: "RegistryCreateOptions"
        })
      }), ".", (0,jsx_runtime.jsx)(_components.a, {
        href: "/api/interfaces/RegistryCreateOptions#username",
        children: (0,jsx_runtime.jsx)(_components.code, {
          children: "username"
        })
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