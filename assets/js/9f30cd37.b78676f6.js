"use strict";
(globalThis["webpackChunkdocs"] = globalThis["webpackChunkdocs"] || []).push([[93996],{

/***/ 60115
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  assets: () => (/* binding */ assets),
  contentTitle: () => (/* binding */ contentTitle),
  "default": () => (/* binding */ MDXContent),
  frontMatter: () => (/* binding */ frontMatter),
  metadata: () => (/* reexport */ site_docs_migrating_from_docker_aliasing_the_docker_cli_mdx_9f3_namespaceObject),
  toc: () => (/* binding */ toc)
});

;// ./.docusaurus/docusaurus-plugin-content-docs/default/site-docs-migrating-from-docker-aliasing-the-docker-cli-mdx-9f3.json
const site_docs_migrating_from_docker_aliasing_the_docker_cli_mdx_9f3_namespaceObject = /*#__PURE__*/JSON.parse('{"id":"migrating-from-docker/aliasing-the-docker-cli","title":"Aliasing the Docker CLI","description":"Make the docker command run Podman so that your existing commands and scripts keep working after you remove Docker.","source":"@site/docs/migrating-from-docker/aliasing-the-docker-cli.mdx","sourceDirName":"migrating-from-docker","slug":"/migrating-from-docker/aliasing-the-docker-cli","permalink":"/docs/migrating-from-docker/aliasing-the-docker-cli","draft":false,"unlisted":false,"editUrl":"https://github.com/podman-desktop/podman-desktop/tree/main/website/docs/migrating-from-docker/aliasing-the-docker-cli.mdx","tags":[{"inline":true,"label":"migrating-from-docker","permalink":"/docs/tags/migrating-from-docker"}],"version":"current","sidebarPosition":3,"frontMatter":{"sidebar_position":3,"title":"Aliasing the Docker CLI","description":"Make the docker command run Podman so that your existing commands and scripts keep working after you remove Docker.","keywords":["podman desktop","podman","docker","alias","cli","migrating"],"tags":["migrating-from-docker"]},"sidebar":"mySidebar","previous":{"title":"Customizing Docker compatibility","permalink":"/docs/migrating-from-docker/customizing-docker-compatibility"},"next":{"title":"Managing Docker compatibility","permalink":"/docs/migrating-from-docker/managing-docker-compatibility"}}');
// EXTERNAL MODULE: ../node_modules/react/jsx-runtime.js
var jsx_runtime = __webpack_require__(62540);
// EXTERNAL MODULE: ../node_modules/@mdx-js/react/lib/index.js
var lib = __webpack_require__(43023);
// EXTERNAL MODULE: ../node_modules/@docusaurus/theme-classic/lib/theme/Tabs/index.js + 1 modules
var Tabs = __webpack_require__(49479);
// EXTERNAL MODULE: ../node_modules/@docusaurus/theme-classic/lib/theme/TabItem/index.js + 1 modules
var TabItem = __webpack_require__(22491);
;// ./docs/migrating-from-docker/aliasing-the-docker-cli.mdx


const frontMatter = {
	sidebar_position: 3,
	title: 'Aliasing the Docker CLI',
	description: 'Make the docker command run Podman so that your existing commands and scripts keep working after you remove Docker.',
	keywords: [
		'podman desktop',
		'podman',
		'docker',
		'alias',
		'cli',
		'migrating'
	],
	tags: [
		'migrating-from-docker'
	]
};
const contentTitle = 'Aliasing the Docker CLI';

const assets = {

};





const toc = [{
  "value": "Prerequisites",
  "id": "prerequisites",
  "level": 4
}, {
  "value": "Choosing an approach",
  "id": "choosing-an-approach",
  "level": 2
}, {
  "value": "Creating a shell alias",
  "id": "creating-a-shell-alias",
  "level": 2
}, {
  "value": "Procedure",
  "id": "procedure",
  "level": 4
}, {
  "value": "Verification",
  "id": "verification",
  "level": 4
}, {
  "value": "Procedure",
  "id": "procedure-1",
  "level": 4
}, {
  "value": "Verification",
  "id": "verification-1",
  "level": 4
}, {
  "value": "Procedure",
  "id": "procedure-2",
  "level": 4
}, {
  "value": "Verification",
  "id": "verification-2",
  "level": 4
}, {
  "value": "Creating a persistent Docker command",
  "id": "creating-a-persistent-docker-command",
  "level": 2
}, {
  "value": "Procedure",
  "id": "procedure-3",
  "level": 4
}, {
  "value": "Verification",
  "id": "verification-3",
  "level": 4
}, {
  "value": "Procedure",
  "id": "procedure-4",
  "level": 4
}, {
  "value": "Verification",
  "id": "verification-4",
  "level": 4
}, {
  "value": "Procedure",
  "id": "procedure-5",
  "level": 4
}, {
  "value": "Verification",
  "id": "verification-5",
  "level": 4
}, {
  "value": "Additional resources",
  "id": "additional-resources",
  "level": 4
}];
function _createMdxContent(props) {
  const _components = {
    a: "a",
    admonition: "admonition",
    code: "code",
    em: "em",
    h1: "h1",
    h2: "h2",
    h4: "h4",
    header: "header",
    li: "li",
    ol: "ol",
    p: "p",
    pre: "pre",
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
        id: "aliasing-the-docker-cli",
        children: "Aliasing the Docker CLI"
      })
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["If you remove Docker, the ", (0,jsx_runtime.jsx)(_components.code, {
        children: "docker"
      }), " command goes with it. Your scripts, your shell history, and the many ", (0,jsx_runtime.jsx)(_components.code, {
        children: "docker"
      }), " examples you find online all stop working, even though Podman can run most of them."]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Because the Podman CLI is a drop-in replacement for most Docker commands, you can make ", (0,jsx_runtime.jsx)(_components.code, {
        children: "docker"
      }), " run Podman instead. You then keep using the commands you already know, and your scripts continue to work without changes."]
    }), "\n", (0,jsx_runtime.jsx)(_components.admonition, {
      type: "note",
      children: (0,jsx_runtime.jsxs)(_components.p, {
        children: ["Aliasing the Docker CLI changes which program the ", (0,jsx_runtime.jsx)(_components.code, {
          children: "docker"
        }), " ", (0,jsx_runtime.jsx)(_components.em, {
          children: "command"
        }), " runs. It does not affect tools that connect to the Docker ", (0,jsx_runtime.jsx)(_components.em, {
          children: "socket"
        }), " directly, such as ", (0,jsx_runtime.jsx)(_components.a, {
          href: "https://www.testcontainers.com/",
          children: "Testcontainers"
        }), " or ", (0,jsx_runtime.jsx)(_components.a, {
          href: "https://maven.apache.org/",
          children: "Maven"
        }), ". To make those tools work with Podman, enable ", (0,jsx_runtime.jsx)(_components.a, {
          href: "/docs/migrating-from-docker/customizing-docker-compatibility#enable-docker-compatibility",
          children: "Docker compatibility"
        }), " or set the ", (0,jsx_runtime.jsxs)(_components.a, {
          href: "/docs/migrating-from-docker/using-the-docker_host-environment-variable",
          children: [(0,jsx_runtime.jsx)(_components.code, {
            children: "DOCKER_HOST"
          }), " environment variable"]
        }), "."]
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "prerequisites",
      children: "Prerequisites"
    }), "\n", (0,jsx_runtime.jsxs)(_components.ul, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: [(0,jsx_runtime.jsx)(_components.a, {
          href: "/docs/podman/creating-a-podman-machine",
          children: "A running Podman machine"
        }), "."]
      }), "\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: ["No ", (0,jsx_runtime.jsx)(_components.code, {
          children: "docker"
        }), " command on your system, or one that you want to replace. To check, run ", (0,jsx_runtime.jsx)(_components.code, {
          children: "command -v docker"
        }), " on Linux and macOS, or ", (0,jsx_runtime.jsx)(_components.code, {
          children: "Get-Command docker"
        }), " on Windows."]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsx)(_components.h2, {
      id: "choosing-an-approach",
      children: "Choosing an approach"
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["A shell alias is the quickest way to get a ", (0,jsx_runtime.jsx)(_components.code, {
        children: "docker"
      }), " command, but it exists only inside the shell that defines it, and no other program on your system can see it. If your goal is to keep existing scripts working, do not rely on a shell alias. The other approaches put a real ", (0,jsx_runtime.jsx)(_components.code, {
        children: "docker"
      }), " command on your ", (0,jsx_runtime.jsx)(_components.code, {
        children: "PATH"
      }), ", so everything on your system finds it."]
    }), "\n", (0,jsx_runtime.jsxs)(_components.table, {
      children: [(0,jsx_runtime.jsx)(_components.thead, {
        children: (0,jsx_runtime.jsxs)(_components.tr, {
          children: [(0,jsx_runtime.jsx)(_components.th, {
            children: "Approach"
          }), (0,jsx_runtime.jsx)(_components.th, {
            children: "Works in scripts"
          }), (0,jsx_runtime.jsx)(_components.th, {
            children: "Survives a new terminal"
          }), (0,jsx_runtime.jsx)(_components.th, {
            children: "Platform"
          })]
        })
      }), (0,jsx_runtime.jsxs)(_components.tbody, {
        children: [(0,jsx_runtime.jsxs)(_components.tr, {
          children: [(0,jsx_runtime.jsx)(_components.td, {
            children: "Shell alias"
          }), (0,jsx_runtime.jsx)(_components.td, {
            children: "No"
          }), (0,jsx_runtime.jsx)(_components.td, {
            children: "Only if you edit your shell profile"
          }), (0,jsx_runtime.jsx)(_components.td, {
            children: "Linux, macOS"
          })]
        }), (0,jsx_runtime.jsxs)(_components.tr, {
          children: [(0,jsx_runtime.jsx)(_components.td, {
            children: "PowerShell alias"
          }), (0,jsx_runtime.jsx)(_components.td, {
            children: "Only in the same session"
          }), (0,jsx_runtime.jsx)(_components.td, {
            children: "Only if you edit your PowerShell profile"
          }), (0,jsx_runtime.jsx)(_components.td, {
            children: "Windows"
          })]
        }), (0,jsx_runtime.jsxs)(_components.tr, {
          children: [(0,jsx_runtime.jsxs)(_components.td, {
            children: [(0,jsx_runtime.jsx)(_components.code, {
              children: "podman-docker"
            }), " package"]
          }), (0,jsx_runtime.jsx)(_components.td, {
            children: "Yes"
          }), (0,jsx_runtime.jsx)(_components.td, {
            children: "Yes"
          }), (0,jsx_runtime.jsx)(_components.td, {
            children: "Linux"
          })]
        }), (0,jsx_runtime.jsxs)(_components.tr, {
          children: [(0,jsx_runtime.jsx)(_components.td, {
            children: "Symbolic link"
          }), (0,jsx_runtime.jsx)(_components.td, {
            children: "Yes"
          }), (0,jsx_runtime.jsx)(_components.td, {
            children: "Yes"
          }), (0,jsx_runtime.jsx)(_components.td, {
            children: "Linux, macOS"
          })]
        }), (0,jsx_runtime.jsxs)(_components.tr, {
          children: [(0,jsx_runtime.jsx)(_components.td, {
            children: "Wrapper script"
          }), (0,jsx_runtime.jsx)(_components.td, {
            children: "Yes"
          }), (0,jsx_runtime.jsx)(_components.td, {
            children: "Yes"
          }), (0,jsx_runtime.jsx)(_components.td, {
            children: "Linux, macOS, Windows"
          })]
        })]
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.h2, {
      id: "creating-a-shell-alias",
      children: "Creating a shell alias"
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Use an alias when you want a ", (0,jsx_runtime.jsx)(_components.code, {
        children: "docker"
      }), " command in your own terminal and you do not need other programs to find it."]
    }), "\n", (0,jsx_runtime.jsxs)(Tabs/* default */.A, {
      groupId: "operating-systems",
      children: [(0,jsx_runtime.jsxs)(TabItem/* default */.A, {
        value: "win",
        label: "Windows",
        className: "markdown",
        children: [(0,jsx_runtime.jsx)(_components.h4, {
          id: "procedure",
          children: "Procedure"
        }), (0,jsx_runtime.jsxs)(_components.ol, {
          children: ["\n", (0,jsx_runtime.jsxs)(_components.li, {
            children: ["\n", (0,jsx_runtime.jsx)(_components.p, {
              children: "Create the alias in your current PowerShell session:"
            }), "\n", (0,jsx_runtime.jsx)(_components.pre, {
              children: (0,jsx_runtime.jsx)(_components.code, {
                className: "language-shell-session",
                children: "$ Set-Alias -Name docker -Value podman\n"
              })
            }), "\n"]
          }), "\n", (0,jsx_runtime.jsxs)(_components.li, {
            children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
              children: ["Optional: To make the alias available in every new PowerShell session, add the same command to your PowerShell profile. The profile path is stored in the ", (0,jsx_runtime.jsx)(_components.code, {
                children: "$PROFILE"
              }), " variable."]
            }), "\n", (0,jsx_runtime.jsx)(_components.p, {
              children: "The profile file does not exist on a new PowerShell installation. Create the file, and the parent directory, if needed:"
            }), "\n", (0,jsx_runtime.jsx)(_components.pre, {
              children: (0,jsx_runtime.jsx)(_components.code, {
                className: "language-shell-session",
                children: "$ if (!(Test-Path $PROFILE)) { New-Item -ItemType File -Path $PROFILE -Force }\n"
              })
            }), "\n", (0,jsx_runtime.jsx)(_components.p, {
              children: "Add the alias to the profile:"
            }), "\n", (0,jsx_runtime.jsx)(_components.pre, {
              children: (0,jsx_runtime.jsx)(_components.code, {
                className: "language-shell-session",
                children: "$ Add-Content -Path $PROFILE -Value 'Set-Alias -Name docker -Value podman'\n"
              })
            }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
              children: ["Your execution policy must also allow the profile to run. The ", (0,jsx_runtime.jsx)(_components.code, {
                children: "Restricted"
              }), " policy blocks all script files, including profiles, and is the effective policy on Windows clients when no policy is set in any scope."]
            }), "\n", (0,jsx_runtime.jsx)(_components.p, {
              children: "Check the effective policy:"
            }), "\n", (0,jsx_runtime.jsx)(_components.pre, {
              children: (0,jsx_runtime.jsx)(_components.code, {
                className: "language-shell-session",
                children: "$ Get-ExecutionPolicy\n"
              })
            }), "\n", (0,jsx_runtime.jsx)(_components.p, {
              children: "Check the policy for each scope:"
            }), "\n", (0,jsx_runtime.jsx)(_components.pre, {
              children: (0,jsx_runtime.jsx)(_components.code, {
                className: "language-shell-session",
                children: "$ Get-ExecutionPolicy -List\n"
              })
            }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
              children: ["If your execution policy prevents the profile from running, create a persistent ", (0,jsx_runtime.jsx)(_components.code, {
                children: "docker"
              }), " command instead."]
            }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
              children: ["PowerShell scripts that you run from the same session can use the alias. Other programs and ", (0,jsx_runtime.jsx)(_components.code, {
                children: "cmd.exe"
              }), " scripts cannot."]
            }), "\n"]
          }), "\n"]
        }), (0,jsx_runtime.jsx)(_components.h4, {
          id: "verification",
          children: "Verification"
        }), (0,jsx_runtime.jsxs)(_components.ul, {
          children: ["\n", (0,jsx_runtime.jsxs)(_components.li, {
            children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
              children: ["Check that the ", (0,jsx_runtime.jsx)(_components.code, {
                children: "docker"
              }), " command runs Podman:"]
            }), "\n", (0,jsx_runtime.jsx)(_components.pre, {
              children: (0,jsx_runtime.jsx)(_components.code, {
                className: "language-shell-session",
                children: "$ docker --help\n"
              })
            }), "\n", (0,jsx_runtime.jsx)(_components.p, {
              children: "The output starts with the Podman description:"
            }), "\n", (0,jsx_runtime.jsx)(_components.pre, {
              children: (0,jsx_runtime.jsx)(_components.code, {
                children: "Manage pods, containers and images\n"
              })
            }), "\n"]
          }), "\n"]
        })]
      }), (0,jsx_runtime.jsxs)(TabItem/* default */.A, {
        value: "macOS",
        label: "macOS",
        className: "markdown",
        children: [(0,jsx_runtime.jsx)(_components.h4, {
          id: "procedure-1",
          children: "Procedure"
        }), (0,jsx_runtime.jsxs)(_components.ol, {
          children: ["\n", (0,jsx_runtime.jsxs)(_components.li, {
            children: ["\n", (0,jsx_runtime.jsx)(_components.p, {
              children: "Create the alias in your current shell:"
            }), "\n", (0,jsx_runtime.jsx)(_components.pre, {
              children: (0,jsx_runtime.jsx)(_components.code, {
                className: "language-shell-session",
                children: "$ alias docker=podman\n"
              })
            }), "\n"]
          }), "\n", (0,jsx_runtime.jsxs)(_components.li, {
            children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
              children: ["Optional: To make the alias available in every new shell, add the same line to your shell profile, such as ", (0,jsx_runtime.jsx)(_components.code, {
                children: "~/.zshrc"
              }), ":"]
            }), "\n", (0,jsx_runtime.jsx)(_components.pre, {
              children: (0,jsx_runtime.jsx)(_components.code, {
                className: "language-shell-session",
                children: "$ echo \"alias docker=podman\" >> ~/.zshrc\n"
              })
            }), "\n", (0,jsx_runtime.jsx)(_components.p, {
              children: "The alias is not available to scripts that you run."
            }), "\n"]
          }), "\n"]
        }), (0,jsx_runtime.jsx)(_components.h4, {
          id: "verification-1",
          children: "Verification"
        }), (0,jsx_runtime.jsxs)(_components.ul, {
          children: ["\n", (0,jsx_runtime.jsxs)(_components.li, {
            children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
              children: ["Check that the ", (0,jsx_runtime.jsx)(_components.code, {
                children: "docker"
              }), " command runs Podman:"]
            }), "\n", (0,jsx_runtime.jsx)(_components.pre, {
              children: (0,jsx_runtime.jsx)(_components.code, {
                className: "language-shell-session",
                children: "$ docker --help\n"
              })
            }), "\n", (0,jsx_runtime.jsx)(_components.p, {
              children: "The output starts with the Podman description:"
            }), "\n", (0,jsx_runtime.jsx)(_components.pre, {
              children: (0,jsx_runtime.jsx)(_components.code, {
                children: "Manage pods, containers and images\n"
              })
            }), "\n"]
          }), "\n"]
        })]
      }), (0,jsx_runtime.jsxs)(TabItem/* default */.A, {
        value: "linux",
        label: "Linux",
        className: "markdown",
        children: [(0,jsx_runtime.jsx)(_components.h4, {
          id: "procedure-2",
          children: "Procedure"
        }), (0,jsx_runtime.jsxs)(_components.ol, {
          children: ["\n", (0,jsx_runtime.jsxs)(_components.li, {
            children: ["\n", (0,jsx_runtime.jsx)(_components.p, {
              children: "Create the alias in your current shell:"
            }), "\n", (0,jsx_runtime.jsx)(_components.pre, {
              children: (0,jsx_runtime.jsx)(_components.code, {
                className: "language-shell-session",
                children: "$ alias docker=podman\n"
              })
            }), "\n"]
          }), "\n", (0,jsx_runtime.jsxs)(_components.li, {
            children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
              children: ["Optional: To make the alias available in every new shell, add the same line to your shell profile, such as ", (0,jsx_runtime.jsx)(_components.code, {
                children: "~/.bashrc"
              }), ":"]
            }), "\n", (0,jsx_runtime.jsx)(_components.pre, {
              children: (0,jsx_runtime.jsx)(_components.code, {
                className: "language-shell-session",
                children: "$ echo \"alias docker=podman\" >> ~/.bashrc\n"
              })
            }), "\n", (0,jsx_runtime.jsx)(_components.p, {
              children: "The alias is not available to scripts that you run."
            }), "\n"]
          }), "\n"]
        }), (0,jsx_runtime.jsx)(_components.h4, {
          id: "verification-2",
          children: "Verification"
        }), (0,jsx_runtime.jsxs)(_components.ul, {
          children: ["\n", (0,jsx_runtime.jsxs)(_components.li, {
            children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
              children: ["Check that the ", (0,jsx_runtime.jsx)(_components.code, {
                children: "docker"
              }), " command runs Podman:"]
            }), "\n", (0,jsx_runtime.jsx)(_components.pre, {
              children: (0,jsx_runtime.jsx)(_components.code, {
                className: "language-shell-session",
                children: "$ docker --help\n"
              })
            }), "\n", (0,jsx_runtime.jsx)(_components.p, {
              children: "The output starts with the Podman description:"
            }), "\n", (0,jsx_runtime.jsx)(_components.pre, {
              children: (0,jsx_runtime.jsx)(_components.code, {
                children: "Manage pods, containers and images\n"
              })
            }), "\n"]
          }), "\n"]
        })]
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.h2, {
      id: "creating-a-persistent-docker-command",
      children: "Creating a persistent Docker command"
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Create a persistent ", (0,jsx_runtime.jsx)(_components.code, {
        children: "docker"
      }), " command when you want your scripts, build tools, and other programs to find it."]
    }), "\n", (0,jsx_runtime.jsxs)(Tabs/* default */.A, {
      groupId: "operating-systems",
      children: [(0,jsx_runtime.jsxs)(TabItem/* default */.A, {
        value: "win",
        label: "Windows",
        className: "markdown",
        children: [(0,jsx_runtime.jsx)(_components.h4, {
          id: "procedure-3",
          children: "Procedure"
        }), (0,jsx_runtime.jsxs)(_components.ol, {
          children: ["\n", (0,jsx_runtime.jsxs)(_components.li, {
            children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
              children: ["Create the ", (0,jsx_runtime.jsx)(_components.code, {
                children: "C:\\Program Files\\docker\\bin"
              }), " directory. If you removed Docker, this directory no longer exists."]
            }), "\n", (0,jsx_runtime.jsx)(_components.pre, {
              children: (0,jsx_runtime.jsx)(_components.code, {
                className: "language-shell-session",
                children: "$ New-Item -ItemType Directory -Force -Path 'C:\\Program Files\\docker\\bin'\n"
              })
            }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
              children: ["Writing to ", (0,jsx_runtime.jsx)(_components.code, {
                children: "C:\\Program Files"
              }), " and editing the system ", (0,jsx_runtime.jsx)(_components.code, {
                children: "PATH"
              }), " both require administrator permissions, so run PowerShell as an administrator. Alternatively, use a directory in your user profile and add it to your user ", (0,jsx_runtime.jsx)(_components.code, {
                children: "PATH"
              }), "."]
            }), "\n"]
          }), "\n", (0,jsx_runtime.jsxs)(_components.li, {
            children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
              children: ["Create a ", (0,jsx_runtime.jsx)(_components.code, {
                children: "C:\\Program Files\\docker\\bin\\docker.bat"
              }), " file with the following content:"]
            }), "\n", (0,jsx_runtime.jsx)(_components.pre, {
              children: (0,jsx_runtime.jsx)(_components.code, {
                className: "language-batch",
                children: "@echo off\nREM Delete the next line to stop showing this message.\necho Emulate Docker CLI using podman. 1>&2\npodman %*\n"
              })
            }), "\n", (0,jsx_runtime.jsx)(_components.p, {
              children: "The reminder goes to standard error, so that it does not appear in output that your scripts capture."
            }), "\n"]
          }), "\n", (0,jsx_runtime.jsxs)(_components.li, {
            children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
              children: ["Add ", (0,jsx_runtime.jsx)(_components.code, {
                children: "C:\\Program Files\\docker\\bin"
              }), " to the ", (0,jsx_runtime.jsx)(_components.code, {
                children: "PATH"
              }), " environment variable."]
            }), "\n"]
          }), "\n", (0,jsx_runtime.jsxs)(_components.li, {
            children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
              children: ["Close all ", (0,jsx_runtime.jsx)(_components.code, {
                children: "cmd"
              }), " and PowerShell windows, then open a new one."]
            }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
              children: ["Programs read the ", (0,jsx_runtime.jsx)(_components.code, {
                children: "PATH"
              }), " variable when they start, so open windows do not pick up the change."]
            }), "\n"]
          }), "\n"]
        }), (0,jsx_runtime.jsxs)(_components.admonition, {
          type: "note",
          children: [(0,jsx_runtime.jsxs)(_components.p, {
            children: ["A batch file is not an executable. This affects how other programs run the ", (0,jsx_runtime.jsx)(_components.code, {
              children: "docker"
            }), " command:"]
          }), (0,jsx_runtime.jsxs)(_components.ul, {
            children: ["\n", (0,jsx_runtime.jsxs)(_components.li, {
              children: ["Programs that start ", (0,jsx_runtime.jsx)(_components.code, {
                children: "docker"
              }), " without a shell cannot run ", (0,jsx_runtime.jsx)(_components.code, {
                children: "docker.bat"
              }), ". Node.js ", (0,jsx_runtime.jsx)(_components.code, {
                children: "execFile()"
              }), " is one example."]
            }), "\n", (0,jsx_runtime.jsxs)(_components.li, {
              children: ["In a batch script, run ", (0,jsx_runtime.jsx)(_components.code, {
                children: "call docker ..."
              }), " rather than ", (0,jsx_runtime.jsx)(_components.code, {
                children: "docker ..."
              }), ". Without ", (0,jsx_runtime.jsx)(_components.code, {
                children: "call"
              }), ", control does not return to your script."]
            }), "\n"]
          })]
        }), (0,jsx_runtime.jsx)(_components.h4, {
          id: "verification-3",
          children: "Verification"
        }), (0,jsx_runtime.jsxs)(_components.ol, {
          children: ["\n", (0,jsx_runtime.jsxs)(_components.li, {
            children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
              children: ["Check that the ", (0,jsx_runtime.jsx)(_components.code, {
                children: "docker"
              }), " command runs Podman:"]
            }), "\n", (0,jsx_runtime.jsx)(_components.pre, {
              children: (0,jsx_runtime.jsx)(_components.code, {
                className: "language-shell-session",
                children: "$ docker --help\n"
              })
            }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
              children: ["The output starts with the reminder from the ", (0,jsx_runtime.jsx)(_components.code, {
                children: "docker.bat"
              }), " file:"]
            }), "\n", (0,jsx_runtime.jsx)(_components.pre, {
              children: (0,jsx_runtime.jsx)(_components.code, {
                children: "Emulate Docker CLI using podman.\n"
              })
            }), "\n", (0,jsx_runtime.jsx)(_components.p, {
              children: "The rest of the output includes the Podman description:"
            }), "\n", (0,jsx_runtime.jsx)(_components.pre, {
              children: (0,jsx_runtime.jsx)(_components.code, {
                children: "Manage pods, containers and images\n"
              })
            }), "\n"]
          }), "\n", (0,jsx_runtime.jsxs)(_components.li, {
            children: ["\n", (0,jsx_runtime.jsx)(_components.p, {
              children: "Run a container:"
            }), "\n", (0,jsx_runtime.jsx)(_components.pre, {
              children: (0,jsx_runtime.jsx)(_components.code, {
                className: "language-shell-session",
                children: "$ docker run docker.io/hello-world\n"
              })
            }), "\n"]
          }), "\n"]
        })]
      }), (0,jsx_runtime.jsxs)(TabItem/* default */.A, {
        value: "macOS",
        label: "macOS",
        className: "markdown",
        children: [(0,jsx_runtime.jsx)(_components.h4, {
          id: "procedure-4",
          children: "Procedure"
        }), (0,jsx_runtime.jsxs)(_components.p, {
          children: ["The ", (0,jsx_runtime.jsx)(_components.code, {
            children: "/usr/local/bin"
          }), " directory does not exist on all macOS installations. Create it if needed:"]
        }), (0,jsx_runtime.jsx)(_components.pre, {
          children: (0,jsx_runtime.jsx)(_components.code, {
            className: "language-shell-session",
            children: "$ sudo mkdir -p /usr/local/bin\n"
          })
        }), (0,jsx_runtime.jsx)(_components.p, {
          children: "Then perform one of the following steps:"
        }), (0,jsx_runtime.jsxs)(_components.ul, {
          children: ["\n", (0,jsx_runtime.jsxs)(_components.li, {
            children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
              children: ["Link the ", (0,jsx_runtime.jsx)(_components.code, {
                children: "podman"
              }), " executable to ", (0,jsx_runtime.jsx)(_components.code, {
                children: "/usr/local/bin/docker"
              }), ":"]
            }), "\n", (0,jsx_runtime.jsx)(_components.pre, {
              children: (0,jsx_runtime.jsx)(_components.code, {
                className: "language-shell-session",
                children: "$ sudo ln -s $(command -v podman) /usr/local/bin/docker\n"
              })
            }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
              children: ["This is the shortest option. The Podman installer places the executable in ", (0,jsx_runtime.jsx)(_components.code, {
                children: "/opt/podman/bin/podman"
              }), ", and ", (0,jsx_runtime.jsx)(_components.code, {
                children: "command -v"
              }), " also finds it if you installed Podman another way, such as with Homebrew."]
            }), "\n"]
          }), "\n", (0,jsx_runtime.jsxs)(_components.li, {
            children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
              children: ["Create a ", (0,jsx_runtime.jsx)(_components.code, {
                children: "/usr/local/bin/docker"
              }), " script with the following content:"]
            }), "\n", (0,jsx_runtime.jsx)(_components.pre, {
              children: (0,jsx_runtime.jsx)(_components.code, {
                className: "language-shell",
                children: "#!/bin/sh\n[ -e /etc/containers/nodocker ] || \\\necho \"Emulate Docker CLI using podman. Create /etc/containers/nodocker to quiet msg.\" >&2\nexec podman \"$@\"\n"
              })
            }), "\n", (0,jsx_runtime.jsx)(_components.p, {
              children: "Then make the script executable:"
            }), "\n", (0,jsx_runtime.jsx)(_components.pre, {
              children: (0,jsx_runtime.jsx)(_components.code, {
                className: "language-shell-session",
                children: "$ sudo chmod +x /usr/local/bin/docker\n"
              })
            }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
              children: ["The script reminds you that Podman is running the command. To stop the reminder, create an empty ", (0,jsx_runtime.jsx)(_components.code, {
                children: "/etc/containers/nodocker"
              }), " file:"]
            }), "\n", (0,jsx_runtime.jsx)(_components.pre, {
              children: (0,jsx_runtime.jsx)(_components.code, {
                className: "language-shell-session",
                children: "$ sudo touch /etc/containers/nodocker\n"
              })
            }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
              children: ["The script prints the reminder, not Podman. A symbolic link never prints it, and ", (0,jsx_runtime.jsx)(_components.code, {
                children: "/etc/containers/nodocker"
              }), " has no effect on one."]
            }), "\n"]
          }), "\n"]
        }), (0,jsx_runtime.jsx)(_components.admonition, {
          type: "warning",
          children: (0,jsx_runtime.jsxs)(_components.p, {
            children: ["If you reinstall Docker Desktop, it can overwrite or shadow ", (0,jsx_runtime.jsx)(_components.code, {
              children: "/usr/local/bin/docker"
            }), ". Run ", (0,jsx_runtime.jsx)(_components.code, {
              children: "command -v docker"
            }), " to find out which ", (0,jsx_runtime.jsx)(_components.code, {
              children: "docker"
            }), " command your system uses."]
          })
        }), (0,jsx_runtime.jsx)(_components.h4, {
          id: "verification-4",
          children: "Verification"
        }), (0,jsx_runtime.jsxs)(_components.ol, {
          children: ["\n", (0,jsx_runtime.jsxs)(_components.li, {
            children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
              children: ["Check that the ", (0,jsx_runtime.jsx)(_components.code, {
                children: "docker"
              }), " command runs Podman:"]
            }), "\n", (0,jsx_runtime.jsx)(_components.pre, {
              children: (0,jsx_runtime.jsx)(_components.code, {
                className: "language-shell-session",
                children: "$ docker --help\n"
              })
            }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
              children: ["If you created the wrapper script, the output starts with the ", (0,jsx_runtime.jsx)(_components.code, {
                children: "Emulate Docker CLI using podman."
              }), " reminder. In both cases, the output includes the Podman description:"]
            }), "\n", (0,jsx_runtime.jsx)(_components.pre, {
              children: (0,jsx_runtime.jsx)(_components.code, {
                children: "Manage pods, containers and images\n"
              })
            }), "\n"]
          }), "\n", (0,jsx_runtime.jsxs)(_components.li, {
            children: ["\n", (0,jsx_runtime.jsx)(_components.p, {
              children: "Run a container:"
            }), "\n", (0,jsx_runtime.jsx)(_components.pre, {
              children: (0,jsx_runtime.jsx)(_components.code, {
                className: "language-shell-session",
                children: "$ docker run docker.io/hello-world\n"
              })
            }), "\n"]
          }), "\n"]
        })]
      }), (0,jsx_runtime.jsxs)(TabItem/* default */.A, {
        value: "linux",
        label: "Linux",
        className: "markdown",
        children: [(0,jsx_runtime.jsx)(_components.h4, {
          id: "procedure-5",
          children: "Procedure"
        }), (0,jsx_runtime.jsx)(_components.p, {
          children: "Perform one of the following steps:"
        }), (0,jsx_runtime.jsxs)(_components.ul, {
          children: ["\n", (0,jsx_runtime.jsxs)(_components.li, {
            children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
              children: ["Install the ", (0,jsx_runtime.jsx)(_components.code, {
                children: "podman-docker"
              }), " package, which provides a ", (0,jsx_runtime.jsx)(_components.code, {
                children: "docker"
              }), " command and the Docker manual pages:"]
            }), "\n", (0,jsx_runtime.jsx)(_components.pre, {
              children: (0,jsx_runtime.jsx)(_components.code, {
                className: "language-shell-session",
                children: "$ sudo dnf install podman-docker\n"
              })
            }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
              children: ["On Debian and Ubuntu, run ", (0,jsx_runtime.jsx)(_components.code, {
                children: "sudo apt install podman-docker"
              }), "."]
            }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
              children: ["Prefer this option where your distribution provides the package. It installs the same wrapper script as the following options, and your package manager keeps it up to date. The package reminds you that Podman is running the command. To stop the reminder, create an empty ", (0,jsx_runtime.jsx)(_components.code, {
                children: "/etc/containers/nodocker"
              }), " file:"]
            }), "\n", (0,jsx_runtime.jsx)(_components.pre, {
              children: (0,jsx_runtime.jsx)(_components.code, {
                className: "language-shell-session",
                children: "$ sudo touch /etc/containers/nodocker\n"
              })
            }), "\n"]
          }), "\n"]
        }), (0,jsx_runtime.jsxs)(_components.p, {
          children: ["Use one of the following options if your distribution does not provide the ", (0,jsx_runtime.jsx)(_components.code, {
            children: "podman-docker"
          }), " package. Both options write to ", (0,jsx_runtime.jsx)(_components.code, {
            children: "/usr/local/bin"
          }), ", so create that directory if it does not exist:"]
        }), (0,jsx_runtime.jsx)(_components.pre, {
          children: (0,jsx_runtime.jsx)(_components.code, {
            className: "language-shell-session",
            children: "$ sudo mkdir -p /usr/local/bin\n"
          })
        }), (0,jsx_runtime.jsxs)(_components.ul, {
          children: ["\n", (0,jsx_runtime.jsxs)(_components.li, {
            children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
              children: ["Link the ", (0,jsx_runtime.jsx)(_components.code, {
                children: "podman"
              }), " executable to ", (0,jsx_runtime.jsx)(_components.code, {
                children: "/usr/local/bin/docker"
              }), ":"]
            }), "\n", (0,jsx_runtime.jsx)(_components.pre, {
              children: (0,jsx_runtime.jsx)(_components.code, {
                className: "language-shell-session",
                children: "$ sudo ln -s $(command -v podman) /usr/local/bin/docker\n"
              })
            }), "\n", (0,jsx_runtime.jsx)(_components.p, {
              children: "This is the shortest option."
            }), "\n"]
          }), "\n", (0,jsx_runtime.jsxs)(_components.li, {
            children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
              children: ["Create a ", (0,jsx_runtime.jsx)(_components.code, {
                children: "/usr/local/bin/docker"
              }), " script with the following content:"]
            }), "\n", (0,jsx_runtime.jsx)(_components.pre, {
              children: (0,jsx_runtime.jsx)(_components.code, {
                className: "language-shell",
                children: "#!/bin/sh\n[ -e /etc/containers/nodocker ] || \\\necho \"Emulate Docker CLI using podman. Create /etc/containers/nodocker to quiet msg.\" >&2\nexec podman \"$@\"\n"
              })
            }), "\n", (0,jsx_runtime.jsx)(_components.p, {
              children: "Then make the script executable:"
            }), "\n", (0,jsx_runtime.jsx)(_components.pre, {
              children: (0,jsx_runtime.jsx)(_components.code, {
                className: "language-shell-session",
                children: "$ sudo chmod +x /usr/local/bin/docker\n"
              })
            }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
              children: ["The script reminds you that Podman is running the command. To stop the reminder, create an empty ", (0,jsx_runtime.jsx)(_components.code, {
                children: "/etc/containers/nodocker"
              }), " file:"]
            }), "\n", (0,jsx_runtime.jsx)(_components.pre, {
              children: (0,jsx_runtime.jsx)(_components.code, {
                className: "language-shell-session",
                children: "$ sudo touch /etc/containers/nodocker\n"
              })
            }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
              children: ["The script prints the reminder, not Podman. A symbolic link never prints it, and ", (0,jsx_runtime.jsx)(_components.code, {
                children: "/etc/containers/nodocker"
              }), " has no effect on one."]
            }), "\n"]
          }), "\n"]
        }), (0,jsx_runtime.jsx)(_components.h4, {
          id: "verification-5",
          children: "Verification"
        }), (0,jsx_runtime.jsxs)(_components.ol, {
          children: ["\n", (0,jsx_runtime.jsxs)(_components.li, {
            children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
              children: ["Check that the ", (0,jsx_runtime.jsx)(_components.code, {
                children: "docker"
              }), " command runs Podman:"]
            }), "\n", (0,jsx_runtime.jsx)(_components.pre, {
              children: (0,jsx_runtime.jsx)(_components.code, {
                className: "language-shell-session",
                children: "$ docker --help\n"
              })
            }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
              children: ["If you created the wrapper script, the output starts with the ", (0,jsx_runtime.jsx)(_components.code, {
                children: "Emulate Docker CLI using podman."
              }), " reminder. In both cases, the output includes the Podman description:"]
            }), "\n", (0,jsx_runtime.jsx)(_components.pre, {
              children: (0,jsx_runtime.jsx)(_components.code, {
                children: "Manage pods, containers and images\n"
              })
            }), "\n"]
          }), "\n", (0,jsx_runtime.jsxs)(_components.li, {
            children: ["\n", (0,jsx_runtime.jsx)(_components.p, {
              children: "Run a container:"
            }), "\n", (0,jsx_runtime.jsx)(_components.pre, {
              children: (0,jsx_runtime.jsx)(_components.code, {
                className: "language-shell-session",
                children: "$ docker run docker.io/hello-world\n"
              })
            }), "\n"]
          }), "\n"]
        })]
      })]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["Podman supports most Docker commands, but not all of them behave identically. If a command does not work as you expect, see the ", (0,jsx_runtime.jsx)(_components.a, {
        href: "https://docs.podman.io/en/latest/Commands.html",
        children: "Podman documentation"
      }), "."]
    }), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "additional-resources",
      children: "Additional resources"
    }), "\n", (0,jsx_runtime.jsxs)(_components.ul, {
      children: ["\n", (0,jsx_runtime.jsx)(_components.li, {
        children: (0,jsx_runtime.jsx)(_components.a, {
          href: "/docs/migrating-from-docker/customizing-docker-compatibility",
          children: "Customizing Docker compatibility"
        })
      }), "\n", (0,jsx_runtime.jsx)(_components.li, {
        children: (0,jsx_runtime.jsx)(_components.a, {
          href: "/docs/migrating-from-docker/managing-docker-compatibility",
          children: "Managing Docker compatibility"
        })
      }), "\n", (0,jsx_runtime.jsx)(_components.li, {
        children: (0,jsx_runtime.jsxs)(_components.a, {
          href: "/docs/migrating-from-docker/using-the-docker_host-environment-variable",
          children: ["Using the ", (0,jsx_runtime.jsx)(_components.code, {
            children: "DOCKER_HOST"
          }), " environment variable"]
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

/***/ 22491
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {


// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  A: () => (/* binding */ TabItem)
});

// EXTERNAL MODULE: ../node_modules/react/index.js
var react = __webpack_require__(63696);
// EXTERNAL MODULE: ../node_modules/clsx/dist/clsx.mjs
var clsx = __webpack_require__(11750);
// EXTERNAL MODULE: ../node_modules/@docusaurus/theme-common/lib/utils/tabsUtils.js
var tabsUtils = __webpack_require__(75373);
;// ../node_modules/@docusaurus/theme-classic/lib/theme/TabItem/styles.module.css
// extracted by mini-css-extract-plugin
/* harmony default export */ const styles_module = ({"tabItem":"tabItem_wHwb"});
// EXTERNAL MODULE: ../node_modules/react/jsx-runtime.js
var jsx_runtime = __webpack_require__(62540);
;// ../node_modules/@docusaurus/theme-classic/lib/theme/TabItem/index.js
/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */function TabItemPanel({children,className,hidden}){return/*#__PURE__*/(0,jsx_runtime.jsx)("div",{role:"tabpanel",className:(0,clsx/* default */.A)(styles_module.tabItem,className),hidden,children:children});}function TabItem({children,className,value}){const{selectedValue,lazy}=(0,tabsUtils/* useTabs */.uc)();const isSelected=value===selectedValue;// TODO Docusaurus v4: use <Activity> ?
if(!isSelected&&lazy){return null;}return/*#__PURE__*/(0,jsx_runtime.jsx)(TabItemPanel,{className:className,hidden:!isSelected,children:children});}

/***/ },

/***/ 49479
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {


// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  A: () => (/* binding */ Tabs)
});

// EXTERNAL MODULE: ../node_modules/react/index.js
var react = __webpack_require__(63696);
// EXTERNAL MODULE: ../node_modules/clsx/dist/clsx.mjs
var clsx = __webpack_require__(11750);
// EXTERNAL MODULE: ../node_modules/@docusaurus/theme-common/lib/utils/ThemeClassNames.js
var ThemeClassNames = __webpack_require__(53237);
// EXTERNAL MODULE: ../node_modules/@docusaurus/theme-common/lib/utils/tabsUtils.js
var tabsUtils = __webpack_require__(75373);
// EXTERNAL MODULE: ../node_modules/@docusaurus/theme-common/lib/utils/scrollUtils.js
var scrollUtils = __webpack_require__(90766);
// EXTERNAL MODULE: ../node_modules/@docusaurus/core/lib/client/exports/useIsBrowser.js
var useIsBrowser = __webpack_require__(86681);
;// ../node_modules/@docusaurus/theme-classic/lib/theme/Tabs/styles.module.css
// extracted by mini-css-extract-plugin
/* harmony default export */ const styles_module = ({"tabList":"tabList_J5MA","tabItem":"tabItem_l0OV"});
// EXTERNAL MODULE: ../node_modules/react/jsx-runtime.js
var jsx_runtime = __webpack_require__(62540);
;// ../node_modules/@docusaurus/theme-classic/lib/theme/Tabs/index.js
/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */function TabList({className}){const{selectedValue,selectValue,tabValues,block}=(0,tabsUtils/* useTabs */.uc)();const tabRefs=[];const{blockElementScrollPositionUntilNextRender}=(0,scrollUtils/* useScrollPositionBlocker */.a_)();const handleTabChange=event=>{const newTab=event.currentTarget;const newTabIndex=tabRefs.indexOf(newTab);const newTabValue=tabValues[newTabIndex].value;if(newTabValue!==selectedValue){blockElementScrollPositionUntilNextRender(newTab);selectValue(newTabValue);}};const handleKeydown=event=>{let focusElement=null;switch(event.key){case'Enter':{handleTabChange(event);break;}case'ArrowRight':{const nextTab=tabRefs.indexOf(event.currentTarget)+1;focusElement=tabRefs[nextTab]??tabRefs[0];break;}case'ArrowLeft':{const prevTab=tabRefs.indexOf(event.currentTarget)-1;focusElement=tabRefs[prevTab]??tabRefs[tabRefs.length-1];break;}default:break;}focusElement?.focus();};return/*#__PURE__*/(0,jsx_runtime.jsx)("ul",{role:"tablist","aria-orientation":"horizontal",className:(0,clsx/* default */.A)('tabs',{'tabs--block':block},className),children:tabValues.map(({value,label,attributes})=>/*#__PURE__*/(0,jsx_runtime.jsx)("li",{// TODO extract TabListItem
role:"tab",tabIndex:selectedValue===value?0:-1,"aria-selected":selectedValue===value,ref:ref=>{tabRefs.push(ref);},onKeyDown:handleKeydown,onClick:handleTabChange,...attributes,className:(0,clsx/* default */.A)('tabs__item',styles_module.tabItem,attributes?.className,{'tabs__item--active':selectedValue===value}),children:label??value},value))});}function TabContent({children}){return/*#__PURE__*/(0,jsx_runtime.jsx)("div",{className:"margin-top--md",children:children});}function TabsContainer({className,children}){return/*#__PURE__*/(0,jsx_runtime.jsxs)("div",{className:(0,clsx/* default */.A)(ThemeClassNames/* ThemeClassNames */.G.tabs.container,// former name kept for backward compatibility
// see https://github.com/facebook/docusaurus/pull/4086
'tabs-container',styles_module.tabList),children:[/*#__PURE__*/(0,jsx_runtime.jsx)(TabList// Surprising but historical
// className is applied on TabList, not on TabsContainer
,{className:className}),/*#__PURE__*/(0,jsx_runtime.jsx)(TabContent,{children:children})]});}function Tabs(props){const isBrowser=(0,useIsBrowser/* default */.A)();const value=(0,tabsUtils/* useTabsContextValue */.OC)(props);return/*#__PURE__*/(0,jsx_runtime.jsx)(tabsUtils/* TabsProvider */.O_,{value:value// Remount tabs after hydration
// Temporary fix for https://github.com/facebook/docusaurus/issues/5653
,children:/*#__PURE__*/(0,jsx_runtime.jsx)(TabsContainer,{className:props.className,children:(0,tabsUtils/* sanitizeTabsChildren */.vT)(props.children)})},String(isBrowser));}

/***/ },

/***/ 75373
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   OC: () => (/* binding */ useTabsContextValue),
/* harmony export */   O_: () => (/* binding */ TabsProvider),
/* harmony export */   uc: () => (/* binding */ useTabs),
/* harmony export */   vT: () => (/* binding */ sanitizeTabsChildren)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(63696);
/* harmony import */ var _docusaurus_router__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(49519);
/* harmony import */ var _docusaurus_useIsomorphicLayoutEffect__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(14395);
/* harmony import */ var _docusaurus_theme_common_internal__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(35043);
/* harmony import */ var _index__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(94243);
/* harmony import */ var _index__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(44544);
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(62540);
/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */function sanitizeTabsChildren(children){return react__WEBPACK_IMPORTED_MODULE_0__.Children.toArray(children).filter(child=>child!=='\n');}function extractChildrenTabValues(children){// ✅ <TabItem value="red"/> => true
// ✅ <CustomTabItem value="red"/> => true
// ❌ <RedTabItem value="tab-value"/> => requires <Tabs values> prop
function isTabItemWithValueProp(comp){const{props}=comp;return!!props&&typeof props==='object'&&'value'in props;}const elements=react__WEBPACK_IMPORTED_MODULE_0__.Children.toArray(children).flatMap(child=>{// Historical case, not sure when it happens, do we really need this?
if(!child){return[];}if(/*#__PURE__*/(0,react__WEBPACK_IMPORTED_MODULE_0__.isValidElement)(child)&&isTabItemWithValueProp(child)){return[child];}// child.type.name will give non-sensical values in prod because of
// minification, but we assume it won't throw in prod.
const badChildTypeName=// @ts-expect-error: guarding against unexpected cases
typeof child.type==='string'?child.type:child.type.name;throw new Error(`Docusaurus error: Bad <Tabs> child <${badChildTypeName}>: all children of the <Tabs> component should be <TabItem>, and every <TabItem> should have a unique "value" prop.
If you do not want to pass on a "value" prop to the direct children of <Tabs>, you can also pass an explicit <Tabs values={...}> prop.`);});return elements.map(({props:{value,label,attributes,default:isDefault}})=>({value,label,attributes,default:isDefault}));}function ensureNoDuplicateValue(values){const dup=(0,_index__WEBPACK_IMPORTED_MODULE_5__/* .duplicates */ .XI)(values,(a,b)=>a.value===b.value);if(dup.length>0){throw new Error(`Docusaurus error: Duplicate values "${dup.map(a=>`'${a.value}'`).join(', ')}" found in <Tabs>. Every value needs to be unique.`);}}function useTabValues(props){const{values:valuesProp,children}=props;return (0,react__WEBPACK_IMPORTED_MODULE_0__.useMemo)(()=>{const values=valuesProp??extractChildrenTabValues(children);ensureNoDuplicateValue(values);return values;},[valuesProp,children]);}function isValidValue({value,tabValues}){return tabValues.some(a=>a.value===value);}function getInitialStateValue({defaultValue,tabValues}){if(tabValues.length===0){throw new Error('Docusaurus error: the <Tabs> component requires at least one <TabItem> children component');}if(defaultValue){// Warn user about passing incorrect defaultValue as prop.
if(!isValidValue({value:defaultValue,tabValues})){throw new Error(`Docusaurus error: The <Tabs> has a defaultValue "${defaultValue}" but none of its children has the corresponding value. Available values are: ${tabValues.map(a=>a.value).join(', ')}. If you intend to show no default tab, use defaultValue={null} instead.`);}return defaultValue;}const defaultTabValue=tabValues.find(tabValue=>tabValue.default)??tabValues[0];if(!defaultTabValue){throw new Error('Unexpected error: 0 tabValues');}return defaultTabValue.value;}function getStorageKey(groupId){if(!groupId){return null;}return`docusaurus.tab.${groupId}`;}function getQueryStringKey({queryString=false,groupId}){if(typeof queryString==='string'){return queryString;}if(queryString===false){return null;}if(queryString===true&&!groupId){throw new Error(`Docusaurus error: The <Tabs> component groupId prop is required if queryString=true, because this value is used as the search param name. You can also provide an explicit value such as queryString="my-search-param".`);}return groupId??null;}function useTabQueryString({queryString=false,groupId}){const history=(0,_docusaurus_router__WEBPACK_IMPORTED_MODULE_1__/* .useHistory */ .W6)();const key=getQueryStringKey({queryString,groupId});const value=(0,_docusaurus_theme_common_internal__WEBPACK_IMPORTED_MODULE_3__/* .useQueryStringValue */ .aZ)(key);const setValue=(0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)(newValue=>{if(!key){return;// no-op
}const searchParams=new URLSearchParams(history.location.search);searchParams.set(key,newValue);history.replace({...history.location,search:searchParams.toString()});},[key,history]);return[value,setValue];}function useTabStorage({groupId}){const key=getStorageKey(groupId);const[value,storageSlot]=(0,_index__WEBPACK_IMPORTED_MODULE_4__/* .useStorageSlot */ .Dv)(key);const setValue=(0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)(newValue=>{if(!key){return;// no-op
}storageSlot.set(newValue);},[key,storageSlot]);return[value,setValue];}function useTabsContextValue(props){const{defaultValue,queryString=false,groupId}=props;const tabValues=useTabValues(props);const[selectedValue,setSelectedValue]=(0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(()=>getInitialStateValue({defaultValue,tabValues}));const[queryStringValue,setQueryString]=useTabQueryString({queryString,groupId});const[storageValue,setStorageValue]=useTabStorage({groupId});// We sync valid querystring/storage value to state on change + hydration
const valueToSync=(()=>{const value=queryStringValue??storageValue;if(!isValidValue({value,tabValues})){return null;}return value;})();// Sync in a layout/sync effect is important, for useScrollPositionBlocker
// See https://github.com/facebook/docusaurus/issues/8625
(0,_docusaurus_useIsomorphicLayoutEffect__WEBPACK_IMPORTED_MODULE_2__/* ["default"] */ .A)(()=>{if(valueToSync){setSelectedValue(valueToSync);}},[valueToSync]);const selectValue=(0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)(newValue=>{if(!isValidValue({value:newValue,tabValues})){throw new Error(`Can't select invalid tab value=${newValue}`);}setSelectedValue(newValue);setQueryString(newValue);setStorageValue(newValue);},[setQueryString,setStorageValue,tabValues]);return{selectedValue,selectValue,tabValues,lazy:props.lazy??false,block:props.block??false};}const TabsContext=/*#__PURE__*/(0,react__WEBPACK_IMPORTED_MODULE_0__.createContext)(null);function useTabs(){const contextValue=react__WEBPACK_IMPORTED_MODULE_0__.useContext(TabsContext);if(!contextValue){throw new Error('useTabsContext() must be used within a Tabs component');}return contextValue;}function TabsProvider(props){return/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(TabsContext.Provider,{value:props.value,children:props.children});}

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