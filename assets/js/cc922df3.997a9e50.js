"use strict";
(globalThis["webpackChunkdocs"] = globalThis["webpackChunkdocs"] || []).push([[9383],{

/***/ 90790
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  assets: () => (/* binding */ assets),
  contentTitle: () => (/* binding */ contentTitle),
  "default": () => (/* binding */ MDXContent),
  frontMatter: () => (/* binding */ frontMatter),
  metadata: () => (/* reexport */ site_api_interfaces_authentication_get_session_options_md_cc9_namespaceObject),
  toc: () => (/* binding */ toc)
});

;// ./.docusaurus/docusaurus-plugin-content-docs/api/site-api-interfaces-authentication-get-session-options-md-cc9.json
const site_api_interfaces_authentication_get_session_options_md_cc9_namespaceObject = /*#__PURE__*/JSON.parse('{"id":"interfaces/AuthenticationGetSessionOptions","title":"Interface: AuthenticationGetSessionOptions","description":"Defined in4295","source":"@site/api/interfaces/AuthenticationGetSessionOptions.md","sourceDirName":"interfaces","slug":"/interfaces/AuthenticationGetSessionOptions","permalink":"/api/interfaces/AuthenticationGetSessionOptions","draft":false,"unlisted":false,"tags":[],"version":"current","frontMatter":{},"sidebar":"typedocSidebar","previous":{"title":"AuthConfig","permalink":"/api/interfaces/AuthConfig"},"next":{"title":"AuthenticationProvider","permalink":"/api/interfaces/AuthenticationProvider"}}');
// EXTERNAL MODULE: ../node_modules/react/jsx-runtime.js
var jsx_runtime = __webpack_require__(62540);
// EXTERNAL MODULE: ../node_modules/@mdx-js/react/lib/index.js
var lib = __webpack_require__(43023);
;// ./api/interfaces/AuthenticationGetSessionOptions.md


const frontMatter = {};
const contentTitle = 'Interface: AuthenticationGetSessionOptions';

const assets = {

};



const toc = [{
  "value": "Properties",
  "id": "properties",
  "level": 2
}, {
  "value": "clearSessionPreference?",
  "id": "clearsessionpreference",
  "level": 3
}, {
  "value": "createIfNone?",
  "id": "createifnone",
  "level": 3
}, {
  "value": "forceNewSession?",
  "id": "forcenewsession",
  "level": 3
}, {
  "value": "silent?",
  "id": "silent",
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
        id: "interface-authenticationgetsessionoptions",
        children: "Interface: AuthenticationGetSessionOptions"
      })
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/67f78c387a02301536248eb9cf13a51bc904047e/packages/extension-api/src/extension-api.d.ts#L4295",
        children: "packages/extension-api/src/extension-api.d.ts:4295"
      })]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Options to be used when getting an ", (0,jsx_runtime.jsx)(_components.a, {
        href: "#AuthenticationSession",
        children: "AuthenticationSession"
      }), " from an ", (0,jsx_runtime.jsx)(_components.a, {
        href: "#AuthenticationProvider",
        children: "AuthenticationProvider"
      }), "."]
    }), "\n", (0,jsx_runtime.jsx)(_components.h2, {
      id: "properties",
      children: "Properties"
    }), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "clearsessionpreference",
      children: "clearSessionPreference?"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "optional"
        }), " ", (0,jsx_runtime.jsx)(_components.strong, {
          children: "clearSessionPreference?"
        }), ": ", (0,jsx_runtime.jsx)(_components.code, {
          children: "boolean"
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/67f78c387a02301536248eb9cf13a51bc904047e/packages/extension-api/src/extension-api.d.ts#L4319",
        children: "packages/extension-api/src/extension-api.d.ts:4319"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Whether the existing user session preference should be cleared."
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["For authentication providers that support being signed into multiple accounts at once, the user will be\nprompted to select an account to use when ", (0,jsx_runtime.jsx)(_components.a, {
        href: "#authentication.getSession",
        children: "getSession"
      }), " is called. This preference\nis remembered until ", (0,jsx_runtime.jsx)(_components.a, {
        href: "#authentication.getSession",
        children: "getSession"
      }), " is called with this flag."]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Defaults to false."
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "createifnone",
      children: "createIfNone?"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "optional"
        }), " ", (0,jsx_runtime.jsx)(_components.strong, {
          children: "createIfNone?"
        }), ": ", (0,jsx_runtime.jsx)(_components.code, {
          children: "boolean"
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/67f78c387a02301536248eb9cf13a51bc904047e/packages/extension-api/src/extension-api.d.ts#L4308",
        children: "packages/extension-api/src/extension-api.d.ts:4308"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Whether login should be performed if there is no matching session."
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "If true, a modal dialog will be shown asking the user to sign in. If false, a numbered badge will be shown\non the accounts activity bar icon. An entry for the extension will be added under the menu to sign in. This\nallows quietly prompting the user to sign in."
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "If there is a matching session but the extension has not been granted access to it, setting this to true\nwill also result in an immediate modal dialog, and false will add a numbered badge to the accounts icon."
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Defaults to false."
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "forcenewsession",
      children: "forceNewSession?"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "optional"
        }), " ", (0,jsx_runtime.jsx)(_components.strong, {
          children: "forceNewSession?"
        }), ": ", (0,jsx_runtime.jsx)(_components.code, {
          children: "boolean"
        }), " | { ", (0,jsx_runtime.jsx)(_components.code, {
          children: "detail"
        }), ": ", (0,jsx_runtime.jsx)(_components.code, {
          children: "string"
        }), "; }"]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/67f78c387a02301536248eb9cf13a51bc904047e/packages/extension-api/src/extension-api.d.ts#L4332",
        children: "packages/extension-api/src/extension-api.d.ts:4332"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Whether we should attempt to reauthenticate even if there is already a session available."
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "If true, a modal dialog will be shown asking the user to sign in again. This is mostly used for scenarios\nwhere the token needs to be re minted because it has lost some authorization."
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["If there are no existing sessions and forceNewSession is true, it will behave identically to\n", (0,jsx_runtime.jsx)(_components.a, {
        href: "#createifnone",
        children: "createIfNone"
      }), "."]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "This defaults to false."
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "silent",
      children: "silent?"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "optional"
        }), " ", (0,jsx_runtime.jsx)(_components.strong, {
          children: "silent?"
        }), ": ", (0,jsx_runtime.jsx)(_components.code, {
          children: "boolean"
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/67f78c387a02301536248eb9cf13a51bc904047e/packages/extension-api/src/extension-api.d.ts#L4344",
        children: "packages/extension-api/src/extension-api.d.ts:4344"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Whether we should show the indication to sign in in the Accounts menu."
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "If false, the user will be shown a badge on the Accounts menu with an option to sign in for the extension.\nIf true, no indication will be shown."
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Defaults to false."
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Note: you cannot use this option with any other options that prompt the user like ", (0,jsx_runtime.jsx)(_components.a, {
        href: "#createifnone",
        children: "createIfNone"
      }), "."]
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