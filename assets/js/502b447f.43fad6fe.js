"use strict";
(globalThis["webpackChunkdocs"] = globalThis["webpackChunkdocs"] || []).push([[31383],{

/***/ 48239
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  assets: () => (/* binding */ assets),
  contentTitle: () => (/* binding */ contentTitle),
  "default": () => (/* binding */ MDXContent),
  frontMatter: () => (/* binding */ frontMatter),
  metadata: () => (/* reexport */ site_docs_migrating_from_docker_index_mdx_502_namespaceObject),
  toc: () => (/* binding */ toc)
});

;// ./.docusaurus/docusaurus-plugin-content-docs/default/site-docs-migrating-from-docker-index-mdx-502.json
const site_docs_migrating_from_docker_index_mdx_502_namespaceObject = /*#__PURE__*/JSON.parse('{"id":"migrating-from-docker/index","title":"Migrating from Docker","description":"Migrate transparently from Docker to Podman, and continue using familiar workflows.","source":"@site/docs/migrating-from-docker/index.mdx","sourceDirName":"migrating-from-docker","slug":"/migrating-from-docker/","permalink":"/docs/migrating-from-docker/","draft":false,"unlisted":false,"editUrl":"https://github.com/podman-desktop/podman-desktop/tree/main/website/docs/migrating-from-docker/index.mdx","tags":[{"inline":true,"label":"migrating-from-docker","permalink":"/docs/tags/migrating-from-docker"}],"version":"current","sidebarPosition":25,"frontMatter":{"sidebar_position":25,"title":"Migrating from Docker","description":"Migrate transparently from Docker to Podman, and continue using familiar workflows.","keywords":["podman desktop","podman","containers","migrating","docker"],"tags":["migrating-from-docker"]},"sidebar":"mySidebar","previous":{"title":"Accessing Podman from another WSL distribution (Windows)","permalink":"/docs/podman/accessing-podman-from-another-wsl-instance"},"next":{"title":"Importing saved containers","permalink":"/docs/migrating-from-docker/importing-saved-containers"}}');
// EXTERNAL MODULE: ../node_modules/react/jsx-runtime.js
var jsx_runtime = __webpack_require__(62540);
// EXTERNAL MODULE: ../node_modules/@mdx-js/react/lib/index.js
var lib = __webpack_require__(43023);
;// ./docs/migrating-from-docker/index.mdx


const frontMatter = {
	sidebar_position: 25,
	title: 'Migrating from Docker',
	description: 'Migrate transparently from Docker to Podman, and continue using familiar workflows.',
	keywords: [
		'podman desktop',
		'podman',
		'containers',
		'migrating',
		'docker'
	],
	tags: [
		'migrating-from-docker'
	]
};
const contentTitle = 'Migration from Docker to Podman Desktop';

const assets = {

};



const toc = [];
function _createMdxContent(props) {
  const _components = {
    a: "a",
    code: "code",
    h1: "h1",
    header: "header",
    li: "li",
    p: "p",
    ul: "ul",
    ...(0,lib/* useMDXComponents */.R)(),
    ...props.components
  };
  return (0,jsx_runtime.jsxs)(jsx_runtime.Fragment, {
    children: [(0,jsx_runtime.jsx)(_components.header, {
      children: (0,jsx_runtime.jsx)(_components.h1, {
        id: "migration-from-docker-to-podman-desktop",
        children: "Migration from Docker to Podman Desktop"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "If you have used Docker in the past, you can continue using familiar workflows with the Docker compatibility feature of Podman Desktop."
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Docker compatibility is a way to configure an environment in which you can run your Docker applications, commands, and tools on a Podman engine without reconfiguration. It encompasses these stages:"
    }), "\n", (0,jsx_runtime.jsxs)(_components.ul, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: [(0,jsx_runtime.jsx)(_components.a, {
          href: "/docs/migrating-from-docker/importing-saved-containers",
          children: "Import your saved containers"
        }), " into Podman Desktop using CLI."]
      }), "\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: ["Enable the ", (0,jsx_runtime.jsx)(_components.a, {
          href: "/docs/migrating-from-docker/customizing-docker-compatibility#enable-docker-compatibility",
          children: "Docker Compatibility"
        }), " feature."]
      }), "\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: [(0,jsx_runtime.jsx)(_components.a, {
          href: "/docs/migrating-from-docker/aliasing-the-docker-cli",
          children: "Alias the Docker CLI"
        }), " so that the ", (0,jsx_runtime.jsx)(_components.code, {
          children: "docker"
        }), " command runs Podman."]
      }), "\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: [(0,jsx_runtime.jsx)(_components.a, {
          href: "/docs/migrating-from-docker/managing-docker-compatibility",
          children: "Access the Docker Compatibility settings"
        }), " to configure a Docker-compatible environment."]
      }), "\n"]
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