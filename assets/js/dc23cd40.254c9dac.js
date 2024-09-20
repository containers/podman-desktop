"use strict";(self.webpackChunkdocs=self.webpackChunkdocs||[]).push([[41052],{59494:(e,n,i)=>{i.r(n),i.d(n,{assets:()=>a,contentTitle:()=>r,default:()=>p,frontMatter:()=>d,metadata:()=>o,toc:()=>c});var s=i(62540),t=i(43023);const d={},r="Interface: PodCreateOptions",o={id:"interfaces/PodCreateOptions",title:"Interface: PodCreateOptions",description:"Properties",source:"@site/api/interfaces/PodCreateOptions.md",sourceDirName:"interfaces",slug:"/interfaces/PodCreateOptions",permalink:"/api/interfaces/PodCreateOptions",draft:!1,unlisted:!1,tags:[],version:"current",frontMatter:{},sidebar:"typedocSidebar",previous:{title:"PodContainerInfo",permalink:"/api/interfaces/PodContainerInfo"},next:{title:"PodCreatePortOptions",permalink:"/api/interfaces/PodCreatePortOptions"}},a={},c=[{value:"Properties",id:"properties",level:2},{value:"exit_policy?",id:"exit_policy",level:3},{value:"Examples",id:"examples",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"labels?",id:"labels",level:3},{value:"Index Signature",id:"index-signature",level:4},{value:"Defined in",id:"defined-in-1",level:4},{value:"name?",id:"name",level:3},{value:"Defined in",id:"defined-in-2",level:4},{value:"netns?",id:"netns",level:3},{value:"nsmode",id:"nsmode",level:4},{value:"Examples",id:"examples-1",level:5},{value:"Defined in",id:"defined-in-3",level:4},{value:"Networks?",id:"networks",level:3},{value:"Index Signature",id:"index-signature-1",level:4},{value:"Remarks",id:"remarks",level:4},{value:"Defined in",id:"defined-in-4",level:4},{value:"portmappings?",id:"portmappings",level:3},{value:"Defined in",id:"defined-in-5",level:4},{value:"provider?",id:"provider",level:3},{value:"Defined in",id:"defined-in-6",level:4}];function l(e){const n={a:"a",blockquote:"blockquote",code:"code",h1:"h1",h2:"h2",h3:"h3",h4:"h4",h5:"h5",header:"header",hr:"hr",p:"p",pre:"pre",strong:"strong",...(0,t.R)(),...e.components};return(0,s.jsxs)(s.Fragment,{children:[(0,s.jsx)(n.header,{children:(0,s.jsx)(n.h1,{id:"interface-podcreateoptions",children:"Interface: PodCreateOptions"})}),"\n",(0,s.jsx)(n.h2,{id:"properties",children:"Properties"}),"\n",(0,s.jsx)(n.h3,{id:"exit_policy",children:"exit_policy?"}),"\n",(0,s.jsxs)(n.blockquote,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.code,{children:"optional"})," ",(0,s.jsx)(n.strong,{children:"exit_policy"}),": ",(0,s.jsx)(n.code,{children:"string"})]}),"\n"]}),"\n",(0,s.jsx)(n.p,{children:"ExitPolicy determines the pod's exit and stop behaviour."}),"\n",(0,s.jsx)(n.h4,{id:"examples",children:"Examples"}),"\n",(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{className:"language-ts",children:'"continue": the pod continues running. This is the default policy\nwhen creating a pod.\n'})}),"\n",(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{className:"language-ts",children:'"stop": stop the pod when the last container exits. This is the\ndefault behaviour for play kube.\n'})}),"\n",(0,s.jsx)(n.h4,{id:"defined-in",children:"Defined in"}),"\n",(0,s.jsx)(n.p,{children:(0,s.jsx)(n.a,{href:"https://github.com/containers/podman-desktop/blob/165060fa57f05489813f40005298a06ecb93817e/packages/extension-api/src/extension-api.d.ts#L466",children:"packages/extension-api/src/extension-api.d.ts:466"})}),"\n",(0,s.jsx)(n.hr,{}),"\n",(0,s.jsx)(n.h3,{id:"labels",children:"labels?"}),"\n",(0,s.jsxs)(n.blockquote,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.code,{children:"optional"})," ",(0,s.jsx)(n.strong,{children:"labels"}),": ",(0,s.jsx)(n.code,{children:"object"})]}),"\n"]}),"\n",(0,s.jsx)(n.p,{children:"Labels are key-value pairs that are used to add metadata to pods. Optional."}),"\n",(0,s.jsx)(n.h4,{id:"index-signature",children:"Index Signature"}),"\n",(0,s.jsxs)(n.p,{children:["[",(0,s.jsx)(n.code,{children:"key"}),": ",(0,s.jsx)(n.code,{children:"string"}),"]: ",(0,s.jsx)(n.code,{children:"string"})]}),"\n",(0,s.jsx)(n.h4,{id:"defined-in-1",children:"Defined in"}),"\n",(0,s.jsx)(n.p,{children:(0,s.jsx)(n.a,{href:"https://github.com/containers/podman-desktop/blob/165060fa57f05489813f40005298a06ecb93817e/packages/extension-api/src/extension-api.d.ts#L427",children:"packages/extension-api/src/extension-api.d.ts:427"})}),"\n",(0,s.jsx)(n.hr,{}),"\n",(0,s.jsx)(n.h3,{id:"name",children:"name?"}),"\n",(0,s.jsxs)(n.blockquote,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.code,{children:"optional"})," ",(0,s.jsx)(n.strong,{children:"name"}),": ",(0,s.jsx)(n.code,{children:"string"})]}),"\n"]}),"\n",(0,s.jsx)(n.p,{children:"Name is the name of the pod. If not provided, a name will be generated when the pod is created. Optional."}),"\n",(0,s.jsx)(n.h4,{id:"defined-in-2",children:"Defined in"}),"\n",(0,s.jsx)(n.p,{children:(0,s.jsx)(n.a,{href:"https://github.com/containers/podman-desktop/blob/165060fa57f05489813f40005298a06ecb93817e/packages/extension-api/src/extension-api.d.ts#L417",children:"packages/extension-api/src/extension-api.d.ts:417"})}),"\n",(0,s.jsx)(n.hr,{}),"\n",(0,s.jsx)(n.h3,{id:"netns",children:"netns?"}),"\n",(0,s.jsxs)(n.blockquote,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.code,{children:"optional"})," ",(0,s.jsx)(n.strong,{children:"netns"}),": ",(0,s.jsx)(n.code,{children:"object"})]}),"\n"]}),"\n",(0,s.jsx)(n.p,{children:"Network namespace"}),"\n",(0,s.jsx)(n.h4,{id:"nsmode",children:"nsmode"}),"\n",(0,s.jsxs)(n.blockquote,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.strong,{children:"nsmode"}),": ",(0,s.jsx)(n.code,{children:"string"})]}),"\n"]}),"\n",(0,s.jsx)(n.p,{children:"NamespaceMode"}),"\n",(0,s.jsx)(n.h5,{id:"examples-1",children:"Examples"}),"\n",(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{className:"language-ts",children:"`bridge` indicates that the network backend (CNI/netavark) should be used.\n"})}),"\n",(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{className:"language-ts",children:"`pasta` indicates that a pasta network stack should be used.\n"})}),"\n",(0,s.jsx)(n.h4,{id:"defined-in-3",children:"Defined in"}),"\n",(0,s.jsx)(n.p,{children:(0,s.jsx)(n.a,{href:"https://github.com/containers/podman-desktop/blob/165060fa57f05489813f40005298a06ecb93817e/packages/extension-api/src/extension-api.d.ts#L446",children:"packages/extension-api/src/extension-api.d.ts:446"})}),"\n",(0,s.jsx)(n.hr,{}),"\n",(0,s.jsx)(n.h3,{id:"networks",children:"Networks?"}),"\n",(0,s.jsxs)(n.blockquote,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.code,{children:"optional"})," ",(0,s.jsx)(n.strong,{children:"Networks"}),": ",(0,s.jsx)(n.code,{children:"object"})]}),"\n"]}),"\n",(0,s.jsx)(n.p,{children:"Map of networks names to ids the container should join to.\nYou can request additional settings for each network, you can set network aliases,"}),"\n",(0,s.jsx)(n.h4,{id:"index-signature-1",children:"Index Signature"}),"\n",(0,s.jsxs)(n.p,{children:["[",(0,s.jsx)(n.code,{children:"key"}),": ",(0,s.jsx)(n.code,{children:"string"}),"]: ",(0,s.jsx)(n.code,{children:"object"})]}),"\n",(0,s.jsx)(n.h4,{id:"remarks",children:"Remarks"}),"\n",(0,s.jsxs)(n.p,{children:["PodCreateOptions.netns.nsmode need to be set to ",(0,s.jsx)(n.code,{children:"bridge"})," to join a network"]}),"\n",(0,s.jsx)(n.h4,{id:"defined-in-4",children:"Defined in"}),"\n",(0,s.jsx)(n.p,{children:(0,s.jsx)(n.a,{href:"https://github.com/containers/podman-desktop/blob/165060fa57f05489813f40005298a06ecb93817e/packages/extension-api/src/extension-api.d.ts#L437",children:"packages/extension-api/src/extension-api.d.ts:437"})}),"\n",(0,s.jsx)(n.hr,{}),"\n",(0,s.jsx)(n.h3,{id:"portmappings",children:"portmappings?"}),"\n",(0,s.jsxs)(n.blockquote,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.code,{children:"optional"})," ",(0,s.jsx)(n.strong,{children:"portmappings"}),": ",(0,s.jsx)(n.a,{href:"/api/interfaces/PodCreatePortOptions",children:(0,s.jsx)(n.code,{children:"PodCreatePortOptions"})}),"[]"]}),"\n"]}),"\n",(0,s.jsx)(n.p,{children:"PortMappings is a set of ports to map into the infra container.\nAs, by default, containers share their network with the infra container, this will forward the ports to the entire pod.\nOnly available if NetNS is set to Bridge, Slirp, or Pasta."}),"\n",(0,s.jsx)(n.h4,{id:"defined-in-5",children:"Defined in"}),"\n",(0,s.jsx)(n.p,{children:(0,s.jsx)(n.a,{href:"https://github.com/containers/podman-desktop/blob/165060fa57f05489813f40005298a06ecb93817e/packages/extension-api/src/extension-api.d.ts#L423",children:"packages/extension-api/src/extension-api.d.ts:423"})}),"\n",(0,s.jsx)(n.hr,{}),"\n",(0,s.jsx)(n.h3,{id:"provider",children:"provider?"}),"\n",(0,s.jsxs)(n.blockquote,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.code,{children:"optional"})," ",(0,s.jsx)(n.strong,{children:"provider"}),": ",(0,s.jsx)(n.a,{href:"/api/interfaces/ContainerProviderConnection",children:(0,s.jsx)(n.code,{children:"ContainerProviderConnection"})})]}),"\n"]}),"\n",(0,s.jsx)(n.h4,{id:"defined-in-6",children:"Defined in"}),"\n",(0,s.jsx)(n.p,{children:(0,s.jsx)(n.a,{href:"https://github.com/containers/podman-desktop/blob/165060fa57f05489813f40005298a06ecb93817e/packages/extension-api/src/extension-api.d.ts#L429",children:"packages/extension-api/src/extension-api.d.ts:429"})})]})}function p(e={}){const{wrapper:n}={...(0,t.R)(),...e.components};return n?(0,s.jsx)(n,{...e,children:(0,s.jsx)(l,{...e})}):l(e)}},43023:(e,n,i)=>{i.d(n,{R:()=>r,x:()=>o});var s=i(63696);const t={},d=s.createContext(t);function r(e){const n=s.useContext(d);return s.useMemo((function(){return"function"==typeof e?e(n):{...n,...e}}),[n,e])}function o(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(t):e.components||t:r(e.components),s.createElement(d.Provider,{value:n},e.children)}}}]);