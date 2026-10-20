"use strict";
(globalThis["webpackChunkdocs"] = globalThis["webpackChunkdocs"] || []).push([[23086],{

/***/ 58787
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   assets: () => (/* binding */ assets),
/* harmony export */   contentTitle: () => (/* binding */ contentTitle),
/* harmony export */   "default": () => (/* binding */ MDXContent),
/* harmony export */   frontMatter: () => (/* binding */ frontMatter),
/* harmony export */   metadata: () => (/* reexport default export from named module */ _site_docusaurus_docusaurus_plugin_content_blog_default_site_blog_2026_10_20_kubernetes_release_0_6_0_mdx_980_json__WEBPACK_IMPORTED_MODULE_0__),
/* harmony export */   toc: () => (/* binding */ toc)
/* harmony export */ });
/* harmony import */ var _site_docusaurus_docusaurus_plugin_content_blog_default_site_blog_2026_10_20_kubernetes_release_0_6_0_mdx_980_json__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(77771);
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(62540);
/* harmony import */ var _mdx_js_react__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(43023);
/* harmony import */ var _theme_ThemedImage__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(90448);


const frontMatter = {
	title: 'Kubernetes Extension Pack release for Podman Desktop',
	description: 'Kubernetes Extension Pack for Podman Desktop has been released!',
	slug: 'podman-desktop-kubernetes-extension-pack-release-2026-10',
	authors: [
		'phmartin'
	],
	tags: [
		'podman-desktop',
		'release',
		'kubernetes'
	],
	hide_table_of_contents: false,
	image: '/img/blog/podman-desktop-kubernetes-release-0.6.0/banner.png'
};
const contentTitle = undefined;

const assets = {
"authorsImageUrls": [undefined],
};




const toc = [];
function _createMdxContent(props) {
  const _components = {
    admonition: "admonition",
    img: "img",
    li: "li",
    p: "p",
    strong: "strong",
    ul: "ul",
    ...(0,_mdx_js_react__WEBPACK_IMPORTED_MODULE_2__/* .useMDXComponents */ .R)(),
    ...props.components
  };
  return (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.Fragment, {
    children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.p, {
      children: "Kubernetes Extension Pack for Podman Desktop Release! 🎉"
    }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.p, {
      children: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.img, {
        alt: "Kubernetes Dashboard screenshot",
        src: (__webpack_require__(98861)/* ["default"] */ .A) + "",
        width: "1101",
        height: "535"
      })
    }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.p, {
      children: "This Kubernetes Extension Pack release includes Kubernetes Dashboard v0.6.0, Kubernetes Contexts v0.3.0, and Kreate v0.4.0."
    }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.p, {
      children: ["The new releases have been added to the catalog.\nIf automatic extension updates are enabled (the default),\nPodman Desktop updates already installed extensions automatically.\nIf you have not installed the extensions,\nopen the ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.strong, {
        children: "Extensions > Catalog"
      }), " page,\nsearch for the Kubernetes Extension Pack\nor for Kubernetes Dashboard, Kubernetes Contexts, and Kreate,\nand install them."]
    }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.admonition, {
      type: "note",
      children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.p, {
        children: "Podman Desktop is moving Kubernetes dashboard and context management from core into extensions\nso they can evolve and release independently of the desktop app.\nThe Kubernetes Extension Pack remains available in Podman Desktop's catalog,\nmaking the full set easy to install while letting you choose individual extensions.\nThe Kubernetes Dashboard extension also exposes Kubernetes resource data through an API\nthat other extensions can use."
      }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.p, {
        children: "Installing either Kubernetes Dashboard or Kubernetes Contexts disables the corresponding feature in core.\nThe built-in features will not evolve and will be removed in a future release,\nso we recommend switching to the extensions for new features."
      })]
    }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.p, {
      children: "These extensions now include:"
    }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.ul, {
      children: ["\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.strong, {
          children: "Apply YAML"
        }), ": Apply Kubernetes YAML from a dedicated page in Kubernetes Dashboard."]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.strong, {
          children: "Container logs"
        }), ": View logs of terminated containers, unfollow the log stream, and see the configured tail line count in the terminal."]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.strong, {
          children: "Deployment scaling"
        }), ": Scale Deployments directly from the UI."]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.strong, {
          children: "Resource tables and details"
        }), ": Choose visible columns on all resource tables, see more information on the pod page, and view Internal IP on the nodes list."]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.strong, {
          children: "Collapsible navigation"
        }), ": Sidebar grouped into collapsible sections with icons, including a new Access Control section."]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.strong, {
          children: "New resource views"
        }), ": DaemonSets, StatefulSets, ReplicaSets, PersistentVolumes, StorageClasses, ServiceAccounts, Roles, RoleBindings, ClusterRoles, ClusterRoleBindings, Endpoints, EndpointSlices, NetworkPolicies, IngressClasses, HTTPRoutes, Gateways, GatewayClasses, ResourceQuotas, LimitRanges, PodDisruptionBudgets, PriorityClasses, RuntimeClasses, Leases, HorizontalPodAutoscalers, MutatingWebhookConfigurations, and ValidatingWebhookConfigurations."]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.strong, {
          children: "Lazy resource loading"
        }), ": Resources are watched on demand as you navigate."]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.strong, {
          children: "Extension API"
        }), ": Other extensions can access Kubernetes resource data, and data from the Discovery API."]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.strong, {
          children: "Context deletion confirmation"
        }), ": Kubernetes Contexts now always asks for confirmation before deleting a context."]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.strong, {
          children: "Kreate"
        }), ": Create namespaces, Jobs, and CronJobs, and select any Kubernetes resource type based on the Discovery API."]
      }), "\n"]
    })]
  });
}
function MDXContent(props = {}) {
  const {wrapper: MDXLayout} = {
    ...(0,_mdx_js_react__WEBPACK_IMPORTED_MODULE_2__/* .useMDXComponents */ .R)(),
    ...props.components
  };
  return MDXLayout ? (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(MDXLayout, {
    ...props,
    children: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_createMdxContent, {
      ...props
    })
  }) : _createMdxContent(props);
}



/***/ },

/***/ 98861
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   A: () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (__webpack_require__.p + "assets/images/banner-4c2c18ab77c36d726c5eac84a9a65fbf.png");

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


/***/ },

/***/ 77771
(module) {

module.exports = /*#__PURE__*/JSON.parse('{"permalink":"/blog/podman-desktop-kubernetes-extension-pack-release-2026-10","source":"@site/blog/2026-10-20-kubernetes-release-0.6.0.mdx","title":"Kubernetes Extension Pack release for Podman Desktop","description":"Kubernetes Extension Pack for Podman Desktop has been released!","date":"2026-10-20T00:00:00.000Z","tags":[{"inline":true,"label":"podman-desktop","permalink":"/blog/tags/podman-desktop"},{"inline":true,"label":"release","permalink":"/blog/tags/release"},{"inline":true,"label":"kubernetes","permalink":"/blog/tags/kubernetes"}],"readingTime":8.27,"hasTruncateMarker":true,"authors":[{"name":"Philippe Martin","title":"Principal Software Engineer","url":"https://github.com/feloy","imageURL":"https://github.com/feloy.png","key":"phmartin","page":null}],"frontMatter":{"title":"Kubernetes Extension Pack release for Podman Desktop","description":"Kubernetes Extension Pack for Podman Desktop has been released!","slug":"podman-desktop-kubernetes-extension-pack-release-2026-10","authors":["phmartin"],"tags":["podman-desktop","release","kubernetes"],"hide_table_of_contents":false,"image":"/img/blog/podman-desktop-kubernetes-release-0.6.0/banner.png"},"unlisted":false,"nextItem":{"title":"Podman Desktop 1.30 Release","permalink":"/blog/podman-desktop-release-1.30"}}');

/***/ }

}]);