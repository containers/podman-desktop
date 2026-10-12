"use strict";
(globalThis["webpackChunkdocs"] = globalThis["webpackChunkdocs"] || []).push([[34055],{

/***/ 88857
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  assets: () => (/* binding */ assets),
  contentTitle: () => (/* binding */ contentTitle),
  "default": () => (/* binding */ MDXContent),
  frontMatter: () => (/* binding */ frontMatter),
  metadata: () => (/* reexport */ site_api_classes_disposable_md_b51_namespaceObject),
  toc: () => (/* binding */ toc)
});

;// ./.docusaurus/docusaurus-plugin-content-docs/api/site-api-classes-disposable-md-b51.json
const site_api_classes_disposable_md_b51_namespaceObject = /*#__PURE__*/JSON.parse('{"id":"classes/Disposable","title":"Class: Disposable","description":"Defined in95","source":"@site/api/classes/Disposable.md","sourceDirName":"classes","slug":"/classes/Disposable","permalink":"/api/classes/Disposable","draft":false,"unlisted":false,"tags":[],"version":"current","frontMatter":{},"sidebar":"typedocSidebar","previous":{"title":"CancellationTokenSource","permalink":"/api/classes/CancellationTokenSource"},"next":{"title":"EventEmitter","permalink":"/api/classes/EventEmitter"}}');
// EXTERNAL MODULE: ../node_modules/react/jsx-runtime.js
var jsx_runtime = __webpack_require__(62540);
// EXTERNAL MODULE: ../node_modules/@mdx-js/react/lib/index.js
var lib = __webpack_require__(43023);
;// ./api/classes/Disposable.md


const frontMatter = {};
const contentTitle = 'Class: Disposable';

const assets = {

};



const toc = [{
  "value": "Extended by",
  "id": "extended-by",
  "level": 2
}, {
  "value": "Constructors",
  "id": "constructors",
  "level": 2
}, {
  "value": "Constructor",
  "id": "constructor",
  "level": 3
}, {
  "value": "Parameters",
  "id": "parameters",
  "level": 4
}, {
  "value": "func",
  "id": "func",
  "level": 5
}, {
  "value": "Returns",
  "id": "returns",
  "level": 4
}, {
  "value": "Constructor",
  "id": "constructor-1",
  "level": 3
}, {
  "value": "Parameters",
  "id": "parameters-1",
  "level": 4
}, {
  "value": "callOnDispose",
  "id": "callondispose",
  "level": 5
}, {
  "value": "Returns",
  "id": "returns-1",
  "level": 4
}, {
  "value": "Methods",
  "id": "methods",
  "level": 2
}, {
  "value": "dispose()",
  "id": "dispose",
  "level": 3
}, {
  "value": "Returns",
  "id": "returns-2",
  "level": 4
}, {
  "value": "create()",
  "id": "create",
  "level": 3
}, {
  "value": "Parameters",
  "id": "parameters-2",
  "level": 4
}, {
  "value": "func",
  "id": "func-1",
  "level": 5
}, {
  "value": "Returns",
  "id": "returns-3",
  "level": 4
}, {
  "value": "from()",
  "id": "from",
  "level": 3
}, {
  "value": "Parameters",
  "id": "parameters-3",
  "level": 4
}, {
  "value": "disposableLikes",
  "id": "disposablelikes",
  "level": 5
}, {
  "value": "Returns",
  "id": "returns-4",
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
        id: "class-disposable",
        children: "Class: Disposable"
      })
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/99a205572901d97af29ba428f899f13967a6168a/packages/extension-api/src/extension-api.d.ts#L95",
        children: "packages/extension-api/src/extension-api.d.ts:95"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.h2, {
      id: "extended-by",
      children: "Extended by"
    }), "\n", (0,jsx_runtime.jsxs)(_components.ul, {
      children: ["\n", (0,jsx_runtime.jsx)(_components.li, {
        children: (0,jsx_runtime.jsx)(_components.a, {
          href: "/api/interfaces/ImageFilesProvider",
          children: (0,jsx_runtime.jsx)(_components.code, {
            children: "ImageFilesProvider"
          })
        })
      }), "\n", (0,jsx_runtime.jsx)(_components.li, {
        children: (0,jsx_runtime.jsx)(_components.a, {
          href: "/api/interfaces/FileSystemWatcher",
          children: (0,jsx_runtime.jsx)(_components.code, {
            children: "FileSystemWatcher"
          })
        })
      }), "\n", (0,jsx_runtime.jsx)(_components.li, {
        children: (0,jsx_runtime.jsx)(_components.a, {
          href: "/api/interfaces/CliTool",
          children: (0,jsx_runtime.jsx)(_components.code, {
            children: "CliTool"
          })
        })
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsx)(_components.h2, {
      id: "constructors",
      children: "Constructors"
    }), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "constructor",
      children: "Constructor"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.strong, {
          children: "new Disposable"
        }), "(", (0,jsx_runtime.jsx)(_components.code, {
          children: "func"
        }), "): ", (0,jsx_runtime.jsx)(_components.code, {
          children: "Disposable"
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/99a205572901d97af29ba428f899f13967a6168a/packages/extension-api/src/extension-api.d.ts#L96",
        children: "packages/extension-api/src/extension-api.d.ts:96"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "parameters",
      children: "Parameters"
    }), "\n", (0,jsx_runtime.jsx)(_components.h5, {
      id: "func",
      children: "func"
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["() => ", (0,jsx_runtime.jsx)(_components.code, {
        children: "void"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "returns",
      children: "Returns"
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        children: "Disposable"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "constructor-1",
      children: "Constructor"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.strong, {
          children: "new Disposable"
        }), "(", (0,jsx_runtime.jsx)(_components.code, {
          children: "callOnDispose"
        }), "): ", (0,jsx_runtime.jsx)(_components.code, {
          children: "Disposable"
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/99a205572901d97af29ba428f899f13967a6168a/packages/extension-api/src/extension-api.d.ts#L103",
        children: "packages/extension-api/src/extension-api.d.ts:103"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Creates a new Disposable calling the provided function\non dispose."
    }), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "parameters-1",
      children: "Parameters"
    }), "\n", (0,jsx_runtime.jsx)(_components.h5, {
      id: "callondispose",
      children: "callOnDispose"
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        children: "Function"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Function that disposes something."
    }), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "returns-1",
      children: "Returns"
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        children: "Disposable"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.h2, {
      id: "methods",
      children: "Methods"
    }), "\n", (0,jsx_runtime.jsx)(_components.h3, {
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
        href: "https://github.com/podman-desktop/podman-desktop/blob/99a205572901d97af29ba428f899f13967a6168a/packages/extension-api/src/extension-api.d.ts#L108",
        children: "packages/extension-api/src/extension-api.d.ts:108"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Dispose this object."
    }), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "returns-2",
      children: "Returns"
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        children: "void"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "create",
      children: "create()"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "static"
        }), " ", (0,jsx_runtime.jsx)(_components.strong, {
          children: "create"
        }), "(", (0,jsx_runtime.jsx)(_components.code, {
          children: "func"
        }), "): ", (0,jsx_runtime.jsx)(_components.code, {
          children: "Disposable"
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/99a205572901d97af29ba428f899f13967a6168a/packages/extension-api/src/extension-api.d.ts#L110",
        children: "packages/extension-api/src/extension-api.d.ts:110"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "parameters-2",
      children: "Parameters"
    }), "\n", (0,jsx_runtime.jsx)(_components.h5, {
      id: "func-1",
      children: "func"
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["() => ", (0,jsx_runtime.jsx)(_components.code, {
        children: "void"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "returns-3",
      children: "Returns"
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        children: "Disposable"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "from",
      children: "from()"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "static"
        }), " ", (0,jsx_runtime.jsx)(_components.strong, {
          children: "from"
        }), "(...", (0,jsx_runtime.jsx)(_components.code, {
          children: "disposableLikes"
        }), "): ", (0,jsx_runtime.jsx)(_components.code, {
          children: "Disposable"
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/99a205572901d97af29ba428f899f13967a6168a/packages/extension-api/src/extension-api.d.ts#L122",
        children: "packages/extension-api/src/extension-api.d.ts:122"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Combine many disposable-likes into one. Use this method\nwhen having objects with a dispose function which are not\ninstances of Disposable."
    }), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "parameters-3",
      children: "Parameters"
    }), "\n", (0,jsx_runtime.jsx)(_components.h5, {
      id: "disposablelikes",
      children: "disposableLikes"
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["...", (0,jsx_runtime.jsx)(_components.code, {
        children: "object"
      }), "[]"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Objects that have at least a ", (0,jsx_runtime.jsx)(_components.code, {
        children: "dispose"
      }), "-function member."]
    }), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "returns-4",
      children: "Returns"
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        children: "Disposable"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Returns a new disposable which, upon dispose, will\ndispose all provided disposables."
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