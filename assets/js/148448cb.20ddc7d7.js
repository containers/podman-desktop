"use strict";
(globalThis["webpackChunkdocs"] = globalThis["webpackChunkdocs"] || []).push([[40611],{

/***/ 70936
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  assets: () => (/* binding */ assets),
  contentTitle: () => (/* binding */ contentTitle),
  "default": () => (/* binding */ MDXContent),
  frontMatter: () => (/* binding */ frontMatter),
  metadata: () => (/* reexport */ site_api_interfaces_container_create_options_md_148_namespaceObject),
  toc: () => (/* binding */ toc)
});

;// ./.docusaurus/docusaurus-plugin-content-docs/api/site-api-interfaces-container-create-options-md-148.json
const site_api_interfaces_container_create_options_md_148_namespaceObject = /*#__PURE__*/JSON.parse('{"id":"interfaces/ContainerCreateOptions","title":"Interface: ContainerCreateOptions","description":"Defined in3374","source":"@site/api/interfaces/ContainerCreateOptions.md","sourceDirName":"interfaces","slug":"/interfaces/ContainerCreateOptions","permalink":"/api/interfaces/ContainerCreateOptions","draft":false,"unlisted":false,"tags":[],"version":"current","frontMatter":{},"sidebar":"typedocSidebar","previous":{"title":"ContainerAuthInfo","permalink":"/api/interfaces/ContainerAuthInfo"},"next":{"title":"ContainerCreateResult","permalink":"/api/interfaces/ContainerCreateResult"}}');
// EXTERNAL MODULE: ../node_modules/react/jsx-runtime.js
var jsx_runtime = __webpack_require__(62540);
// EXTERNAL MODULE: ../node_modules/@mdx-js/react/lib/index.js
var lib = __webpack_require__(43023);
;// ./api/interfaces/ContainerCreateOptions.md


const frontMatter = {};
const contentTitle = 'Interface: ContainerCreateOptions';

const assets = {

};



const toc = [{
  "value": "Properties",
  "id": "properties",
  "level": 2
}, {
  "value": "ArgsEscaped?",
  "id": "argsescaped",
  "level": 3
}, {
  "value": "AttachStderr?",
  "id": "attachstderr",
  "level": 3
}, {
  "value": "AttachStdin?",
  "id": "attachstdin",
  "level": 3
}, {
  "value": "AttachStdout?",
  "id": "attachstdout",
  "level": 3
}, {
  "value": "Cmd?",
  "id": "cmd",
  "level": 3
}, {
  "value": "Detach?",
  "id": "detach",
  "level": 3
}, {
  "value": "Domainname?",
  "id": "domainname",
  "level": 3
}, {
  "value": "Entrypoint?",
  "id": "entrypoint",
  "level": 3
}, {
  "value": "Env?",
  "id": "env",
  "level": 3
}, {
  "value": "EnvFiles?",
  "id": "envfiles",
  "level": 3
}, {
  "value": "ExposedPorts?",
  "id": "exposedports",
  "level": 3
}, {
  "value": "Index Signature",
  "id": "index-signature",
  "level": 4
}, {
  "value": "HealthCheck?",
  "id": "healthcheck",
  "level": 3
}, {
  "value": "HostConfig?",
  "id": "hostconfig",
  "level": 3
}, {
  "value": "Hostname?",
  "id": "hostname",
  "level": 3
}, {
  "value": "Image?",
  "id": "image",
  "level": 3
}, {
  "value": "Labels?",
  "id": "labels",
  "level": 3
}, {
  "value": "Index Signature",
  "id": "index-signature-1",
  "level": 4
}, {
  "value": "MacAddress?",
  "id": "macaddress",
  "level": 3
}, {
  "value": "name?",
  "id": "name",
  "level": 3
}, {
  "value": "NetworkConfig?",
  "id": "networkconfig",
  "level": 3
}, {
  "value": "NetworkDisabled?",
  "id": "networkdisabled",
  "level": 3
}, {
  "value": "OnBuild?",
  "id": "onbuild",
  "level": 3
}, {
  "value": "OpenStdin?",
  "id": "openstdin",
  "level": 3
}, {
  "value": "platform?",
  "id": "platform",
  "level": 3
}, {
  "value": "pod?",
  "id": "pod",
  "level": 3
}, {
  "value": "Shell?",
  "id": "shell",
  "level": 3
}, {
  "value": "start?",
  "id": "start",
  "level": 3
}, {
  "value": "StdinOnce?",
  "id": "stdinonce",
  "level": 3
}, {
  "value": "StopSignal?",
  "id": "stopsignal",
  "level": 3
}, {
  "value": "StopTimeout?",
  "id": "stoptimeout",
  "level": 3
}, {
  "value": "Tty?",
  "id": "tty",
  "level": 3
}, {
  "value": "User?",
  "id": "user",
  "level": 3
}, {
  "value": "Volumes?",
  "id": "volumes",
  "level": 3
}, {
  "value": "Index Signature",
  "id": "index-signature-2",
  "level": 4
}, {
  "value": "WorkingDir?",
  "id": "workingdir",
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
    pre: "pre",
    strong: "strong",
    ...(0,lib/* useMDXComponents */.R)(),
    ...props.components
  };
  return (0,jsx_runtime.jsxs)(jsx_runtime.Fragment, {
    children: [(0,jsx_runtime.jsx)(_components.header, {
      children: (0,jsx_runtime.jsx)(_components.h1, {
        id: "interface-containercreateoptions",
        children: "Interface: ContainerCreateOptions"
      })
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/e815a7ddef53911b2d9e53654b731d219f39dbe1/packages/extension-api/src/extension-api.d.ts#L3374",
        children: "packages/extension-api/src/extension-api.d.ts:3374"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.h2, {
      id: "properties",
      children: "Properties"
    }), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "argsescaped",
      children: "ArgsEscaped?"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "optional"
        }), " ", (0,jsx_runtime.jsx)(_components.strong, {
          children: "ArgsEscaped?"
        }), ": ", (0,jsx_runtime.jsx)(_components.code, {
          children: "boolean"
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/e815a7ddef53911b2d9e53654b731d219f39dbe1/packages/extension-api/src/extension-api.d.ts#L3505",
        children: "packages/extension-api/src/extension-api.d.ts:3505"
      })]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Default: ", (0,jsx_runtime.jsx)(_components.code, {
        children: "false"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Command is already escaped (Windows only)"
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "attachstderr",
      children: "AttachStderr?"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "optional"
        }), " ", (0,jsx_runtime.jsx)(_components.strong, {
          children: "AttachStderr?"
        }), ": ", (0,jsx_runtime.jsx)(_components.code, {
          children: "boolean"
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/e815a7ddef53911b2d9e53654b731d219f39dbe1/packages/extension-api/src/extension-api.d.ts#L3473",
        children: "packages/extension-api/src/extension-api.d.ts:3473"
      })]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Whether to attach to ", (0,jsx_runtime.jsx)(_components.code, {
        children: "stderr"
      }), " (default false)"]
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "attachstdin",
      children: "AttachStdin?"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "optional"
        }), " ", (0,jsx_runtime.jsx)(_components.strong, {
          children: "AttachStdin?"
        }), ": ", (0,jsx_runtime.jsx)(_components.code, {
          children: "boolean"
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/e815a7ddef53911b2d9e53654b731d219f39dbe1/packages/extension-api/src/extension-api.d.ts#L3463",
        children: "packages/extension-api/src/extension-api.d.ts:3463"
      })]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Whether to attach to ", (0,jsx_runtime.jsx)(_components.code, {
        children: "stdin"
      }), " (default false)"]
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "attachstdout",
      children: "AttachStdout?"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "optional"
        }), " ", (0,jsx_runtime.jsx)(_components.strong, {
          children: "AttachStdout?"
        }), ": ", (0,jsx_runtime.jsx)(_components.code, {
          children: "boolean"
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/e815a7ddef53911b2d9e53654b731d219f39dbe1/packages/extension-api/src/extension-api.d.ts#L3468",
        children: "packages/extension-api/src/extension-api.d.ts:3468"
      })]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Whether to attach to ", (0,jsx_runtime.jsx)(_components.code, {
        children: "stdout"
      }), "(default false)"]
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "cmd",
      children: "Cmd?"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "optional"
        }), " ", (0,jsx_runtime.jsx)(_components.strong, {
          children: "Cmd?"
        }), ": ", (0,jsx_runtime.jsx)(_components.code, {
          children: "string"
        }), "[]"]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/e815a7ddef53911b2d9e53654b731d219f39dbe1/packages/extension-api/src/extension-api.d.ts#L3451",
        children: "packages/extension-api/src/extension-api.d.ts:3451"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Command to run specified as an array of strings"
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "detach",
      children: "Detach?"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "optional"
        }), " ", (0,jsx_runtime.jsx)(_components.strong, {
          children: "Detach?"
        }), ": ", (0,jsx_runtime.jsx)(_components.code, {
          children: "boolean"
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/e815a7ddef53911b2d9e53654b731d219f39dbe1/packages/extension-api/src/extension-api.d.ts#L3488",
        children: "packages/extension-api/src/extension-api.d.ts:3488"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Run the container in the background"
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "domainname",
      children: "Domainname?"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "optional"
        }), " ", (0,jsx_runtime.jsx)(_components.strong, {
          children: "Domainname?"
        }), ": ", (0,jsx_runtime.jsx)(_components.code, {
          children: "string"
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/e815a7ddef53911b2d9e53654b731d219f39dbe1/packages/extension-api/src/extension-api.d.ts#L3405",
        children: "packages/extension-api/src/extension-api.d.ts:3405"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "The domain name to use for the container."
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "entrypoint",
      children: "Entrypoint?"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "optional"
        }), " ", (0,jsx_runtime.jsx)(_components.strong, {
          children: "Entrypoint?"
        }), ": ", (0,jsx_runtime.jsx)(_components.code, {
          children: "string"
        }), " | ", (0,jsx_runtime.jsx)(_components.code, {
          children: "string"
        }), "[]"]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/e815a7ddef53911b2d9e53654b731d219f39dbe1/packages/extension-api/src/extension-api.d.ts#L3458",
        children: "packages/extension-api/src/extension-api.d.ts:3458"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "The entry point for the container as a string or an array of strings."
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["If the array consists of exactly one empty string (", (0,jsx_runtime.jsx)(_components.code, {
        children: "[\"\"]"
      }), ") then the entry point is reset to system default (i.e., the entry point used by docker when there is no ENTRYPOINT instruction in the Containerfile)."]
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "env",
      children: "Env?"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "optional"
        }), " ", (0,jsx_runtime.jsx)(_components.strong, {
          children: "Env?"
        }), ": ", (0,jsx_runtime.jsx)(_components.code, {
          children: "string"
        }), "[]"]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/e815a7ddef53911b2d9e53654b731d219f39dbe1/packages/extension-api/src/extension-api.d.ts#L3415",
        children: "packages/extension-api/src/extension-api.d.ts:3415"
      })]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["A list of environment variables to set inside the container in the form ", (0,jsx_runtime.jsx)(_components.code, {
        children: "[\"VAR=value\", ...]"
      }), ". A variable without ", (0,jsx_runtime.jsx)(_components.code, {
        children: "="
      }), " is removed from the environment, rather than to have an empty value"]
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "envfiles",
      children: "EnvFiles?"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "optional"
        }), " ", (0,jsx_runtime.jsx)(_components.strong, {
          children: "EnvFiles?"
        }), ": ", (0,jsx_runtime.jsx)(_components.code, {
          children: "string"
        }), "[]"]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/e815a7ddef53911b2d9e53654b731d219f39dbe1/packages/extension-api/src/extension-api.d.ts#L3420",
        children: "packages/extension-api/src/extension-api.d.ts:3420"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Environment files to use"
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "exposedports",
      children: "ExposedPorts?"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "optional"
        }), " ", (0,jsx_runtime.jsx)(_components.strong, {
          children: "ExposedPorts?"
        }), ": ", (0,jsx_runtime.jsx)(_components.code, {
          children: "object"
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/e815a7ddef53911b2d9e53654b731d219f39dbe1/packages/extension-api/src/extension-api.d.ts#L3431",
        children: "packages/extension-api/src/extension-api.d.ts:3431"
      })]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["An object mapping ports to an empty object in the form: ", (0,jsx_runtime.jsx)(_components.code, {
        children: "{\"<port>/<tcp|udp|sctp>\": {}}"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "index-signature",
      children: "Index Signature"
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["[", (0,jsx_runtime.jsx)(_components.code, {
        children: "port"
      }), ": ", (0,jsx_runtime.jsx)(_components.code, {
        children: "string"
      }), "]: ", (0,jsx_runtime.jsx)(_components.code, {
        children: "object"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "healthcheck",
      children: "HealthCheck?"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "optional"
        }), " ", (0,jsx_runtime.jsx)(_components.strong, {
          children: "HealthCheck?"
        }), ": ", (0,jsx_runtime.jsx)(_components.a, {
          href: "/api/interfaces/HealthConfig",
          children: (0,jsx_runtime.jsx)(_components.code, {
            children: "HealthConfig"
          })
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/e815a7ddef53911b2d9e53654b731d219f39dbe1/packages/extension-api/src/extension-api.d.ts#L3498",
        children: "packages/extension-api/src/extension-api.d.ts:3498"
      })]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["A test to perform to check that the container is healthy. See ", (0,jsx_runtime.jsx)(_components.a, {
        href: "/api/interfaces/HealthConfig",
        children: "HealthConfig"
      }), " for usage details"]
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "hostconfig",
      children: "HostConfig?"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "optional"
        }), " ", (0,jsx_runtime.jsx)(_components.strong, {
          children: "HostConfig?"
        }), ": ", (0,jsx_runtime.jsx)(_components.a, {
          href: "/api/interfaces/HostConfig",
          children: (0,jsx_runtime.jsx)(_components.code, {
            children: "HostConfig"
          })
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/e815a7ddef53911b2d9e53654b731d219f39dbe1/packages/extension-api/src/extension-api.d.ts#L3436",
        children: "packages/extension-api/src/extension-api.d.ts:3436"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Container configuration that depends on the host we are running on"
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "hostname",
      children: "Hostname?"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "optional"
        }), " ", (0,jsx_runtime.jsx)(_components.strong, {
          children: "Hostname?"
        }), ": ", (0,jsx_runtime.jsx)(_components.code, {
          children: "string"
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/e815a7ddef53911b2d9e53654b731d219f39dbe1/packages/extension-api/src/extension-api.d.ts#L3400",
        children: "packages/extension-api/src/extension-api.d.ts:3400"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "The hostname to use for the container, as a valid RFC 1123 hostname"
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "image",
      children: "Image?"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "optional"
        }), " ", (0,jsx_runtime.jsx)(_components.strong, {
          children: "Image?"
        }), ": ", (0,jsx_runtime.jsx)(_components.code, {
          children: "string"
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/e815a7ddef53911b2d9e53654b731d219f39dbe1/packages/extension-api/src/extension-api.d.ts#L3441",
        children: "packages/extension-api/src/extension-api.d.ts:3441"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "The name (or reference) of the image to use when creating the container"
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "labels",
      children: "Labels?"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "optional"
        }), " ", (0,jsx_runtime.jsx)(_components.strong, {
          children: "Labels?"
        }), ": ", (0,jsx_runtime.jsx)(_components.code, {
          children: "object"
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/e815a7ddef53911b2d9e53654b731d219f39dbe1/packages/extension-api/src/extension-api.d.ts#L3425",
        children: "packages/extension-api/src/extension-api.d.ts:3425"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "User-defined key/value metadata"
    }), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "index-signature-1",
      children: "Index Signature"
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["[", (0,jsx_runtime.jsx)(_components.code, {
        children: "label"
      }), ": ", (0,jsx_runtime.jsx)(_components.code, {
        children: "string"
      }), "]: ", (0,jsx_runtime.jsx)(_components.code, {
        children: "string"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "macaddress",
      children: "MacAddress?"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "optional"
        }), " ", (0,jsx_runtime.jsx)(_components.strong, {
          children: "MacAddress?"
        }), ": ", (0,jsx_runtime.jsx)(_components.code, {
          children: "string"
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/e815a7ddef53911b2d9e53654b731d219f39dbe1/packages/extension-api/src/extension-api.d.ts#L3525",
        children: "packages/extension-api/src/extension-api.d.ts:3525"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "MAC address of the container."
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "name",
      children: "name?"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "optional"
        }), " ", (0,jsx_runtime.jsx)(_components.strong, {
          children: "name?"
        }), ": ", (0,jsx_runtime.jsx)(_components.code, {
          children: "string"
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/e815a7ddef53911b2d9e53654b731d219f39dbe1/packages/extension-api/src/extension-api.d.ts#L3378",
        children: "packages/extension-api/src/extension-api.d.ts:3378"
      })]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Assign the specified name to the container. Must match the regular expression", (0,jsx_runtime.jsx)(_components.code, {
        children: "/?[a-zA-Z0-9][a-zA-Z0-9_.-]+"
      }), ". If not speficied, the platform assigns a unique name to the container"]
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "networkconfig",
      children: "NetworkConfig?"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "optional"
        }), " ", (0,jsx_runtime.jsx)(_components.strong, {
          children: "NetworkConfig?"
        }), ": ", (0,jsx_runtime.jsx)(_components.a, {
          href: "/api/interfaces/NetworkingConfig",
          children: (0,jsx_runtime.jsx)(_components.code, {
            children: "NetworkingConfig"
          })
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/e815a7ddef53911b2d9e53654b731d219f39dbe1/packages/extension-api/src/extension-api.d.ts#L3549",
        children: "packages/extension-api/src/extension-api.d.ts:3549"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "networkdisabled",
      children: "NetworkDisabled?"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "optional"
        }), " ", (0,jsx_runtime.jsx)(_components.strong, {
          children: "NetworkDisabled?"
        }), ": ", (0,jsx_runtime.jsx)(_components.code, {
          children: "boolean"
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/e815a7ddef53911b2d9e53654b731d219f39dbe1/packages/extension-api/src/extension-api.d.ts#L3520",
        children: "packages/extension-api/src/extension-api.d.ts:3520"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Disable networking for the container."
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "onbuild",
      children: "OnBuild?"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "optional"
        }), " ", (0,jsx_runtime.jsx)(_components.strong, {
          children: "OnBuild?"
        }), ": ", (0,jsx_runtime.jsx)(_components.code, {
          children: "string"
        }), "[]"]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/e815a7ddef53911b2d9e53654b731d219f39dbe1/packages/extension-api/src/extension-api.d.ts#L3530",
        children: "packages/extension-api/src/extension-api.d.ts:3530"
      })]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: [(0,jsx_runtime.jsx)(_components.code, {
        children: "ONBUILD"
      }), " metadata that were defined in the image's ", (0,jsx_runtime.jsx)(_components.code, {
        children: "Dockerfile"
      }), "."]
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "openstdin",
      children: "OpenStdin?"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "optional"
        }), " ", (0,jsx_runtime.jsx)(_components.strong, {
          children: "OpenStdin?"
        }), ": ", (0,jsx_runtime.jsx)(_components.code, {
          children: "boolean"
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/e815a7ddef53911b2d9e53654b731d219f39dbe1/packages/extension-api/src/extension-api.d.ts#L3478",
        children: "packages/extension-api/src/extension-api.d.ts:3478"
      })]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Whether to open ", (0,jsx_runtime.jsx)(_components.code, {
        children: "stdin"
      }), " (default false)"]
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
        href: "https://github.com/podman-desktop/podman-desktop/blob/e815a7ddef53911b2d9e53654b731d219f39dbe1/packages/extension-api/src/extension-api.d.ts#L3395",
        children: "packages/extension-api/src/extension-api.d.ts:3395"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Default: \"\""
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Platform in the format ", (0,jsx_runtime.jsx)(_components.code, {
        children: "os[/arch[/variant]]"
      }), " used for image lookup."]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["When specified, the daemon checks if the requested image is present in the local image cache with the given OS and Architecture, and otherwise returns a ", (0,jsx_runtime.jsx)(_components.code, {
        children: "404"
      }), " status."]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["If the option is not set, the host's native OS and Architecture are used to look up the image in the image cache. However, if no platform is passed and the given image does exist in the local image cache, but its OS or architecture does not match, the container is created with the available image, and a warning is added to the ", (0,jsx_runtime.jsx)(_components.code, {
        children: "Warnings"
      }), " field in the response, for example;"]
    }), "\n", (0,jsx_runtime.jsx)(_components.pre, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        className: "language-text",
        children: "WARNING: The requested image's platform (linux/arm64/v8) does not\n         match the detected host platform (linux/amd64) and no\n         specific platform was requested\n"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "pod",
      children: "pod?"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "optional"
        }), " ", (0,jsx_runtime.jsx)(_components.strong, {
          children: "pod?"
        }), ": ", (0,jsx_runtime.jsx)(_components.code, {
          children: "string"
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/e815a7ddef53911b2d9e53654b731d219f39dbe1/packages/extension-api/src/extension-api.d.ts#L3554",
        children: "packages/extension-api/src/extension-api.d.ts:3554"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Pod where to create the container in"
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "shell",
      children: "Shell?"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "optional"
        }), " ", (0,jsx_runtime.jsx)(_components.strong, {
          children: "Shell?"
        }), ": ", (0,jsx_runtime.jsx)(_components.code, {
          children: "string"
        }), "[]"]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/e815a7ddef53911b2d9e53654b731d219f39dbe1/packages/extension-api/src/extension-api.d.ts#L3547",
        children: "packages/extension-api/src/extension-api.d.ts:3547"
      })]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Shell for when ", (0,jsx_runtime.jsx)(_components.code, {
        children: "RUN"
      }), ", ", (0,jsx_runtime.jsx)(_components.code, {
        children: "CMD"
      }), ", and ", (0,jsx_runtime.jsx)(_components.code, {
        children: "ENTRYPOINT"
      }), " uses a shell."]
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "start",
      children: "start?"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "optional"
        }), " ", (0,jsx_runtime.jsx)(_components.strong, {
          children: "start?"
        }), ": ", (0,jsx_runtime.jsx)(_components.code, {
          children: "boolean"
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/e815a7ddef53911b2d9e53654b731d219f39dbe1/packages/extension-api/src/extension-api.d.ts#L3493",
        children: "packages/extension-api/src/extension-api.d.ts:3493"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Start the container immediately (default true)"
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "stdinonce",
      children: "StdinOnce?"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "optional"
        }), " ", (0,jsx_runtime.jsx)(_components.strong, {
          children: "StdinOnce?"
        }), ": ", (0,jsx_runtime.jsx)(_components.code, {
          children: "boolean"
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/e815a7ddef53911b2d9e53654b731d219f39dbe1/packages/extension-api/src/extension-api.d.ts#L3483",
        children: "packages/extension-api/src/extension-api.d.ts:3483"
      })]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Close ", (0,jsx_runtime.jsx)(_components.code, {
        children: "stdin"
      }), " after one attached client disconnects (deafult false)"]
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "stopsignal",
      children: "StopSignal?"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "optional"
        }), " ", (0,jsx_runtime.jsx)(_components.strong, {
          children: "StopSignal?"
        }), ": ", (0,jsx_runtime.jsx)(_components.code, {
          children: "string"
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/e815a7ddef53911b2d9e53654b731d219f39dbe1/packages/extension-api/src/extension-api.d.ts#L3535",
        children: "packages/extension-api/src/extension-api.d.ts:3535"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Signal to stop a container as a string or unsigned integer."
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "stoptimeout",
      children: "StopTimeout?"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "optional"
        }), " ", (0,jsx_runtime.jsx)(_components.strong, {
          children: "StopTimeout?"
        }), ": ", (0,jsx_runtime.jsx)(_components.code, {
          children: "number"
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/e815a7ddef53911b2d9e53654b731d219f39dbe1/packages/extension-api/src/extension-api.d.ts#L3542",
        children: "packages/extension-api/src/extension-api.d.ts:3542"
      })]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Default: ", (0,jsx_runtime.jsx)(_components.code, {
        children: "10"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Timeout to stop a container in seconds."
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "tty",
      children: "Tty?"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "optional"
        }), " ", (0,jsx_runtime.jsx)(_components.strong, {
          children: "Tty?"
        }), ": ", (0,jsx_runtime.jsx)(_components.code, {
          children: "boolean"
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/e815a7ddef53911b2d9e53654b731d219f39dbe1/packages/extension-api/src/extension-api.d.ts#L3446",
        children: "packages/extension-api/src/extension-api.d.ts:3446"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Attach standard streams to a TTY, including stdin if it is not closed (default false)"
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "user",
      children: "User?"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "optional"
        }), " ", (0,jsx_runtime.jsx)(_components.strong, {
          children: "User?"
        }), ": ", (0,jsx_runtime.jsx)(_components.code, {
          children: "string"
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/e815a7ddef53911b2d9e53654b731d219f39dbe1/packages/extension-api/src/extension-api.d.ts#L3410",
        children: "packages/extension-api/src/extension-api.d.ts:3410"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "The user that commands are run as inside the container"
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "volumes",
      children: "Volumes?"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "optional"
        }), " ", (0,jsx_runtime.jsx)(_components.strong, {
          children: "Volumes?"
        }), ": ", (0,jsx_runtime.jsx)(_components.code, {
          children: "object"
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/e815a7ddef53911b2d9e53654b731d219f39dbe1/packages/extension-api/src/extension-api.d.ts#L3510",
        children: "packages/extension-api/src/extension-api.d.ts:3510"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "An object mapping mount point paths inside the container to empty objects."
    }), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "index-signature-2",
      children: "Index Signature"
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["[", (0,jsx_runtime.jsx)(_components.code, {
        children: "volume"
      }), ": ", (0,jsx_runtime.jsx)(_components.code, {
        children: "string"
      }), "]: ", (0,jsx_runtime.jsx)(_components.code, {
        children: "object"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "workingdir",
      children: "WorkingDir?"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "optional"
        }), " ", (0,jsx_runtime.jsx)(_components.strong, {
          children: "WorkingDir?"
        }), ": ", (0,jsx_runtime.jsx)(_components.code, {
          children: "string"
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/e815a7ddef53911b2d9e53654b731d219f39dbe1/packages/extension-api/src/extension-api.d.ts#L3515",
        children: "packages/extension-api/src/extension-api.d.ts:3515"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "The working directory for commands to run in."
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