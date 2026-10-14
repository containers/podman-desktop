"use strict";
(globalThis["webpackChunkdocs"] = globalThis["webpackChunkdocs"] || []).push([[27705],{

/***/ 25303
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   assets: () => (/* binding */ assets),
/* harmony export */   contentTitle: () => (/* binding */ contentTitle),
/* harmony export */   "default": () => (/* binding */ MDXContent),
/* harmony export */   frontMatter: () => (/* binding */ frontMatter),
/* harmony export */   metadata: () => (/* reexport default export from named module */ _site_docusaurus_docusaurus_plugin_content_blog_default_site_blog_2025_07_07_release_1_20_mdx_402_json__WEBPACK_IMPORTED_MODULE_0__),
/* harmony export */   toc: () => (/* binding */ toc)
/* harmony export */ });
/* harmony import */ var _site_docusaurus_docusaurus_plugin_content_blog_default_site_blog_2025_07_07_release_1_20_mdx_402_json__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(91371);
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(62540);
/* harmony import */ var _mdx_js_react__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(43023);
/* harmony import */ var _theme_ThemedImage__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(90448);


const frontMatter = {
	title: 'Podman Desktop 1.20 Release',
	description: 'Podman Desktop 1.20 has been released!',
	slug: 'podman-desktop-release-1.20',
	authors: [
		'vzhukovs'
	],
	tags: [
		'podman-desktop',
		'release',
		'kubernetes',
		'openshift'
	],
	hide_table_of_contents: false,
	image: '/img/blog/podman-desktop-release-1.20/banner.png'
};
const contentTitle = undefined;

const assets = {
"authorsImageUrls": [undefined],
};




const toc = [{
  "value": "Release details 🔍",
  "id": "release-details-",
  "level": 2
}, {
  "value": "Bulk Start All Containers",
  "id": "bulk-start-all-containers",
  "level": 3
}, {
  "value": "Switch Users and Clusters",
  "id": "switch-users-and-clusters",
  "level": 3
}, {
  "value": "Extension Search by Description",
  "id": "extension-search-by-description",
  "level": 3
}, {
  "value": "Provider Updates from Resources Page",
  "id": "provider-updates-from-resources-page",
  "level": 3
}, {
  "value": "Local Extension Development Mode",
  "id": "local-extension-development-mode",
  "level": 3
}, {
  "value": "Instantly stop live container logs",
  "id": "instantly-stop-live-container-logs",
  "level": 3
}, {
  "value": "New Community Page",
  "id": "new-community-page",
  "level": 3
}, {
  "value": "Community thank you",
  "id": "community-thank-you",
  "level": 2
}, {
  "value": "Final notes",
  "id": "final-notes",
  "level": 2
}, {
  "value": "Detailed release changelog",
  "id": "detailed-release-changelog",
  "level": 2
}, {
  "value": "feat 💡",
  "id": "feat-",
  "level": 3
}, {
  "value": "fix 🔨",
  "id": "fix-",
  "level": 3
}, {
  "value": "chore ✅",
  "id": "chore-",
  "level": 3
}, {
  "value": "refactor 🛠️",
  "id": "refactor-️",
  "level": 3
}, {
  "value": "test 🚦",
  "id": "test-",
  "level": 3
}, {
  "value": "docs 📖",
  "id": "docs-",
  "level": 3
}, {
  "value": "ci 🔁",
  "id": "ci-",
  "level": 3
}];
function _createMdxContent(props) {
  const _components = {
    a: "a",
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
      children: "Podman Desktop 1.20 Release! 🎉"
    }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.p, {
      children: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.img, {
        alt: "podman-desktop-hero-1.20",
        src: (__webpack_require__(18991)/* ["default"] */ .A) + "",
        width: "1216",
        height: "832"
      })
    }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.p, {
      children: ["Podman Desktop 1.20 is now available. ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
        href: "/downloads",
        children: "Click here to download it"
      }), "!"]
    }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.p, {
      children: "This release brings exciting new features and improvements:"
    }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.ul, {
      children: ["\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.strong, {
          children: "Start all containers in bulk"
        }), ": A new bulk-run button allows you to start multiple selected containers at once, saving time when launching your container stack."]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.strong, {
          children: "Switching users and clusters"
        }), ": Seamlessly switch your active Kubernetes cluster and user context from within Podman Desktop, making multi-cluster workflows much easier."]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.strong, {
          children: "Search by description in extension list"
        }), ": Find extensions faster by searching not just by name but also through keywords in their descriptions."]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.strong, {
          children: "Update providers from the Resources page"
        }), ": Easily update your container engines or Kubernetes providers right from the Resources page for a more streamlined upgrade process."]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.strong, {
          children: "Local Extension Development Mode"
        }), ": The production binary now lets you load and live-test local extensions after enabling Development Mode, eliminating the need to run Podman Desktop in dev/watch mode."]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.strong, {
          children: "Instantly stop live container logs"
        }), ": Now you can stop live log streaming from containers without closing the logs window. This gives you more control over resource usage and debugging workflows."]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.strong, {
          children: "New Community page website"
        }), ": A new Community page on our website helps you connect with fellow users, find resources, and get involved with Podman Desktop’s development."]
      }), "\n"]
    }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.hr, {}), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.h2, {
      id: "release-details-",
      children: "Release details 🔍"
    }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.h3, {
      id: "bulk-start-all-containers",
      children: "Bulk Start All Containers"
    }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.p, {
      children: ["If you have several containers to run, you no longer need to start each one individually. Podman Desktop now provides a ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.strong, {
        children: "“Run All”"
      }), " button on the Containers view to launch all selected containers with a single click. This makes it much more convenient to bring up multiple services or an entire application stack in one go. Already-running containers are intelligently skipped, so the bulk start action focuses on only starting the ones that are stopped."]
    }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_theme_ThemedImage__WEBPACK_IMPORTED_MODULE_3__/* ["default"] */ .A, {
      alt: "Containers List page",
      sources: {
        light: (__webpack_require__(93115)/* ["default"] */ .A),
        dark: (__webpack_require__(8451)/* ["default"] */ .A)
      }
    }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.h3, {
      id: "switch-users-and-clusters",
      children: "Switch Users and Clusters"
    }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.p, {
      children: "Podman Desktop’s Kubernetes integration now supports easy context switching between different clusters and user accounts. You can change your active Kubernetes cluster and user directly through the application UI without editing config files or using external CLI commands. This is especially useful for developers working with multiple environments – for example, switching from a development cluster to a production cluster (or using different user credentials) is now just a few clicks. It streamlines multi-cluster workflows by letting you hop between contexts seamlessly inside Podman Desktop."
    }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_theme_ThemedImage__WEBPACK_IMPORTED_MODULE_3__/* ["default"] */ .A, {
      alt: "Edit Kubernetes Context page",
      sources: {
        light: (__webpack_require__(18407)/* ["default"] */ .A),
        dark: (__webpack_require__(17063)/* ["default"] */ .A)
      }
    }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.h3, {
      id: "extension-search-by-description",
      children: "Extension Search by Description"
    }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.p, {
      children: "The extension marketplace search has been improved to help you discover tools more easily. Previously, searching for extensions only matched against extension names. In Podman Desktop 1.20, the search bar also looks at extension descriptions. This means you can enter a keyword related to an extension’s functionality or topic, and the relevant extensions will appear even if that keyword isn’t in the extension’s name. It’s now much easier to find extensions by what they do, not just what they’re called."
    }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_theme_ThemedImage__WEBPACK_IMPORTED_MODULE_3__/* ["default"] */ .A, {
      alt: "Extensions page",
      sources: {
        light: (__webpack_require__(14571)/* ["default"] */ .A),
        dark: (__webpack_require__(33139)/* ["default"] */ .A)
      }
    }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.h3, {
      id: "provider-updates-from-resources-page",
      children: "Provider Updates from Resources Page"
    }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.p, {
      children: ["Managing your container and Kubernetes providers just got easier. The ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.strong, {
        children: "Resources"
      }), " page in Podman Desktop (which lists your container engines and Kubernetes environments) now allows direct updates for those providers. If a new version of a provider – say Podman, Docker, or a Kubernetes VM – is available, you can trigger the upgrade right from Podman Desktop’s interface. No need to manually run update commands or leave the app; a quick click keeps your development environment up-to-date with the latest releases."]
    }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_theme_ThemedImage__WEBPACK_IMPORTED_MODULE_3__/* ["default"] */ .A, {
      alt: "Resources page",
      sources: {
        light: (__webpack_require__(2188)/* ["default"] */ .A),
        dark: (__webpack_require__(1058)/* ["default"] */ .A)
      }
    }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.h3, {
      id: "local-extension-development-mode",
      children: "Local Extension Development Mode"
    }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.p, {
      children: "Extension authors can now toggle Development Mode in Preferences and add a local folder from the new Local Extensions tab. Podman Desktop will watch the folder, load the extension, and keep it tracked across restarts, exactly as it behaves in production. You can start, stop, or untrack the extension directly from the UI, shortening the feedback loop for building and debugging add-ons without extra CLI flags or a special dev build."
    }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_theme_ThemedImage__WEBPACK_IMPORTED_MODULE_3__/* ["default"] */ .A, {
      alt: "Resources page",
      sources: {
        light: (__webpack_require__(89414)/* ["default"] */ .A),
        dark: (__webpack_require__(25484)/* ["default"] */ .A)
      }
    }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.h3, {
      id: "instantly-stop-live-container-logs",
      children: "Instantly stop live container logs"
    }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.p, {
      children: "The container logs viewer can now be canceled mid-stream, allowing you to stop tailing logs when they are no longer needed.\nPreviously, once a container’s logs were opened, the output would continue streaming until the logs window was closed. With this update, an ongoing log stream can be interrupted via a cancel action without closing the logs pane, giving you more control over log monitoring. This improvement helps avoid redundant log output and unnecessary resource usage by letting log streaming be halted on demand."
    }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.h3, {
      id: "new-community-page",
      children: "New Community Page"
    }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.p, {
      children: ["We’ve launched a new ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.strong, {
        children: "Community"
      }), " page on the Podman Desktop website to better connect our users and contributors. This page serves as a central hub for all community-related resources: you can find links to join our Discord channel, participate in GitHub discussions, follow us on social platforms, and more. It also highlights ways to contribute to the project, whether by reporting issues, writing code, or improving documentation. Whether you want to share feedback, meet other Podman Desktop enthusiasts, or get involved in development, the Community page is the place to start."]
    }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.hr, {}), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.h2, {
      id: "community-thank-you",
      children: "Community thank you"
    }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.p, {
      children: "🎉 We’d like to say a big thank you to everyone who helped to make Podman Desktop even better. In this\nrelease we received pull requests from the following people:"
    }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.ul, {
      children: ["\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.p, {
          children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
            href: "https://github.com/statickidz",
            children: "statickidz"
          }), " in ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
            href: "https://github.com/podman-desktop/podman-desktop/pull/12802",
            children: "fix: duplicate title on homepage"
          })]
        }), "\n"]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.p, {
          children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
            href: "https://github.com/jiridostal",
            children: "jiridostal"
          }), " in ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
            href: "https://github.com/podman-desktop/podman-desktop/pull/12774",
            children: "fix: logs filename has undefined extension"
          })]
        }), "\n"]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.p, {
          children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
            href: "https://github.com/omertuc",
            children: "omertuc"
          }), " in ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
            href: "https://github.com/podman-desktop/podman-desktop/pull/12519",
            children: "feat(extension): add search by description in extension list"
          })]
        }), "\n"]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.p, {
          children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
            href: "https://github.com/wngtk",
            children: "wngtk"
          }), " in ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
            href: "https://github.com/podman-desktop/podman-desktop/pull/12349",
            children: "docs(windows): update uninstall instructions"
          })]
        }), "\n"]
      }), "\n"]
    }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.hr, {}), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.h2, {
      id: "final-notes",
      children: "Final notes"
    }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.p, {
      children: ["The complete list of issues fixed in this release is available ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
        href: "https://github.com/containers/podman-desktop/issues?q=is%3Aclosed+milestone%3A1.20.0",
        children: "here"
      }), " and ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
        href: "https://github.com/containers/podman-desktop/issues?q=is%3Aclosed+milestone%3A1.20.1",
        children: "here"
      }), "."]
    }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.p, {
      children: ["Get the latest release from the ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
        href: "/downloads",
        children: "Downloads"
      }), " section of the website and boost your development journey with Podman Desktop. Additionally, visit the ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
        href: "https://github.com/containers/podman-desktop",
        children: "GitHub repository"
      }), " and see how you can help us make Podman Desktop better."]
    }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.h2, {
      id: "detailed-release-changelog",
      children: "Detailed release changelog"
    }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.h3, {
      id: "feat-",
      children: "feat 💡"
    }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.ul, {
      children: ["\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["feat: adds dropdown option to message box by @gastoner ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/13049",
          children: "#13049"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["feat(table): adding key props by @axel7083 ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12994",
          children: "#12994"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["feat(table): adding accessibility labels to collapse button by @axel7083 ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12979",
          children: "#12979"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["feat: add badge for in-development extensions by @benoitf ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12951",
          children: "#12951"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["feat: new community page website by @cdrage ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12748",
          children: "#12748"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["feat: allow provider update from resources page by @SoniaSandler ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12729",
          children: "#12729"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["feat(extension-api): support cancellation token for pull image by @axel7083 ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12706",
          children: "#12706"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["feat(ui): created universal icon by @gastoner ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12677",
          children: "#12677"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["feat: add button to start all containers in bulk by @MarsKubeX ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12646",
          children: "#12646"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["feat: support fine-grained window events for EventStore by @feloy ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12636",
          children: "#12636"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["feat: make window.logsContainer cancellable by @feloy ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12624",
          children: "#12624"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["feat(extension): add search by description in extension list by @omertuc ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12519",
          children: "#12519"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["feat: added switching users and clusters by @gastoner ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12445",
          children: "#12445"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["feat: allow to use production binary to develop extensions by @benoitf ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/10731",
          children: "#10731"
        })]
      }), "\n"]
    }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.h3, {
      id: "fix-",
      children: "fix 🔨"
    }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.ul, {
      children: ["\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["fix: pod name not working in k8s by @eqqe ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/13066",
          children: "#13066"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["fix: do not search full path executable by @feloy ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/13060",
          children: "#13060"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["fix: don't show table when there are no running container engines by @SoniaSandler ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/13051",
          children: "#13051"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["fix: increase timeout waiting kubeconfig creation by @feloy ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/13050",
          children: "#13050"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["fix(ContainerList): same named container group should have individual groups by @axel7083 ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/13002",
          children: "#13002"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["fix: change podman machine stream close function context by @SoniaSandler ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12982",
          children: "#12982"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["fix: make container or vm connection terminal responsive on start and restart by @SoniaSandler ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12981",
          children: "#12981"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["fix: test errors after migration to vitest v 3.2.x by @dgolovin ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12965",
          children: "#12965"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["fix: add better checks to detect Podman Desktop extension in dev mode by @benoitf ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12954",
          children: "#12954"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["fix: update docker compatibility link in compose onboarding by @SoniaSandler ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12923",
          children: "#12923"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["fix(patch): patched kubernetes/client-node package by @gastoner ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12919",
          children: "#12919"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["fix(frontend): group containers by groupId by @axel7083 ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12915",
          children: "#12915"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["fix: change separators for fine grained events by @feloy ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12914",
          children: "#12914"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["fix: display VM connections in status bar by @feloy ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12910",
          children: "#12910"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["fix: clean up electron-updater cache when it is not needed anymore by @dgolovin ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12870",
          children: "#12870"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["fix: dispatch resources counts events when context is offline by @feloy ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12834",
          children: "#12834"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["fix(frontend): container list table display race condition by @axel7083 ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12833",
          children: "#12833"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["fix: avoid to send status field when patching a resource by @benoitf ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12810",
          children: "#12810"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["fix: refresh providers when vm connections are registered/unregistered by @feloy ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12805",
          children: "#12805"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["fix: duplicate title on homepage by @statickidz ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12802",
          children: "#12802"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["fix: send container connection status to extension API listeners by @jeffmaury ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12794",
          children: "#12794"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["fix: remove mistakenly placed archive, update .gitignore by @odockal ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12793",
          children: "#12793"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["fix: remove full access to d-bus and add missing --talk-name options by @dgolovin ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12778",
          children: "#12778"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["fix: flaky test in BuildImageFromContainerfile.spec.ts by @dgolovin ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12777",
          children: "#12777"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["fix: logs filename has undefined extension by @jiridostal ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12774",
          children: "#12774"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["fix: minimize on startup plist for macOS by @cblecker ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12768",
          children: "#12768"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["fix: error during extension install overlaps with other components by @jiridostal ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12741",
          children: "#12741"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["fix: wrong text in component props sending wrong telemetry data by @MarsKubeX ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12737",
          children: "#12737"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["fix: wrong margin in the update available modal by @MarsKubeX ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12728",
          children: "#12728"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["fix: terminal prompt duplication after saved output restored by @dgolovin ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12725",
          children: "#12725"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["fix: clear caches for all resources when one informer is offline by @feloy ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12714",
          children: "#12714"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["fix: fine-grained configuration-changed by @feloy ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12700",
          children: "#12700"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["fix: uncaught exceptions in ContainerListCompose.spec.ts by @dgolovin ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12681",
          children: "#12681"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["fix: uncaught exceptions in ContainerList.spec.ts by @dgolovin ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12680",
          children: "#12680"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["fix: update static image link by @SoniaSandler ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12651",
          children: "#12651"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["fix: addressed uninstall version error for kubectl installed via onboard by @bmahabirbu ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12426",
          children: "#12426"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["fix: make image build cancellable by @dgolovin ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12261",
          children: "#12261"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["fix(ci): perform update of ubuntu packages earlier (backport #13177) by @mergify[bot] in ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/13181",
          children: "#13181"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["revert: 12870 (backport #13152) by @mergify[bot] in ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/13180",
          children: "#13180"
        })]
      }), "\n"]
    }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.h3, {
      id: "chore-",
      children: "chore ✅"
    }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.ul, {
      children: ["\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["chore: use aggregating way to report activateExtension event by @benoitf ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/13071",
          children: "#13071"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["chore: use the new aggregate method to track createProviders by @benoitf ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/13064",
          children: "#13064"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["chore: add an aggregate method for telemetry by @benoitf ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/13063",
          children: "#13063"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["chore: bring inversify bindings by @benoitf ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/13062",
          children: "#13062"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["chore(tray): update existing tray icons by @vancura ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/13057",
          children: "#13057"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["chore: add decorators/annotations for DI of inversify by @benoitf ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/13043",
          children: "#13043"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["chore: update storybook to v9 by @benoitf ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/13037",
          children: "#13037"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["chore: modified link to the community meeting recordings by @rujutashinde ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12997",
          children: "#12997"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["chore(deps-dev): switch to prettier 3.6.2 by @jeffmaury ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12995",
          children: "#12995"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["chore: move disposable group to API package by @benoitf ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12992",
          children: "#12992"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["chore: introduce inversify library by @benoitf ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12978",
          children: "#12978"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["chore: moved mockclear to beforeeach in containerList.spec.ts by @MarsKubeX ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12963",
          children: "#12963"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["chore: update podman to v5.5.2 by @benoitf ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12960",
          children: "#12960"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["chore: fix typo by @benoitf ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12955",
          children: "#12955"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["chore: allow to remove extension in dev mode without error by @benoitf ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12953",
          children: "#12953"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["chore: add color for devMode by @benoitf ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12942",
          children: "#12942"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["chore: set oneClick false and perMachine false in nsis by @cdrage ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12941",
          children: "#12941"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["chore: add devMode inside extension metadata by @benoitf ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12940",
          children: "#12940"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["chore(podman): remove promisify usage for ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.code, {
          children: "node:fs"
        }), " function by @axel7083 ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12906",
          children: "#12906"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["chore: removed svelte check warning by @MarsKubeX ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12892",
          children: "#12892"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["chore(core): remove unnecessary dns configuration by @axel7083 ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12891",
          children: "#12891"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["chore: upgrade biomejs to v2 by @benoitf ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12885",
          children: "#12885"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["chore: notify development folder instance when extension id is loaded/removed from extension loader by @benoitf ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12875",
          children: "#12875"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["chore: stop sending kubernetesExecIntoContainer event by @MarsKubeX ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12873",
          children: "#12873"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["chore: expose a method from extension loader: ensureExtensionIsEnabled by @benoitf ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12871",
          children: "#12871"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["chore(website): modified footer color for links in dark mode by @rujutashinde ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12860",
          children: "#12860"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["chore: fix the .github issue templates to add project ids by @rujutashinde ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12859",
          children: "#12859"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["chore(issue-template): adding 1.19.2 to bug_report.yml by @axel7083 ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12844",
          children: "#12844"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["chore: addProviderMenuItem - add provider if it does not exist by @cdrage ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12841",
          children: "#12841"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["chore: remove error prone metadata for k8 creation from YAML by @bmahabirbu ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12837",
          children: "#12837"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["chore: correctly type guard e.target for micromark listener by @cdrage ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12818",
          children: "#12818"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["chore: modified github templates for issues to add projects by @rujutashinde ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12796",
          children: "#12796"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["chore(e2e): change expected img num in stress test depending on OS by @danivilla9 ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12789",
          children: "#12789"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["chore: update podman to v5.5.1 by @benoitf ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12762",
          children: "#12762"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["chore: track all changes from the extension by @benoitf ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12743",
          children: "#12743"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["chore: remove notarize option from electron builder config by @odockal ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12719",
          children: "#12719"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["chore(e2e): add scrollintoviewifneeded to ui-stress-test by @danivilla9 ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12689",
          children: "#12689"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["chore(e2e): refactor extension-installation-smoke test case by @danivilla9 ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12665",
          children: "#12665"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["chore: update social networks links by @vancura ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12662",
          children: "#12662"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["chore: bump svelte to 5.28.3 by @feloy ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12650",
          children: "#12650"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["chore(workflows): set permission for publish-website-pr-cloudflare.yaml by @axel7083 ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12631",
          children: "#12631"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["chore(workflows): set permission for e2e-main.yaml by @axel7083 ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12630",
          children: "#12630"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["chore(workflows): set permission for e2e-kubernetes-main.yaml by @axel7083 ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12629",
          children: "#12629"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["chore(workflows): set permission for downloads-count.yaml by @axel7083 ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12625",
          children: "#12625"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["chore: add generate sbom job in release workflow by @SoniaSandler ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12603",
          children: "#12603"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["chore: update Flatpak banner by @Eonfge ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12594",
          children: "#12594"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["chore: send watch events only after we're starting the watch by @benoitf ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12590",
          children: "#12590"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["chore: add border with more contrast in the table component by @SoniaSandler ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12583",
          children: "#12583"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["chore: make the file items in preferences clearable by @SoniaSandler ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12473",
          children: "#12473"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["chore(deps): bump electron-builder to v26 by @axel7083 ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12351",
          children: "#12351"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["chore: remove no-explicit-any from dialogs by @cdrage ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/11480",
          children: "#11480"
        })]
      }), "\n"]
    }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.h3, {
      id: "refactor-️",
      children: "refactor 🛠️"
    }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.ul, {
      children: ["\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["refactor(mock): simplify how to call a method on a mock object by @benoitf ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/13072",
          children: "#13072"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["refactor: move message box interfaces to api package by @benoitf ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/13007",
          children: "#13007"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["refactor: extract status bar api to api package by @benoitf ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/13006",
          children: "#13006"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["refactor: move menu api to the API package by @benoitf ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/13005",
          children: "#13005"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["refactor: move interfaces of configuration to the api package by @benoitf ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12999",
          children: "#12999"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["refactor: move event to API side by @benoitf ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12996",
          children: "#12996"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["refactor(ui/table): replace filter#map#flat chain by reduce by @axel7083 ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12967",
          children: "#12967"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["refactor(podman): move podman-install.ts to proper folder by @axel7083 ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12936",
          children: "#12936"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["refactor(table): remove unnecessary binding by @axel7083 ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12934",
          children: "#12934"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["refactor(types): adding generics to Table by @axel7083 ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12933",
          children: "#12933"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["refactor(podman): extract PodmanInfo to dedicated file by @axel7083 ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12911",
          children: "#12911"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["refactor(core): move default protocol configuration to Main by @axel7083 ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12905",
          children: "#12905"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["refactor(podman): extract MacOSInstaller to a dedicated file by @axel7083 ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12904",
          children: "#12904"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["refactor(podman): extract ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.code, {
          children: "WinInstaller"
        }), " to a dedicated file by @axel7083 ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12899",
          children: "#12899"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["refactor(frontend): make ContainerGroupPartInfoUI id property non-nullable by @axel7083 ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12896",
          children: "#12896"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["refactor(podman): extract getBundledPodmanVersion interface to a file by @axel7083 ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12894",
          children: "#12894"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["refactor(podman): extract ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.code, {
          children: "Installer"
        }), " interface to dedicated file by @axel7083 ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12887",
          children: "#12887"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["refactor: move filesystem tree construct to backend by @feloy ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12872",
          children: "#12872"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["refactor(podman): extract BaseInstaller to a dedicated file by @axel7083 ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12811",
          children: "#12811"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["refactor(podman): extract WinBitCheck to dedicated file by @axel7083 ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12712",
          children: "#12712"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["refactor(podman): extract WinVersionCheck to a dedicated file by @axel7083 ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12705",
          children: "#12705"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["refactor(podman): extract WinMemoryCheck class to dedicated file by @axel7083 ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12702",
          children: "#12702"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["refactor(podman): extract WSL2Check class to dedicated file by @axel7083 ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12699",
          children: "#12699"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["refactor(ui): use new icon component in ui svelte lib by @gastoner ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12678",
          children: "#12678"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["refactor(extension/podman): extracting WSLVersionCheck by @axel7083 ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12664",
          children: "#12664"
        })]
      }), "\n"]
    }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.h3, {
      id: "test-",
      children: "test 🚦"
    }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.ul, {
      children: ["\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["chore(test): reset podman machine on failure by @cbr7 ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/13034",
          children: "#13034"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["chore(test): improve auth-utility playwright codebase by @odockal ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/13022",
          children: "#13022"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["chore(test): clean hanging podman machine in e2e test by @cbr7 ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/13019",
          children: "#13019"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["chore(test): create exception to check for update test by @cbr7 ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12993",
          children: "#12993"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["chore(test): navigation takes longer on cicd by @cbr7 ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12991",
          children: "#12991"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["chore(test): fix insufficient assert timeout by @cbr7 ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12977",
          children: "#12977"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["chore(test): add timeout param to method call by @cbr7 ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12966",
          children: "#12966"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["chore(test): throw error when needed for correct message by @cbr7 ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12964",
          children: "#12964"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["chore(test): get error thrown in case of failure by @cbr7 ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12961",
          children: "#12961"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["chore(test): wait for full page load before actions by @cbr7 ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12938",
          children: "#12938"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["chore(test): increase robustness in prune containers e2e test by @cbr7 ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12922",
          children: "#12922"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["chore(test): install ingress controller on Kind cluster only if needed by @amisskii ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12839",
          children: "#12839"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["chore(test): increase timeout for cicd by @cbr7 ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12787",
          children: "#12787"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["fix(tests): fix KubernetesTerminal flaky test by @dgolovin ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12780",
          children: "#12780"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["fix(tests): flaky Typeahead.spec.ts by @dgolovin ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12779",
          children: "#12779"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["chore(test): remove race promise by @cbr7 ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12752",
          children: "#12752"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["chore(test): share e2e tests authentication functionality by @odockal ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12704",
          children: "#12704"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["chore(test): use installed electron binary for external e2e tests by @odockal ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12688",
          children: "#12688"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["chore(test): add openshift docker e2e test by @cbr7 ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12676",
          children: "#12676"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["chore(test): Stabilize Kubernetes e2e tests on Windows CI by @amisskii ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12554",
          children: "#12554"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["test(e2e): push image into kubernetes cluster and reuse it with a pod by @danivilla9 ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12427",
          children: "#12427"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["chore(test): Add status bar provider tests by @xbabalov ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12352",
          children: "#12352"
        })]
      }), "\n"]
    }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.h3, {
      id: "docs-",
      children: "docs 📖"
    }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.ul, {
      children: ["\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["docs: updated procedural steps in the install in restricted environme… by @shipsing ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12949",
          children: "#12949"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["docs: updated the procedural steps based on latest changes by @shipsing ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12907",
          children: "#12907"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["docs: removed a blog that no longer works as expected by @shipsing ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12855",
          children: "#12855"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["docs(website): updated the tutorial section by @shipsing ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12763",
          children: "#12763"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["docs(website): added a procedure to manage a kube context by @shipsing ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12750",
          children: "#12750"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["docs(website): fixed a formatting issue by @shipsing ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12672",
          children: "#12672"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["docs(website): release note 1.19 by @axel7083 ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12602",
          children: "#12602"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["docs(website): added details to customize the UI on the discover PD page by @shipsing ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12575",
          children: "#12575"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["docs(website): add podman desktop core blog by @Firewall ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12497",
          children: "#12497"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["docs: add Podman AI Lab OpenVINO blog by @jeffmaury ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12496",
          children: "#12496"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["docs(windows): update uninstall instructions by @wngtk ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12349",
          children: "#12349"
        })]
      }), "\n"]
    }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.h3, {
      id: "ci-",
      children: "ci 🔁"
    }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.ul, {
      children: ["\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["ci: completely hide github button for argos by @cdrage ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12596",
          children: "#12596"
        })]
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

/***/ 17063
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   A: () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (__webpack_require__.p + "assets/images/edit-kubernetes-context-dark-139ecdb6d82a89d1f190fb0d39b78e35.png");

/***/ },

/***/ 18407
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   A: () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (__webpack_require__.p + "assets/images/edit-kubernetes-context-light-ba1b9ea4b8e453512a84e34a42bbcefa.png");

/***/ },

/***/ 33139
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   A: () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (__webpack_require__.p + "assets/images/search-extension-by-description-dark-6b29b1f2235976d9560ba3574ce4e3ad.png");

/***/ },

/***/ 14571
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   A: () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (__webpack_require__.p + "assets/images/search-extension-by-description-light-f8f9b233ce2d3c8f1df25a34caa74c84.png");

/***/ },

/***/ 8451
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   A: () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (__webpack_require__.p + "assets/images/start-all-containers-dark-1513b167b4b1bacbf742bb8848a772be.png");

/***/ },

/***/ 93115
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   A: () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (__webpack_require__.p + "assets/images/start-all-containers-light-17e06c7ef2667e42629cedcbcb4c2aae.png");

/***/ },

/***/ 1058
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   A: () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (__webpack_require__.p + "assets/images/update-provider-button-dark-3dffcfa3da25233cceec23dfee321f04.png");

/***/ },

/***/ 2188
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   A: () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (__webpack_require__.p + "assets/images/update-provider-button-light-5566016ddd2e688d38733de221904dbc.png");

/***/ },

/***/ 25484
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   A: () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (__webpack_require__.p + "assets/images/use-production-binary-to-develop-extensions-dark-ab87d4f8ef9368f969c93346d050072b.png");

/***/ },

/***/ 89414
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   A: () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (__webpack_require__.p + "assets/images/use-production-binary-to-develop-extensions-light-345979d8091ec5cfe86ac244bdfb4611.png");

/***/ },

/***/ 18991
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   A: () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (__webpack_require__.p + "assets/images/banner-39938dc47eb2502f5b67870f4c6e8731.png");

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

/***/ 91371
(module) {

module.exports = /*#__PURE__*/JSON.parse('{"permalink":"/blog/podman-desktop-release-1.20","source":"@site/blog/2025-07-07-release-1.20.mdx","title":"Podman Desktop 1.20 Release","description":"Podman Desktop 1.20 has been released!","date":"2025-07-07T00:00:00.000Z","tags":[{"inline":true,"label":"podman-desktop","permalink":"/blog/tags/podman-desktop"},{"inline":true,"label":"release","permalink":"/blog/tags/release"},{"inline":true,"label":"kubernetes","permalink":"/blog/tags/kubernetes"},{"inline":true,"label":"openshift","permalink":"/blog/tags/openshift"}],"readingTime":21.14,"hasTruncateMarker":false,"authors":[{"name":"Vladyslav Zhukovskyi","title":"Senior Software Engineer","url":"https://github.com/vzhukovs","imageURL":"https://github.com/vzhukovs.png","key":"vzhukovs","page":null}],"frontMatter":{"title":"Podman Desktop 1.20 Release","description":"Podman Desktop 1.20 has been released!","slug":"podman-desktop-release-1.20","authors":["vzhukovs"],"tags":["podman-desktop","release","kubernetes","openshift"],"hide_table_of_contents":false,"image":"/img/blog/podman-desktop-release-1.20/banner.png"},"unlisted":false,"prevItem":{"title":"Podman Desktop 1.21 Release","permalink":"/blog/podman-desktop-release-1.21"},"nextItem":{"title":"Containers and Kubernetes development with Podman Desktop","permalink":"/blog/2025/06/02/podman-desktop-core"}}');

/***/ }

}]);