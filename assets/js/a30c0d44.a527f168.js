"use strict";
(globalThis["webpackChunkdocs"] = globalThis["webpackChunkdocs"] || []).push([[73800],{

/***/ 9228
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  assets: () => (/* binding */ assets),
  contentTitle: () => (/* binding */ contentTitle),
  "default": () => (/* binding */ MDXContent),
  frontMatter: () => (/* binding */ frontMatter),
  metadata: () => (/* reexport */ site_api_interfaces_input_box_options_md_a30_namespaceObject),
  toc: () => (/* binding */ toc)
});

;// ./.docusaurus/docusaurus-plugin-content-docs/api/site-api-interfaces-input-box-options-md-a30.json
const site_api_interfaces_input_box_options_md_a30_namespaceObject = /*#__PURE__*/JSON.parse('{"id":"interfaces/InputBoxOptions","title":"Interface: InputBoxOptions","description":"Defined in1464","source":"@site/api/interfaces/InputBoxOptions.md","sourceDirName":"interfaces","slug":"/interfaces/InputBoxOptions","permalink":"/api/interfaces/InputBoxOptions","draft":false,"unlisted":false,"tags":[],"version":"current","frontMatter":{},"sidebar":"typedocSidebar","previous":{"title":"ImageInspectInfo","permalink":"/api/interfaces/ImageInspectInfo"},"next":{"title":"InputBoxValidationMessage","permalink":"/api/interfaces/InputBoxValidationMessage"}}');
// EXTERNAL MODULE: ../node_modules/react/jsx-runtime.js
var jsx_runtime = __webpack_require__(62540);
// EXTERNAL MODULE: ../node_modules/@mdx-js/react/lib/index.js
var lib = __webpack_require__(43023);
;// ./api/interfaces/InputBoxOptions.md


const frontMatter = {};
const contentTitle = 'Interface: InputBoxOptions';

const assets = {

};



const toc = [{
  "value": "Properties",
  "id": "properties",
  "level": 2
}, {
  "value": "ignoreFocusOut?",
  "id": "ignorefocusout",
  "level": 3
}, {
  "value": "markdownDescription?",
  "id": "markdowndescription",
  "level": 3
}, {
  "value": "multiline?",
  "id": "multiline",
  "level": 3
}, {
  "value": "password?",
  "id": "password",
  "level": 3
}, {
  "value": "placeHolder?",
  "id": "placeholder",
  "level": 3
}, {
  "value": "prompt?",
  "id": "prompt",
  "level": 3
}, {
  "value": "title?",
  "id": "title",
  "level": 3
}, {
  "value": "value?",
  "id": "value",
  "level": 3
}, {
  "value": "valueSelection?",
  "id": "valueselection",
  "level": 3
}, {
  "value": "Methods",
  "id": "methods",
  "level": 2
}, {
  "value": "validateInput()?",
  "id": "validateinput",
  "level": 3
}, {
  "value": "Parameters",
  "id": "parameters",
  "level": 4
}, {
  "value": "value",
  "id": "value-1",
  "level": 5
}, {
  "value": "Returns",
  "id": "returns",
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
        id: "interface-inputboxoptions",
        children: "Interface: InputBoxOptions"
      })
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/e2548979c7e953e1419312e49836407008d44c21/packages/extension-api/src/extension-api.d.ts#L1464",
        children: "packages/extension-api/src/extension-api.d.ts:1464"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Options to configure the behavior of the input box UI."
    }), "\n", (0,jsx_runtime.jsx)(_components.h2, {
      id: "properties",
      children: "Properties"
    }), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "ignorefocusout",
      children: "ignoreFocusOut?"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "optional"
        }), " ", (0,jsx_runtime.jsx)(_components.strong, {
          children: "ignoreFocusOut?"
        }), ": ", (0,jsx_runtime.jsx)(_components.code, {
          children: "boolean"
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/e2548979c7e953e1419312e49836407008d44c21/packages/extension-api/src/extension-api.d.ts#L1507",
        children: "packages/extension-api/src/extension-api.d.ts:1507"
      })]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Set to ", (0,jsx_runtime.jsx)(_components.code, {
        children: "true"
      }), " to keep the input box open when focus moves to another part of the editor or to another window.\nThis setting is ignored on iPad and is always false."]
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "markdowndescription",
      children: "markdownDescription?"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "optional"
        }), " ", (0,jsx_runtime.jsx)(_components.strong, {
          children: "markdownDescription?"
        }), ": ", (0,jsx_runtime.jsx)(_components.code, {
          children: "string"
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/e2548979c7e953e1419312e49836407008d44c21/packages/extension-api/src/extension-api.d.ts#L1491",
        children: "packages/extension-api/src/extension-api.d.ts:1491"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "A description of the field to be show (Markdown format)"
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "multiline",
      children: "multiline?"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "optional"
        }), " ", (0,jsx_runtime.jsx)(_components.strong, {
          children: "multiline?"
        }), ": ", (0,jsx_runtime.jsx)(_components.code, {
          children: "boolean"
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/e2548979c7e953e1419312e49836407008d44c21/packages/extension-api/src/extension-api.d.ts#L1512",
        children: "packages/extension-api/src/extension-api.d.ts:1512"
      })]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Set to ", (0,jsx_runtime.jsx)(_components.code, {
        children: "true"
      }), " when value represents a multi line content."]
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "password",
      children: "password?"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "optional"
        }), " ", (0,jsx_runtime.jsx)(_components.strong, {
          children: "password?"
        }), ": ", (0,jsx_runtime.jsx)(_components.code, {
          children: "boolean"
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/e2548979c7e953e1419312e49836407008d44c21/packages/extension-api/src/extension-api.d.ts#L1501",
        children: "packages/extension-api/src/extension-api.d.ts:1501"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Controls if a password input is shown. Password input hides the typed text."
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "placeholder",
      children: "placeHolder?"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "optional"
        }), " ", (0,jsx_runtime.jsx)(_components.strong, {
          children: "placeHolder?"
        }), ": ", (0,jsx_runtime.jsx)(_components.code, {
          children: "string"
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/e2548979c7e953e1419312e49836407008d44c21/packages/extension-api/src/extension-api.d.ts#L1496",
        children: "packages/extension-api/src/extension-api.d.ts:1496"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "An optional string to show as placeholder in the input box to guide the user what to type."
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "prompt",
      children: "prompt?"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "optional"
        }), " ", (0,jsx_runtime.jsx)(_components.strong, {
          children: "prompt?"
        }), ": ", (0,jsx_runtime.jsx)(_components.code, {
          children: "string"
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/e2548979c7e953e1419312e49836407008d44c21/packages/extension-api/src/extension-api.d.ts#L1486",
        children: "packages/extension-api/src/extension-api.d.ts:1486"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "The text to display underneath the input box."
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "title",
      children: "title?"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "optional"
        }), " ", (0,jsx_runtime.jsx)(_components.strong, {
          children: "title?"
        }), ": ", (0,jsx_runtime.jsx)(_components.code, {
          children: "string"
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/e2548979c7e953e1419312e49836407008d44c21/packages/extension-api/src/extension-api.d.ts#L1468",
        children: "packages/extension-api/src/extension-api.d.ts:1468"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "An optional string that represents the title of the input box."
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "value",
      children: "value?"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "optional"
        }), " ", (0,jsx_runtime.jsx)(_components.strong, {
          children: "value?"
        }), ": ", (0,jsx_runtime.jsx)(_components.code, {
          children: "string"
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/e2548979c7e953e1419312e49836407008d44c21/packages/extension-api/src/extension-api.d.ts#L1473",
        children: "packages/extension-api/src/extension-api.d.ts:1473"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "The value to pre-fill in the input box."
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "valueselection",
      children: "valueSelection?"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "optional"
        }), " ", (0,jsx_runtime.jsx)(_components.strong, {
          children: "valueSelection?"
        }), ": [", (0,jsx_runtime.jsx)(_components.code, {
          children: "number"
        }), ", ", (0,jsx_runtime.jsx)(_components.code, {
          children: "number"
        }), "]"]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/e2548979c7e953e1419312e49836407008d44c21/packages/extension-api/src/extension-api.d.ts#L1481",
        children: "packages/extension-api/src/extension-api.d.ts:1481"
      })]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Selection of the pre-filled ", (0,jsx_runtime.jsx)(_components.a, {
        href: "#value",
        children: (0,jsx_runtime.jsx)(_components.code, {
          children: "value"
        })
      }), ". Defined as tuple of two number where the\nfirst is the inclusive start index and the second the exclusive end index. When ", (0,jsx_runtime.jsx)(_components.code, {
        children: "undefined"
      }), " the whole\npre-filled value will be selected, when empty (start equals end) only the cursor will be set,\notherwise the defined range will be selected."]
    }), "\n", (0,jsx_runtime.jsx)(_components.h2, {
      id: "methods",
      children: "Methods"
    }), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "validateinput",
      children: "validateInput()?"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "optional"
        }), " ", (0,jsx_runtime.jsx)(_components.strong, {
          children: "validateInput"
        }), "(", (0,jsx_runtime.jsx)(_components.code, {
          children: "value"
        }), "): ", (0,jsx_runtime.jsx)(_components.code, {
          children: "string"
        }), " | ", (0,jsx_runtime.jsx)(_components.a, {
          href: "/api/interfaces/InputBoxValidationMessage",
          children: (0,jsx_runtime.jsx)(_components.code, {
            children: "InputBoxValidationMessage"
          })
        }), " | ", (0,jsx_runtime.jsx)(_components.code, {
          children: "Promise"
        }), "<", (0,jsx_runtime.jsx)(_components.code, {
          children: "string"
        }), " | ", (0,jsx_runtime.jsx)(_components.a, {
          href: "/api/interfaces/InputBoxValidationMessage",
          children: (0,jsx_runtime.jsx)(_components.code, {
            children: "InputBoxValidationMessage"
          })
        }), " | ", (0,jsx_runtime.jsx)(_components.code, {
          children: "null"
        }), " | ", (0,jsx_runtime.jsx)(_components.code, {
          children: "undefined"
        }), "> | ", (0,jsx_runtime.jsx)(_components.code, {
          children: "null"
        }), " | ", (0,jsx_runtime.jsx)(_components.code, {
          children: "undefined"
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/e2548979c7e953e1419312e49836407008d44c21/packages/extension-api/src/extension-api.d.ts#L1522",
        children: "packages/extension-api/src/extension-api.d.ts:1522"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "An optional function that will be called to validate input and to give a hint\nto the user."
    }), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "parameters",
      children: "Parameters"
    }), "\n", (0,jsx_runtime.jsx)(_components.h5, {
      id: "value-1",
      children: "value"
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        children: "string"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "The current value of the input box."
    }), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "returns",
      children: "Returns"
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: [(0,jsx_runtime.jsx)(_components.code, {
        children: "string"
      }), " | ", (0,jsx_runtime.jsx)(_components.a, {
        href: "/api/interfaces/InputBoxValidationMessage",
        children: (0,jsx_runtime.jsx)(_components.code, {
          children: "InputBoxValidationMessage"
        })
      }), " | ", (0,jsx_runtime.jsx)(_components.code, {
        children: "Promise"
      }), "<", (0,jsx_runtime.jsx)(_components.code, {
        children: "string"
      }), " | ", (0,jsx_runtime.jsx)(_components.a, {
        href: "/api/interfaces/InputBoxValidationMessage",
        children: (0,jsx_runtime.jsx)(_components.code, {
          children: "InputBoxValidationMessage"
        })
      }), " | ", (0,jsx_runtime.jsx)(_components.code, {
        children: "null"
      }), " | ", (0,jsx_runtime.jsx)(_components.code, {
        children: "undefined"
      }), "> | ", (0,jsx_runtime.jsx)(_components.code, {
        children: "null"
      }), " | ", (0,jsx_runtime.jsx)(_components.code, {
        children: "undefined"
      })]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Either a human-readable string which is presented as an error message or an ", (0,jsx_runtime.jsx)(_components.a, {
        href: "/api/interfaces/InputBoxValidationMessage",
        children: "InputBoxValidationMessage"
      }), "\nwhich can provide a specific message severity. Return ", (0,jsx_runtime.jsx)(_components.code, {
        children: "undefined"
      }), ", ", (0,jsx_runtime.jsx)(_components.code, {
        children: "null"
      }), ", or the empty string when 'value' is valid."]
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