"use strict";
(globalThis["webpackChunkdocs"] = globalThis["webpackChunkdocs"] || []).push([[87059],{

/***/ 18429
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  assets: () => (/* binding */ assets),
  contentTitle: () => (/* binding */ contentTitle),
  "default": () => (/* binding */ MDXContent),
  frontMatter: () => (/* binding */ frontMatter),
  metadata: () => (/* reexport */ site_docs_extensions_publish_index_mdx_096_namespaceObject),
  toc: () => (/* binding */ toc)
});

;// ./.docusaurus/docusaurus-plugin-content-docs/default/site-docs-extensions-publish-index-mdx-096.json
const site_docs_extensions_publish_index_mdx_096_namespaceObject = /*#__PURE__*/JSON.parse('{"id":"extensions/publish/index","title":"Publishing","description":"Publishing a Podman Desktop extension to the catalog","source":"@site/docs/extensions/publish/index.mdx","sourceDirName":"extensions/publish","slug":"/extensions/publish/","permalink":"/docs/extensions/publish/","draft":false,"unlisted":false,"editUrl":"https://github.com/podman-desktop/podman-desktop/tree/main/website/docs/extensions/publish/index.mdx","tags":[{"inline":true,"label":"podman-desktop","permalink":"/docs/tags/podman-desktop"},{"inline":true,"label":"extension","permalink":"/docs/tags/extension"},{"inline":true,"label":"publishing","permalink":"/docs/tags/publishing"}],"version":"current","sidebarPosition":3,"frontMatter":{"sidebar_position":3,"title":"Publishing","description":"Publishing a Podman Desktop extension to the catalog","tags":["podman-desktop","extension","publishing"],"keywords":["podman desktop","extension","publishing-an-extension"]},"sidebar":"mySidebar","previous":{"title":"Debugging","permalink":"/docs/extensions/debugging-an-extension"},"next":{"title":"Hosting a custom extension catalog","permalink":"/docs/extensions/catalog/"}}');
// EXTERNAL MODULE: ../node_modules/react/jsx-runtime.js
var jsx_runtime = __webpack_require__(62540);
// EXTERNAL MODULE: ../node_modules/@mdx-js/react/lib/index.js
var lib = __webpack_require__(43023);
;// ./docs/extensions/publish/index.mdx


const frontMatter = {
	sidebar_position: 3,
	title: 'Publishing',
	description: 'Publishing a Podman Desktop extension to the catalog',
	tags: [
		'podman-desktop',
		'extension',
		'publishing'
	],
	keywords: [
		'podman desktop',
		'extension',
		'publishing-an-extension'
	]
};
const contentTitle = 'Packaging and publishing a Podman Desktop extension';

const assets = {

};



const toc = [{
  "value": "Prerequisites",
  "id": "prerequisites",
  "level": 4
}, {
  "value": "Procedure: Push your extension to an OCI registry",
  "id": "procedure-push-your-extension-to-an-oci-registry",
  "level": 4
}, {
  "value": "Adding platform-specific files",
  "id": "adding-platform-specific-files",
  "level": 4
}, {
  "value": "Procedure: Publish the extension to the catalog",
  "id": "procedure-publish-the-extension-to-the-catalog",
  "level": 4
}, {
  "value": "Additional resources",
  "id": "additional-resources",
  "level": 4
}];
function _createMdxContent(props) {
  const _components = {
    a: "a",
    code: "code",
    h1: "h1",
    h4: "h4",
    header: "header",
    li: "li",
    ol: "ol",
    p: "p",
    pre: "pre",
    ul: "ul",
    ...(0,lib/* useMDXComponents */.R)(),
    ...props.components
  };
  return (0,jsx_runtime.jsxs)(jsx_runtime.Fragment, {
    children: [(0,jsx_runtime.jsx)(_components.header, {
      children: (0,jsx_runtime.jsx)(_components.h1, {
        id: "packaging-and-publishing-a-podman-desktop-extension",
        children: "Packaging and publishing a Podman Desktop extension"
      })
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["To enable users to install your extension from the catalog, push your extension to an Open Container Initiative (OCI) image registry. After pushing your extension, add the extension details to the ", (0,jsx_runtime.jsx)(_components.code, {
        children: "podman-desktop-catalog/static/api/extensions.json"
      }), " file in the ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/podman-desktop/podman-desktop-catalog",
        children: "catalog repository"
      }), "."]
    }), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "prerequisites",
      children: "Prerequisites"
    }), "\n", (0,jsx_runtime.jsxs)(_components.ul, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
          children: ["The extension builds successfully.\nSee ", (0,jsx_runtime.jsx)(_components.a, {
            href: "/docs/extensions/developing",
            children: "Developing a Podman Desktop extension"
          }), " and ", (0,jsx_runtime.jsx)(_components.a, {
            href: "/tutorial/creating-an-extension",
            children: "Creating an extension"
          }), "."]
        }), "\n"]
      }), "\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: ["\n", (0,jsx_runtime.jsx)(_components.p, {
          children: "All runtime dependencies are inside the final binary."
        }), "\n"]
      }), "\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
          children: ["An OCI image registry to publish to, such as ", (0,jsx_runtime.jsx)(_components.code, {
            children: "quay.io/username/my-extension"
          }), "."]
        }), "\n"]
      }), "\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: ["\n", (0,jsx_runtime.jsx)(_components.p, {
          children: "(Optional) The OCI image registry is public to enable anybody to fetch the image."
        }), "\n"]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "procedure-push-your-extension-to-an-oci-registry",
      children: "Procedure: Push your extension to an OCI registry"
    }), "\n", (0,jsx_runtime.jsxs)(_components.ol, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
          children: ["Create and edit a ", (0,jsx_runtime.jsx)(_components.code, {
            children: "Containerfile"
          }), " file."]
        }), "\n"]
      }), "\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: ["\n", (0,jsx_runtime.jsx)(_components.p, {
          children: "Use a scratch image.\nThe extension requires no runtime:"
        }), "\n", (0,jsx_runtime.jsx)(_components.pre, {
          children: (0,jsx_runtime.jsx)(_components.code, {
            className: "language-dockerfile",
            children: "FROM scratch\n"
          })
        }), "\n"]
      }), "\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
          children: ["Apply mandatory Podman Desktop metadata on the ", (0,jsx_runtime.jsx)(_components.code, {
            children: "OCI"
          }), " image:"]
        }), "\n", (0,jsx_runtime.jsx)(_components.pre, {
          children: (0,jsx_runtime.jsx)(_components.code, {
            className: "language-dockerfile",
            children: "LABEL org.opencontainers.image.title=\"My extension\" \\\n      org.opencontainers.image.description=\"Example of extension\" \\\n      org.opencontainers.image.vendor=\"podman-desktop\" \\\n      io.podman-desktop.api.version=\">= 0.12.0\"\n"
          })
        }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
          children: [(0,jsx_runtime.jsx)(_components.code, {
            children: "io.podman-desktop.api.version=\">= 0.12.0\""
          }), " sets the minimal Podman Desktop version that the extension requires to run."]
        }), "\n"]
      }), "\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
          children: ["Copy the extension assembly, including the metadata, icon, and production binary, to the ", (0,jsx_runtime.jsx)(_components.code, {
            children: "/extension"
          }), " folder inside the image:"]
        }), "\n", (0,jsx_runtime.jsx)(_components.pre, {
          children: (0,jsx_runtime.jsx)(_components.code, {
            className: "language-dockerfile",
            children: "COPY package.json /extension/\nCOPY icon.png /extension/\nCOPY dist /extension/dist\n"
          })
        }), "\n"]
      }), "\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: ["\n", (0,jsx_runtime.jsx)(_components.p, {
          children: "Build an image:"
        }), "\n", (0,jsx_runtime.jsx)(_components.pre, {
          children: (0,jsx_runtime.jsx)(_components.code, {
            className: "language-shell-session",
            children: "$ podman build -t quay.io/username/my-extension .\n"
          })
        }), "\n"]
      }), "\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: ["\n", (0,jsx_runtime.jsx)(_components.p, {
          children: "Push the image and manifest to the OCI image registry:"
        }), "\n", (0,jsx_runtime.jsx)(_components.pre, {
          children: (0,jsx_runtime.jsx)(_components.code, {
            className: "language-shell-session",
            children: "$ podman push quay.io/username/my-extension\n"
          })
        }), "\n"]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "adding-platform-specific-files",
      children: "Adding platform-specific files"
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "You may want to add a system-native executable to the extension's image, so the extension can execute it."
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "In contrast to the extension's code (transpiled into JavaScript) which is executable in any platform, you will need to prepare several OCI images, one for each platform (OS and architecture) you want the extension to support."
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "For this, you will need to create:"
    }), "\n", (0,jsx_runtime.jsxs)(_components.ul, {
      children: ["\n", (0,jsx_runtime.jsx)(_components.li, {
        children: "One Containerfile for each platform or a common Containerfile with parameters to create\none image per platform."
      }), "\n", (0,jsx_runtime.jsx)(_components.li, {
        children: "One manifest to reference all images created at the previous step."
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "The URL you need to share with the users to install the extension is the URL of the manifest."
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "If the manifest does not contain an image for the platform of the user, Podman Desktop will install the\nimage for Linux (amd64 or arm64 depending on the architecture of the user's platform)."
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["You can leverage the ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://github.com/redhat-actions/buildah-build",
        children: "Buildah Build action"
      }), " to build this manifest."]
    }), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "procedure-publish-the-extension-to-the-catalog",
      children: "Procedure: Publish the extension to the catalog"
    }), "\n", (0,jsx_runtime.jsxs)(_components.ol, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: ["Fork and then clone the ", (0,jsx_runtime.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop-catalog",
          children: "Podman Desktop catalog repository"
        }), "."]
      }), "\n", (0,jsx_runtime.jsx)(_components.li, {
        children: "Checkout a new branch."
      }), "\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: ["Add a license, a readme file, and the extension icon to the ", (0,jsx_runtime.jsx)(_components.code, {
          children: "podman-desktop-catalog/static/api/extensions/podman-desktop/"
        }), " directory."]
      }), "\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: ["Edit the ", (0,jsx_runtime.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop-catalog/blob/main/static/api/extensions.json",
          children: (0,jsx_runtime.jsx)(_components.code, {
            children: "extensions.json"
          })
        }), " file to add your extension details. ", (0,jsx_runtime.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop-catalog/blob/main/static/api/extensions.json#L406",
          children: "Here"
        }), " is an example of adding a Podman Desktop extension named Minkibe to the catalog."]
      }), "\n", (0,jsx_runtime.jsx)(_components.li, {
        children: "Create a PR with your changes."
      }), "\n", (0,jsx_runtime.jsx)(_components.li, {
        children: "Get your PR merged to make your extension available in the catalog."
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Podman Desktop has an in-built automatic update mechanism to refresh the catalog list with the newly added extensions."
    }), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "additional-resources",
      children: "Additional resources"
    }), "\n", (0,jsx_runtime.jsxs)(_components.ul, {
      children: ["\n", (0,jsx_runtime.jsx)(_components.li, {
        children: (0,jsx_runtime.jsx)(_components.a, {
          href: "/docs/extensions/install",
          children: "Installing a Podman Desktop extension"
        })
      }), "\n", (0,jsx_runtime.jsx)(_components.li, {
        children: (0,jsx_runtime.jsx)(_components.a, {
          href: "/tutorial/creating-an-extension",
          children: "Create an extension"
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