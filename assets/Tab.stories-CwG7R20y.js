import{p as g,i as T,f as v,a as h,b as x,t as S,s as w,l as a,n as B,m as s,h as C}from"./props-CAYufPTI.js";import"./ErrorMessage-BYhYNJnJ.js";import"./Button-B0PIT-cy.js";import{T as i}from"./Table-BsAPBbYL.js";import"./LinearProgress-CokDMrY4.js";import"./Spinner-Co1qbeFI.js";import"./EmptyScreen-CCBQQEah.js";import"./fa-layers-text.svelte_svelte_type_style_lang-mZZx-obU.js";import{d as k,c as y,s as V}from"./create-runtime-stories-BZf2myEY.js";import"./class-BhXyH7b1.js";import"./index-client-B_kgGhha.js";import"./index-D45Brjt-.js";import"./StarIcon-ClkrxtFY.js";import"./_commonjsHelpers-Cpj98o6Y.js";import"./index-BMJuGjCE.js";import"./index-D-8MO0q_.js";import"./index-DxKRhftL.js";const{Story:l,meta:j}=k({component:i,title:"Tab",tags:["autodocs"],argTypes:{title:{control:"text",description:"Title of the tab",defaultValue:"Tab"},url:{control:"text",description:"Link to navigate to when tab is clicked",defaultValue:""},selected:{control:"boolean",description:"Flag the tab as being selected",defaultValue:!1}},parameters:{docs:{description:{component:"These are the stories for the `Tab` component.\nInteract with tabs."}}}});var q=S("<!> <!>",1);function c(d,p){g(p,!1),V((u,e,F=B)=>{let t=()=>C(e==null?void 0:e(),[]);var f=s(()=>t().title??""),_=s(()=>t().selected??!1),b=s(()=>t().url??"");i(u,{get title(){return a(f)},get selected(){return a(_)},get url(){return a(b)}})}),T();var r=q(),o=v(r);l(o,{name:"Basic",args:{title:"title 1"},parameters:{__svelteCsf:{rawCode:"<Tab title={args.title ?? ''} selected={args.selected ?? false} url={args.url ?? ''} />"}}});var m=w(o,2);l(m,{name:"Selected",args:{title:"title 1",selected:!0},parameters:{__svelteCsf:{rawCode:"<Tab title={args.title ?? ''} selected={args.selected ?? false} url={args.url ?? ''} />"}}}),h(d,r),x()}c.__docgen={keywords:[],data:[],name:"Tab.stories.svelte"};const n=y(c,j),X=["Basic","Selected"],Y=n.Basic,Z=n.Selected;export{Y as Basic,Z as Selected,X as __namedExportsOrder,j as default};