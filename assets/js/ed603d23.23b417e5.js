"use strict";
(globalThis["webpackChunkdocs"] = globalThis["webpackChunkdocs"] || []).push([[31502],{

/***/ 49356
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  assets: () => (/* binding */ assets),
  contentTitle: () => (/* binding */ contentTitle),
  "default": () => (/* binding */ MDXContent),
  frontMatter: () => (/* binding */ frontMatter),
  metadata: () => (/* reexport */ site_api_interfaces_kubernetes_generator_provider_md_ed6_namespaceObject),
  toc: () => (/* binding */ toc)
});

;// ./.docusaurus/docusaurus-plugin-content-docs/api/site-api-interfaces-kubernetes-generator-provider-md-ed6.json
const site_api_interfaces_kubernetes_generator_provider_md_ed6_namespaceObject = /*#__PURE__*/JSON.parse('{"id":"interfaces/KubernetesGeneratorProvider","title":"Interface: KubernetesGeneratorProvider","description":"Defined in2513","source":"@site/api/interfaces/KubernetesGeneratorProvider.md","sourceDirName":"interfaces","slug":"/interfaces/KubernetesGeneratorProvider","permalink":"/api/interfaces/KubernetesGeneratorProvider","draft":false,"unlisted":false,"tags":[],"version":"current","frontMatter":{},"sidebar":"typedocSidebar","previous":{"title":"KubeconfigUpdateEvent","permalink":"/api/interfaces/KubeconfigUpdateEvent"},"next":{"title":"KubernetesProviderConnection","permalink":"/api/interfaces/KubernetesProviderConnection"}}');
// EXTERNAL MODULE: ../node_modules/react/jsx-runtime.js
var jsx_runtime = __webpack_require__(62540);
// EXTERNAL MODULE: ../node_modules/@mdx-js/react/lib/index.js
var lib = __webpack_require__(43023);
;// ./api/interfaces/KubernetesGeneratorProvider.md


const frontMatter = {};
const contentTitle = 'Interface: KubernetesGeneratorProvider';

const assets = {

};



const toc = [{
  "value": "Properties",
  "id": "properties",
  "level": 2
}, {
  "value": "name",
  "id": "name",
  "level": 3
}, {
  "value": "types",
  "id": "types",
  "level": 3
}, {
  "value": "Methods",
  "id": "methods",
  "level": 2
}, {
  "value": "generate()",
  "id": "generate",
  "level": 3
}, {
  "value": "Parameters",
  "id": "parameters",
  "level": 4
}, {
  "value": "kubernetesGeneratorArguments",
  "id": "kubernetesgeneratorarguments",
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
        id: "interface-kubernetesgeneratorprovider",
        children: "Interface: KubernetesGeneratorProvider"
      })
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/11b3dada6a91c7d34c20f0c83ff25becdbcbd003/packages/extension-api/src/extension-api.d.ts#L2513",
        children: "packages/extension-api/src/extension-api.d.ts:2513"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "The KubernetesGeneratorProvider allows an extension to register a custom Kube Generator for a specific\nKubernetesGeneratorType."
    }), "\n", (0,jsx_runtime.jsx)(_components.h2, {
      id: "properties",
      children: "Properties"
    }), "\n", (0,jsx_runtime.jsx)(_components.h3, {
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
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/11b3dada6a91c7d34c20f0c83ff25becdbcbd003/packages/extension-api/src/extension-api.d.ts#L2514",
        children: "packages/extension-api/src/extension-api.d.ts:2514"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "types",
      children: "types"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.strong, {
          children: "types"
        }), ": ", (0,jsx_runtime.jsx)(_components.a, {
          href: "/api/type-aliases/KubernetesGeneratorSelector",
          children: (0,jsx_runtime.jsx)(_components.code, {
            children: "KubernetesGeneratorSelector"
          })
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/11b3dada6a91c7d34c20f0c83ff25becdbcbd003/packages/extension-api/src/extension-api.d.ts#L2515",
        children: "packages/extension-api/src/extension-api.d.ts:2515"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.h2, {
      id: "methods",
      children: "Methods"
    }), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "generate",
      children: "generate()"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.strong, {
          children: "generate"
        }), "(", (0,jsx_runtime.jsx)(_components.code, {
          children: "kubernetesGeneratorArguments"
        }), "): ", (0,jsx_runtime.jsx)(_components.code, {
          children: "Promise"
        }), "<", (0,jsx_runtime.jsx)(_components.a, {
          href: "/api/interfaces/GenerateKubeResult",
          children: (0,jsx_runtime.jsx)(_components.code, {
            children: "GenerateKubeResult"
          })
        }), ">"]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/11b3dada6a91c7d34c20f0c83ff25becdbcbd003/packages/extension-api/src/extension-api.d.ts#L2516",
        children: "packages/extension-api/src/extension-api.d.ts:2516"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "parameters",
      children: "Parameters"
    }), "\n", (0,jsx_runtime.jsx)(_components.h5, {
      id: "kubernetesgeneratorarguments",
      children: "kubernetesGeneratorArguments"
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: [(0,jsx_runtime.jsx)(_components.a, {
        href: "/api/type-aliases/KubernetesGeneratorArgument",
        children: (0,jsx_runtime.jsx)(_components.code, {
          children: "KubernetesGeneratorArgument"
        })
      }), "[]"]
    }), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "returns",
      children: "Returns"
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: [(0,jsx_runtime.jsx)(_components.code, {
        children: "Promise"
      }), "<", (0,jsx_runtime.jsx)(_components.a, {
        href: "/api/interfaces/GenerateKubeResult",
        children: (0,jsx_runtime.jsx)(_components.code, {
          children: "GenerateKubeResult"
        })
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