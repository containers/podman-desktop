"use strict";
(globalThis["webpackChunkdocs"] = globalThis["webpackChunkdocs"] || []).push([[28341],{

/***/ 81666
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  assets: () => (/* binding */ assets),
  contentTitle: () => (/* binding */ contentTitle),
  "default": () => (/* binding */ MDXContent),
  frontMatter: () => (/* binding */ frontMatter),
  metadata: () => (/* reexport */ site_api_interfaces_cli_tool_md_60c_namespaceObject),
  toc: () => (/* binding */ toc)
});

;// ./.docusaurus/docusaurus-plugin-content-docs/api/site-api-interfaces-cli-tool-md-60c.json
const site_api_interfaces_cli_tool_md_60c_namespaceObject = /*#__PURE__*/JSON.parse('{"id":"interfaces/CliTool","title":"Interface: CliTool","description":"Defined in4935","source":"@site/api/interfaces/CliTool.md","sourceDirName":"interfaces","slug":"/interfaces/CliTool","permalink":"/api/interfaces/CliTool","draft":false,"unlisted":false,"tags":[],"version":"current","frontMatter":{},"sidebar":"typedocSidebar","previous":{"title":"Clipboard","permalink":"/api/interfaces/Clipboard"},"next":{"title":"CliToolInfo","permalink":"/api/interfaces/CliToolInfo"}}');
// EXTERNAL MODULE: ../node_modules/react/jsx-runtime.js
var jsx_runtime = __webpack_require__(62540);
// EXTERNAL MODULE: ../node_modules/@mdx-js/react/lib/index.js
var lib = __webpack_require__(43023);
;// ./api/interfaces/CliTool.md


const frontMatter = {};
const contentTitle = 'Interface: CliTool';

const assets = {

};



const toc = [{
  "value": "Extends",
  "id": "extends",
  "level": 2
}, {
  "value": "Properties",
  "id": "properties",
  "level": 2
}, {
  "value": "displayName",
  "id": "displayname",
  "level": 3
}, {
  "value": "Inherited from",
  "id": "inherited-from",
  "level": 4
}, {
  "value": "extensionInfo",
  "id": "extensioninfo",
  "level": 3
}, {
  "value": "id",
  "id": "id",
  "level": 4
}, {
  "value": "label",
  "id": "label",
  "level": 4
}, {
  "value": "Inherited from",
  "id": "inherited-from-1",
  "level": 4
}, {
  "value": "id",
  "id": "id-1",
  "level": 3
}, {
  "value": "Inherited from",
  "id": "inherited-from-2",
  "level": 4
}, {
  "value": "images",
  "id": "images",
  "level": 3
}, {
  "value": "Inherited from",
  "id": "inherited-from-3",
  "level": 4
}, {
  "value": "markdownDescription",
  "id": "markdowndescription",
  "level": 3
}, {
  "value": "Inherited from",
  "id": "inherited-from-4",
  "level": 4
}, {
  "value": "name",
  "id": "name",
  "level": 3
}, {
  "value": "Inherited from",
  "id": "inherited-from-5",
  "level": 4
}, {
  "value": "onDidUninstall",
  "id": "ondiduninstall",
  "level": 3
}, {
  "value": "onDidUpdateVersion",
  "id": "ondidupdateversion",
  "level": 3
}, {
  "value": "path?",
  "id": "path",
  "level": 3
}, {
  "value": "Inherited from",
  "id": "inherited-from-6",
  "level": 4
}, {
  "value": "state",
  "id": "state",
  "level": 3
}, {
  "value": "version?",
  "id": "version",
  "level": 3
}, {
  "value": "Inherited from",
  "id": "inherited-from-7",
  "level": 4
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
  "value": "Inherited from",
  "id": "inherited-from-8",
  "level": 4
}, {
  "value": "registerInstaller()",
  "id": "registerinstaller",
  "level": 3
}, {
  "value": "Parameters",
  "id": "parameters",
  "level": 4
}, {
  "value": "installer",
  "id": "installer",
  "level": 5
}, {
  "value": "Returns",
  "id": "returns-1",
  "level": 4
}, {
  "value": "registerUpdate()",
  "id": "registerupdate",
  "level": 3
}, {
  "value": "Parameters",
  "id": "parameters-1",
  "level": 4
}, {
  "value": "update",
  "id": "update",
  "level": 5
}, {
  "value": "Returns",
  "id": "returns-2",
  "level": 4
}, {
  "value": "updateVersion()",
  "id": "updateversion",
  "level": 3
}, {
  "value": "Parameters",
  "id": "parameters-2",
  "level": 4
}, {
  "value": "version",
  "id": "version-1",
  "level": 5
}, {
  "value": "Returns",
  "id": "returns-3",
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
    li: "li",
    p: "p",
    strong: "strong",
    ul: "ul",
    ...(0,lib/* useMDXComponents */.R)(),
    ...props.components
  };
  return (0,jsx_runtime.jsxs)(jsx_runtime.Fragment, {
    children: [(0,jsx_runtime.jsx)(_components.header, {
      children: (0,jsx_runtime.jsx)(_components.h1, {
        id: "interface-clitool",
        children: "Interface: CliTool"
      })
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/63c5853645b1b7a421798e8c76bb13d81052d8cb/packages/extension-api/src/extension-api.d.ts#L4935",
        children: "packages/extension-api/src/extension-api.d.ts:4935"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.h2, {
      id: "extends",
      children: "Extends"
    }), "\n", (0,jsx_runtime.jsxs)(_components.ul, {
      children: ["\n", (0,jsx_runtime.jsx)(_components.li, {
        children: (0,jsx_runtime.jsx)(_components.a, {
          href: "/api/interfaces/CliToolInfo",
          children: (0,jsx_runtime.jsx)(_components.code, {
            children: "CliToolInfo"
          })
        })
      }), "\n", (0,jsx_runtime.jsx)(_components.li, {
        children: (0,jsx_runtime.jsx)(_components.a, {
          href: "/api/classes/Disposable",
          children: (0,jsx_runtime.jsx)(_components.code, {
            children: "Disposable"
          })
        })
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsx)(_components.h2, {
      id: "properties",
      children: "Properties"
    }), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "displayname",
      children: "displayName"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.strong, {
          children: "displayName"
        }), ": ", (0,jsx_runtime.jsx)(_components.code, {
          children: "string"
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/63c5853645b1b7a421798e8c76bb13d81052d8cb/packages/extension-api/src/extension-api.d.ts#L4952",
        children: "packages/extension-api/src/extension-api.d.ts:4952"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "inherited-from",
      children: "Inherited from"
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: [(0,jsx_runtime.jsx)(_components.a, {
        href: "/api/interfaces/CliToolInfo",
        children: (0,jsx_runtime.jsx)(_components.code, {
          children: "CliToolInfo"
        })
      }), ".", (0,jsx_runtime.jsx)(_components.a, {
        href: "/api/interfaces/CliToolInfo#displayname",
        children: (0,jsx_runtime.jsx)(_components.code, {
          children: "displayName"
        })
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "extensioninfo",
      children: "extensionInfo"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.strong, {
          children: "extensionInfo"
        }), ": ", (0,jsx_runtime.jsx)(_components.code, {
          children: "object"
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/63c5853645b1b7a421798e8c76bb13d81052d8cb/packages/extension-api/src/extension-api.d.ts#L4957",
        children: "packages/extension-api/src/extension-api.d.ts:4957"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "id",
      children: "id"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.strong, {
          children: "id"
        }), ": ", (0,jsx_runtime.jsx)(_components.code, {
          children: "string"
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "label",
      children: "label"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.strong, {
          children: "label"
        }), ": ", (0,jsx_runtime.jsx)(_components.code, {
          children: "string"
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "inherited-from-1",
      children: "Inherited from"
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: [(0,jsx_runtime.jsx)(_components.a, {
        href: "/api/interfaces/CliToolInfo",
        children: (0,jsx_runtime.jsx)(_components.code, {
          children: "CliToolInfo"
        })
      }), ".", (0,jsx_runtime.jsx)(_components.a, {
        href: "/api/interfaces/CliToolInfo#extensioninfo",
        children: (0,jsx_runtime.jsx)(_components.code, {
          children: "extensionInfo"
        })
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "id-1",
      children: "id"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.strong, {
          children: "id"
        }), ": ", (0,jsx_runtime.jsx)(_components.code, {
          children: "string"
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/63c5853645b1b7a421798e8c76bb13d81052d8cb/packages/extension-api/src/extension-api.d.ts#L4950",
        children: "packages/extension-api/src/extension-api.d.ts:4950"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "inherited-from-2",
      children: "Inherited from"
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: [(0,jsx_runtime.jsx)(_components.a, {
        href: "/api/interfaces/CliToolInfo",
        children: (0,jsx_runtime.jsx)(_components.code, {
          children: "CliToolInfo"
        })
      }), ".", (0,jsx_runtime.jsx)(_components.a, {
        href: "/api/interfaces/CliToolInfo#id",
        children: (0,jsx_runtime.jsx)(_components.code, {
          children: "id"
        })
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "images",
      children: "images"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.strong, {
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
        href: "https://github.com/podman-desktop/podman-desktop/blob/63c5853645b1b7a421798e8c76bb13d81052d8cb/packages/extension-api/src/extension-api.d.ts#L4954",
        children: "packages/extension-api/src/extension-api.d.ts:4954"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "inherited-from-3",
      children: "Inherited from"
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: [(0,jsx_runtime.jsx)(_components.a, {
        href: "/api/interfaces/CliToolInfo",
        children: (0,jsx_runtime.jsx)(_components.code, {
          children: "CliToolInfo"
        })
      }), ".", (0,jsx_runtime.jsx)(_components.a, {
        href: "/api/interfaces/CliToolInfo#images",
        children: (0,jsx_runtime.jsx)(_components.code, {
          children: "images"
        })
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "markdowndescription",
      children: "markdownDescription"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.strong, {
          children: "markdownDescription"
        }), ": ", (0,jsx_runtime.jsx)(_components.code, {
          children: "string"
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/63c5853645b1b7a421798e8c76bb13d81052d8cb/packages/extension-api/src/extension-api.d.ts#L4953",
        children: "packages/extension-api/src/extension-api.d.ts:4953"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "inherited-from-4",
      children: "Inherited from"
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: [(0,jsx_runtime.jsx)(_components.a, {
        href: "/api/interfaces/CliToolInfo",
        children: (0,jsx_runtime.jsx)(_components.code, {
          children: "CliToolInfo"
        })
      }), ".", (0,jsx_runtime.jsx)(_components.a, {
        href: "/api/interfaces/CliToolInfo#markdowndescription",
        children: (0,jsx_runtime.jsx)(_components.code, {
          children: "markdownDescription"
        })
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "name",
      children: "name"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.strong, {
          children: "name"
        }), ": ", (0,jsx_runtime.jsx)(_components.code, {
          children: "string"
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/63c5853645b1b7a421798e8c76bb13d81052d8cb/packages/extension-api/src/extension-api.d.ts#L4951",
        children: "packages/extension-api/src/extension-api.d.ts:4951"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "inherited-from-5",
      children: "Inherited from"
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: [(0,jsx_runtime.jsx)(_components.a, {
        href: "/api/interfaces/CliToolInfo",
        children: (0,jsx_runtime.jsx)(_components.code, {
          children: "CliToolInfo"
        })
      }), ".", (0,jsx_runtime.jsx)(_components.a, {
        href: "/api/interfaces/CliToolInfo#name",
        children: (0,jsx_runtime.jsx)(_components.code, {
          children: "name"
        })
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "ondiduninstall",
      children: "onDidUninstall"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.strong, {
          children: "onDidUninstall"
        }), ": ", (0,jsx_runtime.jsx)(_components.a, {
          href: "/api/interfaces/Event",
          children: (0,jsx_runtime.jsx)(_components.code, {
            children: "Event"
          })
        }), "<", (0,jsx_runtime.jsx)(_components.code, {
          children: "void"
        }), ">"]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/63c5853645b1b7a421798e8c76bb13d81052d8cb/packages/extension-api/src/extension-api.d.ts#L4940",
        children: "packages/extension-api/src/extension-api.d.ts:4940"
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
        href: "https://github.com/podman-desktop/podman-desktop/blob/63c5853645b1b7a421798e8c76bb13d81052d8cb/packages/extension-api/src/extension-api.d.ts#L4938",
        children: "packages/extension-api/src/extension-api.d.ts:4938"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "path",
      children: "path?"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "optional"
        }), " ", (0,jsx_runtime.jsx)(_components.strong, {
          children: "path?"
        }), ": ", (0,jsx_runtime.jsx)(_components.code, {
          children: "string"
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/63c5853645b1b7a421798e8c76bb13d81052d8cb/packages/extension-api/src/extension-api.d.ts#L4956",
        children: "packages/extension-api/src/extension-api.d.ts:4956"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "inherited-from-6",
      children: "Inherited from"
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: [(0,jsx_runtime.jsx)(_components.a, {
        href: "/api/interfaces/CliToolInfo",
        children: (0,jsx_runtime.jsx)(_components.code, {
          children: "CliToolInfo"
        })
      }), ".", (0,jsx_runtime.jsx)(_components.a, {
        href: "/api/interfaces/CliToolInfo#path",
        children: (0,jsx_runtime.jsx)(_components.code, {
          children: "path"
        })
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "state",
      children: "state"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.strong, {
          children: "state"
        }), ": ", (0,jsx_runtime.jsx)(_components.code, {
          children: "\"registered\""
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/63c5853645b1b7a421798e8c76bb13d81052d8cb/packages/extension-api/src/extension-api.d.ts#L4936",
        children: "packages/extension-api/src/extension-api.d.ts:4936"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "version",
      children: "version?"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "optional"
        }), " ", (0,jsx_runtime.jsx)(_components.strong, {
          children: "version?"
        }), ": ", (0,jsx_runtime.jsx)(_components.code, {
          children: "string"
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/63c5853645b1b7a421798e8c76bb13d81052d8cb/packages/extension-api/src/extension-api.d.ts#L4955",
        children: "packages/extension-api/src/extension-api.d.ts:4955"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "inherited-from-7",
      children: "Inherited from"
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: [(0,jsx_runtime.jsx)(_components.a, {
        href: "/api/interfaces/CliToolInfo",
        children: (0,jsx_runtime.jsx)(_components.code, {
          children: "CliToolInfo"
        })
      }), ".", (0,jsx_runtime.jsx)(_components.a, {
        href: "/api/interfaces/CliToolInfo#version",
        children: (0,jsx_runtime.jsx)(_components.code, {
          children: "version"
        })
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
        href: "https://github.com/podman-desktop/podman-desktop/blob/63c5853645b1b7a421798e8c76bb13d81052d8cb/packages/extension-api/src/extension-api.d.ts#L108",
        children: "packages/extension-api/src/extension-api.d.ts:108"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Dispose this object."
    }), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "returns",
      children: "Returns"
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        children: "void"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "inherited-from-8",
      children: "Inherited from"
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: [(0,jsx_runtime.jsx)(_components.a, {
        href: "/api/classes/Disposable",
        children: (0,jsx_runtime.jsx)(_components.code, {
          children: "Disposable"
        })
      }), ".", (0,jsx_runtime.jsx)(_components.a, {
        href: "/api/classes/Disposable#dispose",
        children: (0,jsx_runtime.jsx)(_components.code, {
          children: "dispose"
        })
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "registerinstaller",
      children: "registerInstaller()"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.strong, {
          children: "registerInstaller"
        }), "(", (0,jsx_runtime.jsx)(_components.code, {
          children: "installer"
        }), "): ", (0,jsx_runtime.jsx)(_components.a, {
          href: "/api/classes/Disposable",
          children: (0,jsx_runtime.jsx)(_components.code, {
            children: "Disposable"
          })
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/63c5853645b1b7a421798e8c76bb13d81052d8cb/packages/extension-api/src/extension-api.d.ts#L4946",
        children: "packages/extension-api/src/extension-api.d.ts:4946"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "parameters",
      children: "Parameters"
    }), "\n", (0,jsx_runtime.jsx)(_components.h5, {
      id: "installer",
      children: "installer"
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: (0,jsx_runtime.jsx)(_components.a, {
        href: "/api/interfaces/CliToolInstaller",
        children: (0,jsx_runtime.jsx)(_components.code, {
          children: "CliToolInstaller"
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
        href: "https://github.com/podman-desktop/podman-desktop/blob/63c5853645b1b7a421798e8c76bb13d81052d8cb/packages/extension-api/src/extension-api.d.ts#L4943",
        children: "packages/extension-api/src/extension-api.d.ts:4943"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "parameters-1",
      children: "Parameters"
    }), "\n", (0,jsx_runtime.jsx)(_components.h5, {
      id: "update",
      children: "update"
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: [(0,jsx_runtime.jsx)(_components.a, {
        href: "/api/interfaces/CliToolUpdate",
        children: (0,jsx_runtime.jsx)(_components.code, {
          children: "CliToolUpdate"
        })
      }), " | ", (0,jsx_runtime.jsx)(_components.a, {
        href: "/api/interfaces/CliToolSelectUpdate",
        children: (0,jsx_runtime.jsx)(_components.code, {
          children: "CliToolSelectUpdate"
        })
      })]
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
      id: "updateversion",
      children: "updateVersion()"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.strong, {
          children: "updateVersion"
        }), "(", (0,jsx_runtime.jsx)(_components.code, {
          children: "version"
        }), "): ", (0,jsx_runtime.jsx)(_components.code, {
          children: "void"
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/63c5853645b1b7a421798e8c76bb13d81052d8cb/packages/extension-api/src/extension-api.d.ts#L4937",
        children: "packages/extension-api/src/extension-api.d.ts:4937"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "parameters-2",
      children: "Parameters"
    }), "\n", (0,jsx_runtime.jsx)(_components.h5, {
      id: "version-1",
      children: "version"
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: (0,jsx_runtime.jsx)(_components.a, {
        href: "/api/interfaces/CliToolUpdateOptions",
        children: (0,jsx_runtime.jsx)(_components.code, {
          children: "CliToolUpdateOptions"
        })
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "returns-3",
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