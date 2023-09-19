"use strict";(self.webpackChunkdocs=self.webpackChunkdocs||[]).push([[5376],{35318:(e,n,t)=>{t.d(n,{Zo:()=>m,kt:()=>u});var o=t(27378);function a(e,n,t){return n in e?Object.defineProperty(e,n,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[n]=t,e}function i(e,n){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);n&&(o=o.filter((function(n){return Object.getOwnPropertyDescriptor(e,n).enumerable}))),t.push.apply(t,o)}return t}function r(e){for(var n=1;n<arguments.length;n++){var t=null!=arguments[n]?arguments[n]:{};n%2?i(Object(t),!0).forEach((function(n){a(e,n,t[n])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):i(Object(t)).forEach((function(n){Object.defineProperty(e,n,Object.getOwnPropertyDescriptor(t,n))}))}return e}function c(e,n){if(null==e)return{};var t,o,a=function(e,n){if(null==e)return{};var t,o,a={},i=Object.keys(e);for(o=0;o<i.length;o++)t=i[o],n.indexOf(t)>=0||(a[t]=e[t]);return a}(e,n);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(o=0;o<i.length;o++)t=i[o],n.indexOf(t)>=0||Object.prototype.propertyIsEnumerable.call(e,t)&&(a[t]=e[t])}return a}var l=o.createContext({}),s=function(e){var n=o.useContext(l),t=n;return e&&(t="function"==typeof e?e(n):r(r({},n),e)),t},m=function(e){var n=s(e.components);return o.createElement(l.Provider,{value:n},e.children)},p={inlineCode:"code",wrapper:function(e){var n=e.children;return o.createElement(o.Fragment,{},n)}},d=o.forwardRef((function(e,n){var t=e.components,a=e.mdxType,i=e.originalType,l=e.parentName,m=c(e,["components","mdxType","originalType","parentName"]),d=s(t),u=a,h=d["".concat(l,".").concat(u)]||d[u]||p[u]||i;return t?o.createElement(h,r(r({ref:n},m),{},{components:t})):o.createElement(h,r({ref:n},m))}));function u(e,n){var t=arguments,a=n&&n.mdxType;if("string"==typeof e||a){var i=t.length,r=new Array(i);r[0]=d;var c={};for(var l in n)hasOwnProperty.call(n,l)&&(c[l]=n[l]);c.originalType=e,c.mdxType="string"==typeof e?e:a,r[1]=c;for(var s=2;s<i;s++)r[s]=t[s];return o.createElement.apply(null,r)}return o.createElement.apply(null,t)}d.displayName="MDXCreateElement"},61610:(e,n,t)=>{t.r(n),t.d(n,{assets:()=>l,contentTitle:()=>r,default:()=>p,frontMatter:()=>i,metadata:()=>c,toc:()=>s});var o=t(25773),a=(t(27378),t(35318));const i={sidebar_position:50,title:"Setting Podman machine default connection",description:"How to set Podman machine default connection."},r="Setting Podman machine default connection",c={unversionedId:"working-with-containers/switching-podman-machine-default-connection",id:"working-with-containers/switching-podman-machine-default-connection",title:"Setting Podman machine default connection",description:"How to set Podman machine default connection.",source:"@site/docs/working-with-containers/switching-podman-machine-default-connection.md",sourceDirName:"working-with-containers",slug:"/working-with-containers/switching-podman-machine-default-connection",permalink:"/docs/working-with-containers/switching-podman-machine-default-connection",draft:!1,editUrl:"https://github.com/containers/podman-desktop/tree/main/website/docs/working-with-containers/switching-podman-machine-default-connection.md",tags:[],version:"current",sidebarPosition:50,frontMatter:{sidebar_position:50,title:"Setting Podman machine default connection",description:"How to set Podman machine default connection."},sidebar:"mySidebar",previous:{title:"Pods",permalink:"/docs/working-with-containers/creating-a-pod"},next:{title:"Migrating from Docker",permalink:"/docs/migrating-from-docker/"}},l={},s=[{value:"Procedure",id:"procedure",level:4},{value:"Verification",id:"verification",level:4}],m={toc:s};function p(e){let{components:n,...t}=e;return(0,a.kt)("wrapper",(0,o.Z)({},m,t,{components:n,mdxType:"MDXLayout"}),(0,a.kt)("h1",{id:"setting-podman-machine-default-connection"},"Setting Podman machine default connection"),(0,a.kt)("p",null,"Each Podman machine exposes two connections:"),(0,a.kt)("ul",null,(0,a.kt)("li",{parentName:"ul"},"rootless"),(0,a.kt)("li",{parentName:"ul"},"rootful")),(0,a.kt)("p",null,"Podman has one default connection."),(0,a.kt)("p",null,"Podman Desktop, and other tools, such as Kind, connect to the default connection."),(0,a.kt)("p",null,"After an event that might have changed the default Podman machine connection, such as creating another Podman machine, consider verifying and setting the default connection."),(0,a.kt)("h4",{id:"procedure"},"Procedure"),(0,a.kt)("ol",null,(0,a.kt)("li",{parentName:"ol"},(0,a.kt)("p",{parentName:"li"},"List Podman machine connections, in a terminal:"),(0,a.kt)("pre",{parentName:"li"},(0,a.kt)("code",{parentName:"pre",className:"language-shell-session"},"$ podman system connection ls\n"))),(0,a.kt)("li",{parentName:"ol"},(0,a.kt)("p",{parentName:"li"},"Set the Podman machine default connection to your desired connection, such as ",(0,a.kt)("inlineCode",{parentName:"p"},"podman-machine-default-root"),", in a terminal:"),(0,a.kt)("pre",{parentName:"li"},(0,a.kt)("code",{parentName:"pre",className:"language-shell-session"},"$ podman system connection default podman-machine-default-root\n"))),(0,a.kt)("li",{parentName:"ol"},(0,a.kt)("p",{parentName:"li"},"List Podman machine connections, to verify which is the default, in a terminal:"),(0,a.kt)("pre",{parentName:"li"},(0,a.kt)("code",{parentName:"pre",className:"language-shell-session"},"$ podman system connection ls\n"))),(0,a.kt)("li",{parentName:"ol"},(0,a.kt)("p",{parentName:"li"},"Restart the Podman machine that has the default connection:"),(0,a.kt)("pre",{parentName:"li"},(0,a.kt)("code",{parentName:"pre",className:"language-shell-session"},"$ podman mahine stop\n$ podman machine start\n"))),(0,a.kt)("li",{parentName:"ol"},(0,a.kt)("p",{parentName:"li"},"Refresh Podman Desktop connection to Podman: click the ",(0,a.kt)("strong",{parentName:"p"},(0,a.kt)("icon",{icon:"fa-solid fa-lightbulb",size:"lg"}))," icon to open the ",(0,a.kt)("strong",{parentName:"p"},"Troubleshooting")," page, and click the ",(0,a.kt)("strong",{parentName:"p"},"Reconnect providers")," button."))),(0,a.kt)("h4",{id:"verification"},"Verification"),(0,a.kt)("ul",null,(0,a.kt)("li",{parentName:"ul"},"Podman Desktop lists images, containers, and pods that are accessible via the desired Podman machine connection.")))}p.isMDXComponent=!0}}]);