import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{Bt as t,F as n,It as r,Lt as i,Nt as a,Tt as o,Xt as s,c,gt as l,ln as u,mn as d,mt as f,nn as p,rn as m,un as h,vn as g,x as _,xn as v,yt as y}from"./iframe-8kiUjOJ_.js";import{a as b,i as x,n as S,r as C,t as w}from"./create-runtime-stories-B8NMTTDA.js";import{t as T}from"./Button-D1I1r-jf.js";import{T as E,t as D}from"./dist-B2ZfCERk.js";function O(e,n){m(n,!1),_();var a=F(),o=i(a);j(o,{name:`One Button`,args:{initialFocus:`none`},template:e=>{var t=N(),n=r(t);E(n,{children:(e,t)=>{T(e,{type:`primary`,children:(e,t)=>{u();var n=y(`Save`);f(e,n)},$$slots:{default:!0}})},$$slots:{default:!0}}),h(t),f(e,t)},$$slots:{template:!0},parameters:{__svelteCsf:{rawCode:`<div class="bg-(--pd-content-card-bg) p-4">
  <ButtonRow>
    <Button type="primary">Save</Button>
  </ButtonRow>
</div>`}}});var s=t(o,2);j(s,{name:`Two Buttons`,args:{initialFocus:`none`},parameters:{__svelteCsf:{rawCode:`<div class="bg-(--pd-content-card-bg) p-4" {dir}>
  <ButtonRow {initialFocus}>
    <Button type="secondary">Cancel</Button>
    <Button type="primary">Save</Button>
  </ButtonRow>
</div>`}}});var c=t(s,2);j(c,{name:`Three Buttons`,args:{initialFocus:`none`},template:e=>{var n=N(),a=r(n);E(a,{children:(e,n)=>{var r=P(),a=i(r);T(a,{type:`link`,children:(e,t)=>{u();var n=y(`Back`);f(e,n)},$$slots:{default:!0}});var o=t(a,2);T(o,{type:`secondary`,children:(e,t)=>{u();var n=y(`Cancel`);f(e,n)},$$slots:{default:!0}});var s=t(o,2);T(s,{type:`primary`,children:(e,t)=>{u();var n=y(`Save`);f(e,n)},$$slots:{default:!0}}),f(e,r)},$$slots:{default:!0}}),h(n),f(e,n)},$$slots:{template:!0},parameters:{__svelteCsf:{rawCode:`<div class="bg-(--pd-content-card-bg) p-4">
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
</div>`}}});var d=t(l,2);j(d,{name:`Initial Focus Primary`,args:{initialFocus:`last`},parameters:{__svelteCsf:{rawCode:`<div class="bg-(--pd-content-card-bg) p-4" {dir}>
  <ButtonRow {initialFocus}>
    <Button type="secondary">Cancel</Button>
    <Button type="primary">Save</Button>
  </ButtonRow>
</div>`}}});var g=t(d,2);j(g,{name:`Initial Focus Cancel`,args:{initialFocus:`first`},parameters:{__svelteCsf:{rawCode:`<div class="bg-(--pd-content-card-bg) p-4" {dir}>
  <ButtonRow {initialFocus}>
    <Button type="secondary">Cancel</Button>
    <Button type="primary">Save</Button>
  </ButtonRow>
</div>`}}}),f(e,a),p()}var k,A,j,M,N,P,F,I,L,R,z,B,V,H,U;function W(){return(W=e((()=>{v(),b(),g(),D(),x(),c(),S(),k=(e,c)=>{let l=s(()=>d((c?.()).initialFocus,`none`)),p=s(()=>d((c?.()).dir,`ltr`));var m=N(),g=r(m);E(g,{get initialFocus(){return o(l)},children:(e,n)=>{var r=M(),a=i(r);T(a,{type:`secondary`,children:(e,t)=>{u();var n=y(`Cancel`);f(e,n)},$$slots:{default:!0}});var o=t(a,2);T(o,{type:`primary`,children:(e,t)=>{u();var n=y(`Save`);f(e,n)},$$slots:{default:!0}}),f(e,r)},$$slots:{default:!0}}),h(m),a(()=>{n(m,`dir`,o(p)),m.dir=m.dir}),f(e,m)},A={component:E,render:k,title:`Button/ButtonRow`,tags:[`autodocs`],argTypes:{initialFocus:{control:`select`,defaultValue:`none`,options:[`none`,`first`,`last`],description:`The enabled action that receives focus when the row mounts.`}}},{Story:j}=C(A),M=l(`<!> <!>`,1),N=l(`<div class="bg-(--pd-content-card-bg) p-4"><!></div>`),P=l(`<!> <!> <!>`,1),F=l(`<!> <!> <!> <!> <!> <!>`,1),O.__docgen={data:[],name:`ButtonRow.stories.svelte`},I=w(O,A),L=[`OneButton`,`TwoButtons`,`ThreeButtons`,`RTL`,`InitialFocusPrimary`,`InitialFocusCancel`],R={...I.OneButton,tags:[`svelte-csf-v5`]},z={...I.TwoButtons,tags:[`svelte-csf-v5`]},B={...I.ThreeButtons,tags:[`svelte-csf-v5`]},V={...I.RTL,tags:[`svelte-csf-v5`]},H={...I.InitialFocusPrimary,tags:[`svelte-csf-v5`]},U={...I.InitialFocusCancel,tags:[`svelte-csf-v5`]}})))()}W();export{U as InitialFocusCancel,H as InitialFocusPrimary,R as OneButton,V as RTL,B as ThreeButtons,z as TwoButtons,L as __namedExportsOrder,A as default};