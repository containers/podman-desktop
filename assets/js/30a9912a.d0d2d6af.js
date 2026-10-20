"use strict";
(globalThis["webpackChunkdocs"] = globalThis["webpackChunkdocs"] || []).push([[16425],{

/***/ 89077
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  assets: () => (/* binding */ assets),
  contentTitle: () => (/* binding */ contentTitle),
  "default": () => (/* binding */ MDXContent),
  frontMatter: () => (/* binding */ frontMatter),
  metadata: () => (/* reexport */ site_api_interfaces_image_files_provider_md_30a_namespaceObject),
  toc: () => (/* binding */ toc)
});

;// ./.docusaurus/docusaurus-plugin-content-docs/api/site-api-interfaces-image-files-provider-md-30a.json
const site_api_interfaces_image_files_provider_md_30a_namespaceObject = /*#__PURE__*/JSON.parse('{"id":"interfaces/ImageFilesProvider","title":"Interface: ImageFilesProvider","description":"Defined in1024","source":"@site/api/interfaces/ImageFilesProvider.md","sourceDirName":"interfaces","slug":"/interfaces/ImageFilesProvider","permalink":"/api/interfaces/ImageFilesProvider","draft":false,"unlisted":false,"tags":[],"version":"current","frontMatter":{},"sidebar":"typedocSidebar","previous":{"title":"ImageFilesCallbacks","permalink":"/api/interfaces/ImageFilesCallbacks"},"next":{"title":"ImageFilesProviderMetadata","permalink":"/api/interfaces/ImageFilesProviderMetadata"}}');
// EXTERNAL MODULE: ../node_modules/react/jsx-runtime.js
var jsx_runtime = __webpack_require__(62540);
// EXTERNAL MODULE: ../node_modules/@mdx-js/react/lib/index.js
var lib = __webpack_require__(43023);
;// ./api/interfaces/ImageFilesProvider.md


const frontMatter = {};
const contentTitle = 'Interface: ImageFilesProvider';

const assets = {

};



const toc = [{
  "value": "Extends",
  "id": "extends",
  "level": 2
}, {
  "value": "Methods",
  "id": "methods",
  "level": 2
}, {
  "value": "addDirectory()",
  "id": "adddirectory",
  "level": 3
}, {
  "value": "Parameters",
  "id": "parameters",
  "level": 4
}, {
  "value": "layer",
  "id": "layer",
  "level": 5
}, {
  "value": "opts",
  "id": "opts",
  "level": 5
}, {
  "value": "mode",
  "id": "mode",
  "level": 6
}, {
  "value": "path",
  "id": "path",
  "level": 6
}, {
  "value": "Returns",
  "id": "returns",
  "level": 4
}, {
  "value": "addFile()",
  "id": "addfile",
  "level": 3
}, {
  "value": "Parameters",
  "id": "parameters-1",
  "level": 4
}, {
  "value": "layer",
  "id": "layer-1",
  "level": 5
}, {
  "value": "opts",
  "id": "opts-1",
  "level": 5
}, {
  "value": "mode",
  "id": "mode-1",
  "level": 6
}, {
  "value": "path",
  "id": "path-1",
  "level": 6
}, {
  "value": "size",
  "id": "size",
  "level": 6
}, {
  "value": "Returns",
  "id": "returns-1",
  "level": 4
}, {
  "value": "addOpaqueWhiteout()",
  "id": "addopaquewhiteout",
  "level": 3
}, {
  "value": "Parameters",
  "id": "parameters-2",
  "level": 4
}, {
  "value": "layer",
  "id": "layer-2",
  "level": 5
}, {
  "value": "path",
  "id": "path-2",
  "level": 5
}, {
  "value": "Returns",
  "id": "returns-2",
  "level": 4
}, {
  "value": "addSymlink()",
  "id": "addsymlink",
  "level": 3
}, {
  "value": "Parameters",
  "id": "parameters-3",
  "level": 4
}, {
  "value": "layer",
  "id": "layer-3",
  "level": 5
}, {
  "value": "opts",
  "id": "opts-2",
  "level": 5
}, {
  "value": "linkPath",
  "id": "linkpath",
  "level": 6
}, {
  "value": "mode",
  "id": "mode-2",
  "level": 6
}, {
  "value": "path",
  "id": "path-3",
  "level": 6
}, {
  "value": "Returns",
  "id": "returns-3",
  "level": 4
}, {
  "value": "addWhiteout()",
  "id": "addwhiteout",
  "level": 3
}, {
  "value": "Parameters",
  "id": "parameters-4",
  "level": 4
}, {
  "value": "layer",
  "id": "layer-4",
  "level": 5
}, {
  "value": "path",
  "id": "path-4",
  "level": 5
}, {
  "value": "Returns",
  "id": "returns-4",
  "level": 4
}, {
  "value": "dispose()",
  "id": "dispose",
  "level": 3
}, {
  "value": "Returns",
  "id": "returns-5",
  "level": 4
}, {
  "value": "Inherited from",
  "id": "inherited-from",
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
    h6: "h6",
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
        id: "interface-imagefilesprovider",
        children: "Interface: ImageFilesProvider"
      })
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/e7cf46b1cce9d95c73effcba926d40af1243e1d7/packages/extension-api/src/extension-api.d.ts#L1024",
        children: "packages/extension-api/src/extension-api.d.ts:1024"
      })]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Provider returned to the extension when calling createImageFilesProvider\nProvides helper functions for building the response of the ", (0,jsx_runtime.jsx)(_components.code, {
        children: "createImageFilesProvider"
      }), " callback"]
    }), "\n", (0,jsx_runtime.jsx)(_components.h2, {
      id: "extends",
      children: "Extends"
    }), "\n", (0,jsx_runtime.jsxs)(_components.ul, {
      children: ["\n", (0,jsx_runtime.jsx)(_components.li, {
        children: (0,jsx_runtime.jsx)(_components.a, {
          href: "/api/classes/Disposable",
          children: (0,jsx_runtime.jsx)(_components.code, {
            children: "Disposable"
          })
        })
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsx)(_components.h2, {
      id: "methods",
      children: "Methods"
    }), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "adddirectory",
      children: "addDirectory()"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.strong, {
          children: "addDirectory"
        }), "(", (0,jsx_runtime.jsx)(_components.code, {
          children: "layer"
        }), ", ", (0,jsx_runtime.jsx)(_components.code, {
          children: "opts"
        }), "): ", (0,jsx_runtime.jsx)(_components.code, {
          children: "ImageFilesProvider"
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/e7cf46b1cce9d95c73effcba926d40af1243e1d7/packages/extension-api/src/extension-api.d.ts#L1032",
        children: "packages/extension-api/src/extension-api.d.ts:1032"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "add a directory to the layer"
    }), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "parameters",
      children: "Parameters"
    }), "\n", (0,jsx_runtime.jsx)(_components.h5, {
      id: "layer",
      children: "layer"
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: (0,jsx_runtime.jsx)(_components.a, {
        href: "/api/interfaces/ImageFilesystemLayer",
        children: (0,jsx_runtime.jsx)(_components.code, {
          children: "ImageFilesystemLayer"
        })
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.h5, {
      id: "opts",
      children: "opts"
    }), "\n", (0,jsx_runtime.jsx)(_components.h6, {
      id: "mode",
      children: "mode"
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        children: "number"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.h6, {
      id: "path",
      children: "path"
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        children: "string"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "returns",
      children: "Returns"
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        children: "ImageFilesProvider"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "addfile",
      children: "addFile()"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.strong, {
          children: "addFile"
        }), "(", (0,jsx_runtime.jsx)(_components.code, {
          children: "layer"
        }), ", ", (0,jsx_runtime.jsx)(_components.code, {
          children: "opts"
        }), "): ", (0,jsx_runtime.jsx)(_components.code, {
          children: "ImageFilesProvider"
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/e7cf46b1cce9d95c73effcba926d40af1243e1d7/packages/extension-api/src/extension-api.d.ts#L1028",
        children: "packages/extension-api/src/extension-api.d.ts:1028"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "add a file to the layer"
    }), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "parameters-1",
      children: "Parameters"
    }), "\n", (0,jsx_runtime.jsx)(_components.h5, {
      id: "layer-1",
      children: "layer"
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: (0,jsx_runtime.jsx)(_components.a, {
        href: "/api/interfaces/ImageFilesystemLayer",
        children: (0,jsx_runtime.jsx)(_components.code, {
          children: "ImageFilesystemLayer"
        })
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.h5, {
      id: "opts-1",
      children: "opts"
    }), "\n", (0,jsx_runtime.jsx)(_components.h6, {
      id: "mode-1",
      children: "mode"
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        children: "number"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.h6, {
      id: "path-1",
      children: "path"
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        children: "string"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.h6, {
      id: "size",
      children: "size"
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        children: "number"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "returns-1",
      children: "Returns"
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        children: "ImageFilesProvider"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "addopaquewhiteout",
      children: "addOpaqueWhiteout()"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.strong, {
          children: "addOpaqueWhiteout"
        }), "(", (0,jsx_runtime.jsx)(_components.code, {
          children: "layer"
        }), ", ", (0,jsx_runtime.jsx)(_components.code, {
          children: "path"
        }), "): ", (0,jsx_runtime.jsx)(_components.code, {
          children: "ImageFilesProvider"
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/e7cf46b1cce9d95c73effcba926d40af1243e1d7/packages/extension-api/src/extension-api.d.ts#L1046",
        children: "packages/extension-api/src/extension-api.d.ts:1046"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "add a complete directory to remove from previous layers"
    }), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "parameters-2",
      children: "Parameters"
    }), "\n", (0,jsx_runtime.jsx)(_components.h5, {
      id: "layer-2",
      children: "layer"
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: (0,jsx_runtime.jsx)(_components.a, {
        href: "/api/interfaces/ImageFilesystemLayer",
        children: (0,jsx_runtime.jsx)(_components.code, {
          children: "ImageFilesystemLayer"
        })
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.h5, {
      id: "path-2",
      children: "path"
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        children: "string"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "returns-2",
      children: "Returns"
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        children: "ImageFilesProvider"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "addsymlink",
      children: "addSymlink()"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.strong, {
          children: "addSymlink"
        }), "(", (0,jsx_runtime.jsx)(_components.code, {
          children: "layer"
        }), ", ", (0,jsx_runtime.jsx)(_components.code, {
          children: "opts"
        }), "): ", (0,jsx_runtime.jsx)(_components.code, {
          children: "ImageFilesProvider"
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/e7cf46b1cce9d95c73effcba926d40af1243e1d7/packages/extension-api/src/extension-api.d.ts#L1036",
        children: "packages/extension-api/src/extension-api.d.ts:1036"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "add a symbolic link to the layer"
    }), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "parameters-3",
      children: "Parameters"
    }), "\n", (0,jsx_runtime.jsx)(_components.h5, {
      id: "layer-3",
      children: "layer"
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: (0,jsx_runtime.jsx)(_components.a, {
        href: "/api/interfaces/ImageFilesystemLayer",
        children: (0,jsx_runtime.jsx)(_components.code, {
          children: "ImageFilesystemLayer"
        })
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.h5, {
      id: "opts-2",
      children: "opts"
    }), "\n", (0,jsx_runtime.jsx)(_components.h6, {
      id: "linkpath",
      children: "linkPath"
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        children: "string"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.h6, {
      id: "mode-2",
      children: "mode"
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        children: "number"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.h6, {
      id: "path-3",
      children: "path"
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        children: "string"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "returns-3",
      children: "Returns"
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        children: "ImageFilesProvider"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "addwhiteout",
      children: "addWhiteout()"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.strong, {
          children: "addWhiteout"
        }), "(", (0,jsx_runtime.jsx)(_components.code, {
          children: "layer"
        }), ", ", (0,jsx_runtime.jsx)(_components.code, {
          children: "path"
        }), "): ", (0,jsx_runtime.jsx)(_components.code, {
          children: "ImageFilesProvider"
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/e7cf46b1cce9d95c73effcba926d40af1243e1d7/packages/extension-api/src/extension-api.d.ts#L1041",
        children: "packages/extension-api/src/extension-api.d.ts:1041"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "add a file or directory to remove from previous layers"
    }), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "parameters-4",
      children: "Parameters"
    }), "\n", (0,jsx_runtime.jsx)(_components.h5, {
      id: "layer-4",
      children: "layer"
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: (0,jsx_runtime.jsx)(_components.a, {
        href: "/api/interfaces/ImageFilesystemLayer",
        children: (0,jsx_runtime.jsx)(_components.code, {
          children: "ImageFilesystemLayer"
        })
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.h5, {
      id: "path-4",
      children: "path"
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        children: "string"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "returns-4",
      children: "Returns"
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        children: "ImageFilesProvider"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "dispose",
      children: "dispose()"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.strong, {
          children: "dispose"
        }), "(): ", (0,jsx_runtime.jsx)(_components.code, {
          children: "void"
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/e7cf46b1cce9d95c73effcba926d40af1243e1d7/packages/extension-api/src/extension-api.d.ts#L108",
        children: "packages/extension-api/src/extension-api.d.ts:108"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Dispose this object."
    }), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "returns-5",
      children: "Returns"
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        children: "void"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "inherited-from",
      children: "Inherited from"
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: [(0,jsx_runtime.jsx)(_components.a, {
        href: "/api/classes/Disposable",
        children: (0,jsx_runtime.jsx)(_components.code, {
          children: "Disposable"
        })
      }), ".", (0,jsx_runtime.jsx)(_components.a, {
        href: "/api/classes/Disposable#dispose",
        children: (0,jsx_runtime.jsx)(_components.code, {
          children: "dispose"
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