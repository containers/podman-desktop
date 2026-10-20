import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{Bt as t,It as n,Lt as r,c as i,gn as a,gt as o,ln as s,m as c,mt as l,nn as u,pn as d,rn as f,un as p,vn as m,x as h,xn as g,yt as _}from"./iframe-CjPe_oFj.js";import{a as v,i as y,n as b,r as x,t as S}from"./create-runtime-stories-B-UkN_EE.js";import{t as C,x as w}from"./dist-DyMyxPfU.js";function T(e,n){f(n,!1),h();var i=P(),a=r(i);A(a,{name:`Basic`,args:{value:`Initial value`},parameters:{__svelteCsf:{rawCode:`<div class="pb-24 flex flex-row">
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
</div>`}}});var c=t(o,2);A(c,{name:`Left snippet`,children:(e,n)=>{w(e,{left:e=>{s();var t=_(`Selected value:\xA0`);l(e,t)},children:(e,n)=>{var i=N(),a=r(i);a.value=a.__value=`a`;var o=t(a,2);o.value=o.__value=`b`,l(e,i)},$$slots:{left:!0,default:!0}})},$$slots:{default:!0},parameters:{__svelteCsf:{rawCode:`<Dropdown {...args}>
  <Dropdown>
<option value="a">One</option>
<option value="b">Two</option>
{#snippet left()}
  Selected value:&nbsp;
{/snippet}
</Dropdown>
</Dropdown>`}}}),l(e,i),u()}var E,D,O,k,A,j,M,N,P,F,I,L,R,z;function B(){return(B=e((()=>{g(),v(),m(),C(),y(),i(),b(),{fn:E}=__STORYBOOK_MODULE_TEST__,D=(e,i,o=a)=>{let s=()=>d(i?.(),[`_children`]);var u=M(),f=n(u);w(f,c(s,{children:(e,n)=>{var i=j(),a=r(i);a.value=a.__value=`a`;var o=t(a,2);o.value=o.__value=`b`;var s=t(o,2);s.value=s.__value=`c`,l(e,i)},$$slots:{default:!0}})),p(u),l(e,u)},O=E().mockName(`onchange`),k={component:w,render:D,title:`Dropdown`,tags:[`autodocs`],argTypes:{value:{control:`text`,description:`Initial value shown in the dropdown`,defaultValue:``},onchange:O,disabled:{control:`boolean`,description:`Set the dropdown as being disabled`,defaultValue:!1},options:{description:`Dropdown items`}},parameters:{docs:{description:{component:"These are the stories for the `Dropdown` component."}}}},{Story:A}=x(k),j=o(`<option>Item A</option> <option>Item B</option> <option>Item C</option>`,1),M=o(`<div class="pb-24 flex flex-row"><!></div>`),N=o(`<option>One</option> <option>Two</option>`,1),P=o(`<!> <!> <!>`,1),T.__docgen={data:[],name:`Dropdown.stories.svelte`},F=S(T,k),I=[`Basic`,`Disabled`,`LeftSnippet`],L={...F.Basic,tags:[`svelte-csf-v5`]},R={...F.Disabled,tags:[`svelte-csf-v5`]},z={...F.LeftSnippet,tags:[`svelte-csf-v5`]}})))()}B();export{L as Basic,R as Disabled,z as LeftSnippet,I as __namedExportsOrder,k as default};