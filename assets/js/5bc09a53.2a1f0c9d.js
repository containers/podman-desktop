"use strict";
(globalThis["webpackChunkdocs"] = globalThis["webpackChunkdocs"] || []).push([[69597],{

/***/ 48820
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  assets: () => (/* binding */ assets),
  contentTitle: () => (/* binding */ contentTitle),
  "default": () => (/* binding */ MDXContent),
  frontMatter: () => (/* binding */ frontMatter),
  metadata: () => (/* reexport */ site_api_interfaces_health_config_md_5bc_namespaceObject),
  toc: () => (/* binding */ toc)
});

;// ./.docusaurus/docusaurus-plugin-content-docs/api/site-api-interfaces-health-config-md-5bc.json
const site_api_interfaces_health_config_md_5bc_namespaceObject = /*#__PURE__*/JSON.parse('{"id":"interfaces/HealthConfig","title":"Interface: HealthConfig","description":"Defined in3212","source":"@site/api/interfaces/HealthConfig.md","sourceDirName":"interfaces","slug":"/interfaces/HealthConfig","permalink":"/api/interfaces/HealthConfig","draft":false,"unlisted":false,"tags":[],"version":"current","frontMatter":{},"sidebar":"typedocSidebar","previous":{"title":"HealthCheckResults","permalink":"/api/interfaces/HealthCheckResults"},"next":{"title":"HostConfig","permalink":"/api/interfaces/HostConfig"}}');
// EXTERNAL MODULE: ../node_modules/react/jsx-runtime.js
var jsx_runtime = __webpack_require__(62540);
// EXTERNAL MODULE: ../node_modules/@mdx-js/react/lib/index.js
var lib = __webpack_require__(43023);
;// ./api/interfaces/HealthConfig.md


const frontMatter = {};
const contentTitle = 'Interface: HealthConfig';

const assets = {

};



const toc = [{
  "value": "Properties",
  "id": "properties",
  "level": 2
}, {
  "value": "Interval?",
  "id": "interval",
  "level": 3
}, {
  "value": "Example",
  "id": "example",
  "level": 4
}, {
  "value": "Retries?",
  "id": "retries",
  "level": 3
}, {
  "value": "Example",
  "id": "example-1",
  "level": 4
}, {
  "value": "StartPeriod?",
  "id": "startperiod",
  "level": 3
}, {
  "value": "Example",
  "id": "example-2",
  "level": 4
}, {
  "value": "Test?",
  "id": "test",
  "level": 3
}, {
  "value": "Examples",
  "id": "examples",
  "level": 4
}, {
  "value": "Timeout?",
  "id": "timeout",
  "level": 3
}, {
  "value": "Example",
  "id": "example-3",
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
    pre: "pre",
    strong: "strong",
    ...(0,lib/* useMDXComponents */.R)(),
    ...props.components
  };
  return (0,jsx_runtime.jsxs)(jsx_runtime.Fragment, {
    children: [(0,jsx_runtime.jsx)(_components.header, {
      children: (0,jsx_runtime.jsx)(_components.h1, {
        id: "interface-healthconfig",
        children: "Interface: HealthConfig"
      })
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/fe8ffb0aa66cf732c3da599b2a893e5286ff1411/packages/extension-api/src/extension-api.d.ts#L3212",
        children: "packages/extension-api/src/extension-api.d.ts:3212"
      })]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Configuration options for defining a healthcheck for a container.\nTo get health check result you can use ", (0,jsx_runtime.jsx)(_components.a, {
        href: "/api/@podman-desktop/namespaces/containerEngine/functions/inspectContainer",
        children: "containerEngine.inspectContainer"
      }), " and inside the obtained ", (0,jsx_runtime.jsx)(_components.a, {
        href: "/api/interfaces/ContainerInspectInfo",
        children: "ContainerInspectInfo"
      }), " you can access the ", (0,jsx_runtime.jsx)(_components.code, {
        children: "Status.Health"
      }), " property containing a ", (0,jsx_runtime.jsx)(_components.a, {
        href: "/api/interfaces/HealthCheckResults",
        children: "HealthCheckResults"
      }), "."]
    }), "\n", (0,jsx_runtime.jsx)(_components.h2, {
      id: "properties",
      children: "Properties"
    }), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "interval",
      children: "Interval?"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "optional"
        }), " ", (0,jsx_runtime.jsx)(_components.strong, {
          children: "Interval?"
        }), ": ", (0,jsx_runtime.jsx)(_components.code, {
          children: "number"
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/fe8ffb0aa66cf732c3da599b2a893e5286ff1411/packages/extension-api/src/extension-api.d.ts#L3241",
        children: "packages/extension-api/src/extension-api.d.ts:3241"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "The time to wait between checks in nanoseconds. It should be 0 or at least 1000000 (1 ms). 0 means inherit."
    }), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "example",
      children: "Example"
    }), "\n", (0,jsx_runtime.jsx)(_components.pre, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        className: "language-ts",
        children: "// Set interval to 1 second\nInterval?: 1000000000;\n"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "retries",
      children: "Retries?"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "optional"
        }), " ", (0,jsx_runtime.jsx)(_components.strong, {
          children: "Retries?"
        }), ": ", (0,jsx_runtime.jsx)(_components.code, {
          children: "number"
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/fe8ffb0aa66cf732c3da599b2a893e5286ff1411/packages/extension-api/src/extension-api.d.ts#L3269",
        children: "packages/extension-api/src/extension-api.d.ts:3269"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "The number of consecutive failures needed to consider a container as unhealthy. 0 means inherit."
    }), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "example-1",
      children: "Example"
    }), "\n", (0,jsx_runtime.jsx)(_components.pre, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        className: "language-ts",
        children: "// Set retries to 3\nRetries?: 3;\n"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "startperiod",
      children: "StartPeriod?"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "optional"
        }), " ", (0,jsx_runtime.jsx)(_components.strong, {
          children: "StartPeriod?"
        }), ": ", (0,jsx_runtime.jsx)(_components.code, {
          children: "number"
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/fe8ffb0aa66cf732c3da599b2a893e5286ff1411/packages/extension-api/src/extension-api.d.ts#L3260",
        children: "packages/extension-api/src/extension-api.d.ts:3260"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Start period for the container to initialize before starting health-retries countdown in nanoseconds. It should\nbe 0 or at least 1000000 (1 ms). 0 means inherit."
    }), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "example-2",
      children: "Example"
    }), "\n", (0,jsx_runtime.jsx)(_components.pre, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        className: "language-ts",
        children: "// Set start period to 2 seconds\nStartPeriod?: 2000000000;\n"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "test",
      children: "Test?"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "optional"
        }), " ", (0,jsx_runtime.jsx)(_components.strong, {
          children: "Test?"
        }), ": ", (0,jsx_runtime.jsx)(_components.code, {
          children: "string"
        }), "[]"]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/fe8ffb0aa66cf732c3da599b2a893e5286ff1411/packages/extension-api/src/extension-api.d.ts#L3232",
        children: "packages/extension-api/src/extension-api.d.ts:3232"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "The test to perform."
    }), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "examples",
      children: "Examples"
    }), "\n", (0,jsx_runtime.jsx)(_components.pre, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        className: "language-ts",
        children: "// Inherit healthcheck from image\nTest?: [];\n"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.pre, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        className: "language-ts",
        children: "// Disable healthcheck\nTest?: [\"NONE\"];\n"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.pre, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        className: "language-ts",
        children: "// Execute command in host system\nTest?: [\"CMD\", \"curl\", \"http://localhost\"];\n"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.pre, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        className: "language-ts",
        children: "// Podman will execute the command inside the target container and wait for either a \"0\" or \"failure  exit\" code.\nTest?: [\"CMD-SHELL\", \"curl http://localhost || exit 1\"];\n"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "timeout",
      children: "Timeout?"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "optional"
        }), " ", (0,jsx_runtime.jsx)(_components.strong, {
          children: "Timeout?"
        }), ": ", (0,jsx_runtime.jsx)(_components.code, {
          children: "number"
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/fe8ffb0aa66cf732c3da599b2a893e5286ff1411/packages/extension-api/src/extension-api.d.ts#L3250",
        children: "packages/extension-api/src/extension-api.d.ts:3250"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "The time to wait before considering the check to have hung. It should be 0 or at least 1000000 (1 ms). 0 means inherit."
    }), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "example-3",
      children: "Example"
    }), "\n", (0,jsx_runtime.jsx)(_components.pre, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        className: "language-ts",
        children: "// Set timeout to 5 seconds\nTimeout?: 5000000000;\n"
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