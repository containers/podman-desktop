"use strict";
(globalThis["webpackChunkdocs"] = globalThis["webpackChunkdocs"] || []).push([[59447],{

/***/ 13575
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  assets: () => (/* binding */ assets),
  contentTitle: () => (/* binding */ contentTitle),
  "default": () => (/* binding */ MDXContent),
  frontMatter: () => (/* binding */ frontMatter),
  metadata: () => (/* reexport */ site_api_podman_desktop_namespaces_image_checker_functions_register_image_checker_provider_md_78a_namespaceObject),
  toc: () => (/* binding */ toc)
});

;// ./.docusaurus/docusaurus-plugin-content-docs/api/site-api-podman-desktop-namespaces-image-checker-functions-register-image-checker-provider-md-78a.json
const site_api_podman_desktop_namespaces_image_checker_functions_register_image_checker_provider_md_78a_namespaceObject = /*#__PURE__*/JSON.parse('{"id":"@podman-desktop/namespaces/imageChecker/functions/registerImageCheckerProvider","title":"Function: registerImageCheckerProvider()","description":"registerImageCheckerProvider(imageCheckerProvider, metadata?): Disposable","source":"@site/api/@podman-desktop/namespaces/imageChecker/functions/registerImageCheckerProvider.md","sourceDirName":"@podman-desktop/namespaces/imageChecker/functions","slug":"/@podman-desktop/namespaces/imageChecker/functions/registerImageCheckerProvider","permalink":"/api/@podman-desktop/namespaces/imageChecker/functions/registerImageCheckerProvider","draft":false,"unlisted":false,"tags":[],"version":"current","frontMatter":{},"sidebar":"typedocSidebar","previous":{"title":"imageChecker","permalink":"/api/@podman-desktop/namespaces/imageChecker/"},"next":{"title":"kubernetes","permalink":"/api/@podman-desktop/namespaces/kubernetes/"}}');
// EXTERNAL MODULE: ../node_modules/react/jsx-runtime.js
var jsx_runtime = __webpack_require__(62540);
// EXTERNAL MODULE: ../node_modules/@mdx-js/react/lib/index.js
var lib = __webpack_require__(43023);
;// ./api/@podman-desktop/namespaces/imageChecker/functions/registerImageCheckerProvider.md


const frontMatter = {};
const contentTitle = 'Function: registerImageCheckerProvider()';

const assets = {

};



const toc = [{
  "value": "Parameters",
  "id": "parameters",
  "level": 2
}, {
  "value": "imageCheckerProvider",
  "id": "imagecheckerprovider",
  "level": 3
}, {
  "value": "metadata?",
  "id": "metadata",
  "level": 3
}, {
  "value": "Returns",
  "id": "returns",
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
    strong: "strong",
    ...(0,lib/* useMDXComponents */.R)(),
    ...props.components
  };
  return (0,jsx_runtime.jsxs)(jsx_runtime.Fragment, {
    children: [(0,jsx_runtime.jsx)(_components.header, {
      children: (0,jsx_runtime.jsx)(_components.h1, {
        id: "function-registerimagecheckerprovider",
        children: "Function: registerImageCheckerProvider()"
      })
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.strong, {
          children: "registerImageCheckerProvider"
        }), "(", (0,jsx_runtime.jsx)(_components.code, {
          children: "imageCheckerProvider"
        }), ", ", (0,jsx_runtime.jsx)(_components.code, {
          children: "metadata?"
        }), "): ", (0,jsx_runtime.jsx)(_components.a, {
          href: "/api/classes/Disposable",
          children: (0,jsx_runtime.jsx)(_components.code, {
            children: "Disposable"
          })
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/9b30c36d4197786d953f1552c9c2fdf2475942c7/packages/extension-api/src/extension-api.d.ts#L5062",
        children: "packages/extension-api/src/extension-api.d.ts:5062"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Register the extension as an Image Checker."
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "As an image checker, a provider needs to implement a specific interface, so the core\napplication can call the provider with specific tasks when necessary."
    }), "\n", (0,jsx_runtime.jsx)(_components.h2, {
      id: "parameters",
      children: "Parameters"
    }), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "imagecheckerprovider",
      children: "imageCheckerProvider"
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: (0,jsx_runtime.jsx)(_components.a, {
        href: "/api/interfaces/ImageCheckerProvider",
        children: (0,jsx_runtime.jsx)(_components.code, {
          children: "ImageCheckerProvider"
        })
      })
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["an object implementing the ", (0,jsx_runtime.jsx)(_components.code, {
        children: "ImageCheckerProvider"
      }), " interface"]
    }), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "metadata",
      children: "metadata?"
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: (0,jsx_runtime.jsx)(_components.a, {
        href: "/api/interfaces/ImageCheckerProviderMetadata",
        children: (0,jsx_runtime.jsx)(_components.code, {
          children: "ImageCheckerProviderMetadata"
        })
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "optional metadata attached to this provider"
    }), "\n", (0,jsx_runtime.jsx)(_components.h2, {
      id: "returns",
      children: "Returns"
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: (0,jsx_runtime.jsx)(_components.a, {
        href: "/api/classes/Disposable",
        children: (0,jsx_runtime.jsx)(_components.code, {
          children: "Disposable"
        })
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "A disposable that unregisters this provider when being disposed"
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