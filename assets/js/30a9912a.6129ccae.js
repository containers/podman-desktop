"use strict";(self.webpackChunkdocs=self.webpackChunkdocs||[]).push([[16425],{89077:(e,i,s)=>{s.r(i),s.d(i,{assets:()=>t,contentTitle:()=>a,default:()=>h,frontMatter:()=>l,metadata:()=>d,toc:()=>c});const d=JSON.parse('{"id":"interfaces/ImageFilesProvider","title":"Interface: ImageFilesProvider","description":"Provider returned to the extension when calling createImageFilesProvider","source":"@site/api/interfaces/ImageFilesProvider.md","sourceDirName":"interfaces","slug":"/interfaces/ImageFilesProvider","permalink":"/api/interfaces/ImageFilesProvider","draft":false,"unlisted":false,"tags":[],"version":"current","frontMatter":{},"sidebar":"typedocSidebar","previous":{"title":"ImageFilesCallbacks","permalink":"/api/interfaces/ImageFilesCallbacks"},"next":{"title":"ImageFilesProviderMetadata","permalink":"/api/interfaces/ImageFilesProviderMetadata"}}');var n=s(62540),r=s(43023);const l={},a="Interface: ImageFilesProvider",t={},c=[{value:"Extends",id:"extends",level:2},{value:"Methods",id:"methods",level:2},{value:"addDirectory()",id:"adddirectory",level:3},{value:"Parameters",id:"parameters",level:4},{value:"layer",id:"layer",level:5},{value:"opts",id:"opts",level:5},{value:"opts.mode",id:"optsmode",level:6},{value:"opts.path",id:"optspath",level:6},{value:"Returns",id:"returns",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"addFile()",id:"addfile",level:3},{value:"Parameters",id:"parameters-1",level:4},{value:"layer",id:"layer-1",level:5},{value:"opts",id:"opts-1",level:5},{value:"opts.mode",id:"optsmode-1",level:6},{value:"opts.path",id:"optspath-1",level:6},{value:"opts.size",id:"optssize",level:6},{value:"Returns",id:"returns-1",level:4},{value:"Defined in",id:"defined-in-1",level:4},{value:"addOpaqueWhiteout()",id:"addopaquewhiteout",level:3},{value:"Parameters",id:"parameters-2",level:4},{value:"layer",id:"layer-2",level:5},{value:"path",id:"path",level:5},{value:"Returns",id:"returns-2",level:4},{value:"Defined in",id:"defined-in-2",level:4},{value:"addSymlink()",id:"addsymlink",level:3},{value:"Parameters",id:"parameters-3",level:4},{value:"layer",id:"layer-3",level:5},{value:"opts",id:"opts-2",level:5},{value:"opts.linkPath",id:"optslinkpath",level:6},{value:"opts.mode",id:"optsmode-2",level:6},{value:"opts.path",id:"optspath-2",level:6},{value:"Returns",id:"returns-3",level:4},{value:"Defined in",id:"defined-in-3",level:4},{value:"addWhiteout()",id:"addwhiteout",level:3},{value:"Parameters",id:"parameters-4",level:4},{value:"layer",id:"layer-4",level:5},{value:"path",id:"path-1",level:5},{value:"Returns",id:"returns-4",level:4},{value:"Defined in",id:"defined-in-4",level:4},{value:"dispose()",id:"dispose",level:3},{value:"Returns",id:"returns-5",level:4},{value:"Inherited from",id:"inherited-from",level:4},{value:"Defined in",id:"defined-in-5",level:4}];function o(e){const i={a:"a",blockquote:"blockquote",code:"code",h1:"h1",h2:"h2",h3:"h3",h4:"h4",h5:"h5",h6:"h6",header:"header",hr:"hr",li:"li",p:"p",strong:"strong",ul:"ul",...(0,r.R)(),...e.components};return(0,n.jsxs)(n.Fragment,{children:[(0,n.jsx)(i.header,{children:(0,n.jsx)(i.h1,{id:"interface-imagefilesprovider",children:"Interface: ImageFilesProvider"})}),"\n",(0,n.jsxs)(i.p,{children:["Provider returned to the extension when calling createImageFilesProvider\nProvides helper functions for building the response of the ",(0,n.jsx)(i.code,{children:"createImageFilesProvider"})," callback"]}),"\n",(0,n.jsx)(i.h2,{id:"extends",children:"Extends"}),"\n",(0,n.jsxs)(i.ul,{children:["\n",(0,n.jsx)(i.li,{children:(0,n.jsx)(i.a,{href:"/api/classes/Disposable",children:(0,n.jsx)(i.code,{children:"Disposable"})})}),"\n"]}),"\n",(0,n.jsx)(i.h2,{id:"methods",children:"Methods"}),"\n",(0,n.jsx)(i.h3,{id:"adddirectory",children:"addDirectory()"}),"\n",(0,n.jsxs)(i.blockquote,{children:["\n",(0,n.jsxs)(i.p,{children:[(0,n.jsx)(i.strong,{children:"addDirectory"}),"(",(0,n.jsx)(i.code,{children:"layer"}),", ",(0,n.jsx)(i.code,{children:"opts"}),"): ",(0,n.jsx)(i.a,{href:"/api/interfaces/ImageFilesProvider",children:(0,n.jsx)(i.code,{children:"ImageFilesProvider"})})]}),"\n"]}),"\n",(0,n.jsx)(i.p,{children:"add a directory to the layer"}),"\n",(0,n.jsx)(i.h4,{id:"parameters",children:"Parameters"}),"\n",(0,n.jsx)(i.h5,{id:"layer",children:"layer"}),"\n",(0,n.jsx)(i.p,{children:(0,n.jsx)(i.a,{href:"/api/interfaces/ImageFilesystemLayer",children:(0,n.jsx)(i.code,{children:"ImageFilesystemLayer"})})}),"\n",(0,n.jsx)(i.h5,{id:"opts",children:"opts"}),"\n",(0,n.jsx)(i.h6,{id:"optsmode",children:"opts.mode"}),"\n",(0,n.jsx)(i.p,{children:(0,n.jsx)(i.code,{children:"number"})}),"\n",(0,n.jsx)(i.h6,{id:"optspath",children:"opts.path"}),"\n",(0,n.jsx)(i.p,{children:(0,n.jsx)(i.code,{children:"string"})}),"\n",(0,n.jsx)(i.h4,{id:"returns",children:"Returns"}),"\n",(0,n.jsx)(i.p,{children:(0,n.jsx)(i.a,{href:"/api/interfaces/ImageFilesProvider",children:(0,n.jsx)(i.code,{children:"ImageFilesProvider"})})}),"\n",(0,n.jsx)(i.h4,{id:"defined-in",children:"Defined in"}),"\n",(0,n.jsx)(i.p,{children:(0,n.jsx)(i.a,{href:"https://github.com/podman-desktop/podman-desktop/blob/5c085c8d0c0c4ec614070ad7d98ec832fe05e718/packages/extension-api/src/extension-api.d.ts#L944",children:"packages/extension-api/src/extension-api.d.ts:944"})}),"\n",(0,n.jsx)(i.hr,{}),"\n",(0,n.jsx)(i.h3,{id:"addfile",children:"addFile()"}),"\n",(0,n.jsxs)(i.blockquote,{children:["\n",(0,n.jsxs)(i.p,{children:[(0,n.jsx)(i.strong,{children:"addFile"}),"(",(0,n.jsx)(i.code,{children:"layer"}),", ",(0,n.jsx)(i.code,{children:"opts"}),"): ",(0,n.jsx)(i.a,{href:"/api/interfaces/ImageFilesProvider",children:(0,n.jsx)(i.code,{children:"ImageFilesProvider"})})]}),"\n"]}),"\n",(0,n.jsx)(i.p,{children:"add a file to the layer"}),"\n",(0,n.jsx)(i.h4,{id:"parameters-1",children:"Parameters"}),"\n",(0,n.jsx)(i.h5,{id:"layer-1",children:"layer"}),"\n",(0,n.jsx)(i.p,{children:(0,n.jsx)(i.a,{href:"/api/interfaces/ImageFilesystemLayer",children:(0,n.jsx)(i.code,{children:"ImageFilesystemLayer"})})}),"\n",(0,n.jsx)(i.h5,{id:"opts-1",children:"opts"}),"\n",(0,n.jsx)(i.h6,{id:"optsmode-1",children:"opts.mode"}),"\n",(0,n.jsx)(i.p,{children:(0,n.jsx)(i.code,{children:"number"})}),"\n",(0,n.jsx)(i.h6,{id:"optspath-1",children:"opts.path"}),"\n",(0,n.jsx)(i.p,{children:(0,n.jsx)(i.code,{children:"string"})}),"\n",(0,n.jsx)(i.h6,{id:"optssize",children:"opts.size"}),"\n",(0,n.jsx)(i.p,{children:(0,n.jsx)(i.code,{children:"number"})}),"\n",(0,n.jsx)(i.h4,{id:"returns-1",children:"Returns"}),"\n",(0,n.jsx)(i.p,{children:(0,n.jsx)(i.a,{href:"/api/interfaces/ImageFilesProvider",children:(0,n.jsx)(i.code,{children:"ImageFilesProvider"})})}),"\n",(0,n.jsx)(i.h4,{id:"defined-in-1",children:"Defined in"}),"\n",(0,n.jsx)(i.p,{children:(0,n.jsx)(i.a,{href:"https://github.com/podman-desktop/podman-desktop/blob/5c085c8d0c0c4ec614070ad7d98ec832fe05e718/packages/extension-api/src/extension-api.d.ts#L940",children:"packages/extension-api/src/extension-api.d.ts:940"})}),"\n",(0,n.jsx)(i.hr,{}),"\n",(0,n.jsx)(i.h3,{id:"addopaquewhiteout",children:"addOpaqueWhiteout()"}),"\n",(0,n.jsxs)(i.blockquote,{children:["\n",(0,n.jsxs)(i.p,{children:[(0,n.jsx)(i.strong,{children:"addOpaqueWhiteout"}),"(",(0,n.jsx)(i.code,{children:"layer"}),", ",(0,n.jsx)(i.code,{children:"path"}),"): ",(0,n.jsx)(i.a,{href:"/api/interfaces/ImageFilesProvider",children:(0,n.jsx)(i.code,{children:"ImageFilesProvider"})})]}),"\n"]}),"\n",(0,n.jsx)(i.p,{children:"add a complete directory to remove from previous layers"}),"\n",(0,n.jsx)(i.h4,{id:"parameters-2",children:"Parameters"}),"\n",(0,n.jsx)(i.h5,{id:"layer-2",children:"layer"}),"\n",(0,n.jsx)(i.p,{children:(0,n.jsx)(i.a,{href:"/api/interfaces/ImageFilesystemLayer",children:(0,n.jsx)(i.code,{children:"ImageFilesystemLayer"})})}),"\n",(0,n.jsx)(i.h5,{id:"path",children:"path"}),"\n",(0,n.jsx)(i.p,{children:(0,n.jsx)(i.code,{children:"string"})}),"\n",(0,n.jsx)(i.h4,{id:"returns-2",children:"Returns"}),"\n",(0,n.jsx)(i.p,{children:(0,n.jsx)(i.a,{href:"/api/interfaces/ImageFilesProvider",children:(0,n.jsx)(i.code,{children:"ImageFilesProvider"})})}),"\n",(0,n.jsx)(i.h4,{id:"defined-in-2",children:"Defined in"}),"\n",(0,n.jsx)(i.p,{children:(0,n.jsx)(i.a,{href:"https://github.com/podman-desktop/podman-desktop/blob/5c085c8d0c0c4ec614070ad7d98ec832fe05e718/packages/extension-api/src/extension-api.d.ts#L958",children:"packages/extension-api/src/extension-api.d.ts:958"})}),"\n",(0,n.jsx)(i.hr,{}),"\n",(0,n.jsx)(i.h3,{id:"addsymlink",children:"addSymlink()"}),"\n",(0,n.jsxs)(i.blockquote,{children:["\n",(0,n.jsxs)(i.p,{children:[(0,n.jsx)(i.strong,{children:"addSymlink"}),"(",(0,n.jsx)(i.code,{children:"layer"}),", ",(0,n.jsx)(i.code,{children:"opts"}),"): ",(0,n.jsx)(i.a,{href:"/api/interfaces/ImageFilesProvider",children:(0,n.jsx)(i.code,{children:"ImageFilesProvider"})})]}),"\n"]}),"\n",(0,n.jsx)(i.p,{children:"add a symbolic link to the layer"}),"\n",(0,n.jsx)(i.h4,{id:"parameters-3",children:"Parameters"}),"\n",(0,n.jsx)(i.h5,{id:"layer-3",children:"layer"}),"\n",(0,n.jsx)(i.p,{children:(0,n.jsx)(i.a,{href:"/api/interfaces/ImageFilesystemLayer",children:(0,n.jsx)(i.code,{children:"ImageFilesystemLayer"})})}),"\n",(0,n.jsx)(i.h5,{id:"opts-2",children:"opts"}),"\n",(0,n.jsx)(i.h6,{id:"optslinkpath",children:"opts.linkPath"}),"\n",(0,n.jsx)(i.p,{children:(0,n.jsx)(i.code,{children:"string"})}),"\n",(0,n.jsx)(i.h6,{id:"optsmode-2",children:"opts.mode"}),"\n",(0,n.jsx)(i.p,{children:(0,n.jsx)(i.code,{children:"number"})}),"\n",(0,n.jsx)(i.h6,{id:"optspath-2",children:"opts.path"}),"\n",(0,n.jsx)(i.p,{children:(0,n.jsx)(i.code,{children:"string"})}),"\n",(0,n.jsx)(i.h4,{id:"returns-3",children:"Returns"}),"\n",(0,n.jsx)(i.p,{children:(0,n.jsx)(i.a,{href:"/api/interfaces/ImageFilesProvider",children:(0,n.jsx)(i.code,{children:"ImageFilesProvider"})})}),"\n",(0,n.jsx)(i.h4,{id:"defined-in-3",children:"Defined in"}),"\n",(0,n.jsx)(i.p,{children:(0,n.jsx)(i.a,{href:"https://github.com/podman-desktop/podman-desktop/blob/5c085c8d0c0c4ec614070ad7d98ec832fe05e718/packages/extension-api/src/extension-api.d.ts#L948",children:"packages/extension-api/src/extension-api.d.ts:948"})}),"\n",(0,n.jsx)(i.hr,{}),"\n",(0,n.jsx)(i.h3,{id:"addwhiteout",children:"addWhiteout()"}),"\n",(0,n.jsxs)(i.blockquote,{children:["\n",(0,n.jsxs)(i.p,{children:[(0,n.jsx)(i.strong,{children:"addWhiteout"}),"(",(0,n.jsx)(i.code,{children:"layer"}),", ",(0,n.jsx)(i.code,{children:"path"}),"): ",(0,n.jsx)(i.a,{href:"/api/interfaces/ImageFilesProvider",children:(0,n.jsx)(i.code,{children:"ImageFilesProvider"})})]}),"\n"]}),"\n",(0,n.jsx)(i.p,{children:"add a file or directory to remove from previous layers"}),"\n",(0,n.jsx)(i.h4,{id:"parameters-4",children:"Parameters"}),"\n",(0,n.jsx)(i.h5,{id:"layer-4",children:"layer"}),"\n",(0,n.jsx)(i.p,{children:(0,n.jsx)(i.a,{href:"/api/interfaces/ImageFilesystemLayer",children:(0,n.jsx)(i.code,{children:"ImageFilesystemLayer"})})}),"\n",(0,n.jsx)(i.h5,{id:"path-1",children:"path"}),"\n",(0,n.jsx)(i.p,{children:(0,n.jsx)(i.code,{children:"string"})}),"\n",(0,n.jsx)(i.h4,{id:"returns-4",children:"Returns"}),"\n",(0,n.jsx)(i.p,{children:(0,n.jsx)(i.a,{href:"/api/interfaces/ImageFilesProvider",children:(0,n.jsx)(i.code,{children:"ImageFilesProvider"})})}),"\n",(0,n.jsx)(i.h4,{id:"defined-in-4",children:"Defined in"}),"\n",(0,n.jsx)(i.p,{children:(0,n.jsx)(i.a,{href:"https://github.com/podman-desktop/podman-desktop/blob/5c085c8d0c0c4ec614070ad7d98ec832fe05e718/packages/extension-api/src/extension-api.d.ts#L953",children:"packages/extension-api/src/extension-api.d.ts:953"})}),"\n",(0,n.jsx)(i.hr,{}),"\n",(0,n.jsx)(i.h3,{id:"dispose",children:"dispose()"}),"\n",(0,n.jsxs)(i.blockquote,{children:["\n",(0,n.jsxs)(i.p,{children:[(0,n.jsx)(i.strong,{children:"dispose"}),"(): ",(0,n.jsx)(i.code,{children:"void"})]}),"\n"]}),"\n",(0,n.jsx)(i.p,{children:"Dispose this object."}),"\n",(0,n.jsx)(i.h4,{id:"returns-5",children:"Returns"}),"\n",(0,n.jsx)(i.p,{children:(0,n.jsx)(i.code,{children:"void"})}),"\n",(0,n.jsx)(i.h4,{id:"inherited-from",children:"Inherited from"}),"\n",(0,n.jsxs)(i.p,{children:[(0,n.jsx)(i.a,{href:"/api/classes/Disposable",children:(0,n.jsx)(i.code,{children:"Disposable"})}),".",(0,n.jsx)(i.a,{href:"/api/classes/Disposable#dispose",children:(0,n.jsx)(i.code,{children:"dispose"})})]}),"\n",(0,n.jsx)(i.h4,{id:"defined-in-5",children:"Defined in"}),"\n",(0,n.jsx)(i.p,{children:(0,n.jsx)(i.a,{href:"https://github.com/podman-desktop/podman-desktop/blob/5c085c8d0c0c4ec614070ad7d98ec832fe05e718/packages/extension-api/src/extension-api.d.ts#L103",children:"packages/extension-api/src/extension-api.d.ts:103"})})]})}function h(e={}){const{wrapper:i}={...(0,r.R)(),...e.components};return i?(0,n.jsx)(i,{...e,children:(0,n.jsx)(o,{...e})}):o(e)}},43023:(e,i,s)=>{s.d(i,{R:()=>l,x:()=>a});var d=s(63696);const n={},r=d.createContext(n);function l(e){const i=d.useContext(r);return d.useMemo((function(){return"function"==typeof e?e(i):{...i,...e}}),[i,e])}function a(e){let i;return i=e.disableParentContext?"function"==typeof e.components?e.components(n):e.components||n:l(e.components),d.createElement(r.Provider,{value:i},e.children)}}}]);