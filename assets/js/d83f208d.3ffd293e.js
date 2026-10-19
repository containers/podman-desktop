"use strict";
(globalThis["webpackChunkdocs"] = globalThis["webpackChunkdocs"] || []).push([[35258],{

/***/ 58816
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  assets: () => (/* binding */ assets),
  contentTitle: () => (/* binding */ contentTitle),
  "default": () => (/* binding */ MDXContent),
  frontMatter: () => (/* binding */ frontMatter),
  metadata: () => (/* reexport */ site_api_interfaces_run_options_md_d83_namespaceObject),
  toc: () => (/* binding */ toc)
});

;// ./.docusaurus/docusaurus-plugin-content-docs/api/site-api-interfaces-run-options-md-d83.json
const site_api_interfaces_run_options_md_d83_namespaceObject = /*#__PURE__*/JSON.parse('{"id":"interfaces/RunOptions","title":"Interface: RunOptions","description":"Defined in4596","source":"@site/api/interfaces/RunOptions.md","sourceDirName":"interfaces","slug":"/interfaces/RunOptions","permalink":"/api/interfaces/RunOptions","draft":false,"unlisted":false,"tags":[],"version":"current","frontMatter":{},"sidebar":"typedocSidebar","previous":{"title":"RunError","permalink":"/api/interfaces/RunError"},"next":{"title":"RunResult","permalink":"/api/interfaces/RunResult"}}');
// EXTERNAL MODULE: ../node_modules/react/jsx-runtime.js
var jsx_runtime = __webpack_require__(62540);
// EXTERNAL MODULE: ../node_modules/@mdx-js/react/lib/index.js
var lib = __webpack_require__(43023);
;// ./api/interfaces/RunOptions.md


const frontMatter = {};
const contentTitle = 'Interface: RunOptions';

const assets = {

};



const toc = [{
  "value": "Properties",
  "id": "properties",
  "level": 2
}, {
  "value": "cwd?",
  "id": "cwd",
  "level": 3
}, {
  "value": "detached?",
  "id": "detached",
  "level": 3
}, {
  "value": "encoding?",
  "id": "encoding",
  "level": 3
}, {
  "value": "env?",
  "id": "env",
  "level": 3
}, {
  "value": "Index Signature",
  "id": "index-signature",
  "level": 4
}, {
  "value": "isAdmin?",
  "id": "isadmin",
  "level": 3
}, {
  "value": "logger?",
  "id": "logger",
  "level": 3
}, {
  "value": "token?",
  "id": "token",
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
    h4: "h4",
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
        id: "interface-runoptions",
        children: "Interface: RunOptions"
      })
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/38c08c28193e7cafb449d4fe74620b8749258493/packages/extension-api/src/extension-api.d.ts#L4596",
        children: "packages/extension-api/src/extension-api.d.ts:4596"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Options for running a command."
    }), "\n", (0,jsx_runtime.jsx)(_components.h2, {
      id: "properties",
      children: "Properties"
    }), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "cwd",
      children: "cwd?"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "optional"
        }), " ", (0,jsx_runtime.jsx)(_components.strong, {
          children: "cwd?"
        }), ": ", (0,jsx_runtime.jsx)(_components.code, {
          children: "string"
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/38c08c28193e7cafb449d4fe74620b8749258493/packages/extension-api/src/extension-api.d.ts#L4615",
        children: "packages/extension-api/src/extension-api.d.ts:4615"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "custom directory"
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "detached",
      children: "detached?"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "optional"
        }), " ", (0,jsx_runtime.jsx)(_components.strong, {
          children: "detached?"
        }), ": ", (0,jsx_runtime.jsx)(_components.code, {
          children: "boolean"
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/38c08c28193e7cafb449d4fe74620b8749258493/packages/extension-api/src/extension-api.d.ts#L4632",
        children: "packages/extension-api/src/extension-api.d.ts:4632"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "If true, the child process will be detached from the parent and its stdio\nwill be disconnected. The process will continue running independently even\nif Podman Desktop exits. Stdout/stderr will not be captured."
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "encoding",
      children: "encoding?"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "optional"
        }), " ", (0,jsx_runtime.jsx)(_components.strong, {
          children: "encoding?"
        }), ": ", (0,jsx_runtime.jsx)(_components.code, {
          children: "BufferEncoding"
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/38c08c28193e7cafb449d4fe74620b8749258493/packages/extension-api/src/extension-api.d.ts#L4625",
        children: "packages/extension-api/src/extension-api.d.ts:4625"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "The encoding to use. Default utf8"
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "env",
      children: "env?"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "optional"
        }), " ", (0,jsx_runtime.jsx)(_components.strong, {
          children: "env?"
        }), ": ", (0,jsx_runtime.jsx)(_components.code, {
          children: "object"
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/38c08c28193e7cafb449d4fe74620b8749258493/packages/extension-api/src/extension-api.d.ts#L4600",
        children: "packages/extension-api/src/extension-api.d.ts:4600"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Environment variables to set for the command."
    }), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "index-signature",
      children: "Index Signature"
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["[", (0,jsx_runtime.jsx)(_components.code, {
        children: "key"
      }), ": ", (0,jsx_runtime.jsx)(_components.code, {
        children: "string"
      }), "]: ", (0,jsx_runtime.jsx)(_components.code, {
        children: "string"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "isadmin",
      children: "isAdmin?"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "optional"
        }), " ", (0,jsx_runtime.jsx)(_components.strong, {
          children: "isAdmin?"
        }), ": ", (0,jsx_runtime.jsx)(_components.code, {
          children: "boolean"
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/38c08c28193e7cafb449d4fe74620b8749258493/packages/extension-api/src/extension-api.d.ts#L4620",
        children: "packages/extension-api/src/extension-api.d.ts:4620"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "admin privileges required"
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "logger",
      children: "logger?"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "optional"
        }), " ", (0,jsx_runtime.jsx)(_components.strong, {
          children: "logger?"
        }), ": ", (0,jsx_runtime.jsx)(_components.a, {
          href: "/api/interfaces/Logger",
          children: (0,jsx_runtime.jsx)(_components.code, {
            children: "Logger"
          })
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/38c08c28193e7cafb449d4fe74620b8749258493/packages/extension-api/src/extension-api.d.ts#L4610",
        children: "packages/extension-api/src/extension-api.d.ts:4610"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "A logger used to track execution events."
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "token",
      children: "token?"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "optional"
        }), " ", (0,jsx_runtime.jsx)(_components.strong, {
          children: "token?"
        }), ": ", (0,jsx_runtime.jsx)(_components.a, {
          href: "/api/interfaces/CancellationToken",
          children: (0,jsx_runtime.jsx)(_components.code, {
            children: "CancellationToken"
          })
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/38c08c28193e7cafb449d4fe74620b8749258493/packages/extension-api/src/extension-api.d.ts#L4605",
        children: "packages/extension-api/src/extension-api.d.ts:4605"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "A cancellation token used to request cancellation."
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