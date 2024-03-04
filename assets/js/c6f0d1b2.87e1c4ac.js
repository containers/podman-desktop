"use strict";(self.webpackChunkdocs=self.webpackChunkdocs||[]).push([[88626],{11341:(n,i,s)=>{s.r(i),s.d(i,{assets:()=>d,contentTitle:()=>a,default:()=>m,frontMatter:()=>o,metadata:()=>l,toc:()=>r});var e=s(24246),t=s(71670);const o={sidebar_position:10,title:"Installing Podman",description:"Podman Desktop can assist you to install Podman on Windows and macOS.",tags:["podman-desktop","podman","installing","windows"],keywords:["podman desktop","containers","podman","installing","installation","windows","macos"]},a="Installing Podman with Podman Desktop",l={id:"podman/installing",title:"Installing Podman",description:"Podman Desktop can assist you to install Podman on Windows and macOS.",source:"@site/docs/podman/installing.md",sourceDirName:"podman",slug:"/podman/installing",permalink:"/docs/podman/installing",draft:!1,unlisted:!1,editUrl:"https://github.com/containers/podman-desktop/tree/main/website/docs/podman/installing.md",tags:[{label:"podman-desktop",permalink:"/docs/tags/podman-desktop"},{label:"podman",permalink:"/docs/tags/podman"},{label:"installing",permalink:"/docs/tags/installing"},{label:"windows",permalink:"/docs/tags/windows"}],version:"current",sidebarPosition:10,frontMatter:{sidebar_position:10,title:"Installing Podman",description:"Podman Desktop can assist you to install Podman on Windows and macOS.",tags:["podman-desktop","podman","installing","windows"],keywords:["podman desktop","containers","podman","installing","installation","windows","macos"]},sidebar:"mySidebar",previous:{title:"Podman",permalink:"/docs/podman/"},next:{title:"Creating a Podman machine",permalink:"/docs/podman/creating-a-podman-machine"}},d={},r=[{value:"Prerequisites",id:"prerequisites",level:4},{value:"Procedure",id:"procedure",level:4},{value:"Additional resources",id:"additional-resources",level:4},{value:"Next steps",id:"next-steps",level:4}];function c(n){const i={a:"a",code:"code",em:"em",h1:"h1",h4:"h4",li:"li",ol:"ol",p:"p",pre:"pre",strong:"strong",ul:"ul",...(0,t.a)(),...n.components};return(0,e.jsxs)(e.Fragment,{children:[(0,e.jsx)(i.h1,{id:"installing-podman-with-podman-desktop",children:"Installing Podman with Podman Desktop"}),"\n",(0,e.jsx)(i.p,{children:"On Windows and macOS, running the Podman container engine requires running a Linux distribution on a virtual machine.\nPodman Desktop can assist you to install the Podman container engine in a Fedora distribution of Linux, on a virtual machine."}),"\n",(0,e.jsx)(i.p,{children:"Main benefits are:"}),"\n",(0,e.jsxs)(i.ul,{children:["\n",(0,e.jsx)(i.li,{children:"Ease of use."}),"\n",(0,e.jsx)(i.li,{children:"On Windows: Windows Subsystem for Linux version 2 (WSL 2) native virtualization performance."}),"\n"]}),"\n",(0,e.jsx)(i.h4,{id:"prerequisites",children:"Prerequisites"}),"\n",(0,e.jsxs)(i.ul,{children:["\n",(0,e.jsx)(i.li,{children:"Podman is not installed."}),"\n",(0,e.jsx)(i.li,{children:"6 GB RAM."}),"\n",(0,e.jsx)(i.li,{children:"The host runs Windows or macOS."}),"\n",(0,e.jsxs)(i.li,{children:["Windows prerequisites:","\n",(0,e.jsxs)(i.ul,{children:["\n",(0,e.jsxs)(i.li,{children:[(0,e.jsx)(i.a,{href:"https://learn.microsoft.com/en-us/windows/wsl/troubleshooting#error-0x80370102-the-virtual-machine-could-not-be-started-because-a-required-feature-is-not-installed",children:"WSL prerequisites"}),":","\n",(0,e.jsxs)(i.ul,{children:["\n",(0,e.jsx)(i.li,{children:"User with administrator privileges."}),"\n",(0,e.jsx)(i.li,{children:"Windows 64bit."}),"\n",(0,e.jsx)(i.li,{children:"Windows 10 Build 19043 or greater, or Windows 11."}),"\n",(0,e.jsxs)(i.li,{children:["On a virtual machine: ",(0,e.jsx)(i.a,{href:"https://learn.microsoft.com/en-us/virtualization/hyper-v-on-windows/user-guide/nested-virtualization#configure-nested-virtualization",children:"Nested Virtualization enabled"}),"."]}),"\n"]}),"\n"]}),"\n",(0,e.jsx)(i.li,{children:"No WSL 2 Linux virtual machine is running."}),"\n"]}),"\n"]}),"\n"]}),"\n",(0,e.jsx)(i.h4,{id:"procedure",children:"Procedure"}),"\n",(0,e.jsxs)(i.ol,{children:["\n",(0,e.jsxs)(i.li,{children:["\n",(0,e.jsxs)(i.p,{children:["(On Windows) Enable the WSL feature without installing the default Ubuntu distribution of Linux.\nSee ",(0,e.jsx)(i.a,{href:"https://docs.microsoft.com/en-us/windows/wsl/install",children:"Enabling WSL 2"})," and ",(0,e.jsx)(i.a,{href:"https://learn.microsoft.com/en-us/windows/wsl/basic-commands",children:"WSL basic commands"}),":"]}),"\n",(0,e.jsx)(i.pre,{children:(0,e.jsx)(i.code,{className:"language-powershell",children:"wsl --install --no-distribution\n"})}),"\n"]}),"\n",(0,e.jsxs)(i.li,{children:["\n",(0,e.jsxs)(i.p,{children:["The ",(0,e.jsx)(i.strong,{children:"Home"})," screen displays ",(0,e.jsx)(i.em,{children:"Podman Desktop was not able to find an installation of Podman"}),".\nClick ",(0,e.jsx)(i.strong,{children:"Install"}),"."]}),"\n"]}),"\n",(0,e.jsxs)(i.li,{children:["\n",(0,e.jsx)(i.p,{children:"Podman Desktop checks the prerequisites to install Podman.\nWhen necessary, follow the instructions to install prerequisites."}),"\n"]}),"\n",(0,e.jsxs)(i.li,{children:["\n",(0,e.jsxs)(i.p,{children:["Podman displays the dialog: ",(0,e.jsx)(i.em,{children:"Podman is not installed on this system, would you like to install Podman?"}),".\nClick ",(0,e.jsx)(i.code,{children:"Yes"})," to install Podman, and follow the installation program instructions."]}),"\n"]}),"\n",(0,e.jsxs)(i.li,{children:["\n",(0,e.jsxs)(i.p,{children:["Click ",(0,e.jsx)(i.strong,{children:"Initialize Podman"}),"."]}),"\n"]}),"\n"]}),"\n",(0,e.jsx)(i.h4,{id:"additional-resources",children:"Additional resources"}),"\n",(0,e.jsxs)(i.ul,{children:["\n",(0,e.jsxs)(i.li,{children:[(0,e.jsx)(i.a,{href:"https://learn.microsoft.com/en-us/windows/wsl/about#what-is-wsl-2",children:"Understanding WSL 2"}),"."]}),"\n"]}),"\n",(0,e.jsx)(i.h4,{id:"next-steps",children:"Next steps"}),"\n",(0,e.jsxs)(i.ul,{children:["\n",(0,e.jsx)(i.li,{children:(0,e.jsx)(i.a,{href:"/docs/containers",children:"Getting Started with Podman Desktop"})}),"\n"]})]})}function m(n={}){const{wrapper:i}={...(0,t.a)(),...n.components};return i?(0,e.jsx)(i,{...n,children:(0,e.jsx)(c,{...n})}):c(n)}},71670:(n,i,s)=>{s.d(i,{Z:()=>l,a:()=>a});var e=s(27378);const t={},o=e.createContext(t);function a(n){const i=e.useContext(o);return e.useMemo((function(){return"function"==typeof n?n(i):{...i,...n}}),[i,n])}function l(n){let i;return i=n.disableParentContext?"function"==typeof n.components?n.components(t):n.components||t:a(n.components),e.createElement(o.Provider,{value:i},n.children)}}}]);