"use strict";
(globalThis["webpackChunkdocs"] = globalThis["webpackChunkdocs"] || []).push([[99872],{

/***/ 39671
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  assets: () => (/* binding */ assets),
  contentTitle: () => (/* binding */ contentTitle),
  "default": () => (/* binding */ MDXContent),
  frontMatter: () => (/* binding */ frontMatter),
  metadata: () => (/* reexport */ site_api_interfaces_build_image_options_md_5e8_namespaceObject),
  toc: () => (/* binding */ toc)
});

;// ./.docusaurus/docusaurus-plugin-content-docs/api/site-api-interfaces-build-image-options-md-5e8.json
const site_api_interfaces_build_image_options_md_5e8_namespaceObject = /*#__PURE__*/JSON.parse('{"id":"interfaces/BuildImageOptions","title":"Interface: BuildImageOptions","description":"Defined in3701","source":"@site/api/interfaces/BuildImageOptions.md","sourceDirName":"interfaces","slug":"/interfaces/BuildImageOptions","permalink":"/api/interfaces/BuildImageOptions","draft":false,"unlisted":false,"tags":[],"version":"current","frontMatter":{},"sidebar":"typedocSidebar","previous":{"title":"BlkioStats","permalink":"/api/interfaces/BlkioStats"},"next":{"title":"CancellationToken","permalink":"/api/interfaces/CancellationToken"}}');
// EXTERNAL MODULE: ../node_modules/react/jsx-runtime.js
var jsx_runtime = __webpack_require__(62540);
// EXTERNAL MODULE: ../node_modules/@mdx-js/react/lib/index.js
var lib = __webpack_require__(43023);
;// ./api/interfaces/BuildImageOptions.md


const frontMatter = {};
const contentTitle = 'Interface: BuildImageOptions';

const assets = {

};



const toc = [{
  "value": "Properties",
  "id": "properties",
  "level": 2
}, {
  "value": "abortController?",
  "id": "abortcontroller",
  "level": 3
}, {
  "value": "buildargs?",
  "id": "buildargs",
  "level": 3
}, {
  "value": "Index Signature",
  "id": "index-signature",
  "level": 4
}, {
  "value": "cachefrom?",
  "id": "cachefrom",
  "level": 3
}, {
  "value": "containerFile?",
  "id": "containerfile",
  "level": 3
}, {
  "value": "cpuperiod?",
  "id": "cpuperiod",
  "level": 3
}, {
  "value": "cpuquota?",
  "id": "cpuquota",
  "level": 3
}, {
  "value": "cpusetcpus?",
  "id": "cpusetcpus",
  "level": 3
}, {
  "value": "cpushares?",
  "id": "cpushares",
  "level": 3
}, {
  "value": "extrahosts?",
  "id": "extrahosts",
  "level": 3
}, {
  "value": "forcerm?",
  "id": "forcerm",
  "level": 3
}, {
  "value": "labels?",
  "id": "labels",
  "level": 3
}, {
  "value": "Index Signature",
  "id": "index-signature-1",
  "level": 4
}, {
  "value": "memory?",
  "id": "memory",
  "level": 3
}, {
  "value": "memswap?",
  "id": "memswap",
  "level": 3
}, {
  "value": "networkmode?",
  "id": "networkmode",
  "level": 3
}, {
  "value": "nocache?",
  "id": "nocache",
  "level": 3
}, {
  "value": "outputs?",
  "id": "outputs",
  "level": 3
}, {
  "value": "platform?",
  "id": "platform",
  "level": 3
}, {
  "value": "provider?",
  "id": "provider",
  "level": 3
}, {
  "value": "pull?",
  "id": "pull",
  "level": 3
}, {
  "value": "q?",
  "id": "q",
  "level": 3
}, {
  "value": "remote?",
  "id": "remote",
  "level": 3
}, {
  "value": "rm?",
  "id": "rm",
  "level": 3
}, {
  "value": "shmsize?",
  "id": "shmsize",
  "level": 3
}, {
  "value": "squash?",
  "id": "squash",
  "level": 3
}, {
  "value": "tag?",
  "id": "tag",
  "level": 3
}, {
  "value": "target?",
  "id": "target",
  "level": 3
}, {
  "value": "validateRegistries?",
  "id": "validateregistries",
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
        id: "interface-buildimageoptions",
        children: "Interface: BuildImageOptions"
      })
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/d1d7e0826bc7c3010d32002d5df1d3b33c9c3f45/packages/extension-api/src/extension-api.d.ts#L3701",
        children: "packages/extension-api/src/extension-api.d.ts:3701"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.h2, {
      id: "properties",
      children: "Properties"
    }), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "abortcontroller",
      children: "abortController?"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "optional"
        }), " ", (0,jsx_runtime.jsx)(_components.strong, {
          children: "abortController?"
        }), ": ", (0,jsx_runtime.jsx)(_components.code, {
          children: "AbortController"
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/d1d7e0826bc7c3010d32002d5df1d3b33c9c3f45/packages/extension-api/src/extension-api.d.ts#L3725",
        children: "packages/extension-api/src/extension-api.d.ts:3725"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "The abort controller for running the build image operation"
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "buildargs",
      children: "buildargs?"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "optional"
        }), " ", (0,jsx_runtime.jsx)(_components.strong, {
          children: "buildargs?"
        }), ": ", (0,jsx_runtime.jsx)(_components.code, {
          children: "object"
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/d1d7e0826bc7c3010d32002d5df1d3b33c9c3f45/packages/extension-api/src/extension-api.d.ts#L3809",
        children: "packages/extension-api/src/extension-api.d.ts:3809"
      })]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["JSON map of string pairs for build-time variables. Users pass these values at build-time. Docker uses the\nbuildargs as the environment context for commands run via the ", (0,jsx_runtime.jsx)(_components.code, {
        children: "Dockerfile"
      }), " RUN instruction, or for variable\nexpansion in other ", (0,jsx_runtime.jsx)(_components.code, {
        children: "Dockerfilev"
      }), " instructions. This is not meant for passing secret values.\nFor example, the build arg ", (0,jsx_runtime.jsx)(_components.code, {
        children: "FOO=bar"
      }), " would become ", (0,jsx_runtime.jsx)(_components.code, {
        children: "{\"FOO\":\"bar\"}"
      }), " in JSON. This would result in the query\nparameter ", (0,jsx_runtime.jsx)(_components.code, {
        children: "buildargs={\"FOO\":\"bar\"}"
      }), ". Note that ", (0,jsx_runtime.jsx)(_components.code, {
        children: "{\"FOO\":\"bar\"}"
      }), " should be URI component encoded."]
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
      id: "cachefrom",
      children: "cachefrom?"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "optional"
        }), " ", (0,jsx_runtime.jsx)(_components.strong, {
          children: "cachefrom?"
        }), ": ", (0,jsx_runtime.jsx)(_components.code, {
          children: "string"
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/d1d7e0826bc7c3010d32002d5df1d3b33c9c3f45/packages/extension-api/src/extension-api.d.ts#L3751",
        children: "packages/extension-api/src/extension-api.d.ts:3751"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "JSON array of images used for build cache resolution."
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "containerfile",
      children: "containerFile?"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "optional"
        }), " ", (0,jsx_runtime.jsx)(_components.strong, {
          children: "containerFile?"
        }), ": ", (0,jsx_runtime.jsx)(_components.code, {
          children: "string"
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/d1d7e0826bc7c3010d32002d5df1d3b33c9c3f45/packages/extension-api/src/extension-api.d.ts#L3705",
        children: "packages/extension-api/src/extension-api.d.ts:3705"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Specifies a Containerfile which contains instructions for building the image"
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "cpuperiod",
      children: "cpuperiod?"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "optional"
        }), " ", (0,jsx_runtime.jsx)(_components.strong, {
          children: "cpuperiod?"
        }), ": ", (0,jsx_runtime.jsx)(_components.code, {
          children: "number"
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/d1d7e0826bc7c3010d32002d5df1d3b33c9c3f45/packages/extension-api/src/extension-api.d.ts#L3795",
        children: "packages/extension-api/src/extension-api.d.ts:3795"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "The length of a CPU period in microseconds."
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "cpuquota",
      children: "cpuquota?"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "optional"
        }), " ", (0,jsx_runtime.jsx)(_components.strong, {
          children: "cpuquota?"
        }), ": ", (0,jsx_runtime.jsx)(_components.code, {
          children: "number"
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/d1d7e0826bc7c3010d32002d5df1d3b33c9c3f45/packages/extension-api/src/extension-api.d.ts#L3800",
        children: "packages/extension-api/src/extension-api.d.ts:3800"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Microseconds of CPU time that the container can get in a CPU period."
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "cpusetcpus",
      children: "cpusetcpus?"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "optional"
        }), " ", (0,jsx_runtime.jsx)(_components.strong, {
          children: "cpusetcpus?"
        }), ": ", (0,jsx_runtime.jsx)(_components.code, {
          children: "number"
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/d1d7e0826bc7c3010d32002d5df1d3b33c9c3f45/packages/extension-api/src/extension-api.d.ts#L3790",
        children: "packages/extension-api/src/extension-api.d.ts:3790"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "CPUs in which to allow execution (e.g., 0-3, 0,1)."
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "cpushares",
      children: "cpushares?"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "optional"
        }), " ", (0,jsx_runtime.jsx)(_components.strong, {
          children: "cpushares?"
        }), ": ", (0,jsx_runtime.jsx)(_components.code, {
          children: "number"
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/d1d7e0826bc7c3010d32002d5df1d3b33c9c3f45/packages/extension-api/src/extension-api.d.ts#L3785",
        children: "packages/extension-api/src/extension-api.d.ts:3785"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "CPU shares (relative weight)."
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "extrahosts",
      children: "extrahosts?"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "optional"
        }), " ", (0,jsx_runtime.jsx)(_components.strong, {
          children: "extrahosts?"
        }), ": ", (0,jsx_runtime.jsx)(_components.code, {
          children: "string"
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/d1d7e0826bc7c3010d32002d5df1d3b33c9c3f45/packages/extension-api/src/extension-api.d.ts#L3730",
        children: "packages/extension-api/src/extension-api.d.ts:3730"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Extra hosts to add to /etc/hosts"
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "forcerm",
      children: "forcerm?"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "optional"
        }), " ", (0,jsx_runtime.jsx)(_components.strong, {
          children: "forcerm?"
        }), ": ", (0,jsx_runtime.jsx)(_components.code, {
          children: "boolean"
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/d1d7e0826bc7c3010d32002d5df1d3b33c9c3f45/packages/extension-api/src/extension-api.d.ts#L3770",
        children: "packages/extension-api/src/extension-api.d.ts:3770"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Default: false"
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Always remove intermediate containers, even upon failure."
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "labels",
      children: "labels?"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "optional"
        }), " ", (0,jsx_runtime.jsx)(_components.strong, {
          children: "labels?"
        }), ": ", (0,jsx_runtime.jsx)(_components.code, {
          children: "object"
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/d1d7e0826bc7c3010d32002d5df1d3b33c9c3f45/packages/extension-api/src/extension-api.d.ts#L3824",
        children: "packages/extension-api/src/extension-api.d.ts:3824"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Arbitrary key/value labels to set on the image, as a JSON map of string pairs."
    }), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "index-signature-1",
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
      id: "memory",
      children: "memory?"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "optional"
        }), " ", (0,jsx_runtime.jsx)(_components.strong, {
          children: "memory?"
        }), ": ", (0,jsx_runtime.jsx)(_components.code, {
          children: "number"
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/d1d7e0826bc7c3010d32002d5df1d3b33c9c3f45/packages/extension-api/src/extension-api.d.ts#L3775",
        children: "packages/extension-api/src/extension-api.d.ts:3775"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Set memory limit for build."
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "memswap",
      children: "memswap?"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "optional"
        }), " ", (0,jsx_runtime.jsx)(_components.strong, {
          children: "memswap?"
        }), ": ", (0,jsx_runtime.jsx)(_components.code, {
          children: "number"
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/d1d7e0826bc7c3010d32002d5df1d3b33c9c3f45/packages/extension-api/src/extension-api.d.ts#L3780",
        children: "packages/extension-api/src/extension-api.d.ts:3780"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Total memory (memory + swap). Set as -1 to disable swap."
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "networkmode",
      children: "networkmode?"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "optional"
        }), " ", (0,jsx_runtime.jsx)(_components.strong, {
          children: "networkmode?"
        }), ": ", (0,jsx_runtime.jsx)(_components.code, {
          children: "string"
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/d1d7e0826bc7c3010d32002d5df1d3b33c9c3f45/packages/extension-api/src/extension-api.d.ts#L3831",
        children: "packages/extension-api/src/extension-api.d.ts:3831"
      })]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Sets the networking mode for the run commands during build. Supported standard values are: ", (0,jsx_runtime.jsx)(_components.code, {
        children: "bridge"
      }), ",\n", (0,jsx_runtime.jsx)(_components.code, {
        children: "host"
      }), ", ", (0,jsx_runtime.jsx)(_components.code, {
        children: "none"
      }), ", and ", (0,jsx_runtime.jsx)(_components.code, {
        children: "container:<name|id>"
      }), ". Any other value is taken as a custom network's name or ID\nto which this container should connect to."]
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "nocache",
      children: "nocache?"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "optional"
        }), " ", (0,jsx_runtime.jsx)(_components.strong, {
          children: "nocache?"
        }), ": ", (0,jsx_runtime.jsx)(_components.code, {
          children: "boolean"
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/d1d7e0826bc7c3010d32002d5df1d3b33c9c3f45/packages/extension-api/src/extension-api.d.ts#L3852",
        children: "packages/extension-api/src/extension-api.d.ts:3852"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Default: false"
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Do not use the cache when building the image."
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "outputs",
      children: "outputs?"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "optional"
        }), " ", (0,jsx_runtime.jsx)(_components.strong, {
          children: "outputs?"
        }), ": ", (0,jsx_runtime.jsx)(_components.code, {
          children: "string"
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/d1d7e0826bc7c3010d32002d5df1d3b33c9c3f45/packages/extension-api/src/extension-api.d.ts#L3845",
        children: "packages/extension-api/src/extension-api.d.ts:3845"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Default: \"\""
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "BuildKit output configuration"
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "platform",
      children: "platform?"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "optional"
        }), " ", (0,jsx_runtime.jsx)(_components.strong, {
          children: "platform?"
        }), ": ", (0,jsx_runtime.jsx)(_components.code, {
          children: "string"
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/d1d7e0826bc7c3010d32002d5df1d3b33c9c3f45/packages/extension-api/src/extension-api.d.ts#L3715",
        children: "packages/extension-api/src/extension-api.d.ts:3715"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Set the os/arch of the built image (and its base image, when using one) to the provided value instead of using the current operating system and architecture of the host"
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "provider",
      children: "provider?"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "optional"
        }), " ", (0,jsx_runtime.jsx)(_components.strong, {
          children: "provider?"
        }), ": ", (0,jsx_runtime.jsx)(_components.a, {
          href: "/api/interfaces/ContainerProviderConnection",
          children: (0,jsx_runtime.jsx)(_components.code, {
            children: "ContainerProviderConnection"
          })
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/d1d7e0826bc7c3010d32002d5df1d3b33c9c3f45/packages/extension-api/src/extension-api.d.ts#L3720",
        children: "packages/extension-api/src/extension-api.d.ts:3720"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Set the provider to use, if not we will try select the first one available (sorted in favor of Podman)"
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "pull",
      children: "pull?"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "optional"
        }), " ", (0,jsx_runtime.jsx)(_components.strong, {
          children: "pull?"
        }), ": ", (0,jsx_runtime.jsx)(_components.code, {
          children: "string"
        }), " | ", (0,jsx_runtime.jsx)(_components.code, {
          children: "boolean"
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/d1d7e0826bc7c3010d32002d5df1d3b33c9c3f45/packages/extension-api/src/extension-api.d.ts#L3756",
        children: "packages/extension-api/src/extension-api.d.ts:3756"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Attempt to pull the image even if an older image exists locally."
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "q",
      children: "q?"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "optional"
        }), " ", (0,jsx_runtime.jsx)(_components.strong, {
          children: "q?"
        }), ": ", (0,jsx_runtime.jsx)(_components.code, {
          children: "boolean"
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/d1d7e0826bc7c3010d32002d5df1d3b33c9c3f45/packages/extension-api/src/extension-api.d.ts#L3746",
        children: "packages/extension-api/src/extension-api.d.ts:3746"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Default: false"
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Suppress verbose build output."
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "remote",
      children: "remote?"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "optional"
        }), " ", (0,jsx_runtime.jsx)(_components.strong, {
          children: "remote?"
        }), ": ", (0,jsx_runtime.jsx)(_components.code, {
          children: "string"
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/d1d7e0826bc7c3010d32002d5df1d3b33c9c3f45/packages/extension-api/src/extension-api.d.ts#L3739",
        children: "packages/extension-api/src/extension-api.d.ts:3739"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "A Git repository URI or HTTP/HTTPS context URI. If the URI points to a single text file, the file’s contents are\nplaced into a file called Dockerfile and the image is built from that file. If the URI points to a tarball, the\nfile is downloaded by the daemon and the contents therein used as the context for the build. If the URI points\nto a tarball and the dockerfile parameter is also specified, there must be a file with the corresponding path\ninside the tarball."
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "rm",
      children: "rm?"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "optional"
        }), " ", (0,jsx_runtime.jsx)(_components.strong, {
          children: "rm?"
        }), ": ", (0,jsx_runtime.jsx)(_components.code, {
          children: "boolean"
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/d1d7e0826bc7c3010d32002d5df1d3b33c9c3f45/packages/extension-api/src/extension-api.d.ts#L3763",
        children: "packages/extension-api/src/extension-api.d.ts:3763"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Default: true"
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Remove intermediate containers after a successful build."
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "shmsize",
      children: "shmsize?"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "optional"
        }), " ", (0,jsx_runtime.jsx)(_components.strong, {
          children: "shmsize?"
        }), ": ", (0,jsx_runtime.jsx)(_components.code, {
          children: "number"
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/d1d7e0826bc7c3010d32002d5df1d3b33c9c3f45/packages/extension-api/src/extension-api.d.ts#L3814",
        children: "packages/extension-api/src/extension-api.d.ts:3814"
      })]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Size of ", (0,jsx_runtime.jsx)(_components.code, {
        children: "/dev/shm"
      }), " in bytes. The size must be greater than 0. If omitted the system uses 64MB."]
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "squash",
      children: "squash?"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "optional"
        }), " ", (0,jsx_runtime.jsx)(_components.strong, {
          children: "squash?"
        }), ": ", (0,jsx_runtime.jsx)(_components.code, {
          children: "boolean"
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/d1d7e0826bc7c3010d32002d5df1d3b33c9c3f45/packages/extension-api/src/extension-api.d.ts#L3819",
        children: "packages/extension-api/src/extension-api.d.ts:3819"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Squash the resulting images layers into a single layer."
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "tag",
      children: "tag?"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "optional"
        }), " ", (0,jsx_runtime.jsx)(_components.strong, {
          children: "tag?"
        }), ": ", (0,jsx_runtime.jsx)(_components.code, {
          children: "string"
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/d1d7e0826bc7c3010d32002d5df1d3b33c9c3f45/packages/extension-api/src/extension-api.d.ts#L3710",
        children: "packages/extension-api/src/extension-api.d.ts:3710"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Specifies the name which is assigned to the resulting image if the build process completes successfully"
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "target",
      children: "target?"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "optional"
        }), " ", (0,jsx_runtime.jsx)(_components.strong, {
          children: "target?"
        }), ": ", (0,jsx_runtime.jsx)(_components.code, {
          children: "string"
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/d1d7e0826bc7c3010d32002d5df1d3b33c9c3f45/packages/extension-api/src/extension-api.d.ts#L3838",
        children: "packages/extension-api/src/extension-api.d.ts:3838"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Default: \"\""
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Target build stage"
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "validateregistries",
      children: "validateRegistries?"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "optional"
        }), " ", (0,jsx_runtime.jsx)(_components.strong, {
          children: "validateRegistries?"
        }), ": ", (0,jsx_runtime.jsx)(_components.code, {
          children: "boolean"
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/d1d7e0826bc7c3010d32002d5df1d3b33c9c3f45/packages/extension-api/src/extension-api.d.ts#L3859",
        children: "packages/extension-api/src/extension-api.d.ts:3859"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Default: true"
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Validate existing registries before building."
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