"use strict";
(globalThis["webpackChunkdocs"] = globalThis["webpackChunkdocs"] || []).push([[1438],{

/***/ 13697
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

/*truncate*/



const toc = [{
  "value": "Release details",
  "id": "release-details",
  "level": 2
}, {
  "value": "Apply YAML",
  "id": "apply-yaml",
  "level": 3
}, {
  "value": "Container logs",
  "id": "container-logs",
  "level": 3
}, {
  "value": "Deployment scaling",
  "id": "deployment-scaling",
  "level": 3
}, {
  "value": "Resource tables and details",
  "id": "resource-tables-and-details",
  "level": 3
}, {
  "value": "Collapsible navigation",
  "id": "collapsible-navigation",
  "level": 3
}, {
  "value": "New resource views",
  "id": "new-resource-views",
  "level": 3
}, {
  "value": "Lazy resource loading",
  "id": "lazy-resource-loading",
  "level": 3
}, {
  "value": "Extension API",
  "id": "extension-api",
  "level": 3
}, {
  "value": "Context deletion confirmation",
  "id": "context-deletion-confirmation",
  "level": 3
}, {
  "value": "Kreate",
  "id": "kreate",
  "level": 3
}, {
  "value": "Community meeting",
  "id": "community-meeting",
  "level": 2
}, {
  "value": "Final notes",
  "id": "final-notes",
  "level": 2
}];
function _createMdxContent(props) {
  const _components = {
    a: "a",
    admonition: "admonition",
    code: "code",
    h2: "h2",
    h3: "h3",
    hr: "hr",
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
    }), "\n", "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.h2, {
      id: "release-details",
      children: "Release details"
    }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.h3, {
      id: "apply-yaml",
      children: "Apply YAML"
    }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.p, {
      children: ["Kubernetes Dashboard now includes a dedicated ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.strong, {
        children: "Apply YAML"
      }), " page.\nOpen it from the ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.strong, {
        children: "Apply YAML"
      }), " button on resource list pages\nto apply manifests to your cluster without leaving Podman Desktop."]
    }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_theme_ThemedImage__WEBPACK_IMPORTED_MODULE_3__/* ["default"] */ .A, {
      alt: "Apply YAML page",
      sources: {
        light: (__webpack_require__(63507)/* ["default"] */ .A),
        dark: (__webpack_require__(7307)/* ["default"] */ .A)
      }
    }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.p, {
      children: ["You can apply YAML in two ways:\nselect a ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.code, {
        children: ".yaml"
      }), " or ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.code, {
        children: ".yml"
      }), " file from disk,\nor write custom YAML from scratch in the built-in editor.\nChoose the Kubernetes context to apply to,\nthen run the apply action."]
    }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.p, {
      children: ["The dashboard creates new resources on the cluster.\nIf an existing resource uses a supported built-in Kubernetes API,\nit is updated with a ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
        href: "https://kubernetes.io/docs/tasks/manage-kubernetes-objects/update-api-object-kubectl-patch/#strategic-merge-patch",
        children: "strategic merge patch"
      }), " (", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.code, {
        children: "Content-Type: application/strategic-merge-patch+json"
      }), ").\nThat patch type is not supported for CustomResourceDefinition APIs,\nso existing custom resources are not updated.\nWhen the apply completes, you get a summary of how many resources were applied and of which kinds."]
    }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.p, {
      children: ["You can still patch an existing resource from the YAML tab on its details page,\nincluding custom resources the dashboard shows such as Gateways.\nThat path uses a strategic merge patch for built-in APIs\nand ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
        href: "https://kubernetes.io/docs/reference/using-api/server-side-apply/",
        children: "server-side apply"
      }), " for kinds provided by a CustomResourceDefinition,\nwhich the API server accepts for those APIs."]
    }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.h3, {
      id: "container-logs",
      children: "Container logs"
    }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.p, {
      children: ["The ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.strong, {
        children: "Logs"
      }), " tab on a pod details page now makes it easier to inspect container output,\nincluding containers that have already stopped."]
    }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_theme_ThemedImage__WEBPACK_IMPORTED_MODULE_3__/* ["default"] */ .A, {
      alt: "Container logs page",
      sources: {
        light: (__webpack_require__(59362)/* ["default"] */ .A),
        dark: (__webpack_require__(11008)/* ["default"] */ .A)
      }
    }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.p, {
      children: ["You can open logs for a container that is no longer running.\nTerminated containers stay in the container list, marked as not running,\nso you can still read their previous output.\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.strong, {
        children: "Previous logs"
      }), " also works for restarted containers,\nso you can inspect the output from the previous instance."]
    }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.p, {
      children: ["Uncheck ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.strong, {
        children: "Stream logs"
      }), " to stop following the live stream\nand scroll through the captured lines at your own pace.\nThe ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.strong, {
        children: "Stream logs"
      }), " option is only shown for running containers."]
    }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.p, {
      children: "The line count you set is passed through to the terminal scrollback,\nso the terminal keeps the number of lines you requested."
    }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.h3, {
      id: "deployment-scaling",
      children: "Deployment scaling"
    }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.p, {
      children: "You can now scale a Deployment from the Deployments list,\nwithout opening kubectl or editing YAML."
    }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_theme_ThemedImage__WEBPACK_IMPORTED_MODULE_3__/* ["default"] */ .A, {
      alt: "Scaling a Deployment from the Deployments list",
      sources: {
        light: (__webpack_require__(54219)/* ["default"] */ .A),
        dark: (__webpack_require__(6163)/* ["default"] */ .A)
      }
    }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.p, {
      children: "Change the replica count in place on the Deployments list or details page,\nso you can add capacity or scale down without leaving the overview of status and conditions.\nThe change is applied only after you confirm it."
    }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.p, {
      children: ["Scaling updates the Kubernetes Deployment scale subresource.\nThat matters when your RBAC allows patching ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.code, {
        children: "deployments/scale"
      }), "\nbut not the Deployment itself."]
    }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.h3, {
      id: "resource-tables-and-details",
      children: "Resource tables and details"
    }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.p, {
      children: "Resource lists now let you choose which columns to show and in which order,\nso each table can match the information you actually use."
    }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_theme_ThemedImage__WEBPACK_IMPORTED_MODULE_3__/* ["default"] */ .A, {
      alt: "Column selection on a resource table",
      sources: {
        light: (__webpack_require__(44614)/* ["default"] */ .A),
        dark: (__webpack_require__(77279)/* ["default"] */ .A)
      }
    }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.p, {
      children: "Hide columns you do not need, bring the ones you care about forward, and reset to the default layout when you want a clean slate.\nThis uses the same column editing as other Podman Desktop tables,\nand it is available on every resource table, not only Pods."
    }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.p, {
      children: "The pod details page also shows more of the workload context,\nand the Nodes list includes an Internal IP column\nso you can find a node's cluster address without leaving the dashboard."
    }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.h3, {
      id: "collapsible-navigation",
      children: "Collapsible navigation"
    }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.p, {
      children: "The sidebar is grouped into collapsible sections,\nso the many new resource types stay organized instead of filling a long flat list."
    }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_theme_ThemedImage__WEBPACK_IMPORTED_MODULE_3__/* ["default"] */ .A, {
      alt: "Collapsible navigation sections",
      sources: {
        light: (__webpack_require__(57074)/* ["default"] */ .A),
        dark: (__webpack_require__(67792)/* ["default"] */ .A)
      }
    }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.p, {
      children: "Resources are grouped under Compute, Config, Network, Storage, and a new Access Control section for RBAC.\nCollapse the areas you are not using to keep the sidebar scannable.\nThe dashboard remembers which sections you left open,\nand expands a section when you open a resource that belongs to it.\nFor example, opening a Service from the dashboard expands Network\neven if that section was collapsed."
    }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.h3, {
      id: "new-resource-views",
      children: "New resource views"
    }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.p, {
      children: "Kubernetes Dashboard now covers many more resource kinds,\nso you can inspect more of the cluster without switching to kubectl."
    }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.p, {
      children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.strong, {
        children: "Compute:"
      }), " DaemonSets, StatefulSets, and ReplicaSets."]
    }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.p, {
      children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.strong, {
        children: "Storage:"
      }), " PersistentVolumes and StorageClasses."]
    }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.p, {
      children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.strong, {
        children: "Network:"
      }), " Endpoints, EndpointSlices, NetworkPolicies, IngressClasses, HTTPRoutes, Gateways, and GatewayClasses."]
    }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.p, {
      children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.strong, {
        children: "Config:"
      }), " ServiceAccounts, ResourceQuotas, LimitRanges, PodDisruptionBudgets, PriorityClasses, RuntimeClasses, Leases, HorizontalPodAutoscalers, MutatingWebhookConfigurations, and ValidatingWebhookConfigurations."]
    }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.p, {
      children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.strong, {
        children: "Access Control:"
      }), " Roles, RoleBindings, ClusterRoles, and ClusterRoleBindings."]
    }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.h3, {
      id: "lazy-resource-loading",
      children: "Lazy resource loading"
    }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.p, {
      children: "The dashboard no longer watches every resource kind as soon as you connect.\nIt starts watching a kind when you open that resource's page."
    }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.p, {
      children: "Common resources such as Pods, Deployments, and Services are still watched immediately,\nso the dashboard overview can show live counts.\nThe many new kinds, such as Roles, Gateways, StorageClasses, and many more, wait until you visit them.\nThat keeps startup faster and reduces load on the API server."
    }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.h3, {
      id: "extension-api",
      children: "Extension API"
    }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.p, {
      children: "Other Podman Desktop extensions can now use the Kubernetes Dashboard API\ninstead of opening their own connection to the cluster."
    }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.p, {
      children: "They can subscribe to live resource data, context health, and permissions\nfrom the dashboard's existing watches.\nKubernetes Contexts uses that subscriber for the state of each context,\ninstead of watching the cluster on its own."
    }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.p, {
      children: "They can also call the Kubernetes Discovery API\nto learn which API groups and kinds are served by the cluster.\nThat is how Kreate can offer any resource type the cluster knows about,\nnot only a hardcoded list."
    }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.p, {
      children: ["Extensions that use this API need the ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
        href: "https://www.npmjs.com/package/@podman-desktop/kubernetes-dashboard-extension-api",
        children: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.code, {
          children: "@podman-desktop/kubernetes-dashboard-extension-api"
        })
      }), " npm package."]
    }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.h3, {
      id: "context-deletion-confirmation",
      children: "Context deletion confirmation"
    }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.p, {
      children: "Kubernetes Contexts now asks you to confirm before deleting a context,\nso a context is not removed from your kubeconfig by accident."
    }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_theme_ThemedImage__WEBPACK_IMPORTED_MODULE_3__/* ["default"] */ .A, {
      alt: "Confirmation dialog when deleting a Kubernetes context",
      sources: {
        light: (__webpack_require__(48318)/* ["default"] */ .A),
        dark: (__webpack_require__(48148)/* ["default"] */ .A)
      }
    }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.p, {
      children: "Confirmation is required for every delete, not only the current context.\nIf you delete the context you are using, the dialog also warns that you will need to switch to another one."
    }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.h3, {
      id: "kreate",
      children: "Kreate"
    }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.p, {
      children: ["Kreate can create more kinds of resources,\nincluding kinds that are not supported by the ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.code, {
        children: "kubectl create"
      }), " command."]
    }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_theme_ThemedImage__WEBPACK_IMPORTED_MODULE_3__/* ["default"] */ .A, {
      alt: "Kreate resource type selection",
      sources: {
        light: (__webpack_require__(19775)/* ["default"] */ .A),
        dark: (__webpack_require__(82255)/* ["default"] */ .A)
      }
    }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.p, {
      children: ["You can now also create a Namespace, Job, or CronJob, as with ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.code, {
        children: "kubectl create"
      }), "."]
    }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.p, {
      children: ["You can also pick any other kind the cluster advertises through the Discovery API,\nincluding custom resources such as those from an installed operator.\nThe YAML template will contain the ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.code, {
        children: "apiVersion"
      }), " and ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.code, {
        children: "kind"
      }), " fields,\nand documentation will be provided for the resource fields from the cluster OpenAPI spec."]
    }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.h2, {
      id: "community-meeting",
      children: "Community meeting"
    }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.p, {
      children: ["If you would like to discuss any of the new features, issues, or other topics,\njoin us at the monthly community meeting on ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.strong, {
        children: "the fourth Thursday of each month"
      }), ".\nSee the ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/community/issues?q=is%3Aissue%20state%3Aopen%20Agenda%20for%20Podman%20Desktop",
        children: "meeting details"
      }), "."]
    }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.hr, {}), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.h2, {
      id: "final-notes",
      children: "Final notes"
    }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.p, {
      children: ["The complete list of issues fixed in this release is available for ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/extension-kubernetes-dashboard/releases/tag/v0.6.0",
        children: "Dashboard"
      }), ", ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/extension-kubernetes-contexts/releases/tag/v0.3.0",
        children: "Contexts"
      }), " and ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/extension-kreate/releases/tag/v0.4.0",
        children: "Kreate"
      }), "."]
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

/***/ 7307
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   A: () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (__webpack_require__.p + "assets/images/apply-yaml-dark-ff35ab6cea33b248adf88e995f7f073e.png");

/***/ },

/***/ 63507
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   A: () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (__webpack_require__.p + "assets/images/apply-yaml-light-6889ff7f4bbfd454d0d6b2bfb70bd81d.png");

/***/ },

/***/ 67792
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   A: () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (__webpack_require__.p + "assets/images/collapse-dark-19a15368b07e9a9d3962a6fc4e9b3682.png");

/***/ },

/***/ 57074
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   A: () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (__webpack_require__.p + "assets/images/collapse-light-606d6f7148efc67cd186a13529b08757.png");

/***/ },

/***/ 48148
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   A: () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (__webpack_require__.p + "assets/images/delete-dark-cef6f539d732d8e99433b12703df54f2.png");

/***/ },

/***/ 48318
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   A: () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (__webpack_require__.p + "assets/images/delete-light-ad0087dc9727da441f67552f1f5964ab.png");

/***/ },

/***/ 82255
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   A: () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (__webpack_require__.p + "assets/images/kreate-dark-487da5288b69a18d47296d76d230ea4b.png");

/***/ },

/***/ 19775
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   A: () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (__webpack_require__.p + "assets/images/kreate-light-d2a3e7ad5066fc12188dabbf168b1163.png");

/***/ },

/***/ 11008
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   A: () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (__webpack_require__.p + "assets/images/logs-dark-c0f52ce222203a5a9b756f75eca33319.png");

/***/ },

/***/ 59362
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   A: () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (__webpack_require__.p + "assets/images/logs-light-cad0f357ca0bb31c46fdae5f0bd2afd8.png");

/***/ },

/***/ 6163
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   A: () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (__webpack_require__.p + "assets/images/scale-dark-882c68e86b0bb37642bc8e464f5cd8cf.png");

/***/ },

/***/ 54219
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   A: () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (__webpack_require__.p + "assets/images/scale-light-14451761c0cd992b1c8a12f6ac8c1afa.png");

/***/ },

/***/ 77279
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   A: () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (__webpack_require__.p + "assets/images/table-edit-dark-ad54bee98a571dc0068429ad11b5d442.png");

/***/ },

/***/ 44614
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   A: () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (__webpack_require__.p + "assets/images/table-edit-light-ad31d671a7220254e6f52475cf6c03f9.png");

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