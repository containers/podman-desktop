const{global:r}=__STORYBOOK_MODULE_GLOBAL__,{addons:s}=__STORYBOOK_MODULE_PREVIEW_API__,{STORY_CHANGED:O}=__STORYBOOK_MODULE_CORE_EVENTS__;var d="storybook/highlight",i="storybookHighlight",g=`${d}/add`,E=`${d}/reset`,{document:l}=r,H=(e="#FF4785",t="dashed")=>`
  outline: 2px ${t} ${e};
  outline-offset: 2px;
  box-shadow: 0 0 0 6px rgba(255,255,255,0.6);
`,h=s.getChannel(),T=e=>{let t=i;n();let o=Array.from(new Set(e.elements)),_=l.createElement("style");_.setAttribute("id",t),_.innerHTML=o.map(a=>`${a}{
          ${H(e.color,e.style)}
         }`).join(" "),l.head.appendChild(_)},n=()=>{var o;let e=i,t=l.getElementById(e);t&&((o=t.parentNode)==null||o.removeChild(t))};h.on(O,n);h.on(E,n);h.on(g,T);
