"use strict";
(globalThis["webpackChunkdocs"] = globalThis["webpackChunkdocs"] || []).push([[68859],{

/***/ 28786
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  assets: () => (/* binding */ assets),
  contentTitle: () => (/* binding */ contentTitle),
  "default": () => (/* binding */ MDXContent),
  frontMatter: () => (/* binding */ frontMatter),
  metadata: () => (/* reexport */ site_api_podman_desktop_namespaces_window_functions_with_progress_md_466_namespaceObject),
  toc: () => (/* binding */ toc)
});

;// ./.docusaurus/docusaurus-plugin-content-docs/api/site-api-podman-desktop-namespaces-window-functions-with-progress-md-466.json
const site_api_podman_desktop_namespaces_window_functions_with_progress_md_466_namespaceObject = /*#__PURE__*/JSON.parse('{"id":"@podman-desktop/namespaces/window/functions/withProgress","title":"Function: withProgress()","description":"withProgress\\\\(options, task): Promise\\\\","source":"@site/api/@podman-desktop/namespaces/window/functions/withProgress.md","sourceDirName":"@podman-desktop/namespaces/window/functions","slug":"/@podman-desktop/namespaces/window/functions/withProgress","permalink":"/api/@podman-desktop/namespaces/window/functions/withProgress","draft":false,"unlisted":false,"tags":[],"version":"current","frontMatter":{},"sidebar":"typedocSidebar","previous":{"title":"showWarningMessage","permalink":"/api/@podman-desktop/namespaces/window/functions/showWarningMessage"},"next":{"title":"InputBoxValidationSeverity","permalink":"/api/enumerations/InputBoxValidationSeverity"}}');
// EXTERNAL MODULE: ../node_modules/react/jsx-runtime.js
var jsx_runtime = __webpack_require__(62540);
// EXTERNAL MODULE: ../node_modules/@mdx-js/react/lib/index.js
var lib = __webpack_require__(43023);
;// ./api/@podman-desktop/namespaces/window/functions/withProgress.md


const frontMatter = {};
const contentTitle = 'Function: withProgress()';

const assets = {

};



const toc = [{
  "value": "Type Parameters",
  "id": "type-parameters",
  "level": 2
}, {
  "value": "R",
  "id": "r",
  "level": 3
}, {
  "value": "Parameters",
  "id": "parameters",
  "level": 2
}, {
  "value": "options",
  "id": "options",
  "level": 3
}, {
  "value": "task",
  "id": "task",
  "level": 3
}, {
  "value": "Returns",
  "id": "returns",
  "level": 2
}, {
  "value": "Examples",
  "id": "examples",
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
        id: "function-withprogress",
        children: "Function: withProgress()"
      })
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.strong, {
          children: "withProgress"
        }), "<", (0,jsx_runtime.jsx)(_components.code, {
          children: "R"
        }), ">(", (0,jsx_runtime.jsx)(_components.code, {
          children: "options"
        }), ", ", (0,jsx_runtime.jsx)(_components.code, {
          children: "task"
        }), "): ", (0,jsx_runtime.jsx)(_components.code, {
          children: "Promise"
        }), "<", (0,jsx_runtime.jsx)(_components.code, {
          children: "R"
        }), ">"]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/fe8ffb0aa66cf732c3da599b2a893e5286ff1411/packages/extension-api/src/extension-api.d.ts#L2318",
        children: "packages/extension-api/src/extension-api.d.ts:2318"
      })]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Show progress in Podman Desktop. Progress is shown while running the given callback\nand while the promise it returned isn't resolved nor rejected. The location at which\nprogress should show (and other details) is defined via the passed ", (0,jsx_runtime.jsx)(_components.a, {
        href: "/api/interfaces/ProgressOptions",
        children: (0,jsx_runtime.jsx)(_components.code, {
          children: "ProgressOptions"
        })
      }), "."]
    }), "\n", (0,jsx_runtime.jsx)(_components.h2, {
      id: "type-parameters",
      children: "Type Parameters"
    }), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "r",
      children: "R"
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        children: "R"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.h2, {
      id: "parameters",
      children: "Parameters"
    }), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "options",
      children: "options"
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: (0,jsx_runtime.jsx)(_components.a, {
        href: "/api/interfaces/ProgressOptions",
        children: (0,jsx_runtime.jsx)(_components.code, {
          children: "ProgressOptions"
        })
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "the options for the task's details"
    }), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "task",
      children: "task"
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["(", (0,jsx_runtime.jsx)(_components.code, {
        children: "progress"
      }), ", ", (0,jsx_runtime.jsx)(_components.code, {
        children: "token"
      }), ") => ", (0,jsx_runtime.jsx)(_components.code, {
        children: "Promise"
      }), "<", (0,jsx_runtime.jsx)(_components.code, {
        children: "R"
      }), ">"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["A callback returning a promise. Progress state can be reported with\nthe provided ", (0,jsx_runtime.jsx)(_components.a, {
        href: "/api/interfaces/Progress",
        children: "Progress"
      }), "-object."]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["To report discrete progress, use ", (0,jsx_runtime.jsx)(_components.code, {
        children: "increment"
      }), " to indicate how much work has been completed. Each call with\na ", (0,jsx_runtime.jsx)(_components.code, {
        children: "increment"
      }), " value will be summed up and reflected as overall progress until 100% is reached (a value of\ne.g. ", (0,jsx_runtime.jsx)(_components.code, {
        children: "10"
      }), " accounts for ", (0,jsx_runtime.jsx)(_components.code, {
        children: "10%"
      }), " of work done).\nNote that currently only ", (0,jsx_runtime.jsx)(_components.code, {
        children: "ProgressLocation.Notification"
      }), " is capable of showing discrete progress."]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["To monitor if the operation has been cancelled by the user, use the provided ", (0,jsx_runtime.jsx)(_components.a, {
        href: "/api/interfaces/CancellationToken",
        children: (0,jsx_runtime.jsx)(_components.code, {
          children: "CancellationToken"
        })
      }), ".\nNote that currently only ", (0,jsx_runtime.jsx)(_components.code, {
        children: "ProgressLocation.Notification"
      }), " is supporting to show a cancel button to cancel the\nlong-running operation."]
    }), "\n", (0,jsx_runtime.jsx)(_components.h2, {
      id: "returns",
      children: "Returns"
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: [(0,jsx_runtime.jsx)(_components.code, {
        children: "Promise"
      }), "<", (0,jsx_runtime.jsx)(_components.code, {
        children: "R"
      }), ">"]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "The promise the task-callback returned."
    }), "\n", (0,jsx_runtime.jsx)(_components.h2, {
      id: "examples",
      children: "Examples"
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Here is a simple example"
    }), "\n", (0,jsx_runtime.jsx)(_components.pre, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        className: "language-ts",
        children: "await window.withProgress({ location: ProgressLocation.TASK_WIDGET, title: `Running task` },\n  async progress => {\n    progress.report({message: 'task1' });\n    await task1();\n    progress.report({increment: 50, message: 'task2' });\n    await task2();\n  },\n);\n"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "The error is propagated if thrown inside the task callback."
    }), "\n", (0,jsx_runtime.jsx)(_components.pre, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        className: "language-ts",
        children: "try {\n   await window.withProgress(\n       { location: ProgressLocation.TASK_WIDGET, title: `Running task` },\n       async progress => {\n          throw new Error('error when running a task');\n       },\n     );\n } catch (error) {\n    // do something with the error\n }\n"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "You can return a value from the task callback"
    }), "\n", (0,jsx_runtime.jsx)(_components.pre, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        className: "language-ts",
        children: "const result: number = await window.withProgress<number>(\n   { location: ProgressLocation.TASK_WIDGET, title: `Running task` },\n   async progress => {\n      // compute something\n      return 55;\n   },\n);\n"
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