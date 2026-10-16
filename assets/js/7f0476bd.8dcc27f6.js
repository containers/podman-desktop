"use strict";
(globalThis["webpackChunkdocs"] = globalThis["webpackChunkdocs"] || []).push([[87577],{

/***/ 26414
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  assets: () => (/* binding */ assets),
  contentTitle: () => (/* binding */ contentTitle),
  "default": () => (/* binding */ MDXContent),
  frontMatter: () => (/* binding */ frontMatter),
  metadata: () => (/* reexport */ site_api_interfaces_webview_md_7f0_namespaceObject),
  toc: () => (/* binding */ toc)
});

;// ./.docusaurus/docusaurus-plugin-content-docs/api/site-api-interfaces-webview-md-7f0.json
const site_api_interfaces_webview_md_7f0_namespaceObject = /*#__PURE__*/JSON.parse('{"id":"interfaces/Webview","title":"Interface: Webview","description":"Defined in2032","source":"@site/api/interfaces/Webview.md","sourceDirName":"interfaces","slug":"/interfaces/Webview","permalink":"/api/interfaces/Webview","draft":false,"unlisted":false,"tags":[],"version":"current","frontMatter":{},"sidebar":"typedocSidebar","previous":{"title":"VolumeListInfo","permalink":"/api/interfaces/VolumeListInfo"},"next":{"title":"WebviewInfo","permalink":"/api/interfaces/WebviewInfo"}}');
// EXTERNAL MODULE: ../node_modules/react/jsx-runtime.js
var jsx_runtime = __webpack_require__(62540);
// EXTERNAL MODULE: ../node_modules/@mdx-js/react/lib/index.js
var lib = __webpack_require__(43023);
;// ./api/interfaces/Webview.md


const frontMatter = {};
const contentTitle = 'Interface: Webview';

const assets = {

};



const toc = [{
  "value": "Properties",
  "id": "properties",
  "level": 2
}, {
  "value": "cspSource",
  "id": "cspsource",
  "level": 3
}, {
  "value": "html",
  "id": "html",
  "level": 3
}, {
  "value": "onDidReceiveMessage",
  "id": "ondidreceivemessage",
  "level": 3
}, {
  "value": "options",
  "id": "options",
  "level": 3
}, {
  "value": "Methods",
  "id": "methods",
  "level": 2
}, {
  "value": "asWebviewUri()",
  "id": "aswebviewuri",
  "level": 3
}, {
  "value": "Parameters",
  "id": "parameters",
  "level": 4
}, {
  "value": "localResource",
  "id": "localresource",
  "level": 5
}, {
  "value": "Returns",
  "id": "returns",
  "level": 4
}, {
  "value": "postMessage()",
  "id": "postmessage",
  "level": 3
}, {
  "value": "Parameters",
  "id": "parameters-1",
  "level": 4
}, {
  "value": "message",
  "id": "message",
  "level": 5
}, {
  "value": "Returns",
  "id": "returns-1",
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
        id: "interface-webview",
        children: "Interface: Webview"
      })
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/e815a7ddef53911b2d9e53654b731d219f39dbe1/packages/extension-api/src/extension-api.d.ts#L2032",
        children: "packages/extension-api/src/extension-api.d.ts:2032"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Displays html content, similarly to an iframe."
    }), "\n", (0,jsx_runtime.jsx)(_components.h2, {
      id: "properties",
      children: "Properties"
    }), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "cspsource",
      children: "cspSource"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "readonly"
        }), " ", (0,jsx_runtime.jsx)(_components.strong, {
          children: "cspSource"
        }), ": ", (0,jsx_runtime.jsx)(_components.code, {
          children: "string"
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/e815a7ddef53911b2d9e53654b731d219f39dbe1/packages/extension-api/src/extension-api.d.ts#L2067",
        children: "packages/extension-api/src/extension-api.d.ts:2067"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Content security policy source for webview resources."
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "html",
      children: "html"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.strong, {
          children: "html"
        }), ": ", (0,jsx_runtime.jsx)(_components.code, {
          children: "string"
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/e815a7ddef53911b2d9e53654b731d219f39dbe1/packages/extension-api/src/extension-api.d.ts#L2044",
        children: "packages/extension-api/src/extension-api.d.ts:2044"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "HTML contents of the webview."
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "This should be a complete, valid html document. Changing this property causes the webview to be reloaded."
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "ondidreceivemessage",
      children: "onDidReceiveMessage"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "readonly"
        }), " ", (0,jsx_runtime.jsx)(_components.strong, {
          children: "onDidReceiveMessage"
        }), ": ", (0,jsx_runtime.jsx)(_components.a, {
          href: "/api/interfaces/Event",
          children: (0,jsx_runtime.jsx)(_components.code, {
            children: "Event"
          })
        }), "<", (0,jsx_runtime.jsx)(_components.code, {
          children: "unknown"
        }), ">"]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/e815a7ddef53911b2d9e53654b731d219f39dbe1/packages/extension-api/src/extension-api.d.ts#L2051",
        children: "packages/extension-api/src/extension-api.d.ts:2051"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Fired when the webview content posts a message."
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Webview content can post strings or json serializable objects back to an extension."
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "options",
      children: "options"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.strong, {
          children: "options"
        }), ": ", (0,jsx_runtime.jsx)(_components.a, {
          href: "/api/interfaces/WebviewOptions",
          children: (0,jsx_runtime.jsx)(_components.code, {
            children: "WebviewOptions"
          })
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/e815a7ddef53911b2d9e53654b731d219f39dbe1/packages/extension-api/src/extension-api.d.ts#L2036",
        children: "packages/extension-api/src/extension-api.d.ts:2036"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Content settings for the webview."
    }), "\n", (0,jsx_runtime.jsx)(_components.h2, {
      id: "methods",
      children: "Methods"
    }), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "aswebviewuri",
      children: "asWebviewUri()"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.strong, {
          children: "asWebviewUri"
        }), "(", (0,jsx_runtime.jsx)(_components.code, {
          children: "localResource"
        }), "): ", (0,jsx_runtime.jsx)(_components.a, {
          href: "/api/classes/Uri",
          children: (0,jsx_runtime.jsx)(_components.code, {
            children: "Uri"
          })
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/e815a7ddef53911b2d9e53654b731d219f39dbe1/packages/extension-api/src/extension-api.d.ts#L2061",
        children: "packages/extension-api/src/extension-api.d.ts:2061"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Convert a uri for the local file system to one that can be used inside webviews."
    }), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "parameters",
      children: "Parameters"
    }), "\n", (0,jsx_runtime.jsx)(_components.h5, {
      id: "localresource",
      children: "localResource"
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: (0,jsx_runtime.jsx)(_components.a, {
        href: "/api/classes/Uri",
        children: (0,jsx_runtime.jsx)(_components.code, {
          children: "Uri"
        })
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "returns",
      children: "Returns"
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: (0,jsx_runtime.jsx)(_components.a, {
        href: "/api/classes/Uri",
        children: (0,jsx_runtime.jsx)(_components.code, {
          children: "Uri"
        })
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "postmessage",
      children: "postMessage()"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.strong, {
          children: "postMessage"
        }), "(", (0,jsx_runtime.jsx)(_components.code, {
          children: "message"
        }), "): ", (0,jsx_runtime.jsx)(_components.code, {
          children: "Promise"
        }), "<", (0,jsx_runtime.jsx)(_components.code, {
          children: "boolean"
        }), ">"]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/e815a7ddef53911b2d9e53654b731d219f39dbe1/packages/extension-api/src/extension-api.d.ts#L2056",
        children: "packages/extension-api/src/extension-api.d.ts:2056"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Post a message to the webview content."
    }), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "parameters-1",
      children: "Parameters"
    }), "\n", (0,jsx_runtime.jsx)(_components.h5, {
      id: "message",
      children: "message"
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        children: "unknown"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "returns-1",
      children: "Returns"
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: [(0,jsx_runtime.jsx)(_components.code, {
        children: "Promise"
      }), "<", (0,jsx_runtime.jsx)(_components.code, {
        children: "boolean"
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