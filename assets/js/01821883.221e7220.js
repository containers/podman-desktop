"use strict";
(globalThis["webpackChunkdocs"] = globalThis["webpackChunkdocs"] || []).push([[39004],{

/***/ 18380
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  assets: () => (/* binding */ assets),
  contentTitle: () => (/* binding */ contentTitle),
  "default": () => (/* binding */ MDXContent),
  frontMatter: () => (/* binding */ frontMatter),
  metadata: () => (/* reexport */ site_api_interfaces_device_request_md_018_namespaceObject),
  toc: () => (/* binding */ toc)
});

;// ./.docusaurus/docusaurus-plugin-content-docs/api/site-api-interfaces-device-request-md-018.json
const site_api_interfaces_device_request_md_018_namespaceObject = /*#__PURE__*/JSON.parse('{"id":"interfaces/DeviceRequest","title":"Interface: DeviceRequest","description":"Defined in2921","source":"@site/api/interfaces/DeviceRequest.md","sourceDirName":"interfaces","slug":"/interfaces/DeviceRequest","permalink":"/api/interfaces/DeviceRequest","draft":false,"unlisted":false,"tags":[],"version":"current","frontMatter":{},"sidebar":"typedocSidebar","previous":{"title":"DeviceMapping","permalink":"/api/interfaces/DeviceMapping"},"next":{"title":"EndpointIPAMConfig","permalink":"/api/interfaces/EndpointIPAMConfig"}}');
// EXTERNAL MODULE: ../node_modules/react/jsx-runtime.js
var jsx_runtime = __webpack_require__(62540);
// EXTERNAL MODULE: ../node_modules/@mdx-js/react/lib/index.js
var lib = __webpack_require__(43023);
;// ./api/interfaces/DeviceRequest.md


const frontMatter = {};
const contentTitle = 'Interface: DeviceRequest';

const assets = {

};



const toc = [{
  "value": "Properties",
  "id": "properties",
  "level": 2
}, {
  "value": "Capabilities?",
  "id": "capabilities",
  "level": 3
}, {
  "value": "Count?",
  "id": "count",
  "level": 3
}, {
  "value": "DeviceIDs?",
  "id": "deviceids",
  "level": 3
}, {
  "value": "Driver?",
  "id": "driver",
  "level": 3
}, {
  "value": "Options?",
  "id": "options",
  "level": 3
}, {
  "value": "Index Signature",
  "id": "index-signature",
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
        id: "interface-devicerequest",
        children: "Interface: DeviceRequest"
      })
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/278764c44a9f62c3dccbb0d3eb23ba1bd9bee7e1/packages/extension-api/src/extension-api.d.ts#L2921",
        children: "packages/extension-api/src/extension-api.d.ts:2921"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.h2, {
      id: "properties",
      children: "Properties"
    }), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "capabilities",
      children: "Capabilities?"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "optional"
        }), " ", (0,jsx_runtime.jsx)(_components.strong, {
          children: "Capabilities?"
        }), ": ", (0,jsx_runtime.jsx)(_components.code, {
          children: "string"
        }), "[][]"]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/278764c44a9f62c3dccbb0d3eb23ba1bd9bee7e1/packages/extension-api/src/extension-api.d.ts#L2925",
        children: "packages/extension-api/src/extension-api.d.ts:2925"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "count",
      children: "Count?"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "optional"
        }), " ", (0,jsx_runtime.jsx)(_components.strong, {
          children: "Count?"
        }), ": ", (0,jsx_runtime.jsx)(_components.code, {
          children: "number"
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/278764c44a9f62c3dccbb0d3eb23ba1bd9bee7e1/packages/extension-api/src/extension-api.d.ts#L2923",
        children: "packages/extension-api/src/extension-api.d.ts:2923"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "deviceids",
      children: "DeviceIDs?"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "optional"
        }), " ", (0,jsx_runtime.jsx)(_components.strong, {
          children: "DeviceIDs?"
        }), ": ", (0,jsx_runtime.jsx)(_components.code, {
          children: "string"
        }), "[]"]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/278764c44a9f62c3dccbb0d3eb23ba1bd9bee7e1/packages/extension-api/src/extension-api.d.ts#L2924",
        children: "packages/extension-api/src/extension-api.d.ts:2924"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "driver",
      children: "Driver?"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "optional"
        }), " ", (0,jsx_runtime.jsx)(_components.strong, {
          children: "Driver?"
        }), ": ", (0,jsx_runtime.jsx)(_components.code, {
          children: "string"
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/278764c44a9f62c3dccbb0d3eb23ba1bd9bee7e1/packages/extension-api/src/extension-api.d.ts#L2922",
        children: "packages/extension-api/src/extension-api.d.ts:2922"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "options",
      children: "Options?"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "optional"
        }), " ", (0,jsx_runtime.jsx)(_components.strong, {
          children: "Options?"
        }), ": ", (0,jsx_runtime.jsx)(_components.code, {
          children: "object"
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/278764c44a9f62c3dccbb0d3eb23ba1bd9bee7e1/packages/extension-api/src/extension-api.d.ts#L2926",
        children: "packages/extension-api/src/extension-api.d.ts:2926"
      })]
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