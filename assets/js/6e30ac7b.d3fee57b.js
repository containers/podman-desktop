"use strict";(self.webpackChunkdocs=self.webpackChunkdocs||[]).push([[57368],{53670:(e,n,i)=>{i.r(n),i.d(n,{assets:()=>l,contentTitle:()=>o,default:()=>h,frontMatter:()=>c,metadata:()=>r,toc:()=>a});var s=i(24246),t=i(71670);const c={},o="Interface: QuickPickOptions",r={id:"interfaces/QuickPickOptions",title:"Interface: QuickPickOptions",description:"Options to configure the behavior of the quick pick UI.",source:"@site/api/interfaces/QuickPickOptions.md",sourceDirName:"interfaces",slug:"/interfaces/QuickPickOptions",permalink:"/api/interfaces/QuickPickOptions",draft:!1,unlisted:!1,tags:[],version:"current",frontMatter:{},sidebar:"typedocSidebar",previous:{title:"Interface: QuickPickItem",permalink:"/api/interfaces/QuickPickItem"},next:{title:"Interface: RegisterContainerConnectionEvent",permalink:"/api/interfaces/RegisterContainerConnectionEvent"}},l={},a=[{value:"Properties",id:"properties",level:2},{value:"canPickMany?",id:"canpickmany",level:3},{value:"Source",id:"source",level:4},{value:"ignoreFocusOut?",id:"ignorefocusout",level:3},{value:"Source",id:"source-1",level:4},{value:"matchOnDescription?",id:"matchondescription",level:3},{value:"Source",id:"source-2",level:4},{value:"matchOnDetail?",id:"matchondetail",level:3},{value:"Source",id:"source-3",level:4},{value:"placeHolder?",id:"placeholder",level:3},{value:"Source",id:"source-4",level:4},{value:"title?",id:"title",level:3},{value:"Source",id:"source-5",level:4},{value:"Methods",id:"methods",level:2},{value:"onDidSelectItem()?",id:"ondidselectitem",level:3},{value:"Parameters",id:"parameters",level:4},{value:"Returns",id:"returns",level:4},{value:"Source",id:"source-6",level:4}];function d(e){const n={a:"a",blockquote:"blockquote",code:"code",h1:"h1",h2:"h2",h3:"h3",h4:"h4",hr:"hr",p:"p",strong:"strong",...(0,t.a)(),...e.components};return(0,s.jsxs)(s.Fragment,{children:[(0,s.jsx)(n.h1,{id:"interface-quickpickoptions",children:"Interface: QuickPickOptions"}),"\n",(0,s.jsx)(n.p,{children:"Options to configure the behavior of the quick pick UI."}),"\n",(0,s.jsx)(n.h2,{id:"properties",children:"Properties"}),"\n",(0,s.jsx)(n.h3,{id:"canpickmany",children:"canPickMany?"}),"\n",(0,s.jsxs)(n.blockquote,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.strong,{children:(0,s.jsx)(n.code,{children:"optional"})})," ",(0,s.jsx)(n.strong,{children:"canPickMany"}),": ",(0,s.jsx)(n.code,{children:"boolean"})]}),"\n"]}),"\n",(0,s.jsx)(n.p,{children:"An optional flag to make the picker accept multiple selections, if true the result is an array of picks."}),"\n",(0,s.jsx)(n.h4,{id:"source",children:"Source"}),"\n",(0,s.jsx)(n.p,{children:(0,s.jsx)(n.a,{href:"https://github.com/containers/podman-desktop/blob/f8a3f5c/packages/extension-api/src/extension-api.d.ts#L934",children:"packages/extension-api/src/extension-api.d.ts:934"})}),"\n",(0,s.jsx)(n.hr,{}),"\n",(0,s.jsx)(n.h3,{id:"ignorefocusout",children:"ignoreFocusOut?"}),"\n",(0,s.jsxs)(n.blockquote,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.strong,{children:(0,s.jsx)(n.code,{children:"optional"})})," ",(0,s.jsx)(n.strong,{children:"ignoreFocusOut"}),": ",(0,s.jsx)(n.code,{children:"boolean"})]}),"\n"]}),"\n",(0,s.jsxs)(n.p,{children:["Set to ",(0,s.jsx)(n.code,{children:"true"})," to keep the picker open when focus moves to another part of the editor or to another window.\nThis setting is ignored on iPad and is always false."]}),"\n",(0,s.jsx)(n.h4,{id:"source-1",children:"Source"}),"\n",(0,s.jsx)(n.p,{children:(0,s.jsx)(n.a,{href:"https://github.com/containers/podman-desktop/blob/f8a3f5c/packages/extension-api/src/extension-api.d.ts#L929",children:"packages/extension-api/src/extension-api.d.ts:929"})}),"\n",(0,s.jsx)(n.hr,{}),"\n",(0,s.jsx)(n.h3,{id:"matchondescription",children:"matchOnDescription?"}),"\n",(0,s.jsxs)(n.blockquote,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.strong,{children:(0,s.jsx)(n.code,{children:"optional"})})," ",(0,s.jsx)(n.strong,{children:"matchOnDescription"}),": ",(0,s.jsx)(n.code,{children:"boolean"})]}),"\n"]}),"\n",(0,s.jsx)(n.p,{children:"An optional flag to include the description when filtering the picks."}),"\n",(0,s.jsx)(n.h4,{id:"source-2",children:"Source"}),"\n",(0,s.jsx)(n.p,{children:(0,s.jsx)(n.a,{href:"https://github.com/containers/podman-desktop/blob/f8a3f5c/packages/extension-api/src/extension-api.d.ts#L913",children:"packages/extension-api/src/extension-api.d.ts:913"})}),"\n",(0,s.jsx)(n.hr,{}),"\n",(0,s.jsx)(n.h3,{id:"matchondetail",children:"matchOnDetail?"}),"\n",(0,s.jsxs)(n.blockquote,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.strong,{children:(0,s.jsx)(n.code,{children:"optional"})})," ",(0,s.jsx)(n.strong,{children:"matchOnDetail"}),": ",(0,s.jsx)(n.code,{children:"boolean"})]}),"\n"]}),"\n",(0,s.jsx)(n.p,{children:"An optional flag to include the detail when filtering the picks."}),"\n",(0,s.jsx)(n.h4,{id:"source-3",children:"Source"}),"\n",(0,s.jsx)(n.p,{children:(0,s.jsx)(n.a,{href:"https://github.com/containers/podman-desktop/blob/f8a3f5c/packages/extension-api/src/extension-api.d.ts#L918",children:"packages/extension-api/src/extension-api.d.ts:918"})}),"\n",(0,s.jsx)(n.hr,{}),"\n",(0,s.jsx)(n.h3,{id:"placeholder",children:"placeHolder?"}),"\n",(0,s.jsxs)(n.blockquote,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.strong,{children:(0,s.jsx)(n.code,{children:"optional"})})," ",(0,s.jsx)(n.strong,{children:"placeHolder"}),": ",(0,s.jsx)(n.code,{children:"string"})]}),"\n"]}),"\n",(0,s.jsx)(n.p,{children:"An optional string to show as placeholder in the input box to guide the user what to pick on."}),"\n",(0,s.jsx)(n.h4,{id:"source-4",children:"Source"}),"\n",(0,s.jsx)(n.p,{children:(0,s.jsx)(n.a,{href:"https://github.com/containers/podman-desktop/blob/f8a3f5c/packages/extension-api/src/extension-api.d.ts#L923",children:"packages/extension-api/src/extension-api.d.ts:923"})}),"\n",(0,s.jsx)(n.hr,{}),"\n",(0,s.jsx)(n.h3,{id:"title",children:"title?"}),"\n",(0,s.jsxs)(n.blockquote,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.strong,{children:(0,s.jsx)(n.code,{children:"optional"})})," ",(0,s.jsx)(n.strong,{children:"title"}),": ",(0,s.jsx)(n.code,{children:"string"})]}),"\n"]}),"\n",(0,s.jsx)(n.p,{children:"An optional string that represents the title of the quick pick."}),"\n",(0,s.jsx)(n.h4,{id:"source-5",children:"Source"}),"\n",(0,s.jsx)(n.p,{children:(0,s.jsx)(n.a,{href:"https://github.com/containers/podman-desktop/blob/f8a3f5c/packages/extension-api/src/extension-api.d.ts#L908",children:"packages/extension-api/src/extension-api.d.ts:908"})}),"\n",(0,s.jsx)(n.h2,{id:"methods",children:"Methods"}),"\n",(0,s.jsx)(n.h3,{id:"ondidselectitem",children:"onDidSelectItem()?"}),"\n",(0,s.jsxs)(n.blockquote,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.strong,{children:(0,s.jsx)(n.code,{children:"optional"})})," ",(0,s.jsx)(n.strong,{children:"onDidSelectItem"}),"(",(0,s.jsx)(n.code,{children:"item"}),"): ",(0,s.jsx)(n.code,{children:"any"})]}),"\n"]}),"\n",(0,s.jsx)(n.p,{children:"An optional function that is invoked whenever an item is selected."}),"\n",(0,s.jsx)(n.h4,{id:"parameters",children:"Parameters"}),"\n",(0,s.jsxs)(n.p,{children:["\u2022 ",(0,s.jsx)(n.strong,{children:"item"}),": ",(0,s.jsx)(n.code,{children:"string"})," | ",(0,s.jsx)(n.a,{href:"/api/interfaces/QuickPickItem",children:(0,s.jsx)(n.code,{children:"QuickPickItem"})})]}),"\n",(0,s.jsx)(n.h4,{id:"returns",children:"Returns"}),"\n",(0,s.jsx)(n.p,{children:(0,s.jsx)(n.code,{children:"any"})}),"\n",(0,s.jsx)(n.h4,{id:"source-6",children:"Source"}),"\n",(0,s.jsx)(n.p,{children:(0,s.jsx)(n.a,{href:"https://github.com/containers/podman-desktop/blob/f8a3f5c/packages/extension-api/src/extension-api.d.ts#L940",children:"packages/extension-api/src/extension-api.d.ts:940"})})]})}function h(e={}){const{wrapper:n}={...(0,t.a)(),...e.components};return n?(0,s.jsx)(n,{...e,children:(0,s.jsx)(d,{...e})}):d(e)}},71670:(e,n,i)=>{i.d(n,{Z:()=>r,a:()=>o});var s=i(27378);const t={},c=s.createContext(t);function o(e){const n=s.useContext(c);return s.useMemo((function(){return"function"==typeof e?e(n):{...n,...e}}),[n,e])}function r(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(t):e.components||t:o(e.components),s.createElement(c.Provider,{value:n},e.children)}}}]);