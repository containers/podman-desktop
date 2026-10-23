import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{Bt as t,Cn as n,It as r,Lt as i,Nt as a,Q as o,Tt as s,U as c,bn as l,c as u,dn as d,dt as f,fn as p,gt as m,hn as h,ht as g,m as _,mt as v,nn as y,rn as b,tt as x,x as S,yt as C,zt as w}from"./iframe-C00C3mMz.js";import{a as T,i as E,n as D,r as O,t as k}from"./create-runtime-stories-Dyg0Kh4R.js";import{i as A,r as j,t as M}from"./Button-ebKip009.js";import{t as N,u as P}from"./dist-fIKTP7jx.js";function F(e,n){b(n,!1),S();var r=K(),a=i(r);R(a,{name:`Basic`,parameters:{__svelteCsf:{rawCode:`{#if args.kind === 'sizes'}
  <div class="flex flex-col gap-4">
    <div class="text-sm text-(--pd-content-text)">
      Sizes used across the app (values preserved exactly).
    </div>

    <div class="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {#each sizeVariants as variant (variant.label)}
        <div class="flex flex-col items-center gap-2 p-3">
          <div class="text-xs text-(--pd-content-text)">{variant.label}</div>

          {#if variant.size}
            <Spinner size={variant.size} />
          {:else}
            <Spinner />
          {/if}
        </div>
      {/each}
    </div>
  </div>
{:else if args.kind === 'accessibility'}
  <div class="flex flex-col gap-4">
    <div class="text-sm text-(--pd-content-text)">
      Accessibility features: ARIA attributes and color inheritance via <code>currentColor</code>.
    </div>

    <div class="grid grid-cols-2 gap-4 sm:grid-cols-3">
      {#each accessibilityVariants as variant (variant.heading)}
        <div class="flex flex-col gap-2 rounded border border-(--pd-content-divider) p-3">
          <div class="text-xs font-semibold text-(--pd-content-header)">{variant.heading}</div>

          <div class="flex items-center justify-center py-2 {variant.containerClass ?? ''}">
            {#if variant.label}
              <Spinner label={variant.label} />
            {:else}
              <Spinner />
            {/if}
          </div>

          <code class="text-[10px] text-(--pd-content-text) break-all">{variant.aria}</code>
        </div>
      {/each}
    </div>
  </div>
{:else if args.kind === 'contexts'}
  <div class="flex flex-col gap-6 text-(--pd-content-text)">
    <div class="flex flex-col gap-2">
      <div class="text-sm font-semibold text-(--pd-content-header)">Button in progress</div>
      <Button inProgress={true}>Creating</Button>
    </div>

    <div class="flex flex-col gap-2">
      <div class="text-sm font-semibold text-(--pd-content-header)">StatusIcon deleting/updating</div>

      <div class="flex flex-row items-center gap-3">
        <StatusIcon status="DELETING" />
        <StatusIcon status="UPDATING" />
      </div>
    </div>

    <div class="flex flex-col gap-2">
      <div class="text-sm font-semibold text-(--pd-content-header)">Toast in-progress state</div>

      <div class="flex flex-nowrap min-h-10 cursor-default max-h-50 max-w-[420px] flex-row gap-2 bg-(--pd-modal-bg) p-2 text-base">
        <div class="mr-1 text-(--pd-state-info)">
          <Spinner size="1.5em" />
        </div>

        <div class="text-base text-(--pd-card-text)">In progress: Pulling image</div>
      </div>
    </div>

    <div class="flex flex-col gap-2">
      <div class="text-sm font-semibold text-(--pd-content-header)">Preflight check pending</div>

      <div class="flex flex-row items-center gap-2">
        <Spinner size="1em" />
        <div>Checking prerequisites</div>
      </div>
    </div>

    <div class="flex flex-col gap-2">
      <div class="text-sm font-semibold text-(--pd-content-header)">Typeahead loading</div>

      <div class="flex flex-row items-center gap-2 bg-(--pd-input-field-bg) px-2 py-1">
        <div class="text-sm text-(--pd-input-field-placeholder-text)">Search...</div>
        <Spinner size="1em" />
      </div>
    </div>

    <div class="flex flex-col gap-2">
      <div class="text-sm font-semibold text-(--pd-content-header)">Kubernetes context checking</div>

      <div class="flex flex-row items-center gap-2">
        <Spinner size="12px" />
        <div>Checking context health</div>
      </div>
    </div>

    <div class="flex flex-col gap-2">
      <div class="text-sm font-semibold text-(--pd-content-header)">Markdown command button loading</div>

      <button class="flex flex-row items-center px-4 py-[6px] rounded-[4px] text-(--pd-button-primary-text) text-[13px] whitespace-nowrap bg-(--pd-button-primary-bg) hover:bg-(--pd-button-primary-hover-bg) no-underline">
        <div class="mr-2">
          <Spinner size="16px" />
        </div>
        Run command
      </button>
    </div>

    <div class="flex flex-col gap-2">
      <div class="text-sm font-semibold text-(--pd-content-header)">Statusbar provider tooltip (starting)</div>

      <div class="rounded-[9px] border border-(--pd-tooltip-outer-border) shadow-[0_4px_12px_var(--pd-shadow-color)] text-[12px] leading-[16px] w-fit">
        <div class="pt-[4px] pb-[5px] px-[8px] rounded-[9px] bg-(--pd-tooltip-bg) text-(--pd-tooltip-text) border border-(--pd-tooltip-inner-border) backdrop-blur-sm">
          <div class="flex flex-col">
            <div class="flex flex-row items-center h-fit">
              <Spinner size="12px" label="Connection Status Icon" class="mr-1" />
              <span class="text-(--pd-status-starting)">Starting</span>
              : Podman Machine
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="flex flex-col gap-2">
      <div class="text-sm font-semibold text-(--pd-content-header)">Statusbar provider tooltip (mixed states)</div>

      <div class="rounded-[9px] border border-(--pd-tooltip-outer-border) shadow-[0_4px_12px_var(--pd-shadow-color)] text-[12px] leading-[16px] w-fit">
        <div class="pt-[4px] pb-[5px] px-[8px] rounded-[9px] bg-(--pd-tooltip-bg) text-(--pd-tooltip-text) border border-(--pd-tooltip-inner-border) backdrop-blur-sm">
          <div class="flex flex-col">
            <div class="flex flex-row items-center h-fit">
              <Spinner size="12px" label="Connection Status Icon" class="mr-1" />
              <span class="text-(--pd-status-starting)">Starting</span>
              : Podman Machine
            </div>
            <div class="flex flex-row items-center h-fit">
              <div class="fa-regular fa-circle-check fa-w-[12px] mr-1 text-(--pd-status-running)"></div>
              <span class="text-(--pd-status-running)">Running</span>
              : Docker Desktop
            </div>
            <div class="flex flex-row items-center h-fit">
              <Spinner size="12px" label="Connection Status Icon" class="mr-1" />
              <span class="text-(--pd-status-terminated)">Stopping</span>
              : Lima VM
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
{:else}
  <Spinner {...args} />
{/if}`}}});var o=t(a,2);R(o,{name:`Sizes`,args:{kind:`sizes`},parameters:{__svelteCsf:{rawCode:`{#if args.kind === 'sizes'}
  <div class="flex flex-col gap-4">
    <div class="text-sm text-(--pd-content-text)">
      Sizes used across the app (values preserved exactly).
    </div>

    <div class="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {#each sizeVariants as variant (variant.label)}
        <div class="flex flex-col items-center gap-2 p-3">
          <div class="text-xs text-(--pd-content-text)">{variant.label}</div>

          {#if variant.size}
            <Spinner size={variant.size} />
          {:else}
            <Spinner />
          {/if}
        </div>
      {/each}
    </div>
  </div>
{:else if args.kind === 'accessibility'}
  <div class="flex flex-col gap-4">
    <div class="text-sm text-(--pd-content-text)">
      Accessibility features: ARIA attributes and color inheritance via <code>currentColor</code>.
    </div>

    <div class="grid grid-cols-2 gap-4 sm:grid-cols-3">
      {#each accessibilityVariants as variant (variant.heading)}
        <div class="flex flex-col gap-2 rounded border border-(--pd-content-divider) p-3">
          <div class="text-xs font-semibold text-(--pd-content-header)">{variant.heading}</div>

          <div class="flex items-center justify-center py-2 {variant.containerClass ?? ''}">
            {#if variant.label}
              <Spinner label={variant.label} />
            {:else}
              <Spinner />
            {/if}
          </div>

          <code class="text-[10px] text-(--pd-content-text) break-all">{variant.aria}</code>
        </div>
      {/each}
    </div>
  </div>
{:else if args.kind === 'contexts'}
  <div class="flex flex-col gap-6 text-(--pd-content-text)">
    <div class="flex flex-col gap-2">
      <div class="text-sm font-semibold text-(--pd-content-header)">Button in progress</div>
      <Button inProgress={true}>Creating</Button>
    </div>

    <div class="flex flex-col gap-2">
      <div class="text-sm font-semibold text-(--pd-content-header)">StatusIcon deleting/updating</div>

      <div class="flex flex-row items-center gap-3">
        <StatusIcon status="DELETING" />
        <StatusIcon status="UPDATING" />
      </div>
    </div>

    <div class="flex flex-col gap-2">
      <div class="text-sm font-semibold text-(--pd-content-header)">Toast in-progress state</div>

      <div class="flex flex-nowrap min-h-10 cursor-default max-h-50 max-w-[420px] flex-row gap-2 bg-(--pd-modal-bg) p-2 text-base">
        <div class="mr-1 text-(--pd-state-info)">
          <Spinner size="1.5em" />
        </div>

        <div class="text-base text-(--pd-card-text)">In progress: Pulling image</div>
      </div>
    </div>

    <div class="flex flex-col gap-2">
      <div class="text-sm font-semibold text-(--pd-content-header)">Preflight check pending</div>

      <div class="flex flex-row items-center gap-2">
        <Spinner size="1em" />
        <div>Checking prerequisites</div>
      </div>
    </div>

    <div class="flex flex-col gap-2">
      <div class="text-sm font-semibold text-(--pd-content-header)">Typeahead loading</div>

      <div class="flex flex-row items-center gap-2 bg-(--pd-input-field-bg) px-2 py-1">
        <div class="text-sm text-(--pd-input-field-placeholder-text)">Search...</div>
        <Spinner size="1em" />
      </div>
    </div>

    <div class="flex flex-col gap-2">
      <div class="text-sm font-semibold text-(--pd-content-header)">Kubernetes context checking</div>

      <div class="flex flex-row items-center gap-2">
        <Spinner size="12px" />
        <div>Checking context health</div>
      </div>
    </div>

    <div class="flex flex-col gap-2">
      <div class="text-sm font-semibold text-(--pd-content-header)">Markdown command button loading</div>

      <button class="flex flex-row items-center px-4 py-[6px] rounded-[4px] text-(--pd-button-primary-text) text-[13px] whitespace-nowrap bg-(--pd-button-primary-bg) hover:bg-(--pd-button-primary-hover-bg) no-underline">
        <div class="mr-2">
          <Spinner size="16px" />
        </div>
        Run command
      </button>
    </div>

    <div class="flex flex-col gap-2">
      <div class="text-sm font-semibold text-(--pd-content-header)">Statusbar provider tooltip (starting)</div>

      <div class="rounded-[9px] border border-(--pd-tooltip-outer-border) shadow-[0_4px_12px_var(--pd-shadow-color)] text-[12px] leading-[16px] w-fit">
        <div class="pt-[4px] pb-[5px] px-[8px] rounded-[9px] bg-(--pd-tooltip-bg) text-(--pd-tooltip-text) border border-(--pd-tooltip-inner-border) backdrop-blur-sm">
          <div class="flex flex-col">
            <div class="flex flex-row items-center h-fit">
              <Spinner size="12px" label="Connection Status Icon" class="mr-1" />
              <span class="text-(--pd-status-starting)">Starting</span>
              : Podman Machine
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="flex flex-col gap-2">
      <div class="text-sm font-semibold text-(--pd-content-header)">Statusbar provider tooltip (mixed states)</div>

      <div class="rounded-[9px] border border-(--pd-tooltip-outer-border) shadow-[0_4px_12px_var(--pd-shadow-color)] text-[12px] leading-[16px] w-fit">
        <div class="pt-[4px] pb-[5px] px-[8px] rounded-[9px] bg-(--pd-tooltip-bg) text-(--pd-tooltip-text) border border-(--pd-tooltip-inner-border) backdrop-blur-sm">
          <div class="flex flex-col">
            <div class="flex flex-row items-center h-fit">
              <Spinner size="12px" label="Connection Status Icon" class="mr-1" />
              <span class="text-(--pd-status-starting)">Starting</span>
              : Podman Machine
            </div>
            <div class="flex flex-row items-center h-fit">
              <div class="fa-regular fa-circle-check fa-w-[12px] mr-1 text-(--pd-status-running)"></div>
              <span class="text-(--pd-status-running)">Running</span>
              : Docker Desktop
            </div>
            <div class="flex flex-row items-center h-fit">
              <Spinner size="12px" label="Connection Status Icon" class="mr-1" />
              <span class="text-(--pd-status-terminated)">Stopping</span>
              : Lima VM
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
{:else}
  <Spinner {...args} />
{/if}`}}});var s=t(o,2);R(s,{name:`Accessibility`,args:{kind:`accessibility`},parameters:{__svelteCsf:{rawCode:`{#if args.kind === 'sizes'}
  <div class="flex flex-col gap-4">
    <div class="text-sm text-(--pd-content-text)">
      Sizes used across the app (values preserved exactly).
    </div>

    <div class="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {#each sizeVariants as variant (variant.label)}
        <div class="flex flex-col items-center gap-2 p-3">
          <div class="text-xs text-(--pd-content-text)">{variant.label}</div>

          {#if variant.size}
            <Spinner size={variant.size} />
          {:else}
            <Spinner />
          {/if}
        </div>
      {/each}
    </div>
  </div>
{:else if args.kind === 'accessibility'}
  <div class="flex flex-col gap-4">
    <div class="text-sm text-(--pd-content-text)">
      Accessibility features: ARIA attributes and color inheritance via <code>currentColor</code>.
    </div>

    <div class="grid grid-cols-2 gap-4 sm:grid-cols-3">
      {#each accessibilityVariants as variant (variant.heading)}
        <div class="flex flex-col gap-2 rounded border border-(--pd-content-divider) p-3">
          <div class="text-xs font-semibold text-(--pd-content-header)">{variant.heading}</div>

          <div class="flex items-center justify-center py-2 {variant.containerClass ?? ''}">
            {#if variant.label}
              <Spinner label={variant.label} />
            {:else}
              <Spinner />
            {/if}
          </div>

          <code class="text-[10px] text-(--pd-content-text) break-all">{variant.aria}</code>
        </div>
      {/each}
    </div>
  </div>
{:else if args.kind === 'contexts'}
  <div class="flex flex-col gap-6 text-(--pd-content-text)">
    <div class="flex flex-col gap-2">
      <div class="text-sm font-semibold text-(--pd-content-header)">Button in progress</div>
      <Button inProgress={true}>Creating</Button>
    </div>

    <div class="flex flex-col gap-2">
      <div class="text-sm font-semibold text-(--pd-content-header)">StatusIcon deleting/updating</div>

      <div class="flex flex-row items-center gap-3">
        <StatusIcon status="DELETING" />
        <StatusIcon status="UPDATING" />
      </div>
    </div>

    <div class="flex flex-col gap-2">
      <div class="text-sm font-semibold text-(--pd-content-header)">Toast in-progress state</div>

      <div class="flex flex-nowrap min-h-10 cursor-default max-h-50 max-w-[420px] flex-row gap-2 bg-(--pd-modal-bg) p-2 text-base">
        <div class="mr-1 text-(--pd-state-info)">
          <Spinner size="1.5em" />
        </div>

        <div class="text-base text-(--pd-card-text)">In progress: Pulling image</div>
      </div>
    </div>

    <div class="flex flex-col gap-2">
      <div class="text-sm font-semibold text-(--pd-content-header)">Preflight check pending</div>

      <div class="flex flex-row items-center gap-2">
        <Spinner size="1em" />
        <div>Checking prerequisites</div>
      </div>
    </div>

    <div class="flex flex-col gap-2">
      <div class="text-sm font-semibold text-(--pd-content-header)">Typeahead loading</div>

      <div class="flex flex-row items-center gap-2 bg-(--pd-input-field-bg) px-2 py-1">
        <div class="text-sm text-(--pd-input-field-placeholder-text)">Search...</div>
        <Spinner size="1em" />
      </div>
    </div>

    <div class="flex flex-col gap-2">
      <div class="text-sm font-semibold text-(--pd-content-header)">Kubernetes context checking</div>

      <div class="flex flex-row items-center gap-2">
        <Spinner size="12px" />
        <div>Checking context health</div>
      </div>
    </div>

    <div class="flex flex-col gap-2">
      <div class="text-sm font-semibold text-(--pd-content-header)">Markdown command button loading</div>

      <button class="flex flex-row items-center px-4 py-[6px] rounded-[4px] text-(--pd-button-primary-text) text-[13px] whitespace-nowrap bg-(--pd-button-primary-bg) hover:bg-(--pd-button-primary-hover-bg) no-underline">
        <div class="mr-2">
          <Spinner size="16px" />
        </div>
        Run command
      </button>
    </div>

    <div class="flex flex-col gap-2">
      <div class="text-sm font-semibold text-(--pd-content-header)">Statusbar provider tooltip (starting)</div>

      <div class="rounded-[9px] border border-(--pd-tooltip-outer-border) shadow-[0_4px_12px_var(--pd-shadow-color)] text-[12px] leading-[16px] w-fit">
        <div class="pt-[4px] pb-[5px] px-[8px] rounded-[9px] bg-(--pd-tooltip-bg) text-(--pd-tooltip-text) border border-(--pd-tooltip-inner-border) backdrop-blur-sm">
          <div class="flex flex-col">
            <div class="flex flex-row items-center h-fit">
              <Spinner size="12px" label="Connection Status Icon" class="mr-1" />
              <span class="text-(--pd-status-starting)">Starting</span>
              : Podman Machine
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="flex flex-col gap-2">
      <div class="text-sm font-semibold text-(--pd-content-header)">Statusbar provider tooltip (mixed states)</div>

      <div class="rounded-[9px] border border-(--pd-tooltip-outer-border) shadow-[0_4px_12px_var(--pd-shadow-color)] text-[12px] leading-[16px] w-fit">
        <div class="pt-[4px] pb-[5px] px-[8px] rounded-[9px] bg-(--pd-tooltip-bg) text-(--pd-tooltip-text) border border-(--pd-tooltip-inner-border) backdrop-blur-sm">
          <div class="flex flex-col">
            <div class="flex flex-row items-center h-fit">
              <Spinner size="12px" label="Connection Status Icon" class="mr-1" />
              <span class="text-(--pd-status-starting)">Starting</span>
              : Podman Machine
            </div>
            <div class="flex flex-row items-center h-fit">
              <div class="fa-regular fa-circle-check fa-w-[12px] mr-1 text-(--pd-status-running)"></div>
              <span class="text-(--pd-status-running)">Running</span>
              : Docker Desktop
            </div>
            <div class="flex flex-row items-center h-fit">
              <Spinner size="12px" label="Connection Status Icon" class="mr-1" />
              <span class="text-(--pd-status-terminated)">Stopping</span>
              : Lima VM
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
{:else}
  <Spinner {...args} />
{/if}`}}});var c=t(s,2);R(c,{name:`Contexts`,args:{kind:`contexts`},parameters:{__svelteCsf:{rawCode:`{#if args.kind === 'sizes'}
  <div class="flex flex-col gap-4">
    <div class="text-sm text-(--pd-content-text)">
      Sizes used across the app (values preserved exactly).
    </div>

    <div class="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {#each sizeVariants as variant (variant.label)}
        <div class="flex flex-col items-center gap-2 p-3">
          <div class="text-xs text-(--pd-content-text)">{variant.label}</div>

          {#if variant.size}
            <Spinner size={variant.size} />
          {:else}
            <Spinner />
          {/if}
        </div>
      {/each}
    </div>
  </div>
{:else if args.kind === 'accessibility'}
  <div class="flex flex-col gap-4">
    <div class="text-sm text-(--pd-content-text)">
      Accessibility features: ARIA attributes and color inheritance via <code>currentColor</code>.
    </div>

    <div class="grid grid-cols-2 gap-4 sm:grid-cols-3">
      {#each accessibilityVariants as variant (variant.heading)}
        <div class="flex flex-col gap-2 rounded border border-(--pd-content-divider) p-3">
          <div class="text-xs font-semibold text-(--pd-content-header)">{variant.heading}</div>

          <div class="flex items-center justify-center py-2 {variant.containerClass ?? ''}">
            {#if variant.label}
              <Spinner label={variant.label} />
            {:else}
              <Spinner />
            {/if}
          </div>

          <code class="text-[10px] text-(--pd-content-text) break-all">{variant.aria}</code>
        </div>
      {/each}
    </div>
  </div>
{:else if args.kind === 'contexts'}
  <div class="flex flex-col gap-6 text-(--pd-content-text)">
    <div class="flex flex-col gap-2">
      <div class="text-sm font-semibold text-(--pd-content-header)">Button in progress</div>
      <Button inProgress={true}>Creating</Button>
    </div>

    <div class="flex flex-col gap-2">
      <div class="text-sm font-semibold text-(--pd-content-header)">StatusIcon deleting/updating</div>

      <div class="flex flex-row items-center gap-3">
        <StatusIcon status="DELETING" />
        <StatusIcon status="UPDATING" />
      </div>
    </div>

    <div class="flex flex-col gap-2">
      <div class="text-sm font-semibold text-(--pd-content-header)">Toast in-progress state</div>

      <div class="flex flex-nowrap min-h-10 cursor-default max-h-50 max-w-[420px] flex-row gap-2 bg-(--pd-modal-bg) p-2 text-base">
        <div class="mr-1 text-(--pd-state-info)">
          <Spinner size="1.5em" />
        </div>

        <div class="text-base text-(--pd-card-text)">In progress: Pulling image</div>
      </div>
    </div>

    <div class="flex flex-col gap-2">
      <div class="text-sm font-semibold text-(--pd-content-header)">Preflight check pending</div>

      <div class="flex flex-row items-center gap-2">
        <Spinner size="1em" />
        <div>Checking prerequisites</div>
      </div>
    </div>

    <div class="flex flex-col gap-2">
      <div class="text-sm font-semibold text-(--pd-content-header)">Typeahead loading</div>

      <div class="flex flex-row items-center gap-2 bg-(--pd-input-field-bg) px-2 py-1">
        <div class="text-sm text-(--pd-input-field-placeholder-text)">Search...</div>
        <Spinner size="1em" />
      </div>
    </div>

    <div class="flex flex-col gap-2">
      <div class="text-sm font-semibold text-(--pd-content-header)">Kubernetes context checking</div>

      <div class="flex flex-row items-center gap-2">
        <Spinner size="12px" />
        <div>Checking context health</div>
      </div>
    </div>

    <div class="flex flex-col gap-2">
      <div class="text-sm font-semibold text-(--pd-content-header)">Markdown command button loading</div>

      <button class="flex flex-row items-center px-4 py-[6px] rounded-[4px] text-(--pd-button-primary-text) text-[13px] whitespace-nowrap bg-(--pd-button-primary-bg) hover:bg-(--pd-button-primary-hover-bg) no-underline">
        <div class="mr-2">
          <Spinner size="16px" />
        </div>
        Run command
      </button>
    </div>

    <div class="flex flex-col gap-2">
      <div class="text-sm font-semibold text-(--pd-content-header)">Statusbar provider tooltip (starting)</div>

      <div class="rounded-[9px] border border-(--pd-tooltip-outer-border) shadow-[0_4px_12px_var(--pd-shadow-color)] text-[12px] leading-[16px] w-fit">
        <div class="pt-[4px] pb-[5px] px-[8px] rounded-[9px] bg-(--pd-tooltip-bg) text-(--pd-tooltip-text) border border-(--pd-tooltip-inner-border) backdrop-blur-sm">
          <div class="flex flex-col">
            <div class="flex flex-row items-center h-fit">
              <Spinner size="12px" label="Connection Status Icon" class="mr-1" />
              <span class="text-(--pd-status-starting)">Starting</span>
              : Podman Machine
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="flex flex-col gap-2">
      <div class="text-sm font-semibold text-(--pd-content-header)">Statusbar provider tooltip (mixed states)</div>

      <div class="rounded-[9px] border border-(--pd-tooltip-outer-border) shadow-[0_4px_12px_var(--pd-shadow-color)] text-[12px] leading-[16px] w-fit">
        <div class="pt-[4px] pb-[5px] px-[8px] rounded-[9px] bg-(--pd-tooltip-bg) text-(--pd-tooltip-text) border border-(--pd-tooltip-inner-border) backdrop-blur-sm">
          <div class="flex flex-col">
            <div class="flex flex-row items-center h-fit">
              <Spinner size="12px" label="Connection Status Icon" class="mr-1" />
              <span class="text-(--pd-status-starting)">Starting</span>
              : Podman Machine
            </div>
            <div class="flex flex-row items-center h-fit">
              <div class="fa-regular fa-circle-check fa-w-[12px] mr-1 text-(--pd-status-running)"></div>
              <span class="text-(--pd-status-running)">Running</span>
              : Docker Desktop
            </div>
            <div class="flex flex-row items-center h-fit">
              <Spinner size="12px" label="Connection Status Icon" class="mr-1" />
              <span class="text-(--pd-status-terminated)">Stopping</span>
              : Lima VM
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
{:else}
  <Spinner {...args} />
{/if}`}}}),v(e,r),y()}var I,L,R,z,B,V,H,U,W,G,K,q,J,Y,X,Z,Q;function $(){return($=e((()=>{n(),T(),l(),N(),A(),E(),u(),D(),I=(e,n)=>{let l=()=>h(n?.(),[`_children`]);var u=g(),m=i(u),y=e=>{var n=H(),i=t(r(n),2);o(i,5,()=>z,e=>e.label,(e,n)=>{var i=V(),o=r(i),c=w(o,!0),l=t(o,2),u=e=>{j(e,{get size(){return s(n).size}})},d=e=>{j(e,{})};x(l,e=>{s(n).size?e(u):e(d,-1)}),p(i),a(()=>f(c,s(n).label)),v(e,i)}),p(i),p(n),v(e,n)},b=e=>{var n=W(),i=t(r(n),2);o(i,5,()=>B,e=>e.heading,(e,n)=>{var i=U(),o=r(i),l=w(o,!0),u=t(o,2),d=r(u),m=e=>{j(e,{get label(){return s(n).label}})},h=e=>{j(e,{})};x(d,e=>{s(n).label?e(m):e(h,-1)}),p(u);var g=t(u,2),_=w(g,!0);p(i),a(()=>{f(l,s(n).heading),c(u,1,`flex items-center justify-center py-2 ${s(n).containerClass??``??``}`),f(_,s(n).aria)}),v(e,i)}),p(i),p(n),v(e,n)},S=e=>{var n=G(),i=r(n),a=t(r(i),2);M(a,{inProgress:!0,children:(e,t)=>{d();var n=C(`Creating`);v(e,n)},$$slots:{default:!0}}),p(i);var o=t(i,2),s=t(r(o),2),c=r(s);P(c,{status:`DELETING`});var l=t(c,2);P(l,{status:`UPDATING`}),p(s),p(o);var u=t(o,2),f=t(r(u),2),m=r(f),h=r(m);j(h,{size:`1.5em`}),p(m),d(2),p(f),p(u);var g=t(u,2),_=t(r(g),2),y=r(_);j(y,{size:`1em`}),d(2),p(_),p(g);var b=t(g,2),x=t(r(b),2),S=t(r(x),2);j(S,{size:`1em`}),p(x),p(b);var w=t(b,2),T=t(r(w),2),E=r(T);j(E,{size:`12px`}),d(2),p(T),p(w);var D=t(w,2),O=t(r(D),2),k=r(O),A=r(k);j(A,{size:`16px`}),p(k),d(),p(O),p(D);var N=t(D,2),F=t(r(N),2),I=r(F),L=r(I),R=r(L),z=r(R);j(z,{size:`12px`,label:`Connection Status Icon`,class:`mr-1`}),d(3),p(R),p(L),p(I),p(F),p(N);var B=t(N,2),V=t(r(B),2),H=r(V),U=r(H),W=r(U),K=r(W);j(K,{size:`12px`,label:`Connection Status Icon`,class:`mr-1`}),d(3),p(W);var q=t(W,4),J=r(q);j(J,{size:`12px`,label:`Connection Status Icon`,class:`mr-1`}),d(3),p(q),p(U),p(H),p(V),p(B),p(n),v(e,n)},T=e=>{j(e,_(l))};x(m,e=>{l().kind===`sizes`?e(y):l().kind===`accessibility`?e(b,1):l().kind===`contexts`?e(S,2):e(T,-1)}),v(e,u)},L={component:j,render:I,title:`Progress/Spinner`,tags:[`autodocs`],argTypes:{size:{control:`text`,description:`CSS size value for SVG width and height`,defaultValue:`2em`},class:{control:`text`,description:`Additional CSS classes on the wrapper element`},style:{control:`text`,description:`Inline CSS styles on the wrapper element`},label:{control:`text`,description:`Accessible label for screen readers via aria-label`,defaultValue:`Loading`},kind:{table:{disable:!0}}},parameters:{docs:{description:{component:'These are the stories for the `Spinner` component.\nAn SVG-based indeterminate loading spinner for ongoing processes with unknown duration.\n\n**Accessibility**: The wrapper element uses `role="status"` with `aria-live="polite"` so screen readers\nannounce loading state changes. The SVG graphic is marked `aria-hidden="true"`. The `label` prop sets\n`aria-label` on the wrapper (default: `"Loading"`).\n\n**Color**: The spinner stroke uses `currentColor`, so it inherits the text color of its container.\n\n**Motion**: Support for `prefers-reduced-motion` is planned in\n[#15806](https://github.com/podman-desktop/podman-desktop/issues/15806).'}}}},{Story:R}=O(L),z=[{label:`Default (2em)`},{label:`2em`,size:`2em`},{label:`1em`,size:`1em`},{label:`1.4em`,size:`1.4em`},{label:`1.5em`,size:`1.5em`},{label:`12px`,size:`12px`},{label:`16px`,size:`16px`}],B=[{heading:`Default label`,aria:`role="status" aria-label="Loading" aria-live="polite"`},{heading:`Custom label: Pulling image`,label:`Pulling image`,aria:`role="status" aria-label="Pulling image" aria-live="polite"`},{heading:`Custom label: Checking prerequisites`,label:`Checking prerequisites`,aria:`role="status" aria-label="Checking prerequisites" aria-live="polite"`},{heading:`Custom label: Building container`,label:`Building container`,aria:`role="status" aria-label="Building container" aria-live="polite"`},{heading:`Color inheritance: Info`,label:`Loading info`,containerClass:`text-(--pd-state-info)`,aria:`Inherits currentColor from info context`},{heading:`Color inheritance: Warning`,label:`Loading warning`,containerClass:`text-(--pd-state-warning)`,aria:`Inherits currentColor from warning context`},{heading:`Color inheritance: Muted`,label:`Loading muted`,containerClass:`text-(--pd-content-invert-text)`,aria:`Inherits currentColor from muted context`}],V=m(`<div class="flex flex-col items-center gap-2 p-3"><div class="text-xs text-(--pd-content-text)"> </div> <!></div>`),H=m(`<div class="flex flex-col gap-4"><div class="text-sm text-(--pd-content-text)">Sizes used across the app (values preserved exactly).</div> <div class="grid grid-cols-2 gap-4 sm:grid-cols-4"></div></div>`),U=m(`<div class="flex flex-col gap-2 rounded border border-(--pd-content-divider) p-3"><div class="text-xs font-semibold text-(--pd-content-header)"> </div> <div><!></div> <code class="text-[10px] text-(--pd-content-text) break-all"> </code></div>`),W=m(`<div class="flex flex-col gap-4"><div class="text-sm text-(--pd-content-text)">Accessibility features: ARIA attributes and color inheritance via <code>currentColor</code>.</div> <div class="grid grid-cols-2 gap-4 sm:grid-cols-3"></div></div>`),G=m(`<div class="flex flex-col gap-6 text-(--pd-content-text)"><div class="flex flex-col gap-2"><div class="text-sm font-semibold text-(--pd-content-header)">Button in progress</div> <!></div> <div class="flex flex-col gap-2"><div class="text-sm font-semibold text-(--pd-content-header)">StatusIcon deleting/updating</div> <div class="flex flex-row items-center gap-3"><!> <!></div></div> <div class="flex flex-col gap-2"><div class="text-sm font-semibold text-(--pd-content-header)">Toast in-progress state</div> <div class="flex flex-nowrap min-h-10 cursor-default max-h-50 max-w-[420px] flex-row gap-2 bg-(--pd-modal-bg) p-2 text-base"><div class="mr-1 text-(--pd-state-info)"><!></div> <div class="text-base text-(--pd-card-text)">In progress: Pulling image</div></div></div> <div class="flex flex-col gap-2"><div class="text-sm font-semibold text-(--pd-content-header)">Preflight check pending</div> <div class="flex flex-row items-center gap-2"><!> <div>Checking prerequisites</div></div></div> <div class="flex flex-col gap-2"><div class="text-sm font-semibold text-(--pd-content-header)">Typeahead loading</div> <div class="flex flex-row items-center gap-2 bg-(--pd-input-field-bg) px-2 py-1"><div class="text-sm text-(--pd-input-field-placeholder-text)">Search...</div> <!></div></div> <div class="flex flex-col gap-2"><div class="text-sm font-semibold text-(--pd-content-header)">Kubernetes context checking</div> <div class="flex flex-row items-center gap-2"><!> <div>Checking context health</div></div></div> <div class="flex flex-col gap-2"><div class="text-sm font-semibold text-(--pd-content-header)">Markdown command button loading</div> <button class="flex flex-row items-center px-4 py-[6px] rounded-[4px] text-(--pd-button-primary-text) text-[13px] whitespace-nowrap bg-(--pd-button-primary-bg) hover:bg-(--pd-button-primary-hover-bg) no-underline"><div class="mr-2"><!></div> Run command</button></div> <div class="flex flex-col gap-2"><div class="text-sm font-semibold text-(--pd-content-header)">Statusbar provider tooltip (starting)</div> <div class="rounded-[9px] border border-(--pd-tooltip-outer-border) shadow-[0_4px_12px_var(--pd-shadow-color)] text-[12px] leading-[16px] w-fit"><div class="pt-[4px] pb-[5px] px-[8px] rounded-[9px] bg-(--pd-tooltip-bg) text-(--pd-tooltip-text) border border-(--pd-tooltip-inner-border) backdrop-blur-sm"><div class="flex flex-col"><div class="flex flex-row items-center h-fit"><!> <span class="text-(--pd-status-starting)">Starting</span> : Podman Machine</div></div></div></div></div> <div class="flex flex-col gap-2"><div class="text-sm font-semibold text-(--pd-content-header)">Statusbar provider tooltip (mixed states)</div> <div class="rounded-[9px] border border-(--pd-tooltip-outer-border) shadow-[0_4px_12px_var(--pd-shadow-color)] text-[12px] leading-[16px] w-fit"><div class="pt-[4px] pb-[5px] px-[8px] rounded-[9px] bg-(--pd-tooltip-bg) text-(--pd-tooltip-text) border border-(--pd-tooltip-inner-border) backdrop-blur-sm"><div class="flex flex-col"><div class="flex flex-row items-center h-fit"><!> <span class="text-(--pd-status-starting)">Starting</span> : Podman Machine</div> <div class="flex flex-row items-center h-fit"><div class="fa-regular fa-circle-check fa-w-[12px] mr-1 text-(--pd-status-running)"></div> <span class="text-(--pd-status-running)">Running</span> : Docker Desktop</div> <div class="flex flex-row items-center h-fit"><!> <span class="text-(--pd-status-terminated)">Stopping</span> : Lima VM</div></div></div></div></div></div>`),K=m(`<!> <!> <!> <!>`,1),F.__docgen={data:[],name:`Spinner.stories.svelte`},q=k(F,L),J=[`Basic`,`Sizes`,`Accessibility`,`Contexts`],Y={...q.Basic,tags:[`svelte-csf-v5`]},X={...q.Sizes,tags:[`svelte-csf-v5`]},Z={...q.Accessibility,tags:[`svelte-csf-v5`]},Q={...q.Contexts,tags:[`svelte-csf-v5`]}})))()}$();export{Z as Accessibility,Y as Basic,Q as Contexts,X as Sizes,J as __namedExportsOrder,L as default};