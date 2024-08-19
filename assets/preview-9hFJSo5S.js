import{d as E}from"./index-DrFu-skq.js";const{useMemo:b,useEffect:v}=__STORYBOOK_MODULE_PREVIEW_API__,{global:M}=__STORYBOOK_MODULE_GLOBAL__,{logger:h}=__STORYBOOK_MODULE_CLIENT_LOGGER__;var p="backgrounds",{document:l,window:B}=M,x=()=>B.matchMedia("(prefers-reduced-motion: reduce)").matches,O=(r,e=[],a)=>{if(r==="transparent")return"transparent";if(e.find(d=>d.value===r))return r;let n=e.find(d=>d.name===a);if(n)return n.value;if(a){let d=e.map(i=>i.name).join(", ");h.warn(E`
        Backgrounds Addon: could not find the default color "${a}".
        These are the available colors for your story based on your configuration:
        ${d}.
      `)}return"transparent"},k=r=>{(Array.isArray(r)?r:[r]).forEach(S)},S=r=>{var a;let e=l.getElementById(r);e&&((a=e.parentElement)==null||a.removeChild(e))},w=(r,e)=>{let a=l.getElementById(r);if(a)a.innerHTML!==e&&(a.innerHTML=e);else{let n=l.createElement("style");n.setAttribute("id",r),n.innerHTML=e,l.head.appendChild(n)}},A=(r,e,a)=>{var d;let n=l.getElementById(r);if(n)n.innerHTML!==e&&(n.innerHTML=e);else{let i=l.createElement("style");i.setAttribute("id",r),i.innerHTML=e;let o=`addon-backgrounds-grid${a?`-docs-${a}`:""}`,t=l.getElementById(o);t?(d=t.parentElement)==null||d.insertBefore(i,t):l.head.appendChild(i)}},L=(r,e)=>{var c;let{globals:a,parameters:n}=e,d=(c=a[p])==null?void 0:c.value,i=n[p],o=b(()=>i.disable?"transparent":O(d,i.values,i.default),[i,d]),t=b(()=>o&&o!=="transparent",[o]),s=e.viewMode==="docs"?`#anchor--${e.id} .docs-story`:".sb-show-main",u=b(()=>`
      ${s} {
        background: ${o} !important;
        ${x()?"":"transition: background-color 0.3s;"}
      }
    `,[o,s]);return v(()=>{let g=e.viewMode==="docs"?`addon-backgrounds-docs-${e.id}`:"addon-backgrounds-color";if(!t){k(g);return}A(g,u,e.viewMode==="docs"?e.id:null)},[t,u,e]),r()},T=(r,e)=>{var y;let{globals:a,parameters:n}=e,d=n[p].grid,i=((y=a[p])==null?void 0:y.grid)===!0&&d.disable!==!0,{cellAmount:o,cellSize:t,opacity:s}=d,u=e.viewMode==="docs",c=n.layout===void 0||n.layout==="padded"?16:0,g=d.offsetX??(u?20:c),m=d.offsetY??(u?20:c),$=b(()=>{let f=e.viewMode==="docs"?`#anchor--${e.id} .docs-story`:".sb-show-main",_=[`${t*o}px ${t*o}px`,`${t*o}px ${t*o}px`,`${t}px ${t}px`,`${t}px ${t}px`].join(", ");return`
      ${f} {
        background-size: ${_} !important;
        background-position: ${g}px ${m}px, ${g}px ${m}px, ${g}px ${m}px, ${g}px ${m}px !important;
        background-blend-mode: difference !important;
        background-image: linear-gradient(rgba(130, 130, 130, ${s}) 1px, transparent 1px),
         linear-gradient(90deg, rgba(130, 130, 130, ${s}) 1px, transparent 1px),
         linear-gradient(rgba(130, 130, 130, ${s/2}) 1px, transparent 1px),
         linear-gradient(90deg, rgba(130, 130, 130, ${s/2}) 1px, transparent 1px) !important;
      }
    `},[t]);return v(()=>{let f=e.viewMode==="docs"?`addon-backgrounds-grid-docs-${e.id}`:"addon-backgrounds-grid";if(!i){k(f);return}w(f,$)},[i,$,e]),r()},I=[T,L],G={[p]:{grid:{cellSize:20,opacity:.5,cellAmount:5},values:[{name:"light",value:"#F8F8F8"},{name:"dark",value:"#333333"}]}},R={[p]:null};export{I as decorators,R as initialGlobals,G as parameters};
