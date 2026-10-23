"use strict";
(globalThis["webpackChunkdocs"] = globalThis["webpackChunkdocs"] || []).push([[85331],{

/***/ 83605
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  assets: () => (/* binding */ assets),
  contentTitle: () => (/* binding */ contentTitle),
  "default": () => (/* binding */ MDXContent),
  frontMatter: () => (/* binding */ frontMatter),
  metadata: () => (/* reexport */ site_api_interfaces_pod_inspect_info_md_995_namespaceObject),
  toc: () => (/* binding */ toc)
});

;// ./.docusaurus/docusaurus-plugin-content-docs/api/site-api-interfaces-pod-inspect-info-md-995.json
const site_api_interfaces_pod_inspect_info_md_995_namespaceObject = /*#__PURE__*/JSON.parse('{"id":"interfaces/PodInspectInfo","title":"Interface: PodInspectInfo","description":"Defined in2759","source":"@site/api/interfaces/PodInspectInfo.md","sourceDirName":"interfaces","slug":"/interfaces/PodInspectInfo","permalink":"/api/interfaces/PodInspectInfo","draft":false,"unlisted":false,"tags":[],"version":"current","frontMatter":{},"sidebar":"typedocSidebar","previous":{"title":"PodInfo","permalink":"/api/interfaces/PodInfo"},"next":{"title":"PodmanContainerCreateOptions","permalink":"/api/interfaces/PodmanContainerCreateOptions"}}');
// EXTERNAL MODULE: ../node_modules/react/jsx-runtime.js
var jsx_runtime = __webpack_require__(62540);
// EXTERNAL MODULE: ../node_modules/@mdx-js/react/lib/index.js
var lib = __webpack_require__(43023);
;// ./api/interfaces/PodInspectInfo.md


const frontMatter = {};
const contentTitle = 'Interface: PodInspectInfo';

const assets = {

};



const toc = [{
  "value": "Properties",
  "id": "properties",
  "level": 2
}, {
  "value": "Containers",
  "id": "containers",
  "level": 3
}, {
  "value": "cpu_period?",
  "id": "cpu_period",
  "level": 3
}, {
  "value": "cpu_quota?",
  "id": "cpu_quota",
  "level": 3
}, {
  "value": "cpu_shares?",
  "id": "cpu_shares",
  "level": 3
}, {
  "value": "cpuset_cpus?",
  "id": "cpuset_cpus",
  "level": 3
}, {
  "value": "cpuset_mems?",
  "id": "cpuset_mems",
  "level": 3
}, {
  "value": "Created",
  "id": "created",
  "level": 3
}, {
  "value": "engineId",
  "id": "engineid",
  "level": 3
}, {
  "value": "engineName",
  "id": "enginename",
  "level": 3
}, {
  "value": "ExitPolicy",
  "id": "exitpolicy",
  "level": 3
}, {
  "value": "Hostname",
  "id": "hostname",
  "level": 3
}, {
  "value": "Id",
  "id": "id",
  "level": 3
}, {
  "value": "InfraConfig",
  "id": "infraconfig",
  "level": 3
}, {
  "value": "DNSOption?",
  "id": "dnsoption",
  "level": 4
}, {
  "value": "DNSSearch?",
  "id": "dnssearch",
  "level": 4
}, {
  "value": "DNSServer?",
  "id": "dnsserver",
  "level": 4
}, {
  "value": "Networks?",
  "id": "networks",
  "level": 4
}, {
  "value": "PortBindings?",
  "id": "portbindings",
  "level": 4
}, {
  "value": "InfraContainerID?",
  "id": "infracontainerid",
  "level": 3
}, {
  "value": "Labels",
  "id": "labels",
  "level": 3
}, {
  "value": "Index Signature",
  "id": "index-signature",
  "level": 4
}, {
  "value": "memory_limit?",
  "id": "memory_limit",
  "level": 3
}, {
  "value": "memory_swap?",
  "id": "memory_swap",
  "level": 3
}, {
  "value": "mounts?",
  "id": "mounts",
  "level": 3
}, {
  "value": "Name",
  "id": "name",
  "level": 3
}, {
  "value": "RestartPolicy",
  "id": "restartpolicy",
  "level": 3
}, {
  "value": "State",
  "id": "state",
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
        id: "interface-podinspectinfo",
        children: "Interface: PodInspectInfo"
      })
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/097de1f233080187c52b0104dff94c4d5ded277b/packages/extension-api/src/extension-api.d.ts#L2759",
        children: "packages/extension-api/src/extension-api.d.ts:2759"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.h2, {
      id: "properties",
      children: "Properties"
    }), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "containers",
      children: "Containers"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.strong, {
          children: "Containers"
        }), ": ", (0,jsx_runtime.jsx)(_components.a, {
          href: "/api/interfaces/PodContainerInfo",
          children: (0,jsx_runtime.jsx)(_components.code, {
            children: "PodContainerInfo"
          })
        }), "[]"]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/097de1f233080187c52b0104dff94c4d5ded277b/packages/extension-api/src/extension-api.d.ts#L2781",
        children: "packages/extension-api/src/extension-api.d.ts:2781"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Containers gives a brief summary of all containers in the pod and their current status."
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "cpu_period",
      children: "cpu_period?"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "optional"
        }), " ", (0,jsx_runtime.jsx)(_components.strong, {
          children: "cpu_period?"
        }), ": ", (0,jsx_runtime.jsx)(_components.code, {
          children: "number"
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/097de1f233080187c52b0104dff94c4d5ded277b/packages/extension-api/src/extension-api.d.ts#L2827",
        children: "packages/extension-api/src/extension-api.d.ts:2827"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "CPUPeriod contains the CPU period of the pod"
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "cpu_quota",
      children: "cpu_quota?"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "optional"
        }), " ", (0,jsx_runtime.jsx)(_components.strong, {
          children: "cpu_quota?"
        }), ": ", (0,jsx_runtime.jsx)(_components.code, {
          children: "number"
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/097de1f233080187c52b0104dff94c4d5ded277b/packages/extension-api/src/extension-api.d.ts#L2831",
        children: "packages/extension-api/src/extension-api.d.ts:2831"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "CPUQuota contains the CPU quota of the pod"
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "cpu_shares",
      children: "cpu_shares?"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "optional"
        }), " ", (0,jsx_runtime.jsx)(_components.strong, {
          children: "cpu_shares?"
        }), ": ", (0,jsx_runtime.jsx)(_components.code, {
          children: "number"
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/097de1f233080187c52b0104dff94c4d5ded277b/packages/extension-api/src/extension-api.d.ts#L2835",
        children: "packages/extension-api/src/extension-api.d.ts:2835"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "CPUShares contains the cpu shares for the pod"
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "cpuset_cpus",
      children: "cpuset_cpus?"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "optional"
        }), " ", (0,jsx_runtime.jsx)(_components.strong, {
          children: "cpuset_cpus?"
        }), ": ", (0,jsx_runtime.jsx)(_components.code, {
          children: "string"
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/097de1f233080187c52b0104dff94c4d5ded277b/packages/extension-api/src/extension-api.d.ts#L2839",
        children: "packages/extension-api/src/extension-api.d.ts:2839"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "CPUSetCPUs contains linux specific CPU data for the pod"
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "cpuset_mems",
      children: "cpuset_mems?"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "optional"
        }), " ", (0,jsx_runtime.jsx)(_components.strong, {
          children: "cpuset_mems?"
        }), ": ", (0,jsx_runtime.jsx)(_components.code, {
          children: "string"
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/097de1f233080187c52b0104dff94c4d5ded277b/packages/extension-api/src/extension-api.d.ts#L2843",
        children: "packages/extension-api/src/extension-api.d.ts:2843"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "CPUSetMems contains linux specific CPU data for the pod"
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "created",
      children: "Created"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.strong, {
          children: "Created"
        }), ": ", (0,jsx_runtime.jsx)(_components.code, {
          children: "string"
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/097de1f233080187c52b0104dff94c4d5ded277b/packages/extension-api/src/extension-api.d.ts#L2773",
        children: "packages/extension-api/src/extension-api.d.ts:2773"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "The time when the pod was created."
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "engineid",
      children: "engineId"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.strong, {
          children: "engineId"
        }), ": ", (0,jsx_runtime.jsx)(_components.code, {
          children: "string"
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/097de1f233080187c52b0104dff94c4d5ded277b/packages/extension-api/src/extension-api.d.ts#L2760",
        children: "packages/extension-api/src/extension-api.d.ts:2760"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "enginename",
      children: "engineName"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.strong, {
          children: "engineName"
        }), ": ", (0,jsx_runtime.jsx)(_components.code, {
          children: "string"
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/097de1f233080187c52b0104dff94c4d5ded277b/packages/extension-api/src/extension-api.d.ts#L2761",
        children: "packages/extension-api/src/extension-api.d.ts:2761"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "exitpolicy",
      children: "ExitPolicy"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.strong, {
          children: "ExitPolicy"
        }), ": ", (0,jsx_runtime.jsx)(_components.code, {
          children: "\"stop\""
        }), " | ", (0,jsx_runtime.jsx)(_components.code, {
          children: "\"continue\""
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/097de1f233080187c52b0104dff94c4d5ded277b/packages/extension-api/src/extension-api.d.ts#L2785",
        children: "packages/extension-api/src/extension-api.d.ts:2785"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "The exit policy of the pod when the last container exits."
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "hostname",
      children: "Hostname"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.strong, {
          children: "Hostname"
        }), ": ", (0,jsx_runtime.jsx)(_components.code, {
          children: "string"
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/097de1f233080187c52b0104dff94c4d5ded277b/packages/extension-api/src/extension-api.d.ts#L2789",
        children: "packages/extension-api/src/extension-api.d.ts:2789"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Hostname that the pod will set."
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "id",
      children: "Id"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.strong, {
          children: "Id"
        }), ": ", (0,jsx_runtime.jsx)(_components.code, {
          children: "string"
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/097de1f233080187c52b0104dff94c4d5ded277b/packages/extension-api/src/extension-api.d.ts#L2765",
        children: "packages/extension-api/src/extension-api.d.ts:2765"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "ID of the pod."
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "infraconfig",
      children: "InfraConfig"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.strong, {
          children: "InfraConfig"
        }), ": ", (0,jsx_runtime.jsx)(_components.code, {
          children: "object"
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/097de1f233080187c52b0104dff94c4d5ded277b/packages/extension-api/src/extension-api.d.ts#L2805",
        children: "packages/extension-api/src/extension-api.d.ts:2805"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Contains the configuration of the pod's infra container."
    }), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "dnsoption",
      children: "DNSOption?"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "optional"
        }), " ", (0,jsx_runtime.jsx)(_components.strong, {
          children: "DNSOption?"
        }), ": ", (0,jsx_runtime.jsx)(_components.code, {
          children: "string"
        }), "[]"]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "DNSOption is a set of DNS options that will be used by the infra container's resolv.conf and shared with the remainder of the pod."
    }), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "dnssearch",
      children: "DNSSearch?"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "optional"
        }), " ", (0,jsx_runtime.jsx)(_components.strong, {
          children: "DNSSearch?"
        }), ": ", (0,jsx_runtime.jsx)(_components.code, {
          children: "string"
        }), "[]"]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "DNSSearch is a set of DNS search domains that will be used by the infra container's resolv.conf and shared with the remainder of the pod."
    }), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "dnsserver",
      children: "DNSServer?"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "optional"
        }), " ", (0,jsx_runtime.jsx)(_components.strong, {
          children: "DNSServer?"
        }), ": ", (0,jsx_runtime.jsx)(_components.code, {
          children: "string"
        }), "[]"]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "DNSServer is a set of DNS Servers that will be used by the infra container's resolv.conf and shared with the remainder of the pod."
    }), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "networks",
      children: "Networks?"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "optional"
        }), " ", (0,jsx_runtime.jsx)(_components.strong, {
          children: "Networks?"
        }), ": ", (0,jsx_runtime.jsx)(_components.code, {
          children: "string"
        }), "[]"]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "List of networks the pod will join."
    }), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "portbindings",
      children: "PortBindings?"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "optional"
        }), " ", (0,jsx_runtime.jsx)(_components.strong, {
          children: "PortBindings?"
        }), ": ", (0,jsx_runtime.jsx)(_components.a, {
          href: "/api/interfaces/HostConfigPortBinding",
          children: (0,jsx_runtime.jsx)(_components.code, {
            children: "HostConfigPortBinding"
          })
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "infracontainerid",
      children: "InfraContainerID?"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "optional"
        }), " ", (0,jsx_runtime.jsx)(_components.strong, {
          children: "InfraContainerID?"
        }), ": ", (0,jsx_runtime.jsx)(_components.code, {
          children: "string"
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/097de1f233080187c52b0104dff94c4d5ded277b/packages/extension-api/src/extension-api.d.ts#L2801",
        children: "packages/extension-api/src/extension-api.d.ts:2801"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "the ID of the pod's infra container, if one is present."
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "labels",
      children: "Labels"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.strong, {
          children: "Labels"
        }), ": ", (0,jsx_runtime.jsx)(_components.code, {
          children: "object"
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/097de1f233080187c52b0104dff94c4d5ded277b/packages/extension-api/src/extension-api.d.ts#L2797",
        children: "packages/extension-api/src/extension-api.d.ts:2797"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Set of key-value labels that have been applied to the pod."
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
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "memory_limit",
      children: "memory_limit?"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "optional"
        }), " ", (0,jsx_runtime.jsx)(_components.strong, {
          children: "memory_limit?"
        }), ": ", (0,jsx_runtime.jsx)(_components.code, {
          children: "number"
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/097de1f233080187c52b0104dff94c4d5ded277b/packages/extension-api/src/extension-api.d.ts#L2847",
        children: "packages/extension-api/src/extension-api.d.ts:2847"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "MemoryLimit contains the specified cgroup memory limit for the pod"
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "memory_swap",
      children: "memory_swap?"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "optional"
        }), " ", (0,jsx_runtime.jsx)(_components.strong, {
          children: "memory_swap?"
        }), ": ", (0,jsx_runtime.jsx)(_components.code, {
          children: "number"
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/097de1f233080187c52b0104dff94c4d5ded277b/packages/extension-api/src/extension-api.d.ts#L2851",
        children: "packages/extension-api/src/extension-api.d.ts:2851"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "MemorySwap contains the specified memory swap limit for the pod"
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "mounts",
      children: "mounts?"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "optional"
        }), " ", (0,jsx_runtime.jsx)(_components.strong, {
          children: "mounts?"
        }), ": ", (0,jsx_runtime.jsx)(_components.a, {
          href: "/api/interfaces/InspectMount",
          children: (0,jsx_runtime.jsx)(_components.code, {
            children: "InspectMount"
          })
        }), "[]"]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/097de1f233080187c52b0104dff94c4d5ded277b/packages/extension-api/src/extension-api.d.ts#L2855",
        children: "packages/extension-api/src/extension-api.d.ts:2855"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Mounts contains volume related information for the pod"
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "name",
      children: "Name"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.strong, {
          children: "Name"
        }), ": ", (0,jsx_runtime.jsx)(_components.code, {
          children: "string"
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/097de1f233080187c52b0104dff94c4d5ded277b/packages/extension-api/src/extension-api.d.ts#L2769",
        children: "packages/extension-api/src/extension-api.d.ts:2769"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "The name of the pod."
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "restartpolicy",
      children: "RestartPolicy"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.strong, {
          children: "RestartPolicy"
        }), ": ", (0,jsx_runtime.jsx)(_components.code, {
          children: "string"
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/097de1f233080187c52b0104dff94c4d5ded277b/packages/extension-api/src/extension-api.d.ts#L2793",
        children: "packages/extension-api/src/extension-api.d.ts:2793"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "RestartPolicy of the pod."
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "state",
      children: "State"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.strong, {
          children: "State"
        }), ": ", (0,jsx_runtime.jsx)(_components.code, {
          children: "string"
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/097de1f233080187c52b0104dff94c4d5ded277b/packages/extension-api/src/extension-api.d.ts#L2777",
        children: "packages/extension-api/src/extension-api.d.ts:2777"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "The current state of the pod."
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