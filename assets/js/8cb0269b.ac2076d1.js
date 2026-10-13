"use strict";
(globalThis["webpackChunkdocs"] = globalThis["webpackChunkdocs"] || []).push([[70423],{

/***/ 61554
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  assets: () => (/* binding */ assets),
  contentTitle: () => (/* binding */ contentTitle),
  "default": () => (/* binding */ MDXContent),
  frontMatter: () => (/* binding */ frontMatter),
  metadata: () => (/* reexport */ site_api_classes_uri_md_8cb_namespaceObject),
  toc: () => (/* binding */ toc)
});

;// ./.docusaurus/docusaurus-plugin-content-docs/api/site-api-classes-uri-md-8cb.json
const site_api_classes_uri_md_8cb_namespaceObject = /*#__PURE__*/JSON.parse('{"id":"classes/Uri","title":"Class: Uri","description":"Defined in1893","source":"@site/api/classes/Uri.md","sourceDirName":"classes","slug":"/classes/Uri","permalink":"/api/classes/Uri","draft":false,"unlisted":false,"tags":[],"version":"current","frontMatter":{},"sidebar":"typedocSidebar","previous":{"title":"TelemetryTrustedValue","permalink":"/api/classes/TelemetryTrustedValue"},"next":{"title":"Auditor","permalink":"/api/interfaces/Auditor"}}');
// EXTERNAL MODULE: ../node_modules/react/jsx-runtime.js
var jsx_runtime = __webpack_require__(62540);
// EXTERNAL MODULE: ../node_modules/@mdx-js/react/lib/index.js
var lib = __webpack_require__(43023);
;// ./api/classes/Uri.md


const frontMatter = {};
const contentTitle = 'Class: Uri';

const assets = {

};



const toc = [{
  "value": "Properties",
  "id": "properties",
  "level": 2
}, {
  "value": "authority",
  "id": "authority",
  "level": 3
}, {
  "value": "fragment",
  "id": "fragment",
  "level": 3
}, {
  "value": "fsPath",
  "id": "fspath",
  "level": 3
}, {
  "value": "path",
  "id": "path",
  "level": 3
}, {
  "value": "query",
  "id": "query",
  "level": 3
}, {
  "value": "scheme",
  "id": "scheme",
  "level": 3
}, {
  "value": "Methods",
  "id": "methods",
  "level": 2
}, {
  "value": "toString()",
  "id": "tostring",
  "level": 3
}, {
  "value": "Returns",
  "id": "returns",
  "level": 4
}, {
  "value": "with()",
  "id": "with",
  "level": 3
}, {
  "value": "Parameters",
  "id": "parameters",
  "level": 4
}, {
  "value": "change",
  "id": "change",
  "level": 5
}, {
  "value": "authority?",
  "id": "authority-1",
  "level": 6
}, {
  "value": "fragment?",
  "id": "fragment-1",
  "level": 6
}, {
  "value": "path?",
  "id": "path-1",
  "level": 6
}, {
  "value": "query?",
  "id": "query-1",
  "level": 6
}, {
  "value": "scheme?",
  "id": "scheme-1",
  "level": 6
}, {
  "value": "Returns",
  "id": "returns-1",
  "level": 4
}, {
  "value": "file()",
  "id": "file",
  "level": 3
}, {
  "value": "Parameters",
  "id": "parameters-1",
  "level": 4
}, {
  "value": "path",
  "id": "path-2",
  "level": 5
}, {
  "value": "Returns",
  "id": "returns-2",
  "level": 4
}, {
  "value": "joinPath()",
  "id": "joinpath",
  "level": 3
}, {
  "value": "Parameters",
  "id": "parameters-2",
  "level": 4
}, {
  "value": "base",
  "id": "base",
  "level": 5
}, {
  "value": "pathSegments",
  "id": "pathsegments",
  "level": 5
}, {
  "value": "Returns",
  "id": "returns-3",
  "level": 4
}, {
  "value": "parse()",
  "id": "parse",
  "level": 3
}, {
  "value": "Parameters",
  "id": "parameters-3",
  "level": 4
}, {
  "value": "value",
  "id": "value",
  "level": 5
}, {
  "value": "strict?",
  "id": "strict",
  "level": 5
}, {
  "value": "Returns",
  "id": "returns-4",
  "level": 4
}, {
  "value": "See",
  "id": "see",
  "level": 4
}];
function _createMdxContent(props) {
  const _components = {
    a: "a",
    blockquote: "blockquote",
    code: "code",
    em: "em",
    h1: "h1",
    h2: "h2",
    h3: "h3",
    h4: "h4",
    h5: "h5",
    h6: "h6",
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
        id: "class-uri",
        children: "Class: Uri"
      })
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/5f4a873c44f34c433f9833fcaec2aa25b13fbcf2/packages/extension-api/src/extension-api.d.ts#L1893",
        children: "packages/extension-api/src/extension-api.d.ts:1893"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Resource identifier for a resource"
    }), "\n", (0,jsx_runtime.jsx)(_components.h2, {
      id: "properties",
      children: "Properties"
    }), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "authority",
      children: "authority"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "readonly"
        }), " ", (0,jsx_runtime.jsx)(_components.strong, {
          children: "authority"
        }), ": ", (0,jsx_runtime.jsx)(_components.code, {
          children: "string"
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/5f4a873c44f34c433f9833fcaec2aa25b13fbcf2/packages/extension-api/src/extension-api.d.ts#L1940",
        children: "packages/extension-api/src/extension-api.d.ts:1940"
      })]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Authority is the ", (0,jsx_runtime.jsx)(_components.code, {
        children: "www.example.com"
      }), " part of ", (0,jsx_runtime.jsx)(_components.code, {
        children: "http://www.example.com/some/path?query#fragment"
      }), ".\nThe part between the first double slashes and the next slash."]
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "fragment",
      children: "fragment"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "readonly"
        }), " ", (0,jsx_runtime.jsx)(_components.strong, {
          children: "fragment"
        }), ": ", (0,jsx_runtime.jsx)(_components.code, {
          children: "string"
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/5f4a873c44f34c433f9833fcaec2aa25b13fbcf2/packages/extension-api/src/extension-api.d.ts#L1960",
        children: "packages/extension-api/src/extension-api.d.ts:1960"
      })]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Fragment is the ", (0,jsx_runtime.jsx)(_components.code, {
        children: "fragment"
      }), " part of ", (0,jsx_runtime.jsx)(_components.code, {
        children: "http://www.example.com/some/path?query#fragment"
      }), "."]
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "fspath",
      children: "fsPath"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "readonly"
        }), " ", (0,jsx_runtime.jsx)(_components.strong, {
          children: "fsPath"
        }), ": ", (0,jsx_runtime.jsx)(_components.code, {
          children: "string"
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/5f4a873c44f34c433f9833fcaec2aa25b13fbcf2/packages/extension-api/src/extension-api.d.ts#L1950",
        children: "packages/extension-api/src/extension-api.d.ts:1950"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "The string representing the corresponding file system path of this Uri."
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "path",
      children: "path"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "readonly"
        }), " ", (0,jsx_runtime.jsx)(_components.strong, {
          children: "path"
        }), ": ", (0,jsx_runtime.jsx)(_components.code, {
          children: "string"
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/5f4a873c44f34c433f9833fcaec2aa25b13fbcf2/packages/extension-api/src/extension-api.d.ts#L1945",
        children: "packages/extension-api/src/extension-api.d.ts:1945"
      })]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Path is the ", (0,jsx_runtime.jsx)(_components.code, {
        children: "/some/path"
      }), " part of ", (0,jsx_runtime.jsx)(_components.code, {
        children: "http://www.example.com/some/path?query#fragment"
      }), "."]
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "query",
      children: "query"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "readonly"
        }), " ", (0,jsx_runtime.jsx)(_components.strong, {
          children: "query"
        }), ": ", (0,jsx_runtime.jsx)(_components.code, {
          children: "string"
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/5f4a873c44f34c433f9833fcaec2aa25b13fbcf2/packages/extension-api/src/extension-api.d.ts#L1955",
        children: "packages/extension-api/src/extension-api.d.ts:1955"
      })]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Query is the ", (0,jsx_runtime.jsx)(_components.code, {
        children: "query"
      }), " part of ", (0,jsx_runtime.jsx)(_components.code, {
        children: "http://www.example.com/some/path?query#fragment"
      }), "."]
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "scheme",
      children: "scheme"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "readonly"
        }), " ", (0,jsx_runtime.jsx)(_components.strong, {
          children: "scheme"
        }), ": ", (0,jsx_runtime.jsx)(_components.code, {
          children: "string"
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/5f4a873c44f34c433f9833fcaec2aa25b13fbcf2/packages/extension-api/src/extension-api.d.ts#L1934",
        children: "packages/extension-api/src/extension-api.d.ts:1934"
      })]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Scheme is the ", (0,jsx_runtime.jsx)(_components.code, {
        children: "http"
      }), " part of ", (0,jsx_runtime.jsx)(_components.code, {
        children: "http://www.example.com/some/path?query#fragment"
      }), ".\nThe part before the first colon."]
    }), "\n", (0,jsx_runtime.jsx)(_components.h2, {
      id: "methods",
      children: "Methods"
    }), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "tostring",
      children: "toString()"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.strong, {
          children: "toString"
        }), "(): ", (0,jsx_runtime.jsx)(_components.code, {
          children: "string"
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/5f4a873c44f34c433f9833fcaec2aa25b13fbcf2/packages/extension-api/src/extension-api.d.ts#L1999",
        children: "packages/extension-api/src/extension-api.d.ts:1999"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "returns",
      children: "Returns"
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        children: "string"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "with",
      children: "with()"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.strong, {
          children: "with"
        }), "(", (0,jsx_runtime.jsx)(_components.code, {
          children: "change"
        }), "): ", (0,jsx_runtime.jsx)(_components.code, {
          children: "Uri"
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/5f4a873c44f34c433f9833fcaec2aa25b13fbcf2/packages/extension-api/src/extension-api.d.ts#L1976",
        children: "packages/extension-api/src/extension-api.d.ts:1976"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Derive a new Uri from this Uri."
    }), "\n", (0,jsx_runtime.jsx)(_components.pre, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        className: "language-ts",
        children: "const foo = Uri.parse('http://foo');\nconst httpsFoo = foo.with({ scheme: 'https' });\n// httpsFoo is now 'https://foo'\n"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "parameters",
      children: "Parameters"
    }), "\n", (0,jsx_runtime.jsx)(_components.h5, {
      id: "change",
      children: "change"
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["An object that describes a change to this Uri. To unset components use ", (0,jsx_runtime.jsx)(_components.code, {
        children: "undefined"
      }), " or\nthe empty string."]
    }), "\n", (0,jsx_runtime.jsx)(_components.h6, {
      id: "authority-1",
      children: "authority?"
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        children: "string"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "The new authority, defaults to this Uri's authority."
    }), "\n", (0,jsx_runtime.jsx)(_components.h6, {
      id: "fragment-1",
      children: "fragment?"
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        children: "string"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "The new fragment, defaults to this Uri's fragment."
    }), "\n", (0,jsx_runtime.jsx)(_components.h6, {
      id: "path-1",
      children: "path?"
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        children: "string"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "The new path, defaults to this Uri's path."
    }), "\n", (0,jsx_runtime.jsx)(_components.h6, {
      id: "query-1",
      children: "query?"
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        children: "string"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "The new query, defaults to this Uri's query."
    }), "\n", (0,jsx_runtime.jsx)(_components.h6, {
      id: "scheme-1",
      children: "scheme?"
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        children: "string"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "The new scheme, defaults to this Uri's scheme."
    }), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "returns-1",
      children: "Returns"
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        children: "Uri"
      })
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["A new Uri that reflects the given change. Will return ", (0,jsx_runtime.jsx)(_components.code, {
        children: "this"
      }), " Uri if the change\nis not changing anything."]
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "file",
      children: "file()"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "static"
        }), " ", (0,jsx_runtime.jsx)(_components.strong, {
          children: "file"
        }), "(", (0,jsx_runtime.jsx)(_components.code, {
          children: "path"
        }), "): ", (0,jsx_runtime.jsx)(_components.code, {
          children: "Uri"
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/5f4a873c44f34c433f9833fcaec2aa25b13fbcf2/packages/extension-api/src/extension-api.d.ts#L1913",
        children: "packages/extension-api/src/extension-api.d.ts:1913"
      })]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Create an URI from a file system path. The ", (0,jsx_runtime.jsx)(_components.a, {
        href: "#scheme",
        children: "scheme"
      }), "\nwill be ", (0,jsx_runtime.jsx)(_components.code, {
        children: "file"
      }), "."]
    }), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "parameters-1",
      children: "Parameters"
    }), "\n", (0,jsx_runtime.jsx)(_components.h5, {
      id: "path-2",
      children: "path"
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        children: "string"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "returns-2",
      children: "Returns"
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        children: "Uri"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "joinpath",
      children: "joinPath()"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "static"
        }), " ", (0,jsx_runtime.jsx)(_components.strong, {
          children: "joinPath"
        }), "(", (0,jsx_runtime.jsx)(_components.code, {
          children: "base"
        }), ", ...", (0,jsx_runtime.jsx)(_components.code, {
          children: "pathSegments"
        }), "): ", (0,jsx_runtime.jsx)(_components.code, {
          children: "Uri"
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/5f4a873c44f34c433f9833fcaec2aa25b13fbcf2/packages/extension-api/src/extension-api.d.ts#L1923",
        children: "packages/extension-api/src/extension-api.d.ts:1923"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Create a new uri which path is the result of joining\nthe path of the base uri with the provided path segments."
    }), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "parameters-2",
      children: "Parameters"
    }), "\n", (0,jsx_runtime.jsx)(_components.h5, {
      id: "base",
      children: "base"
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        children: "Uri"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "An uri. Must have a path."
    }), "\n", (0,jsx_runtime.jsx)(_components.h5, {
      id: "pathsegments",
      children: "pathSegments"
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["...", (0,jsx_runtime.jsx)(_components.code, {
        children: "string"
      }), "[]"]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "One more more path fragments"
    }), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "returns-3",
      children: "Returns"
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        children: "Uri"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "A new uri which path is joined with the given fragments"
    }), "\n", (0,jsx_runtime.jsx)(_components.hr, {}), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "parse",
      children: "parse()"
    }), "\n", (0,jsx_runtime.jsxs)(_components.blockquote, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
        children: [(0,jsx_runtime.jsx)(_components.code, {
          children: "static"
        }), " ", (0,jsx_runtime.jsx)(_components.strong, {
          children: "parse"
        }), "(", (0,jsx_runtime.jsx)(_components.code, {
          children: "value"
        }), ", ", (0,jsx_runtime.jsx)(_components.code, {
          children: "strict?"
        }), "): ", (0,jsx_runtime.jsx)(_components.code, {
          children: "Uri"
        })]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Defined in: ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop/blob/5f4a873c44f34c433f9833fcaec2aa25b13fbcf2/packages/extension-api/src/extension-api.d.ts#L1907",
        children: "packages/extension-api/src/extension-api.d.ts:1907"
      })]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Create an URI from a string, e.g. ", (0,jsx_runtime.jsx)(_components.code, {
        children: "http://www.example.com/some/path"
      }), ",\n", (0,jsx_runtime.jsx)(_components.code, {
        children: "file:///usr/home"
      }), ", or ", (0,jsx_runtime.jsx)(_components.code, {
        children: "scheme:with/path"
      }), "."]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: [(0,jsx_runtime.jsx)(_components.em, {
        children: "Note"
      }), " that for a while uris without a ", (0,jsx_runtime.jsx)(_components.code, {
        children: "scheme"
      }), " were accepted. That is not correct\nas all uris should have a scheme. To avoid breakage of existing code the optional\n", (0,jsx_runtime.jsx)(_components.code, {
        children: "strict"
      }), "-argument has been added. We ", (0,jsx_runtime.jsx)(_components.em, {
        children: "strongly"
      }), " advise to use it, e.g. ", (0,jsx_runtime.jsx)(_components.code, {
        children: "Uri.parse('my:uri', true)"
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "parameters-3",
      children: "Parameters"
    }), "\n", (0,jsx_runtime.jsx)(_components.h5, {
      id: "value",
      children: "value"
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        children: "string"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "The string value of an Uri."
    }), "\n", (0,jsx_runtime.jsx)(_components.h5, {
      id: "strict",
      children: "strict?"
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        children: "boolean"
      })
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Throw an error when ", (0,jsx_runtime.jsx)(_components.code, {
        children: "value"
      }), " is empty or when no ", (0,jsx_runtime.jsx)(_components.code, {
        children: "scheme"
      }), " can be parsed."]
    }), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "returns-4",
      children: "Returns"
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        children: "Uri"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "A new Uri instance."
    }), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "see",
      children: "See"
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: (0,jsx_runtime.jsx)(_components.a, {
        href: "#tostring",
        children: "Uri.toString"
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