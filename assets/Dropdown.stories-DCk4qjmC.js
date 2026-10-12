import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{Bt as t,Ut as n,an as r,c as i,fn as a,gn as o,gt as s,m as c,mt as l,on as u,pn as d,wn as f,x as p,xn as m,yn as h,yt as g,zt as _}from"./iframe-B1lhwXy_.js";import{a as v,i as y,n as b,r as x,t as S}from"./create-runtime-stories-DOswV0ku.js";import{t as C,x as w}from"./dist-BUnZlm1c.js";function T(e,i){u(i,!1),p();var o=P(),s=t(o);A(s,{name:`Basic`,args:{value:`Initial value`},parameters:{__svelteCsf:{rawCode:`<div class="pb-24 flex flex-row">
  <Dropdown {...args}>
    <option value="a">Item A</option>
    <option value="b">Item B</option>
    <option value="c">Item C</option>
  </Dropdown>
</div>`}}});var c=n(s,2);A(c,{name:`Disabled`,args:{value:`Disabled dropdown`,disabled:!0},parameters:{__svelteCsf:{rawCode:`<div class="pb-24 flex flex-row">
  <Dropdown {...args}>
    <option value="a">Item A</option>
    <option value="b">Item B</option>
    <option value="c">Item C</option>
  </Dropdown>
</div>`}}});var d=n(c,2);A(d,{name:`Left snippet`,children:(e,r)=>{w(e,{left:e=>{a();var t=g(`Selected value:\xA0`);l(e,t)},children:(e,r)=>{var i=N(),a=t(i);a.value=a.__value=`a`;var o=n(a,2);o.value=o.__value=`b`,l(e,i)},$$slots:{left:!0,default:!0}})},$$slots:{default:!0},parameters:{__svelteCsf:{rawCode:`<Dropdown {...args}>
  <Dropdown>
<option value="a">One</option>
<option value="b">Two</option>
{#snippet left()}
  Selected value:&nbsp;
{/snippet}
</Dropdown>
</Dropdown>`}}}),l(e,o),r()}var E,D,O,k,A,j,M,N,P,F,I,L,R,z;function B(){return(B=e((()=>{f(),v(),m(),C(),y(),i(),b(),{fn:E}=__STORYBOOK_MODULE_TEST__,D=(e,r,i=h)=>{let a=()=>o(r?.(),[`_children`]);var s=M(),u=_(s);w(u,c(a,{children:(e,r)=>{var i=j(),a=t(i);a.value=a.__value=`a`;var o=n(a,2);o.value=o.__value=`b`;var s=n(o,2);s.value=s.__value=`c`,l(e,i)},$$slots:{default:!0}})),d(s),l(e,s)},O=E().mockName(`onchange`),k={component:w,render:D,title:`Dropdown`,tags:[`autodocs`],argTypes:{value:{control:`text`,description:`Initial value shown in the dropdown`,defaultValue:``},onchange:O,disabled:{control:`boolean`,description:`Set the dropdown as being disabled`,defaultValue:!1},options:{description:`Dropdown items`}},parameters:{docs:{description:{component:"These are the stories for the `Dropdown` component."}}}},{Story:A}=x(k),j=s(`<option>Item A</option> <option>Item B</option> <option>Item C</option>`,1),M=s(`<div class="pb-24 flex flex-row"><!></div>`),N=s(`<option>One</option> <option>Two</option>`,1),P=s(`<!> <!> <!>`,1),T.__docgen={data:[],name:`Dropdown.stories.svelte`},F=S(T,k),I=[`Basic`,`Disabled`,`LeftSnippet`],L={...F.Basic,tags:[`svelte-csf-v5`]},R={...F.Disabled,tags:[`svelte-csf-v5`]},z={...F.LeftSnippet,tags:[`svelte-csf-v5`]}})))()}B();export{L as Basic,R as Disabled,z as LeftSnippet,I as __namedExportsOrder,k as default};