"use strict";
(globalThis["webpackChunkdocs"] = globalThis["webpackChunkdocs"] || []).push([[49524],{

/***/ 44031
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  assets: () => (/* binding */ assets),
  contentTitle: () => (/* binding */ contentTitle),
  "default": () => (/* binding */ MDXContent),
  frontMatter: () => (/* binding */ frontMatter),
  metadata: () => (/* reexport */ site_api_podman_desktop_namespaces_container_engine_functions_push_image_md_614_namespaceObject),
  toc: () => (/* binding */ toc)
});

;// ./.docusaurus/docusaurus-plugin-content-docs/api/site-api-podman-desktop-namespaces-container-engine-functions-push-image-md-614.json
const site_api_podman_desktop_namespaces_container_engine_functions_push_image_md_614_namespaceObject = /*#__PURE__*/JSON.parse('{"id":"@podman-desktop/namespaces/containerEngine/functions/pushImage","title":"Function: pushImage()","description":"pushImage(engineId, imageId, callback, authInfo?): Promise\\\\","source":"@site/api/@podman-desktop/namespaces/containerEngine/functions/pushImage.md","sourceDirName":"@podman-desktop/namespaces/containerEngine/functions","slug":"/@podman-desktop/namespaces/containerEngine/functions/pushImage","permalink":"/api/@podman-desktop/namespaces/containerEngine/functions/pushImage","draft":false,"unlisted":false,"tags":[],"version":"current","frontMatter":{},"sidebar":"typedocSidebar","previous":{"title":"pullImage","permalink":"/api/@podman-desktop/namespaces/containerEngine/functions/pullImage"},"next":{"title":"pushManifest","permalink":"/api/@podman-desktop/namespaces/containerEngine/functions/pushManifest"}}');
// EXTERNAL MODULE: ../node_modules/react/jsx-runtime.js
var jsx_runtime = __webpack_require__(62540);
// EXTERNAL MODULE: ../node_modules/@mdx-js/react/lib/index.js
var lib = __webpack_require__(43023);
;// ./api/@podman-desktop/namespaces/containerEngine/functions/pushImage.md


const frontMatter = {};
const contentTitle = 'Function: pushImage()';

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
  "value": "imageId",
  "id": "imageid",
  "level": 3
}, {
  "value": "callback",
  "id": "callback",
  "level": 3
}, {
  "value": "authInfo?",
  "id": "authinfo",
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
        id: "function-pushimage",
        children: "Function: pushImage()"
      })
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.strong, {
          children: "pushImage"
        }), "(", (0,jsx_runtime.jsx)(_components.code, {
          children: "engineId"
        }), ", ", (0,jsx_runtime.jsx)(_components.code, {
          children: "imageId"
        }), ", ", (0,jsx_runtime.jsx)(_components.code, {
          children: "callback"
        }), ", ", (0,jsx_runtime.jsx)(_components.code, {
          children: "authInfo?"
        }), "): ", (0,jsx_runtime.jsx)(_components.code, {
          children: "Promise"
        }), "<", (0,jsx_runtime.jsx)(_components.code, {
          children: "void"
        }), ">"]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/67f78c387a02301536248eb9cf13a51bc904047e/packages/extension-api/src/extension-api.d.ts#L4146",
        children: "packages/extension-api/src/extension-api.d.ts:4146"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Push an image to a registry."
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["If you wish to push an image on to a private registry, that image must already have a tag which references the registry. For example, ", (0,jsx_runtime.jsx)(_components.code, {
        children: "registry.example.com/myimage:latest"
      }), "."]
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
      children: ["the id of the engine managing the image, obtained from the result of ", (0,jsx_runtime.jsx)(_components.a, {
        href: "/api/@podman-desktop/namespaces/containerEngine/functions/listImages",
        children: "containerEngine.listImages"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "imageid",
      children: "imageId"
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        children: "string"
      })
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["the id of the image on this engine, obtained from the result of ", (0,jsx_runtime.jsx)(_components.a, {
        href: "/api/@podman-desktop/namespaces/containerEngine/functions/listImages",
        children: "containerEngine.listImages"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "callback",
      children: "callback"
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["(", (0,jsx_runtime.jsx)(_components.code, {
        children: "name"
      }), ", ", (0,jsx_runtime.jsx)(_components.code, {
        children: "data"
      }), ") => ", (0,jsx_runtime.jsx)(_components.code, {
        children: "void"
      })]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["the function called when new logs are emitted or new events happen on the stream. The value of ", (0,jsx_runtime.jsx)(_components.code, {
        children: "name"
      }), " can be either ", (0,jsx_runtime.jsx)(_components.code, {
        children: "data"
      }), "(and ", (0,jsx_runtime.jsx)(_components.code, {
        children: "data"
      }), " contains the logs), or ", (0,jsx_runtime.jsx)(_components.code, {
        children: "end"
      }), " indicating the end of the stream, or ", (0,jsx_runtime.jsx)(_components.code, {
        children: "first-message"
      }), " indicating no data has been emitted yet on the stream."]
    }), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "authinfo",
      children: "authInfo?"
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: (0,jsx_runtime.jsx)(_components.a, {
        href: "/api/interfaces/ContainerAuthInfo",
        children: (0,jsx_runtime.jsx)(_components.code, {
          children: "ContainerAuthInfo"
        })
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Authentication credentials"
    }), "\n", (0,jsx_runtime.jsx)(_components.h2, {
      id: "returns",
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