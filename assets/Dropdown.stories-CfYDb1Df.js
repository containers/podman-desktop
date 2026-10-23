import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{Bt as t,Cn as n,It as r,Lt as i,bn as a,c as o,dn as s,fn as c,gt as l,hn as u,m as d,mt as f,nn as p,rn as m,vn as h,x as g,yt as _}from"./iframe-BuUfevjj.js";import{a as v,i as y,n as b,r as x,t as S}from"./create-runtime-stories-Dz1MLO6o.js";import{t as C,x as w}from"./dist-CACye4oM.js";function T(e,n){m(n,!1),g();var r=P(),a=i(r);A(a,{name:`Basic`,args:{value:`Initial value`},parameters:{__svelteCsf:{rawCode:`<div class="pb-24 flex flex-row">
  <Dropdown {...args}>
    <option value="a">Item A</option>
    <option value="b">Item B</option>
    <option value="c">Item C</option>
  </Dropdown>
</div>`}}});var o=t(a,2);A(o,{name:`Disabled`,args:{value:`Disabled dropdown`,disabled:!0},parameters:{__svelteCsf:{rawCode:`<div class="pb-24 flex flex-row">
  <Dropdown {...args}>
    <option value="a">Item A</option>
    <option value="b">Item B</option>
    <option value="c">Item C</option>
  </Dropdown>
</div>`}}});var c=t(o,2);A(c,{name:`Left snippet`,children:(e,n)=>{w(e,{left:e=>{s();var t=_(`Selected value:\xA0`);f(e,t)},children:(e,n)=>{var r=N(),a=i(r);a.value=a.__value=`a`;var o=t(a,2);o.value=o.__value=`b`,f(e,r)},$$slots:{left:!0,default:!0}})},$$slots:{default:!0},parameters:{__svelteCsf:{rawCode:`<Dropdown {...args}>
  <Dropdown>
<option value="a">One</option>
<option value="b">Two</option>
{#snippet left()}
  Selected value:&nbsp;
{/snippet}
</Dropdown>
</Dropdown>`}}}),f(e,r),p()}var E,D,O,k,A,j,M,N,P,F,I,L,R,z;function B(){return(B=e((()=>{n(),v(),a(),C(),y(),o(),b(),{fn:E}=__STORYBOOK_MODULE_TEST__,D=(e,n,a=h)=>{let o=()=>u(n?.(),[`_children`]);var s=M(),l=r(s);w(l,d(o,{children:(e,n)=>{var r=j(),a=i(r);a.value=a.__value=`a`;var o=t(a,2);o.value=o.__value=`b`;var s=t(o,2);s.value=s.__value=`c`,f(e,r)},$$slots:{default:!0}})),c(s),f(e,s)},O=E().mockName(`onchange`),k={component:w,render:D,title:`Dropdown`,tags:[`autodocs`],argTypes:{value:{control:`text`,description:`Initial value shown in the dropdown`,defaultValue:``},onchange:O,disabled:{control:`boolean`,description:`Set the dropdown as being disabled`,defaultValue:!1},options:{description:`Dropdown items`}},parameters:{docs:{description:{component:"These are the stories for the `Dropdown` component."}}}},{Story:A}=x(k),j=l(`<option>Item A</option> <option>Item B</option> <option>Item C</option>`,1),M=l(`<div class="pb-24 flex flex-row"><!></div>`),N=l(`<option>One</option> <option>Two</option>`,1),P=l(`<!> <!> <!>`,1),T.__docgen={data:[],name:`Dropdown.stories.svelte`},F=S(T,k),I=[`Basic`,`Disabled`,`LeftSnippet`],L={...F.Basic,tags:[`svelte-csf-v5`]},R={...F.Disabled,tags:[`svelte-csf-v5`]},z={...F.LeftSnippet,tags:[`svelte-csf-v5`]}})))()}B();export{L as Basic,R as Disabled,z as LeftSnippet,I as __namedExportsOrder,k as default};