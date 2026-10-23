import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{Bt as t,Cn as n,F as r,It as i,Lt as a,Nt as o,Tt as s,Xt as c,bn as l,c as u,dn as d,fn as f,gn as p,gt as m,mt as h,nn as g,rn as _,x as v,yt as y}from"./iframe-BuUfevjj.js";import{a as b,i as x,n as S,r as C,t as w}from"./create-runtime-stories-Dz1MLO6o.js";import{t as T}from"./Button-DQEBNOBJ.js";import{T as E,t as D}from"./dist-CACye4oM.js";function O(e,n){_(n,!1),v();var r=F(),o=a(r);j(o,{name:`One Button`,args:{initialFocus:`none`},template:e=>{var t=N(),n=i(t);E(n,{children:(e,t)=>{T(e,{type:`primary`,children:(e,t)=>{d();var n=y(`Save`);h(e,n)},$$slots:{default:!0}})},$$slots:{default:!0}}),f(t),h(e,t)},$$slots:{template:!0},parameters:{__svelteCsf:{rawCode:`<div class="bg-(--pd-content-card-bg) p-4">
  <ButtonRow>
    <Button type="primary">Save</Button>
  </ButtonRow>
</div>`}}});var s=t(o,2);j(s,{name:`Two Buttons`,args:{initialFocus:`none`},parameters:{__svelteCsf:{rawCode:`<div class="bg-(--pd-content-card-bg) p-4" {dir}>
  <ButtonRow {initialFocus}>
    <Button type="secondary">Cancel</Button>
    <Button type="primary">Save</Button>
  </ButtonRow>
</div>`}}});var c=t(s,2);j(c,{name:`Three Buttons`,args:{initialFocus:`none`},template:e=>{var n=N(),r=i(n);E(r,{children:(e,n)=>{var r=P(),i=a(r);T(i,{type:`link`,children:(e,t)=>{d();var n=y(`Back`);h(e,n)},$$slots:{default:!0}});var o=t(i,2);T(o,{type:`secondary`,children:(e,t)=>{d();var n=y(`Cancel`);h(e,n)},$$slots:{default:!0}});var s=t(o,2);T(s,{type:`primary`,children:(e,t)=>{d();var n=y(`Save`);h(e,n)},$$slots:{default:!0}}),h(e,r)},$$slots:{default:!0}}),f(n),h(e,n)},$$slots:{template:!0},parameters:{__svelteCsf:{rawCode:`<div class="bg-(--pd-content-card-bg) p-4">
  <ButtonRow>
    <Button type="link">Back</Button>
    <Button type="secondary">Cancel</Button>
    <Button type="primary">Save</Button>
  </ButtonRow>
</div>`}}});var l=t(c,2);j(l,{name:`RTL`,args:{initialFocus:`none`,dir:`rtl`},parameters:{__svelteCsf:{rawCode:`<div class="bg-(--pd-content-card-bg) p-4" {dir}>
  <ButtonRow {initialFocus}>
    <Button type="secondary">Cancel</Button>
    <Button type="primary">Save</Button>
  </ButtonRow>
</div>`}}});var u=t(l,2);j(u,{name:`Initial Focus Primary`,args:{initialFocus:`last`},parameters:{__svelteCsf:{rawCode:`<div class="bg-(--pd-content-card-bg) p-4" {dir}>
  <ButtonRow {initialFocus}>
    <Button type="secondary">Cancel</Button>
    <Button type="primary">Save</Button>
  </ButtonRow>
</div>`}}});var p=t(u,2);j(p,{name:`Initial Focus Cancel`,args:{initialFocus:`first`},parameters:{__svelteCsf:{rawCode:`<div class="bg-(--pd-content-card-bg) p-4" {dir}>
  <ButtonRow {initialFocus}>
    <Button type="secondary">Cancel</Button>
    <Button type="primary">Save</Button>
  </ButtonRow>
</div>`}}}),h(e,r),g()}var k,A,j,M,N,P,F,I,L,R,z,B,V,H,U;function W(){return(W=e((()=>{n(),b(),l(),D(),x(),u(),S(),k=(e,n)=>{let l=c(()=>p((n?.()).initialFocus,`none`)),u=c(()=>p((n?.()).dir,`ltr`));var m=N(),g=i(m);E(g,{get initialFocus(){return s(l)},children:(e,n)=>{var r=M(),i=a(r);T(i,{type:`secondary`,children:(e,t)=>{d();var n=y(`Cancel`);h(e,n)},$$slots:{default:!0}});var o=t(i,2);T(o,{type:`primary`,children:(e,t)=>{d();var n=y(`Save`);h(e,n)},$$slots:{default:!0}}),h(e,r)},$$slots:{default:!0}}),f(m),o(()=>{r(m,`dir`,s(u)),m.dir=m.dir}),h(e,m)},A={component:E,render:k,title:`Button/ButtonRow`,tags:[`autodocs`],argTypes:{initialFocus:{control:`select`,defaultValue:`none`,options:[`none`,`first`,`last`],description:`The enabled action that receives focus when the row mounts.`}}},{Story:j}=C(A),M=m(`<!> <!>`,1),N=m(`<div class="bg-(--pd-content-card-bg) p-4"><!></div>`),P=m(`<!> <!> <!>`,1),F=m(`<!> <!> <!> <!> <!> <!>`,1),O.__docgen={data:[],name:`ButtonRow.stories.svelte`},I=w(O,A),L=[`OneButton`,`TwoButtons`,`ThreeButtons`,`RTL`,`InitialFocusPrimary`,`InitialFocusCancel`],R={...I.OneButton,tags:[`svelte-csf-v5`]},z={...I.TwoButtons,tags:[`svelte-csf-v5`]},B={...I.ThreeButtons,tags:[`svelte-csf-v5`]},V={...I.RTL,tags:[`svelte-csf-v5`]},H={...I.InitialFocusPrimary,tags:[`svelte-csf-v5`]},U={...I.InitialFocusCancel,tags:[`svelte-csf-v5`]}})))()}W();export{U as InitialFocusCancel,H as InitialFocusPrimary,R as OneButton,V as RTL,B as ThreeButtons,z as TwoButtons,L as __namedExportsOrder,A as default};