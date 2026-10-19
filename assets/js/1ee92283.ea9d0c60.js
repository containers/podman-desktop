"use strict";
(globalThis["webpackChunkdocs"] = globalThis["webpackChunkdocs"] || []).push([[6704],{

/***/ 2556
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  assets: () => (/* binding */ assets),
  contentTitle: () => (/* binding */ contentTitle),
  "default": () => (/* binding */ MDXContent),
  frontMatter: () => (/* binding */ frontMatter),
  metadata: () => (/* reexport */ site_api_interfaces_provider_md_1ee_namespaceObject),
  toc: () => (/* binding */ toc)
});

;// ./.docusaurus/docusaurus-plugin-content-docs/api/site-api-interfaces-provider-md-1ee.json
const site_api_interfaces_provider_md_1ee_namespaceObject = /*#__PURE__*/JSON.parse('{"id":"interfaces/Provider","title":"Interface: Provider","description":"Defined in699","source":"@site/api/interfaces/Provider.md","sourceDirName":"interfaces","slug":"/interfaces/Provider","permalink":"/api/interfaces/Provider","draft":false,"unlisted":false,"tags":[],"version":"current","frontMatter":{},"sidebar":"typedocSidebar","previous":{"title":"ProgressOptions","permalink":"/api/interfaces/ProgressOptions"},"next":{"title":"ProviderAutostart","permalink":"/api/interfaces/ProviderAutostart"}}');
// EXTERNAL MODULE: ../node_modules/react/jsx-runtime.js
var jsx_runtime = __webpack_require__(62540);
// EXTERNAL MODULE: ../node_modules/@mdx-js/react/lib/index.js
var lib = __webpack_require__(43023);
;// ./api/interfaces/Provider.md


const frontMatter = {};
const contentTitle = 'Interface: Provider';

const assets = {

};



const toc = [{
  "value": "Properties",
  "id": "properties",
  "level": 2
}, {
  "value": "detectionChecks",
  "id": "detectionchecks",
  "level": 3
}, {
  "value": "id",
  "id": "id",
  "level": 3
}, {
  "value": "images",
  "id": "images",
  "level": 3
}, {
  "value": "links",
  "id": "links",
  "level": 3
}, {
  "value": "name",
  "id": "name",
  "level": 3
}, {
  "value": "onDidUpdateDetectionChecks",
  "id": "ondidupdatedetectionchecks",
  "level": 3
}, {
  "value": "onDidUpdateStatus",
  "id": "ondidupdatestatus",
  "level": 3
}, {
  "value": "onDidUpdateVersion",
  "id": "ondidupdateversion",
  "level": 3
}, {
  "value": "status",
  "id": "status",
  "level": 3
}, {
  "value": "version",
  "id": "version",
  "level": 3
}, {
  "value": "warnings",
  "id": "warnings",
  "level": 3
}, {
  "value": "Methods",
  "id": "methods",
  "level": 2
}, {
  "value": "dispose()",
  "id": "dispose",
  "level": 3
}, {
  "value": "Returns",
  "id": "returns",
  "level": 4
}, {
  "value": "registerAutostart()",
  "id": "registerautostart",
  "level": 3
}, {
  "value": "Parameters",
  "id": "parameters",
  "level": 4
}, {
  "value": "autostart",
  "id": "autostart",
  "level": 5
}, {
  "value": "Returns",
  "id": "returns-1",
  "level": 4
}, {
  "value": "registerCleanup()",
  "id": "registercleanup",
  "level": 3
}, {
  "value": "Parameters",
  "id": "parameters-1",
  "level": 4
}, {
  "value": "cleanup",
  "id": "cleanup",
  "level": 5
}, {
  "value": "Returns",
  "id": "returns-2",
  "level": 4
}, {
  "value": "registerContainerProviderConnection()",
  "id": "registercontainerproviderconnection",
  "level": 3
}, {
  "value": "Parameters",
  "id": "parameters-2",
  "level": 4
}, {
  "value": "connection",
  "id": "connection",
  "level": 5
}, {
  "value": "Returns",
  "id": "returns-3",
  "level": 4
}, {
  "value": "registerInstallation()",
  "id": "registerinstallation",
  "level": 3
}, {
  "value": "Parameters",
  "id": "parameters-3",
  "level": 4
}, {
  "value": "installation",
  "id": "installation",
  "level": 5
}, {
  "value": "Returns",
  "id": "returns-4",
  "level": 4
}, {
  "value": "registerKubernetesProviderConnection()",
  "id": "registerkubernetesproviderconnection",
  "level": 3
}, {
  "value": "Parameters",
  "id": "parameters-4",
  "level": 4
}, {
  "value": "connection",
  "id": "connection-1",
  "level": 5
}, {
  "value": "Returns",
  "id": "returns-5",
  "level": 4
}, {
  "value": "registerLifecycle()",
  "id": "registerlifecycle",
  "level": 3
}, {
  "value": "Parameters",
  "id": "parameters-5",
  "level": 4
}, {
  "value": "lifecycle",
  "id": "lifecycle",
  "level": 5
}, {
  "value": "Returns",
  "id": "returns-6",
  "level": 4
}, {
  "value": "registerUpdate()",
  "id": "registerupdate",
  "level": 3
}, {
  "value": "Parameters",
  "id": "parameters-6",
  "level": 4
}, {
  "value": "update",
  "id": "update",
  "level": 5
}, {
  "value": "Returns",
  "id": "returns-7",
  "level": 4
}, {
  "value": "registerVmProviderConnection()",
  "id": "registervmproviderconnection",
  "level": 3
}, {
  "value": "Parameters",
  "id": "parameters-7",
  "level": 4
}, {
  "value": "connection",
  "id": "connection-2",
  "level": 5
}, {
  "value": "Returns",
  "id": "returns-8",
  "level": 4
}, {
  "value": "setContainerProviderConnectionFactory()",
  "id": "setcontainerproviderconnectionfactory",
  "level": 3
}, {
  "value": "Parameters",
  "id": "parameters-8",
  "level": 4
}, {
  "value": "containerProviderConnectionFactory",
  "id": "containerproviderconnectionfactory",
  "level": 5
}, {
  "value": "connectionAuditor?",
  "id": "connectionauditor",
  "level": 5
}, {
  "value": "Returns",
  "id": "returns-9",
  "level": 4
}, {
  "value": "setKubernetesProviderConnectionFactory()",
  "id": "setkubernetesproviderconnectionfactory",
  "level": 3
}, {
  "value": "Parameters",
  "id": "parameters-9",
  "level": 4
}, {
  "value": "containerProviderConnectionFactory",
  "id": "containerproviderconnectionfactory-1",
  "level": 5
}, {
  "value": "connectionAuditor?",
  "id": "connectionauditor-1",
  "level": 5
}, {
  "value": "Returns",
  "id": "returns-10",
  "level": 4
}, {
  "value": "setVmProviderConnectionFactory()",
  "id": "setvmproviderconnectionfactory",
  "level": 3
}, {
  "value": "Parameters",
  "id": "parameters-10",
  "level": 4
}, {
  "value": "vmProviderConnectionFactory",
  "id": "vmproviderconnectionfactory",
  "level": 5
}, {
  "value": "connectionAuditor?",
  "id": "connectionauditor-2",
  "level": 5
}, {
  "value": "Returns",
  "id": "returns-11",
  "level": 4
}, {
  "value": "updateDetectionChecks()",
  "id": "updatedetectionchecks",
  "level": 3
}, {
  "value": "Parameters",
  "id": "parameters-11",
  "level": 4
}, {
  "value": "detectionChecks",
  "id": "detectionchecks-1",
  "level": 5
}, {
  "value": "Returns",
  "id": "returns-12",
  "level": 4
}, {
  "value": "updateStatus()",
  "id": "updatestatus",
  "level": 3
}, {
  "value": "Parameters",
  "id": "parameters-12",
  "level": 4
}, {
  "value": "status",
  "id": "status-1",
  "level": 5
}, {
  "value": "Returns",
  "id": "returns-13",
  "level": 4
}, {
  "value": "updateVersion()",
  "id": "updateversion",
  "level": 3
}, {
  "value": "Parameters",
  "id": "parameters-13",
  "level": 4
}, {
  "value": "version?",
  "id": "version-1",
  "level": 5
}, {
  "value": "Returns",
  "id": "returns-14",
  "level": 4
}, {
  "value": "updateWarnings()",
  "id": "updatewarnings",
  "level": 3
}, {
  "value": "Parameters",
  "id": "parameters-14",
  "level": 4
}, {
  "value": "warnings",
  "id": "warnings-1",
  "level": 5
}, {
  "value": "Returns",
  "id": "returns-15",
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
        id: "interface-provider",
        children: "Interface: Provider"
      })
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/6c9518088de3d8bdc1a521e03434508c61ddc31a/packages/extension-api/src/extension-api.d.ts#L699",
        children: "packages/extension-api/src/extension-api.d.ts:699"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.h2, {
      id: "properties",
      children: "Properties"
    }), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "detectionchecks",
      children: "detectionChecks"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "readonly"
        }), " ", (0,jsx_runtime.jsx)(_components.strong, {
          children: "detectionChecks"
        }), ": ", (0,jsx_runtime.jsx)(_components.a, {
          href: "/api/interfaces/ProviderDetectionCheck",
          children: (0,jsx_runtime.jsx)(_components.code, {
            children: "ProviderDetectionCheck"
          })
        }), "[]"]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/6c9518088de3d8bdc1a521e03434508c61ddc31a/packages/extension-api/src/extension-api.d.ts#L746",
        children: "packages/extension-api/src/extension-api.d.ts:746"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "id",
      children: "id"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "readonly"
        }), " ", (0,jsx_runtime.jsx)(_components.strong, {
          children: "id"
        }), ": ", (0,jsx_runtime.jsx)(_components.code, {
          children: "string"
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/6c9518088de3d8bdc1a521e03434508c61ddc31a/packages/extension-api/src/extension-api.d.ts#L731",
        children: "packages/extension-api/src/extension-api.d.ts:731"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "images",
      children: "images"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "readonly"
        }), " ", (0,jsx_runtime.jsx)(_components.strong, {
          children: "images"
        }), ": ", (0,jsx_runtime.jsx)(_components.a, {
          href: "/api/interfaces/ProviderImages",
          children: (0,jsx_runtime.jsx)(_components.code, {
            children: "ProviderImages"
          })
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/6c9518088de3d8bdc1a521e03434508c61ddc31a/packages/extension-api/src/extension-api.d.ts#L741",
        children: "packages/extension-api/src/extension-api.d.ts:741"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "links",
      children: "links"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "readonly"
        }), " ", (0,jsx_runtime.jsx)(_components.strong, {
          children: "links"
        }), ": ", (0,jsx_runtime.jsx)(_components.a, {
          href: "/api/interfaces/Link",
          children: (0,jsx_runtime.jsx)(_components.code, {
            children: "Link"
          })
        }), "[]"]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/6c9518088de3d8bdc1a521e03434508c61ddc31a/packages/extension-api/src/extension-api.d.ts#L743",
        children: "packages/extension-api/src/extension-api.d.ts:743"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "name",
      children: "name"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "readonly"
        }), " ", (0,jsx_runtime.jsx)(_components.strong, {
          children: "name"
        }), ": ", (0,jsx_runtime.jsx)(_components.code, {
          children: "string"
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/6c9518088de3d8bdc1a521e03434508c61ddc31a/packages/extension-api/src/extension-api.d.ts#L730",
        children: "packages/extension-api/src/extension-api.d.ts:730"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "ondidupdatedetectionchecks",
      children: "onDidUpdateDetectionChecks"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.strong, {
          children: "onDidUpdateDetectionChecks"
        }), ": ", (0,jsx_runtime.jsx)(_components.a, {
          href: "/api/interfaces/Event",
          children: (0,jsx_runtime.jsx)(_components.code, {
            children: "Event"
          })
        }), "<", (0,jsx_runtime.jsx)(_components.a, {
          href: "/api/interfaces/ProviderDetectionCheck",
          children: (0,jsx_runtime.jsx)(_components.code, {
            children: "ProviderDetectionCheck"
          })
        }), "[]>"]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/6c9518088de3d8bdc1a521e03434508c61ddc31a/packages/extension-api/src/extension-api.d.ts#L757",
        children: "packages/extension-api/src/extension-api.d.ts:757"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "ondidupdatestatus",
      children: "onDidUpdateStatus"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.strong, {
          children: "onDidUpdateStatus"
        }), ": ", (0,jsx_runtime.jsx)(_components.a, {
          href: "/api/interfaces/Event",
          children: (0,jsx_runtime.jsx)(_components.code, {
            children: "Event"
          })
        }), "<", (0,jsx_runtime.jsx)(_components.a, {
          href: "/api/type-aliases/ProviderStatus",
          children: (0,jsx_runtime.jsx)(_components.code, {
            children: "ProviderStatus"
          })
        }), ">"]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/6c9518088de3d8bdc1a521e03434508c61ddc31a/packages/extension-api/src/extension-api.d.ts#L734",
        children: "packages/extension-api/src/extension-api.d.ts:734"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "ondidupdateversion",
      children: "onDidUpdateVersion"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.strong, {
          children: "onDidUpdateVersion"
        }), ": ", (0,jsx_runtime.jsx)(_components.a, {
          href: "/api/interfaces/Event",
          children: (0,jsx_runtime.jsx)(_components.code, {
            children: "Event"
          })
        }), "<", (0,jsx_runtime.jsx)(_components.code, {
          children: "string"
        }), ">"]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/6c9518088de3d8bdc1a521e03434508c61ddc31a/packages/extension-api/src/extension-api.d.ts#L739",
        children: "packages/extension-api/src/extension-api.d.ts:739"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "status",
      children: "status"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "readonly"
        }), " ", (0,jsx_runtime.jsx)(_components.strong, {
          children: "status"
        }), ": ", (0,jsx_runtime.jsx)(_components.a, {
          href: "/api/type-aliases/ProviderStatus",
          children: (0,jsx_runtime.jsx)(_components.code, {
            children: "ProviderStatus"
          })
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/6c9518088de3d8bdc1a521e03434508c61ddc31a/packages/extension-api/src/extension-api.d.ts#L732",
        children: "packages/extension-api/src/extension-api.d.ts:732"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "version",
      children: "version"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "readonly"
        }), " ", (0,jsx_runtime.jsx)(_components.strong, {
          children: "version"
        }), ": ", (0,jsx_runtime.jsx)(_components.code, {
          children: "string"
        }), " | ", (0,jsx_runtime.jsx)(_components.code, {
          children: "undefined"
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/6c9518088de3d8bdc1a521e03434508c61ddc31a/packages/extension-api/src/extension-api.d.ts#L737",
        children: "packages/extension-api/src/extension-api.d.ts:737"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "warnings",
      children: "warnings"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "readonly"
        }), " ", (0,jsx_runtime.jsx)(_components.strong, {
          children: "warnings"
        }), ": ", (0,jsx_runtime.jsx)(_components.a, {
          href: "/api/interfaces/ProviderInformation",
          children: (0,jsx_runtime.jsx)(_components.code, {
            children: "ProviderInformation"
          })
        }), "[]"]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/6c9518088de3d8bdc1a521e03434508c61ddc31a/packages/extension-api/src/extension-api.d.ts#L753",
        children: "packages/extension-api/src/extension-api.d.ts:753"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.h2, {
      id: "methods",
      children: "Methods"
    }), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "dispose",
      children: "dispose()"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.strong, {
          children: "dispose"
        }), "(): ", (0,jsx_runtime.jsx)(_components.code, {
          children: "void"
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/6c9518088de3d8bdc1a521e03434508c61ddc31a/packages/extension-api/src/extension-api.d.ts#L729",
        children: "packages/extension-api/src/extension-api.d.ts:729"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "returns",
      children: "Returns"
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        children: "void"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "registerautostart",
      children: "registerAutostart()"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.strong, {
          children: "registerAutostart"
        }), "(", (0,jsx_runtime.jsx)(_components.code, {
          children: "autostart"
        }), "): ", (0,jsx_runtime.jsx)(_components.a, {
          href: "/api/classes/Disposable",
          children: (0,jsx_runtime.jsx)(_components.code, {
            children: "Disposable"
          })
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/6c9518088de3d8bdc1a521e03434508c61ddc31a/packages/extension-api/src/extension-api.d.ts#L725",
        children: "packages/extension-api/src/extension-api.d.ts:725"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "parameters",
      children: "Parameters"
    }), "\n", (0,jsx_runtime.jsx)(_components.h5, {
      id: "autostart",
      children: "autostart"
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: (0,jsx_runtime.jsx)(_components.a, {
        href: "/api/interfaces/ProviderAutostart",
        children: (0,jsx_runtime.jsx)(_components.code, {
          children: "ProviderAutostart"
        })
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "returns-1",
      children: "Returns"
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: (0,jsx_runtime.jsx)(_components.a, {
        href: "/api/classes/Disposable",
        children: (0,jsx_runtime.jsx)(_components.code, {
          children: "Disposable"
        })
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "registercleanup",
      children: "registerCleanup()"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.strong, {
          children: "registerCleanup"
        }), "(", (0,jsx_runtime.jsx)(_components.code, {
          children: "cleanup"
        }), "): ", (0,jsx_runtime.jsx)(_components.a, {
          href: "/api/classes/Disposable",
          children: (0,jsx_runtime.jsx)(_components.code, {
            children: "Disposable"
          })
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/6c9518088de3d8bdc1a521e03434508c61ddc31a/packages/extension-api/src/extension-api.d.ts#L727",
        children: "packages/extension-api/src/extension-api.d.ts:727"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "parameters-1",
      children: "Parameters"
    }), "\n", (0,jsx_runtime.jsx)(_components.h5, {
      id: "cleanup",
      children: "cleanup"
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: (0,jsx_runtime.jsx)(_components.a, {
        href: "/api/interfaces/ProviderCleanup",
        children: (0,jsx_runtime.jsx)(_components.code, {
          children: "ProviderCleanup"
        })
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "returns-2",
      children: "Returns"
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: (0,jsx_runtime.jsx)(_components.a, {
        href: "/api/classes/Disposable",
        children: (0,jsx_runtime.jsx)(_components.code, {
          children: "Disposable"
        })
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "registercontainerproviderconnection",
      children: "registerContainerProviderConnection()"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.strong, {
          children: "registerContainerProviderConnection"
        }), "(", (0,jsx_runtime.jsx)(_components.code, {
          children: "connection"
        }), "): ", (0,jsx_runtime.jsx)(_components.a, {
          href: "/api/classes/Disposable",
          children: (0,jsx_runtime.jsx)(_components.code, {
            children: "Disposable"
          })
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/6c9518088de3d8bdc1a521e03434508c61ddc31a/packages/extension-api/src/extension-api.d.ts#L713",
        children: "packages/extension-api/src/extension-api.d.ts:713"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "parameters-2",
      children: "Parameters"
    }), "\n", (0,jsx_runtime.jsx)(_components.h5, {
      id: "connection",
      children: "connection"
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: (0,jsx_runtime.jsx)(_components.a, {
        href: "/api/interfaces/ContainerProviderConnection",
        children: (0,jsx_runtime.jsx)(_components.code, {
          children: "ContainerProviderConnection"
        })
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "returns-3",
      children: "Returns"
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: (0,jsx_runtime.jsx)(_components.a, {
        href: "/api/classes/Disposable",
        children: (0,jsx_runtime.jsx)(_components.code, {
          children: "Disposable"
        })
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "registerinstallation",
      children: "registerInstallation()"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.strong, {
          children: "registerInstallation"
        }), "(", (0,jsx_runtime.jsx)(_components.code, {
          children: "installation"
        }), "): ", (0,jsx_runtime.jsx)(_components.a, {
          href: "/api/classes/Disposable",
          children: (0,jsx_runtime.jsx)(_components.code, {
            children: "Disposable"
          })
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/6c9518088de3d8bdc1a521e03434508c61ddc31a/packages/extension-api/src/extension-api.d.ts#L719",
        children: "packages/extension-api/src/extension-api.d.ts:719"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "parameters-3",
      children: "Parameters"
    }), "\n", (0,jsx_runtime.jsx)(_components.h5, {
      id: "installation",
      children: "installation"
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: (0,jsx_runtime.jsx)(_components.a, {
        href: "/api/interfaces/ProviderInstallation",
        children: (0,jsx_runtime.jsx)(_components.code, {
          children: "ProviderInstallation"
        })
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "returns-4",
      children: "Returns"
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: (0,jsx_runtime.jsx)(_components.a, {
        href: "/api/classes/Disposable",
        children: (0,jsx_runtime.jsx)(_components.code, {
          children: "Disposable"
        })
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "registerkubernetesproviderconnection",
      children: "registerKubernetesProviderConnection()"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.strong, {
          children: "registerKubernetesProviderConnection"
        }), "(", (0,jsx_runtime.jsx)(_components.code, {
          children: "connection"
        }), "): ", (0,jsx_runtime.jsx)(_components.a, {
          href: "/api/classes/Disposable",
          children: (0,jsx_runtime.jsx)(_components.code, {
            children: "Disposable"
          })
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/6c9518088de3d8bdc1a521e03434508c61ddc31a/packages/extension-api/src/extension-api.d.ts#L714",
        children: "packages/extension-api/src/extension-api.d.ts:714"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "parameters-4",
      children: "Parameters"
    }), "\n", (0,jsx_runtime.jsx)(_components.h5, {
      id: "connection-1",
      children: "connection"
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: (0,jsx_runtime.jsx)(_components.a, {
        href: "/api/interfaces/KubernetesProviderConnection",
        children: (0,jsx_runtime.jsx)(_components.code, {
          children: "KubernetesProviderConnection"
        })
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "returns-5",
      children: "Returns"
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: (0,jsx_runtime.jsx)(_components.a, {
        href: "/api/classes/Disposable",
        children: (0,jsx_runtime.jsx)(_components.code, {
          children: "Disposable"
        })
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "registerlifecycle",
      children: "registerLifecycle()"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.strong, {
          children: "registerLifecycle"
        }), "(", (0,jsx_runtime.jsx)(_components.code, {
          children: "lifecycle"
        }), "): ", (0,jsx_runtime.jsx)(_components.a, {
          href: "/api/classes/Disposable",
          children: (0,jsx_runtime.jsx)(_components.code, {
            children: "Disposable"
          })
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/6c9518088de3d8bdc1a521e03434508c61ddc31a/packages/extension-api/src/extension-api.d.ts#L716",
        children: "packages/extension-api/src/extension-api.d.ts:716"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "parameters-5",
      children: "Parameters"
    }), "\n", (0,jsx_runtime.jsx)(_components.h5, {
      id: "lifecycle",
      children: "lifecycle"
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: (0,jsx_runtime.jsx)(_components.a, {
        href: "/api/interfaces/ProviderLifecycle",
        children: (0,jsx_runtime.jsx)(_components.code, {
          children: "ProviderLifecycle"
        })
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "returns-6",
      children: "Returns"
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: (0,jsx_runtime.jsx)(_components.a, {
        href: "/api/classes/Disposable",
        children: (0,jsx_runtime.jsx)(_components.code, {
          children: "Disposable"
        })
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "registerupdate",
      children: "registerUpdate()"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.strong, {
          children: "registerUpdate"
        }), "(", (0,jsx_runtime.jsx)(_components.code, {
          children: "update"
        }), "): ", (0,jsx_runtime.jsx)(_components.a, {
          href: "/api/classes/Disposable",
          children: (0,jsx_runtime.jsx)(_components.code, {
            children: "Disposable"
          })
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/6c9518088de3d8bdc1a521e03434508c61ddc31a/packages/extension-api/src/extension-api.d.ts#L722",
        children: "packages/extension-api/src/extension-api.d.ts:722"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "parameters-6",
      children: "Parameters"
    }), "\n", (0,jsx_runtime.jsx)(_components.h5, {
      id: "update",
      children: "update"
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: (0,jsx_runtime.jsx)(_components.a, {
        href: "/api/interfaces/ProviderUpdate",
        children: (0,jsx_runtime.jsx)(_components.code, {
          children: "ProviderUpdate"
        })
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "returns-7",
      children: "Returns"
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: (0,jsx_runtime.jsx)(_components.a, {
        href: "/api/classes/Disposable",
        children: (0,jsx_runtime.jsx)(_components.code, {
          children: "Disposable"
        })
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "registervmproviderconnection",
      children: "registerVmProviderConnection()"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.strong, {
          children: "registerVmProviderConnection"
        }), "(", (0,jsx_runtime.jsx)(_components.code, {
          children: "connection"
        }), "): ", (0,jsx_runtime.jsx)(_components.a, {
          href: "/api/classes/Disposable",
          children: (0,jsx_runtime.jsx)(_components.code, {
            children: "Disposable"
          })
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/6c9518088de3d8bdc1a521e03434508c61ddc31a/packages/extension-api/src/extension-api.d.ts#L715",
        children: "packages/extension-api/src/extension-api.d.ts:715"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "parameters-7",
      children: "Parameters"
    }), "\n", (0,jsx_runtime.jsx)(_components.h5, {
      id: "connection-2",
      children: "connection"
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: (0,jsx_runtime.jsx)(_components.a, {
        href: "/api/interfaces/VmProviderConnection",
        children: (0,jsx_runtime.jsx)(_components.code, {
          children: "VmProviderConnection"
        })
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "returns-8",
      children: "Returns"
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: (0,jsx_runtime.jsx)(_components.a, {
        href: "/api/classes/Disposable",
        children: (0,jsx_runtime.jsx)(_components.code, {
          children: "Disposable"
        })
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "setcontainerproviderconnectionfactory",
      children: "setContainerProviderConnectionFactory()"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.strong, {
          children: "setContainerProviderConnectionFactory"
        }), "(", (0,jsx_runtime.jsx)(_components.code, {
          children: "containerProviderConnectionFactory"
        }), ", ", (0,jsx_runtime.jsx)(_components.code, {
          children: "connectionAuditor?"
        }), "): ", (0,jsx_runtime.jsx)(_components.a, {
          href: "/api/classes/Disposable",
          children: (0,jsx_runtime.jsx)(_components.code, {
            children: "Disposable"
          })
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/6c9518088de3d8bdc1a521e03434508c61ddc31a/packages/extension-api/src/extension-api.d.ts#L700",
        children: "packages/extension-api/src/extension-api.d.ts:700"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "parameters-8",
      children: "Parameters"
    }), "\n", (0,jsx_runtime.jsx)(_components.h5, {
      id: "containerproviderconnectionfactory",
      children: "containerProviderConnectionFactory"
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: (0,jsx_runtime.jsx)(_components.a, {
        href: "/api/interfaces/ContainerProviderConnectionFactory",
        children: (0,jsx_runtime.jsx)(_components.code, {
          children: "ContainerProviderConnectionFactory"
        })
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.h5, {
      id: "connectionauditor",
      children: "connectionAuditor?"
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: (0,jsx_runtime.jsx)(_components.a, {
        href: "/api/interfaces/Auditor",
        children: (0,jsx_runtime.jsx)(_components.code, {
          children: "Auditor"
        })
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "returns-9",
      children: "Returns"
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: (0,jsx_runtime.jsx)(_components.a, {
        href: "/api/classes/Disposable",
        children: (0,jsx_runtime.jsx)(_components.code, {
          children: "Disposable"
        })
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "setkubernetesproviderconnectionfactory",
      children: "setKubernetesProviderConnectionFactory()"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.strong, {
          children: "setKubernetesProviderConnectionFactory"
        }), "(", (0,jsx_runtime.jsx)(_components.code, {
          children: "containerProviderConnectionFactory"
        }), ", ", (0,jsx_runtime.jsx)(_components.code, {
          children: "connectionAuditor?"
        }), "): ", (0,jsx_runtime.jsx)(_components.a, {
          href: "/api/classes/Disposable",
          children: (0,jsx_runtime.jsx)(_components.code, {
            children: "Disposable"
          })
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/6c9518088de3d8bdc1a521e03434508c61ddc31a/packages/extension-api/src/extension-api.d.ts#L704",
        children: "packages/extension-api/src/extension-api.d.ts:704"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "parameters-9",
      children: "Parameters"
    }), "\n", (0,jsx_runtime.jsx)(_components.h5, {
      id: "containerproviderconnectionfactory-1",
      children: "containerProviderConnectionFactory"
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: (0,jsx_runtime.jsx)(_components.a, {
        href: "/api/interfaces/KubernetesProviderConnectionFactory",
        children: (0,jsx_runtime.jsx)(_components.code, {
          children: "KubernetesProviderConnectionFactory"
        })
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.h5, {
      id: "connectionauditor-1",
      children: "connectionAuditor?"
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: (0,jsx_runtime.jsx)(_components.a, {
        href: "/api/interfaces/Auditor",
        children: (0,jsx_runtime.jsx)(_components.code, {
          children: "Auditor"
        })
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "returns-10",
      children: "Returns"
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: (0,jsx_runtime.jsx)(_components.a, {
        href: "/api/classes/Disposable",
        children: (0,jsx_runtime.jsx)(_components.code, {
          children: "Disposable"
        })
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "setvmproviderconnectionfactory",
      children: "setVmProviderConnectionFactory()"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.strong, {
          children: "setVmProviderConnectionFactory"
        }), "(", (0,jsx_runtime.jsx)(_components.code, {
          children: "vmProviderConnectionFactory"
        }), ", ", (0,jsx_runtime.jsx)(_components.code, {
          children: "connectionAuditor?"
        }), "): ", (0,jsx_runtime.jsx)(_components.a, {
          href: "/api/classes/Disposable",
          children: (0,jsx_runtime.jsx)(_components.code, {
            children: "Disposable"
          })
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/6c9518088de3d8bdc1a521e03434508c61ddc31a/packages/extension-api/src/extension-api.d.ts#L708",
        children: "packages/extension-api/src/extension-api.d.ts:708"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "parameters-10",
      children: "Parameters"
    }), "\n", (0,jsx_runtime.jsx)(_components.h5, {
      id: "vmproviderconnectionfactory",
      children: "vmProviderConnectionFactory"
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: (0,jsx_runtime.jsx)(_components.a, {
        href: "/api/interfaces/VmProviderConnectionFactory",
        children: (0,jsx_runtime.jsx)(_components.code, {
          children: "VmProviderConnectionFactory"
        })
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.h5, {
      id: "connectionauditor-2",
      children: "connectionAuditor?"
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: (0,jsx_runtime.jsx)(_components.a, {
        href: "/api/interfaces/Auditor",
        children: (0,jsx_runtime.jsx)(_components.code, {
          children: "Auditor"
        })
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "returns-11",
      children: "Returns"
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: (0,jsx_runtime.jsx)(_components.a, {
        href: "/api/classes/Disposable",
        children: (0,jsx_runtime.jsx)(_components.code, {
          children: "Disposable"
        })
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "updatedetectionchecks",
      children: "updateDetectionChecks()"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.strong, {
          children: "updateDetectionChecks"
        }), "(", (0,jsx_runtime.jsx)(_components.code, {
          children: "detectionChecks"
        }), "): ", (0,jsx_runtime.jsx)(_components.code, {
          children: "void"
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/6c9518088de3d8bdc1a521e03434508c61ddc31a/packages/extension-api/src/extension-api.d.ts#L750",
        children: "packages/extension-api/src/extension-api.d.ts:750"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "parameters-11",
      children: "Parameters"
    }), "\n", (0,jsx_runtime.jsx)(_components.h5, {
      id: "detectionchecks-1",
      children: "detectionChecks"
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: [(0,jsx_runtime.jsx)(_components.a, {
        href: "/api/interfaces/ProviderDetectionCheck",
        children: (0,jsx_runtime.jsx)(_components.code, {
          children: "ProviderDetectionCheck"
        })
      }), "[]"]
    }), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "returns-12",
      children: "Returns"
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        children: "void"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "updatestatus",
      children: "updateStatus()"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.strong, {
          children: "updateStatus"
        }), "(", (0,jsx_runtime.jsx)(_components.code, {
          children: "status"
        }), "): ", (0,jsx_runtime.jsx)(_components.code, {
          children: "void"
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/6c9518088de3d8bdc1a521e03434508c61ddc31a/packages/extension-api/src/extension-api.d.ts#L733",
        children: "packages/extension-api/src/extension-api.d.ts:733"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "parameters-12",
      children: "Parameters"
    }), "\n", (0,jsx_runtime.jsx)(_components.h5, {
      id: "status-1",
      children: "status"
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: (0,jsx_runtime.jsx)(_components.a, {
        href: "/api/type-aliases/ProviderStatus",
        children: (0,jsx_runtime.jsx)(_components.code, {
          children: "ProviderStatus"
        })
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "returns-13",
      children: "Returns"
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        children: "void"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "updateversion",
      children: "updateVersion()"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.strong, {
          children: "updateVersion"
        }), "(", (0,jsx_runtime.jsx)(_components.code, {
          children: "version?"
        }), "): ", (0,jsx_runtime.jsx)(_components.code, {
          children: "void"
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/6c9518088de3d8bdc1a521e03434508c61ddc31a/packages/extension-api/src/extension-api.d.ts#L738",
        children: "packages/extension-api/src/extension-api.d.ts:738"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "parameters-13",
      children: "Parameters"
    }), "\n", (0,jsx_runtime.jsx)(_components.h5, {
      id: "version-1",
      children: "version?"
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        children: "string"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "returns-14",
      children: "Returns"
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        children: "void"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "updatewarnings",
      children: "updateWarnings()"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.strong, {
          children: "updateWarnings"
        }), "(", (0,jsx_runtime.jsx)(_components.code, {
          children: "warnings"
        }), "): ", (0,jsx_runtime.jsx)(_components.code, {
          children: "void"
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/6c9518088de3d8bdc1a521e03434508c61ddc31a/packages/extension-api/src/extension-api.d.ts#L754",
        children: "packages/extension-api/src/extension-api.d.ts:754"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "parameters-14",
      children: "Parameters"
    }), "\n", (0,jsx_runtime.jsx)(_components.h5, {
      id: "warnings-1",
      children: "warnings"
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: [(0,jsx_runtime.jsx)(_components.a, {
        href: "/api/interfaces/ProviderInformation",
        children: (0,jsx_runtime.jsx)(_components.code, {
          children: "ProviderInformation"
        })
      }), "[]"]
    }), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "returns-15",
      children: "Returns"
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        children: "void"
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