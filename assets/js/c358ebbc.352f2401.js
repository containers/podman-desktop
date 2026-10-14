"use strict";
(globalThis["webpackChunkdocs"] = globalThis["webpackChunkdocs"] || []).push([[61634],{

/***/ 91665
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  assets: () => (/* binding */ assets),
  contentTitle: () => (/* binding */ contentTitle),
  "default": () => (/* binding */ MDXContent),
  frontMatter: () => (/* binding */ frontMatter),
  metadata: () => (/* reexport */ site_api_interfaces_authentication_provider_md_c35_namespaceObject),
  toc: () => (/* binding */ toc)
});

;// ./.docusaurus/docusaurus-plugin-content-docs/api/site-api-interfaces-authentication-provider-md-c35.json
const site_api_interfaces_authentication_provider_md_c35_namespaceObject = /*#__PURE__*/JSON.parse('{"id":"interfaces/AuthenticationProvider","title":"Interface: AuthenticationProvider","description":"Defined in4410","source":"@site/api/interfaces/AuthenticationProvider.md","sourceDirName":"interfaces","slug":"/interfaces/AuthenticationProvider","permalink":"/api/interfaces/AuthenticationProvider","draft":false,"unlisted":false,"tags":[],"version":"current","frontMatter":{},"sidebar":"typedocSidebar","previous":{"title":"AuthenticationGetSessionOptions","permalink":"/api/interfaces/AuthenticationGetSessionOptions"},"next":{"title":"AuthenticationProviderAuthenticationSessionsChangeEvent","permalink":"/api/interfaces/AuthenticationProviderAuthenticationSessionsChangeEvent"}}');
// EXTERNAL MODULE: ../node_modules/react/jsx-runtime.js
var jsx_runtime = __webpack_require__(62540);
// EXTERNAL MODULE: ../node_modules/@mdx-js/react/lib/index.js
var lib = __webpack_require__(43023);
;// ./api/interfaces/AuthenticationProvider.md


const frontMatter = {};
const contentTitle = 'Interface: AuthenticationProvider';

const assets = {

};



const toc = [{
  "value": "Properties",
  "id": "properties",
  "level": 2
}, {
  "value": "onDidChangeSessions",
  "id": "ondidchangesessions",
  "level": 3
}, {
  "value": "Methods",
  "id": "methods",
  "level": 2
}, {
  "value": "createSession()",
  "id": "createsession",
  "level": 3
}, {
  "value": "Parameters",
  "id": "parameters",
  "level": 4
}, {
  "value": "scopes",
  "id": "scopes",
  "level": 5
}, {
  "value": "Returns",
  "id": "returns",
  "level": 4
}, {
  "value": "getSessions()",
  "id": "getsessions",
  "level": 3
}, {
  "value": "Parameters",
  "id": "parameters-1",
  "level": 4
}, {
  "value": "scopes?",
  "id": "scopes-1",
  "level": 5
}, {
  "value": "Returns",
  "id": "returns-1",
  "level": 4
}, {
  "value": "removeSession()",
  "id": "removesession",
  "level": 3
}, {
  "value": "Parameters",
  "id": "parameters-2",
  "level": 4
}, {
  "value": "sessionId",
  "id": "sessionid",
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
        id: "interface-authenticationprovider",
        children: "Interface: AuthenticationProvider"
      })
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/e2548979c7e953e1419312e49836407008d44c21/packages/extension-api/src/extension-api.d.ts#L4410",
        children: "packages/extension-api/src/extension-api.d.ts:4410"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "A provider for performing authentication to a service."
    }), "\n", (0,jsx_runtime.jsx)(_components.h2, {
      id: "properties",
      children: "Properties"
    }), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "ondidchangesessions",
      children: "onDidChangeSessions"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "readonly"
        }), " ", (0,jsx_runtime.jsx)(_components.strong, {
          children: "onDidChangeSessions"
        }), ": ", (0,jsx_runtime.jsx)(_components.a, {
          href: "/api/interfaces/Event",
          children: (0,jsx_runtime.jsx)(_components.code, {
            children: "Event"
          })
        }), "<", (0,jsx_runtime.jsx)(_components.a, {
          href: "/api/interfaces/AuthenticationProviderAuthenticationSessionsChangeEvent",
          children: (0,jsx_runtime.jsx)(_components.code, {
            children: "AuthenticationProviderAuthenticationSessionsChangeEvent"
          })
        }), ">"]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/e2548979c7e953e1419312e49836407008d44c21/packages/extension-api/src/extension-api.d.ts#L4415",
        children: "packages/extension-api/src/extension-api.d.ts:4415"
      })]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["An ", (0,jsx_runtime.jsx)(_components.a, {
        href: "#Event",
        children: "event"
      }), " which fires when the array of sessions has changed, or data\nwithin a session has changed."]
    }), "\n", (0,jsx_runtime.jsx)(_components.h2, {
      id: "methods",
      children: "Methods"
    }), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "createsession",
      children: "createSession()"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.strong, {
          children: "createSession"
        }), "(", (0,jsx_runtime.jsx)(_components.code, {
          children: "scopes"
        }), "): ", (0,jsx_runtime.jsx)(_components.code, {
          children: "Promise"
        }), "<", (0,jsx_runtime.jsx)(_components.a, {
          href: "/api/interfaces/AuthenticationSession",
          children: (0,jsx_runtime.jsx)(_components.code, {
            children: "AuthenticationSession"
          })
        }), ">"]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/e2548979c7e953e1419312e49836407008d44c21/packages/extension-api/src/extension-api.d.ts#L4438",
        children: "packages/extension-api/src/extension-api.d.ts:4438"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Prompts a user to login."
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "If login is successful, the onDidChangeSessions event should be fired."
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "If login fails, a rejected promise should be returned."
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "If the provider has specified that it does not support multiple accounts,\nthen this should never be called if there is already an existing session matching these\nscopes."
    }), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "parameters",
      children: "Parameters"
    }), "\n", (0,jsx_runtime.jsx)(_components.h5, {
      id: "scopes",
      children: "scopes"
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: [(0,jsx_runtime.jsx)(_components.code, {
        children: "string"
      }), "[]"]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "A list of scopes, permissions, that the new session should be created with."
    }), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "returns",
      children: "Returns"
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: [(0,jsx_runtime.jsx)(_components.code, {
        children: "Promise"
      }), "<", (0,jsx_runtime.jsx)(_components.a, {
        href: "/api/interfaces/AuthenticationSession",
        children: (0,jsx_runtime.jsx)(_components.code, {
          children: "AuthenticationSession"
        })
      }), ">"]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "A promise that resolves to an authentication session."
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "getsessions",
      children: "getSessions()"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.strong, {
          children: "getSessions"
        }), "(", (0,jsx_runtime.jsx)(_components.code, {
          children: "scopes?"
        }), "): ", (0,jsx_runtime.jsx)(_components.code, {
          children: "Promise"
        }), "<readonly ", (0,jsx_runtime.jsx)(_components.a, {
          href: "/api/interfaces/AuthenticationSession",
          children: (0,jsx_runtime.jsx)(_components.code, {
            children: "AuthenticationSession"
          })
        }), "[]>"]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/e2548979c7e953e1419312e49836407008d44c21/packages/extension-api/src/extension-api.d.ts#L4423",
        children: "packages/extension-api/src/extension-api.d.ts:4423"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Get a list of sessions."
    }), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "parameters-1",
      children: "Parameters"
    }), "\n", (0,jsx_runtime.jsx)(_components.h5, {
      id: "scopes-1",
      children: "scopes?"
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: [(0,jsx_runtime.jsx)(_components.code, {
        children: "string"
      }), "[]"]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "An optional list of scopes. If provided, the sessions returned should match\nthese permissions, otherwise all sessions should be returned."
    }), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "returns-1",
      children: "Returns"
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: [(0,jsx_runtime.jsx)(_components.code, {
        children: "Promise"
      }), "<readonly ", (0,jsx_runtime.jsx)(_components.a, {
        href: "/api/interfaces/AuthenticationSession",
        children: (0,jsx_runtime.jsx)(_components.code, {
          children: "AuthenticationSession"
        })
      }), "[]>"]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "A promise that resolves to an array of authentication sessions."
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "removesession",
      children: "removeSession()"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.strong, {
          children: "removeSession"
        }), "(", (0,jsx_runtime.jsx)(_components.code, {
          children: "sessionId"
        }), "): ", (0,jsx_runtime.jsx)(_components.code, {
          children: "Promise"
        }), "<", (0,jsx_runtime.jsx)(_components.code, {
          children: "void"
        }), ">"]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/e2548979c7e953e1419312e49836407008d44c21/packages/extension-api/src/extension-api.d.ts#L4448",
        children: "packages/extension-api/src/extension-api.d.ts:4448"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Removes the session corresponding to session id."
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "If the removal is successful, the onDidChangeSessions event should be fired."
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "If a session cannot be removed, the provider should reject with an error message."
    }), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "parameters-2",
      children: "Parameters"
    }), "\n", (0,jsx_runtime.jsx)(_components.h5, {
      id: "sessionid",
      children: "sessionId"
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        children: "string"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "The id of the session to remove."
    }), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "returns-2",
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