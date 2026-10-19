"use strict";
(globalThis["webpackChunkdocs"] = globalThis["webpackChunkdocs"] || []).push([[772],{

/***/ 12466
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  assets: () => (/* binding */ assets),
  contentTitle: () => (/* binding */ contentTitle),
  "default": () => (/* binding */ MDXContent),
  frontMatter: () => (/* binding */ frontMatter),
  metadata: () => (/* reexport */ site_api_interfaces_telemetry_sender_md_5c0_namespaceObject),
  toc: () => (/* binding */ toc)
});

;// ./.docusaurus/docusaurus-plugin-content-docs/api/site-api-interfaces-telemetry-sender-md-5c0.json
const site_api_interfaces_telemetry_sender_md_5c0_namespaceObject = /*#__PURE__*/JSON.parse('{"id":"interfaces/TelemetrySender","title":"Interface: TelemetrySender","description":"Defined in4791","source":"@site/api/interfaces/TelemetrySender.md","sourceDirName":"interfaces","slug":"/interfaces/TelemetrySender","permalink":"/api/interfaces/TelemetrySender","draft":false,"unlisted":false,"tags":[],"version":"current","frontMatter":{},"sidebar":"typedocSidebar","previous":{"title":"TelemetryLoggerOptions","permalink":"/api/interfaces/TelemetryLoggerOptions"},"next":{"title":"ThrottlingData","permalink":"/api/interfaces/ThrottlingData"}}');
// EXTERNAL MODULE: ../node_modules/react/jsx-runtime.js
var jsx_runtime = __webpack_require__(62540);
// EXTERNAL MODULE: ../node_modules/@mdx-js/react/lib/index.js
var lib = __webpack_require__(43023);
;// ./api/interfaces/TelemetrySender.md


const frontMatter = {};
const contentTitle = 'Interface: TelemetrySender';

const assets = {

};



const toc = [{
  "value": "Methods",
  "id": "methods",
  "level": 2
}, {
  "value": "flush()?",
  "id": "flush",
  "level": 3
}, {
  "value": "Returns",
  "id": "returns",
  "level": 4
}, {
  "value": "sendErrorData()",
  "id": "senderrordata",
  "level": 3
}, {
  "value": "Parameters",
  "id": "parameters",
  "level": 4
}, {
  "value": "error",
  "id": "error",
  "level": 5
}, {
  "value": "data?",
  "id": "data",
  "level": 5
}, {
  "value": "Returns",
  "id": "returns-1",
  "level": 4
}, {
  "value": "sendEventData()",
  "id": "sendeventdata",
  "level": 3
}, {
  "value": "Parameters",
  "id": "parameters-1",
  "level": 4
}, {
  "value": "eventName",
  "id": "eventname",
  "level": 5
}, {
  "value": "data?",
  "id": "data-1",
  "level": 5
}, {
  "value": "Returns",
  "id": "returns-2",
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
        id: "interface-telemetrysender",
        children: "Interface: TelemetrySender"
      })
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/d9155c1c9fec793d45fddd68620abd9a7a266a8a/packages/extension-api/src/extension-api.d.ts#L4791",
        children: "packages/extension-api/src/extension-api.d.ts:4791"
      })]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["The telemetry sender is the contract between a telemetry logger and some telemetry service. ", (0,jsx_runtime.jsx)(_components.strong, {
        children: "Note"
      }), " that extensions must NOT\ncall the methods of their sender directly as the logger provides extra guards and cleaning."]
    }), "\n", (0,jsx_runtime.jsx)(_components.h2, {
      id: "methods",
      children: "Methods"
    }), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "flush",
      children: "flush()?"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "optional"
        }), " ", (0,jsx_runtime.jsx)(_components.strong, {
          children: "flush"
        }), "(): ", (0,jsx_runtime.jsx)(_components.code, {
          children: "void"
        }), " | ", (0,jsx_runtime.jsx)(_components.code, {
          children: "Promise"
        }), "<", (0,jsx_runtime.jsx)(_components.code, {
          children: "void"
        }), ">"]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/d9155c1c9fec793d45fddd68620abd9a7a266a8a/packages/extension-api/src/extension-api.d.ts#L4814",
        children: "packages/extension-api/src/extension-api.d.ts:4814"
      })]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Optional flush function which will give this sender a chance to send any remaining events\nas its ", (0,jsx_runtime.jsx)(_components.a, {
        href: "/api/interfaces/TelemetryLogger",
        children: "TelemetryLogger"
      }), " is being disposed"]
    }), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "returns",
      children: "Returns"
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: [(0,jsx_runtime.jsx)(_components.code, {
        children: "void"
      }), " | ", (0,jsx_runtime.jsx)(_components.code, {
        children: "Promise"
      }), "<", (0,jsx_runtime.jsx)(_components.code, {
        children: "void"
      }), ">"]
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "senderrordata",
      children: "sendErrorData()"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.strong, {
          children: "sendErrorData"
        }), "(", (0,jsx_runtime.jsx)(_components.code, {
          children: "error"
        }), ", ", (0,jsx_runtime.jsx)(_components.code, {
          children: "data?"
        }), "): ", (0,jsx_runtime.jsx)(_components.code, {
          children: "void"
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/d9155c1c9fec793d45fddd68620abd9a7a266a8a/packages/extension-api/src/extension-api.d.ts#L4808",
        children: "packages/extension-api/src/extension-api.d.ts:4808"
      })]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Function to send an error. Used within a ", (0,jsx_runtime.jsx)(_components.a, {
        href: "/api/interfaces/TelemetryLogger",
        children: "TelemetryLogger"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "parameters",
      children: "Parameters"
    }), "\n", (0,jsx_runtime.jsx)(_components.h5, {
      id: "error",
      children: "error"
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        children: "Error"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "The error being logged"
    }), "\n", (0,jsx_runtime.jsx)(_components.h5, {
      id: "data",
      children: "data?"
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: [(0,jsx_runtime.jsx)(_components.code, {
        children: "Record"
      }), "<", (0,jsx_runtime.jsx)(_components.code, {
        children: "string"
      }), ", ", (0,jsx_runtime.jsx)(_components.code, {
        children: "any"
      }), ">"]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Any additional data to be collected with the exception"
    }), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "returns-1",
      children: "Returns"
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        children: "void"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "sendeventdata",
      children: "sendEventData()"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.strong, {
          children: "sendEventData"
        }), "(", (0,jsx_runtime.jsx)(_components.code, {
          children: "eventName"
        }), ", ", (0,jsx_runtime.jsx)(_components.code, {
          children: "data?"
        }), "): ", (0,jsx_runtime.jsx)(_components.code, {
          children: "void"
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/d9155c1c9fec793d45fddd68620abd9a7a266a8a/packages/extension-api/src/extension-api.d.ts#L4799",
        children: "packages/extension-api/src/extension-api.d.ts:4799"
      })]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Function to send event data without a stacktrace. Used within a ", (0,jsx_runtime.jsx)(_components.a, {
        href: "/api/interfaces/TelemetryLogger",
        children: "TelemetryLogger"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "parameters-1",
      children: "Parameters"
    }), "\n", (0,jsx_runtime.jsx)(_components.h5, {
      id: "eventname",
      children: "eventName"
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        children: "string"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "The name of the event which you are logging"
    }), "\n", (0,jsx_runtime.jsx)(_components.h5, {
      id: "data-1",
      children: "data?"
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: [(0,jsx_runtime.jsx)(_components.code, {
        children: "Record"
      }), "<", (0,jsx_runtime.jsx)(_components.code, {
        children: "string"
      }), ", ", (0,jsx_runtime.jsx)(_components.code, {
        children: "any"
      }), ">"]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "A serializable key value pair that is being logged"
    }), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "returns-2",
      children: "Returns"
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        children: "void"
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