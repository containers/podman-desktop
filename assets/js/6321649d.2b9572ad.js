"use strict";
(globalThis["webpackChunkdocs"] = globalThis["webpackChunkdocs"] || []).push([[78248],{

/***/ 35250
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   assets: () => (/* binding */ assets),
/* harmony export */   contentTitle: () => (/* binding */ contentTitle),
/* harmony export */   "default": () => (/* binding */ MDXContent),
/* harmony export */   frontMatter: () => (/* binding */ frontMatter),
/* harmony export */   metadata: () => (/* reexport default export from named module */ _site_docusaurus_docusaurus_plugin_content_blog_default_site_blog_2025_05_22_release_1_19_mdx_632_json__WEBPACK_IMPORTED_MODULE_0__),
/* harmony export */   toc: () => (/* binding */ toc)
/* harmony export */ });
/* harmony import */ var _site_docusaurus_docusaurus_plugin_content_blog_default_site_blog_2025_05_22_release_1_19_mdx_632_json__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(59039);
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(62540);
/* harmony import */ var _mdx_js_react__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(43023);
/* harmony import */ var _theme_ThemedImage__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(90448);


const frontMatter = {
	title: 'Podman Desktop 1.19 Release',
	description: 'Podman Desktop 1.19 has been released!',
	slug: 'podman-desktop-release-1.19',
	authors: [
		'axel7083'
	],
	tags: [
		'podman-desktop',
		'release',
		'kubernetes',
		'openshift'
	],
	hide_table_of_contents: false,
	image: '/img/blog/podman-desktop-release-1.19/banner.png'
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
  "value": "Podman v5.5",
  "id": "podman-v55",
  "level": 3
}, {
  "value": "Bootc Extension 🦭",
  "id": "bootc-extension-",
  "level": 3
}, {
  "value": "AI Lab ✨",
  "id": "ai-lab-",
  "level": 3
}, {
  "value": "OpenVINO",
  "id": "openvino",
  "level": 4
}, {
  "value": "llama-stack",
  "id": "llama-stack",
  "level": 4
}, {
  "value": "Model Context Protocol (MCP)",
  "id": "model-context-protocol-mcp",
  "level": 4
}, {
  "value": "Minc extension 📦",
  "id": "minc-extension-",
  "level": 3
}, {
  "value": "RHEL Lightspeed ⚡",
  "id": "rhel-lightspeed-",
  "level": 3
}, {
  "value": "RHEL VMs extension 🗃️",
  "id": "rhel-vms-extension-️",
  "level": 3
}, {
  "value": "RHEL 10 availability 🚢",
  "id": "rhel-10-availability-",
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
  "value": "docs 📖",
  "id": "docs-",
  "level": 3
}, {
  "value": "test 🚦",
  "id": "test-",
  "level": 3
}, {
  "value": "feature 💡",
  "id": "feature-",
  "level": 3
}];
function _createMdxContent(props) {
  const _components = {
    a: "a",
    admonition: "admonition",
    blockquote: "blockquote",
    code: "code",
    em: "em",
    h2: "h2",
    h3: "h3",
    h4: "h4",
    hr: "hr",
    img: "img",
    li: "li",
    ol: "ol",
    p: "p",
    section: "section",
    strong: "strong",
    sup: "sup",
    ul: "ul",
    ...(0,_mdx_js_react__WEBPACK_IMPORTED_MODULE_2__/* .useMDXComponents */ .R)(),
    ...props.components
  };
  return (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.Fragment, {
    children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.p, {
      children: "Podman Desktop 1.19 Release! 🎉"
    }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.p, {
      children: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.img, {
        alt: "podman-desktop-hero-1.19",
        src: (__webpack_require__(22091)/* ["default"] */ .A) + "",
        width: "1216",
        height: "832"
      })
    }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.p, {
      children: ["Podman Desktop 1.19 is now available. ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
        href: "/downloads",
        children: "Click here to download it"
      }), "!"]
    }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.p, {
      children: "This release brings exciting new features and improvements, including many extension updates:"
    }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.ul, {
      children: ["\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.strong, {
          children: "Podman v5.5"
        }), ": The Podman executable shipped with Podman Desktop has been updated to its latest version."]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.strong, {
          children: "Bootc Extension 1.9"
        }), ": Test and experiment with Bootable Container directly from the extension."]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.strong, {
          children: "AI Lab 1.7.2"
        }), ": New inference runtime, llama-stack implementation, and Model Context Protocol (MCP)."]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.strong, {
          children: "Minc extension"
        }), ": Podman Desktop extension to deploy MicroShift as container."]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.strong, {
          children: "RHEL lightspeed extension"
        }), ": Extension to get assistance using RHEL Lightspeed."]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.strong, {
          children: "RHEL VMs extension"
        }), ": The RHEL VMs extension helps the user run RHEL Virtual machines."]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.strong, {
          children: "Availability on RHEL 10"
        }), ": Podman Desktop is now directly available on RHEL 10."]
      }), "\n"]
    }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.h2, {
      id: "release-details-",
      children: "Release details 🔍"
    }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.h3, {
      id: "podman-v55",
      children: "Podman v5.5"
    }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.p, {
      children: "Podman Desktop aims to work offline, so it ships alongside its binary, the Podman executable.\nIn this release, the latest Podman 5.5 version provides new features, bug fixes, and better stability while using the tool."
    }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.p, {
      children: ["You can find the full changelog of Podman 5.5 on their release page ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
        href: "https://github.com/podman-container-tools/podman/releases/tag/v5.5.0",
        children: "podman-container-tools/podman/releases#v5.5.0"
      }), "."]
    }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.admonition, {
      type: "info",
      children: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.p, {
        children: "While the Podman binary is updated in this release, the existing Podman machines will remain at the version in which they were created. To update your Podman machine, you must remove it and initialize a new one."
      })
    }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.h3, {
      id: "bootc-extension-",
      children: "Bootc Extension 🦭"
    }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.p, {
      children: ["The Podman Desktop Boot container extension (aka Bootc) has recently seen significant improvements; one of them is the usage of ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
        href: "https://github.com/crc-org/macadam",
        children: "macadam"
      }), "."]
    }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.blockquote, {
      children: ["\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.p, {
        children: "Macadam is a cross-platform command-line tool to create and manage virtual machines. It runs on Windows, macOS, and Linux, and uses each OS's native virtualization stacks: WSL2 on Windows, Apple’s Virtualization Framework on macOS, and QEMU on Linux. Macadam reuses Podman machine code."
      }), "\n"]
    }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.p, {
      children: "As the bootc tool applies a container image as an update to an already running Linux system, allowing the output to boot an entire OS with the container image included. To test the bootc artifact, you either need a dedicated machine or create a virtual machine from the artifact."
    }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.p, {
      children: "To simplify the developer experience of testing the artifact,\nthe Podman Desktop Bootc extension offers you a way to directly create a virtual machine from the artifact you created."
    }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_theme_ThemedImage__WEBPACK_IMPORTED_MODULE_3__/* ["default"] */ .A, {
      alt: "Bootc extension create virtual machine",
      sources: {
        light: (__webpack_require__(57442)/* ["default"] */ .A),
        dark: (__webpack_require__(18592)/* ["default"] */ .A)
      }
    }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)("br", {}), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.admonition, {
      type: "note",
      children: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.p, {
        children: ["There is a known issue with the virtualization that can be found in the ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/extension-bootc?tab=readme-ov-file#known-issues",
          children: "bootc extension readme"
        }), "."]
      })
    }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.p, {
      children: ["Another important aspect of presenting a new technology is showcasing its capabilities. Thanks to ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
        href: "https://github.com/cdrage",
        children: "Charlie Drage"
      }), " and ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
        href: "https://github.com/deboer-tim",
        children: "Tim deBoer"
      }), ", a lot of effort has been put into demonstrating bootable containers, such as kernel module management, WiFi modules, systemd unit files, and others."]
    }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.p, {
      children: ["You can find ready-to-use examples on the ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.strong, {
        children: "Bootable Containers > Examples"
      }), " page."]
    }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_theme_ThemedImage__WEBPACK_IMPORTED_MODULE_3__/* ["default"] */ .A, {
      alt: "Bootc extension examples page",
      sources: {
        light: (__webpack_require__(61693)/* ["default"] */ .A),
        dark: (__webpack_require__(61861)/* ["default"] */ .A)
      }
    }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.h3, {
      id: "ai-lab-",
      children: "AI Lab ✨"
    }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.p, {
      children: ["The Podman Desktop AI Lab extension started as an experiment in 2024, exploring how AI workflows could be containerized,\ncelebrating more than one year of updates and progress, the extension has grown to support a wide range of tools,\nsuch as Instructlab", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.sup, {
        children: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "#user-content-fn-64-0ac473",
          id: "user-content-fnref-64-0ac473",
          "data-footnote-ref": true,
          "aria-describedby": "footnote-label",
          children: "1"
        })
      }), ", llamaCPP", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.sup, {
        children: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "#user-content-fn-65-0ac473",
          id: "user-content-fnref-65-0ac473",
          "data-footnote-ref": true,
          "aria-describedby": "footnote-label",
          children: "2"
        })
      }), ", WhisperCPP", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.sup, {
        children: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "#user-content-fn-69-0ac473",
          id: "user-content-fnref-69-0ac473",
          "data-footnote-ref": true,
          "aria-describedby": "footnote-label",
          children: "3"
        })
      }), " and with the latest release OpenVINO, llama-stack and MCP."]
    }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.h4, {
      id: "openvino",
      children: "OpenVINO"
    }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.p, {
      children: ["With the introduction of OpenVINO", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.sup, {
        children: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "#user-content-fn-67-0ac473",
          id: "user-content-fnref-67-0ac473",
          "data-footnote-ref": true,
          "aria-describedby": "footnote-label",
          children: "4"
        })
      }), " as a supported inference runtime, you can now run OpenVINO models", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.sup, {
        children: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "#user-content-fn-68-0ac473",
          id: "user-content-fnref-68-0ac473",
          "data-footnote-ref": true,
          "aria-describedby": "footnote-label",
          children: "5"
        })
      }), " locally through Podman."]
    }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_theme_ThemedImage__WEBPACK_IMPORTED_MODULE_3__/* ["default"] */ .A, {
      alt: "AI Lab OpenVINO inference provider",
      sources: {
        light: (__webpack_require__(61879)/* ["default"] */ .A),
        dark: (__webpack_require__(66295)/* ["default"] */ .A)
      }
    }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.h4, {
      id: "llama-stack",
      children: "llama-stack"
    }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.p, {
      children: ["Llama Stack standardizes the core building blocks that simplify AI application development", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.sup, {
        children: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "#user-content-fn-71-0ac473",
          id: "user-content-fnref-71-0ac473",
          "data-footnote-ref": true,
          "aria-describedby": "footnote-label",
          children: "6"
        })
      }), "."]
    }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.p, {
      children: "With the latest version of AI Lab, we introduce support for Llama Stack, running in a containerized environment. Inference servers running inside AI Lab will be registered to the Llama Server to be used by their clients."
    }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_theme_ThemedImage__WEBPACK_IMPORTED_MODULE_3__/* ["default"] */ .A, {
      alt: "AI Lab llama-stack page",
      sources: {
        light: (__webpack_require__(75)/* ["default"] */ .A),
        dark: (__webpack_require__(16627)/* ["default"] */ .A)
      }
    }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.h4, {
      id: "model-context-protocol-mcp",
      children: "Model Context Protocol (MCP)"
    }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.p, {
      children: "Creating a product from LLMs has proven challenging, and emerging protocols are trying to help, such as MCP."
    }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.blockquote, {
      children: ["\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.p, {
        children: ["MCP is an open protocol that standardizes how applications provide context to LLMs.", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.sup, {
          children: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
            href: "#user-content-fn-70-0ac473",
            id: "user-content-fnref-70-0ac473",
            "data-footnote-ref": true,
            "aria-describedby": "footnote-label",
            children: "7"
          })
        })]
      }), "\n"]
    }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.p, {
      children: "The initial steps to support MCP in the AI Lab playground have begun, enabling developers to experiment directly through the GUI before trying to integrate it into their applications."
    }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_theme_ThemedImage__WEBPACK_IMPORTED_MODULE_3__/* ["default"] */ .A, {
      alt: "AI Lab MCP in playground",
      sources: {
        light: (__webpack_require__(93971)/* ["default"] */ .A),
        dark: (__webpack_require__(38475)/* ["default"] */ .A)
      }
    }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.h3, {
      id: "minc-extension-",
      children: "Minc extension 📦"
    }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.p, {
      children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
        href: "https://github.com/openshift/microshift",
        children: "MicroShift"
      }), " is a project that optimizes OpenShift Kubernetes for small form factors and edge computing", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.sup, {
        children: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "#user-content-fn-66-0ac473",
          id: "user-content-fnref-66-0ac473",
          "data-footnote-ref": true,
          "aria-describedby": "footnote-label",
          children: "8"
        })
      }), ". Similar to ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
        href: "/docs/kind",
        children: "Kind"
      }), " and ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
        href: "/docs/minikube",
        children: "Minikube"
      }), ", an extension for creating and managing MicroShift clusters locally through Podman has been created."]
    }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.p, {
      children: ["You can learn more about it in the ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
        href: "/docs/openshift/microshift",
        children: "MicroShift"
      }), " section."]
    }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.admonition, {
      type: "tip",
      children: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.p, {
        children: ["Interested in bootable containers and MicroShift? You can refer to the blog post titled ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "/blog/2024/11/08/bootc-microshift",
          children: "Creating a MicroShift Bootable Image with Podman Desktop"
        }), "."]
      })
    }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.h3, {
      id: "rhel-lightspeed-",
      children: "RHEL Lightspeed ⚡"
    }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.p, {
      children: ["Red Hat Lightspeed is a generative AI assistant integrated into Red Hat's hybrid cloud platforms, such as OpenShift and Enterprise Linux.", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.sup, {
        children: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "#user-content-fn-100-0ac473",
          id: "user-content-fnref-100-0ac473",
          "data-footnote-ref": true,
          "aria-describedby": "footnote-label",
          children: "9"
        })
      }), "\nIt provides natural language guidance within the console to simplify complex tasks, enhance productivity, and bridge IT skills gaps."]
    }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.p, {
      children: "Users can choose from various AI models, including OpenAI, Azure OpenAI, WatsonX, or deploy private models on Red Hat platforms."
    }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.p, {
      children: "With a Red Hat subscription, you can experiment with Red Hat Lightspeed from anywhere, including Podman Desktop, through a new extension called RHEL Lightspeed."
    }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.p, {
      children: ["You can install the extension directly by navigating to the ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.strong, {
        children: "Extensions > Catalog"
      }), " page and clicking its ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.strong, {
        children: "Install"
      }), " icon."]
    }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_theme_ThemedImage__WEBPACK_IMPORTED_MODULE_3__/* ["default"] */ .A, {
      alt: "RHEL lightspeed chatbot",
      sources: {
        light: (__webpack_require__(94897)/* ["default"] */ .A),
        dark: (__webpack_require__(92193)/* ["default"] */ .A)
      }
    }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)("br", {}), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.admonition, {
      type: "note",
      children: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.ul, {
        children: ["\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
          children: ["If you are facing any authentication issues, ensure to use the ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
            href: "https://github.com/redhat-developer/podman-desktop-redhat-account-ext",
            children: "Red Hat Authentication"
          }), " extension."]
        }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
          children: ["As this new extension just landed in the Podman Desktop extension catalog, you may share your feedback in the extension repository ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
            href: "https://github.com/redhat-developer/podman-desktop-redhat-lightspeed-ext",
            children: "redhat-developer/podman-desktop-redhat-lightspeed-ext"
          }), "."]
        }), "\n"]
      })
    }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.h3, {
      id: "rhel-vms-extension-️",
      children: "RHEL VMs extension 🗃️"
    }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.p, {
      children: "Through the Podman executable, Podman Desktop manages virtual machines; the cross-platform code responsible for this has been reused to create the macadam tool mentioned earlier."
    }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.p, {
      children: "The RHEL VMs extension helps the user run RHEL virtual machines using the macadam tool."
    }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_theme_ThemedImage__WEBPACK_IMPORTED_MODULE_3__/* ["default"] */ .A, {
      alt: "RHEL VM create",
      sources: {
        light: (__webpack_require__(6622)/* ["default"] */ .A),
        dark: (__webpack_require__(77364)/* ["default"] */ .A)
      }
    }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)("br", {}), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.admonition, {
      type: "note",
      children: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.p, {
        children: ["On macOS and Linux, you need to manually install the Macadam binary. See ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/redhat-developer/podman-desktop-rhel-ext?tab=readme-ov-file#pre-requisites",
          children: "pre-requisites"
        }), " for more details."]
      })
    }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.h3, {
      id: "rhel-10-availability-",
      children: "RHEL 10 availability 🚢"
    }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.p, {
      children: ["The Podman Desktop you love - ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.em, {
        children: "simplified container management and intuitive UI"
      }), " - now extends to RHEL workflows.\nFor users on RHEL systems, explore the extension channel to install Podman Desktop. You'll get a familiar experience across Windows, Mac and now RHEL. Releases are happening at the same time as other platforms, so you'll get instant access to new features."]
    }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.p, {
      children: ["Find more details about ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
        href: "https://podman-desktop.io/docs/installation/linux-install/install-on-rhel10",
        children: "Installing Podman Desktop on RHEL 10"
      }), "."]
    }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.hr, {}), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.h2, {
      id: "community-thank-you",
      children: "Community thank you"
    }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.p, {
      children: "🎉 We’d like to say a big thank you to everyone who helped to make Podman Desktop even better. In this\nrelease, we received pull requests from the following people:"
    }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.ul, {
      children: ["\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/MarsKubeX",
          children: "MarsKubeX"
        }), " in ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12573",
          children: "fix: changed wrong link to docker compatibility documentation"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/DIGIX666",
          children: "DIGIX666"
        }), " in ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12286",
          children: "feat: download linux binary on the docs"
        })]
      }), "\n"]
    }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.hr, {}), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.h2, {
      id: "final-notes",
      children: "Final notes"
    }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.p, {
      children: ["The complete list of issues fixed in this release is available ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
        href: "https://github.com/containers/podman-desktop/issues?q=is%3Aclosed+milestone%3A1.19.0",
        children: "here"
      }), " and ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
        href: "https://github.com/containers/podman-desktop/issues?q=is%3Aclosed+milestone%3A1.19.0",
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
      id: "fix-",
      children: "fix 🔨"
    }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.ul, {
      children: ["\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["fix(workflow): release permission by @axel7083 ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12585",
          children: "#12585"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["fix(NumberInput): increment button position by @axel7083 ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12578",
          children: "#12578"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["fix: changed wrong link to docker compatibility documentation by @MarsKubeX ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12573",
          children: "#12573"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["fix: remove unused breadcrumbTitle from Page and related components by @feloy ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12559",
          children: "#12559"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["fix: changed props interface defintion to be exported in TestComplexT… by @MarsKubeX ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12547",
          children: "#12547"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["fix(website): updated sizes of headings in kubernetes section by @gastoner ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12521",
          children: "#12521"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["fix(website): updated icon sizes in kubernetes section by @gastoner ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12520",
          children: "#12520"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["fix: use default colours for the terminal output by @vzhukovs ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12494",
          children: "#12494"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["fix(website): unified sizes of icons by @gastoner ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12484",
          children: "#12484"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["fix: migrate Input, NumberInput and SearchInput to svelte v5 by @dgolovin ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12475",
          children: "#12475"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["fix: use default padding for markdown buttons by @vzhukovs ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12451",
          children: "#12451"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["fix(container-connection): display terminal tab when shell access is available by @axel7083 ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12417",
          children: "#12417"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["fix(webview-api): missing repository and provenance by @axel7083 ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12416",
          children: "#12416"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["fix: display VM status by @feloy ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12411",
          children: "#12411"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["fix: updated podman image path argument by @gastoner ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12388",
          children: "#12388"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["fix(electron-v36): gtk-version on linux by @axel7083 ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12360",
          children: "#12360"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["fix: introduce fontId property to ProviderImages interface by @dgolovin ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12357",
          children: "#12357"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["fix(electron-updater): disable differential download by @axel7083 ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12353",
          children: "#12353"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["fix(ci): fix Podman Desktop binary env. var. name in production e2e t… by @odockal ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12308",
          children: "#12308"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["fix: avoid cve in build tool by @benoitf ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12295",
          children: "#12295"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["fix(icons): update Props interfaces by @axel7083 ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12232",
          children: "#12232"
        })]
      }), "\n"]
    }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.h3, {
      id: "chore-",
      children: "chore ✅"
    }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.ul, {
      children: ["\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["chore: remove brew PR automation by @benoitf ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12563",
          children: "#12563"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["chore: use reset for mocking and use waitFor methods by @benoitf ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12560",
          children: "#12560"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["chore: adjust website light mode text color to be darker by @SoniaSandler ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12550",
          children: "#12550"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["chore: update flathub job by @benoitf ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12545",
          children: "#12545"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["chore(workflow): set permissions for release.yaml by @axel7083 ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12532",
          children: "#12532"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["chore(workflow): set permissions for daily-testing-build.yaml by @axel7083 ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12516",
          children: "#12516"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["chore: update the light mode text color to be darker in the home page by @SoniaSandler ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12503",
          children: "#12503"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["chore: remove old sections from home page by @SoniaSandler ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12502",
          children: "#12502"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["chore: rename preview into website preview by @benoitf ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12482",
          children: "#12482"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["chore: remove netlify deployment as now it's deployed to cloudflare by @benoitf ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12478",
          children: "#12478"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["chore: do not publish comment when publishing to cloudflare by @benoitf ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12477",
          children: "#12477"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["chore: remove unused imports from index page by @SoniaSandler ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12469",
          children: "#12469"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["chore: added footer markdown description to message box options by @gastoner ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12466",
          children: "#12466"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["chore(website): added option to specify link in read the docs button by @gastoner ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12464",
          children: "#12464"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["chore: remove unused ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.code, {
          children: "tools/*"
        }), " content by @axel7083 ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12456",
          children: "#12456"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["chore(next-build): define explicit permissions by @axel7083 ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12455",
          children: "#12455"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["chore(pr-check): define explicit permissions by @axel7083 ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12454",
          children: "#12454"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["chore: fix argos screenshots github button by @cdrage ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12453",
          children: "#12453"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["chore: publish to cloudflare (in addition to netlify) by @benoitf ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12433",
          children: "#12433"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["chore: fix github button, remove github link, add spacing. by @cdrage ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12429",
          children: "#12429"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["chore(workflow): update prerelease repository in ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.code, {
          children: "next-build.yaml"
        }), " by @axel7083 ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12414",
          children: "#12414"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["chore: update jsdom to 27.0.0-beta.1 by @benoitf ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12412",
          children: "#12412"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["chore: update podman to v5.5 by @gastoner ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12408",
          children: "#12408"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["chore(npm-registry): configure provenance for published packages by @axel7083 ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12398",
          children: "#12398"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["chore(e2e): fix skip on kind tests by @danivilla9 ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12397",
          children: "#12397"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["chore: indicate failure for error notification by @SoniaSandler ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12389",
          children: "#12389"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["chore: remove vale tooling by @benoitf ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12386",
          children: "#12386"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["chore: do not minify when deploying production site by @cdrage ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12369",
          children: "#12369"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["chore: clear build and cache folders before running website build by @cdrage ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12338",
          children: "#12338"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["chore: fix website warning + not building correctly. by @cdrage ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12337",
          children: "#12337"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["chore: do not run podman mac helper checks, or socket checks unless ready by @cdrage ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12331",
          children: "#12331"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["chore(website): updated kubernetes highlited features by @gastoner ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12305",
          children: "#12305"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["chore(website): updated container highlited features by @gastoner ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12304",
          children: "#12304"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["chore(website): added read the docs button by @gastoner ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12303",
          children: "#12303"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["chore: add FAQ section to the website by @SoniaSandler ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12300",
          children: "#12300"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["chore: refactor kube config secret columns by @deboer-tim ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12299",
          children: "#12299"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["chore: refactor kube deployment columns by @deboer-tim ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12298",
          children: "#12298"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["chore: refactor kube ingress route columns by @deboer-tim ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12297",
          children: "#12297"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["chore: add testimonials section to the website by @SoniaSandler ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12296",
          children: "#12296"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["chore: refactor kube pvc columns by @deboer-tim ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12294",
          children: "#12294"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["chore: refactor kube service columns by @deboer-tim ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12293",
          children: "#12293"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["chore: refactor kube nodes column by @deboer-tim ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12292",
          children: "#12292"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["chore(deps-dev): udate to jsdom v26.1.0 by @benoitf ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12291",
          children: "#12291"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["chore: refactor kube cronjob columns by @deboer-tim ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12290",
          children: "#12290"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["chore: refactor kube job columns by @deboer-tim ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12289",
          children: "#12289"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["chore: use props in kube columns by @deboer-tim ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12288",
          children: "#12288"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["chore: generate linux tgz for Arm64 by @benoitf ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12282",
          children: "#12282"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["chore: add more features section to the website by @SoniaSandler ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12276",
          children: "#12276"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["chore: update description of docker third party tool by @bmahabirbu ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12265",
          children: "#12265"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["chore: add blog post for minc extension by @benoitf ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12260",
          children: "#12260"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["chore(website): added highlited label by @gastoner ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12249",
          children: "#12249"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["chore: clean up kubernetes status columns by @deboer-tim ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12241",
          children: "#12241"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["chore: shared kubernetes status column by @deboer-tim ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12230",
          children: "#12230"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["chore: website - update homepage screenshot by @cdrage ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12224",
          children: "#12224"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["chore(vitest): enable default reporter on CI by @axel7083 ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12209",
          children: "#12209"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["chore: migrate empty screen to svelte 5 by @deboer-tim ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12194",
          children: "#12194"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["chore: update contributing guide to use lint-staged by @deboer-tim ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12193",
          children: "#12193"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["chore: use duration for image age column by @deboer-tim ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12177",
          children: "#12177"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["chore: use duration column for volume age by @deboer-tim ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12175",
          children: "#12175"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["chore: image and manifest details navigation by @deboer-tim ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12170",
          children: "#12170"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["chore: website - add custom github stars button by @cdrage ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12146",
          children: "#12146"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["chore: website - add cncf community banner to front page by @cdrage ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12119",
          children: "#12119"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["chore: changed naming of age column in container table by @gastoner ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12083",
          children: "#12083"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["chore: migrate dropdown menu to svelte 5 by @cdrage ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12067",
          children: "#12067"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["chore: migration of checkbox to svelte 5 by @bmahabirbu ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12055",
          children: "#12055"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["chore: added selected option if dropdown was selected by @gastoner ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/11991",
          children: "#11991"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["chore: adds openExternal command to registered commands by @gastoner ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/11990",
          children: "#11990"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["chore: added overflow visible property to modal component by @gastoner ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/11988",
          children: "#11988"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["chore: introduced micromark button image with command argument by @gastoner ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/11986",
          children: "#11986"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["chore: remove no-explicit-any lib/container by @cdrage ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/11477",
          children: "#11477"
        })]
      }), "\n"]
    }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.h3, {
      id: "refactor-️",
      children: "refactor 🛠️"
    }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.ul, {
      children: ["\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["refactor: port Page to svelte5 by @feloy ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12561",
          children: "#12561"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["refactor: port NavPage to svelte5 by @feloy ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12555",
          children: "#12555"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["refactor(ui): migrate DurationColumn to svelte5 by @axel7083 ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12284",
          children: "#12284"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["refactor(ui): migrate SimpleColumn to svelte5 by @axel7083 ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12283",
          children: "#12283"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["refactor(StatusIcon): port forward replace Snippet with Component by @axel7083 ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12228",
          children: "#12228"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["refactor: moved registering commands to common file by @gastoner ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12207",
          children: "#12207"
        })]
      }), "\n"]
    }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.h3, {
      id: "docs-",
      children: "docs 📖"
    }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.ul, {
      children: ["\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["docs(website): added a procedure to install Podman Desktop on RHEL10 by @shipsing ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12531",
          children: "#12531"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["docs(website): documenting microshift cluster creation with the minc … by @shipsing ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12406",
          children: "#12406"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["docs(website): updated the AI lab documentation by @shipsing ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12384",
          children: "#12384"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["docs(podman): adding windows instructions by @axel7083 ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12355",
          children: "#12355"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["docs(ai-lab): fix typo in index by @trya2l ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12345",
          children: "#12345"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["docs(website): update the Kubernetes section by @shipsing ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12306",
          children: "#12306"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["docs: add vscode blogpost by @Firewall ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12258",
          children: "#12258"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["docs(website): added a troubleshooting section by @shipsing ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12247",
          children: "#12247"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["docs(website): removed an outdated screenshot from the troubleshootin… by @shipsing ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12244",
          children: "#12244"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["docs: add 1.18 release notes by @SoniaSandler ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12226",
          children: "#12226"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["docs(website): moved the compose blog to the tutorial section by @shipsing ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12157",
          children: "#12157"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["docs(website): updated the docker compatibility section based on late… by @shipsing ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/11803",
          children: "#11803"
        })]
      }), "\n"]
    }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.h3, {
      id: "test-",
      children: "test 🚦"
    }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.ul, {
      children: ["\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["chore(test): create podman machine using env var settings by @cbr7 ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12480",
          children: "#12480"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["chore(test): parameterize runner close timeout by @amisskii ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12470",
          children: "#12470"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["chore(test): accept degraded state as valid by @cbr7 ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12407",
          children: "#12407"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["chore(test): wait for extension to be deleted by @cbr7 ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12396",
          children: "#12396"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["chore(test): increase timeout for pushing image to kind cluster by @amisskii ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12394",
          children: "#12394"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["chore(test): wait for button and ensure button press by @cbr7 ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12385",
          children: "#12385"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["chore(test): don't create machine on linux by @cbr7 ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12342",
          children: "#12342"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["chore(test): volume e2e test wait for navigation to complete by @cbr7 ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12339",
          children: "#12339"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["chore(test): fix some flakyness in image e2e test suite by @cbr7 ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12336",
          children: "#12336"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["chore(test): skip test suite until bug is fixed by @cbr7 ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12335",
          children: "#12335"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["chore(test): ensure default podman machine is restarted at the end of test suite by @cbr7 ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12326",
          children: "#12326"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["chore(test): update handling for error message by @cbr7 ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12324",
          children: "#12324"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["chore(test): now asserting on correct element by @cbr7 ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12323",
          children: "#12323"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["chore(test): try to create and start machine before waiting by @cbr7 ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12322",
          children: "#12322"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["chore(test): moving to polling assert for better handling by @cbr7 ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12320",
          children: "#12320"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["chore(test): update running providers assertion in troubleshooting by @odockal ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12314",
          children: "#12314"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["chore(test): fix some tests that were failing when other tests failed by @cbr7 ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12313",
          children: "#12313"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["chore(test): fix flaky behaviours in e2e tests by @cbr7 ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12310",
          children: "#12310"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["chore(test): new get extension version method by @amisskii ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12248",
          children: "#12248"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["fix(tests): do not manually render svelte snippets by @axel7083 ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12208",
          children: "#12208"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["chore(test): parametrize rootless resource machine test for all machine types by @xbabalov ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/11954",
          children: "#11954"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["chore(test): add ARIA labels to Check tab content on Image details page by @rostalan ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/11811",
          children: "#11811"
        })]
      }), "\n"]
    }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.h3, {
      id: "feature-",
      children: "feature 💡"
    }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.ul, {
      children: ["\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["feat: added duplicating of contexts by @gastoner ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12463",
          children: "#12463"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["feat: added new footer markdown property to message box by @gastoner ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12432",
          children: "#12432"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["feat: added editing of contexts by @gastoner ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12415",
          children: "#12415"
        })]
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
        children: ["feat: download linux binary on the docs by @DIGIX666 ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
          href: "https://github.com/podman-desktop/podman-desktop/pull/12286",
          children: "#12286"
        })]
      }), "\n"]
    }), "\n", "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.section, {
      "data-footnotes": true,
      className: "footnotes",
      children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.h2, {
        className: "sr-only",
        id: "footnote-label",
        children: "Footnotes"
      }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.ol, {
        children: ["\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
          id: "user-content-fn-64-0ac473",
          children: ["\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.p, {
            children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
              href: "https://instructlab.ai/",
              children: "https://instructlab.ai/"
            }), " ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
              href: "#user-content-fnref-64-0ac473",
              "data-footnote-backref": "",
              "aria-label": "Back to reference 1",
              className: "data-footnote-backref",
              children: "↩"
            })]
          }), "\n"]
        }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
          id: "user-content-fn-65-0ac473",
          children: ["\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.p, {
            children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
              href: "https://github.com/ggml-org/llama.cpp",
              children: "https://github.com/ggml-org/llama.cpp"
            }), " ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
              href: "#user-content-fnref-65-0ac473",
              "data-footnote-backref": "",
              "aria-label": "Back to reference 2",
              className: "data-footnote-backref",
              children: "↩"
            })]
          }), "\n"]
        }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
          id: "user-content-fn-69-0ac473",
          children: ["\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.p, {
            children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
              href: "https://github.com/ggml-org/whisper.cpp",
              children: "https://github.com/ggml-org/whisper.cpp"
            }), " ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
              href: "#user-content-fnref-69-0ac473",
              "data-footnote-backref": "",
              "aria-label": "Back to reference 3",
              className: "data-footnote-backref",
              children: "↩"
            })]
          }), "\n"]
        }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
          id: "user-content-fn-67-0ac473",
          children: ["\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.p, {
            children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
              href: "https://github.com/openvinotoolkit/openvino",
              children: "https://github.com/openvinotoolkit/openvino"
            }), " ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
              href: "#user-content-fnref-67-0ac473",
              "data-footnote-backref": "",
              "aria-label": "Back to reference 4",
              className: "data-footnote-backref",
              children: "↩"
            })]
          }), "\n"]
        }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
          id: "user-content-fn-68-0ac473",
          children: ["\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.p, {
            children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
              href: "https://huggingface.co/OpenVINO",
              children: "https://huggingface.co/OpenVINO"
            }), " ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
              href: "#user-content-fnref-68-0ac473",
              "data-footnote-backref": "",
              "aria-label": "Back to reference 5",
              className: "data-footnote-backref",
              children: "↩"
            })]
          }), "\n"]
        }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
          id: "user-content-fn-71-0ac473",
          children: ["\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.p, {
            children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
              href: "https://github.com/meta-llama/llama-stack?tab=readme-ov-file#overview",
              children: "https://github.com/meta-llama/llama-stack?tab=readme-ov-file#overview"
            }), " ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
              href: "#user-content-fnref-71-0ac473",
              "data-footnote-backref": "",
              "aria-label": "Back to reference 6",
              className: "data-footnote-backref",
              children: "↩"
            })]
          }), "\n"]
        }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
          id: "user-content-fn-70-0ac473",
          children: ["\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.p, {
            children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
              href: "https://modelcontextprotocol.io/introduction",
              children: "https://modelcontextprotocol.io/introduction"
            }), " ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
              href: "#user-content-fnref-70-0ac473",
              "data-footnote-backref": "",
              "aria-label": "Back to reference 7",
              className: "data-footnote-backref",
              children: "↩"
            })]
          }), "\n"]
        }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
          id: "user-content-fn-66-0ac473",
          children: ["\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.p, {
            children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
              href: "https://www.redhat.com/en/topics/edge-computing/microshift",
              children: "https://www.redhat.com/en/topics/edge-computing/microshift"
            }), " ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
              href: "#user-content-fnref-66-0ac473",
              "data-footnote-backref": "",
              "aria-label": "Back to reference 8",
              className: "data-footnote-backref",
              children: "↩"
            })]
          }), "\n"]
        }), "\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.li, {
          id: "user-content-fn-100-0ac473",
          children: ["\n", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components.p, {
            children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
              href: "https://www.redhat.com/en/about/press-releases/red-hat-announces-general-availability-red-hat-openshift-lightspeed-supercharge-hybrid-cloud-productivity-generative-ai",
              children: "Red Hat Announces General Availability of Red Hat OpenShift Lightspeed to Supercharge Hybrid Cloud Productivity with Generative AI"
            }), " ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components.a, {
              href: "#user-content-fnref-100-0ac473",
              "data-footnote-backref": "",
              "aria-label": "Back to reference 9",
              className: "data-footnote-backref",
              children: "↩"
            })]
          }), "\n"]
        }), "\n"]
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

/***/ 16627
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   A: () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (__webpack_require__.p + "assets/images/extension-ai-lab-llama-stack-dark-afcb5d388fb933b1f64031af21c06a9a.png");

/***/ },

/***/ 75
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   A: () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (__webpack_require__.p + "assets/images/extension-ai-lab-llama-stack-light-c06b219fcad503e03c40b386fdb970d8.png");

/***/ },

/***/ 38475
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   A: () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (__webpack_require__.p + "assets/images/extension-ai-lab-mcp-dark-c56865e82e7f254da26b5d10326af8dd.png");

/***/ },

/***/ 93971
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   A: () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (__webpack_require__.p + "assets/images/extension-ai-lab-mcp-light-5d43e7bf50fa745e7315e37d8a2d21d2.png");

/***/ },

/***/ 66295
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   A: () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (__webpack_require__.p + "assets/images/extension-ai-lab-openvino-dark-35162d6707bd681e0979df566487e0db.png");

/***/ },

/***/ 61879
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   A: () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (__webpack_require__.p + "assets/images/extension-ai-lab-openvino-light-067964c7fd2314199f653f71f82239d7.png");

/***/ },

/***/ 18592
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   A: () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (__webpack_require__.p + "assets/images/extension-bootc-create-vm-dark-248837d8ac5941451f16b8abdd5d8b80.png");

/***/ },

/***/ 57442
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   A: () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (__webpack_require__.p + "assets/images/extension-bootc-create-vm-light-600caa09a882eef160e97ce278f1753a.png");

/***/ },

/***/ 61861
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   A: () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (__webpack_require__.p + "assets/images/extension-bootc-examples-dark-1f8b0ba02ffd469de5cc7eeeb6cc624a.png");

/***/ },

/***/ 61693
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   A: () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (__webpack_require__.p + "assets/images/extension-bootc-examples-light-88929fdbce50582f4db287649bf6fee3.png");

/***/ },

/***/ 92193
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   A: () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (__webpack_require__.p + "assets/images/extension-lightspeed-dark-9a88e28c862edee60e627d8adbae528c.png");

/***/ },

/***/ 94897
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   A: () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (__webpack_require__.p + "assets/images/extension-lightspeed-light-4e5934bd56bed97b4e2585519d9c1184.png");

/***/ },

/***/ 77364
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   A: () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (__webpack_require__.p + "assets/images/extension-rhel-vm-create-dark-89559495a3b5ffa98e0a9e096691e74a.png");

/***/ },

/***/ 6622
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   A: () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (__webpack_require__.p + "assets/images/extension-rhel-vm-create-light-a7f88f83ca5d2a2aa77e00bdd5c190a3.png");

/***/ },

/***/ 22091
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   A: () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (__webpack_require__.p + "assets/images/banner-8ed4782fe7231fb9c7228176091f6665.png");

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

/***/ 59039
(module) {

module.exports = /*#__PURE__*/JSON.parse('{"permalink":"/blog/podman-desktop-release-1.19","source":"@site/blog/2025-05-22-release-1.19.mdx","title":"Podman Desktop 1.19 Release","description":"Podman Desktop 1.19 has been released!","date":"2025-05-22T00:00:00.000Z","tags":[{"inline":true,"label":"podman-desktop","permalink":"/blog/tags/podman-desktop"},{"inline":true,"label":"release","permalink":"/blog/tags/release"},{"inline":true,"label":"kubernetes","permalink":"/blog/tags/kubernetes"},{"inline":true,"label":"openshift","permalink":"/blog/tags/openshift"}],"readingTime":20.38,"hasTruncateMarker":false,"authors":[{"name":"Axel Stefanini","title":"Software Engineer","url":"https://github.com/axel7083","imageURL":"https://github.com/axel7083.png","key":"axel7083","page":null}],"frontMatter":{"title":"Podman Desktop 1.19 Release","description":"Podman Desktop 1.19 has been released!","slug":"podman-desktop-release-1.19","authors":["axel7083"],"tags":["podman-desktop","release","kubernetes","openshift"],"hide_table_of_contents":false,"image":"/img/blog/podman-desktop-release-1.19/banner.png"},"unlisted":false,"prevItem":{"title":"Containers and Kubernetes development with Podman Desktop","permalink":"/blog/2025/06/02/podman-desktop-core"},"nextItem":{"title":"Enabling OpenVINO Inference in Podman AI Lab","permalink":"/blog/2025/05/21/podman-ai-lab-openvino"}}');

/***/ }

}]);