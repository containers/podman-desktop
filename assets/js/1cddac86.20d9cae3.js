"use strict";
(globalThis["webpackChunkdocs"] = globalThis["webpackChunkdocs"] || []).push([[13241],{

/***/ 2509
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  assets: () => (/* binding */ assets),
  contentTitle: () => (/* binding */ contentTitle),
  "default": () => (/* binding */ MDXContent),
  frontMatter: () => (/* binding */ frontMatter),
  metadata: () => (/* reexport */ site_tutorial_managing_your_application_resources_mdx_1cd_namespaceObject),
  toc: () => (/* binding */ toc)
});

;// ./.docusaurus/docusaurus-plugin-content-docs/tutorial/site-tutorial-managing-your-application-resources-mdx-1cd.json
const site_tutorial_managing_your_application_resources_mdx_1cd_namespaceObject = /*#__PURE__*/JSON.parse('{"id":"managing-your-application-resources","title":"Managing your application resources","description":"Cover useful actions available to manage your application resources","source":"@site/tutorial/managing-your-application-resources.mdx","sourceDirName":".","slug":"/managing-your-application-resources","permalink":"/tutorial/managing-your-application-resources","draft":false,"unlisted":false,"tags":[{"inline":true,"label":"podman-desktop","permalink":"/tutorial/tags/podman-desktop"},{"inline":true,"label":"managing-resources","permalink":"/tutorial/tags/managing-resources"},{"inline":true,"label":"managing-kubernetes-resources","permalink":"/tutorial/tags/managing-kubernetes-resources"}],"version":"current","sidebarPosition":6,"frontMatter":{"sidebar_position":6,"title":"Managing your application resources","description":"Cover useful actions available to manage your application resources","keywords":["podman desktop","podman","pod","Containerfile","Dockerfile"],"tags":["podman-desktop","managing-resources","managing-kubernetes-resources"]},"sidebar":"defaultSidebar","previous":{"title":"Interacting with a database server","permalink":"/tutorial/interacting-with-a-database-server"},"next":{"title":"Running an AI application","permalink":"/tutorial/running-an-ai-application"}}');
// EXTERNAL MODULE: ../node_modules/react/jsx-runtime.js
var jsx_runtime = __webpack_require__(62540);
// EXTERNAL MODULE: ../node_modules/@mdx-js/react/lib/index.js
var lib = __webpack_require__(43023);
;// ./tutorial/managing-your-application-resources.mdx


const frontMatter = {
	sidebar_position: 6,
	title: 'Managing your application resources',
	description: 'Cover useful actions available to manage your application resources',
	keywords: [
		'podman desktop',
		'podman',
		'pod',
		'Containerfile',
		'Dockerfile'
	],
	tags: [
		'podman-desktop',
		'managing-resources',
		'managing-kubernetes-resources'
	]
};
const contentTitle = 'Managing your application resources';

const assets = {

};



const toc = [{
  "value": "Before you begin",
  "id": "before-you-begin",
  "level": 2
}, {
  "value": "Managing containers and pods",
  "id": "managing-containers-and-pods",
  "level": 2
}, {
  "value": "Managing images",
  "id": "managing-images",
  "level": 2
}, {
  "value": "Managing volumes",
  "id": "managing-volumes",
  "level": 2
}, {
  "value": "Managing Kubernetes objects",
  "id": "managing-kubernetes-objects",
  "level": 2
}, {
  "value": "Managing other resources",
  "id": "managing-other-resources",
  "level": 2
}, {
  "value": "Additional resources",
  "id": "additional-resources",
  "level": 2
}];
function _createMdxContent(props) {
  const _components = {
    a: "a",
    admonition: "admonition",
    code: "code",
    em: "em",
    h1: "h1",
    h2: "h2",
    header: "header",
    img: "img",
    li: "li",
    ol: "ol",
    p: "p",
    strong: "strong",
    ul: "ul",
    ...(0,lib/* useMDXComponents */.R)(),
    ...props.components
  };
  return (0,jsx_runtime.jsxs)(jsx_runtime.Fragment, {
    children: [(0,jsx_runtime.jsx)(_components.header, {
      children: (0,jsx_runtime.jsx)(_components.h1, {
        id: "managing-your-application-resources",
        children: "Managing your application resources"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "This tutorial covers the tasks that you can perform to manage the following resources visually:"
    }), "\n", (0,jsx_runtime.jsxs)(_components.ul, {
      children: ["\n", (0,jsx_runtime.jsx)(_components.li, {
        children: "Containers and pods"
      }), "\n", (0,jsx_runtime.jsx)(_components.li, {
        children: "Images"
      }), "\n", (0,jsx_runtime.jsx)(_components.li, {
        children: "Volumes"
      }), "\n", (0,jsx_runtime.jsx)(_components.li, {
        children: "Kubernetes objects"
      }), "\n", (0,jsx_runtime.jsx)(_components.li, {
        children: "Other resources, such as Podman machines, clusters, and CLI tools"
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Several useful actions are available in the UI to make resource management easy."
    }), "\n", (0,jsx_runtime.jsx)(_components.h2, {
      id: "before-you-begin",
      children: "Before you begin"
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Make sure you have:"
    }), "\n", (0,jsx_runtime.jsxs)(_components.ul, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: [(0,jsx_runtime.jsx)(_components.a, {
          href: "/docs/installation",
          children: "Installed Podman Desktop"
        }), "."]
      }), "\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: [(0,jsx_runtime.jsx)(_components.a, {
          href: "/docs/podman/creating-a-podman-machine",
          children: "A running Podman machine"
        }), "."]
      }), "\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: [(0,jsx_runtime.jsx)(_components.a, {
          href: "/docs/kubernetes/viewing-and-selecting-current-kubernetes-context",
          children: "A valid Kubernetes context and connection"
        }), " to manage Kubernetes resources."]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsx)(_components.h2, {
      id: "managing-containers-and-pods",
      children: "Managing containers and pods"
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Based on your needs, perform any of the following actions after navigating to the component page:"
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: (0,jsx_runtime.jsx)(_components.strong, {
        children: (0,jsx_runtime.jsx)(_components.em, {
          children: "Common actions for containers and pods"
        })
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: (0,jsx_runtime.jsx)(_components.img, {
        alt: "common actions",
        src: (__webpack_require__(95670)/* ["default"] */ .A) + "",
        width: "981",
        height: "362"
      })
    }), "\n", (0,jsx_runtime.jsxs)(_components.ol, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: ["\n", (0,jsx_runtime.jsx)(_components.p, {
          children: "Search a container or pod using the search box."
        }), "\n"]
      }), "\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
          children: ["Start a container or pod using the ", (0,jsx_runtime.jsx)(_components.strong, {
            children: "Start"
          }), " icon."]
        }), "\n"]
      }), "\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
          children: ["Stop a container or pod using the ", (0,jsx_runtime.jsx)(_components.strong, {
            children: "Stop"
          }), " icon."]
        }), "\n"]
      }), "\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
          children: ["Delete a container or pod using the ", (0,jsx_runtime.jsx)(_components.strong, {
            children: "Delete"
          }), " icon."]
        }), "\n", (0,jsx_runtime.jsx)(_components.admonition, {
          type: "note",
          children: (0,jsx_runtime.jsxs)(_components.ul, {
            children: ["\n", (0,jsx_runtime.jsx)(_components.li, {
              children: "You cannot delete a container if it is being used in any pods. In such cases, you must delete the pod and then delete the container."
            }), "\n"]
          })
        }), "\n"]
      }), "\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
          children: ["Bulk deletion: Select containers or pods and delete them by using the ", (0,jsx_runtime.jsx)(_components.strong, {
            children: "Delete"
          }), " button."]
        }), "\n"]
      }), "\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: ["\n", (0,jsx_runtime.jsx)(_components.p, {
          children: "Click the name of the container or pod to:"
        }), "\n", (0,jsx_runtime.jsxs)(_components.ul, {
          children: ["\n", (0,jsx_runtime.jsx)(_components.li, {
            children: "View its summary and logs."
          }), "\n", (0,jsx_runtime.jsx)(_components.li, {
            children: "View its kube configuration if the container or pod is a Kubernetes resource."
          }), "\n", (0,jsx_runtime.jsx)(_components.li, {
            children: "Interact with the container using a terminal"
          }), "\n"]
        }), "\n"]
      }), "\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: ["\n", (0,jsx_runtime.jsx)(_components.p, {
          children: "View containers or pods based on their status:"
        }), "\n", (0,jsx_runtime.jsxs)(_components.ul, {
          children: ["\n", (0,jsx_runtime.jsxs)(_components.li, {
            children: ["Select the ", (0,jsx_runtime.jsx)(_components.strong, {
              children: "Running"
            }), " tab to view all running containers or pods"]
          }), "\n", (0,jsx_runtime.jsxs)(_components.li, {
            children: ["Select the ", (0,jsx_runtime.jsx)(_components.strong, {
              children: "Stopped"
            }), " tab to view all stopped containers or pods"]
          }), "\n"]
        }), "\n"]
      }), "\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
          children: ["Use the ", (0,jsx_runtime.jsx)(_components.strong, {
            children: "Prune"
          }), " button to remove all unused containers or pods from the Podman engine."]
        }), "\n"]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: (0,jsx_runtime.jsx)(_components.strong, {
        children: (0,jsx_runtime.jsx)(_components.em, {
          children: "Container-specific actions"
        })
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: (0,jsx_runtime.jsx)(_components.img, {
        alt: "container actions",
        src: (__webpack_require__(25908)/* ["default"] */ .A) + "",
        width: "979",
        height: "261"
      })
    }), "\n", (0,jsx_runtime.jsxs)(_components.ol, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
          children: ["Use the ", (0,jsx_runtime.jsx)(_components.strong, {
            children: "Create"
          }), " button to create a container with a container or docker file or from an existing image."]
        }), "\n"]
      }), "\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
          children: ["Create a pod with selected containers using the ", (0,jsx_runtime.jsx)(_components.strong, {
            children: "Create Pod"
          }), " button."]
        }), "\n"]
      }), "\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: ["\n", (0,jsx_runtime.jsx)(_components.p, {
          children: "Use the overflow menu to:"
        }), "\n", (0,jsx_runtime.jsxs)(_components.ul, {
          children: ["\n", (0,jsx_runtime.jsx)(_components.li, {
            children: "Open and view logs."
          }), "\n", (0,jsx_runtime.jsxs)(_components.li, {
            children: [(0,jsx_runtime.jsx)(_components.em, {
              children: "Kubernetes action"
            }), ": Generate and view configuration for a Kubernetes container."]
          }), "\n", (0,jsx_runtime.jsxs)(_components.li, {
            children: [(0,jsx_runtime.jsx)(_components.em, {
              children: "Kubernetes action"
            }), ": Deploy a container to a Kubernetes cluster."]
          }), "\n", (0,jsx_runtime.jsxs)(_components.li, {
            children: [(0,jsx_runtime.jsx)(_components.em, {
              children: "Kubernetes action"
            }), ": Open a browser to check the cluster status."]
          }), "\n", (0,jsx_runtime.jsx)(_components.li, {
            children: "Open a terminal to interact with the container."
          }), "\n", (0,jsx_runtime.jsx)(_components.li, {
            children: "Restart your container."
          }), "\n", (0,jsx_runtime.jsx)(_components.li, {
            children: "Export a container to your local machine."
          }), "\n"]
        }), "\n"]
      }), "\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: ["\n", (0,jsx_runtime.jsx)(_components.p, {
          children: "Bulk start: Select multiple containers and run them in a single step."
        }), "\n", (0,jsx_runtime.jsx)(_components.admonition, {
          type: "note",
          children: (0,jsx_runtime.jsx)(_components.p, {
            children: "You might see varying options in the overflow menu based on status and configuration of the container."
          })
        }), "\n"]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: (0,jsx_runtime.jsx)(_components.strong, {
        children: (0,jsx_runtime.jsx)(_components.em, {
          children: "Pod-specific actions"
        })
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: (0,jsx_runtime.jsx)(_components.img, {
        alt: "pod actions",
        src: (__webpack_require__(98461)/* ["default"] */ .A) + "",
        width: "1982",
        height: "774"
      })
    }), "\n", (0,jsx_runtime.jsxs)(_components.ol, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
          children: ["View the status of each container by hovering over it in the ", (0,jsx_runtime.jsx)(_components.em, {
            children: "CONTAINERS"
          }), " column. The status can be ", (0,jsx_runtime.jsx)(_components.code, {
            children: "Running"
          }), ", ", (0,jsx_runtime.jsx)(_components.code, {
            children: "Created"
          }), ", ", (0,jsx_runtime.jsx)(_components.code, {
            children: "Exited"
          }), ", or ", (0,jsx_runtime.jsx)(_components.code, {
            children: "Waiting"
          }), "."]
        }), "\n"]
      }), "\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
          children: ["Create a Podman pod from a YAML configuration file using the ", (0,jsx_runtime.jsx)(_components.strong, {
            children: "Podman Kube Play"
          }), " button."]
        }), "\n", (0,jsx_runtime.jsx)(_components.admonition, {
          type: "note",
          children: (0,jsx_runtime.jsxs)(_components.p, {
            children: ["To create a Kubernetes pod, refer to the ", (0,jsx_runtime.jsx)(_components.a, {
              href: "/docs/kubernetes/applying-a-yaml-manifest",
              children: "Applying a YAML manifest"
            }), " section."]
          })
        }), "\n"]
      }), "\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: ["\n", (0,jsx_runtime.jsx)(_components.p, {
          children: "Use the overflow menu to:"
        }), "\n", (0,jsx_runtime.jsxs)(_components.ul, {
          children: ["\n", (0,jsx_runtime.jsxs)(_components.li, {
            children: [(0,jsx_runtime.jsx)(_components.em, {
              children: "Kubernetes action"
            }), ": Generate and view configuration for a Kubernetes pod."]
          }), "\n", (0,jsx_runtime.jsxs)(_components.li, {
            children: [(0,jsx_runtime.jsx)(_components.em, {
              children: "Kubernetes action"
            }), ": Deploy a pod to a Kubernetes cluster."]
          }), "\n", (0,jsx_runtime.jsx)(_components.li, {
            children: "Restart your pod."
          }), "\n"]
        }), "\n"]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsx)(_components.h2, {
      id: "managing-images",
      children: "Managing images"
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Perform any of the following actions after navigating to the component page:"
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: (0,jsx_runtime.jsx)(_components.img, {
        alt: "image actions",
        src: (__webpack_require__(64434)/* ["default"] */ .A) + "",
        width: "995",
        height: "268"
      })
    }), "\n", (0,jsx_runtime.jsxs)(_components.ol, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: ["\n", (0,jsx_runtime.jsx)(_components.p, {
          children: "Search an image using the search box."
        }), "\n"]
      }), "\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
          children: ["Create a container from the image using the ", (0,jsx_runtime.jsx)(_components.strong, {
            children: "Run"
          }), " icon."]
        }), "\n"]
      }), "\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
          children: ["Delete an image using the ", (0,jsx_runtime.jsx)(_components.strong, {
            children: "Delete"
          }), " icon."]
        }), "\n", (0,jsx_runtime.jsx)(_components.admonition, {
          type: "note",
          children: (0,jsx_runtime.jsxs)(_components.ul, {
            children: ["\n", (0,jsx_runtime.jsx)(_components.li, {
              children: "You cannot delete an image if it is being used in any containers. In such cases, you must delete the container and then delete the image."
            }), "\n", (0,jsx_runtime.jsx)(_components.li, {
              children: "By selecting multiple images, you can delete or save them in a single step."
            }), "\n"]
          })
        }), "\n"]
      }), "\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: ["\n", (0,jsx_runtime.jsx)(_components.p, {
          children: "Use the overflow menu to:"
        }), "\n", (0,jsx_runtime.jsxs)(_components.ul, {
          children: ["\n", (0,jsx_runtime.jsx)(_components.li, {
            children: "Push an image to a configured registry."
          }), "\n", (0,jsx_runtime.jsx)(_components.li, {
            children: "Edit the image name and tag."
          }), "\n", (0,jsx_runtime.jsx)(_components.li, {
            children: "View history to check the commands that created each layer of the image."
          }), "\n", (0,jsx_runtime.jsx)(_components.li, {
            children: "Save an image to your local machine."
          }), "\n", (0,jsx_runtime.jsx)(_components.li, {
            children: "Push an image to a cluster, such as a Kind or Developer Sandbox cluster."
          }), "\n"]
        }), "\n"]
      }), "\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: ["\n", (0,jsx_runtime.jsx)(_components.p, {
          children: "Access other useful actions:"
        }), "\n", (0,jsx_runtime.jsxs)(_components.ul, {
          children: ["\n", (0,jsx_runtime.jsxs)(_components.li, {
            children: ["Use the ", (0,jsx_runtime.jsx)(_components.strong, {
              children: "Prune"
            }), " button to remove all unused images from the Podman engine."]
          }), "\n", (0,jsx_runtime.jsx)(_components.li, {
            children: "Load images from a tar archive on your local machine."
          }), "\n", (0,jsx_runtime.jsx)(_components.li, {
            children: "Import images from your local machine into the Podman Desktop application."
          }), "\n", (0,jsx_runtime.jsx)(_components.li, {
            children: "Pull an image from a configured registry."
          }), "\n", (0,jsx_runtime.jsx)(_components.li, {
            children: "Build an image from a container or docker file."
          }), "\n"]
        }), "\n"]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsx)(_components.h2, {
      id: "managing-volumes",
      children: "Managing volumes"
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Perform any of the following actions after navigating to the component page:"
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: (0,jsx_runtime.jsx)(_components.img, {
        alt: "volume actions",
        src: (__webpack_require__(73215)/* ["default"] */ .A) + "",
        width: "998",
        height: "235"
      })
    }), "\n", (0,jsx_runtime.jsxs)(_components.ol, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: ["\n", (0,jsx_runtime.jsx)(_components.p, {
          children: "Search a volume using the search box."
        }), "\n"]
      }), "\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
          children: ["Use the ", (0,jsx_runtime.jsx)(_components.strong, {
            children: "Delete"
          }), " icon to delete a volume. You can also select multiple volumes and delete them in one step by using the delete button on the page."]
        }), "\n", (0,jsx_runtime.jsx)(_components.admonition, {
          type: "note",
          children: (0,jsx_runtime.jsxs)(_components.ul, {
            children: ["\n", (0,jsx_runtime.jsx)(_components.li, {
              children: "You cannot delete a volume if it is being used in any containers. In such cases, you must delete the container and then delete the volume."
            }), "\n", (0,jsx_runtime.jsx)(_components.li, {
              children: "By selecting multiple volumes, you can delete them in a single step."
            }), "\n"]
          })
        }), "\n"]
      }), "\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: ["\n", (0,jsx_runtime.jsx)(_components.p, {
          children: "Click the name of the volume to view its summary."
        }), "\n"]
      }), "\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: ["\n", (0,jsx_runtime.jsx)(_components.p, {
          children: "Access other useful actions:"
        }), "\n", (0,jsx_runtime.jsxs)(_components.ul, {
          children: ["\n", (0,jsx_runtime.jsxs)(_components.li, {
            children: ["Use the ", (0,jsx_runtime.jsx)(_components.strong, {
              children: "Prune"
            }), " button to remove unused volumes from the Podman engine."]
          }), "\n", (0,jsx_runtime.jsxs)(_components.li, {
            children: ["Click ", (0,jsx_runtime.jsx)(_components.strong, {
              children: "Gather volume sizes"
            }), " to determine the size used for volumes."]
          }), "\n", (0,jsx_runtime.jsxs)(_components.li, {
            children: ["Click the ", (0,jsx_runtime.jsx)(_components.strong, {
              children: "Create"
            }), " button to create a volume."]
          }), "\n"]
        }), "\n"]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsx)(_components.h2, {
      id: "managing-kubernetes-objects",
      children: "Managing Kubernetes objects"
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Perform any of the following actions after navigating to the component page:"
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: (0,jsx_runtime.jsx)(_components.img, {
        alt: "object actions",
        src: (__webpack_require__(38636)/* ["default"] */ .A) + "",
        width: "976",
        height: "239"
      })
    }), "\n", (0,jsx_runtime.jsxs)(_components.ol, {
      children: ["\n", (0,jsx_runtime.jsx)(_components.li, {
        children: "Search for objects using the search box."
      }), "\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: ["Delete an object using the ", (0,jsx_runtime.jsx)(_components.strong, {
          children: "Delete"
        }), " icon."]
      }), "\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: ["Create an object using the ", (0,jsx_runtime.jsx)(_components.strong, {
          children: "Apply YAML"
        }), " button."]
      }), "\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: ["Click the name of the object to:", "\n", (0,jsx_runtime.jsxs)(_components.ul, {
          children: ["\n", (0,jsx_runtime.jsx)(_components.li, {
            children: "View its summary"
          }), "\n", (0,jsx_runtime.jsx)(_components.li, {
            children: "View its Kubernetes configuration"
          }), "\n", (0,jsx_runtime.jsx)(_components.li, {
            children: "Edit its Kubernetes configuration and apply those changes to your cluster."
          }), "\n"]
        }), "\n"]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsx)(_components.h2, {
      id: "managing-other-resources",
      children: "Managing other resources"
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "You can manage other resources, such as your Podman machine, cluster, or CLI tools using the Podman Desktop Settings."
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: (0,jsx_runtime.jsx)(_components.strong, {
        children: (0,jsx_runtime.jsx)(_components.em, {
          children: "Managing your Podman machine"
        })
      })
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["On the ", (0,jsx_runtime.jsx)(_components.strong, {
        children: "Settings > Resources"
      }), " page, perform any of the following actions:"]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: (0,jsx_runtime.jsx)(_components.img, {
        alt: "podman machine set up",
        src: (__webpack_require__(60852)/* ["default"] */ .A) + "",
        width: "1506",
        height: "538"
      })
    }), "\n", (0,jsx_runtime.jsxs)(_components.ol, {
      children: ["\n", (0,jsx_runtime.jsx)(_components.li, {
        children: "Create a new Podman machine."
      }), "\n", (0,jsx_runtime.jsx)(_components.li, {
        children: "Set up Podman machine preferences."
      }), "\n", (0,jsx_runtime.jsx)(_components.li, {
        children: "Access other useful actions to start, restart, stop, edit, or delete a Podman machine."
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: (0,jsx_runtime.jsx)(_components.strong, {
        children: (0,jsx_runtime.jsx)(_components.em, {
          children: "Managing your cluster"
        })
      })
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["On the ", (0,jsx_runtime.jsx)(_components.strong, {
        children: "Settings > Resources"
      }), " page, perform any of the following actions:"]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: (0,jsx_runtime.jsx)(_components.img, {
        alt: "cluster set up",
        src: (__webpack_require__(40049)/* ["default"] */ .A) + "",
        width: "742",
        height: "187"
      })
    }), "\n", (0,jsx_runtime.jsxs)(_components.ol, {
      children: ["\n", (0,jsx_runtime.jsx)(_components.li, {
        children: "Create a new cluster."
      }), "\n", (0,jsx_runtime.jsx)(_components.li, {
        children: "Access other useful actions to start, restart, stop, or delete a cluster."
      }), "\n", (0,jsx_runtime.jsx)(_components.li, {
        children: "Upgrade your cluster to the latest version."
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: (0,jsx_runtime.jsx)(_components.strong, {
        children: (0,jsx_runtime.jsx)(_components.em, {
          children: "Managing your CLI tools"
        })
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "If you have installed a CLI tool extension, you can set up, upgrade, or downgrade the CLI tool from the UI."
    }), "\n", (0,jsx_runtime.jsxs)(_components.ul, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: ["On the ", (0,jsx_runtime.jsx)(_components.strong, {
          children: "Settings > Resources"
        }), " page, click ", (0,jsx_runtime.jsx)(_components.strong, {
          children: "Setup"
        }), " to download the CLI tool and install it system wide."]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: (0,jsx_runtime.jsx)(_components.img, {
        alt: "CLI set up",
        src: (__webpack_require__(83552)/* ["default"] */ .A) + "",
        width: "742",
        height: "155"
      })
    }), "\n", (0,jsx_runtime.jsxs)(_components.ul, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: ["On the ", (0,jsx_runtime.jsx)(_components.strong, {
          children: "Settings > CLI tools"
        }), " page, click the ", (0,jsx_runtime.jsx)(_components.strong, {
          children: "Upgrade/Downgrade"
        }), " icon or link to update the version of the CLI tool."]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: (0,jsx_runtime.jsx)(_components.img, {
        alt: "CLI update",
        src: (__webpack_require__(3439)/* ["default"] */ .A) + "",
        width: "1458",
        height: "342"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.admonition, {
      type: "note",
      children: (0,jsx_runtime.jsxs)(_components.p, {
        children: ["If the installation of a CLI tool fails, see ", (0,jsx_runtime.jsx)(_components.a, {
          href: "/docs/troubleshooting/troubleshooting-extension-issues#podman-desktop-fails-to-install-a-cli-tool",
          children: "Podman Desktop fails to install a CLI tool"
        }), "."]
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.h2, {
      id: "additional-resources",
      children: "Additional resources"
    }), "\n", (0,jsx_runtime.jsxs)(_components.ul, {
      children: ["\n", (0,jsx_runtime.jsx)(_components.li, {
        children: (0,jsx_runtime.jsx)(_components.a, {
          href: "/docs/containers",
          children: "Working with containers"
        })
      }), "\n", (0,jsx_runtime.jsx)(_components.li, {
        children: (0,jsx_runtime.jsx)(_components.a, {
          href: "/docs/containers/images",
          children: "Working with images"
        })
      }), "\n", (0,jsx_runtime.jsx)(_components.li, {
        children: (0,jsx_runtime.jsx)(_components.a, {
          href: "/docs/kubernetes",
          children: "Working with Kubernetes"
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

/***/ 3439
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   A: () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (__webpack_require__.p + "assets/images/cli-update-21bb2fb31349666d360c76cec38197f6.png");

/***/ },

/***/ 40049
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   A: () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (__webpack_require__.p + "assets/images/cluster-setup-8374e916b855523ac87b901083b3b378.png");

/***/ },

/***/ 95670
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   A: () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (__webpack_require__.p + "assets/images/common-actions-64dad5b40c01a95ad6fac915ba167b3d.png");

/***/ },

/***/ 25908
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   A: () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (__webpack_require__.p + "assets/images/container-actions-e47278f737cbc74d9e2a9ff919f467b2.png");

/***/ },

/***/ 64434
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   A: () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (__webpack_require__.p + "assets/images/image-actions-b792e9368954bf5671fd8c9bef03ad0b.png");

/***/ },

/***/ 38636
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   A: () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (__webpack_require__.p + "assets/images/object-actions-488d9474c2f379046e335cc02cb94415.png");

/***/ },

/***/ 60852
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   A: () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (__webpack_require__.p + "assets/images/podman-setup-0cfa7b68c1515da2343694ae694e8cae.png");

/***/ },

/***/ 98461
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   A: () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (__webpack_require__.p + "assets/images/pods-actions-e0e63acce33edbc72912feb8c02e70c2.png");

/***/ },

/***/ 83552
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   A: () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (__webpack_require__.p + "assets/images/set-up-cli-ec80f5d1ff226241882d2bc87a37afe9.png");

/***/ },

/***/ 73215
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   A: () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (__webpack_require__.p + "assets/images/volume-actions-7fa29553610b0ca3ecc194bccee8dedc.png");

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