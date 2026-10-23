"use strict";
(globalThis["webpackChunkdocs"] = globalThis["webpackChunkdocs"] || []).push([[31405],{

/***/ 87960
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  assets: () => (/* binding */ assets),
  contentTitle: () => (/* binding */ contentTitle),
  "default": () => (/* binding */ MDXContent),
  frontMatter: () => (/* binding */ frontMatter),
  metadata: () => (/* reexport */ site_api_podman_desktop_namespaces_container_engine_functions_stats_container_md_f5f_namespaceObject),
  toc: () => (/* binding */ toc)
});

;// ./.docusaurus/docusaurus-plugin-content-docs/api/site-api-podman-desktop-namespaces-container-engine-functions-stats-container-md-f5f.json
const site_api_podman_desktop_namespaces_container_engine_functions_stats_container_md_f5f_namespaceObject = /*#__PURE__*/JSON.parse('{"id":"@podman-desktop/namespaces/containerEngine/functions/statsContainer","title":"Function: statsContainer()","description":"statsContainer(engineId, id, callback): Promise\\\\","source":"@site/api/@podman-desktop/namespaces/containerEngine/functions/statsContainer.md","sourceDirName":"@podman-desktop/namespaces/containerEngine/functions","slug":"/@podman-desktop/namespaces/containerEngine/functions/statsContainer","permalink":"/api/@podman-desktop/namespaces/containerEngine/functions/statsContainer","draft":false,"unlisted":false,"tags":[],"version":"current","frontMatter":{},"sidebar":"typedocSidebar","previous":{"title":"startPod","permalink":"/api/@podman-desktop/namespaces/containerEngine/functions/startPod"},"next":{"title":"stopContainer","permalink":"/api/@podman-desktop/namespaces/containerEngine/functions/stopContainer"}}');
// EXTERNAL MODULE: ../node_modules/react/jsx-runtime.js
var jsx_runtime = __webpack_require__(62540);
// EXTERNAL MODULE: ../node_modules/@mdx-js/react/lib/index.js
var lib = __webpack_require__(43023);
;// ./api/@podman-desktop/namespaces/containerEngine/functions/statsContainer.md


const frontMatter = {};
const contentTitle = 'Function: statsContainer()';

const assets = {

};



const toc = [{
  "value": "Parameters",
  "id": "parameters",
  "level": 2
}, {
  "value": "engineId",
  "id": "engineid",
  "level": 3
}, {
  "value": "id",
  "id": "id",
  "level": 3
}, {
  "value": "callback",
  "id": "callback",
  "level": 3
}, {
  "value": "Returns",
  "id": "returns",
  "level": 2
}, {
  "value": "Example",
  "id": "example",
  "level": 2
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
    p: "p",
    pre: "pre",
    strong: "strong",
    ...(0,lib/* useMDXComponents */.R)(),
    ...props.components
  };
  return (0,jsx_runtime.jsxs)(jsx_runtime.Fragment, {
    children: [(0,jsx_runtime.jsx)(_components.header, {
      children: (0,jsx_runtime.jsx)(_components.h1, {
        id: "function-statscontainer",
        children: "Function: statsContainer()"
      })
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.strong, {
          children: "statsContainer"
        }), "(", (0,jsx_runtime.jsx)(_components.code, {
          children: "engineId"
        }), ", ", (0,jsx_runtime.jsx)(_components.code, {
          children: "id"
        }), ", ", (0,jsx_runtime.jsx)(_components.code, {
          children: "callback"
        }), "): ", (0,jsx_runtime.jsx)(_components.code, {
          children: "Promise"
        }), "<", (0,jsx_runtime.jsx)(_components.a, {
          href: "/api/classes/Disposable",
          children: (0,jsx_runtime.jsx)(_components.code, {
            children: "Disposable"
          })
        }), ">"]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/3c4faf85cd0a21b28a3288faaf95151ae14c4281/packages/extension-api/src/extension-api.d.ts#L4062",
        children: "packages/extension-api/src/extension-api.d.ts:4062"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Get the streamed stats of a running container."
    }), "\n", (0,jsx_runtime.jsx)(_components.h2, {
      id: "parameters",
      children: "Parameters"
    }), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "engineid",
      children: "engineId"
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        children: "string"
      })
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["the id of the engine managing the container, obtained from the result of ", (0,jsx_runtime.jsx)(_components.a, {
        href: "/api/@podman-desktop/namespaces/containerEngine/functions/listContainers",
        children: "containerEngine.listContainers"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "id",
      children: "id"
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        children: "string"
      })
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["the id or name of the container on this engine, obtained from the result of ", (0,jsx_runtime.jsx)(_components.a, {
        href: "/api/@podman-desktop/namespaces/containerEngine/functions/listContainers",
        children: "containerEngine.listContainers"
      }), " or as the result of ", (0,jsx_runtime.jsx)(_components.a, {
        href: "/api/@podman-desktop/namespaces/containerEngine/functions/createContainer",
        children: "containerEngine.createContainer"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "callback",
      children: "callback"
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["(", (0,jsx_runtime.jsx)(_components.code, {
        children: "stats"
      }), ") => ", (0,jsx_runtime.jsx)(_components.code, {
        children: "void"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "the function called when container stats info are emitted."
    }), "\n", (0,jsx_runtime.jsx)(_components.h2, {
      id: "returns",
      children: "Returns"
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: [(0,jsx_runtime.jsx)(_components.code, {
        children: "Promise"
      }), "<", (0,jsx_runtime.jsx)(_components.a, {
        href: "/api/classes/Disposable",
        children: (0,jsx_runtime.jsx)(_components.code, {
          children: "Disposable"
        })
      }), ">"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["A Promise resolving a ", (0,jsx_runtime.jsx)(_components.a, {
        href: "/api/classes/Disposable",
        children: "Disposable"
      }), " that unregister the callback when called."]
    }), "\n", (0,jsx_runtime.jsx)(_components.h2, {
      id: "example",
      children: "Example"
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Here is a usage example"
    }), "\n", (0,jsx_runtime.jsx)(_components.pre, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        className: "language-ts",
        children: "const disposable = await statsContainer('engineId', 'containerId', (stats: ContainerStatsInfo): void => {\n console.log('CPU Usage', stats.cpu_stats.cpu_usage.total_usage);\n});\n\n// When no longer needed\ndisposable.dispose();\n"
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