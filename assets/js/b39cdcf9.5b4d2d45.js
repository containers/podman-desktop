"use strict";(self.webpackChunkdocs=self.webpackChunkdocs||[]).push([[592],{8756:(e,o,n)=>{n.r(o),n.d(o,{assets:()=>c,contentTitle:()=>r,default:()=>h,frontMatter:()=>i,metadata:()=>a,toc:()=>d});var t=n(24246),s=n(71670);const i={title:"5 things to know about Podman Desktop for a Docker user",description:"Important things to know when switching from Docker Desktop to Podman Desktop",slug:"5-things-to-know-for-a-docker-user",authors:["benoitf"],tags:["podman-desktop","docker","migrating"],hide_table_of_contents:!1},r=void 0,a={permalink:"/blog/5-things-to-know-for-a-docker-user",source:"@site/blog/2023-03-24-5-things-to-know-for-a-docker-user.md",title:"5 things to know about Podman Desktop for a Docker user",description:"Important things to know when switching from Docker Desktop to Podman Desktop",date:"2023-03-24T00:00:00.000Z",formattedDate:"March 24, 2023",tags:[{label:"podman-desktop",permalink:"/blog/tags/podman-desktop"},{label:"docker",permalink:"/blog/tags/docker"},{label:"migrating",permalink:"/blog/tags/migrating"}],readingTime:4.285,hasTruncateMarker:!0,authors:[{name:"Florent Benoit",title:"Maintainer of Podman Desktop",url:"https://github.com/benoitf",imageURL:"https://github.com/benoitf.png",key:"benoitf"}],frontMatter:{title:"5 things to know about Podman Desktop for a Docker user",description:"Important things to know when switching from Docker Desktop to Podman Desktop",slug:"5-things-to-know-for-a-docker-user",authors:["benoitf"],tags:["podman-desktop","docker","migrating"],hide_table_of_contents:!1},unlisted:!1,prevItem:{title:"Release Notes - Podman Desktop 0.13",permalink:"/blog/podman-desktop-release-0.13"},nextItem:{title:"Release Notes - Podman Desktop 0.12",permalink:"/blog/podman-desktop-release-0.12"}},c={authorsImageUrls:[void 0]},d=[{value:"Use Podman Desktop to interact with containers running in Docker",id:"use-podman-desktop-to-interact-with-containers-running-in-docker",level:2},{value:"Docker compatibility mode",id:"docker-compatibility-mode",level:2},{value:"Socket file compatibility",id:"socket-file-compatibility",level:3},{value:"CLI compatibility",id:"cli-compatibility",level:3},{value:"Compose",id:"compose",level:2},{value:"Kubernetes",id:"kubernetes",level:2},{value:"Rootless mode",id:"rootless-mode",level:2}];function l(e){const o={a:"a",code:"code",em:"em",h2:"h2",h3:"h3",hr:"hr",img:"img",li:"li",p:"p",strong:"strong",ul:"ul",...(0,s.a)(),...e.components};return(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)(o.p,{children:"The 5 things to know being a Docker user by using Podman Desktop:"}),"\n",(0,t.jsxs)(o.ul,{children:["\n",(0,t.jsxs)(o.li,{children:[(0,t.jsx)(o.strong,{children:"Use a single UI"}),": Podman Desktop works with several container engines, including Docker."]}),"\n",(0,t.jsxs)(o.li,{children:["The ",(0,t.jsx)(o.strong,{children:"compatibility mode"}),": How to ensure tools are working with Podman instead of Docker."]}),"\n",(0,t.jsxs)(o.li,{children:[(0,t.jsx)(o.strong,{children:"Compose"})," support: How to work with Compose files and Podman."]}),"\n",(0,t.jsxs)(o.li,{children:[(0,t.jsx)(o.strong,{children:"Kubernetes"})," support: How to use Kubernetes with Podman."]}),"\n",(0,t.jsxs)(o.li,{children:[(0,t.jsx)(o.strong,{children:"Security"}),": Use ",(0,t.jsx)(o.code,{children:"rootless"})," mode or containers without root privileges."]}),"\n"]}),"\n",(0,t.jsx)(o.p,{children:(0,t.jsx)(o.img,{alt:"5-things-to-know-for-a-docker-user-hero",src:n(63440).Z+"",width:"800",height:"462"})}),"\n",(0,t.jsx)(o.hr,{}),"\n",(0,t.jsx)(o.h2,{id:"use-podman-desktop-to-interact-with-containers-running-in-docker",children:"Use Podman Desktop to interact with containers running in Docker"}),"\n",(0,t.jsx)(o.p,{children:"Docker Desktop provides a UI to interact with containers and images. But the UI depends on Docker API and it is not possible to use the UI with Docker and Podman at the same time."}),"\n",(0,t.jsx)(o.p,{children:"Podman Desktop is a multi-engine UI tool. The UI is compatible with the API of Docker and Podman. It means all containers and images from all the engines at the same time are visible in the UI."}),"\n",(0,t.jsx)(o.p,{children:"When migrating from Docker to Podman, you can use Podman Desktop to interact with containers running in Docker. Explore all commands and features of Podman Desktop and see all the resources from Docker."}),"\n",(0,t.jsx)(o.p,{children:(0,t.jsx)(o.img,{alt:"Many container engines at the same time",src:n(86).Z+"",width:"1253",height:"712"})}),"\n",(0,t.jsx)(o.h2,{id:"docker-compatibility-mode",children:"Docker compatibility mode"}),"\n",(0,t.jsxs)(o.p,{children:["Using Podman with Podman Desktop or with the Podman CLI is straightforward. But some tools expect to find ",(0,t.jsx)(o.code,{children:"docker"})," CLI or ",(0,t.jsx)(o.code,{children:"docker.sock"})," socket. In this case, you have to use the compatibility mode of Podman."]}),"\n",(0,t.jsx)(o.h3,{id:"socket-file-compatibility",children:"Socket file compatibility"}),"\n",(0,t.jsx)(o.p,{children:"The socket compatibility mode is a feature of Podman that allows to bind the Podman socket under the Docker socket path."}),"\n",(0,t.jsxs)(o.p,{children:["On Windows the socket compatibility mode is always enabled by default. On macOS, by using the ",(0,t.jsx)(o.code,{children:".pkg installer"})," it is active by default. But when installing with ",(0,t.jsx)(o.code,{children:"brew"}),", it will not be there because it requires some admin permissions."]}),"\n",(0,t.jsxs)(o.p,{children:["That is not an issue because you can enable it by ",(0,t.jsx)(o.a,{href:"https://podman-desktop.io/docs/migrating-from-docker/using-podman-mac-helper",children:"invoking a CLI tool"})," that will setup the compatibility mode."]}),"\n",(0,t.jsxs)(o.p,{children:["For example if you use ",(0,t.jsx)(o.a,{href:"https://www.testcontainers.org/",children:(0,t.jsx)(o.code,{children:"TestContainers"})})," in your Java project, you can use the compatibility mode to ensure that the tool will use Podman instead of Docker."]}),"\n",(0,t.jsx)(o.h3,{id:"cli-compatibility",children:"CLI compatibility"}),"\n",(0,t.jsxs)(o.p,{children:["If you have scripts relying on ",(0,t.jsx)(o.code,{children:"docker"})," CLI, you can use the compatibility mode to ensure that the tool is working with Podman instead of Docker."]}),"\n",(0,t.jsxs)(o.p,{children:["If you have the ",(0,t.jsx)(o.code,{children:"docker"})," CLI installed on your computer, you can use the socket file compatibility of docker to ensure that the tool is working with Podman engine instead of Docker."]}),"\n",(0,t.jsxs)(o.p,{children:["If you do not have the ",(0,t.jsx)(o.code,{children:"docker"})," CLI installed on your computer, you can ",(0,t.jsx)(o.a,{href:"https://podman-desktop.io/docs/migrating-from-docker/emulating-docker-cli-with-podman",children:"Create a script"})," called ",(0,t.jsx)(o.code,{children:"docker"})," that will call the ",(0,t.jsx)(o.code,{children:"podman"})," CLI"]}),"\n",(0,t.jsxs)(o.p,{children:[(0,t.jsx)(o.strong,{children:(0,t.jsx)(o.em,{children:"NOTE:"})})," creating a shell prompt alias, for example ",(0,t.jsx)(o.code,{children:"alias docker=podman"}),", will not work inside scripts that you call."]}),"\n",(0,t.jsx)(o.h2,{id:"compose",children:"Compose"}),"\n",(0,t.jsxs)(o.p,{children:["As a user of Docker, you might use ",(0,t.jsx)(o.code,{children:"docker compose"})," (or ",(0,t.jsx)(o.code,{children:"docker-compose"}),") to run some of your applications."]}),"\n",(0,t.jsxs)(o.p,{children:["For now Podman does not include a ",(0,t.jsx)(o.code,{children:"Compose"})," support directly in the CLI with a command ",(0,t.jsx)(o.code,{children:"podman compose"}),"."]}),"\n",(0,t.jsxs)(o.p,{children:[(0,t.jsx)(o.code,{children:"Compose"})," can work with the Podman socket."]}),"\n",(0,t.jsxs)(o.p,{children:["Based on the compatibility mode (see ",(0,t.jsx)(o.a,{href:"#docker-compatibility-mode",children:"section about Docker compatibility mode"}),"):"]}),"\n",(0,t.jsxs)(o.ul,{children:["\n",(0,t.jsxs)(o.li,{children:["Enabled: you can use the ",(0,t.jsx)(o.code,{children:"compose"})," binary to run your applications."]}),"\n",(0,t.jsxs)(o.li,{children:["Disabled: you need to ",(0,t.jsx)(o.a,{href:"https://podman-desktop.io/docs/migrating-from-docker/using-the-docker_host-environment-variable",children:"export the environment variable DOCKER_HOST"})," before running compose."]}),"\n"]}),"\n",(0,t.jsxs)(o.p,{children:["You can now use the ",(0,t.jsx)(o.code,{children:"compose"})," binary to run your applications and it will use Podman engine."]}),"\n",(0,t.jsxs)(o.p,{children:["Podman Desktop has a ",(0,t.jsx)(o.code,{children:"compose"})," extension that can fetch ",(0,t.jsx)(o.code,{children:"compose"})," binary if not already available on the filesystem."]}),"\n",(0,t.jsxs)(o.p,{children:["Podman Desktop UI displays the containers created by ",(0,t.jsx)(o.code,{children:"Compose"})," are in the same group."]}),"\n",(0,t.jsx)(o.p,{children:(0,t.jsx)(o.img,{alt:"Compose support in the UI",src:n(70226).Z+"",width:"1253",height:"712"})}),"\n",(0,t.jsx)(o.h2,{id:"kubernetes",children:"Kubernetes"}),"\n",(0,t.jsx)(o.p,{children:"It is possible to start a Kubernetes cluster with Docker."}),"\n",(0,t.jsxs)(o.p,{children:["Podman supports directly a subset of Kubernetes resources that you can use with ",(0,t.jsx)(o.code,{children:".yaml"})," files."]}),"\n",(0,t.jsxs)(o.p,{children:["For example if you only want to create a ",(0,t.jsx)(o.code,{children:"Pod"})," resource, you can use the ",(0,t.jsx)(o.code,{children:"Play Kubernetes YAML"})," button from the ",(0,t.jsx)(o.code,{children:"Containers"})," list screen with your ",(0,t.jsx)(o.code,{children:".yaml"})," file. No need to install or start a Kubernetes cluster."]}),"\n",(0,t.jsx)(o.p,{children:(0,t.jsx)(o.img,{alt:"Play Kubernetes YAML",src:n(39179).Z+"",width:"1253",height:"712"})}),"\n",(0,t.jsxs)(o.p,{children:["It is possible to do the counter-part. Export the definition of a container or pod to a Kubernetes resource. You can use the ",(0,t.jsx)(o.code,{children:"Generate kube"})," button from the kebab menu of a given container or pod."]}),"\n",(0,t.jsx)(o.p,{children:(0,t.jsx)(o.img,{alt:"Kubernetes generate",src:n(76467).Z+"",width:"1253",height:"712"})}),"\n",(0,t.jsx)(o.p,{children:"Podman handles pods and in the Podman Desktop UI, you can see all the pods inside a Pod section. All containers inside the pod are in the same group."}),"\n",(0,t.jsx)(o.p,{children:(0,t.jsx)(o.img,{alt:"Pods in the UI",src:n(56726).Z+"",width:"1253",height:"712"})}),"\n",(0,t.jsx)(o.p,{children:(0,t.jsx)(o.img,{alt:"Containers from pod",src:n(91958).Z+"",width:"1253",height:"712"})}),"\n",(0,t.jsxs)(o.p,{children:["An experimental ",(0,t.jsx)(o.code,{children:"kind"})," extension is bringing the creation of full-blown Kubernetes cluster with Podman."]}),"\n",(0,t.jsx)(o.h2,{id:"rootless-mode",children:"Rootless mode"}),"\n",(0,t.jsx)(o.p,{children:"One of the difference of Docker and Podman is the way they handle containers. Docker requires root privileges to run containers by default. Podman can run containers without root privileges by default."}),"\n",(0,t.jsx)(o.p,{children:"It means that for example, starting a container with a port < 1024 will not work. You need to use a port > 1024."}),"\n",(0,t.jsx)(o.p,{children:"If you still need to create containers with a port < 1024, you can change the Podman machine configuration of the Podman Machine if you are on Windows or macOS."}),"\n",(0,t.jsxs)(o.p,{children:["The command is ",(0,t.jsx)(o.code,{children:"podman machine set --rootful"})," to enable the execution with root privileges or ",(0,t.jsx)(o.code,{children:"podman machine set --rootful=false"})," to switch back to rootless mode."]})]})}function h(e={}){const{wrapper:o}={...(0,s.a)(),...e.components};return o?(0,t.jsx)(o,{...e,children:(0,t.jsx)(l,{...e})}):l(e)}},63440:(e,o,n)=>{n.d(o,{Z:()=>t});const t=n.p+"assets/images/5-things-to-know-for-a-docker-user-hero-376f962671072e8cd6909702d92c90b1.png"},70226:(e,o,n)=>{n.d(o,{Z:()=>t});const t=n.p+"assets/images/compose-containers-in-ui-0528fa58b39f08da7008c01b27744042.png"},91958:(e,o,n)=>{n.d(o,{Z:()=>t});const t=n.p+"assets/images/containers-from-pod-a149547e10f972aeb503bc0bbcb53f07.png"},76467:(e,o,n)=>{n.d(o,{Z:()=>t});const t=n.p+"assets/images/kube-generate-3e6c658947cad795467c8fdc5db13c10.png"},86:(e,o,n)=>{n.d(o,{Z:()=>t});const t=n.p+"assets/images/multiple-container-engines-aeb03d9e5dab3b2d502066aaa300be41.png"},39179:(e,o,n)=>{n.d(o,{Z:()=>t});const t=n.p+"assets/images/play-kubernetes-yaml-ce2ce5fd9101d6731dfe4eac4414910a.png"},56726:(e,o,n)=>{n.d(o,{Z:()=>t});const t=n.p+"assets/images/pods-in-ui-ecd61f20dce88252ee58cd26303e469b.png"},71670:(e,o,n)=>{n.d(o,{Z:()=>a,a:()=>r});var t=n(27378);const s={},i=t.createContext(s);function r(e){const o=t.useContext(i);return t.useMemo((function(){return"function"==typeof e?e(o):{...o,...e}}),[o,e])}function a(e){let o;return o=e.disableParentContext?"function"==typeof e.components?e.components(s):e.components||s:r(e.components),t.createElement(i.Provider,{value:o},e.children)}}}]);