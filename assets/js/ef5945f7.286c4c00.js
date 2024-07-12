"use strict";(self.webpackChunkdocs=self.webpackChunkdocs||[]).push([[63630],{12294:(e,n,i)=>{i.r(n),i.d(n,{assets:()=>c,contentTitle:()=>r,default:()=>h,frontMatter:()=>d,metadata:()=>o,toc:()=>a});var s=i(24246),t=i(71670);const d={},r="Interface: Extension<T>",o={id:"interfaces/Extension",title:"Interface: Extension\\<T\\>",description:"Represents an extension.",source:"@site/api/interfaces/Extension.md",sourceDirName:"interfaces",slug:"/interfaces/Extension",permalink:"/api/interfaces/Extension",draft:!1,unlisted:!1,tags:[],version:"current",frontMatter:{},sidebar:"typedocSidebar",previous:{title:"Event",permalink:"/api/interfaces/Event"},next:{title:"ExtensionContext",permalink:"/api/interfaces/ExtensionContext"}},c={},a=[{value:"Type Parameters",id:"type-parameters",level:2},{value:"Properties",id:"properties",level:2},{value:"exports",id:"exports",level:3},{value:"Defined in",id:"defined-in",level:4},{value:"extensionPath",id:"extensionpath",level:3},{value:"Defined in",id:"defined-in-1",level:4},{value:"extensionUri",id:"extensionuri",level:3},{value:"Defined in",id:"defined-in-2",level:4},{value:"id",id:"id",level:3},{value:"Defined in",id:"defined-in-3",level:4},{value:"packageJSON",id:"packagejson",level:3},{value:"Defined in",id:"defined-in-4",level:4}];function l(e){const n={a:"a",blockquote:"blockquote",code:"code",h1:"h1",h2:"h2",h3:"h3",h4:"h4",hr:"hr",p:"p",strong:"strong",...(0,t.a)(),...e.components};return(0,s.jsxs)(s.Fragment,{children:[(0,s.jsx)(n.h1,{id:"interface-extensiont",children:"Interface: Extension<T>"}),"\n",(0,s.jsx)(n.p,{children:"Represents an extension."}),"\n",(0,s.jsxs)(n.p,{children:["To get an instance of an ",(0,s.jsx)(n.code,{children:"Extension"})," use ",(0,s.jsx)(n.a,{href:"/api/namespaces/extensions/functions/getExtension",children:"getExtension"}),"."]}),"\n",(0,s.jsx)(n.h2,{id:"type-parameters",children:"Type Parameters"}),"\n",(0,s.jsxs)(n.p,{children:["\u2022 ",(0,s.jsx)(n.strong,{children:"T"})]}),"\n",(0,s.jsx)(n.h2,{id:"properties",children:"Properties"}),"\n",(0,s.jsx)(n.h3,{id:"exports",children:"exports"}),"\n",(0,s.jsxs)(n.blockquote,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.code,{children:"readonly"})," ",(0,s.jsx)(n.strong,{children:"exports"}),": ",(0,s.jsx)(n.code,{children:"T"})]}),"\n"]}),"\n",(0,s.jsxs)(n.p,{children:["The public API exported by this extension (return value of ",(0,s.jsx)(n.code,{children:"activate"}),").\nIt is an invalid action to access this field before this extension has been activated."]}),"\n",(0,s.jsx)(n.h4,{id:"defined-in",children:"Defined in"}),"\n",(0,s.jsx)(n.p,{children:(0,s.jsx)(n.a,{href:"https://github.com/containers/podman-desktop/blob/6498265a0824233d719e3c4d5abb0eb54d99bddc/packages/extension-api/src/extension-api.d.ts#L205",children:"packages/extension-api/src/extension-api.d.ts:205"})}),"\n",(0,s.jsx)(n.hr,{}),"\n",(0,s.jsx)(n.h3,{id:"extensionpath",children:"extensionPath"}),"\n",(0,s.jsxs)(n.blockquote,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.code,{children:"readonly"})," ",(0,s.jsx)(n.strong,{children:"extensionPath"}),": ",(0,s.jsx)(n.code,{children:"string"})]}),"\n"]}),"\n",(0,s.jsxs)(n.p,{children:["The absolute file path of the directory containing this extension. Shorthand\nnotation for ",(0,s.jsx)(n.a,{href:"/api/interfaces/Extension#extensionuri",children:"Extension.extensionUri.fsPath"})," (independent of the uri scheme)."]}),"\n",(0,s.jsx)(n.h4,{id:"defined-in-1",children:"Defined in"}),"\n",(0,s.jsx)(n.p,{children:(0,s.jsx)(n.a,{href:"https://github.com/containers/podman-desktop/blob/6498265a0824233d719e3c4d5abb0eb54d99bddc/packages/extension-api/src/extension-api.d.ts#L193",children:"packages/extension-api/src/extension-api.d.ts:193"})}),"\n",(0,s.jsx)(n.hr,{}),"\n",(0,s.jsx)(n.h3,{id:"extensionuri",children:"extensionUri"}),"\n",(0,s.jsxs)(n.blockquote,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.code,{children:"readonly"})," ",(0,s.jsx)(n.strong,{children:"extensionUri"}),": ",(0,s.jsx)(n.a,{href:"/api/classes/Uri",children:(0,s.jsx)(n.code,{children:"Uri"})})]}),"\n"]}),"\n",(0,s.jsx)(n.p,{children:"The uri of the directory containing the extension."}),"\n",(0,s.jsx)(n.h4,{id:"defined-in-2",children:"Defined in"}),"\n",(0,s.jsx)(n.p,{children:(0,s.jsx)(n.a,{href:"https://github.com/containers/podman-desktop/blob/6498265a0824233d719e3c4d5abb0eb54d99bddc/packages/extension-api/src/extension-api.d.ts#L187",children:"packages/extension-api/src/extension-api.d.ts:187"})}),"\n",(0,s.jsx)(n.hr,{}),"\n",(0,s.jsx)(n.h3,{id:"id",children:"id"}),"\n",(0,s.jsxs)(n.blockquote,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.code,{children:"readonly"})," ",(0,s.jsx)(n.strong,{children:"id"}),": ",(0,s.jsx)(n.code,{children:"string"})]}),"\n"]}),"\n",(0,s.jsxs)(n.p,{children:["The canonical extension identifier in the form of: ",(0,s.jsx)(n.code,{children:"publisher.name"}),"."]}),"\n",(0,s.jsx)(n.h4,{id:"defined-in-3",children:"Defined in"}),"\n",(0,s.jsx)(n.p,{children:(0,s.jsx)(n.a,{href:"https://github.com/containers/podman-desktop/blob/6498265a0824233d719e3c4d5abb0eb54d99bddc/packages/extension-api/src/extension-api.d.ts#L182",children:"packages/extension-api/src/extension-api.d.ts:182"})}),"\n",(0,s.jsx)(n.hr,{}),"\n",(0,s.jsx)(n.h3,{id:"packagejson",children:"packageJSON"}),"\n",(0,s.jsxs)(n.blockquote,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.code,{children:"readonly"})," ",(0,s.jsx)(n.strong,{children:"packageJSON"}),": ",(0,s.jsx)(n.code,{children:"any"})]}),"\n"]}),"\n",(0,s.jsx)(n.p,{children:"The parsed contents of the extension's package.json."}),"\n",(0,s.jsx)(n.h4,{id:"defined-in-4",children:"Defined in"}),"\n",(0,s.jsx)(n.p,{children:(0,s.jsx)(n.a,{href:"https://github.com/containers/podman-desktop/blob/6498265a0824233d719e3c4d5abb0eb54d99bddc/packages/extension-api/src/extension-api.d.ts#L199",children:"packages/extension-api/src/extension-api.d.ts:199"})})]})}function h(e={}){const{wrapper:n}={...(0,t.a)(),...e.components};return n?(0,s.jsx)(n,{...e,children:(0,s.jsx)(l,{...e})}):l(e)}},71670:(e,n,i)=>{i.d(n,{Z:()=>o,a:()=>r});var s=i(27378);const t={},d=s.createContext(t);function r(e){const n=s.useContext(d);return s.useMemo((function(){return"function"==typeof e?e(n):{...n,...e}}),[n,e])}function o(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(t):e.components||t:r(e.components),s.createElement(d.Provider,{value:n},e.children)}}}]);