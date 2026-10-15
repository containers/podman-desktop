"use strict";
(globalThis["webpackChunkdocs"] = globalThis["webpackChunkdocs"] || []).push([[5451],{

/***/ 77759
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  assets: () => (/* binding */ assets),
  contentTitle: () => (/* binding */ contentTitle),
  "default": () => (/* binding */ MDXContent),
  frontMatter: () => (/* binding */ frontMatter),
  metadata: () => (/* reexport */ site_api_interfaces_image_checker_provider_md_adc_namespaceObject),
  toc: () => (/* binding */ toc)
});

;// ./.docusaurus/docusaurus-plugin-content-docs/api/site-api-interfaces-image-checker-provider-md-adc.json
const site_api_interfaces_image_checker_provider_md_adc_namespaceObject = /*#__PURE__*/JSON.parse('{"id":"interfaces/ImageCheckerProvider","title":"Interface: ImageCheckerProvider","description":"Defined in5030","source":"@site/api/interfaces/ImageCheckerProvider.md","sourceDirName":"interfaces","slug":"/interfaces/ImageCheckerProvider","permalink":"/api/interfaces/ImageCheckerProvider","draft":false,"unlisted":false,"tags":[],"version":"current","frontMatter":{},"sidebar":"typedocSidebar","previous":{"title":"ImageCheck","permalink":"/api/interfaces/ImageCheck"},"next":{"title":"ImageCheckerProviderMetadata","permalink":"/api/interfaces/ImageCheckerProviderMetadata"}}');
// EXTERNAL MODULE: ../node_modules/react/jsx-runtime.js
var jsx_runtime = __webpack_require__(62540);
// EXTERNAL MODULE: ../node_modules/@mdx-js/react/lib/index.js
var lib = __webpack_require__(43023);
;// ./api/interfaces/ImageCheckerProvider.md


const frontMatter = {};
const contentTitle = 'Interface: ImageCheckerProvider';

const assets = {

};



const toc = [{
  "value": "Methods",
  "id": "methods",
  "level": 2
}, {
  "value": "check()",
  "id": "check",
  "level": 3
}, {
  "value": "Parameters",
  "id": "parameters",
  "level": 4
}, {
  "value": "image",
  "id": "image",
  "level": 5
}, {
  "value": "token?",
  "id": "token",
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
    p: "p",
    strong: "strong",
    ...(0,lib/* useMDXComponents */.R)(),
    ...props.components
  };
  return (0,jsx_runtime.jsxs)(jsx_runtime.Fragment, {
    children: [(0,jsx_runtime.jsx)(_components.header, {
      children: (0,jsx_runtime.jsx)(_components.h1, {
        id: "interface-imagecheckerprovider",
        children: "Interface: ImageCheckerProvider"
      })
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/fca3aa2f9360695cc7a49fecba349b4fb04d81c2/packages/extension-api/src/extension-api.d.ts#L5030",
        children: "packages/extension-api/src/extension-api.d.ts:5030"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Interface to be implemented by image checker providers"
    }), "\n", (0,jsx_runtime.jsx)(_components.h2, {
      id: "methods",
      children: "Methods"
    }), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "check",
      children: "check()"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.strong, {
          children: "check"
        }), "(", (0,jsx_runtime.jsx)(_components.code, {
          children: "image"
        }), ", ", (0,jsx_runtime.jsx)(_components.code, {
          children: "token?"
        }), "): ", (0,jsx_runtime.jsx)(_components.a, {
          href: "/api/type-aliases/ProviderResult",
          children: (0,jsx_runtime.jsx)(_components.code, {
            children: "ProviderResult"
          })
        }), "<", (0,jsx_runtime.jsx)(_components.a, {
          href: "/api/interfaces/ImageChecks",
          children: (0,jsx_runtime.jsx)(_components.code, {
            children: "ImageChecks"
          })
        }), ">"]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/fca3aa2f9360695cc7a49fecba349b4fb04d81c2/packages/extension-api/src/extension-api.d.ts#L5037",
        children: "packages/extension-api/src/extension-api.d.ts:5037"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "parameters",
      children: "Parameters"
    }), "\n", (0,jsx_runtime.jsx)(_components.h5, {
      id: "image",
      children: "image"
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: (0,jsx_runtime.jsx)(_components.a, {
        href: "/api/interfaces/ImageInfo",
        children: (0,jsx_runtime.jsx)(_components.code, {
          children: "ImageInfo"
        })
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Info about the image to analyze"
    }), "\n", (0,jsx_runtime.jsx)(_components.h5, {
      id: "token",
      children: "token?"
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: (0,jsx_runtime.jsx)(_components.a, {
        href: "/api/interfaces/CancellationToken",
        children: (0,jsx_runtime.jsx)(_components.code, {
          children: "CancellationToken"
        })
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "a cancellation token the function can use to be informed when the caller asks for the operation to be cancelled"
    }), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "returns",
      children: "Returns"
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: [(0,jsx_runtime.jsx)(_components.a, {
        href: "/api/type-aliases/ProviderResult",
        children: (0,jsx_runtime.jsx)(_components.code, {
          children: "ProviderResult"
        })
      }), "<", (0,jsx_runtime.jsx)(_components.a, {
        href: "/api/interfaces/ImageChecks",
        children: (0,jsx_runtime.jsx)(_components.code, {
          children: "ImageChecks"
        })
      }), ">"]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "the complete result of the analyze, either synchronously of through a Promise"
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