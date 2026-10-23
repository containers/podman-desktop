"use strict";
(globalThis["webpackChunkdocs"] = globalThis["webpackChunkdocs"] || []).push([[96322],{

/***/ 36383
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  assets: () => (/* binding */ assets),
  contentTitle: () => (/* binding */ contentTitle),
  "default": () => (/* binding */ MDXContent),
  frontMatter: () => (/* binding */ frontMatter),
  metadata: () => (/* reexport */ site_docs_migrating_from_docker_managing_docker_compatibility_mdx_d9d_namespaceObject),
  toc: () => (/* binding */ toc)
});

;// ./.docusaurus/docusaurus-plugin-content-docs/default/site-docs-migrating-from-docker-managing-docker-compatibility-mdx-d9d.json
const site_docs_migrating_from_docker_managing_docker_compatibility_mdx_d9d_namespaceObject = /*#__PURE__*/JSON.parse('{"id":"migrating-from-docker/managing-docker-compatibility","title":"Managing Docker compatibility","description":"Covers configurations available to manage docker compatibility","source":"@site/docs/migrating-from-docker/managing-docker-compatibility.mdx","sourceDirName":"migrating-from-docker","slug":"/migrating-from-docker/managing-docker-compatibility","permalink":"/docs/migrating-from-docker/managing-docker-compatibility","draft":false,"unlisted":false,"editUrl":"https://github.com/podman-desktop/podman-desktop/tree/main/website/docs/migrating-from-docker/managing-docker-compatibility.mdx","tags":[{"inline":true,"label":"managing-docker-compatibility","permalink":"/docs/tags/managing-docker-compatibility"}],"version":"current","sidebarPosition":5,"frontMatter":{"sidebar_position":5,"title":"Managing Docker compatibility","description":"Covers configurations available to manage docker compatibility","keywords":["podman desktop","podman","docker","compatibility"],"tags":["managing-docker-compatibility"]},"sidebar":"mySidebar","previous":{"title":"Aliasing the Docker CLI","permalink":"/docs/migrating-from-docker/aliasing-the-docker-cli"},"next":{"title":"Using the `DOCKER_HOST` environment variable","permalink":"/docs/migrating-from-docker/using-the-docker_host-environment-variable"}}');
// EXTERNAL MODULE: ../node_modules/react/jsx-runtime.js
var jsx_runtime = __webpack_require__(62540);
// EXTERNAL MODULE: ../node_modules/@mdx-js/react/lib/index.js
var lib = __webpack_require__(43023);
// EXTERNAL MODULE: ../node_modules/@docusaurus/theme-classic/lib/theme/Tabs/index.js + 1 modules
var Tabs = __webpack_require__(49479);
// EXTERNAL MODULE: ../node_modules/@docusaurus/theme-classic/lib/theme/TabItem/index.js + 1 modules
var TabItem = __webpack_require__(22491);
;// ./docs/migrating-from-docker/managing-docker-compatibility.mdx


const frontMatter = {
	sidebar_position: 5,
	title: 'Managing Docker compatibility',
	description: 'Covers configurations available to manage docker compatibility',
	keywords: [
		'podman desktop',
		'podman',
		'docker',
		'compatibility'
	],
	tags: [
		'managing-docker-compatibility'
	]
};
const contentTitle = 'Managing Docker compatibility';

const assets = {

};





const toc = [{
  "value": "Prerequisites",
  "id": "prerequisites",
  "level": 4
}, {
  "value": "Procedure",
  "id": "procedure",
  "level": 4
}, {
  "value": "Procedure",
  "id": "procedure-1",
  "level": 4
}, {
  "value": "Procedure",
  "id": "procedure-2",
  "level": 4
}, {
  "value": "Verification",
  "id": "verification",
  "level": 4
}, {
  "value": "Aliasing the Docker CLI",
  "id": "aliasing-the-docker-cli",
  "level": 2
}, {
  "value": "Additional resources",
  "id": "additional-resources",
  "level": 4
}];
function _createMdxContent(props) {
  const _components = {
    a: "a",
    code: "code",
    em: "em",
    h1: "h1",
    h2: "h2",
    h4: "h4",
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
        id: "managing-docker-compatibility",
        children: "Managing Docker compatibility"
      })
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["With Podman Desktop, you can configure a Docker-compatible environment using the ", (0,jsx_runtime.jsx)(_components.strong, {
        children: "Settings"
      }), " page. After configuration, your Docker tools are directed to use a Podman engine and your Compose applications can be run using the Podman CLI."]
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "As a developer, you can:"
    }), "\n", (0,jsx_runtime.jsxs)(_components.ul, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: ["\n", (0,jsx_runtime.jsx)(_components.p, {
          children: "Check the system socket mapping status to know whether the socket is reachable. The default socket path is:"
        }), "\n", (0,jsx_runtime.jsxs)(_components.ul, {
          children: ["\n", (0,jsx_runtime.jsxs)(_components.li, {
            children: [(0,jsx_runtime.jsx)(_components.em, {
              children: "/var/run/docker.sock"
            }), " on macOS and Linux"]
          }), "\n", (0,jsx_runtime.jsxs)(_components.li, {
            children: [(0,jsx_runtime.jsx)(_components.em, {
              children: "npipe:////./pipe/docker_engine"
            }), " on Windows"]
          }), "\n"]
        }), "\n"]
      }), "\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
          children: ["Use all Docker tools, including CLI, with the Podman engine without any reconfiguration. These tools connect to the default Podman socket, thereby enabling you to use all Docker commands with Podman. For example, you can run the ", (0,jsx_runtime.jsx)(_components.code, {
            children: "docker run"
          }), " command on the Podman engine to start a container."]
        }), "\n", (0,jsx_runtime.jsxs)(_components.ul, {
          children: ["\n", (0,jsx_runtime.jsxs)(_components.li, {
            children: ["On macOS, the ", (0,jsx_runtime.jsx)(_components.strong, {
              children: "Third-Party Docker Tool Compatibility"
            }), " setting is enabled by default."]
          }), "\n", (0,jsx_runtime.jsxs)(_components.li, {
            children: ["On Windows and Linux, the ", (0,jsx_runtime.jsx)(_components.strong, {
              children: "Third-Party Docker Tool Compatibility"
            }), " setting is not available. You can ", (0,jsx_runtime.jsxs)(_components.a, {
              href: "/docs/migrating-from-docker/using-the-docker_host-environment-variable",
              children: ["use the ", (0,jsx_runtime.jsx)(_components.code, {
                children: "DOCKER_HOST"
              }), " environment variable"]
            }), " to let your tools communicate directly with the Podman socket."]
          }), "\n"]
        }), "\n"]
      }), "\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: ["\n", (0,jsx_runtime.jsxs)(_components.p, {
          children: ["Use the Podman CLI to run Compose applications by installing and setting up the ", (0,jsx_runtime.jsx)(_components.a, {
            href: "/docs/compose",
            children: "Compose extension"
          }), ". For example, you can run the ", (0,jsx_runtime.jsx)(_components.code, {
            children: "docker compose up"
          }), " command on the Podman engine to start your Compose v2 application. Also, ensure to place your Docker Compose file in a working directory, such as your home directory."]
        }), "\n", (0,jsx_runtime.jsxs)(_components.ul, {
          children: ["\n", (0,jsx_runtime.jsx)(_components.li, {
            children: "If the Compose CLI is not installed, you get the install option in the settings."
          }), "\n"]
        }), "\n"]
      }), "\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: ["\n", (0,jsx_runtime.jsx)(_components.p, {
          children: "Select and use a Docker-compatible socket context. You can also view the socket details, such as name and socket path."
        }), "\n"]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "prerequisites",
      children: "Prerequisites"
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Make sure you have:"
    }), "\n", (0,jsx_runtime.jsxs)(_components.ul, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: [(0,jsx_runtime.jsx)(_components.a, {
          href: "/docs/podman/creating-a-podman-machine",
          children: "A running Podman machine"
        }), "."]
      }), "\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: ["Enabled the ", (0,jsx_runtime.jsx)(_components.a, {
          href: "/docs/migrating-from-docker/customizing-docker-compatibility#enable-docker-compatibility",
          children: "Docker compatibility"
        }), " feature."]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsxs)(Tabs/* default */.A, {
      children: [(0,jsx_runtime.jsxs)(TabItem/* default */.A, {
        value: "win",
        label: "Windows",
        className: "markdown",
        children: [(0,jsx_runtime.jsx)(_components.h4, {
          id: "procedure",
          children: "Procedure"
        }), (0,jsx_runtime.jsxs)(_components.ol, {
          children: ["\n", (0,jsx_runtime.jsxs)(_components.li, {
            children: ["Go to ", (0,jsx_runtime.jsx)(_components.strong, {
              children: "Settings > Docker Compatibility"
            }), "."]
          }), "\n", (0,jsx_runtime.jsxs)(_components.li, {
            children: [(0,jsx_runtime.jsx)(_components.strong, {
              children: "System socket status"
            }), " setting: View the socket mapping status to check whether the socket is reachable."]
          }), "\n", (0,jsx_runtime.jsxs)(_components.li, {
            children: [(0,jsx_runtime.jsx)(_components.strong, {
              children: "Docker CLI Context"
            }), " setting: Select a socket context to work with from the dropdown list."]
          }), "\n", (0,jsx_runtime.jsxs)(_components.li, {
            children: [(0,jsx_runtime.jsx)(_components.strong, {
              children: "Podman Compose CLI Support"
            }), " setting: Check whether the Podman Compose CLI is supported. If not, use the ", (0,jsx_runtime.jsx)(_components.strong, {
              children: "Setup..."
            }), " button to install and set up the CLI.\n", (0,jsx_runtime.jsx)(_components.img, {
              alt: "Docker compatibility page on Windows",
              src: (__webpack_require__(82692)/* ["default"] */ .A) + "",
              width: "1644",
              height: "892"
            })]
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
            children: ["Go to ", (0,jsx_runtime.jsx)(_components.strong, {
              children: "Settings > Docker Compatibility"
            }), "."]
          }), "\n", (0,jsx_runtime.jsxs)(_components.li, {
            children: [(0,jsx_runtime.jsx)(_components.strong, {
              children: "System socket status"
            }), " setting: View the socket mapping status to check whether the socket is reachable."]
          }), "\n", (0,jsx_runtime.jsxs)(_components.li, {
            children: [(0,jsx_runtime.jsx)(_components.strong, {
              children: "Docker CLI Context"
            }), " setting: Select a socket context to work with from the dropdown list."]
          }), "\n", (0,jsx_runtime.jsxs)(_components.li, {
            children: [(0,jsx_runtime.jsx)(_components.strong, {
              children: "Podman Compose CLI Support"
            }), " setting: Check whether the Podman Compose CLI is supported. If not, use the ", (0,jsx_runtime.jsx)(_components.strong, {
              children: "Setup..."
            }), " button to install and set up the CLI."]
          }), "\n", (0,jsx_runtime.jsxs)(_components.li, {
            children: [(0,jsx_runtime.jsx)(_components.strong, {
              children: "Third-Party Docker Tool Compatibility"
            }), " setting: Customize the setting, if needed. When enabled, you can use third-party Docker tools with Podman.\n", (0,jsx_runtime.jsx)(_components.img, {
              alt: "Docker compatibility page on macOS",
              src: (__webpack_require__(96148)/* ["default"] */ .A) + "",
              width: "1326",
              height: "654"
            })]
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
            children: ["Go to ", (0,jsx_runtime.jsx)(_components.strong, {
              children: "Settings > Docker Compatibility"
            }), "."]
          }), "\n", (0,jsx_runtime.jsxs)(_components.li, {
            children: [(0,jsx_runtime.jsx)(_components.strong, {
              children: "System socket status"
            }), " setting: View the socket mapping status to check whether the socket is reachable."]
          }), "\n", (0,jsx_runtime.jsxs)(_components.li, {
            children: [(0,jsx_runtime.jsx)(_components.strong, {
              children: "Docker CLI Context"
            }), " setting: Select a socket context to work with from the dropdown list."]
          }), "\n", (0,jsx_runtime.jsxs)(_components.li, {
            children: [(0,jsx_runtime.jsx)(_components.strong, {
              children: "Podman Compose CLI Support"
            }), " setting: Check whether the Podman Compose CLI is supported. If not, use the ", (0,jsx_runtime.jsx)(_components.strong, {
              children: "Setup..."
            }), " button to install and set up the CLI.\n", (0,jsx_runtime.jsx)(_components.img, {
              alt: "Docker compatibility page on Linux",
              src: (__webpack_require__(22345)/* ["default"] */ .A) + "",
              width: "794",
              height: "304"
            })]
          }), "\n"]
        })]
      })]
    }), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "verification",
      children: "Verification"
    }), "\n", (0,jsx_runtime.jsxs)(_components.ul, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: ["Run ", (0,jsx_runtime.jsx)(_components.code, {
          children: "podman"
        }), " or ", (0,jsx_runtime.jsx)(_components.code, {
          children: "podman compose"
        }), " commands for your Compose applications to check if they run fine."]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsx)(_components.h2, {
      id: "aliasing-the-docker-cli",
      children: "Aliasing the Docker CLI"
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["If the ", (0,jsx_runtime.jsx)(_components.code, {
        children: "docker"
      }), " command is not available, for example because you removed Docker Desktop, you can make ", (0,jsx_runtime.jsx)(_components.code, {
        children: "docker"
      }), " run Podman instead. See ", (0,jsx_runtime.jsx)(_components.a, {
        href: "/docs/migrating-from-docker/aliasing-the-docker-cli",
        children: "Aliasing the Docker CLI"
      }), "."]
    }), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "additional-resources",
      children: "Additional resources"
    }), "\n", (0,jsx_runtime.jsxs)(_components.ul, {
      children: ["\n", (0,jsx_runtime.jsx)(_components.li, {
        children: (0,jsx_runtime.jsx)(_components.a, {
          href: "/docs/migrating-from-docker/aliasing-the-docker-cli",
          children: "Aliasing the Docker CLI"
        })
      }), "\n", (0,jsx_runtime.jsx)(_components.li, {
        children: (0,jsx_runtime.jsx)(_components.a, {
          href: "/docs/migrating-from-docker/customizing-docker-compatibility",
          children: "Customizing Docker compatibility"
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

/***/ 22345
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   A: () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (__webpack_require__.p + "assets/images/docker-compatibility-page-on-linux-72710529b93f08fe4164b6f2eb0c13d2.png");

/***/ },

/***/ 96148
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   A: () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (__webpack_require__.p + "assets/images/docker-compatibility-page-on-macOS-116432aba610ddadcc8fc453a15b8ce0.png");

/***/ },

/***/ 82692
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   A: () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (__webpack_require__.p + "assets/images/docker-compatibility-page-on-windows-12c9100d7e053da179d36f18ef68ee19.png");

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