import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{Bt as t,F as n,It as r,Lt as i,Nt as a,Q as o,Tt as s,c,dt as l,gt as u,ht as d,ln as f,m as p,mt as m,nn as h,pn as g,rn as _,tt as v,un as y,vn as b,x,xn as ee,yt as S,zt as C}from"./iframe-CN2XtfuK.js";import{a as te,i as ne,n as re,r as ie,t as ae}from"./create-runtime-stories-BJsucbnG.js";import{C as oe,D as w,L as se,N as T,O as E,_ as D,a as O,j as ce,k,l as le,o as A}from"./Icon-ircuLpZN.js";import{n as ue,t as j}from"./Button-DDehqoQ1.js";import{r as de,t as M}from"./free-regular-svg-icons-BVuv8LiA.js";function N(e,n){_(n,!1),x();var r=H(),a=i(r);L(a,{name:`Basic`,args:{kind:`basic`},parameters:{__svelteCsf:{rawCode:`{#if args.kind && groupKinds[args.kind]}
  <div class="bg-(--pd-content-card-bg) p-4" dir={groupKinds[args.kind].dir}>
    <div class="flex flex-col gap-4">
      <div class="text-sm font-semibold text-(--pd-content-header)">{groupKinds[args.kind].label}</div>
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {#each groupKinds[args.kind].variants as variant (variant.name)}
          <div class="flex flex-col gap-2">
            <div class="text-xs text-(--pd-content-text)">{variant.name}</div>
            <!-- An empty body still counts as children, which would hide a missing aria-label on icon-only buttons -->
            <div class="contents" lang={variant.lang}>
              {#if variant.args.content}
                <Button {...variant.args}>{variant.args.content}</Button>
              {:else}
                <Button {...variant.args} />
              {/if}
            </div>
          </div>
        {/each}
      </div>
    </div>
  </div>
{:else}
  <div class="bg-(--pd-content-card-bg) p-4">
    <Button {...args}>{args.content}</Button>
  </div>
{/if}`}}});var o=t(a,2);L(o,{name:`States`,args:{kind:`states`},parameters:{__svelteCsf:{rawCode:`{#if args.kind && groupKinds[args.kind]}
  <div class="bg-(--pd-content-card-bg) p-4" dir={groupKinds[args.kind].dir}>
    <div class="flex flex-col gap-4">
      <div class="text-sm font-semibold text-(--pd-content-header)">{groupKinds[args.kind].label}</div>
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {#each groupKinds[args.kind].variants as variant (variant.name)}
          <div class="flex flex-col gap-2">
            <div class="text-xs text-(--pd-content-text)">{variant.name}</div>
            <!-- An empty body still counts as children, which would hide a missing aria-label on icon-only buttons -->
            <div class="contents" lang={variant.lang}>
              {#if variant.args.content}
                <Button {...variant.args}>{variant.args.content}</Button>
              {:else}
                <Button {...variant.args} />
              {/if}
            </div>
          </div>
        {/each}
      </div>
    </div>
  </div>
{:else}
  <div class="bg-(--pd-content-card-bg) p-4">
    <Button {...args}>{args.content}</Button>
  </div>
{/if}`}}});var s=t(o,2);L(s,{name:`Icons`,args:{kind:`icons`},parameters:{__svelteCsf:{rawCode:`{#if args.kind && groupKinds[args.kind]}
  <div class="bg-(--pd-content-card-bg) p-4" dir={groupKinds[args.kind].dir}>
    <div class="flex flex-col gap-4">
      <div class="text-sm font-semibold text-(--pd-content-header)">{groupKinds[args.kind].label}</div>
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {#each groupKinds[args.kind].variants as variant (variant.name)}
          <div class="flex flex-col gap-2">
            <div class="text-xs text-(--pd-content-text)">{variant.name}</div>
            <!-- An empty body still counts as children, which would hide a missing aria-label on icon-only buttons -->
            <div class="contents" lang={variant.lang}>
              {#if variant.args.content}
                <Button {...variant.args}>{variant.args.content}</Button>
              {:else}
                <Button {...variant.args} />
              {/if}
            </div>
          </div>
        {/each}
      </div>
    </div>
  </div>
{:else}
  <div class="bg-(--pd-content-card-bg) p-4">
    <Button {...args}>{args.content}</Button>
  </div>
{/if}`}}});var c=t(s,2);L(c,{name:`Examples`,args:{kind:`examples`},parameters:{__svelteCsf:{rawCode:`{#if args.kind && groupKinds[args.kind]}
  <div class="bg-(--pd-content-card-bg) p-4" dir={groupKinds[args.kind].dir}>
    <div class="flex flex-col gap-4">
      <div class="text-sm font-semibold text-(--pd-content-header)">{groupKinds[args.kind].label}</div>
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {#each groupKinds[args.kind].variants as variant (variant.name)}
          <div class="flex flex-col gap-2">
            <div class="text-xs text-(--pd-content-text)">{variant.name}</div>
            <!-- An empty body still counts as children, which would hide a missing aria-label on icon-only buttons -->
            <div class="contents" lang={variant.lang}>
              {#if variant.args.content}
                <Button {...variant.args}>{variant.args.content}</Button>
              {:else}
                <Button {...variant.args} />
              {/if}
            </div>
          </div>
        {/each}
      </div>
    </div>
  </div>
{:else}
  <div class="bg-(--pd-content-card-bg) p-4">
    <Button {...args}>{args.content}</Button>
  </div>
{/if}`}}});var l=t(c,2);L(l,{name:`Patterns`,args:{kind:`patterns`},parameters:{__svelteCsf:{rawCode:`{#if args.kind && groupKinds[args.kind]}
  <div class="bg-(--pd-content-card-bg) p-4" dir={groupKinds[args.kind].dir}>
    <div class="flex flex-col gap-4">
      <div class="text-sm font-semibold text-(--pd-content-header)">{groupKinds[args.kind].label}</div>
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {#each groupKinds[args.kind].variants as variant (variant.name)}
          <div class="flex flex-col gap-2">
            <div class="text-xs text-(--pd-content-text)">{variant.name}</div>
            <!-- An empty body still counts as children, which would hide a missing aria-label on icon-only buttons -->
            <div class="contents" lang={variant.lang}>
              {#if variant.args.content}
                <Button {...variant.args}>{variant.args.content}</Button>
              {:else}
                <Button {...variant.args} />
              {/if}
            </div>
          </div>
        {/each}
      </div>
    </div>
  </div>
{:else}
  <div class="bg-(--pd-content-card-bg) p-4">
    <Button {...args}>{args.content}</Button>
  </div>
{/if}`}}});var u=t(l,2);L(u,{name:`Edge Cases`,args:{kind:`edges`},parameters:{__svelteCsf:{rawCode:`{#if args.kind && groupKinds[args.kind]}
  <div class="bg-(--pd-content-card-bg) p-4" dir={groupKinds[args.kind].dir}>
    <div class="flex flex-col gap-4">
      <div class="text-sm font-semibold text-(--pd-content-header)">{groupKinds[args.kind].label}</div>
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {#each groupKinds[args.kind].variants as variant (variant.name)}
          <div class="flex flex-col gap-2">
            <div class="text-xs text-(--pd-content-text)">{variant.name}</div>
            <!-- An empty body still counts as children, which would hide a missing aria-label on icon-only buttons -->
            <div class="contents" lang={variant.lang}>
              {#if variant.args.content}
                <Button {...variant.args}>{variant.args.content}</Button>
              {:else}
                <Button {...variant.args} />
              {/if}
            </div>
          </div>
        {/each}
      </div>
    </div>
  </div>
{:else}
  <div class="bg-(--pd-content-card-bg) p-4">
    <Button {...args}>{args.content}</Button>
  </div>
{/if}`}}});var d=t(u,2);L(d,{name:`Toggle Buttons`,args:{kind:`toggles`},parameters:{__svelteCsf:{rawCode:`{#if args.kind && groupKinds[args.kind]}
  <div class="bg-(--pd-content-card-bg) p-4" dir={groupKinds[args.kind].dir}>
    <div class="flex flex-col gap-4">
      <div class="text-sm font-semibold text-(--pd-content-header)">{groupKinds[args.kind].label}</div>
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {#each groupKinds[args.kind].variants as variant (variant.name)}
          <div class="flex flex-col gap-2">
            <div class="text-xs text-(--pd-content-text)">{variant.name}</div>
            <!-- An empty body still counts as children, which would hide a missing aria-label on icon-only buttons -->
            <div class="contents" lang={variant.lang}>
              {#if variant.args.content}
                <Button {...variant.args}>{variant.args.content}</Button>
              {:else}
                <Button {...variant.args} />
              {/if}
            </div>
          </div>
        {/each}
      </div>
    </div>
  </div>
{:else}
  <div class="bg-(--pd-content-card-bg) p-4">
    <Button {...args}>{args.content}</Button>
  </div>
{/if}`}}});var f=t(d,2);L(f,{name:`Tabs`,args:{kind:`tabs`},parameters:{__svelteCsf:{rawCode:`{#if args.kind && groupKinds[args.kind]}
  <div class="bg-(--pd-content-card-bg) p-4" dir={groupKinds[args.kind].dir}>
    <div class="flex flex-col gap-4">
      <div class="text-sm font-semibold text-(--pd-content-header)">{groupKinds[args.kind].label}</div>
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {#each groupKinds[args.kind].variants as variant (variant.name)}
          <div class="flex flex-col gap-2">
            <div class="text-xs text-(--pd-content-text)">{variant.name}</div>
            <!-- An empty body still counts as children, which would hide a missing aria-label on icon-only buttons -->
            <div class="contents" lang={variant.lang}>
              {#if variant.args.content}
                <Button {...variant.args}>{variant.args.content}</Button>
              {:else}
                <Button {...variant.args} />
              {/if}
            </div>
          </div>
        {/each}
      </div>
    </div>
  </div>
{:else}
  <div class="bg-(--pd-content-card-bg) p-4">
    <Button {...args}>{args.content}</Button>
  </div>
{/if}`}}});var p=t(f,2);L(p,{name:`RTL`,args:{kind:`rtl`},parameters:{__svelteCsf:{rawCode:`{#if args.kind && groupKinds[args.kind]}
  <div class="bg-(--pd-content-card-bg) p-4" dir={groupKinds[args.kind].dir}>
    <div class="flex flex-col gap-4">
      <div class="text-sm font-semibold text-(--pd-content-header)">{groupKinds[args.kind].label}</div>
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {#each groupKinds[args.kind].variants as variant (variant.name)}
          <div class="flex flex-col gap-2">
            <div class="text-xs text-(--pd-content-text)">{variant.name}</div>
            <!-- An empty body still counts as children, which would hide a missing aria-label on icon-only buttons -->
            <div class="contents" lang={variant.lang}>
              {#if variant.args.content}
                <Button {...variant.args}>{variant.args.content}</Button>
              {:else}
                <Button {...variant.args} />
              {/if}
            </div>
          </div>
        {/each}
      </div>
    </div>
  </div>
{:else}
  <div class="bg-(--pd-content-card-bg) p-4">
    <Button {...args}>{args.content}</Button>
  </div>
{/if}`}}}),m(e,r),h()}var fe,P,F,I,L,R,z,B,V,H,U,W,G,K,q,J,Y,X,Z,Q,$;function pe(){return(pe=e((()=>{ee(),te(),b(),de(),se(),ue(),ne(),c(),re(),{fn:fe}=__STORYBOOK_MODULE_TEST__,P=(e,c)=>{let u=()=>g(c?.(),[]);var h=d(),_=i(h),b=e=>{var i=B(),c=r(i),d=r(c),h=C(d,!0),g=t(d,2);o(g,5,()=>R[u().kind].variants,e=>e.name,(e,i)=>{var o=z(),c=r(o),u=C(c,!0),d=t(c,2),h=r(d),g=e=>{j(e,p(()=>s(i).args,{children:(e,t)=>{f();var n=S();a(()=>l(n,s(i).args.content)),m(e,n)},$$slots:{default:!0}}))},_=e=>{j(e,p(()=>s(i).args))};v(h,e=>{s(i).args.content?e(g):e(_,-1)}),y(d),y(o),a(()=>{l(u,s(i).name),n(d,`lang`,s(i).lang)}),m(e,o)}),y(g),y(c),y(i),a(()=>{n(i,`dir`,R[u().kind].dir),l(h,R[u().kind].label),i.dir=i.dir}),m(e,i)},x=e=>{var t=V(),n=r(t);j(n,p(u,{children:(e,t)=>{f();var n=S();a(()=>l(n,u().content)),m(e,n)},$$slots:{default:!0}})),y(t),m(e,t)};v(_,e=>{u().kind&&R[u().kind]?e(b):e(x,-1)}),m(e,h)},F=fe().mockName(`onclick`),I={component:j,render:P,title:`Button/Button`,tags:[`autodocs`],argTypes:{kind:{table:{disable:!0}}},args:{onclick:F},parameters:{docs:{description:{component:`These are the stories for the \`Button\` component.
It's the default button we use throughout our application.

This collection showcases button types, states, and usage patterns
found in the Podman Desktop application.`}}}},{Story:L}=ie(I),R={basic:{label:`Basic Types`,variants:[{name:`Primary`,args:{type:`primary`,content:`Primary`}},{name:`Secondary`,args:{type:`secondary`,content:`Secondary`}},{name:`Danger`,args:{type:`danger`,content:`Danger`}},{name:`Link`,args:{type:`link`,content:`Link`}},{name:`Tab`,args:{type:`tab`,content:`Tab`}},{name:`Tab Selected`,args:{type:`tab`,content:`Selected Tab`,selected:!0}},{name:`Default (No Type)`,args:{content:`Default Button`}}]},states:{label:`States`,variants:[{name:`Primary Disabled`,args:{type:`primary`,content:`Primary Disabled`,disabled:!0}},{name:`Secondary Disabled`,args:{type:`secondary`,content:`Secondary Disabled`,disabled:!0}},{name:`Danger Disabled`,args:{type:`danger`,content:`Danger Disabled`,disabled:!0}},{name:`Primary Loading`,args:{type:`primary`,content:`Loading`,inProgress:!0}},{name:`Secondary Loading`,args:{type:`secondary`,content:`Loading`,inProgress:!0}},{name:`Danger Loading`,args:{type:`danger`,content:`Loading`,inProgress:!0}},{name:`Loading With Icon`,args:{type:`primary`,content:`Loading with Icon`,inProgress:!0,icon:M}},{name:`Disabled + Loading`,args:{type:`primary`,content:`Disabled + Loading`,disabled:!0,inProgress:!0}}]},icons:{label:`Icons`,variants:[{name:`Primary With Icon`,args:{type:`primary`,content:`With Icon`,icon:M}},{name:`Secondary With Icon`,args:{type:`secondary`,content:`With Icon`,icon:w}},{name:`Danger With Icon`,args:{type:`danger`,content:`With Icon`,icon:T}},{name:`Link With Icon`,args:{type:`link`,content:`More details`,icon:A}},{name:`Icon Only`,args:{type:`primary`,icon:T,"aria-label":`Delete`}},{name:`Icon Only Secondary`,args:{type:`secondary`,icon:E,"aria-label":`Add`}},{name:`Icon Only With Tooltip`,args:{type:`primary`,icon:E,"aria-label":`Add build argument`,title:`Add build argument`}},{name:`Disabled Icon Only`,args:{type:`secondary`,icon:E,disabled:!0,"aria-label":`Add item`}}]},examples:{label:`Examples`,variants:[{name:`Build`,args:{type:`primary`,content:`Build`,icon:D}},{name:`Pull Image`,args:{type:`primary`,content:`Pull image`,icon:O}},{name:`Install`,args:{type:`primary`,content:`Install`,icon:k}},{name:`Prune`,args:{type:`primary`,content:`Prune`,icon:T,title:`Remove unused data`}},{name:`Cleanup`,args:{type:`danger`,content:`Cleanup / Purge data`,icon:le}},{name:`Clear All`,args:{type:`primary`,content:`Clear all`,icon:T}},{name:`Start`,args:{type:`primary`,content:`Start`,icon:w}},{name:`Stop`,args:{type:`primary`,content:`Stop`,icon:ce}},{name:`Add`,args:{type:`primary`,content:`Add`}},{name:`Cancel (Secondary)`,args:{type:`secondary`,content:`Cancel`}},{name:`Cancel (Link)`,args:{type:`link`,content:`Cancel`}},{name:`Skip`,args:{type:`secondary`,content:`Skip`}},{name:`Next`,args:{type:`primary`,content:`Next`}},{name:`Login`,args:{type:`primary`,content:`Login`}},{name:`Login Disabled`,args:{type:`primary`,content:`Login`,disabled:!0}},{name:`Login Loading`,args:{type:`primary`,content:`Login`,inProgress:!0}},{name:`Add Build Argument`,args:{type:`secondary`,icon:E,"aria-label":`Add build argument`}},{name:`Delete Build Argument`,args:{type:`secondary`,icon:oe,"aria-label":`Delete build argument`}}]},patterns:{label:`Patterns`,variants:[{name:`Full Width`,args:{type:`primary`,content:`Full Width Button`,class:`w-full`}},{name:`Full Width With Icon`,args:{type:`primary`,content:`Build`,icon:D,class:`w-full`}},{name:`Custom Padding Small`,args:{type:`primary`,content:`Small Padding`,padding:`px-2 py-1`}},{name:`Custom Padding Large`,args:{type:`primary`,content:`Large Padding`,padding:`px-6 py-3`}},{name:`Custom Padding Compact`,args:{type:`primary`,content:`Update to v1.2.3`,padding:`px-3 py-0.5`,icon:k}},{name:`Loading Installation`,args:{type:`primary`,content:`Install`,icon:k,inProgress:!0}},{name:`Loading Pull`,args:{type:`primary`,content:`Pull image`,icon:O,inProgress:!0}},{name:`With Margin Right`,args:{type:`secondary`,content:`Cancel`,class:`mr-3`}},{name:`With Margin Left`,args:{type:`link`,content:`Link Button`,class:`ml-3`}},{name:`Auto Width`,args:{type:`primary`,content:`Auto Width`,class:`w-auto`}},{name:`Link With Underline`,args:{type:`link`,content:`Underlined Link`,class:`underline`}}]},edges:{label:`Edge Cases`,variants:[{name:`Very Long Text`,args:{type:`primary`,content:`This is a button with very long text that might wrap or overflow`}},{name:`Hidden Button`,args:{type:`primary`,content:`Hidden`,hidden:!0}},{name:`Custom Class`,args:{type:`primary`,content:`Custom Class`,class:`opacity-50 hover:opacity-100`}},{name:`Custom Aria Label`,args:{type:`danger`,content:`Delete`,icon:T,"aria-label":`Delete container web-1`}},{name:`All Props`,args:{type:`primary`,content:`Pull image`,icon:O,title:`Pull the image from its registry`,"aria-label":`Pull image quay.io/podman/hello`,class:`custom-class`}},{name:`Long Label (German)`,lang:`de`,args:{type:`primary`,content:`Alle nicht verwendeten Images entfernen`,icon:T}},{name:`Long Label (Finnish)`,lang:`fi`,args:{type:`secondary`,content:`Poista kaikki käyttämättömät levykuvat`}}]},toggles:{label:`Toggle Buttons`,variants:[{name:`Toggle Pressed`,args:{type:`primary`,content:`Notifications`,pressed:!0}},{name:`Toggle Unpressed`,args:{type:`primary`,content:`Notifications`,pressed:!1}},{name:`Toggle Secondary Pressed`,args:{type:`secondary`,content:`Filter`,pressed:!0}},{name:`Toggle Secondary Unpressed`,args:{type:`secondary`,content:`Filter`,pressed:!1}},{name:`Toggle Icon Only Pressed`,args:{type:`secondary`,icon:M,pressed:!0,"aria-label":`Mute notifications`}},{name:`Toggle Icon Only Unpressed`,args:{type:`secondary`,icon:M,pressed:!1,"aria-label":`Mute notifications`}},{name:`Toggle Disabled Pressed`,args:{type:`secondary`,content:`Filter`,pressed:!0,disabled:!0}}]},tabs:{label:`Tabs`,variants:[{name:`Tab Group Unselected`,args:{type:`tab`,content:`All`,selected:!1}},{name:`Tab Group Selected`,args:{type:`tab`,content:`Running`,selected:!0}},{name:`Tab Capitalize`,args:{type:`tab`,content:`completed`,class:`capitalize`,selected:!1}},{name:`Tab Capitalize Selected`,args:{type:`tab`,content:`completed`,class:`capitalize`,selected:!0}},{name:`Tab With Custom Class`,args:{type:`tab`,content:`Custom Tab`,class:`capitalize`}}]},rtl:{label:`Right-to-Left`,variants:[{name:`Primary With Icon`,lang:`ar`,args:{type:`primary`,content:`سحب الصورة`,icon:O}},{name:`Link With Icon`,lang:`ar`,args:{type:`link`,content:`مزيد من التفاصيل`,icon:A}},{name:`Loading With Icon`,lang:`ar`,args:{type:`primary`,content:`تثبيت`,icon:k,inProgress:!0}},{name:`Icon Only`,lang:`ar`,args:{type:`secondary`,icon:E,"aria-label":`إضافة`}}],dir:`rtl`}},z=u(`<div class="flex flex-col gap-2"><div class="text-xs text-(--pd-content-text)"> </div> <div class="contents"><!></div></div>`),B=u(`<div class="bg-(--pd-content-card-bg) p-4"><div class="flex flex-col gap-4"><div class="text-sm font-semibold text-(--pd-content-header)"> </div> <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"></div></div></div>`),V=u(`<div class="bg-(--pd-content-card-bg) p-4"><!></div>`),H=u(`<!> <!> <!> <!> <!> <!> <!> <!> <!>`,1),N.__docgen={data:[],name:`Button.stories.svelte`},U=ae(N,I),W=[`Basic`,`States`,`Icons`,`Examples`,`Patterns`,`EdgeCases`,`ToggleButtons`,`Tabs`,`RTL`],G={...U.Basic,tags:[`svelte-csf-v5`]},K={...U.States,tags:[`svelte-csf-v5`]},q={...U.Icons,tags:[`svelte-csf-v5`]},J={...U.Examples,tags:[`svelte-csf-v5`]},Y={...U.Patterns,tags:[`svelte-csf-v5`]},X={...U.EdgeCases,tags:[`svelte-csf-v5`]},Z={...U.ToggleButtons,tags:[`svelte-csf-v5`]},Q={...U.Tabs,tags:[`svelte-csf-v5`]},$={...U.RTL,tags:[`svelte-csf-v5`]}})))()}pe();export{G as Basic,X as EdgeCases,J as Examples,q as Icons,Y as Patterns,$ as RTL,K as States,Q as Tabs,Z as ToggleButtons,W as __namedExportsOrder,I as default};