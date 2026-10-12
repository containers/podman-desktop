import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{$t as t,Bt as n,F as r,It as i,Tt as a,Ut as o,_n as s,an as c,c as l,fn as u,gt as d,mt as f,on as p,pn as m,wn as h,x as g,xn as _,yt as v,zt as y}from"./iframe-CYu10MOy.js";import{a as b,i as x,n as S,r as C,t as w}from"./create-runtime-stories-F6SWag8j.js";import{t as T}from"./Button-C16GsjjT.js";import{T as E,t as D}from"./dist-Bn2kHNGe.js";function O(e,t){p(t,!1),g();var r=F(),i=n(r);j(i,{name:`One Button`,args:{initialFocus:`none`},template:e=>{var t=N(),n=y(t);E(n,{children:(e,t)=>{T(e,{type:`primary`,children:(e,t)=>{u();var n=v(`Save`);f(e,n)},$$slots:{default:!0}})},$$slots:{default:!0}}),m(t),f(e,t)},$$slots:{template:!0},parameters:{__svelteCsf:{rawCode:`<div class="bg-(--pd-content-card-bg) p-4">
  <ButtonRow>
    <Button type="primary">Save</Button>
  </ButtonRow>
</div>`}}});var a=o(i,2);j(a,{name:`Two Buttons`,args:{initialFocus:`none`},parameters:{__svelteCsf:{rawCode:`<div class="bg-(--pd-content-card-bg) p-4" {dir}>
  <ButtonRow {initialFocus}>
    <Button type="secondary">Cancel</Button>
    <Button type="primary">Save</Button>
  </ButtonRow>
</div>`}}});var s=o(a,2);j(s,{name:`Three Buttons`,args:{initialFocus:`none`},template:e=>{var t=N(),r=y(t);E(r,{children:(e,t)=>{var r=P(),i=n(r);T(i,{type:`link`,children:(e,t)=>{u();var n=v(`Back`);f(e,n)},$$slots:{default:!0}});var a=o(i,2);T(a,{type:`secondary`,children:(e,t)=>{u();var n=v(`Cancel`);f(e,n)},$$slots:{default:!0}});var s=o(a,2);T(s,{type:`primary`,children:(e,t)=>{u();var n=v(`Save`);f(e,n)},$$slots:{default:!0}}),f(e,r)},$$slots:{default:!0}}),m(t),f(e,t)},$$slots:{template:!0},parameters:{__svelteCsf:{rawCode:`<div class="bg-(--pd-content-card-bg) p-4">
  <ButtonRow>
    <Button type="link">Back</Button>
    <Button type="secondary">Cancel</Button>
    <Button type="primary">Save</Button>
  </ButtonRow>
</div>`}}});var l=o(s,2);j(l,{name:`RTL`,args:{initialFocus:`none`,dir:`rtl`},parameters:{__svelteCsf:{rawCode:`<div class="bg-(--pd-content-card-bg) p-4" {dir}>
  <ButtonRow {initialFocus}>
    <Button type="secondary">Cancel</Button>
    <Button type="primary">Save</Button>
  </ButtonRow>
</div>`}}});var d=o(l,2);j(d,{name:`Initial Focus Primary`,args:{initialFocus:`last`},parameters:{__svelteCsf:{rawCode:`<div class="bg-(--pd-content-card-bg) p-4" {dir}>
  <ButtonRow {initialFocus}>
    <Button type="secondary">Cancel</Button>
    <Button type="primary">Save</Button>
  </ButtonRow>
</div>`}}});var h=o(d,2);j(h,{name:`Initial Focus Cancel`,args:{initialFocus:`first`},parameters:{__svelteCsf:{rawCode:`<div class="bg-(--pd-content-card-bg) p-4" {dir}>
  <ButtonRow {initialFocus}>
    <Button type="secondary">Cancel</Button>
    <Button type="primary">Save</Button>
  </ButtonRow>
</div>`}}}),f(e,r),c()}var k,A,j,M,N,P,F,I,L,R,z,B,V,H,U;function W(){return(W=e((()=>{h(),b(),_(),D(),x(),l(),S(),k=(e,c)=>{let l=t(()=>s((c?.()).initialFocus,`none`)),d=t(()=>s((c?.()).dir,`ltr`));var p=N(),h=y(p);E(h,{get initialFocus(){return a(l)},children:(e,t)=>{var r=M(),i=n(r);T(i,{type:`secondary`,children:(e,t)=>{u();var n=v(`Cancel`);f(e,n)},$$slots:{default:!0}});var a=o(i,2);T(a,{type:`primary`,children:(e,t)=>{u();var n=v(`Save`);f(e,n)},$$slots:{default:!0}}),f(e,r)},$$slots:{default:!0}}),m(p),i(()=>{r(p,`dir`,a(d)),p.dir=p.dir}),f(e,p)},A={component:E,render:k,title:`Button/ButtonRow`,tags:[`autodocs`],argTypes:{initialFocus:{control:`select`,defaultValue:`none`,options:[`none`,`first`,`last`],description:`The enabled action that receives focus when the row mounts.`}}},{Story:j}=C(A),M=d(`<!> <!>`,1),N=d(`<div class="bg-(--pd-content-card-bg) p-4"><!></div>`),P=d(`<!> <!> <!>`,1),F=d(`<!> <!> <!> <!> <!> <!>`,1),O.__docgen={data:[],name:`ButtonRow.stories.svelte`},I=w(O,A),L=[`OneButton`,`TwoButtons`,`ThreeButtons`,`RTL`,`InitialFocusPrimary`,`InitialFocusCancel`],R={...I.OneButton,tags:[`svelte-csf-v5`]},z={...I.TwoButtons,tags:[`svelte-csf-v5`]},B={...I.ThreeButtons,tags:[`svelte-csf-v5`]},V={...I.RTL,tags:[`svelte-csf-v5`]},H={...I.InitialFocusPrimary,tags:[`svelte-csf-v5`]},U={...I.InitialFocusCancel,tags:[`svelte-csf-v5`]}})))()}W();export{U as InitialFocusCancel,H as InitialFocusPrimary,R as OneButton,V as RTL,B as ThreeButtons,z as TwoButtons,L as __namedExportsOrder,A as default};