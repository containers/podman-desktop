"use strict";
(globalThis["webpackChunkdocs"] = globalThis["webpackChunkdocs"] || []).push([[16115],{

/***/ 97623
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  assets: () => (/* binding */ assets),
  contentTitle: () => (/* binding */ contentTitle),
  "default": () => (/* binding */ MDXContent),
  frontMatter: () => (/* binding */ frontMatter),
  metadata: () => (/* reexport */ site_api_type_aliases_provider_result_md_22e_namespaceObject),
  toc: () => (/* binding */ toc)
});

;// ./.docusaurus/docusaurus-plugin-content-docs/api/site-api-type-aliases-provider-result-md-22e.json
const site_api_type_aliases_provider_result_md_22e_namespaceObject = /*#__PURE__*/JSON.parse('{"id":"type-aliases/ProviderResult","title":"Type Alias: ProviderResult\\\\<T\\\\>","description":"ProviderResult\\\\ = T \\\\| undefined \\\\| Promise\\\\","source":"@site/api/type-aliases/ProviderResult.md","sourceDirName":"type-aliases","slug":"/type-aliases/ProviderResult","permalink":"/api/type-aliases/ProviderResult","draft":false,"unlisted":false,"tags":[],"version":"current","frontMatter":{},"sidebar":"typedocSidebar","previous":{"title":"ProviderLinks","permalink":"/api/type-aliases/ProviderLinks"},"next":{"title":"ProviderStatus","permalink":"/api/type-aliases/ProviderStatus"}}');
// EXTERNAL MODULE: ../node_modules/react/jsx-runtime.js
var jsx_runtime = __webpack_require__(62540);
// EXTERNAL MODULE: ../node_modules/@mdx-js/react/lib/index.js
var lib = __webpack_require__(43023);
;// ./api/type-aliases/ProviderResult.md


const frontMatter = {};
const contentTitle = 'Type Alias: ProviderResult<T>';

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
        id: "type-alias-providerresultt",
        children: "Type Alias: ProviderResult<T>"
      })
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.strong, {
          children: "ProviderResult"
        }), "<", (0,jsx_runtime.jsx)(_components.code, {
          children: "T"
        }), "> = ", (0,jsx_runtime.jsx)(_components.code, {
          children: "T"
        }), " | ", (0,jsx_runtime.jsx)(_components.code, {
          children: "undefined"
        }), " | ", (0,jsx_runtime.jsx)(_components.code, {
          children: "Promise"
        }), "<", (0,jsx_runtime.jsx)(_components.code, {
          children: "T"
        }), " | ", (0,jsx_runtime.jsx)(_components.code, {
          children: "undefined"
        }), ">"]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/e2548979c7e953e1419312e49836407008d44c21/packages/extension-api/src/extension-api.d.ts#L312",
        children: "packages/extension-api/src/extension-api.d.ts:312"
      })]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["A provider result represents the values a provider, like the ", (0,jsx_runtime.jsx)(_components.a, {
        href: "/api/interfaces/ImageCheckerProvider",
        children: (0,jsx_runtime.jsx)(_components.code, {
          children: "ImageCheckerProvider"
        })
      }), ",\nmay return. For once this is the actual result type ", (0,jsx_runtime.jsx)(_components.code, {
        children: "T"
      }), ", like ", (0,jsx_runtime.jsx)(_components.code, {
        children: "ImageChecks"
      }), ", or a Promise that resolves\nto that type ", (0,jsx_runtime.jsx)(_components.code, {
        children: "T"
      }), ". In addition, ", (0,jsx_runtime.jsx)(_components.code, {
        children: "null"
      }), " and ", (0,jsx_runtime.jsx)(_components.code, {
        children: "undefined"
      }), " can be returned - either directly or from a\nPromise."]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["The snippets below are all valid implementations of the ", (0,jsx_runtime.jsx)(_components.a, {
        href: "/api/interfaces/ImageCheckerProvider",
        children: (0,jsx_runtime.jsx)(_components.code, {
          children: "ImageCheckerProvider"
        })
      }), ":"]
    }), "\n", (0,jsx_runtime.jsx)(_components.pre, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        className: "language-ts",
        children: "let a: ImageCheckerProvider = {\n check(image: ImageInfo, token?: CancellationToken): ProviderResult<ImageChecks> {\n   return new ImageChecks();\n }\n\nlet b: ImageCheckerProvider = {\n async check(image: ImageInfo, token?: CancellationToken): ProviderResult<ImageChecks> {\n\t\treturn new ImageChecks();\n\t}\n}\n\nlet c: ImageCheckerProvider = {\n check(image: ImageInfo, token?: CancellationToken): ProviderResult<ImageChecks> {\n\t\treturn; // undefined\n\t}\n}\n"
      })
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