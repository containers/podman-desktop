"use strict";
(globalThis["webpackChunkdocs"] = globalThis["webpackChunkdocs"] || []).push([[30487],{

/***/ 81064
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  assets: () => (/* binding */ assets),
  contentTitle: () => (/* binding */ contentTitle),
  "default": () => (/* binding */ MDXContent),
  frontMatter: () => (/* binding */ frontMatter),
  metadata: () => (/* reexport */ site_api_interfaces_authentication_provider_authentication_sessions_change_event_md_814_namespaceObject),
  toc: () => (/* binding */ toc)
});

;// ./.docusaurus/docusaurus-plugin-content-docs/api/site-api-interfaces-authentication-provider-authentication-sessions-change-event-md-814.json
const site_api_interfaces_authentication_provider_authentication_sessions_change_event_md_814_namespaceObject = /*#__PURE__*/JSON.parse('{"id":"interfaces/AuthenticationProviderAuthenticationSessionsChangeEvent","title":"Interface: AuthenticationProviderAuthenticationSessionsChangeEvent","description":"Defined in4388","source":"@site/api/interfaces/AuthenticationProviderAuthenticationSessionsChangeEvent.md","sourceDirName":"interfaces","slug":"/interfaces/AuthenticationProviderAuthenticationSessionsChangeEvent","permalink":"/api/interfaces/AuthenticationProviderAuthenticationSessionsChangeEvent","draft":false,"unlisted":false,"tags":[],"version":"current","frontMatter":{},"sidebar":"typedocSidebar","previous":{"title":"AuthenticationProvider","permalink":"/api/interfaces/AuthenticationProvider"},"next":{"title":"AuthenticationProviderInformation","permalink":"/api/interfaces/AuthenticationProviderInformation"}}');
// EXTERNAL MODULE: ../node_modules/react/jsx-runtime.js
var jsx_runtime = __webpack_require__(62540);
// EXTERNAL MODULE: ../node_modules/@mdx-js/react/lib/index.js
var lib = __webpack_require__(43023);
;// ./api/interfaces/AuthenticationProviderAuthenticationSessionsChangeEvent.md


const frontMatter = {};
const contentTitle = 'Interface: AuthenticationProviderAuthenticationSessionsChangeEvent';

const assets = {

};



const toc = [{
  "value": "Properties",
  "id": "properties",
  "level": 2
}, {
  "value": "added?",
  "id": "added",
  "level": 3
}, {
  "value": "changed?",
  "id": "changed",
  "level": 3
}, {
  "value": "removed?",
  "id": "removed",
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
    p: "p",
    strong: "strong",
    ...(0,lib/* useMDXComponents */.R)(),
    ...props.components
  };
  return (0,jsx_runtime.jsxs)(jsx_runtime.Fragment, {
    children: [(0,jsx_runtime.jsx)(_components.header, {
      children: (0,jsx_runtime.jsx)(_components.h1, {
        id: "interface-authenticationproviderauthenticationsessionschangeevent",
        children: "Interface: AuthenticationProviderAuthenticationSessionsChangeEvent"
      })
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/3ac8e0951023982b58c717ba869e7f7374702e83/packages/extension-api/src/extension-api.d.ts#L4388",
        children: "packages/extension-api/src/extension-api.d.ts:4388"
      })]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["An ", (0,jsx_runtime.jsx)(_components.a, {
        href: "#Event",
        children: "event"
      }), " which fires when an ", (0,jsx_runtime.jsx)(_components.a, {
        href: "#AuthenticationSession",
        children: "AuthenticationSession"
      }), " is added, removed, or changed."]
    }), "\n", (0,jsx_runtime.jsx)(_components.h2, {
      id: "properties",
      children: "Properties"
    }), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "added",
      children: "added?"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "readonly"
        }), " ", (0,jsx_runtime.jsx)(_components.code, {
          children: "optional"
        }), " ", (0,jsx_runtime.jsx)(_components.strong, {
          children: "added?"
        }), ": readonly ", (0,jsx_runtime.jsx)(_components.a, {
          href: "/api/interfaces/AuthenticationSession",
          children: (0,jsx_runtime.jsx)(_components.code, {
            children: "AuthenticationSession"
          })
        }), "[]"]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/3ac8e0951023982b58c717ba869e7f7374702e83/packages/extension-api/src/extension-api.d.ts#L4392",
        children: "packages/extension-api/src/extension-api.d.ts:4392"
      })]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["The ", (0,jsx_runtime.jsx)(_components.a, {
        href: "#AuthenticationSession",
        children: "AuthenticationSession"
      }), "s of the ", (0,jsx_runtime.jsx)(_components.a, {
        href: "#AuthentiationProvider",
        children: "AuthenticationProvider"
      }), " that have been added."]
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "changed",
      children: "changed?"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "readonly"
        }), " ", (0,jsx_runtime.jsx)(_components.code, {
          children: "optional"
        }), " ", (0,jsx_runtime.jsx)(_components.strong, {
          children: "changed?"
        }), ": readonly ", (0,jsx_runtime.jsx)(_components.a, {
          href: "/api/interfaces/AuthenticationSession",
          children: (0,jsx_runtime.jsx)(_components.code, {
            children: "AuthenticationSession"
          })
        }), "[]"]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/3ac8e0951023982b58c717ba869e7f7374702e83/packages/extension-api/src/extension-api.d.ts#L4404",
        children: "packages/extension-api/src/extension-api.d.ts:4404"
      })]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["The ", (0,jsx_runtime.jsx)(_components.a, {
        href: "#AuthenticationSession",
        children: "AuthenticationSession"
      }), "s of the ", (0,jsx_runtime.jsx)(_components.a, {
        href: "#AuthentiationProvider",
        children: "AuthenticationProvider"
      }), " that have been changed.\nA session changes when its data excluding the id are updated. An example of this is a session refresh that results in a new\naccess token being set for the session."]
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "removed",
      children: "removed?"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "readonly"
        }), " ", (0,jsx_runtime.jsx)(_components.code, {
          children: "optional"
        }), " ", (0,jsx_runtime.jsx)(_components.strong, {
          children: "removed?"
        }), ": readonly ", (0,jsx_runtime.jsx)(_components.a, {
          href: "/api/interfaces/AuthenticationSession",
          children: (0,jsx_runtime.jsx)(_components.code, {
            children: "AuthenticationSession"
          })
        }), "[]"]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/3ac8e0951023982b58c717ba869e7f7374702e83/packages/extension-api/src/extension-api.d.ts#L4397",
        children: "packages/extension-api/src/extension-api.d.ts:4397"
      })]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["The ", (0,jsx_runtime.jsx)(_components.a, {
        href: "#AuthenticationSession",
        children: "AuthenticationSession"
      }), "s of the ", (0,jsx_runtime.jsx)(_components.a, {
        href: "#AuthentiationProvider",
        children: "AuthenticationProvider"
      }), " that have been removed."]
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