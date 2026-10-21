import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{Bt as t,It as n,Lt as r,Nt as i,Tt as a,V as o,Xt as s,c,dt as l,gn as u,gt as d,mt as f,nn as p,rn as m,tt as h,un as g,vn as _,x as v,xn as y,zt as b}from"./iframe-CN2XtfuK.js";import{a as x,i as S,n as C,r as w,t as ee}from"./create-runtime-stories-BJsucbnG.js";import{L as te,P as T,f as ne,g as E,t as D}from"./Icon-ircuLpZN.js";import{r as re}from"./Button-DDehqoQ1.js";import{k as O,m as ie,t as ae}from"./dist-BtaziokE.js";function k(e,i){m(i,!1),v();var a=q(),o=r(a);I(o,{name:`Message Types`,children:(e,r)=>{var i=oe(),a=n(i),o=t(n(a),2),s=n(o);A(s,()=>`success`,()=>`Success`,()=>`Container started successfully`);var c=t(s,2);A(c,()=>`error`,()=>`Error`,()=>`Failed to start container: permission denied`);var l=t(c,2);A(l,()=>`warning`,()=>`Warning`,()=>`Container exited with non-zero status code`);var u=t(l,2);A(u,()=>`info`,()=>`Info`,()=>`Pulling image podman-desktop/ubuntu:latest`),g(o),g(a),g(i),f(e,i)},$$slots:{default:!0},parameters:{docs:{description:{story:`All message types in one view`}},__svelteCsf:{rawCode:`<undefined {...args}>
  <div class="bg-(--pd-content-bg) p-8">
<div class="flex flex-col gap-6">
  <p class="text-sm text-(--pd-content-text)">
    Message toasts use colored backgrounds from the <code>--pd-toast-*</code> color registry
    variables. Switch themes to verify all variants update correctly.
  </p>
  <div class="flex flex-wrap gap-6">
    {@render messageToast('success', 'Success', 'Container started successfully')}
    {@render messageToast('error', 'Error', 'Failed to start container: permission denied')}
    {@render messageToast('warning', 'Warning', 'Container exited with non-zero status code')}
    {@render messageToast('info', 'Info', 'Pulling image podman-desktop/ubuntu:latest')}
  </div>
</div>
</div>
</undefined>`}}});var s=t(o,2);I(s,{name:`Message: Success`,children:(e,t)=>{var r=W(),i=n(r);A(i,()=>`success`,()=>`Success`,()=>`Container started successfully`),g(r),f(e,r)},$$slots:{default:!0},parameters:{docs:{description:{story:`Individual message type stories`}},__svelteCsf:{rawCode:`<undefined {...args}>
  <div class="bg-(--pd-content-bg) p-8">
{@render messageToast('success', 'Success', 'Container started successfully')}
</div>
</undefined>`}}});var c=t(s,2);I(c,{name:`Message: Error`,children:(e,t)=>{var r=W(),i=n(r);A(i,()=>`error`,()=>`Error`,()=>`Failed to start container: permission denied`),g(r),f(e,r)},$$slots:{default:!0},parameters:{__svelteCsf:{rawCode:`<undefined {...args}>
  <div class="bg-(--pd-content-bg) p-8">
{@render messageToast('error', 'Error', 'Failed to start container: permission denied')}
</div>
</undefined>`}}});var l=t(c,2);I(l,{name:`Message: Warning`,children:(e,t)=>{var r=W(),i=n(r);A(i,()=>`warning`,()=>`Warning`,()=>`Container exited with non-zero status code`),g(r),f(e,r)},$$slots:{default:!0},parameters:{__svelteCsf:{rawCode:`<undefined {...args}>
  <div class="bg-(--pd-content-bg) p-8">
{@render messageToast('warning', 'Warning', 'Container exited with non-zero status code')}
</div>
</undefined>`}}});var u=t(l,2);I(u,{name:`Message: Info`,children:(e,t)=>{var r=W(),i=n(r);A(i,()=>`info`,()=>`Info`,()=>`Pulling image podman-desktop/ubuntu:latest`),g(r),f(e,r)},$$slots:{default:!0},parameters:{__svelteCsf:{rawCode:`<undefined {...args}>
  <div class="bg-(--pd-content-bg) p-8">
{@render messageToast('info', 'Info', 'Pulling image podman-desktop/ubuntu:latest')}
</div>
</undefined>`}}});var d=t(u,2);I(d,{name:`Task Notifications`,children:(e,r)=>{var i=G(),a=n(i),o=t(n(a),2),s=n(o);j(s,()=>`Pulling image podman-desktop/ubuntu:latest`);var c=t(s,2);M(c,()=>`Container started successfully`);var l=t(c,2);N(l,()=>`Build podman-desktop/myapp`,()=>`Dockerfile parse error on line 12`);var u=t(l,2);P(u,()=>`Pull podman-desktop/ubuntu:latest`),g(o),g(a),g(i),f(e,i)},$$slots:{default:!0},parameters:{docs:{description:{story:`All task notification states in one view`}},__svelteCsf:{rawCode:`<undefined {...args}>
  <div class="bg-(--pd-content-bg) p-8">
<div class="flex flex-col gap-6">
  <p class="text-sm text-(--pd-content-text)">
    Task toasts track long-running operations such as pulling images or starting providers.
    They use <code>--pd-modal-bg</code> as background and <code>--pd-state-*</code> variables
    for the status icons, independent of the message toast palette.
  </p>
  <div class="flex flex-wrap gap-6">
    {@render taskToastInProgress('Pulling image podman-desktop/ubuntu:latest')}
    {@render taskToastSuccess('Container started successfully')}
    {@render taskToastFailure('Build podman-desktop/myapp', 'Dockerfile parse error on line 12')}
    {@render taskToastCanceled('Pull podman-desktop/ubuntu:latest')}
  </div>
</div>
</div>
</undefined>`}}});var h=t(d,2);I(h,{name:`Task: In Progress`,children:(e,t)=>{var r=W(),i=n(r);j(i,()=>`Pulling image podman-desktop/ubuntu:latest`),g(r),f(e,r)},$$slots:{default:!0},parameters:{docs:{description:{story:`Individual task state stories`}},__svelteCsf:{rawCode:`<undefined {...args}>
  <div class="bg-(--pd-content-bg) p-8">
{@render taskToastInProgress('Pulling image podman-desktop/ubuntu:latest')}
</div>
</undefined>`}}});var _=t(h,2);I(_,{name:`Task: Success`,children:(e,t)=>{var r=W(),i=n(r);M(i,()=>`Container started successfully`),g(r),f(e,r)},$$slots:{default:!0},parameters:{__svelteCsf:{rawCode:`<undefined {...args}>
  <div class="bg-(--pd-content-bg) p-8">
{@render taskToastSuccess('Container started successfully')}
</div>
</undefined>`}}});var y=t(_,2);I(y,{name:`Task: Failure`,children:(e,t)=>{var r=W(),i=n(r);N(i,()=>`Build podman-desktop/myapp`,()=>`Dockerfile parse error on line 12`),g(r),f(e,r)},$$slots:{default:!0},parameters:{__svelteCsf:{rawCode:`<undefined {...args}>
  <div class="bg-(--pd-content-bg) p-8">
{@render taskToastFailure('Build podman-desktop/myapp', 'Dockerfile parse error on line 12')}
</div>
</undefined>`}}});var b=t(y,2);I(b,{name:`Task: Canceled`,children:(e,t)=>{var r=W(),i=n(r);P(i,()=>`Pull podman-desktop/ubuntu:latest`),g(r),f(e,r)},$$slots:{default:!0},parameters:{__svelteCsf:{rawCode:`<undefined {...args}>
  <div class="bg-(--pd-content-bg) p-8">
{@render taskToastCanceled('Pull podman-desktop/ubuntu:latest')}
</div>
</undefined>`}}});var x=t(b,2);I(x,{name:`All Types`,children:(e,r)=>{var i=K(),a=n(i),o=n(a),s=t(n(o),2),c=n(s);A(c,()=>`success`,()=>`Success`,()=>`Container started successfully`);var l=t(c,2);A(l,()=>`error`,()=>`Error`,()=>`Failed to start container: permission denied`);var u=t(l,2);A(u,()=>`warning`,()=>`Warning`,()=>`Container exited with non-zero status code`);var d=t(u,2);A(d,()=>`info`,()=>`Info`,()=>`Pulling image podman-desktop/ubuntu:latest`),g(s),g(o);var p=t(o,2),m=t(n(p),2),h=n(m);j(h,()=>`Pulling image podman-desktop/ubuntu:latest`);var _=t(h,2);M(_,()=>`Container started successfully`);var v=t(_,2);N(v,()=>`Build podman-desktop/myapp`,()=>`Dockerfile parse error on line 12`);var y=t(v,2);P(y,()=>`Pull podman-desktop/ubuntu:latest`),g(m),g(p),g(a),g(i),f(e,i)},$$slots:{default:!0},parameters:{docs:{description:{story:`Combined overview`}},__svelteCsf:{rawCode:`<undefined {...args}>
  <div class="bg-(--pd-content-bg) p-8">
<div class="flex flex-col gap-8">
  <div class="flex flex-col gap-4">
    <h3 class="text-sm font-semibold text-(--pd-content-text)">Message toasts</h3>
    <div class="flex flex-wrap gap-4">
      {@render messageToast('success', 'Success', 'Container started successfully')}
      {@render messageToast('error', 'Error', 'Failed to start container: permission denied')}
      {@render messageToast('warning', 'Warning', 'Container exited with non-zero status code')}
      {@render messageToast('info', 'Info', 'Pulling image podman-desktop/ubuntu:latest')}
    </div>
  </div>
  <div class="flex flex-col gap-4">
    <h3 class="text-sm font-semibold text-(--pd-content-text)">Task toasts</h3>
    <div class="flex flex-wrap gap-4">
      {@render taskToastInProgress('Pulling image podman-desktop/ubuntu:latest')}
      {@render taskToastSuccess('Container started successfully')}
      {@render taskToastFailure('Build podman-desktop/myapp', 'Dockerfile parse error on line 12')}
      {@render taskToastCanceled('Pull podman-desktop/ubuntu:latest')}
    </div>
  </div>
</div>
</div>
</undefined>`}}}),f(e,a),p()}var A,j,M,N,P,F,I,L,R,z,B,V,H,U,oe,W,G,K,q,J,Y,X,Z,Q,$,se,ce,le,ue,de,fe,pe;function me(){return(me=e((()=>{y(),x(),_(),te(),ae(),ie(),S(),c(),C(),A=(e,r=u,c=u,d=u)=>{var p=z(),m=n(p),_=b(m,!0),v=t(m,2),y=n(v),x=n(y),S=e=>{var o=L(),c=n(o);{let e=s(()=>r()===`error`?E:T);D(c,{get icon(){return a(e)},class:`shrink-0 mt-1`})}var u=t(c,2),p=b(u,!0);g(o),i(()=>l(p,d())),f(e,o)},C=e=>{var t=R(),n=b(t,!0);i(()=>l(n,d())),f(e,t)};h(x,e=>{r()===`error`||r()===`warning`?e(S):e(C,-1)}),g(y);var w=t(y,4);g(v),g(p),i(()=>{l(_,c()),o(v,`background: var(--pd-toast-${r()??``}-bg); color: var(--pd-toast-${r()??``}-color);`),o(w,`background: var(--pd-toast-${r()??``}-bar-bg);`)}),f(e,p)},j=(e,r=u)=>{var a=B(),o=t(n(a),2),s=n(o),c=n(s),d=n(c);re(d,{size:`1.5em`}),g(c);var p=t(c,2),m=b(p,!0);g(s);var h=t(s,2);O(h,{class:`text-(--pd-modal-text) flex-none self-start`}),g(o),g(a),i(()=>l(m,r())),f(e,a)},M=(e,r=u)=>{var a=V(),o=t(n(a),2),s=n(o),c=n(s),d=n(c);D(d,{get icon(){return ne},class:`text-(--pd-state-success) fa-xl`}),g(c);var p=t(c,2),m=b(p,!0);g(s);var h=t(s,2);O(h,{class:`text-(--pd-modal-text) flex-none self-start`}),g(o),g(a),i(()=>l(m,r())),f(e,a)},N=(e,r=u,a=u)=>{var o=H(),s=t(n(o),2),c=n(s),d=n(c),p=n(d);D(p,{get icon(){return E},class:`text-(--pd-state-error) fa-xl`}),g(d);var m=t(d,2),h=n(m),_=b(h),v=t(h,2),y=b(v,!0);g(m),g(c);var x=t(c,2);O(x,{class:`text-(--pd-modal-text) flex-none self-start`}),g(s),g(o),i(()=>{l(_,`Error ${r()??``}`),l(y,a())}),f(e,o)},P=(e,r=u)=>{var a=U(),o=t(n(a),2),s=n(o),c=n(s),d=n(c);D(d,{get icon(){return T},class:`text-(--pd-state-warning) fa-xl`}),g(c);var p=t(c,2),m=b(p);g(s);var h=t(s,2);O(h,{class:`text-(--pd-modal-text) flex-none self-start`}),g(o),g(a),i(()=>l(m,`Canceled ${r()??``}`)),f(e,a)},F={title:`Toast`,tags:[`autodocs`],parameters:{docs:{description:{component:"Toast notifications appear in the bottom-right corner of the Podman Desktop window.\n\n## Message toasts\n\nTriggered by the main process via the `toast:handler` IPC event (e.g. when a container\noperation completes). Each variant maps to a distinct set of `--pd-toast-*` CSS variables\nfrom the color registry:\n\n| Variant | Background              | Text color                 | Progress bar               |\n|---------|-------------------------|----------------------------|----------------------------|\n| success | `--pd-toast-success-bg` | `--pd-toast-success-color` | `--pd-toast-success-bar-bg`|\n| error   | `--pd-toast-error-bg`   | `--pd-toast-error-color`   | `--pd-toast-error-bar-bg`  |\n| warning | `--pd-toast-warning-bg` | `--pd-toast-warning-color` | `--pd-toast-warning-bar-bg`|\n| info    | `--pd-toast-info-bg`    | `--pd-toast-info-color`    | `--pd-toast-info-bar-bg`   |\n\n## Task toasts\n\nShown by `ToastTaskNotifications` + `ToastCustomUi` when a background task is created.\nThey use `--pd-modal-bg` as the card background and `--pd-state-*` variables for\nstatus icons. Task toasts cycle through four lifecycle states:\n\n- **In progress** — spinner while the task runs\n- **Success** — green check icon on completion\n- **Failure** — red exclamation icon with an error message\n- **Canceled** — amber warning icon\n\n## Theme support\n\nUse the **Themes** toolbar to switch between `light`, `dark`, `hc-light`, and `hc-dark`\nand verify that all toast variants update correctly."}}}},{Story:I}=w(F),L=d(`<div class="flex flex-row items-start gap-1.5 -ml-0.5 px-3 pt-2 pb-2.5"><!> <span> </span></div>`),R=d(`<div class="px-3 pt-2 pb-2.5"> </div>`),z=d(`<div class="flex flex-col gap-1"><span class="text-xs font-medium text-(--pd-content-text) uppercase tracking-wide"> </span> <div class="relative flex flex-row items-center w-64 min-h-[2rem] rounded-[0.2rem] overflow-hidden text-[0.8rem] select-none shadow-md"><div class="flex-1"><!></div> <div class="w-8 self-stretch flex items-center justify-center cursor-pointer opacity-60 text-[1rem]">✕</div> <div class="absolute bottom-0.5 left-0.5 h-[3px] w-3/5 rounded-[2px]"></div></div></div>`),B=d(`<div class="flex flex-col gap-1"><span class="text-xs font-medium text-(--pd-content-text) uppercase tracking-wide">In progress</span> <div class="flex flex-row gap-2 items-start justify-between max-w-64 max-h-50 rounded border border-(--pd-content-divider) bg-(--pd-modal-bg) p-2 text-base shadow-md"><div class="flex flex-row gap-1 items-start"><div class="mr-1 text-(--pd-state-info)" role="status" aria-label="in-progress"><!></div> <span class="text-(--pd-card-text) wrap-break-word max-w-46"> </span></div> <!></div></div>`),V=d(`<div class="flex flex-col gap-1"><span class="text-xs font-medium text-(--pd-content-text) uppercase tracking-wide">Success</span> <div class="flex flex-row gap-2 items-start justify-between max-w-64 max-h-50 rounded border border-(--pd-content-divider) bg-(--pd-modal-bg) p-2 text-base shadow-md"><div class="flex flex-row gap-1 items-start"><div class="mr-1 text-(--pd-state-info)" role="status" aria-label="success"><!></div> <span class="text-(--pd-card-text) wrap-break-word max-w-46"> </span></div> <!></div></div>`),H=d(`<div class="flex flex-col gap-1"><span class="text-xs font-medium text-(--pd-content-text) uppercase tracking-wide">Failure</span> <div class="flex flex-row gap-2 items-start justify-between max-w-64 max-h-50 rounded border border-(--pd-content-divider) bg-(--pd-modal-bg) p-2 text-base shadow-md"><div class="flex flex-row gap-1 items-start"><div class="mr-1 text-(--pd-state-info)" role="status" aria-label="failure"><!></div> <div class="flex flex-col text-(--pd-card-text) wrap-break-word max-w-46"><span> </span> <p class="text-(--pd-content-text)"> </p></div></div> <!></div></div>`),U=d(`<div class="flex flex-col gap-1"><span class="text-xs font-medium text-(--pd-content-text) uppercase tracking-wide">Canceled</span> <div class="flex flex-row gap-2 items-start justify-between max-w-64 max-h-50 rounded border border-(--pd-content-divider) bg-(--pd-modal-bg) p-2 text-base shadow-md"><div class="flex flex-row gap-1 items-start"><div class="mr-1 text-(--pd-state-info)" role="status" aria-label="canceled"><!></div> <span class="text-(--pd-card-text) wrap-break-word max-w-46"> </span></div> <!></div></div>`),oe=d(`<div class="bg-(--pd-content-bg) p-8"><div class="flex flex-col gap-6"><p class="text-sm text-(--pd-content-text)">Message toasts use colored backgrounds from the <code>--pd-toast-*</code> color registry
        variables. Switch themes to verify all variants update correctly.</p> <div class="flex flex-wrap gap-6"><!> <!> <!> <!></div></div></div>`),W=d(`<div class="bg-(--pd-content-bg) p-8"><!></div>`),G=d(`<div class="bg-(--pd-content-bg) p-8"><div class="flex flex-col gap-6"><p class="text-sm text-(--pd-content-text)">Task toasts track long-running operations such as pulling images or starting providers.
        They use <code>--pd-modal-bg</code> as background and <code>--pd-state-*</code> variables
        for the status icons, independent of the message toast palette.</p> <div class="flex flex-wrap gap-6"><!> <!> <!> <!></div></div></div>`),K=d(`<div class="bg-(--pd-content-bg) p-8"><div class="flex flex-col gap-8"><div class="flex flex-col gap-4"><h3 class="text-sm font-semibold text-(--pd-content-text)">Message toasts</h3> <div class="flex flex-wrap gap-4"><!> <!> <!> <!></div></div> <div class="flex flex-col gap-4"><h3 class="text-sm font-semibold text-(--pd-content-text)">Task toasts</h3> <div class="flex flex-wrap gap-4"><!> <!> <!> <!></div></div></div></div>`),q=d(`<!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!>`,1),k.__docgen={data:[],name:`Toast.stories.svelte`},J=ee(k,F),Y=[`MessageTypes`,`MessageSuccess`,`MessageError`,`MessageWarning`,`MessageInfo`,`TaskNotifications`,`TaskInProgress`,`TaskSuccess`,`TaskFailure`,`TaskCanceled`,`AllTypes`],X={...J.MessageTypes,tags:[`svelte-csf-v5`]},Z={...J.MessageSuccess,tags:[`svelte-csf-v5`]},Q={...J.MessageError,tags:[`svelte-csf-v5`]},$={...J.MessageWarning,tags:[`svelte-csf-v5`]},se={...J.MessageInfo,tags:[`svelte-csf-v5`]},ce={...J.TaskNotifications,tags:[`svelte-csf-v5`]},le={...J.TaskInProgress,tags:[`svelte-csf-v5`]},ue={...J.TaskSuccess,tags:[`svelte-csf-v5`]},de={...J.TaskFailure,tags:[`svelte-csf-v5`]},fe={...J.TaskCanceled,tags:[`svelte-csf-v5`]},pe={...J.AllTypes,tags:[`svelte-csf-v5`]}})))()}me();export{pe as AllTypes,Q as MessageError,se as MessageInfo,Z as MessageSuccess,X as MessageTypes,$ as MessageWarning,fe as TaskCanceled,de as TaskFailure,le as TaskInProgress,ce as TaskNotifications,ue as TaskSuccess,Y as __namedExportsOrder,F as default};