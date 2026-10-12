"use strict";
(globalThis["webpackChunkdocs"] = globalThis["webpackChunkdocs"] || []).push([[6121],{

/***/ 21132
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  assets: () => (/* binding */ assets),
  contentTitle: () => (/* binding */ contentTitle),
  "default": () => (/* binding */ MDXContent),
  frontMatter: () => (/* binding */ frontMatter),
  metadata: () => (/* reexport */ site_api_interfaces_image_file_md_d83_namespaceObject),
  toc: () => (/* binding */ toc)
});

;// ./.docusaurus/docusaurus-plugin-content-docs/api/site-api-interfaces-image-file-md-d83.json
const site_api_interfaces_image_file_md_d83_namespaceObject = /*#__PURE__*/JSON.parse('{"id":"interfaces/ImageFile","title":"Interface: ImageFile","description":"Defined in952","source":"@site/api/interfaces/ImageFile.md","sourceDirName":"interfaces","slug":"/interfaces/ImageFile","permalink":"/api/interfaces/ImageFile","draft":false,"unlisted":false,"tags":[],"version":"current","frontMatter":{},"sidebar":"typedocSidebar","previous":{"title":"ImageChecks","permalink":"/api/interfaces/ImageChecks"},"next":{"title":"ImageFilesCallbacks","permalink":"/api/interfaces/ImageFilesCallbacks"}}');
// EXTERNAL MODULE: ../node_modules/react/jsx-runtime.js
var jsx_runtime = __webpack_require__(62540);
// EXTERNAL MODULE: ../node_modules/@mdx-js/react/lib/index.js
var lib = __webpack_require__(43023);
;// ./api/interfaces/ImageFile.md


const frontMatter = {};
const contentTitle = 'Interface: ImageFile';

const assets = {

};



const toc = [{
  "value": "Extended by",
  "id": "extended-by",
  "level": 2
}, {
  "value": "Properties",
  "id": "properties",
  "level": 2
}, {
  "value": "atime",
  "id": "atime",
  "level": 3
}, {
  "value": "ctime",
  "id": "ctime",
  "level": 3
}, {
  "value": "gid",
  "id": "gid",
  "level": 3
}, {
  "value": "mode",
  "id": "mode",
  "level": 3
}, {
  "value": "mtime",
  "id": "mtime",
  "level": 3
}, {
  "value": "path",
  "id": "path",
  "level": 3
}, {
  "value": "size",
  "id": "size",
  "level": 3
}, {
  "value": "type",
  "id": "type",
  "level": 3
}, {
  "value": "uid",
  "id": "uid",
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
        id: "interface-imagefile",
        children: "Interface: ImageFile"
      })
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/11b3dada6a91c7d34c20f0c83ff25becdbcbd003/packages/extension-api/src/extension-api.d.ts#L952",
        children: "packages/extension-api/src/extension-api.d.ts:952"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "the description of a file in an image filesystem layer"
    }), "\n", (0,jsx_runtime.jsx)(_components.h2, {
      id: "extended-by",
      children: "Extended by"
    }), "\n", (0,jsx_runtime.jsxs)(_components.ul, {
      children: ["\n", (0,jsx_runtime.jsx)(_components.li, {
        children: (0,jsx_runtime.jsx)(_components.a, {
          href: "/api/interfaces/ImageFileSymlink",
          children: (0,jsx_runtime.jsx)(_components.code, {
            children: "ImageFileSymlink"
          })
        })
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsx)(_components.h2, {
      id: "properties",
      children: "Properties"
    }), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "atime",
      children: "atime"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.strong, {
          children: "atime"
        }), ": ", (0,jsx_runtime.jsx)(_components.code, {
          children: "Date"
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/11b3dada6a91c7d34c20f0c83ff25becdbcbd003/packages/extension-api/src/extension-api.d.ts#L961",
        children: "packages/extension-api/src/extension-api.d.ts:961"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "ctime",
      children: "ctime"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.strong, {
          children: "ctime"
        }), ": ", (0,jsx_runtime.jsx)(_components.code, {
          children: "Date"
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/11b3dada6a91c7d34c20f0c83ff25becdbcbd003/packages/extension-api/src/extension-api.d.ts#L960",
        children: "packages/extension-api/src/extension-api.d.ts:960"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "gid",
      children: "gid"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.strong, {
          children: "gid"
        }), ": ", (0,jsx_runtime.jsx)(_components.code, {
          children: "number"
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/11b3dada6a91c7d34c20f0c83ff25becdbcbd003/packages/extension-api/src/extension-api.d.ts#L958",
        children: "packages/extension-api/src/extension-api.d.ts:958"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "mode",
      children: "mode"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.strong, {
          children: "mode"
        }), ": ", (0,jsx_runtime.jsx)(_components.code, {
          children: "number"
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/11b3dada6a91c7d34c20f0c83ff25becdbcbd003/packages/extension-api/src/extension-api.d.ts#L956",
        children: "packages/extension-api/src/extension-api.d.ts:956"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "mtime",
      children: "mtime"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.strong, {
          children: "mtime"
        }), ": ", (0,jsx_runtime.jsx)(_components.code, {
          children: "Date"
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/11b3dada6a91c7d34c20f0c83ff25becdbcbd003/packages/extension-api/src/extension-api.d.ts#L962",
        children: "packages/extension-api/src/extension-api.d.ts:962"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "path",
      children: "path"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.strong, {
          children: "path"
        }), ": ", (0,jsx_runtime.jsx)(_components.code, {
          children: "string"
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/11b3dada6a91c7d34c20f0c83ff25becdbcbd003/packages/extension-api/src/extension-api.d.ts#L953",
        children: "packages/extension-api/src/extension-api.d.ts:953"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "size",
      children: "size"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.strong, {
          children: "size"
        }), ": ", (0,jsx_runtime.jsx)(_components.code, {
          children: "number"
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/11b3dada6a91c7d34c20f0c83ff25becdbcbd003/packages/extension-api/src/extension-api.d.ts#L959",
        children: "packages/extension-api/src/extension-api.d.ts:959"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "type",
      children: "type"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.strong, {
          children: "type"
        }), ": ", (0,jsx_runtime.jsx)(_components.code, {
          children: "\"file\""
        }), " | ", (0,jsx_runtime.jsx)(_components.code, {
          children: "\"directory\""
        }), " | ", (0,jsx_runtime.jsx)(_components.code, {
          children: "\"symlink\""
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/11b3dada6a91c7d34c20f0c83ff25becdbcbd003/packages/extension-api/src/extension-api.d.ts#L954",
        children: "packages/extension-api/src/extension-api.d.ts:954"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "uid",
      children: "uid"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.strong, {
          children: "uid"
        }), ": ", (0,jsx_runtime.jsx)(_components.code, {
          children: "number"
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/11b3dada6a91c7d34c20f0c83ff25becdbcbd003/packages/extension-api/src/extension-api.d.ts#L957",
        children: "packages/extension-api/src/extension-api.d.ts:957"
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