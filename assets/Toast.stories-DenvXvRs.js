import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{$t as t,Bt as n,Ht as r,It as i,Tt as a,Ut as o,V as s,an as c,c as l,dt as u,gt as d,mt as f,on as p,pn as m,tt as h,wn as g,x as _,xn as v,yn as y,zt as b}from"./iframe-CYu10MOy.js";import{a as x,i as S,n as C,r as w,t as ee}from"./create-runtime-stories-F6SWag8j.js";import{L as te,P as T,f as ne,g as E,t as D}from"./Icon-DgRgeRVE.js";import{r as re}from"./Button-C16GsjjT.js";import{k as O,m as ie,t as ae}from"./dist-Bn2kHNGe.js";function k(e,t){p(t,!1),_();var r=q(),i=n(r);I(i,{name:`Message Types`,children:(e,t)=>{var n=oe(),r=b(n),i=o(b(r),2),a=b(i);A(a,()=>`success`,()=>`Success`,()=>`Container started successfully`);var s=o(a,2);A(s,()=>`error`,()=>`Error`,()=>`Failed to start container: permission denied`);var c=o(s,2);A(c,()=>`warning`,()=>`Warning`,()=>`Container exited with non-zero status code`);var l=o(c,2);A(l,()=>`info`,()=>`Info`,()=>`Pulling image podman-desktop/ubuntu:latest`),m(i),m(r),m(n),f(e,n)},$$slots:{default:!0},parameters:{docs:{description:{story:`All message types in one view`}},__svelteCsf:{rawCode:`<undefined {...args}>
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
</undefined>`}}});var a=o(i,2);I(a,{name:`Message: Success`,children:(e,t)=>{var n=W(),r=b(n);A(r,()=>`success`,()=>`Success`,()=>`Container started successfully`),m(n),f(e,n)},$$slots:{default:!0},parameters:{docs:{description:{story:`Individual message type stories`}},__svelteCsf:{rawCode:`<undefined {...args}>
  <div class="bg-(--pd-content-bg) p-8">
{@render messageToast('success', 'Success', 'Container started successfully')}
</div>
</undefined>`}}});var s=o(a,2);I(s,{name:`Message: Error`,children:(e,t)=>{var n=W(),r=b(n);A(r,()=>`error`,()=>`Error`,()=>`Failed to start container: permission denied`),m(n),f(e,n)},$$slots:{default:!0},parameters:{__svelteCsf:{rawCode:`<undefined {...args}>
  <div class="bg-(--pd-content-bg) p-8">
{@render messageToast('error', 'Error', 'Failed to start container: permission denied')}
</div>
</undefined>`}}});var l=o(s,2);I(l,{name:`Message: Warning`,children:(e,t)=>{var n=W(),r=b(n);A(r,()=>`warning`,()=>`Warning`,()=>`Container exited with non-zero status code`),m(n),f(e,n)},$$slots:{default:!0},parameters:{__svelteCsf:{rawCode:`<undefined {...args}>
  <div class="bg-(--pd-content-bg) p-8">
{@render messageToast('warning', 'Warning', 'Container exited with non-zero status code')}
</div>
</undefined>`}}});var u=o(l,2);I(u,{name:`Message: Info`,children:(e,t)=>{var n=W(),r=b(n);A(r,()=>`info`,()=>`Info`,()=>`Pulling image podman-desktop/ubuntu:latest`),m(n),f(e,n)},$$slots:{default:!0},parameters:{__svelteCsf:{rawCode:`<undefined {...args}>
  <div class="bg-(--pd-content-bg) p-8">
{@render messageToast('info', 'Info', 'Pulling image podman-desktop/ubuntu:latest')}
</div>
</undefined>`}}});var d=o(u,2);I(d,{name:`Task Notifications`,children:(e,t)=>{var n=G(),r=b(n),i=o(b(r),2),a=b(i);j(a,()=>`Pulling image podman-desktop/ubuntu:latest`);var s=o(a,2);M(s,()=>`Container started successfully`);var c=o(s,2);N(c,()=>`Build podman-desktop/myapp`,()=>`Dockerfile parse error on line 12`);var l=o(c,2);P(l,()=>`Pull podman-desktop/ubuntu:latest`),m(i),m(r),m(n),f(e,n)},$$slots:{default:!0},parameters:{docs:{description:{story:`All task notification states in one view`}},__svelteCsf:{rawCode:`<undefined {...args}>
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
</undefined>`}}});var h=o(d,2);I(h,{name:`Task: In Progress`,children:(e,t)=>{var n=W(),r=b(n);j(r,()=>`Pulling image podman-desktop/ubuntu:latest`),m(n),f(e,n)},$$slots:{default:!0},parameters:{docs:{description:{story:`Individual task state stories`}},__svelteCsf:{rawCode:`<undefined {...args}>
  <div class="bg-(--pd-content-bg) p-8">
{@render taskToastInProgress('Pulling image podman-desktop/ubuntu:latest')}
</div>
</undefined>`}}});var g=o(h,2);I(g,{name:`Task: Success`,children:(e,t)=>{var n=W(),r=b(n);M(r,()=>`Container started successfully`),m(n),f(e,n)},$$slots:{default:!0},parameters:{__svelteCsf:{rawCode:`<undefined {...args}>
  <div class="bg-(--pd-content-bg) p-8">
{@render taskToastSuccess('Container started successfully')}
</div>
</undefined>`}}});var v=o(g,2);I(v,{name:`Task: Failure`,children:(e,t)=>{var n=W(),r=b(n);N(r,()=>`Build podman-desktop/myapp`,()=>`Dockerfile parse error on line 12`),m(n),f(e,n)},$$slots:{default:!0},parameters:{__svelteCsf:{rawCode:`<undefined {...args}>
  <div class="bg-(--pd-content-bg) p-8">
{@render taskToastFailure('Build podman-desktop/myapp', 'Dockerfile parse error on line 12')}
</div>
</undefined>`}}});var y=o(v,2);I(y,{name:`Task: Canceled`,children:(e,t)=>{var n=W(),r=b(n);P(r,()=>`Pull podman-desktop/ubuntu:latest`),m(n),f(e,n)},$$slots:{default:!0},parameters:{__svelteCsf:{rawCode:`<undefined {...args}>
  <div class="bg-(--pd-content-bg) p-8">
{@render taskToastCanceled('Pull podman-desktop/ubuntu:latest')}
</div>
</undefined>`}}});var x=o(y,2);I(x,{name:`All Types`,children:(e,t)=>{var n=K(),r=b(n),i=b(r),a=o(b(i),2),s=b(a);A(s,()=>`success`,()=>`Success`,()=>`Container started successfully`);var c=o(s,2);A(c,()=>`error`,()=>`Error`,()=>`Failed to start container: permission denied`);var l=o(c,2);A(l,()=>`warning`,()=>`Warning`,()=>`Container exited with non-zero status code`);var u=o(l,2);A(u,()=>`info`,()=>`Info`,()=>`Pulling image podman-desktop/ubuntu:latest`),m(a),m(i);var d=o(i,2),p=o(b(d),2),h=b(p);j(h,()=>`Pulling image podman-desktop/ubuntu:latest`);var g=o(h,2);M(g,()=>`Container started successfully`);var _=o(g,2);N(_,()=>`Build podman-desktop/myapp`,()=>`Dockerfile parse error on line 12`);var v=o(_,2);P(v,()=>`Pull podman-desktop/ubuntu:latest`),m(p),m(d),m(r),m(n),f(e,n)},$$slots:{default:!0},parameters:{docs:{description:{story:`Combined overview`}},__svelteCsf:{rawCode:`<undefined {...args}>
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
</undefined>`}}}),f(e,r),c()}var A,j,M,N,P,F,I,L,R,z,B,V,H,U,oe,W,G,K,q,J,Y,X,Z,Q,$,se,ce,le,ue,de,fe,pe;function me(){return(me=e((()=>{g(),x(),v(),te(),ae(),ie(),S(),l(),C(),A=(e,n=y,c=y,l=y)=>{var d=z(),p=b(d),g=r(p,!0),_=o(p,2),v=b(_),x=b(v),S=e=>{var s=L(),c=b(s);{let e=t(()=>n()===`error`?E:T);D(c,{get icon(){return a(e)},class:`shrink-0 mt-1`})}var d=o(c,2),p=r(d,!0);m(s),i(()=>u(p,l())),f(e,s)},C=e=>{var t=R(),n=r(t,!0);i(()=>u(n,l())),f(e,t)};h(x,e=>{n()===`error`||n()===`warning`?e(S):e(C,-1)}),m(v);var w=o(v,4);m(_),m(d),i(()=>{u(g,c()),s(_,`background: var(--pd-toast-${n()??``}-bg); color: var(--pd-toast-${n()??``}-color);`),s(w,`background: var(--pd-toast-${n()??``}-bar-bg);`)}),f(e,d)},j=(e,t=y)=>{var n=B(),a=o(b(n),2),s=b(a),c=b(s),l=b(c);re(l,{size:`1.5em`}),m(c);var d=o(c,2),p=r(d,!0);m(s);var h=o(s,2);O(h,{class:`text-(--pd-modal-text) flex-none self-start`}),m(a),m(n),i(()=>u(p,t())),f(e,n)},M=(e,t=y)=>{var n=V(),a=o(b(n),2),s=b(a),c=b(s),l=b(c);D(l,{get icon(){return ne},class:`text-(--pd-state-success) fa-xl`}),m(c);var d=o(c,2),p=r(d,!0);m(s);var h=o(s,2);O(h,{class:`text-(--pd-modal-text) flex-none self-start`}),m(a),m(n),i(()=>u(p,t())),f(e,n)},N=(e,t=y,n=y)=>{var a=H(),s=o(b(a),2),c=b(s),l=b(c),d=b(l);D(d,{get icon(){return E},class:`text-(--pd-state-error) fa-xl`}),m(l);var p=o(l,2),h=b(p),g=r(h),_=o(h,2),v=r(_,!0);m(p),m(c);var x=o(c,2);O(x,{class:`text-(--pd-modal-text) flex-none self-start`}),m(s),m(a),i(()=>{u(g,`Error ${t()??``}`),u(v,n())}),f(e,a)},P=(e,t=y)=>{var n=U(),a=o(b(n),2),s=b(a),c=b(s),l=b(c);D(l,{get icon(){return T},class:`text-(--pd-state-warning) fa-xl`}),m(c);var d=o(c,2),p=r(d);m(s);var h=o(s,2);O(h,{class:`text-(--pd-modal-text) flex-none self-start`}),m(a),m(n),i(()=>u(p,`Canceled ${t()??``}`)),f(e,n)},F={title:`Toast`,tags:[`autodocs`],parameters:{docs:{description:{component:"Toast notifications appear in the bottom-right corner of the Podman Desktop window.\n\n## Message toasts\n\nTriggered by the main process via the `toast:handler` IPC event (e.g. when a container\noperation completes). Each variant maps to a distinct set of `--pd-toast-*` CSS variables\nfrom the color registry:\n\n| Variant | Background              | Text color                 | Progress bar               |\n|---------|-------------------------|----------------------------|----------------------------|\n| success | `--pd-toast-success-bg` | `--pd-toast-success-color` | `--pd-toast-success-bar-bg`|\n| error   | `--pd-toast-error-bg`   | `--pd-toast-error-color`   | `--pd-toast-error-bar-bg`  |\n| warning | `--pd-toast-warning-bg` | `--pd-toast-warning-color` | `--pd-toast-warning-bar-bg`|\n| info    | `--pd-toast-info-bg`    | `--pd-toast-info-color`    | `--pd-toast-info-bar-bg`   |\n\n## Task toasts\n\nShown by `ToastTaskNotifications` + `ToastCustomUi` when a background task is created.\nThey use `--pd-modal-bg` as the card background and `--pd-state-*` variables for\nstatus icons. Task toasts cycle through four lifecycle states:\n\n- **In progress** — spinner while the task runs\n- **Success** — green check icon on completion\n- **Failure** — red exclamation icon with an error message\n- **Canceled** — amber warning icon\n\n## Theme support\n\nUse the **Themes** toolbar to switch between `light`, `dark`, `hc-light`, and `hc-dark`\nand verify that all toast variants update correctly."}}}},{Story:I}=w(F),L=d(`<div class="flex flex-row items-start gap-1.5 -ml-0.5 px-3 pt-2 pb-2.5"><!> <span> </span></div>`),R=d(`<div class="px-3 pt-2 pb-2.5"> </div>`),z=d(`<div class="flex flex-col gap-1"><span class="text-xs font-medium text-(--pd-content-text) uppercase tracking-wide"> </span> <div class="relative flex flex-row items-center w-64 min-h-[2rem] rounded-[0.2rem] overflow-hidden text-[0.8rem] select-none shadow-md"><div class="flex-1"><!></div> <div class="w-8 self-stretch flex items-center justify-center cursor-pointer opacity-60 text-[1rem]">✕</div> <div class="absolute bottom-0.5 left-0.5 h-[3px] w-3/5 rounded-[2px]"></div></div></div>`),B=d(`<div class="flex flex-col gap-1"><span class="text-xs font-medium text-(--pd-content-text) uppercase tracking-wide">In progress</span> <div class="flex flex-row gap-2 items-start justify-between max-w-64 max-h-50 rounded border border-(--pd-content-divider) bg-(--pd-modal-bg) p-2 text-base shadow-md"><div class="flex flex-row gap-1 items-start"><div class="mr-1 text-(--pd-state-info)" role="status" aria-label="in-progress"><!></div> <span class="text-(--pd-card-text) wrap-break-word max-w-46"> </span></div> <!></div></div>`),V=d(`<div class="flex flex-col gap-1"><span class="text-xs font-medium text-(--pd-content-text) uppercase tracking-wide">Success</span> <div class="flex flex-row gap-2 items-start justify-between max-w-64 max-h-50 rounded border border-(--pd-content-divider) bg-(--pd-modal-bg) p-2 text-base shadow-md"><div class="flex flex-row gap-1 items-start"><div class="mr-1 text-(--pd-state-info)" role="status" aria-label="success"><!></div> <span class="text-(--pd-card-text) wrap-break-word max-w-46"> </span></div> <!></div></div>`),H=d(`<div class="flex flex-col gap-1"><span class="text-xs font-medium text-(--pd-content-text) uppercase tracking-wide">Failure</span> <div class="flex flex-row gap-2 items-start justify-between max-w-64 max-h-50 rounded border border-(--pd-content-divider) bg-(--pd-modal-bg) p-2 text-base shadow-md"><div class="flex flex-row gap-1 items-start"><div class="mr-1 text-(--pd-state-info)" role="status" aria-label="failure"><!></div> <div class="flex flex-col text-(--pd-card-text) wrap-break-word max-w-46"><span> </span> <p class="text-(--pd-content-text)"> </p></div></div> <!></div></div>`),U=d(`<div class="flex flex-col gap-1"><span class="text-xs font-medium text-(--pd-content-text) uppercase tracking-wide">Canceled</span> <div class="flex flex-row gap-2 items-start justify-between max-w-64 max-h-50 rounded border border-(--pd-content-divider) bg-(--pd-modal-bg) p-2 text-base shadow-md"><div class="flex flex-row gap-1 items-start"><div class="mr-1 text-(--pd-state-info)" role="status" aria-label="canceled"><!></div> <span class="text-(--pd-card-text) wrap-break-word max-w-46"> </span></div> <!></div></div>`),oe=d(`<div class="bg-(--pd-content-bg) p-8"><div class="flex flex-col gap-6"><p class="text-sm text-(--pd-content-text)">Message toasts use colored backgrounds from the <code>--pd-toast-*</code> color registry
        variables. Switch themes to verify all variants update correctly.</p> <div class="flex flex-wrap gap-6"><!> <!> <!> <!></div></div></div>`),W=d(`<div class="bg-(--pd-content-bg) p-8"><!></div>`),G=d(`<div class="bg-(--pd-content-bg) p-8"><div class="flex flex-col gap-6"><p class="text-sm text-(--pd-content-text)">Task toasts track long-running operations such as pulling images or starting providers.
        They use <code>--pd-modal-bg</code> as background and <code>--pd-state-*</code> variables
        for the status icons, independent of the message toast palette.</p> <div class="flex flex-wrap gap-6"><!> <!> <!> <!></div></div></div>`),K=d(`<div class="bg-(--pd-content-bg) p-8"><div class="flex flex-col gap-8"><div class="flex flex-col gap-4"><h3 class="text-sm font-semibold text-(--pd-content-text)">Message toasts</h3> <div class="flex flex-wrap gap-4"><!> <!> <!> <!></div></div> <div class="flex flex-col gap-4"><h3 class="text-sm font-semibold text-(--pd-content-text)">Task toasts</h3> <div class="flex flex-wrap gap-4"><!> <!> <!> <!></div></div></div></div>`),q=d(`<!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!>`,1),k.__docgen={data:[],name:`Toast.stories.svelte`},J=ee(k,F),Y=[`MessageTypes`,`MessageSuccess`,`MessageError`,`MessageWarning`,`MessageInfo`,`TaskNotifications`,`TaskInProgress`,`TaskSuccess`,`TaskFailure`,`TaskCanceled`,`AllTypes`],X={...J.MessageTypes,tags:[`svelte-csf-v5`]},Z={...J.MessageSuccess,tags:[`svelte-csf-v5`]},Q={...J.MessageError,tags:[`svelte-csf-v5`]},$={...J.MessageWarning,tags:[`svelte-csf-v5`]},se={...J.MessageInfo,tags:[`svelte-csf-v5`]},ce={...J.TaskNotifications,tags:[`svelte-csf-v5`]},le={...J.TaskInProgress,tags:[`svelte-csf-v5`]},ue={...J.TaskSuccess,tags:[`svelte-csf-v5`]},de={...J.TaskFailure,tags:[`svelte-csf-v5`]},fe={...J.TaskCanceled,tags:[`svelte-csf-v5`]},pe={...J.AllTypes,tags:[`svelte-csf-v5`]}})))()}me();export{pe as AllTypes,Q as MessageError,se as MessageInfo,Z as MessageSuccess,X as MessageTypes,$ as MessageWarning,fe as TaskCanceled,de as TaskFailure,le as TaskInProgress,ce as TaskNotifications,ue as TaskSuccess,Y as __namedExportsOrder,F as default};