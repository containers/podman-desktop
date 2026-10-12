"use strict";
(globalThis["webpackChunkdocs"] = globalThis["webpackChunkdocs"] || []).push([[37012],{

/***/ 76014
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  assets: () => (/* binding */ assets),
  contentTitle: () => (/* binding */ contentTitle),
  "default": () => (/* binding */ MDXContent),
  frontMatter: () => (/* binding */ frontMatter),
  metadata: () => (/* reexport */ site_api_interfaces_event_md_e79_namespaceObject),
  toc: () => (/* binding */ toc)
});

;// ./.docusaurus/docusaurus-plugin-content-docs/api/site-api-interfaces-event-md-e79.json
const site_api_interfaces_event_md_e79_namespaceObject = /*#__PURE__*/JSON.parse('{"id":"interfaces/Event","title":"Interface: Event()\\\\<T\\\\>","description":"Defined in154","source":"@site/api/interfaces/Event.md","sourceDirName":"interfaces","slug":"/interfaces/Event","permalink":"/api/interfaces/Event","draft":false,"unlisted":false,"tags":[],"version":"current","frontMatter":{},"sidebar":"typedocSidebar","previous":{"title":"EndpointSettings","permalink":"/api/interfaces/EndpointSettings"},"next":{"title":"Extension","permalink":"/api/interfaces/Extension"}}');
// EXTERNAL MODULE: ../node_modules/react/jsx-runtime.js
var jsx_runtime = __webpack_require__(62540);
// EXTERNAL MODULE: ../node_modules/@mdx-js/react/lib/index.js
var lib = __webpack_require__(43023);
;// ./api/interfaces/Event.md


const frontMatter = {};
const contentTitle = 'Interface: Event()<T>';

const assets = {

};



const toc = [{
  "value": "Example",
  "id": "example",
  "level": 2
}, {
  "value": "Type Parameters",
  "id": "type-parameters",
  "level": 2
}, {
  "value": "T",
  "id": "t",
  "level": 3
}, {
  "value": "Parameters",
  "id": "parameters",
  "level": 2
}, {
  "value": "listener",
  "id": "listener",
  "level": 3
}, {
  "value": "thisArgs?",
  "id": "thisargs",
  "level": 3
}, {
  "value": "disposables?",
  "id": "disposables",
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
    pre: "pre",
    strong: "strong",
    ...(0,lib/* useMDXComponents */.R)(),
    ...props.components
  };
  return (0,jsx_runtime.jsxs)(jsx_runtime.Fragment, {
    children: [(0,jsx_runtime.jsx)(_components.header, {
      children: (0,jsx_runtime.jsx)(_components.h1, {
        id: "interface-eventt",
        children: "Interface: Event()<T>"
      })
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/278764c44a9f62c3dccbb0d3eb23ba1bd9bee7e1/packages/extension-api/src/extension-api.d.ts#L154",
        children: "packages/extension-api/src/extension-api.d.ts:154"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Interface to subscribe specific events."
    }), "\n", (0,jsx_runtime.jsx)(_components.h2, {
      id: "example",
      children: "Example"
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["This is an example for an hypothetic function ", (0,jsx_runtime.jsx)(_components.code, {
        children: "onDidValueChange"
      }), " implementing\nthe ", (0,jsx_runtime.jsx)(_components.code, {
        children: "Event"
      }), " interface."]
    }), "\n", (0,jsx_runtime.jsx)(_components.pre, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        className: "language-typescript",
        children: "import * as api from '@podman-desktop/api';\n\nclass MyValueManager {\n  private value: boolean | undefined = undefined;\n\n  private onChange(e: boolean) {\n    this.value = e;\n    console.log(this.value);\n  }\n\n  public init(subscriptions: api.Disposable[]) {\n    onDidValueChange(this.onChange, this, subscriptions);\n  }\n}\n\nexport async function activate(extensionContext: api.ExtensionContext): Promise<void> {\n  const myValueManager = new MyValueManager();\n  myValueManager.init(extensionContext.subscriptions);\n}\n"
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
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.strong, {
          children: "Event"
        }), "(", (0,jsx_runtime.jsx)(_components.code, {
          children: "listener"
        }), ", ", (0,jsx_runtime.jsx)(_components.code, {
          children: "thisArgs?"
        }), ", ", (0,jsx_runtime.jsx)(_components.code, {
          children: "disposables?"
        }), "): ", (0,jsx_runtime.jsx)(_components.a, {
          href: "/api/classes/Disposable",
          children: (0,jsx_runtime.jsx)(_components.code, {
            children: "Disposable"
          })
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/278764c44a9f62c3dccbb0d3eb23ba1bd9bee7e1/packages/extension-api/src/extension-api.d.ts#L162",
        children: "packages/extension-api/src/extension-api.d.ts:162"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.h2, {
      id: "parameters",
      children: "Parameters"
    }), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "listener",
      children: "listener"
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["(", (0,jsx_runtime.jsx)(_components.code, {
        children: "e"
      }), ") => ", (0,jsx_runtime.jsx)(_components.code, {
        children: "any"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "The listener function will be called when the event happens."
    }), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "thisargs",
      children: "thisArgs?"
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        children: "any"
      })
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["The ", (0,jsx_runtime.jsx)(_components.code, {
        children: "this"
      }), "-argument which will be used when calling the event listener."]
    }), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "disposables",
      children: "disposables?"
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: [(0,jsx_runtime.jsx)(_components.a, {
        href: "/api/classes/Disposable",
        children: (0,jsx_runtime.jsx)(_components.code, {
          children: "Disposable"
        })
      }), "[]"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["An array to which the resulting ", (0,jsx_runtime.jsx)(_components.a, {
        href: "/api/classes/Disposable",
        children: "Disposable"
      }), " will be added."]
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
      children: "A disposable which unsubscribes the event listener."
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