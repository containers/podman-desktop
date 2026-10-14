"use strict";
(globalThis["webpackChunkdocs"] = globalThis["webpackChunkdocs"] || []).push([[8936],{

/***/ 69496
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  assets: () => (/* binding */ assets),
  contentTitle: () => (/* binding */ contentTitle),
  "default": () => (/* binding */ MDXContent),
  frontMatter: () => (/* binding */ frontMatter),
  metadata: () => (/* reexport */ site_api_interfaces_container_stats_info_md_67f_namespaceObject),
  toc: () => (/* binding */ toc)
});

;// ./.docusaurus/docusaurus-plugin-content-docs/api/site-api-interfaces-container-stats-info-md-67f.json
const site_api_interfaces_container_stats_info_md_67f_namespaceObject = /*#__PURE__*/JSON.parse('{"id":"interfaces/ContainerStatsInfo","title":"Interface: ContainerStatsInfo","description":"Defined in3686","source":"@site/api/interfaces/ContainerStatsInfo.md","sourceDirName":"interfaces","slug":"/interfaces/ContainerStatsInfo","permalink":"/api/interfaces/ContainerStatsInfo","draft":false,"unlisted":false,"tags":[],"version":"current","frontMatter":{},"sidebar":"typedocSidebar","previous":{"title":"ContainerProviderConnectionFactory","permalink":"/api/interfaces/ContainerProviderConnectionFactory"},"next":{"title":"CPUStats","permalink":"/api/interfaces/CPUStats"}}');
// EXTERNAL MODULE: ../node_modules/react/jsx-runtime.js
var jsx_runtime = __webpack_require__(62540);
// EXTERNAL MODULE: ../node_modules/@mdx-js/react/lib/index.js
var lib = __webpack_require__(43023);
;// ./api/interfaces/ContainerStatsInfo.md


const frontMatter = {};
const contentTitle = 'Interface: ContainerStatsInfo';

const assets = {

};



const toc = [{
  "value": "Properties",
  "id": "properties",
  "level": 2
}, {
  "value": "blkio_stats?",
  "id": "blkio_stats",
  "level": 3
}, {
  "value": "cpu_stats",
  "id": "cpu_stats",
  "level": 3
}, {
  "value": "engineId",
  "id": "engineid",
  "level": 3
}, {
  "value": "engineName",
  "id": "enginename",
  "level": 3
}, {
  "value": "memory_stats",
  "id": "memory_stats",
  "level": 3
}, {
  "value": "networks",
  "id": "networks",
  "level": 3
}, {
  "value": "num_procs",
  "id": "num_procs",
  "level": 3
}, {
  "value": "pids_stats?",
  "id": "pids_stats",
  "level": 3
}, {
  "value": "precpu_stats",
  "id": "precpu_stats",
  "level": 3
}, {
  "value": "preread",
  "id": "preread",
  "level": 3
}, {
  "value": "read",
  "id": "read",
  "level": 3
}, {
  "value": "storage_stats?",
  "id": "storage_stats",
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
        id: "interface-containerstatsinfo",
        children: "Interface: ContainerStatsInfo"
      })
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/d26848fa786d95ebd0360003b1d092451cfe0509/packages/extension-api/src/extension-api.d.ts#L3686",
        children: "packages/extension-api/src/extension-api.d.ts:3686"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.h2, {
      id: "properties",
      children: "Properties"
    }), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "blkio_stats",
      children: "blkio_stats?"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "optional"
        }), " ", (0,jsx_runtime.jsx)(_components.strong, {
          children: "blkio_stats?"
        }), ": ", (0,jsx_runtime.jsx)(_components.a, {
          href: "/api/interfaces/BlkioStats",
          children: (0,jsx_runtime.jsx)(_components.code, {
            children: "BlkioStats"
          })
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/d26848fa786d95ebd0360003b1d092451cfe0509/packages/extension-api/src/extension-api.d.ts#L3692",
        children: "packages/extension-api/src/extension-api.d.ts:3692"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "cpu_stats",
      children: "cpu_stats"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.strong, {
          children: "cpu_stats"
        }), ": ", (0,jsx_runtime.jsx)(_components.a, {
          href: "/api/interfaces/CPUStats",
          children: (0,jsx_runtime.jsx)(_components.code, {
            children: "CPUStats"
          })
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/d26848fa786d95ebd0360003b1d092451cfe0509/packages/extension-api/src/extension-api.d.ts#L3697",
        children: "packages/extension-api/src/extension-api.d.ts:3697"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "engineid",
      children: "engineId"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.strong, {
          children: "engineId"
        }), ": ", (0,jsx_runtime.jsx)(_components.code, {
          children: "string"
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/d26848fa786d95ebd0360003b1d092451cfe0509/packages/extension-api/src/extension-api.d.ts#L3687",
        children: "packages/extension-api/src/extension-api.d.ts:3687"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "enginename",
      children: "engineName"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.strong, {
          children: "engineName"
        }), ": ", (0,jsx_runtime.jsx)(_components.code, {
          children: "string"
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/d26848fa786d95ebd0360003b1d092451cfe0509/packages/extension-api/src/extension-api.d.ts#L3688",
        children: "packages/extension-api/src/extension-api.d.ts:3688"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "memory_stats",
      children: "memory_stats"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.strong, {
          children: "memory_stats"
        }), ": ", (0,jsx_runtime.jsx)(_components.a, {
          href: "/api/interfaces/MemoryStats",
          children: (0,jsx_runtime.jsx)(_components.code, {
            children: "MemoryStats"
          })
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/d26848fa786d95ebd0360003b1d092451cfe0509/packages/extension-api/src/extension-api.d.ts#L3696",
        children: "packages/extension-api/src/extension-api.d.ts:3696"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "networks",
      children: "networks"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.strong, {
          children: "networks"
        }), ": ", (0,jsx_runtime.jsx)(_components.a, {
          href: "/api/interfaces/NetworkStats",
          children: (0,jsx_runtime.jsx)(_components.code, {
            children: "NetworkStats"
          })
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/d26848fa786d95ebd0360003b1d092451cfe0509/packages/extension-api/src/extension-api.d.ts#L3695",
        children: "packages/extension-api/src/extension-api.d.ts:3695"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "num_procs",
      children: "num_procs"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.strong, {
          children: "num_procs"
        }), ": ", (0,jsx_runtime.jsx)(_components.code, {
          children: "number"
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/d26848fa786d95ebd0360003b1d092451cfe0509/packages/extension-api/src/extension-api.d.ts#L3693",
        children: "packages/extension-api/src/extension-api.d.ts:3693"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "pids_stats",
      children: "pids_stats?"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "optional"
        }), " ", (0,jsx_runtime.jsx)(_components.strong, {
          children: "pids_stats?"
        }), ": ", (0,jsx_runtime.jsx)(_components.a, {
          href: "/api/interfaces/PidsStats",
          children: (0,jsx_runtime.jsx)(_components.code, {
            children: "PidsStats"
          })
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/d26848fa786d95ebd0360003b1d092451cfe0509/packages/extension-api/src/extension-api.d.ts#L3691",
        children: "packages/extension-api/src/extension-api.d.ts:3691"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "precpu_stats",
      children: "precpu_stats"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.strong, {
          children: "precpu_stats"
        }), ": ", (0,jsx_runtime.jsx)(_components.a, {
          href: "/api/interfaces/CPUStats",
          children: (0,jsx_runtime.jsx)(_components.code, {
            children: "CPUStats"
          })
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/d26848fa786d95ebd0360003b1d092451cfe0509/packages/extension-api/src/extension-api.d.ts#L3698",
        children: "packages/extension-api/src/extension-api.d.ts:3698"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "preread",
      children: "preread"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.strong, {
          children: "preread"
        }), ": ", (0,jsx_runtime.jsx)(_components.code, {
          children: "string"
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/d26848fa786d95ebd0360003b1d092451cfe0509/packages/extension-api/src/extension-api.d.ts#L3690",
        children: "packages/extension-api/src/extension-api.d.ts:3690"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "read",
      children: "read"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.strong, {
          children: "read"
        }), ": ", (0,jsx_runtime.jsx)(_components.code, {
          children: "string"
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/d26848fa786d95ebd0360003b1d092451cfe0509/packages/extension-api/src/extension-api.d.ts#L3689",
        children: "packages/extension-api/src/extension-api.d.ts:3689"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "storage_stats",
      children: "storage_stats?"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "optional"
        }), " ", (0,jsx_runtime.jsx)(_components.strong, {
          children: "storage_stats?"
        }), ": ", (0,jsx_runtime.jsx)(_components.a, {
          href: "/api/interfaces/StorageStats",
          children: (0,jsx_runtime.jsx)(_components.code, {
            children: "StorageStats"
          })
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/d26848fa786d95ebd0360003b1d092451cfe0509/packages/extension-api/src/extension-api.d.ts#L3694",
        children: "packages/extension-api/src/extension-api.d.ts:3694"
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