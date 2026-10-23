"use strict";
(globalThis["webpackChunkdocs"] = globalThis["webpackChunkdocs"] || []).push([[56576],{

/***/ 56409
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  assets: () => (/* binding */ assets),
  contentTitle: () => (/* binding */ contentTitle),
  "default": () => (/* binding */ MDXContent),
  frontMatter: () => (/* binding */ frontMatter),
  metadata: () => (/* reexport */ site_api_interfaces_telemetry_logger_md_878_namespaceObject),
  toc: () => (/* binding */ toc)
});

;// ./.docusaurus/docusaurus-plugin-content-docs/api/site-api-interfaces-telemetry-logger-md-878.json
const site_api_interfaces_telemetry_logger_md_878_namespaceObject = /*#__PURE__*/JSON.parse('{"id":"interfaces/TelemetryLogger","title":"Interface: TelemetryLogger","description":"Defined in4735","source":"@site/api/interfaces/TelemetryLogger.md","sourceDirName":"interfaces","slug":"/interfaces/TelemetryLogger","permalink":"/api/interfaces/TelemetryLogger","draft":false,"unlisted":false,"tags":[],"version":"current","frontMatter":{},"sidebar":"typedocSidebar","previous":{"title":"StorageStats","permalink":"/api/interfaces/StorageStats"},"next":{"title":"TelemetryLoggerOptions","permalink":"/api/interfaces/TelemetryLoggerOptions"}}');
// EXTERNAL MODULE: ../node_modules/react/jsx-runtime.js
var jsx_runtime = __webpack_require__(62540);
// EXTERNAL MODULE: ../node_modules/@mdx-js/react/lib/index.js
var lib = __webpack_require__(43023);
;// ./api/interfaces/TelemetryLogger.md


const frontMatter = {};
const contentTitle = 'Interface: TelemetryLogger';

const assets = {

};



const toc = [{
  "value": "Properties",
  "id": "properties",
  "level": 2
}, {
  "value": "isErrorsEnabled",
  "id": "iserrorsenabled",
  "level": 3
}, {
  "value": "isUsageEnabled",
  "id": "isusageenabled",
  "level": 3
}, {
  "value": "onDidChangeEnableStates",
  "id": "ondidchangeenablestates",
  "level": 3
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
  "id": "returns",
  "level": 4
}, {
  "value": "logError()",
  "id": "logerror",
  "level": 3
}, {
  "value": "Call Signature",
  "id": "call-signature",
  "level": 4
}, {
  "value": "Parameters",
  "id": "parameters",
  "level": 5
}, {
  "value": "eventName",
  "id": "eventname",
  "level": 6
}, {
  "value": "data?",
  "id": "data",
  "level": 6
}, {
  "value": "Returns",
  "id": "returns-1",
  "level": 5
}, {
  "value": "Call Signature",
  "id": "call-signature-1",
  "level": 4
}, {
  "value": "Parameters",
  "id": "parameters-1",
  "level": 5
}, {
  "value": "error",
  "id": "error",
  "level": 6
}, {
  "value": "data?",
  "id": "data-1",
  "level": 6
}, {
  "value": "Returns",
  "id": "returns-2",
  "level": 5
}, {
  "value": "logUsage()",
  "id": "logusage",
  "level": 3
}, {
  "value": "Parameters",
  "id": "parameters-2",
  "level": 4
}, {
  "value": "eventName",
  "id": "eventname-1",
  "level": 5
}, {
  "value": "data?",
  "id": "data-2",
  "level": 5
}, {
  "value": "Returns",
  "id": "returns-3",
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
        id: "interface-telemetrylogger",
        children: "Interface: TelemetryLogger"
      })
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/a5460ce2563463e95746424a701af2793bd38e98/packages/extension-api/src/extension-api.d.ts#L4735",
        children: "packages/extension-api/src/extension-api.d.ts:4735"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "A telemetry logger which can be used by extensions to log usage and error telementry."
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["A logger wraps around an ", (0,jsx_runtime.jsx)(_components.a, {
        href: "/api/interfaces/TelemetrySender",
        children: "sender"
      }), " but it guarantees that"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.ul, {
      children: ["\n", (0,jsx_runtime.jsx)(_components.li, {
        children: "user settings to disable or tweak telemetry are respected, and that"
      }), "\n", (0,jsx_runtime.jsx)(_components.li, {
        children: "potential sensitive data is removed"
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "It also enables an \"echo UI\" that prints whatever data is send and it allows the editor\nto forward unhandled errors to the respective extensions."
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["To get an instance of a ", (0,jsx_runtime.jsx)(_components.code, {
        children: "TelemetryLogger"
      }), ", use\n", (0,jsx_runtime.jsx)(_components.a, {
        href: "/api/@podman-desktop/namespaces/env/functions/createTelemetryLogger",
        children: "`createTelemetryLogger`"
      }), "."]
    }), "\n", (0,jsx_runtime.jsx)(_components.h2, {
      id: "properties",
      children: "Properties"
    }), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "iserrorsenabled",
      children: "isErrorsEnabled"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "readonly"
        }), " ", (0,jsx_runtime.jsx)(_components.strong, {
          children: "isErrorsEnabled"
        }), ": ", (0,jsx_runtime.jsx)(_components.code, {
          children: "boolean"
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/a5460ce2563463e95746424a701af2793bd38e98/packages/extension-api/src/extension-api.d.ts#L4749",
        children: "packages/extension-api/src/extension-api.d.ts:4749"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Whether or not error telemetry is enabled for this logger."
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "isusageenabled",
      children: "isUsageEnabled"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "readonly"
        }), " ", (0,jsx_runtime.jsx)(_components.strong, {
          children: "isUsageEnabled"
        }), ": ", (0,jsx_runtime.jsx)(_components.code, {
          children: "boolean"
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/a5460ce2563463e95746424a701af2793bd38e98/packages/extension-api/src/extension-api.d.ts#L4744",
        children: "packages/extension-api/src/extension-api.d.ts:4744"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Whether or not usage telemetry is enabled for this logger."
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "ondidchangeenablestates",
      children: "onDidChangeEnableStates"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "readonly"
        }), " ", (0,jsx_runtime.jsx)(_components.strong, {
          children: "onDidChangeEnableStates"
        }), ": ", (0,jsx_runtime.jsx)(_components.a, {
          href: "/api/interfaces/Event",
          children: (0,jsx_runtime.jsx)(_components.code, {
            children: "Event"
          })
        }), "<", (0,jsx_runtime.jsx)(_components.code, {
          children: "TelemetryLogger"
        }), ">"]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/a5460ce2563463e95746424a701af2793bd38e98/packages/extension-api/src/extension-api.d.ts#L4739",
        children: "packages/extension-api/src/extension-api.d.ts:4739"
      })]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["An ", (0,jsx_runtime.jsx)(_components.a, {
        href: "/api/interfaces/Event",
        children: "Event"
      }), " which fires when the enablement state of usage or error telemetry changes."]
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
        href: "https://github.com/podman-desktop/podman-desktop/blob/a5460ce2563463e95746424a701af2793bd38e98/packages/extension-api/src/extension-api.d.ts#L4784",
        children: "packages/extension-api/src/extension-api.d.ts:4784"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Dispose this object and free resources."
    }), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "returns",
      children: "Returns"
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        children: "void"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "logerror",
      children: "logError()"
    }), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "call-signature",
      children: "Call Signature"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.strong, {
          children: "logError"
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
        href: "https://github.com/podman-desktop/podman-desktop/blob/a5460ce2563463e95746424a701af2793bd38e98/packages/extension-api/src/extension-api.d.ts#L4771",
        children: "packages/extension-api/src/extension-api.d.ts:4771"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Log an error event."
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["After completing cleaning, telemetry setting checks, and data mix-in calls ", (0,jsx_runtime.jsx)(_components.code, {
        children: "TelemetrySender.sendEventData"
      }), " to log the event. Differs from ", (0,jsx_runtime.jsx)(_components.code, {
        children: "logUsage"
      }), " in that it will log the event if the telemetry setting is Error+.\nAutomatically supports echoing to extension telemetry output channel."]
    }), "\n", (0,jsx_runtime.jsx)(_components.h5, {
      id: "parameters",
      children: "Parameters"
    }), "\n", (0,jsx_runtime.jsx)(_components.h6, {
      id: "eventname",
      children: "eventName"
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        children: "string"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "The event name to log"
    }), "\n", (0,jsx_runtime.jsx)(_components.h6, {
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
      children: "The data to log"
    }), "\n", (0,jsx_runtime.jsx)(_components.h5, {
      id: "returns-1",
      children: "Returns"
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        children: "void"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "call-signature-1",
      children: "Call Signature"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.strong, {
          children: "logError"
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
        href: "https://github.com/podman-desktop/podman-desktop/blob/a5460ce2563463e95746424a701af2793bd38e98/packages/extension-api/src/extension-api.d.ts#L4779",
        children: "packages/extension-api/src/extension-api.d.ts:4779"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Log an error event."
    }), "\n", (0,jsx_runtime.jsx)(_components.h5, {
      id: "parameters-1",
      children: "Parameters"
    }), "\n", (0,jsx_runtime.jsx)(_components.h6, {
      id: "error",
      children: "error"
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        children: "Error"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "The error object which contains the stack trace cleaned of PII"
    }), "\n", (0,jsx_runtime.jsx)(_components.h6, {
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
      children: "Additional data to log alongside the stack trace"
    }), "\n", (0,jsx_runtime.jsx)(_components.h5, {
      id: "returns-2",
      children: "Returns"
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        children: "void"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "logusage",
      children: "logUsage()"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.strong, {
          children: "logUsage"
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
        href: "https://github.com/podman-desktop/podman-desktop/blob/a5460ce2563463e95746424a701af2793bd38e98/packages/extension-api/src/extension-api.d.ts#L4760",
        children: "packages/extension-api/src/extension-api.d.ts:4760"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Log a usage event."
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["After completing cleaning, telemetry setting checks, and data mix-in calls ", (0,jsx_runtime.jsx)(_components.code, {
        children: "TelemetrySender.sendEventData"
      }), " to log the event.\nAutomatically supports echoing to extension telemetry output channel."]
    }), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "parameters-2",
      children: "Parameters"
    }), "\n", (0,jsx_runtime.jsx)(_components.h5, {
      id: "eventname-1",
      children: "eventName"
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        children: "string"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "The event name to log"
    }), "\n", (0,jsx_runtime.jsx)(_components.h5, {
      id: "data-2",
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
      children: "The data to log"
    }), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "returns-3",
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