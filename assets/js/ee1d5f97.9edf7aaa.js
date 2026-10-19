"use strict";
(globalThis["webpackChunkdocs"] = globalThis["webpackChunkdocs"] || []).push([[61623],{

/***/ 48890
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  assets: () => (/* binding */ assets),
  contentTitle: () => (/* binding */ contentTitle),
  "default": () => (/* binding */ MDXContent),
  frontMatter: () => (/* binding */ frontMatter),
  metadata: () => (/* reexport */ site_docs_extensions_catalog_index_mdx_ee1_namespaceObject),
  toc: () => (/* binding */ toc)
});

;// ./.docusaurus/docusaurus-plugin-content-docs/default/site-docs-extensions-catalog-index-mdx-ee1.json
const site_docs_extensions_catalog_index_mdx_ee1_namespaceObject = /*#__PURE__*/JSON.parse('{"id":"extensions/catalog/index","title":"Hosting a custom extension catalog","description":"Hosting and configuring a custom Podman Desktop extension catalog","source":"@site/docs/extensions/catalog/index.mdx","sourceDirName":"extensions/catalog","slug":"/extensions/catalog/","permalink":"/docs/extensions/catalog/","draft":false,"unlisted":false,"editUrl":"https://github.com/podman-desktop/podman-desktop/tree/main/website/docs/extensions/catalog/index.mdx","tags":[{"inline":true,"label":"podman-desktop","permalink":"/docs/tags/podman-desktop"},{"inline":true,"label":"extension","permalink":"/docs/tags/extension"},{"inline":true,"label":"catalog","permalink":"/docs/tags/catalog"}],"version":"current","sidebarPosition":4,"frontMatter":{"sidebar_position":4,"title":"Hosting a custom extension catalog","description":"Hosting and configuring a custom Podman Desktop extension catalog","tags":["podman-desktop","extension","catalog"],"keywords":["podman desktop","extension catalog","custom catalog","registryUrl"],"hide_table_of_contents":false},"sidebar":"mySidebar","previous":{"title":"Publishing","permalink":"/docs/extensions/publish/"},"next":{"title":"Uninstallation","permalink":"/docs/uninstall/"}}');
// EXTERNAL MODULE: ../node_modules/react/jsx-runtime.js
var jsx_runtime = __webpack_require__(62540);
// EXTERNAL MODULE: ../node_modules/@mdx-js/react/lib/index.js
var lib = __webpack_require__(43023);
// EXTERNAL MODULE: ../node_modules/@docusaurus/theme-classic/lib/theme/ThemedImage/index.js + 2 modules
var ThemedImage = __webpack_require__(90448);
;// ./docs/extensions/catalog/index.mdx


const frontMatter = {
	sidebar_position: 4,
	title: 'Hosting a custom extension catalog',
	description: 'Hosting and configuring a custom Podman Desktop extension catalog',
	tags: [
		'podman-desktop',
		'extension',
		'catalog'
	],
	keywords: [
		'podman desktop',
		'extension catalog',
		'custom catalog',
		'registryUrl'
	],
	hide_table_of_contents: false
};
const contentTitle = 'Hosting a custom extension catalog';

const assets = {

};




const toc = [{
  "value": "Prerequisites",
  "id": "prerequisites",
  "level": 2
}, {
  "value": "Create the catalog file",
  "id": "create-the-catalog-file",
  "level": 2
}, {
  "value": "Catalog JSON example and field references",
  "id": "catalog-json-example-and-field-references",
  "level": 2
}, {
  "value": "Top-level fields",
  "id": "top-level-fields",
  "level": 3
}, {
  "value": "Extension object fields",
  "id": "extension-object-fields",
  "level": 3
}, {
  "value": "Version object fields",
  "id": "version-object-fields",
  "level": 3
}, {
  "value": "File object fields",
  "id": "file-object-fields",
  "level": 3
}, {
  "value": "Test the catalog locally",
  "id": "test-the-catalog-locally",
  "level": 2
}, {
  "value": "Host the catalog in production",
  "id": "host-the-catalog-in-production",
  "level": 2
}, {
  "value": "Manage releases and updates",
  "id": "manage-releases-and-updates",
  "level": 2
}, {
  "value": "Common configurations",
  "id": "common-configurations",
  "level": 2
}, {
  "value": "Minimal catalog",
  "id": "minimal-catalog",
  "level": 3
}, {
  "value": "Local asset URLs",
  "id": "local-asset-urls",
  "level": 3
}, {
  "value": "Multiple versions and automatic updates",
  "id": "multiple-versions-and-automatic-updates",
  "level": 3
}, {
  "value": "Podman Desktop version compatibility",
  "id": "podman-desktop-version-compatibility",
  "level": 3
}, {
  "value": "Preview release",
  "id": "preview-release",
  "level": 3
}, {
  "value": "Restore the official catalog",
  "id": "restore-the-official-catalog",
  "level": 3
}, {
  "value": "Additional resources",
  "id": "additional-resources",
  "level": 2
}];
function _createMdxContent(props) {
  const _components = {
    a: "a",
    code: "code",
    h1: "h1",
    h2: "h2",
    h3: "h3",
    header: "header",
    li: "li",
    ol: "ol",
    p: "p",
    pre: "pre",
    strong: "strong",
    table: "table",
    tbody: "tbody",
    td: "td",
    th: "th",
    thead: "thead",
    tr: "tr",
    ul: "ul",
    ...(0,lib/* useMDXComponents */.R)(),
    ...props.components
  };
  return (0,jsx_runtime.jsxs)(jsx_runtime.Fragment, {
    children: [(0,jsx_runtime.jsx)(_components.header, {
      children: (0,jsx_runtime.jsx)(_components.h1, {
        id: "hosting-a-custom-extension-catalog",
        children: "Hosting a custom extension catalog"
      })
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Podman Desktop provides a built-in extension catalog where users can discover and install extensions. By default, Podman Desktop fetches its catalog from the official ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop-catalog",
        children: "Podman Desktop Catalog repository"
      }), "."]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "You can configure Podman Desktop to fetch extensions from your own custom catalog. This is useful for:"
    }), "\n", (0,jsx_runtime.jsxs)(_components.ul, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: [(0,jsx_runtime.jsx)(_components.strong, {
          children: "Enterprise environments:"
        }), " Distribute internal or proprietary extensions across an organization. Use ", (0,jsx_runtime.jsx)(_components.a, {
          href: "/docs/configuration/managed-configuration",
          children: "managed configuration"
        }), " to set and lock the catalog URL for users."]
      }), "\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: [(0,jsx_runtime.jsx)(_components.strong, {
          children: "Air-gapped and restricted environments:"
        }), " Host extension metadata and assets on internal servers."]
      }), "\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: [(0,jsx_runtime.jsx)(_components.strong, {
          children: "Pre-release testing:"
        }), " Verify your extension's catalog entry, icons, README, and installation flow before publishing to the official catalog."]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Setting a custom catalog replaces the default catalog endpoint in Podman Desktop. If you want official extensions to remain available alongside your custom extensions, copy the official catalog entries into your custom catalog file."
    }), "\n", (0,jsx_runtime.jsx)(_components.h2, {
      id: "prerequisites",
      children: "Prerequisites"
    }), "\n", (0,jsx_runtime.jsxs)(_components.ul, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: ["Your extension is built, packaged into an OCI container image, and pushed to an accessible OCI registry. See ", (0,jsx_runtime.jsx)(_components.a, {
          href: "/docs/extensions/publish",
          children: "Packaging and publishing a Podman Desktop extension"
        }), "."]
      }), "\n", (0,jsx_runtime.jsx)(_components.li, {
        children: "An HTTP or HTTPS web server to host the catalog JSON file and static assets (icon, README, license)."
      }), "\n", (0,jsx_runtime.jsx)(_components.li, {
        children: "For local testing, Python 3 or any static HTTP server."
      }), "\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: ["Access to Podman Desktop's ", (0,jsx_runtime.jsx)(_components.code, {
          children: "settings.json"
        }), " file. See the ", (0,jsx_runtime.jsx)(_components.a, {
          href: "/docs/configuration/settings-reference#configuration-file-location",
          children: "settings reference's configuration file locations"
        }), " for the path on your operating system."]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: ":::warning Trust and Security\nOnly configure catalog URLs from trusted sources. Catalog entries instruct Podman Desktop to download and execute container images on your machine.\n:::"
    }), "\n", (0,jsx_runtime.jsx)(_components.h2, {
      id: "create-the-catalog-file",
      children: "Create the catalog file"
    }), "\n", (0,jsx_runtime.jsxs)(_components.ol, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: ["\n", (0,jsx_runtime.jsx)(_components.p, {
          children: "Choose a base for your catalog:"
        }), "\n", (0,jsx_runtime.jsxs)(_components.ul, {
          children: ["\n", (0,jsx_runtime.jsxs)(_components.li, {
            children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
              children: [(0,jsx_runtime.jsx)(_components.strong, {
                children: "To include official extensions:"
              }), " Download the official ", (0,jsx_runtime.jsx)(_components.a, {
                href: "https://raw.githubusercontent.com/podman-desktop/podman-desktop-catalog/main/static/api/extensions.json",
                children: (0,jsx_runtime.jsx)(_components.code, {
                  children: "extensions.json"
                })
              }), " file from the Podman Desktop catalog repository."]
            }), "\n"]
          }), "\n", (0,jsx_runtime.jsxs)(_components.li, {
            children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
              children: [(0,jsx_runtime.jsx)(_components.strong, {
                children: "To serve only your own extensions:"
              }), " Create a new JSON file with an empty ", (0,jsx_runtime.jsx)(_components.code, {
                children: "extensions"
              }), " array:"]
            }), "\n", (0,jsx_runtime.jsx)(_components.pre, {
              children: (0,jsx_runtime.jsx)(_components.code, {
                className: "language-json",
                children: "{\n  \"extensions\": []\n}\n"
              })
            }), "\n"]
          }), "\n"]
        }), "\n"]
      }), "\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
          children: ["Add your extension object to the ", (0,jsx_runtime.jsx)(_components.code, {
            children: "extensions"
          }), " array. Follow the ", (0,jsx_runtime.jsx)(_components.a, {
            href: "#catalog-json-example-and-field-references",
            children: "Catalog JSON example and field references"
          }), " below."]
        }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
          children: ["This page uses the ", (0,jsx_runtime.jsx)(_components.a, {
            href: "https://github.com/podman-desktop/extension-template-minimal",
            children: "Podman Desktop minimal extension template"
          }), ". Build and push the template before adding its image to your catalog, and replace ", (0,jsx_runtime.jsx)(_components.code, {
            children: "your-username"
          }), " below with your registry namespace."]
        }), "\n"]
      }), "\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
          children: ["Ensure asset files (", (0,jsx_runtime.jsx)(_components.code, {
            children: "icon"
          }), ", ", (0,jsx_runtime.jsx)(_components.code, {
            children: "README"
          }), ", ", (0,jsx_runtime.jsx)(_components.code, {
            children: "LICENSE"
          }), ") are hosted and referenced by ", (0,jsx_runtime.jsx)(_components.strong, {
            children: "absolute HTTP or HTTPS URLs"
          }), ". Podman Desktop does not resolve relative asset paths against the catalog URL."]
        }), "\n"]
      }), "\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
          children: ["When adding multiple versions, place the ", (0,jsx_runtime.jsx)(_components.strong, {
            children: "newest stable version first"
          }), " in the ", (0,jsx_runtime.jsx)(_components.code, {
            children: "versions"
          }), " array. Podman Desktop evaluates the first non-preview version as the current release."]
        }), "\n"]
      }), "\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
          children: ["Save the file as ", (0,jsx_runtime.jsx)(_components.code, {
            children: "extensions.json"
          }), "."]
        }), "\n"]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsx)(_components.h2, {
      id: "catalog-json-example-and-field-references",
      children: "Catalog JSON example and field references"
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["The catalog file is a JSON document containing a top-level ", (0,jsx_runtime.jsx)(_components.code, {
        children: "extensions"
      }), " array. Each entry describes an extension and its available versions:"]
    }), "\n", (0,jsx_runtime.jsx)(_components.pre, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        className: "language-json",
        children: "{\n  \"extensions\": [\n    {\n      \"publisher\": {\n        \"publisherName\": \"you\",\n        \"displayName\": \"Your Name\"\n      },\n      \"extensionName\": \"helloworld\",\n      \"displayName\": \"Hello World\",\n      \"shortDescription\": \"Hello World extension\",\n      \"categories\": [\"Developer Tools\"],\n      \"keywords\": [\"hello-world\"],\n      \"unlisted\": false,\n      \"versions\": [\n        {\n          \"version\": \"0.0.1\",\n          \"podmanDesktopVersion\": \">=1.10.0\",\n          \"preview\": false,\n          \"lastUpdated\": \"2026-09-23T00:00:00Z\",\n          \"ociUri\": \"quay.io/your-username/helloworld:0.0.1\",\n          \"files\": [\n            {\n              \"assetType\": \"icon\",\n              \"data\": \"https://raw.githubusercontent.com/podman-desktop/extension-template-minimal/main/icon.png\"\n            },\n            {\n              \"assetType\": \"README\",\n              \"data\": \"https://raw.githubusercontent.com/podman-desktop/extension-template-minimal/main/README.md\"\n            },\n            {\n              \"assetType\": \"LICENSE\",\n              \"data\": \"https://raw.githubusercontent.com/podman-desktop/extension-template-minimal/main/LICENSE\"\n            }\n          ]\n        }\n      ]\n    }\n  ]\n}\n"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "top-level-fields",
      children: "Top-level fields"
    }), "\n", (0,jsx_runtime.jsxs)(_components.table, {
      children: [(0,jsx_runtime.jsx)(_components.thead, {
        children: (0,jsx_runtime.jsxs)(_components.tr, {
          children: [(0,jsx_runtime.jsx)(_components.th, {
            children: "Field"
          }), (0,jsx_runtime.jsx)(_components.th, {
            children: "Type"
          }), (0,jsx_runtime.jsx)(_components.th, {
            children: "Required"
          }), (0,jsx_runtime.jsx)(_components.th, {
            children: "Description"
          })]
        })
      }), (0,jsx_runtime.jsx)(_components.tbody, {
        children: (0,jsx_runtime.jsxs)(_components.tr, {
          children: [(0,jsx_runtime.jsx)(_components.td, {
            children: (0,jsx_runtime.jsx)(_components.code, {
              children: "extensions"
            })
          }), (0,jsx_runtime.jsx)(_components.td, {
            children: "array"
          }), (0,jsx_runtime.jsx)(_components.td, {
            children: "Yes"
          }), (0,jsx_runtime.jsx)(_components.td, {
            children: "Array of extension definition objects."
          })]
        })
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "extension-object-fields",
      children: "Extension object fields"
    }), "\n", (0,jsx_runtime.jsxs)(_components.table, {
      children: [(0,jsx_runtime.jsx)(_components.thead, {
        children: (0,jsx_runtime.jsxs)(_components.tr, {
          children: [(0,jsx_runtime.jsx)(_components.th, {
            children: "Field"
          }), (0,jsx_runtime.jsx)(_components.th, {
            children: "Type"
          }), (0,jsx_runtime.jsx)(_components.th, {
            children: "Required"
          }), (0,jsx_runtime.jsx)(_components.th, {
            children: "Description"
          })]
        })
      }), (0,jsx_runtime.jsxs)(_components.tbody, {
        children: [(0,jsx_runtime.jsxs)(_components.tr, {
          children: [(0,jsx_runtime.jsx)(_components.td, {
            children: (0,jsx_runtime.jsx)(_components.code, {
              children: "publisher"
            })
          }), (0,jsx_runtime.jsx)(_components.td, {
            children: "object"
          }), (0,jsx_runtime.jsx)(_components.td, {
            children: "Yes"
          }), (0,jsx_runtime.jsxs)(_components.td, {
            children: ["Publisher information object containing ", (0,jsx_runtime.jsx)(_components.code, {
              children: "publisherName"
            }), " and ", (0,jsx_runtime.jsx)(_components.code, {
              children: "displayName"
            }), "."]
          })]
        }), (0,jsx_runtime.jsxs)(_components.tr, {
          children: [(0,jsx_runtime.jsx)(_components.td, {
            children: (0,jsx_runtime.jsx)(_components.code, {
              children: "publisher.publisherName"
            })
          }), (0,jsx_runtime.jsx)(_components.td, {
            children: "string"
          }), (0,jsx_runtime.jsx)(_components.td, {
            children: "Yes"
          }), (0,jsx_runtime.jsxs)(_components.td, {
            children: ["Unique identifier for the publisher (alphanumeric and dashes, e.g. ", (0,jsx_runtime.jsx)(_components.code, {
              children: "\"redhat\""
            }), ", ", (0,jsx_runtime.jsx)(_components.code, {
              children: "\"mycompany\""
            }), "). Used to construct the unique extension ID: ", (0,jsx_runtime.jsx)(_components.code, {
              children: "<publisherName>.<extensionName>"
            }), "."]
          })]
        }), (0,jsx_runtime.jsxs)(_components.tr, {
          children: [(0,jsx_runtime.jsx)(_components.td, {
            children: (0,jsx_runtime.jsx)(_components.code, {
              children: "publisher.displayName"
            })
          }), (0,jsx_runtime.jsx)(_components.td, {
            children: "string"
          }), (0,jsx_runtime.jsx)(_components.td, {
            children: "Yes"
          }), (0,jsx_runtime.jsxs)(_components.td, {
            children: ["User-facing display name of the publisher (e.g. ", (0,jsx_runtime.jsx)(_components.code, {
              children: "\"Red Hat\""
            }), ", ", (0,jsx_runtime.jsx)(_components.code, {
              children: "\"My Company\""
            }), ")."]
          })]
        }), (0,jsx_runtime.jsxs)(_components.tr, {
          children: [(0,jsx_runtime.jsx)(_components.td, {
            children: (0,jsx_runtime.jsx)(_components.code, {
              children: "extensionName"
            })
          }), (0,jsx_runtime.jsx)(_components.td, {
            children: "string"
          }), (0,jsx_runtime.jsx)(_components.td, {
            children: "Yes"
          }), (0,jsx_runtime.jsxs)(_components.td, {
            children: ["Unique identifier of the extension within the publisher namespace (for example, ", (0,jsx_runtime.jsx)(_components.code, {
              children: "\"helloworld\""
            }), ")."]
          })]
        }), (0,jsx_runtime.jsxs)(_components.tr, {
          children: [(0,jsx_runtime.jsx)(_components.td, {
            children: (0,jsx_runtime.jsx)(_components.code, {
              children: "displayName"
            })
          }), (0,jsx_runtime.jsx)(_components.td, {
            children: "string"
          }), (0,jsx_runtime.jsx)(_components.td, {
            children: "Yes"
          }), (0,jsx_runtime.jsx)(_components.td, {
            children: "User-facing title of the extension shown in the catalog card and details page."
          })]
        }), (0,jsx_runtime.jsxs)(_components.tr, {
          children: [(0,jsx_runtime.jsx)(_components.td, {
            children: (0,jsx_runtime.jsx)(_components.code, {
              children: "shortDescription"
            })
          }), (0,jsx_runtime.jsx)(_components.td, {
            children: "string"
          }), (0,jsx_runtime.jsx)(_components.td, {
            children: "Yes"
          }), (0,jsx_runtime.jsx)(_components.td, {
            children: "Brief summary displayed on the catalog card."
          })]
        }), (0,jsx_runtime.jsxs)(_components.tr, {
          children: [(0,jsx_runtime.jsx)(_components.td, {
            children: (0,jsx_runtime.jsx)(_components.code, {
              children: "categories"
            })
          }), (0,jsx_runtime.jsx)(_components.td, {
            children: "array of strings"
          }), (0,jsx_runtime.jsx)(_components.td, {
            children: "Yes"
          }), (0,jsx_runtime.jsxs)(_components.td, {
            children: ["Category names used for filtering in the catalog UI (e.g. ", (0,jsx_runtime.jsx)(_components.code, {
              children: "[\"Containers\"]"
            }), ", ", (0,jsx_runtime.jsx)(_components.code, {
              children: "[\"Kubernetes\"]"
            }), ", ", (0,jsx_runtime.jsx)(_components.code, {
              children: "[\"AI\"]"
            }), ")."]
          })]
        }), (0,jsx_runtime.jsxs)(_components.tr, {
          children: [(0,jsx_runtime.jsx)(_components.td, {
            children: (0,jsx_runtime.jsx)(_components.code, {
              children: "keywords"
            })
          }), (0,jsx_runtime.jsx)(_components.td, {
            children: "array of strings"
          }), (0,jsx_runtime.jsx)(_components.td, {
            children: "Yes"
          }), (0,jsx_runtime.jsx)(_components.td, {
            children: "Search tags matching user queries in the catalog search bar."
          })]
        }), (0,jsx_runtime.jsxs)(_components.tr, {
          children: [(0,jsx_runtime.jsx)(_components.td, {
            children: (0,jsx_runtime.jsx)(_components.code, {
              children: "unlisted"
            })
          }), (0,jsx_runtime.jsx)(_components.td, {
            children: "boolean"
          }), (0,jsx_runtime.jsx)(_components.td, {
            children: "No"
          }), (0,jsx_runtime.jsxs)(_components.td, {
            children: ["If ", (0,jsx_runtime.jsx)(_components.code, {
              children: "true"
            }), ", the extension is hidden from catalog listings but accessible if navigated to directly. Defaults to ", (0,jsx_runtime.jsx)(_components.code, {
              children: "false"
            }), "."]
          })]
        }), (0,jsx_runtime.jsxs)(_components.tr, {
          children: [(0,jsx_runtime.jsx)(_components.td, {
            children: (0,jsx_runtime.jsx)(_components.code, {
              children: "versions"
            })
          }), (0,jsx_runtime.jsx)(_components.td, {
            children: "array"
          }), (0,jsx_runtime.jsx)(_components.td, {
            children: "Yes"
          }), (0,jsx_runtime.jsxs)(_components.td, {
            children: ["Array of release versions. ", (0,jsx_runtime.jsx)(_components.strong, {
              children: "Must be ordered with the newest version first."
            })]
          })]
        })]
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "version-object-fields",
      children: "Version object fields"
    }), "\n", (0,jsx_runtime.jsxs)(_components.table, {
      children: [(0,jsx_runtime.jsx)(_components.thead, {
        children: (0,jsx_runtime.jsxs)(_components.tr, {
          children: [(0,jsx_runtime.jsx)(_components.th, {
            children: "Field"
          }), (0,jsx_runtime.jsx)(_components.th, {
            children: "Type"
          }), (0,jsx_runtime.jsx)(_components.th, {
            children: "Required"
          }), (0,jsx_runtime.jsx)(_components.th, {
            children: "Description"
          })]
        })
      }), (0,jsx_runtime.jsxs)(_components.tbody, {
        children: [(0,jsx_runtime.jsxs)(_components.tr, {
          children: [(0,jsx_runtime.jsx)(_components.td, {
            children: (0,jsx_runtime.jsx)(_components.code, {
              children: "version"
            })
          }), (0,jsx_runtime.jsx)(_components.td, {
            children: "string"
          }), (0,jsx_runtime.jsx)(_components.td, {
            children: "Yes"
          }), (0,jsx_runtime.jsxs)(_components.td, {
            children: ["Extension release version string following semantic versioning (e.g. ", (0,jsx_runtime.jsx)(_components.code, {
              children: "\"0.0.1\""
            }), ")."]
          })]
        }), (0,jsx_runtime.jsxs)(_components.tr, {
          children: [(0,jsx_runtime.jsx)(_components.td, {
            children: (0,jsx_runtime.jsx)(_components.code, {
              children: "podmanDesktopVersion"
            })
          }), (0,jsx_runtime.jsx)(_components.td, {
            children: "string"
          }), (0,jsx_runtime.jsx)(_components.td, {
            children: "No"
          }), (0,jsx_runtime.jsxs)(_components.td, {
            children: ["Semantic version range of compatible Podman Desktop releases (e.g. ", (0,jsx_runtime.jsx)(_components.code, {
              children: "\"^1.25.0\""
            }), " or ", (0,jsx_runtime.jsx)(_components.code, {
              children: "\">= 1.20.0\""
            }), "). If specified, Podman Desktop skips this version if the running app version does not satisfy the range."]
          })]
        }), (0,jsx_runtime.jsxs)(_components.tr, {
          children: [(0,jsx_runtime.jsx)(_components.td, {
            children: (0,jsx_runtime.jsx)(_components.code, {
              children: "ociUri"
            })
          }), (0,jsx_runtime.jsx)(_components.td, {
            children: "string"
          }), (0,jsx_runtime.jsx)(_components.td, {
            children: "Yes"
          }), (0,jsx_runtime.jsxs)(_components.td, {
            children: ["Complete OCI image or multi-platform manifest reference (e.g. ", (0,jsx_runtime.jsx)(_components.code, {
              children: "\"quay.io/your-username/helloworld:0.0.1\""
            }), ")."]
          })]
        }), (0,jsx_runtime.jsxs)(_components.tr, {
          children: [(0,jsx_runtime.jsx)(_components.td, {
            children: (0,jsx_runtime.jsx)(_components.code, {
              children: "preview"
            })
          }), (0,jsx_runtime.jsx)(_components.td, {
            children: "boolean"
          }), (0,jsx_runtime.jsx)(_components.td, {
            children: "Yes"
          }), (0,jsx_runtime.jsxs)(_components.td, {
            children: ["Set to ", (0,jsx_runtime.jsx)(_components.code, {
              children: "true"
            }), " for pre-release versions. Preview versions remain in catalog data but are not displayed in the Catalog UI or selected for catalog installation or automatic updates."]
          })]
        }), (0,jsx_runtime.jsxs)(_components.tr, {
          children: [(0,jsx_runtime.jsx)(_components.td, {
            children: (0,jsx_runtime.jsx)(_components.code, {
              children: "lastUpdated"
            })
          }), (0,jsx_runtime.jsx)(_components.td, {
            children: "string"
          }), (0,jsx_runtime.jsx)(_components.td, {
            children: "Yes"
          }), (0,jsx_runtime.jsxs)(_components.td, {
            children: ["ISO 8601 timestamp representing the release date (e.g. ", (0,jsx_runtime.jsx)(_components.code, {
              children: "\"2026-09-23T00:00:00Z\""
            }), ")."]
          })]
        }), (0,jsx_runtime.jsxs)(_components.tr, {
          children: [(0,jsx_runtime.jsx)(_components.td, {
            children: (0,jsx_runtime.jsx)(_components.code, {
              children: "files"
            })
          }), (0,jsx_runtime.jsx)(_components.td, {
            children: "array"
          }), (0,jsx_runtime.jsx)(_components.td, {
            children: "Yes"
          }), (0,jsx_runtime.jsx)(_components.td, {
            children: "Array of static asset files associated with this version."
          })]
        })]
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "file-object-fields",
      children: "File object fields"
    }), "\n", (0,jsx_runtime.jsxs)(_components.table, {
      children: [(0,jsx_runtime.jsx)(_components.thead, {
        children: (0,jsx_runtime.jsxs)(_components.tr, {
          children: [(0,jsx_runtime.jsx)(_components.th, {
            children: "Field"
          }), (0,jsx_runtime.jsx)(_components.th, {
            children: "Type"
          }), (0,jsx_runtime.jsx)(_components.th, {
            children: "Required"
          }), (0,jsx_runtime.jsx)(_components.th, {
            children: "Description"
          })]
        })
      }), (0,jsx_runtime.jsxs)(_components.tbody, {
        children: [(0,jsx_runtime.jsxs)(_components.tr, {
          children: [(0,jsx_runtime.jsx)(_components.td, {
            children: (0,jsx_runtime.jsx)(_components.code, {
              children: "assetType"
            })
          }), (0,jsx_runtime.jsx)(_components.td, {
            children: "string"
          }), (0,jsx_runtime.jsx)(_components.td, {
            children: "Yes"
          }), (0,jsx_runtime.jsxs)(_components.td, {
            children: ["Asset identifier. Allowed values: ", (0,jsx_runtime.jsx)(_components.code, {
              children: "\"icon\""
            }), ", ", (0,jsx_runtime.jsx)(_components.code, {
              children: "\"README\""
            }), ", ", (0,jsx_runtime.jsx)(_components.code, {
              children: "\"LICENSE\""
            }), "."]
          })]
        }), (0,jsx_runtime.jsxs)(_components.tr, {
          children: [(0,jsx_runtime.jsx)(_components.td, {
            children: (0,jsx_runtime.jsx)(_components.code, {
              children: "data"
            })
          }), (0,jsx_runtime.jsx)(_components.td, {
            children: "string"
          }), (0,jsx_runtime.jsx)(_components.td, {
            children: "Yes"
          }), (0,jsx_runtime.jsx)(_components.td, {
            children: "Absolute HTTP or HTTPS URL to the asset file. Relative paths are not supported."
          })]
        })]
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.h2, {
      id: "test-the-catalog-locally",
      children: "Test the catalog locally"
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "You can test a custom catalog on your local machine using Python's built-in HTTP server:"
    }), "\n", (0,jsx_runtime.jsxs)(_components.ol, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: ["\n", (0,jsx_runtime.jsx)(_components.p, {
          children: "Create a directory structure for your catalog and assets:"
        }), "\n", (0,jsx_runtime.jsx)(_components.pre, {
          children: (0,jsx_runtime.jsx)(_components.code, {
            className: "language-text",
            children: "custom-catalog/\n ├── extensions.json\n └── extensions/\n     └── you/\n         └── helloworld/\n             └── 0.0.1/\n                ├── icon.png\n                ├── README.md\n                └── LICENSE\n"
          })
        }), "\n"]
      }), "\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
          children: ["Start a local HTTP server from the ", (0,jsx_runtime.jsx)(_components.code, {
            children: "custom-catalog"
          }), " directory:"]
        }), "\n", (0,jsx_runtime.jsx)(_components.pre, {
          children: (0,jsx_runtime.jsx)(_components.code, {
            className: "language-shell-session",
            children: "$ cd custom-catalog\n$ python -m http.server 8080\n"
          })
        }), "\n"]
      }), "\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
          children: ["Open Podman Desktop's ", (0,jsx_runtime.jsx)(_components.code, {
            children: "settings.json"
          }), " file in an editor. See the ", (0,jsx_runtime.jsx)(_components.a, {
            href: "/docs/configuration/settings-reference",
            children: "settings reference"
          }), " for its location on your operating system."]
        }), "\n"]
      }), "\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
          children: ["Add or update the ", (0,jsx_runtime.jsx)(_components.code, {
            children: "extensions.registryUrl"
          }), " property:"]
        }), "\n", (0,jsx_runtime.jsx)(_components.pre, {
          children: (0,jsx_runtime.jsx)(_components.code, {
            className: "language-json",
            children: "{\n  \"extensions.registryUrl\": \"http://localhost:8080/extensions.json\"\n}\n"
          })
        }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
          children: [":::note Plain HTTP vs HTTPS\nBecause ", (0,jsx_runtime.jsx)(_components.code, {
            children: "python -m http.server"
          }), " serves plain HTTP, configure ", (0,jsx_runtime.jsx)(_components.code, {
            children: "http://localhost:8080/..."
          }), " rather than ", (0,jsx_runtime.jsx)(_components.code, {
            children: "https://"
          }), ".\n:::"]
        }), "\n"]
      }), "\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
          children: ["Save ", (0,jsx_runtime.jsx)(_components.code, {
            children: "settings.json"
          }), " and start or restart Podman Desktop."]
        }), "\n"]
      }), "\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
          children: ["Open ", (0,jsx_runtime.jsx)(_components.strong, {
            children: "Extensions > Catalog"
          }), ". Your custom extensions appear in the list."]
        }), "\n"]
      }), "\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
          children: ["If you update the file while Podman Desktop is running, click the ", (0,jsx_runtime.jsx)(_components.strong, {
            children: "Refresh the catalog"
          }), " button in the Catalog view to reload the JSON immediately."]
        }), "\n"]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsx)(_components.h2, {
      id: "host-the-catalog-in-production",
      children: "Host the catalog in production"
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "For production or team-wide deployment, host your catalog file and static assets using any static hosting service or internal web server accessible to your users."
    }), "\n", (0,jsx_runtime.jsxs)(_components.ul, {
      children: ["\n", (0,jsx_runtime.jsx)(_components.li, {
        children: "Use HTTPS for production catalogs. Plain HTTP works for local testing, but is not recommended for production."
      }), "\n", (0,jsx_runtime.jsx)(_components.li, {
        children: "Ensure that users' workstations can reach both the catalog URL and the OCI image registry."
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsx)(_components.h2, {
      id: "manage-releases-and-updates",
      children: "Manage releases and updates"
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Podman Desktop contains an automated extension updater that checks for newer versions of installed extensions:"
    }), "\n", (0,jsx_runtime.jsxs)(_components.ol, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
          children: [(0,jsx_runtime.jsx)(_components.strong, {
            children: "Update checks:"
          }), " Podman Desktop checks for extension updates at application startup and every 12 hours when either ", (0,jsx_runtime.jsx)(_components.code, {
            children: "extensions.autoCheckUpdates"
          }), " or ", (0,jsx_runtime.jsx)(_components.code, {
            children: "extensions.autoUpdate"
          }), " is enabled. Both settings default to ", (0,jsx_runtime.jsx)(_components.code, {
            children: "true"
          }), "; checks are skipped when both are disabled. Catalog data is cached for four hours, after which Podman Desktop attempts to fetch it again and falls back to cached data if the fetch fails. Use ", (0,jsx_runtime.jsx)(_components.strong, {
            children: "Refresh the catalog"
          }), " in the Catalog view to force a fetch."]
        }), "\n"]
      }), "\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
          children: [(0,jsx_runtime.jsx)(_components.strong, {
            children: "Version selection:"
          }), " For each installed extension, Podman Desktop finds the matching extension in the catalog and inspects the first compatible non-preview version in ", (0,jsx_runtime.jsx)(_components.code, {
            children: "versions"
          }), "."]
        }), "\n"]
      }), "\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
          children: [(0,jsx_runtime.jsx)(_components.strong, {
            children: "SemVer comparison:"
          }), " If the catalog version is higher than the currently installed version (evaluated with semantic versioning), Podman Desktop updates the extension automatically when ", (0,jsx_runtime.jsx)(_components.code, {
            children: "extensions.autoUpdate"
          }), " is enabled. If ", (0,jsx_runtime.jsx)(_components.code, {
            children: "extensions.autoCheckUpdates"
          }), " is enabled and automatic updates are disabled, the extension is marked as updatable in the Extensions list."]
        }), "\n"]
      }), "\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
          children: [(0,jsx_runtime.jsx)(_components.strong, {
            children: "Retain previous versions:"
          }), " When publishing a new release, ", (0,jsx_runtime.jsxs)(_components.strong, {
            children: ["keep older releases in the ", (0,jsx_runtime.jsx)(_components.code, {
              children: "versions"
            }), " array"]
          }), " and prepend the new release to the top:"]
        }), "\n", (0,jsx_runtime.jsx)(_components.pre, {
          children: (0,jsx_runtime.jsx)(_components.code, {
            className: "language-json",
            children: "\"versions\": [\n   { \"version\": \"0.0.2\", ... },\n   { \"version\": \"0.0.1\", ... }\n]\n"
          })
        }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
          children: ["Keeping previous versions in the catalog lets users on older Podman Desktop releases fall back to a compatible version when newer entries require a newer ", (0,jsx_runtime.jsx)(_components.code, {
            children: "podmanDesktopVersion"
          }), "."]
        }), "\n"]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsx)(_components.h2, {
      id: "common-configurations",
      children: "Common configurations"
    }), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "minimal-catalog",
      children: "Minimal catalog"
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "A minimal, fully functional custom catalog hosting one extension:"
    }), "\n", (0,jsx_runtime.jsx)(_components.pre, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        className: "language-json",
        children: "{\n  \"extensions\": [\n    {\n      \"publisher\": {\n        \"publisherName\": \"you\",\n        \"displayName\": \"Your Name\"\n      },\n      \"extensionName\": \"helloworld\",\n      \"displayName\": \"Hello World\",\n      \"shortDescription\": \"Hello World extension\",\n      \"categories\": [\"Developer Tools\"],\n      \"keywords\": [\"hello-world\"],\n      \"versions\": [\n        {\n          \"version\": \"0.0.1\",\n          \"preview\": false,\n          \"lastUpdated\": \"2026-09-23T00:00:00Z\",\n          \"ociUri\": \"quay.io/your-username/helloworld:0.0.1\",\n          \"files\": [\n            {\n              \"assetType\": \"icon\",\n              \"data\": \"https://raw.githubusercontent.com/podman-desktop/extension-template-minimal/main/icon.png\"\n            },\n            {\n              \"assetType\": \"README\",\n              \"data\": \"https://raw.githubusercontent.com/podman-desktop/extension-template-minimal/main/README.md\"\n            },\n            {\n              \"assetType\": \"LICENSE\",\n              \"data\": \"https://raw.githubusercontent.com/podman-desktop/extension-template-minimal/main/LICENSE\"\n            }\n          ]\n        }\n      ]\n    }\n  ]\n}\n"
      })
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["With a custom catalog containing the minimal template extension, the Catalog view shows the Hello World extension and version ", (0,jsx_runtime.jsx)(_components.code, {
        children: "0.0.1"
      }), ":"]
    }), "\n", (0,jsx_runtime.jsx)(ThemedImage/* default */.A, {
      alt: "Podman Desktop Catalog view with the Hello World extension version 0.0.1",
      sources: {
        light: (__webpack_require__(71657)/* ["default"] */ .A),
        dark: (__webpack_require__(10251)/* ["default"] */ .A)
      }
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["If the catalog contains an empty ", (0,jsx_runtime.jsx)(_components.code, {
        children: "extensions"
      }), " array, Podman Desktop shows an empty catalog:"]
    }), "\n", (0,jsx_runtime.jsx)(ThemedImage/* default */.A, {
      alt: "Podman Desktop Catalog view with no extensions",
      sources: {
        light: (__webpack_require__(84313)/* ["default"] */ .A),
        dark: (__webpack_require__(82491)/* ["default"] */ .A)
      }
    }), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "local-asset-urls",
      children: "Local asset URLs"
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["In ", (0,jsx_runtime.jsx)(_components.code, {
        children: "extensions.json"
      }), ", reference local assets using the HTTP server URL:"]
    }), "\n", (0,jsx_runtime.jsx)(_components.pre, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        className: "language-json",
        children: "\"files\": [\n  {\n    \"assetType\": \"icon\",\n    \"data\": \"http://localhost:8080/extensions/you/helloworld/0.0.1/icon.png\"\n  },\n  {\n    \"assetType\": \"README\",\n    \"data\": \"http://localhost:8080/extensions/you/helloworld/0.0.1/README.md\"\n  },\n  {\n    \"assetType\": \"LICENSE\",\n    \"data\": \"http://localhost:8080/extensions/you/helloworld/0.0.1/LICENSE\"\n  }\n]\n"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "multiple-versions-and-automatic-updates",
      children: "Multiple versions and automatic updates"
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["To support automatic updates, place the newest release first. Keep older releases in the ", (0,jsx_runtime.jsx)(_components.code, {
        children: "versions"
      }), " array so older Podman Desktop releases can fall back to a compatible version when newer entries require a newer ", (0,jsx_runtime.jsx)(_components.code, {
        children: "podmanDesktopVersion"
      }), ":"]
    }), "\n", (0,jsx_runtime.jsx)(_components.pre, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        className: "language-json",
        children: "\"versions\": [\n  {\n    \"version\": \"0.0.3\",\n    \"preview\": false,\n    \"lastUpdated\": \"2026-09-23T00:00:00Z\",\n    \"ociUri\": \"quay.io/your-username/helloworld:0.0.3\",\n    \"files\": [\n      {\n        \"assetType\": \"icon\",\n        \"data\": \"https://raw.githubusercontent.com/podman-desktop/extension-template-minimal/main/icon.png\"\n      },\n      {\n        \"assetType\": \"README\",\n        \"data\": \"https://raw.githubusercontent.com/podman-desktop/extension-template-minimal/main/README.md\"\n      },\n      {\n        \"assetType\": \"LICENSE\",\n        \"data\": \"https://raw.githubusercontent.com/podman-desktop/extension-template-minimal/main/LICENSE\"\n      }\n    ]\n  },\n  {\n    \"version\": \"0.0.2\",\n    \"preview\": false,\n    \"lastUpdated\": \"2026-08-15T00:00:00Z\",\n    \"ociUri\": \"quay.io/your-username/helloworld:0.0.2\",\n    \"files\": [\n      {\n        \"assetType\": \"icon\",\n        \"data\": \"https://raw.githubusercontent.com/podman-desktop/extension-template-minimal/main/icon.png\"\n      },\n      {\n        \"assetType\": \"README\",\n        \"data\": \"https://raw.githubusercontent.com/podman-desktop/extension-template-minimal/main/README.md\"\n      },\n      {\n        \"assetType\": \"LICENSE\",\n        \"data\": \"https://raw.githubusercontent.com/podman-desktop/extension-template-minimal/main/LICENSE\"\n      }\n    ]\n  },\n  {\n    \"version\": \"0.0.1\",\n    \"preview\": false,\n    \"lastUpdated\": \"2026-07-01T00:00:00Z\",\n    \"ociUri\": \"quay.io/your-username/helloworld:0.0.1\",\n    \"files\": [\n      {\n        \"assetType\": \"icon\",\n        \"data\": \"https://raw.githubusercontent.com/podman-desktop/extension-template-minimal/main/icon.png\"\n      },\n      {\n        \"assetType\": \"README\",\n        \"data\": \"https://raw.githubusercontent.com/podman-desktop/extension-template-minimal/main/README.md\"\n      },\n      {\n        \"assetType\": \"LICENSE\",\n        \"data\": \"https://raw.githubusercontent.com/podman-desktop/extension-template-minimal/main/LICENSE\"\n      }\n    ]\n  }\n]\n"
      })
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["When users with version ", (0,jsx_runtime.jsx)(_components.code, {
        children: "0.0.1"
      }), " or ", (0,jsx_runtime.jsx)(_components.code, {
        children: "0.0.2"
      }), " installed run Podman Desktop, the application detects ", (0,jsx_runtime.jsx)(_components.code, {
        children: "0.0.3"
      }), " as the newest release and offers an update."]
    }), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "podman-desktop-version-compatibility",
      children: "Podman Desktop version compatibility"
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Use ", (0,jsx_runtime.jsx)(_components.code, {
        children: "podmanDesktopVersion"
      }), " to filter versions shown in the Catalog view and considered for automatic updates:"]
    }), "\n", (0,jsx_runtime.jsx)(_components.pre, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        className: "language-json",
        children: "\"versions\": [\n  {\n    \"version\": \"0.1.0\",\n    \"podmanDesktopVersion\": \"^1.25.0\",\n    \"preview\": false,\n    \"lastUpdated\": \"2026-09-23T00:00:00Z\",\n    \"ociUri\": \"quay.io/your-username/helloworld:0.1.0\",\n    \"files\": [\n      {\n        \"assetType\": \"icon\",\n        \"data\": \"https://raw.githubusercontent.com/podman-desktop/extension-template-minimal/main/icon.png\"\n      },\n      {\n        \"assetType\": \"README\",\n        \"data\": \"https://raw.githubusercontent.com/podman-desktop/extension-template-minimal/main/README.md\"\n      },\n      {\n        \"assetType\": \"LICENSE\",\n        \"data\": \"https://raw.githubusercontent.com/podman-desktop/extension-template-minimal/main/LICENSE\"\n      }\n    ]\n  },\n  {\n    \"version\": \"0.0.2\",\n    \"podmanDesktopVersion\": \"^1.20.0\",\n    \"preview\": false,\n    \"lastUpdated\": \"2026-07-15T00:00:00Z\",\n    \"ociUri\": \"quay.io/your-username/helloworld:0.0.2\",\n    \"files\": [\n      {\n        \"assetType\": \"icon\",\n        \"data\": \"https://raw.githubusercontent.com/podman-desktop/extension-template-minimal/main/icon.png\"\n      },\n      {\n        \"assetType\": \"README\",\n        \"data\": \"https://raw.githubusercontent.com/podman-desktop/extension-template-minimal/main/README.md\"\n      },\n      {\n        \"assetType\": \"LICENSE\",\n        \"data\": \"https://raw.githubusercontent.com/podman-desktop/extension-template-minimal/main/LICENSE\"\n      }\n    ]\n  }\n]\n"
      })
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["In the Catalog view and automatic update checks, Podman Desktop ", (0,jsx_runtime.jsx)(_components.code, {
        children: "1.22.0"
      }), " skips ", (0,jsx_runtime.jsx)(_components.code, {
        children: "0.1.0"
      }), " (which requires ", (0,jsx_runtime.jsx)(_components.code, {
        children: "^1.25.0"
      }), ") and selects ", (0,jsx_runtime.jsx)(_components.code, {
        children: "0.0.2"
      }), " as the compatible release."]
    }), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "preview-release",
      children: "Preview release"
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Pre-release builds marked with ", (0,jsx_runtime.jsx)(_components.code, {
        children: "\"preview\": true"
      }), " remain in the catalog data, but Podman Desktop does not display or select them in the Catalog UI, install them through the catalog, or use them for automatic updates. To test a preview image, install it directly using ", (0,jsx_runtime.jsx)(_components.strong, {
        children: "Install custom…"
      }), "."]
    }), "\n", (0,jsx_runtime.jsx)(_components.pre, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        className: "language-json",
        children: "\"versions\": [\n  {\n    \"version\": \"0.1.0-beta.1\",\n    \"podmanDesktopVersion\": \"^1.25.0\",\n    \"preview\": true,\n    \"lastUpdated\": \"2026-09-23T00:00:00Z\",\n    \"ociUri\": \"quay.io/your-username/helloworld:0.1.0-beta.1\",\n    \"files\": [\n      {\n        \"assetType\": \"icon\",\n        \"data\": \"https://raw.githubusercontent.com/podman-desktop/extension-template-minimal/main/icon.png\"\n      },\n      {\n        \"assetType\": \"README\",\n        \"data\": \"https://raw.githubusercontent.com/podman-desktop/extension-template-minimal/main/README.md\"\n      },\n      {\n        \"assetType\": \"LICENSE\",\n        \"data\": \"https://raw.githubusercontent.com/podman-desktop/extension-template-minimal/main/LICENSE\"\n      }\n    ]\n  },\n  {\n    \"version\": \"0.0.2\",\n    \"podmanDesktopVersion\": \"^1.20.0\",\n    \"preview\": false,\n    \"lastUpdated\": \"2026-08-15T00:00:00Z\",\n    \"ociUri\": \"quay.io/your-username/helloworld:0.0.2\",\n    \"files\": [\n      {\n        \"assetType\": \"icon\",\n        \"data\": \"https://raw.githubusercontent.com/podman-desktop/extension-template-minimal/main/icon.png\"\n      },\n      {\n        \"assetType\": \"README\",\n        \"data\": \"https://raw.githubusercontent.com/podman-desktop/extension-template-minimal/main/README.md\"\n      },\n      {\n        \"assetType\": \"LICENSE\",\n        \"data\": \"https://raw.githubusercontent.com/podman-desktop/extension-template-minimal/main/LICENSE\"\n      }\n    ]\n  }\n]\n"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.h3, {
      id: "restore-the-official-catalog",
      children: "Restore the official catalog"
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["To switch back to the official Podman Desktop catalog, update ", (0,jsx_runtime.jsx)(_components.code, {
        children: "extensions.registryUrl"
      }), " in ", (0,jsx_runtime.jsx)(_components.code, {
        children: "settings.json"
      }), " to the default endpoint:"]
    }), "\n", (0,jsx_runtime.jsx)(_components.pre, {
      children: (0,jsx_runtime.jsx)(_components.code, {
        className: "language-json",
        children: "{\n  \"extensions.registryUrl\": \"https://registry.podman-desktop.io/api/extensions.json\"\n}\n"
      })
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Or remove the ", (0,jsx_runtime.jsx)(_components.code, {
        children: "\"extensions.registryUrl\""
      }), " line entirely from ", (0,jsx_runtime.jsx)(_components.code, {
        children: "settings.json"
      }), "."]
    }), "\n", (0,jsx_runtime.jsx)(_components.h2, {
      id: "additional-resources",
      children: "Additional resources"
    }), "\n", (0,jsx_runtime.jsxs)(_components.ul, {
      children: ["\n", (0,jsx_runtime.jsx)(_components.li, {
        children: (0,jsx_runtime.jsx)(_components.a, {
          href: "/docs/extensions/publish",
          children: "Packaging and publishing a Podman Desktop extension"
        })
      }), "\n", (0,jsx_runtime.jsx)(_components.li, {
        children: (0,jsx_runtime.jsx)(_components.a, {
          href: "/docs/extensions/install",
          children: "Installing a Podman Desktop extension"
        })
      }), "\n", (0,jsx_runtime.jsx)(_components.li, {
        children: (0,jsx_runtime.jsx)(_components.a, {
          href: "/docs/configuration/settings-reference",
          children: "Settings reference"
        })
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

/***/ 10251
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   A: () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (__webpack_require__.p + "assets/images/custom-catalog-dark-180a1c645ce933646d9d751a838a7e2d.webp");

/***/ },

/***/ 71657
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   A: () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (__webpack_require__.p + "assets/images/custom-catalog-light-9a7210cd4d164ea77c195ab226f3494b.webp");

/***/ },

/***/ 82491
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   A: () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (__webpack_require__.p + "assets/images/empty-catalog-dark-e87b3701f01bce99e47abe1e1acc6799.webp");

/***/ },

/***/ 84313
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   A: () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (__webpack_require__.p + "assets/images/empty-catalog-light-5c109bc505bd13bdcd18681c7a4da822.webp");

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