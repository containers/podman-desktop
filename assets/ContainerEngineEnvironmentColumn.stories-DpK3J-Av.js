import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{Bt as t,It as n,Lt as r,Nt as i,Q as a,Qt as o,Tt as s,U as c,Xt as l,c as u,dt as d,f,gn as p,gt as m,ht as h,ln as g,mt as _,nn as v,pn as ee,rn as y,tt as b,un as x,vn as S,x as C,xn as w,zt as T}from"./iframe-BgADC7CP.js";import{a as E,i as D,n as te,r as ne,t as re}from"./create-runtime-stories-Drs1TkxJ.js";import{r as ie}from"./ErrorMessage-BIvbt5jU.js";import{t as ae}from"./dist-De3qmBAU.js";function O(e,r){let a={podman:`bg-(--pd-provider-podman)`,docker:`bg-(--pd-provider-docker)`,kubernetes:`bg-(--pd-provider-kubernetes)`,unknown:`bg-(--pd-provider-unknown)`},l=f(r,`tip`,3,``),u=o(()=>a[r.type??`unknown`]);ie(e,{get tip(){return l()},children:(e,a)=>{var o=k(),l=n(o),f=t(l,2),p=T(f,!0);x(o),i(()=>{c(l,1,`min-h-2 min-w-2 shrink-0 rounded-full ${s(u)??``}`),d(p,r.name)}),_(e,o)},$$slots:{default:!0}})}var k;function A(){return(A=e((()=>{w(),S(),u(),ae(),k=m(`<div class="flex w-full items-center gap-x-1 rounded-md bg-[var(--pd-label-bg)] p-1 text-sm text-[var(--pd-label-text)]"><div aria-label="Provider info circle"></div> <span class="min-w-0 flex-1 overflow-x-hidden text-ellipsis whitespace-nowrap"> </span></div>`),O.__docgen={data:[{name:`type`,visibility:`public`,description:`Provider connection type driving the colored indicator.`,keywords:[],kind:`let`,type:{kind:`union`,type:[{kind:`const`,type:`string`,value:`kubernetes`,text:`"kubernetes"`},{kind:`const`,type:`string`,value:`podman`,text:`"podman"`},{kind:`const`,type:`string`,value:`docker`,text:`"docker"`}],text:`"kubernetes" | "podman" | "docker"`},static:!1,readonly:!1},{name:`name`,visibility:`public`,description:`Label text (connection type, or displayName when multiple connections share a type).`,keywords:[{name:`required`,description:``}],kind:`let`,type:{kind:`type`,type:`string`,text:`string`},static:!1,readonly:!1},{name:`tip`,visibility:`public`,description:"Tooltip content — typically `connection.endpoint.socketPath`.",keywords:[],kind:`let`,type:{kind:`type`,type:`string`,text:`string`},static:!1,readonly:!1,defaultValue:`""`}],name:`MockContainerEngineEnvironmentColumn.svelte`}})))()}function j(e,n){y(n,!1),C();var i=J(),a=r(i);P(a,{name:`Basic`,args:{type:`podman`,name:`Podman Machine Default`,tip:`/var/run/podman-machine.sock`},parameters:{__svelteCsf:{rawCode:`{#if args.kind === 'providers'}
  <div class="flex flex-col gap-4">
    <div class="text-sm text-(--pd-content-text)">
      Provider type drives the colored circle via <code>ProviderInfoCircle</code> and
      <code>providerColors</code>. Colors come from the color registry tokens below.
    </div>

    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {#each providerVariants as variant (variant.label)}
        <div class="flex flex-col gap-2 rounded border border-(--pd-content-divider) p-3">
          <div class="text-xs font-semibold text-(--pd-content-header)">{variant.label}</div>

          <div class="max-w-xs py-2">
            <MockContainerEngineEnvironmentColumn type={variant.type} name={variant.name} tip={variant.tip} />
          </div>

          <code class="text-[10px] text-(--pd-content-text) break-all">{variant.token}</code>
          {#if variant.note}
            <div class="text-[10px] text-(--pd-content-text)">{variant.note}</div>
          {/if}
        </div>
      {/each}
    </div>
  </div>
{:else if args.kind === 'displayNames'}
  <div class="flex flex-col gap-4">
    <div class="text-sm text-(--pd-content-text)">
      Display name logic from <code>ContainerEngineEnvironmentColumn</code>: when more than one
      connection shares a type, show <code>connection.displayName</code>; otherwise show
      <code>connection.type</code>. If no connection matches, fall back to
      <code>object.engineId</code>.
    </div>

    <div class="flex flex-col gap-3">
      {#each displayNameCases as variant (variant.label)}
        <div class="flex flex-col gap-2 rounded border border-(--pd-content-divider) p-3 sm:flex-row sm:items-center sm:gap-6">
          <div class="w-full max-w-xs shrink-0">
            <MockContainerEngineEnvironmentColumn type={variant.type} name={variant.name} tip={variant.tip} />
          </div>
          <div class="flex flex-col gap-1">
            <div class="text-xs font-semibold text-(--pd-content-header)">{variant.label}</div>
            <code class="text-[10px] text-(--pd-content-text)">{variant.note}</code>
          </div>
        </div>
      {/each}
    </div>
  </div>
{:else if args.kind === 'tooltips'}
  <div class="flex flex-col gap-4">
    <div class="text-sm text-(--pd-content-text)">
      Tooltip content is <code>connection?.endpoint?.socketPath</code>. Hover each label to verify
      tip behavior is preserved.
    </div>

    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div class="flex flex-col gap-2 rounded border border-(--pd-content-divider) p-3">
        <div class="text-xs font-semibold text-(--pd-content-header)">With socket path</div>
        <div class="max-w-xs py-2">
          <MockContainerEngineEnvironmentColumn
            type="podman"
            name="Podman Machine Default"
            tip="/var/run/podman-machine.sock" />
        </div>
        <code class="text-[10px] text-(--pd-content-text) break-all">tip="/var/run/podman-machine.sock"</code>
      </div>

      <div class="flex flex-col gap-2 rounded border border-(--pd-content-divider) p-3">
        <div class="text-xs font-semibold text-(--pd-content-header)">Empty tip (no tooltip)</div>
        <div class="max-w-xs py-2">
          <MockContainerEngineEnvironmentColumn type="docker" name="docker" tip="" />
        </div>
        <code class="text-[10px] text-(--pd-content-text)">tip="" — Label still renders, no tip</code>
      </div>

      <div class="flex flex-col gap-2 rounded border border-(--pd-content-divider) p-3">
        <div class="text-xs font-semibold text-(--pd-content-header)">Docker socket</div>
        <div class="max-w-xs py-2">
          <MockContainerEngineEnvironmentColumn type="docker" name="docker" tip="/var/run/docker.sock" />
        </div>
        <code class="text-[10px] text-(--pd-content-text) break-all">tip="/var/run/docker.sock"</code>
      </div>

      <div class="flex flex-col gap-2 rounded border border-(--pd-content-divider) p-3">
        <div class="text-xs font-semibold text-(--pd-content-header)">Long path truncation in label</div>
        <div class="max-w-[10rem] py-2">
          <MockContainerEngineEnvironmentColumn
            type="podman"
            name="Very Long Podman Machine Display Name"
            tip="/Users/example/.local/share/containers/podman/machine/qemu/podman.sock" />
        </div>
        <code class="text-[10px] text-(--pd-content-text)">Narrow column — label ellipsizes; tip remains full path</code>
      </div>
    </div>
  </div>
{:else if args.kind === 'tableContexts'}
  <div class="flex flex-col gap-6">
    <div class="text-sm text-(--pd-content-text)">
      The Environment column appears in five list tables. Each row below mocks a typical table
      cell layout with the Environment column on the right.
    </div>

    {#each tableContextRows as row (row.list)}
      <div class="flex flex-col gap-2">
        <div class="text-xs font-semibold uppercase tracking-wide text-(--pd-content-header)">
          {row.list} list
        </div>
        <div class="flex items-center rounded border border-(--pd-content-divider) bg-(--pd-content-card-bg)">
          <div class="w-10 px-3 py-2 flex items-center justify-center border-r border-(--pd-content-divider)">
            <input type="checkbox" class="w-3.5 h-3.5" disabled />
          </div>
          <div class="min-w-0 flex-1 px-3 py-2 border-r border-(--pd-content-divider)">
            <div class="truncate text-sm text-(--pd-content-header)">{row.resource}</div>
            <div class="text-xs text-(--pd-content-text)">{row.list.slice(0, -1)}</div>
          </div>
          <div class="w-24 px-3 py-2 border-r border-(--pd-content-divider)">
            <span class="text-xs text-(--pd-content-text)">Running</span>
          </div>
          <div class="w-48 shrink-0 px-3 py-2">
            <MockContainerEngineEnvironmentColumn type={row.type} name={row.name} tip={row.tip} />
          </div>
        </div>
      </div>
    {/each}
  </div>
{:else if args.kind === 'accessibility'}
  <div class="flex flex-col gap-6">
    <div class="text-sm text-(--pd-content-text)">
      Current accessibility surface before modernization. The circle is a plain
      <code>div</code> with <code>aria-label="Provider info circle"</code> — color is the only
      differentiator by provider type.
    </div>

    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div class="flex flex-col gap-2 rounded border border-(--pd-content-divider) p-3">
        <div class="text-xs font-semibold text-(--pd-content-header)">ARIA on circle</div>
        <div class="max-w-xs py-2">
          <MockContainerEngineEnvironmentColumn
            type="podman"
            name="Podman Machine Default"
            tip="/var/run/podman-machine.sock" />
        </div>
        <code class="text-[10px] text-(--pd-content-text)">aria-label="Provider info circle"</code>
      </div>

      <div class="flex flex-col gap-2 rounded border border-(--pd-content-divider) p-3">
        <div class="text-xs font-semibold text-(--pd-content-header)">Tooltip conveys socket path</div>
        <div class="max-w-xs py-2">
          <MockContainerEngineEnvironmentColumn type="docker" name="docker" tip="/var/run/docker.sock" />
        </div>
        <code class="text-[10px] text-(--pd-content-text)">Pointer-hover only — no focusable trigger for keyboard access</code>
      </div>

      <div class="flex flex-col gap-2 rounded border border-(--pd-content-divider) p-3">
        <div class="text-xs font-semibold text-(--pd-content-header)">High-contrast themes</div>
        <div class="flex max-w-xs flex-col gap-2 py-2">
          <MockContainerEngineEnvironmentColumn type="podman" name="podman" tip="/run/podman/podman.sock" />
          <MockContainerEngineEnvironmentColumn type="docker" name="docker" tip="/var/run/docker.sock" />
          <MockContainerEngineEnvironmentColumn name="unknown.engine" />
        </div>
        <code class="text-[10px] text-(--pd-content-text)">Switch to hc-light / hc-dark to verify tokens</code>
      </div>

      <div class="flex flex-col gap-2 rounded border border-(--pd-content-divider) p-3">
        <div class="text-xs font-semibold text-(--pd-content-header)">Known gaps (modernization)</div>
        <ul class="list-disc space-y-1 pl-5 text-[10px] text-(--pd-content-text)">
          <li>Color-only differentiation — no icon shape per provider</li>
          <li>Circle is a raw <code>div</code>, not an SVG icon</li>
          <li>Dot is 8×8px (<code>min-w-2 min-h-2</code>) — small visible size; color-only non-text contrast</li>
        </ul>
      </div>
    </div>
  </div>
{:else if args.kind === 'comparison'}
  <div class="flex flex-col gap-4">
    <div class="text-sm text-(--pd-content-text)">
      Side-by-side of the current plain-dot treatment versus the icon-based pattern used by
      modernized status indicators (reference for #18120).
    </div>

    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div class="flex flex-col gap-2 rounded border border-(--pd-content-divider) p-3">
        <div class="text-xs font-semibold text-(--pd-content-header)">Current — ProviderInfoCircle</div>
        <div class="flex items-center gap-3 py-2">
          <div aria-label="Provider info circle" class="min-h-2 min-w-2 rounded-full bg-(--pd-provider-podman)"></div>
          <div aria-label="Provider info circle" class="min-h-2 min-w-2 rounded-full bg-(--pd-provider-docker)"></div>
          <div aria-label="Provider info circle" class="min-h-2 min-w-2 rounded-full bg-(--pd-provider-kubernetes)"></div>
          <div aria-label="Provider info circle" class="min-h-2 min-w-2 rounded-full bg-(--pd-provider-unknown)"></div>
        </div>
        <code class="text-[10px] text-(--pd-content-text)">8×8px colored divs — color only</code>
      </div>

      <div class="flex flex-col gap-2 rounded border border-(--pd-content-divider) p-3">
        <div class="text-xs font-semibold text-(--pd-content-header)">Target direction — icon-based</div>
        <div class="text-sm text-(--pd-content-text) py-2">
          Match <code>StatusDot</code> / <code>StatusDotIcon</code>: SVG icons with
          <code>role="img"</code>, larger visible indicator, and shape + color differentiation.
        </div>
        <code class="text-[10px] text-(--pd-content-text)">See StatusDot stories and #14008</code>
      </div>
    </div>

    <div class="max-w-xs">
      <div class="mb-2 text-xs font-semibold text-(--pd-content-header)">Full column (current)</div>
      <MockContainerEngineEnvironmentColumn
        type="podman"
        name="Podman Machine Default"
        tip="/var/run/podman-machine.sock" />
    </div>
  </div>
{:else}
  <div class="max-w-xs">
    <MockContainerEngineEnvironmentColumn type={args.type} name={args.name ?? 'podman'} tip={args.tip ?? ''} />
  </div>
{/if}`}}});var o=t(a,2);P(o,{name:`Provider Types`,args:{kind:`providers`},parameters:{__svelteCsf:{rawCode:`{#if args.kind === 'providers'}
  <div class="flex flex-col gap-4">
    <div class="text-sm text-(--pd-content-text)">
      Provider type drives the colored circle via <code>ProviderInfoCircle</code> and
      <code>providerColors</code>. Colors come from the color registry tokens below.
    </div>

    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {#each providerVariants as variant (variant.label)}
        <div class="flex flex-col gap-2 rounded border border-(--pd-content-divider) p-3">
          <div class="text-xs font-semibold text-(--pd-content-header)">{variant.label}</div>

          <div class="max-w-xs py-2">
            <MockContainerEngineEnvironmentColumn type={variant.type} name={variant.name} tip={variant.tip} />
          </div>

          <code class="text-[10px] text-(--pd-content-text) break-all">{variant.token}</code>
          {#if variant.note}
            <div class="text-[10px] text-(--pd-content-text)">{variant.note}</div>
          {/if}
        </div>
      {/each}
    </div>
  </div>
{:else if args.kind === 'displayNames'}
  <div class="flex flex-col gap-4">
    <div class="text-sm text-(--pd-content-text)">
      Display name logic from <code>ContainerEngineEnvironmentColumn</code>: when more than one
      connection shares a type, show <code>connection.displayName</code>; otherwise show
      <code>connection.type</code>. If no connection matches, fall back to
      <code>object.engineId</code>.
    </div>

    <div class="flex flex-col gap-3">
      {#each displayNameCases as variant (variant.label)}
        <div class="flex flex-col gap-2 rounded border border-(--pd-content-divider) p-3 sm:flex-row sm:items-center sm:gap-6">
          <div class="w-full max-w-xs shrink-0">
            <MockContainerEngineEnvironmentColumn type={variant.type} name={variant.name} tip={variant.tip} />
          </div>
          <div class="flex flex-col gap-1">
            <div class="text-xs font-semibold text-(--pd-content-header)">{variant.label}</div>
            <code class="text-[10px] text-(--pd-content-text)">{variant.note}</code>
          </div>
        </div>
      {/each}
    </div>
  </div>
{:else if args.kind === 'tooltips'}
  <div class="flex flex-col gap-4">
    <div class="text-sm text-(--pd-content-text)">
      Tooltip content is <code>connection?.endpoint?.socketPath</code>. Hover each label to verify
      tip behavior is preserved.
    </div>

    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div class="flex flex-col gap-2 rounded border border-(--pd-content-divider) p-3">
        <div class="text-xs font-semibold text-(--pd-content-header)">With socket path</div>
        <div class="max-w-xs py-2">
          <MockContainerEngineEnvironmentColumn
            type="podman"
            name="Podman Machine Default"
            tip="/var/run/podman-machine.sock" />
        </div>
        <code class="text-[10px] text-(--pd-content-text) break-all">tip="/var/run/podman-machine.sock"</code>
      </div>

      <div class="flex flex-col gap-2 rounded border border-(--pd-content-divider) p-3">
        <div class="text-xs font-semibold text-(--pd-content-header)">Empty tip (no tooltip)</div>
        <div class="max-w-xs py-2">
          <MockContainerEngineEnvironmentColumn type="docker" name="docker" tip="" />
        </div>
        <code class="text-[10px] text-(--pd-content-text)">tip="" — Label still renders, no tip</code>
      </div>

      <div class="flex flex-col gap-2 rounded border border-(--pd-content-divider) p-3">
        <div class="text-xs font-semibold text-(--pd-content-header)">Docker socket</div>
        <div class="max-w-xs py-2">
          <MockContainerEngineEnvironmentColumn type="docker" name="docker" tip="/var/run/docker.sock" />
        </div>
        <code class="text-[10px] text-(--pd-content-text) break-all">tip="/var/run/docker.sock"</code>
      </div>

      <div class="flex flex-col gap-2 rounded border border-(--pd-content-divider) p-3">
        <div class="text-xs font-semibold text-(--pd-content-header)">Long path truncation in label</div>
        <div class="max-w-[10rem] py-2">
          <MockContainerEngineEnvironmentColumn
            type="podman"
            name="Very Long Podman Machine Display Name"
            tip="/Users/example/.local/share/containers/podman/machine/qemu/podman.sock" />
        </div>
        <code class="text-[10px] text-(--pd-content-text)">Narrow column — label ellipsizes; tip remains full path</code>
      </div>
    </div>
  </div>
{:else if args.kind === 'tableContexts'}
  <div class="flex flex-col gap-6">
    <div class="text-sm text-(--pd-content-text)">
      The Environment column appears in five list tables. Each row below mocks a typical table
      cell layout with the Environment column on the right.
    </div>

    {#each tableContextRows as row (row.list)}
      <div class="flex flex-col gap-2">
        <div class="text-xs font-semibold uppercase tracking-wide text-(--pd-content-header)">
          {row.list} list
        </div>
        <div class="flex items-center rounded border border-(--pd-content-divider) bg-(--pd-content-card-bg)">
          <div class="w-10 px-3 py-2 flex items-center justify-center border-r border-(--pd-content-divider)">
            <input type="checkbox" class="w-3.5 h-3.5" disabled />
          </div>
          <div class="min-w-0 flex-1 px-3 py-2 border-r border-(--pd-content-divider)">
            <div class="truncate text-sm text-(--pd-content-header)">{row.resource}</div>
            <div class="text-xs text-(--pd-content-text)">{row.list.slice(0, -1)}</div>
          </div>
          <div class="w-24 px-3 py-2 border-r border-(--pd-content-divider)">
            <span class="text-xs text-(--pd-content-text)">Running</span>
          </div>
          <div class="w-48 shrink-0 px-3 py-2">
            <MockContainerEngineEnvironmentColumn type={row.type} name={row.name} tip={row.tip} />
          </div>
        </div>
      </div>
    {/each}
  </div>
{:else if args.kind === 'accessibility'}
  <div class="flex flex-col gap-6">
    <div class="text-sm text-(--pd-content-text)">
      Current accessibility surface before modernization. The circle is a plain
      <code>div</code> with <code>aria-label="Provider info circle"</code> — color is the only
      differentiator by provider type.
    </div>

    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div class="flex flex-col gap-2 rounded border border-(--pd-content-divider) p-3">
        <div class="text-xs font-semibold text-(--pd-content-header)">ARIA on circle</div>
        <div class="max-w-xs py-2">
          <MockContainerEngineEnvironmentColumn
            type="podman"
            name="Podman Machine Default"
            tip="/var/run/podman-machine.sock" />
        </div>
        <code class="text-[10px] text-(--pd-content-text)">aria-label="Provider info circle"</code>
      </div>

      <div class="flex flex-col gap-2 rounded border border-(--pd-content-divider) p-3">
        <div class="text-xs font-semibold text-(--pd-content-header)">Tooltip conveys socket path</div>
        <div class="max-w-xs py-2">
          <MockContainerEngineEnvironmentColumn type="docker" name="docker" tip="/var/run/docker.sock" />
        </div>
        <code class="text-[10px] text-(--pd-content-text)">Pointer-hover only — no focusable trigger for keyboard access</code>
      </div>

      <div class="flex flex-col gap-2 rounded border border-(--pd-content-divider) p-3">
        <div class="text-xs font-semibold text-(--pd-content-header)">High-contrast themes</div>
        <div class="flex max-w-xs flex-col gap-2 py-2">
          <MockContainerEngineEnvironmentColumn type="podman" name="podman" tip="/run/podman/podman.sock" />
          <MockContainerEngineEnvironmentColumn type="docker" name="docker" tip="/var/run/docker.sock" />
          <MockContainerEngineEnvironmentColumn name="unknown.engine" />
        </div>
        <code class="text-[10px] text-(--pd-content-text)">Switch to hc-light / hc-dark to verify tokens</code>
      </div>

      <div class="flex flex-col gap-2 rounded border border-(--pd-content-divider) p-3">
        <div class="text-xs font-semibold text-(--pd-content-header)">Known gaps (modernization)</div>
        <ul class="list-disc space-y-1 pl-5 text-[10px] text-(--pd-content-text)">
          <li>Color-only differentiation — no icon shape per provider</li>
          <li>Circle is a raw <code>div</code>, not an SVG icon</li>
          <li>Dot is 8×8px (<code>min-w-2 min-h-2</code>) — small visible size; color-only non-text contrast</li>
        </ul>
      </div>
    </div>
  </div>
{:else if args.kind === 'comparison'}
  <div class="flex flex-col gap-4">
    <div class="text-sm text-(--pd-content-text)">
      Side-by-side of the current plain-dot treatment versus the icon-based pattern used by
      modernized status indicators (reference for #18120).
    </div>

    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div class="flex flex-col gap-2 rounded border border-(--pd-content-divider) p-3">
        <div class="text-xs font-semibold text-(--pd-content-header)">Current — ProviderInfoCircle</div>
        <div class="flex items-center gap-3 py-2">
          <div aria-label="Provider info circle" class="min-h-2 min-w-2 rounded-full bg-(--pd-provider-podman)"></div>
          <div aria-label="Provider info circle" class="min-h-2 min-w-2 rounded-full bg-(--pd-provider-docker)"></div>
          <div aria-label="Provider info circle" class="min-h-2 min-w-2 rounded-full bg-(--pd-provider-kubernetes)"></div>
          <div aria-label="Provider info circle" class="min-h-2 min-w-2 rounded-full bg-(--pd-provider-unknown)"></div>
        </div>
        <code class="text-[10px] text-(--pd-content-text)">8×8px colored divs — color only</code>
      </div>

      <div class="flex flex-col gap-2 rounded border border-(--pd-content-divider) p-3">
        <div class="text-xs font-semibold text-(--pd-content-header)">Target direction — icon-based</div>
        <div class="text-sm text-(--pd-content-text) py-2">
          Match <code>StatusDot</code> / <code>StatusDotIcon</code>: SVG icons with
          <code>role="img"</code>, larger visible indicator, and shape + color differentiation.
        </div>
        <code class="text-[10px] text-(--pd-content-text)">See StatusDot stories and #14008</code>
      </div>
    </div>

    <div class="max-w-xs">
      <div class="mb-2 text-xs font-semibold text-(--pd-content-header)">Full column (current)</div>
      <MockContainerEngineEnvironmentColumn
        type="podman"
        name="Podman Machine Default"
        tip="/var/run/podman-machine.sock" />
    </div>
  </div>
{:else}
  <div class="max-w-xs">
    <MockContainerEngineEnvironmentColumn type={args.type} name={args.name ?? 'podman'} tip={args.tip ?? ''} />
  </div>
{/if}`}}});var s=t(o,2);P(s,{name:`Display Names`,args:{kind:`displayNames`},parameters:{__svelteCsf:{rawCode:`{#if args.kind === 'providers'}
  <div class="flex flex-col gap-4">
    <div class="text-sm text-(--pd-content-text)">
      Provider type drives the colored circle via <code>ProviderInfoCircle</code> and
      <code>providerColors</code>. Colors come from the color registry tokens below.
    </div>

    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {#each providerVariants as variant (variant.label)}
        <div class="flex flex-col gap-2 rounded border border-(--pd-content-divider) p-3">
          <div class="text-xs font-semibold text-(--pd-content-header)">{variant.label}</div>

          <div class="max-w-xs py-2">
            <MockContainerEngineEnvironmentColumn type={variant.type} name={variant.name} tip={variant.tip} />
          </div>

          <code class="text-[10px] text-(--pd-content-text) break-all">{variant.token}</code>
          {#if variant.note}
            <div class="text-[10px] text-(--pd-content-text)">{variant.note}</div>
          {/if}
        </div>
      {/each}
    </div>
  </div>
{:else if args.kind === 'displayNames'}
  <div class="flex flex-col gap-4">
    <div class="text-sm text-(--pd-content-text)">
      Display name logic from <code>ContainerEngineEnvironmentColumn</code>: when more than one
      connection shares a type, show <code>connection.displayName</code>; otherwise show
      <code>connection.type</code>. If no connection matches, fall back to
      <code>object.engineId</code>.
    </div>

    <div class="flex flex-col gap-3">
      {#each displayNameCases as variant (variant.label)}
        <div class="flex flex-col gap-2 rounded border border-(--pd-content-divider) p-3 sm:flex-row sm:items-center sm:gap-6">
          <div class="w-full max-w-xs shrink-0">
            <MockContainerEngineEnvironmentColumn type={variant.type} name={variant.name} tip={variant.tip} />
          </div>
          <div class="flex flex-col gap-1">
            <div class="text-xs font-semibold text-(--pd-content-header)">{variant.label}</div>
            <code class="text-[10px] text-(--pd-content-text)">{variant.note}</code>
          </div>
        </div>
      {/each}
    </div>
  </div>
{:else if args.kind === 'tooltips'}
  <div class="flex flex-col gap-4">
    <div class="text-sm text-(--pd-content-text)">
      Tooltip content is <code>connection?.endpoint?.socketPath</code>. Hover each label to verify
      tip behavior is preserved.
    </div>

    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div class="flex flex-col gap-2 rounded border border-(--pd-content-divider) p-3">
        <div class="text-xs font-semibold text-(--pd-content-header)">With socket path</div>
        <div class="max-w-xs py-2">
          <MockContainerEngineEnvironmentColumn
            type="podman"
            name="Podman Machine Default"
            tip="/var/run/podman-machine.sock" />
        </div>
        <code class="text-[10px] text-(--pd-content-text) break-all">tip="/var/run/podman-machine.sock"</code>
      </div>

      <div class="flex flex-col gap-2 rounded border border-(--pd-content-divider) p-3">
        <div class="text-xs font-semibold text-(--pd-content-header)">Empty tip (no tooltip)</div>
        <div class="max-w-xs py-2">
          <MockContainerEngineEnvironmentColumn type="docker" name="docker" tip="" />
        </div>
        <code class="text-[10px] text-(--pd-content-text)">tip="" — Label still renders, no tip</code>
      </div>

      <div class="flex flex-col gap-2 rounded border border-(--pd-content-divider) p-3">
        <div class="text-xs font-semibold text-(--pd-content-header)">Docker socket</div>
        <div class="max-w-xs py-2">
          <MockContainerEngineEnvironmentColumn type="docker" name="docker" tip="/var/run/docker.sock" />
        </div>
        <code class="text-[10px] text-(--pd-content-text) break-all">tip="/var/run/docker.sock"</code>
      </div>

      <div class="flex flex-col gap-2 rounded border border-(--pd-content-divider) p-3">
        <div class="text-xs font-semibold text-(--pd-content-header)">Long path truncation in label</div>
        <div class="max-w-[10rem] py-2">
          <MockContainerEngineEnvironmentColumn
            type="podman"
            name="Very Long Podman Machine Display Name"
            tip="/Users/example/.local/share/containers/podman/machine/qemu/podman.sock" />
        </div>
        <code class="text-[10px] text-(--pd-content-text)">Narrow column — label ellipsizes; tip remains full path</code>
      </div>
    </div>
  </div>
{:else if args.kind === 'tableContexts'}
  <div class="flex flex-col gap-6">
    <div class="text-sm text-(--pd-content-text)">
      The Environment column appears in five list tables. Each row below mocks a typical table
      cell layout with the Environment column on the right.
    </div>

    {#each tableContextRows as row (row.list)}
      <div class="flex flex-col gap-2">
        <div class="text-xs font-semibold uppercase tracking-wide text-(--pd-content-header)">
          {row.list} list
        </div>
        <div class="flex items-center rounded border border-(--pd-content-divider) bg-(--pd-content-card-bg)">
          <div class="w-10 px-3 py-2 flex items-center justify-center border-r border-(--pd-content-divider)">
            <input type="checkbox" class="w-3.5 h-3.5" disabled />
          </div>
          <div class="min-w-0 flex-1 px-3 py-2 border-r border-(--pd-content-divider)">
            <div class="truncate text-sm text-(--pd-content-header)">{row.resource}</div>
            <div class="text-xs text-(--pd-content-text)">{row.list.slice(0, -1)}</div>
          </div>
          <div class="w-24 px-3 py-2 border-r border-(--pd-content-divider)">
            <span class="text-xs text-(--pd-content-text)">Running</span>
          </div>
          <div class="w-48 shrink-0 px-3 py-2">
            <MockContainerEngineEnvironmentColumn type={row.type} name={row.name} tip={row.tip} />
          </div>
        </div>
      </div>
    {/each}
  </div>
{:else if args.kind === 'accessibility'}
  <div class="flex flex-col gap-6">
    <div class="text-sm text-(--pd-content-text)">
      Current accessibility surface before modernization. The circle is a plain
      <code>div</code> with <code>aria-label="Provider info circle"</code> — color is the only
      differentiator by provider type.
    </div>

    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div class="flex flex-col gap-2 rounded border border-(--pd-content-divider) p-3">
        <div class="text-xs font-semibold text-(--pd-content-header)">ARIA on circle</div>
        <div class="max-w-xs py-2">
          <MockContainerEngineEnvironmentColumn
            type="podman"
            name="Podman Machine Default"
            tip="/var/run/podman-machine.sock" />
        </div>
        <code class="text-[10px] text-(--pd-content-text)">aria-label="Provider info circle"</code>
      </div>

      <div class="flex flex-col gap-2 rounded border border-(--pd-content-divider) p-3">
        <div class="text-xs font-semibold text-(--pd-content-header)">Tooltip conveys socket path</div>
        <div class="max-w-xs py-2">
          <MockContainerEngineEnvironmentColumn type="docker" name="docker" tip="/var/run/docker.sock" />
        </div>
        <code class="text-[10px] text-(--pd-content-text)">Pointer-hover only — no focusable trigger for keyboard access</code>
      </div>

      <div class="flex flex-col gap-2 rounded border border-(--pd-content-divider) p-3">
        <div class="text-xs font-semibold text-(--pd-content-header)">High-contrast themes</div>
        <div class="flex max-w-xs flex-col gap-2 py-2">
          <MockContainerEngineEnvironmentColumn type="podman" name="podman" tip="/run/podman/podman.sock" />
          <MockContainerEngineEnvironmentColumn type="docker" name="docker" tip="/var/run/docker.sock" />
          <MockContainerEngineEnvironmentColumn name="unknown.engine" />
        </div>
        <code class="text-[10px] text-(--pd-content-text)">Switch to hc-light / hc-dark to verify tokens</code>
      </div>

      <div class="flex flex-col gap-2 rounded border border-(--pd-content-divider) p-3">
        <div class="text-xs font-semibold text-(--pd-content-header)">Known gaps (modernization)</div>
        <ul class="list-disc space-y-1 pl-5 text-[10px] text-(--pd-content-text)">
          <li>Color-only differentiation — no icon shape per provider</li>
          <li>Circle is a raw <code>div</code>, not an SVG icon</li>
          <li>Dot is 8×8px (<code>min-w-2 min-h-2</code>) — small visible size; color-only non-text contrast</li>
        </ul>
      </div>
    </div>
  </div>
{:else if args.kind === 'comparison'}
  <div class="flex flex-col gap-4">
    <div class="text-sm text-(--pd-content-text)">
      Side-by-side of the current plain-dot treatment versus the icon-based pattern used by
      modernized status indicators (reference for #18120).
    </div>

    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div class="flex flex-col gap-2 rounded border border-(--pd-content-divider) p-3">
        <div class="text-xs font-semibold text-(--pd-content-header)">Current — ProviderInfoCircle</div>
        <div class="flex items-center gap-3 py-2">
          <div aria-label="Provider info circle" class="min-h-2 min-w-2 rounded-full bg-(--pd-provider-podman)"></div>
          <div aria-label="Provider info circle" class="min-h-2 min-w-2 rounded-full bg-(--pd-provider-docker)"></div>
          <div aria-label="Provider info circle" class="min-h-2 min-w-2 rounded-full bg-(--pd-provider-kubernetes)"></div>
          <div aria-label="Provider info circle" class="min-h-2 min-w-2 rounded-full bg-(--pd-provider-unknown)"></div>
        </div>
        <code class="text-[10px] text-(--pd-content-text)">8×8px colored divs — color only</code>
      </div>

      <div class="flex flex-col gap-2 rounded border border-(--pd-content-divider) p-3">
        <div class="text-xs font-semibold text-(--pd-content-header)">Target direction — icon-based</div>
        <div class="text-sm text-(--pd-content-text) py-2">
          Match <code>StatusDot</code> / <code>StatusDotIcon</code>: SVG icons with
          <code>role="img"</code>, larger visible indicator, and shape + color differentiation.
        </div>
        <code class="text-[10px] text-(--pd-content-text)">See StatusDot stories and #14008</code>
      </div>
    </div>

    <div class="max-w-xs">
      <div class="mb-2 text-xs font-semibold text-(--pd-content-header)">Full column (current)</div>
      <MockContainerEngineEnvironmentColumn
        type="podman"
        name="Podman Machine Default"
        tip="/var/run/podman-machine.sock" />
    </div>
  </div>
{:else}
  <div class="max-w-xs">
    <MockContainerEngineEnvironmentColumn type={args.type} name={args.name ?? 'podman'} tip={args.tip ?? ''} />
  </div>
{/if}`}}});var c=t(s,2);P(c,{name:`Tooltips`,args:{kind:`tooltips`},parameters:{__svelteCsf:{rawCode:`{#if args.kind === 'providers'}
  <div class="flex flex-col gap-4">
    <div class="text-sm text-(--pd-content-text)">
      Provider type drives the colored circle via <code>ProviderInfoCircle</code> and
      <code>providerColors</code>. Colors come from the color registry tokens below.
    </div>

    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {#each providerVariants as variant (variant.label)}
        <div class="flex flex-col gap-2 rounded border border-(--pd-content-divider) p-3">
          <div class="text-xs font-semibold text-(--pd-content-header)">{variant.label}</div>

          <div class="max-w-xs py-2">
            <MockContainerEngineEnvironmentColumn type={variant.type} name={variant.name} tip={variant.tip} />
          </div>

          <code class="text-[10px] text-(--pd-content-text) break-all">{variant.token}</code>
          {#if variant.note}
            <div class="text-[10px] text-(--pd-content-text)">{variant.note}</div>
          {/if}
        </div>
      {/each}
    </div>
  </div>
{:else if args.kind === 'displayNames'}
  <div class="flex flex-col gap-4">
    <div class="text-sm text-(--pd-content-text)">
      Display name logic from <code>ContainerEngineEnvironmentColumn</code>: when more than one
      connection shares a type, show <code>connection.displayName</code>; otherwise show
      <code>connection.type</code>. If no connection matches, fall back to
      <code>object.engineId</code>.
    </div>

    <div class="flex flex-col gap-3">
      {#each displayNameCases as variant (variant.label)}
        <div class="flex flex-col gap-2 rounded border border-(--pd-content-divider) p-3 sm:flex-row sm:items-center sm:gap-6">
          <div class="w-full max-w-xs shrink-0">
            <MockContainerEngineEnvironmentColumn type={variant.type} name={variant.name} tip={variant.tip} />
          </div>
          <div class="flex flex-col gap-1">
            <div class="text-xs font-semibold text-(--pd-content-header)">{variant.label}</div>
            <code class="text-[10px] text-(--pd-content-text)">{variant.note}</code>
          </div>
        </div>
      {/each}
    </div>
  </div>
{:else if args.kind === 'tooltips'}
  <div class="flex flex-col gap-4">
    <div class="text-sm text-(--pd-content-text)">
      Tooltip content is <code>connection?.endpoint?.socketPath</code>. Hover each label to verify
      tip behavior is preserved.
    </div>

    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div class="flex flex-col gap-2 rounded border border-(--pd-content-divider) p-3">
        <div class="text-xs font-semibold text-(--pd-content-header)">With socket path</div>
        <div class="max-w-xs py-2">
          <MockContainerEngineEnvironmentColumn
            type="podman"
            name="Podman Machine Default"
            tip="/var/run/podman-machine.sock" />
        </div>
        <code class="text-[10px] text-(--pd-content-text) break-all">tip="/var/run/podman-machine.sock"</code>
      </div>

      <div class="flex flex-col gap-2 rounded border border-(--pd-content-divider) p-3">
        <div class="text-xs font-semibold text-(--pd-content-header)">Empty tip (no tooltip)</div>
        <div class="max-w-xs py-2">
          <MockContainerEngineEnvironmentColumn type="docker" name="docker" tip="" />
        </div>
        <code class="text-[10px] text-(--pd-content-text)">tip="" — Label still renders, no tip</code>
      </div>

      <div class="flex flex-col gap-2 rounded border border-(--pd-content-divider) p-3">
        <div class="text-xs font-semibold text-(--pd-content-header)">Docker socket</div>
        <div class="max-w-xs py-2">
          <MockContainerEngineEnvironmentColumn type="docker" name="docker" tip="/var/run/docker.sock" />
        </div>
        <code class="text-[10px] text-(--pd-content-text) break-all">tip="/var/run/docker.sock"</code>
      </div>

      <div class="flex flex-col gap-2 rounded border border-(--pd-content-divider) p-3">
        <div class="text-xs font-semibold text-(--pd-content-header)">Long path truncation in label</div>
        <div class="max-w-[10rem] py-2">
          <MockContainerEngineEnvironmentColumn
            type="podman"
            name="Very Long Podman Machine Display Name"
            tip="/Users/example/.local/share/containers/podman/machine/qemu/podman.sock" />
        </div>
        <code class="text-[10px] text-(--pd-content-text)">Narrow column — label ellipsizes; tip remains full path</code>
      </div>
    </div>
  </div>
{:else if args.kind === 'tableContexts'}
  <div class="flex flex-col gap-6">
    <div class="text-sm text-(--pd-content-text)">
      The Environment column appears in five list tables. Each row below mocks a typical table
      cell layout with the Environment column on the right.
    </div>

    {#each tableContextRows as row (row.list)}
      <div class="flex flex-col gap-2">
        <div class="text-xs font-semibold uppercase tracking-wide text-(--pd-content-header)">
          {row.list} list
        </div>
        <div class="flex items-center rounded border border-(--pd-content-divider) bg-(--pd-content-card-bg)">
          <div class="w-10 px-3 py-2 flex items-center justify-center border-r border-(--pd-content-divider)">
            <input type="checkbox" class="w-3.5 h-3.5" disabled />
          </div>
          <div class="min-w-0 flex-1 px-3 py-2 border-r border-(--pd-content-divider)">
            <div class="truncate text-sm text-(--pd-content-header)">{row.resource}</div>
            <div class="text-xs text-(--pd-content-text)">{row.list.slice(0, -1)}</div>
          </div>
          <div class="w-24 px-3 py-2 border-r border-(--pd-content-divider)">
            <span class="text-xs text-(--pd-content-text)">Running</span>
          </div>
          <div class="w-48 shrink-0 px-3 py-2">
            <MockContainerEngineEnvironmentColumn type={row.type} name={row.name} tip={row.tip} />
          </div>
        </div>
      </div>
    {/each}
  </div>
{:else if args.kind === 'accessibility'}
  <div class="flex flex-col gap-6">
    <div class="text-sm text-(--pd-content-text)">
      Current accessibility surface before modernization. The circle is a plain
      <code>div</code> with <code>aria-label="Provider info circle"</code> — color is the only
      differentiator by provider type.
    </div>

    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div class="flex flex-col gap-2 rounded border border-(--pd-content-divider) p-3">
        <div class="text-xs font-semibold text-(--pd-content-header)">ARIA on circle</div>
        <div class="max-w-xs py-2">
          <MockContainerEngineEnvironmentColumn
            type="podman"
            name="Podman Machine Default"
            tip="/var/run/podman-machine.sock" />
        </div>
        <code class="text-[10px] text-(--pd-content-text)">aria-label="Provider info circle"</code>
      </div>

      <div class="flex flex-col gap-2 rounded border border-(--pd-content-divider) p-3">
        <div class="text-xs font-semibold text-(--pd-content-header)">Tooltip conveys socket path</div>
        <div class="max-w-xs py-2">
          <MockContainerEngineEnvironmentColumn type="docker" name="docker" tip="/var/run/docker.sock" />
        </div>
        <code class="text-[10px] text-(--pd-content-text)">Pointer-hover only — no focusable trigger for keyboard access</code>
      </div>

      <div class="flex flex-col gap-2 rounded border border-(--pd-content-divider) p-3">
        <div class="text-xs font-semibold text-(--pd-content-header)">High-contrast themes</div>
        <div class="flex max-w-xs flex-col gap-2 py-2">
          <MockContainerEngineEnvironmentColumn type="podman" name="podman" tip="/run/podman/podman.sock" />
          <MockContainerEngineEnvironmentColumn type="docker" name="docker" tip="/var/run/docker.sock" />
          <MockContainerEngineEnvironmentColumn name="unknown.engine" />
        </div>
        <code class="text-[10px] text-(--pd-content-text)">Switch to hc-light / hc-dark to verify tokens</code>
      </div>

      <div class="flex flex-col gap-2 rounded border border-(--pd-content-divider) p-3">
        <div class="text-xs font-semibold text-(--pd-content-header)">Known gaps (modernization)</div>
        <ul class="list-disc space-y-1 pl-5 text-[10px] text-(--pd-content-text)">
          <li>Color-only differentiation — no icon shape per provider</li>
          <li>Circle is a raw <code>div</code>, not an SVG icon</li>
          <li>Dot is 8×8px (<code>min-w-2 min-h-2</code>) — small visible size; color-only non-text contrast</li>
        </ul>
      </div>
    </div>
  </div>
{:else if args.kind === 'comparison'}
  <div class="flex flex-col gap-4">
    <div class="text-sm text-(--pd-content-text)">
      Side-by-side of the current plain-dot treatment versus the icon-based pattern used by
      modernized status indicators (reference for #18120).
    </div>

    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div class="flex flex-col gap-2 rounded border border-(--pd-content-divider) p-3">
        <div class="text-xs font-semibold text-(--pd-content-header)">Current — ProviderInfoCircle</div>
        <div class="flex items-center gap-3 py-2">
          <div aria-label="Provider info circle" class="min-h-2 min-w-2 rounded-full bg-(--pd-provider-podman)"></div>
          <div aria-label="Provider info circle" class="min-h-2 min-w-2 rounded-full bg-(--pd-provider-docker)"></div>
          <div aria-label="Provider info circle" class="min-h-2 min-w-2 rounded-full bg-(--pd-provider-kubernetes)"></div>
          <div aria-label="Provider info circle" class="min-h-2 min-w-2 rounded-full bg-(--pd-provider-unknown)"></div>
        </div>
        <code class="text-[10px] text-(--pd-content-text)">8×8px colored divs — color only</code>
      </div>

      <div class="flex flex-col gap-2 rounded border border-(--pd-content-divider) p-3">
        <div class="text-xs font-semibold text-(--pd-content-header)">Target direction — icon-based</div>
        <div class="text-sm text-(--pd-content-text) py-2">
          Match <code>StatusDot</code> / <code>StatusDotIcon</code>: SVG icons with
          <code>role="img"</code>, larger visible indicator, and shape + color differentiation.
        </div>
        <code class="text-[10px] text-(--pd-content-text)">See StatusDot stories and #14008</code>
      </div>
    </div>

    <div class="max-w-xs">
      <div class="mb-2 text-xs font-semibold text-(--pd-content-header)">Full column (current)</div>
      <MockContainerEngineEnvironmentColumn
        type="podman"
        name="Podman Machine Default"
        tip="/var/run/podman-machine.sock" />
    </div>
  </div>
{:else}
  <div class="max-w-xs">
    <MockContainerEngineEnvironmentColumn type={args.type} name={args.name ?? 'podman'} tip={args.tip ?? ''} />
  </div>
{/if}`}}});var l=t(c,2);P(l,{name:`Table Cell Contexts`,args:{kind:`tableContexts`},parameters:{__svelteCsf:{rawCode:`{#if args.kind === 'providers'}
  <div class="flex flex-col gap-4">
    <div class="text-sm text-(--pd-content-text)">
      Provider type drives the colored circle via <code>ProviderInfoCircle</code> and
      <code>providerColors</code>. Colors come from the color registry tokens below.
    </div>

    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {#each providerVariants as variant (variant.label)}
        <div class="flex flex-col gap-2 rounded border border-(--pd-content-divider) p-3">
          <div class="text-xs font-semibold text-(--pd-content-header)">{variant.label}</div>

          <div class="max-w-xs py-2">
            <MockContainerEngineEnvironmentColumn type={variant.type} name={variant.name} tip={variant.tip} />
          </div>

          <code class="text-[10px] text-(--pd-content-text) break-all">{variant.token}</code>
          {#if variant.note}
            <div class="text-[10px] text-(--pd-content-text)">{variant.note}</div>
          {/if}
        </div>
      {/each}
    </div>
  </div>
{:else if args.kind === 'displayNames'}
  <div class="flex flex-col gap-4">
    <div class="text-sm text-(--pd-content-text)">
      Display name logic from <code>ContainerEngineEnvironmentColumn</code>: when more than one
      connection shares a type, show <code>connection.displayName</code>; otherwise show
      <code>connection.type</code>. If no connection matches, fall back to
      <code>object.engineId</code>.
    </div>

    <div class="flex flex-col gap-3">
      {#each displayNameCases as variant (variant.label)}
        <div class="flex flex-col gap-2 rounded border border-(--pd-content-divider) p-3 sm:flex-row sm:items-center sm:gap-6">
          <div class="w-full max-w-xs shrink-0">
            <MockContainerEngineEnvironmentColumn type={variant.type} name={variant.name} tip={variant.tip} />
          </div>
          <div class="flex flex-col gap-1">
            <div class="text-xs font-semibold text-(--pd-content-header)">{variant.label}</div>
            <code class="text-[10px] text-(--pd-content-text)">{variant.note}</code>
          </div>
        </div>
      {/each}
    </div>
  </div>
{:else if args.kind === 'tooltips'}
  <div class="flex flex-col gap-4">
    <div class="text-sm text-(--pd-content-text)">
      Tooltip content is <code>connection?.endpoint?.socketPath</code>. Hover each label to verify
      tip behavior is preserved.
    </div>

    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div class="flex flex-col gap-2 rounded border border-(--pd-content-divider) p-3">
        <div class="text-xs font-semibold text-(--pd-content-header)">With socket path</div>
        <div class="max-w-xs py-2">
          <MockContainerEngineEnvironmentColumn
            type="podman"
            name="Podman Machine Default"
            tip="/var/run/podman-machine.sock" />
        </div>
        <code class="text-[10px] text-(--pd-content-text) break-all">tip="/var/run/podman-machine.sock"</code>
      </div>

      <div class="flex flex-col gap-2 rounded border border-(--pd-content-divider) p-3">
        <div class="text-xs font-semibold text-(--pd-content-header)">Empty tip (no tooltip)</div>
        <div class="max-w-xs py-2">
          <MockContainerEngineEnvironmentColumn type="docker" name="docker" tip="" />
        </div>
        <code class="text-[10px] text-(--pd-content-text)">tip="" — Label still renders, no tip</code>
      </div>

      <div class="flex flex-col gap-2 rounded border border-(--pd-content-divider) p-3">
        <div class="text-xs font-semibold text-(--pd-content-header)">Docker socket</div>
        <div class="max-w-xs py-2">
          <MockContainerEngineEnvironmentColumn type="docker" name="docker" tip="/var/run/docker.sock" />
        </div>
        <code class="text-[10px] text-(--pd-content-text) break-all">tip="/var/run/docker.sock"</code>
      </div>

      <div class="flex flex-col gap-2 rounded border border-(--pd-content-divider) p-3">
        <div class="text-xs font-semibold text-(--pd-content-header)">Long path truncation in label</div>
        <div class="max-w-[10rem] py-2">
          <MockContainerEngineEnvironmentColumn
            type="podman"
            name="Very Long Podman Machine Display Name"
            tip="/Users/example/.local/share/containers/podman/machine/qemu/podman.sock" />
        </div>
        <code class="text-[10px] text-(--pd-content-text)">Narrow column — label ellipsizes; tip remains full path</code>
      </div>
    </div>
  </div>
{:else if args.kind === 'tableContexts'}
  <div class="flex flex-col gap-6">
    <div class="text-sm text-(--pd-content-text)">
      The Environment column appears in five list tables. Each row below mocks a typical table
      cell layout with the Environment column on the right.
    </div>

    {#each tableContextRows as row (row.list)}
      <div class="flex flex-col gap-2">
        <div class="text-xs font-semibold uppercase tracking-wide text-(--pd-content-header)">
          {row.list} list
        </div>
        <div class="flex items-center rounded border border-(--pd-content-divider) bg-(--pd-content-card-bg)">
          <div class="w-10 px-3 py-2 flex items-center justify-center border-r border-(--pd-content-divider)">
            <input type="checkbox" class="w-3.5 h-3.5" disabled />
          </div>
          <div class="min-w-0 flex-1 px-3 py-2 border-r border-(--pd-content-divider)">
            <div class="truncate text-sm text-(--pd-content-header)">{row.resource}</div>
            <div class="text-xs text-(--pd-content-text)">{row.list.slice(0, -1)}</div>
          </div>
          <div class="w-24 px-3 py-2 border-r border-(--pd-content-divider)">
            <span class="text-xs text-(--pd-content-text)">Running</span>
          </div>
          <div class="w-48 shrink-0 px-3 py-2">
            <MockContainerEngineEnvironmentColumn type={row.type} name={row.name} tip={row.tip} />
          </div>
        </div>
      </div>
    {/each}
  </div>
{:else if args.kind === 'accessibility'}
  <div class="flex flex-col gap-6">
    <div class="text-sm text-(--pd-content-text)">
      Current accessibility surface before modernization. The circle is a plain
      <code>div</code> with <code>aria-label="Provider info circle"</code> — color is the only
      differentiator by provider type.
    </div>

    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div class="flex flex-col gap-2 rounded border border-(--pd-content-divider) p-3">
        <div class="text-xs font-semibold text-(--pd-content-header)">ARIA on circle</div>
        <div class="max-w-xs py-2">
          <MockContainerEngineEnvironmentColumn
            type="podman"
            name="Podman Machine Default"
            tip="/var/run/podman-machine.sock" />
        </div>
        <code class="text-[10px] text-(--pd-content-text)">aria-label="Provider info circle"</code>
      </div>

      <div class="flex flex-col gap-2 rounded border border-(--pd-content-divider) p-3">
        <div class="text-xs font-semibold text-(--pd-content-header)">Tooltip conveys socket path</div>
        <div class="max-w-xs py-2">
          <MockContainerEngineEnvironmentColumn type="docker" name="docker" tip="/var/run/docker.sock" />
        </div>
        <code class="text-[10px] text-(--pd-content-text)">Pointer-hover only — no focusable trigger for keyboard access</code>
      </div>

      <div class="flex flex-col gap-2 rounded border border-(--pd-content-divider) p-3">
        <div class="text-xs font-semibold text-(--pd-content-header)">High-contrast themes</div>
        <div class="flex max-w-xs flex-col gap-2 py-2">
          <MockContainerEngineEnvironmentColumn type="podman" name="podman" tip="/run/podman/podman.sock" />
          <MockContainerEngineEnvironmentColumn type="docker" name="docker" tip="/var/run/docker.sock" />
          <MockContainerEngineEnvironmentColumn name="unknown.engine" />
        </div>
        <code class="text-[10px] text-(--pd-content-text)">Switch to hc-light / hc-dark to verify tokens</code>
      </div>

      <div class="flex flex-col gap-2 rounded border border-(--pd-content-divider) p-3">
        <div class="text-xs font-semibold text-(--pd-content-header)">Known gaps (modernization)</div>
        <ul class="list-disc space-y-1 pl-5 text-[10px] text-(--pd-content-text)">
          <li>Color-only differentiation — no icon shape per provider</li>
          <li>Circle is a raw <code>div</code>, not an SVG icon</li>
          <li>Dot is 8×8px (<code>min-w-2 min-h-2</code>) — small visible size; color-only non-text contrast</li>
        </ul>
      </div>
    </div>
  </div>
{:else if args.kind === 'comparison'}
  <div class="flex flex-col gap-4">
    <div class="text-sm text-(--pd-content-text)">
      Side-by-side of the current plain-dot treatment versus the icon-based pattern used by
      modernized status indicators (reference for #18120).
    </div>

    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div class="flex flex-col gap-2 rounded border border-(--pd-content-divider) p-3">
        <div class="text-xs font-semibold text-(--pd-content-header)">Current — ProviderInfoCircle</div>
        <div class="flex items-center gap-3 py-2">
          <div aria-label="Provider info circle" class="min-h-2 min-w-2 rounded-full bg-(--pd-provider-podman)"></div>
          <div aria-label="Provider info circle" class="min-h-2 min-w-2 rounded-full bg-(--pd-provider-docker)"></div>
          <div aria-label="Provider info circle" class="min-h-2 min-w-2 rounded-full bg-(--pd-provider-kubernetes)"></div>
          <div aria-label="Provider info circle" class="min-h-2 min-w-2 rounded-full bg-(--pd-provider-unknown)"></div>
        </div>
        <code class="text-[10px] text-(--pd-content-text)">8×8px colored divs — color only</code>
      </div>

      <div class="flex flex-col gap-2 rounded border border-(--pd-content-divider) p-3">
        <div class="text-xs font-semibold text-(--pd-content-header)">Target direction — icon-based</div>
        <div class="text-sm text-(--pd-content-text) py-2">
          Match <code>StatusDot</code> / <code>StatusDotIcon</code>: SVG icons with
          <code>role="img"</code>, larger visible indicator, and shape + color differentiation.
        </div>
        <code class="text-[10px] text-(--pd-content-text)">See StatusDot stories and #14008</code>
      </div>
    </div>

    <div class="max-w-xs">
      <div class="mb-2 text-xs font-semibold text-(--pd-content-header)">Full column (current)</div>
      <MockContainerEngineEnvironmentColumn
        type="podman"
        name="Podman Machine Default"
        tip="/var/run/podman-machine.sock" />
    </div>
  </div>
{:else}
  <div class="max-w-xs">
    <MockContainerEngineEnvironmentColumn type={args.type} name={args.name ?? 'podman'} tip={args.tip ?? ''} />
  </div>
{/if}`}}});var u=t(l,2);P(u,{name:`Accessibility`,args:{kind:`accessibility`},parameters:{__svelteCsf:{rawCode:`{#if args.kind === 'providers'}
  <div class="flex flex-col gap-4">
    <div class="text-sm text-(--pd-content-text)">
      Provider type drives the colored circle via <code>ProviderInfoCircle</code> and
      <code>providerColors</code>. Colors come from the color registry tokens below.
    </div>

    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {#each providerVariants as variant (variant.label)}
        <div class="flex flex-col gap-2 rounded border border-(--pd-content-divider) p-3">
          <div class="text-xs font-semibold text-(--pd-content-header)">{variant.label}</div>

          <div class="max-w-xs py-2">
            <MockContainerEngineEnvironmentColumn type={variant.type} name={variant.name} tip={variant.tip} />
          </div>

          <code class="text-[10px] text-(--pd-content-text) break-all">{variant.token}</code>
          {#if variant.note}
            <div class="text-[10px] text-(--pd-content-text)">{variant.note}</div>
          {/if}
        </div>
      {/each}
    </div>
  </div>
{:else if args.kind === 'displayNames'}
  <div class="flex flex-col gap-4">
    <div class="text-sm text-(--pd-content-text)">
      Display name logic from <code>ContainerEngineEnvironmentColumn</code>: when more than one
      connection shares a type, show <code>connection.displayName</code>; otherwise show
      <code>connection.type</code>. If no connection matches, fall back to
      <code>object.engineId</code>.
    </div>

    <div class="flex flex-col gap-3">
      {#each displayNameCases as variant (variant.label)}
        <div class="flex flex-col gap-2 rounded border border-(--pd-content-divider) p-3 sm:flex-row sm:items-center sm:gap-6">
          <div class="w-full max-w-xs shrink-0">
            <MockContainerEngineEnvironmentColumn type={variant.type} name={variant.name} tip={variant.tip} />
          </div>
          <div class="flex flex-col gap-1">
            <div class="text-xs font-semibold text-(--pd-content-header)">{variant.label}</div>
            <code class="text-[10px] text-(--pd-content-text)">{variant.note}</code>
          </div>
        </div>
      {/each}
    </div>
  </div>
{:else if args.kind === 'tooltips'}
  <div class="flex flex-col gap-4">
    <div class="text-sm text-(--pd-content-text)">
      Tooltip content is <code>connection?.endpoint?.socketPath</code>. Hover each label to verify
      tip behavior is preserved.
    </div>

    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div class="flex flex-col gap-2 rounded border border-(--pd-content-divider) p-3">
        <div class="text-xs font-semibold text-(--pd-content-header)">With socket path</div>
        <div class="max-w-xs py-2">
          <MockContainerEngineEnvironmentColumn
            type="podman"
            name="Podman Machine Default"
            tip="/var/run/podman-machine.sock" />
        </div>
        <code class="text-[10px] text-(--pd-content-text) break-all">tip="/var/run/podman-machine.sock"</code>
      </div>

      <div class="flex flex-col gap-2 rounded border border-(--pd-content-divider) p-3">
        <div class="text-xs font-semibold text-(--pd-content-header)">Empty tip (no tooltip)</div>
        <div class="max-w-xs py-2">
          <MockContainerEngineEnvironmentColumn type="docker" name="docker" tip="" />
        </div>
        <code class="text-[10px] text-(--pd-content-text)">tip="" — Label still renders, no tip</code>
      </div>

      <div class="flex flex-col gap-2 rounded border border-(--pd-content-divider) p-3">
        <div class="text-xs font-semibold text-(--pd-content-header)">Docker socket</div>
        <div class="max-w-xs py-2">
          <MockContainerEngineEnvironmentColumn type="docker" name="docker" tip="/var/run/docker.sock" />
        </div>
        <code class="text-[10px] text-(--pd-content-text) break-all">tip="/var/run/docker.sock"</code>
      </div>

      <div class="flex flex-col gap-2 rounded border border-(--pd-content-divider) p-3">
        <div class="text-xs font-semibold text-(--pd-content-header)">Long path truncation in label</div>
        <div class="max-w-[10rem] py-2">
          <MockContainerEngineEnvironmentColumn
            type="podman"
            name="Very Long Podman Machine Display Name"
            tip="/Users/example/.local/share/containers/podman/machine/qemu/podman.sock" />
        </div>
        <code class="text-[10px] text-(--pd-content-text)">Narrow column — label ellipsizes; tip remains full path</code>
      </div>
    </div>
  </div>
{:else if args.kind === 'tableContexts'}
  <div class="flex flex-col gap-6">
    <div class="text-sm text-(--pd-content-text)">
      The Environment column appears in five list tables. Each row below mocks a typical table
      cell layout with the Environment column on the right.
    </div>

    {#each tableContextRows as row (row.list)}
      <div class="flex flex-col gap-2">
        <div class="text-xs font-semibold uppercase tracking-wide text-(--pd-content-header)">
          {row.list} list
        </div>
        <div class="flex items-center rounded border border-(--pd-content-divider) bg-(--pd-content-card-bg)">
          <div class="w-10 px-3 py-2 flex items-center justify-center border-r border-(--pd-content-divider)">
            <input type="checkbox" class="w-3.5 h-3.5" disabled />
          </div>
          <div class="min-w-0 flex-1 px-3 py-2 border-r border-(--pd-content-divider)">
            <div class="truncate text-sm text-(--pd-content-header)">{row.resource}</div>
            <div class="text-xs text-(--pd-content-text)">{row.list.slice(0, -1)}</div>
          </div>
          <div class="w-24 px-3 py-2 border-r border-(--pd-content-divider)">
            <span class="text-xs text-(--pd-content-text)">Running</span>
          </div>
          <div class="w-48 shrink-0 px-3 py-2">
            <MockContainerEngineEnvironmentColumn type={row.type} name={row.name} tip={row.tip} />
          </div>
        </div>
      </div>
    {/each}
  </div>
{:else if args.kind === 'accessibility'}
  <div class="flex flex-col gap-6">
    <div class="text-sm text-(--pd-content-text)">
      Current accessibility surface before modernization. The circle is a plain
      <code>div</code> with <code>aria-label="Provider info circle"</code> — color is the only
      differentiator by provider type.
    </div>

    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div class="flex flex-col gap-2 rounded border border-(--pd-content-divider) p-3">
        <div class="text-xs font-semibold text-(--pd-content-header)">ARIA on circle</div>
        <div class="max-w-xs py-2">
          <MockContainerEngineEnvironmentColumn
            type="podman"
            name="Podman Machine Default"
            tip="/var/run/podman-machine.sock" />
        </div>
        <code class="text-[10px] text-(--pd-content-text)">aria-label="Provider info circle"</code>
      </div>

      <div class="flex flex-col gap-2 rounded border border-(--pd-content-divider) p-3">
        <div class="text-xs font-semibold text-(--pd-content-header)">Tooltip conveys socket path</div>
        <div class="max-w-xs py-2">
          <MockContainerEngineEnvironmentColumn type="docker" name="docker" tip="/var/run/docker.sock" />
        </div>
        <code class="text-[10px] text-(--pd-content-text)">Pointer-hover only — no focusable trigger for keyboard access</code>
      </div>

      <div class="flex flex-col gap-2 rounded border border-(--pd-content-divider) p-3">
        <div class="text-xs font-semibold text-(--pd-content-header)">High-contrast themes</div>
        <div class="flex max-w-xs flex-col gap-2 py-2">
          <MockContainerEngineEnvironmentColumn type="podman" name="podman" tip="/run/podman/podman.sock" />
          <MockContainerEngineEnvironmentColumn type="docker" name="docker" tip="/var/run/docker.sock" />
          <MockContainerEngineEnvironmentColumn name="unknown.engine" />
        </div>
        <code class="text-[10px] text-(--pd-content-text)">Switch to hc-light / hc-dark to verify tokens</code>
      </div>

      <div class="flex flex-col gap-2 rounded border border-(--pd-content-divider) p-3">
        <div class="text-xs font-semibold text-(--pd-content-header)">Known gaps (modernization)</div>
        <ul class="list-disc space-y-1 pl-5 text-[10px] text-(--pd-content-text)">
          <li>Color-only differentiation — no icon shape per provider</li>
          <li>Circle is a raw <code>div</code>, not an SVG icon</li>
          <li>Dot is 8×8px (<code>min-w-2 min-h-2</code>) — small visible size; color-only non-text contrast</li>
        </ul>
      </div>
    </div>
  </div>
{:else if args.kind === 'comparison'}
  <div class="flex flex-col gap-4">
    <div class="text-sm text-(--pd-content-text)">
      Side-by-side of the current plain-dot treatment versus the icon-based pattern used by
      modernized status indicators (reference for #18120).
    </div>

    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div class="flex flex-col gap-2 rounded border border-(--pd-content-divider) p-3">
        <div class="text-xs font-semibold text-(--pd-content-header)">Current — ProviderInfoCircle</div>
        <div class="flex items-center gap-3 py-2">
          <div aria-label="Provider info circle" class="min-h-2 min-w-2 rounded-full bg-(--pd-provider-podman)"></div>
          <div aria-label="Provider info circle" class="min-h-2 min-w-2 rounded-full bg-(--pd-provider-docker)"></div>
          <div aria-label="Provider info circle" class="min-h-2 min-w-2 rounded-full bg-(--pd-provider-kubernetes)"></div>
          <div aria-label="Provider info circle" class="min-h-2 min-w-2 rounded-full bg-(--pd-provider-unknown)"></div>
        </div>
        <code class="text-[10px] text-(--pd-content-text)">8×8px colored divs — color only</code>
      </div>

      <div class="flex flex-col gap-2 rounded border border-(--pd-content-divider) p-3">
        <div class="text-xs font-semibold text-(--pd-content-header)">Target direction — icon-based</div>
        <div class="text-sm text-(--pd-content-text) py-2">
          Match <code>StatusDot</code> / <code>StatusDotIcon</code>: SVG icons with
          <code>role="img"</code>, larger visible indicator, and shape + color differentiation.
        </div>
        <code class="text-[10px] text-(--pd-content-text)">See StatusDot stories and #14008</code>
      </div>
    </div>

    <div class="max-w-xs">
      <div class="mb-2 text-xs font-semibold text-(--pd-content-header)">Full column (current)</div>
      <MockContainerEngineEnvironmentColumn
        type="podman"
        name="Podman Machine Default"
        tip="/var/run/podman-machine.sock" />
    </div>
  </div>
{:else}
  <div class="max-w-xs">
    <MockContainerEngineEnvironmentColumn type={args.type} name={args.name ?? 'podman'} tip={args.tip ?? ''} />
  </div>
{/if}`}}});var d=t(u,2);P(d,{name:`Comparison`,args:{kind:`comparison`},parameters:{__svelteCsf:{rawCode:`{#if args.kind === 'providers'}
  <div class="flex flex-col gap-4">
    <div class="text-sm text-(--pd-content-text)">
      Provider type drives the colored circle via <code>ProviderInfoCircle</code> and
      <code>providerColors</code>. Colors come from the color registry tokens below.
    </div>

    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {#each providerVariants as variant (variant.label)}
        <div class="flex flex-col gap-2 rounded border border-(--pd-content-divider) p-3">
          <div class="text-xs font-semibold text-(--pd-content-header)">{variant.label}</div>

          <div class="max-w-xs py-2">
            <MockContainerEngineEnvironmentColumn type={variant.type} name={variant.name} tip={variant.tip} />
          </div>

          <code class="text-[10px] text-(--pd-content-text) break-all">{variant.token}</code>
          {#if variant.note}
            <div class="text-[10px] text-(--pd-content-text)">{variant.note}</div>
          {/if}
        </div>
      {/each}
    </div>
  </div>
{:else if args.kind === 'displayNames'}
  <div class="flex flex-col gap-4">
    <div class="text-sm text-(--pd-content-text)">
      Display name logic from <code>ContainerEngineEnvironmentColumn</code>: when more than one
      connection shares a type, show <code>connection.displayName</code>; otherwise show
      <code>connection.type</code>. If no connection matches, fall back to
      <code>object.engineId</code>.
    </div>

    <div class="flex flex-col gap-3">
      {#each displayNameCases as variant (variant.label)}
        <div class="flex flex-col gap-2 rounded border border-(--pd-content-divider) p-3 sm:flex-row sm:items-center sm:gap-6">
          <div class="w-full max-w-xs shrink-0">
            <MockContainerEngineEnvironmentColumn type={variant.type} name={variant.name} tip={variant.tip} />
          </div>
          <div class="flex flex-col gap-1">
            <div class="text-xs font-semibold text-(--pd-content-header)">{variant.label}</div>
            <code class="text-[10px] text-(--pd-content-text)">{variant.note}</code>
          </div>
        </div>
      {/each}
    </div>
  </div>
{:else if args.kind === 'tooltips'}
  <div class="flex flex-col gap-4">
    <div class="text-sm text-(--pd-content-text)">
      Tooltip content is <code>connection?.endpoint?.socketPath</code>. Hover each label to verify
      tip behavior is preserved.
    </div>

    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div class="flex flex-col gap-2 rounded border border-(--pd-content-divider) p-3">
        <div class="text-xs font-semibold text-(--pd-content-header)">With socket path</div>
        <div class="max-w-xs py-2">
          <MockContainerEngineEnvironmentColumn
            type="podman"
            name="Podman Machine Default"
            tip="/var/run/podman-machine.sock" />
        </div>
        <code class="text-[10px] text-(--pd-content-text) break-all">tip="/var/run/podman-machine.sock"</code>
      </div>

      <div class="flex flex-col gap-2 rounded border border-(--pd-content-divider) p-3">
        <div class="text-xs font-semibold text-(--pd-content-header)">Empty tip (no tooltip)</div>
        <div class="max-w-xs py-2">
          <MockContainerEngineEnvironmentColumn type="docker" name="docker" tip="" />
        </div>
        <code class="text-[10px] text-(--pd-content-text)">tip="" — Label still renders, no tip</code>
      </div>

      <div class="flex flex-col gap-2 rounded border border-(--pd-content-divider) p-3">
        <div class="text-xs font-semibold text-(--pd-content-header)">Docker socket</div>
        <div class="max-w-xs py-2">
          <MockContainerEngineEnvironmentColumn type="docker" name="docker" tip="/var/run/docker.sock" />
        </div>
        <code class="text-[10px] text-(--pd-content-text) break-all">tip="/var/run/docker.sock"</code>
      </div>

      <div class="flex flex-col gap-2 rounded border border-(--pd-content-divider) p-3">
        <div class="text-xs font-semibold text-(--pd-content-header)">Long path truncation in label</div>
        <div class="max-w-[10rem] py-2">
          <MockContainerEngineEnvironmentColumn
            type="podman"
            name="Very Long Podman Machine Display Name"
            tip="/Users/example/.local/share/containers/podman/machine/qemu/podman.sock" />
        </div>
        <code class="text-[10px] text-(--pd-content-text)">Narrow column — label ellipsizes; tip remains full path</code>
      </div>
    </div>
  </div>
{:else if args.kind === 'tableContexts'}
  <div class="flex flex-col gap-6">
    <div class="text-sm text-(--pd-content-text)">
      The Environment column appears in five list tables. Each row below mocks a typical table
      cell layout with the Environment column on the right.
    </div>

    {#each tableContextRows as row (row.list)}
      <div class="flex flex-col gap-2">
        <div class="text-xs font-semibold uppercase tracking-wide text-(--pd-content-header)">
          {row.list} list
        </div>
        <div class="flex items-center rounded border border-(--pd-content-divider) bg-(--pd-content-card-bg)">
          <div class="w-10 px-3 py-2 flex items-center justify-center border-r border-(--pd-content-divider)">
            <input type="checkbox" class="w-3.5 h-3.5" disabled />
          </div>
          <div class="min-w-0 flex-1 px-3 py-2 border-r border-(--pd-content-divider)">
            <div class="truncate text-sm text-(--pd-content-header)">{row.resource}</div>
            <div class="text-xs text-(--pd-content-text)">{row.list.slice(0, -1)}</div>
          </div>
          <div class="w-24 px-3 py-2 border-r border-(--pd-content-divider)">
            <span class="text-xs text-(--pd-content-text)">Running</span>
          </div>
          <div class="w-48 shrink-0 px-3 py-2">
            <MockContainerEngineEnvironmentColumn type={row.type} name={row.name} tip={row.tip} />
          </div>
        </div>
      </div>
    {/each}
  </div>
{:else if args.kind === 'accessibility'}
  <div class="flex flex-col gap-6">
    <div class="text-sm text-(--pd-content-text)">
      Current accessibility surface before modernization. The circle is a plain
      <code>div</code> with <code>aria-label="Provider info circle"</code> — color is the only
      differentiator by provider type.
    </div>

    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div class="flex flex-col gap-2 rounded border border-(--pd-content-divider) p-3">
        <div class="text-xs font-semibold text-(--pd-content-header)">ARIA on circle</div>
        <div class="max-w-xs py-2">
          <MockContainerEngineEnvironmentColumn
            type="podman"
            name="Podman Machine Default"
            tip="/var/run/podman-machine.sock" />
        </div>
        <code class="text-[10px] text-(--pd-content-text)">aria-label="Provider info circle"</code>
      </div>

      <div class="flex flex-col gap-2 rounded border border-(--pd-content-divider) p-3">
        <div class="text-xs font-semibold text-(--pd-content-header)">Tooltip conveys socket path</div>
        <div class="max-w-xs py-2">
          <MockContainerEngineEnvironmentColumn type="docker" name="docker" tip="/var/run/docker.sock" />
        </div>
        <code class="text-[10px] text-(--pd-content-text)">Pointer-hover only — no focusable trigger for keyboard access</code>
      </div>

      <div class="flex flex-col gap-2 rounded border border-(--pd-content-divider) p-3">
        <div class="text-xs font-semibold text-(--pd-content-header)">High-contrast themes</div>
        <div class="flex max-w-xs flex-col gap-2 py-2">
          <MockContainerEngineEnvironmentColumn type="podman" name="podman" tip="/run/podman/podman.sock" />
          <MockContainerEngineEnvironmentColumn type="docker" name="docker" tip="/var/run/docker.sock" />
          <MockContainerEngineEnvironmentColumn name="unknown.engine" />
        </div>
        <code class="text-[10px] text-(--pd-content-text)">Switch to hc-light / hc-dark to verify tokens</code>
      </div>

      <div class="flex flex-col gap-2 rounded border border-(--pd-content-divider) p-3">
        <div class="text-xs font-semibold text-(--pd-content-header)">Known gaps (modernization)</div>
        <ul class="list-disc space-y-1 pl-5 text-[10px] text-(--pd-content-text)">
          <li>Color-only differentiation — no icon shape per provider</li>
          <li>Circle is a raw <code>div</code>, not an SVG icon</li>
          <li>Dot is 8×8px (<code>min-w-2 min-h-2</code>) — small visible size; color-only non-text contrast</li>
        </ul>
      </div>
    </div>
  </div>
{:else if args.kind === 'comparison'}
  <div class="flex flex-col gap-4">
    <div class="text-sm text-(--pd-content-text)">
      Side-by-side of the current plain-dot treatment versus the icon-based pattern used by
      modernized status indicators (reference for #18120).
    </div>

    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div class="flex flex-col gap-2 rounded border border-(--pd-content-divider) p-3">
        <div class="text-xs font-semibold text-(--pd-content-header)">Current — ProviderInfoCircle</div>
        <div class="flex items-center gap-3 py-2">
          <div aria-label="Provider info circle" class="min-h-2 min-w-2 rounded-full bg-(--pd-provider-podman)"></div>
          <div aria-label="Provider info circle" class="min-h-2 min-w-2 rounded-full bg-(--pd-provider-docker)"></div>
          <div aria-label="Provider info circle" class="min-h-2 min-w-2 rounded-full bg-(--pd-provider-kubernetes)"></div>
          <div aria-label="Provider info circle" class="min-h-2 min-w-2 rounded-full bg-(--pd-provider-unknown)"></div>
        </div>
        <code class="text-[10px] text-(--pd-content-text)">8×8px colored divs — color only</code>
      </div>

      <div class="flex flex-col gap-2 rounded border border-(--pd-content-divider) p-3">
        <div class="text-xs font-semibold text-(--pd-content-header)">Target direction — icon-based</div>
        <div class="text-sm text-(--pd-content-text) py-2">
          Match <code>StatusDot</code> / <code>StatusDotIcon</code>: SVG icons with
          <code>role="img"</code>, larger visible indicator, and shape + color differentiation.
        </div>
        <code class="text-[10px] text-(--pd-content-text)">See StatusDot stories and #14008</code>
      </div>
    </div>

    <div class="max-w-xs">
      <div class="mb-2 text-xs font-semibold text-(--pd-content-header)">Full column (current)</div>
      <MockContainerEngineEnvironmentColumn
        type="podman"
        name="Podman Machine Default"
        tip="/var/run/podman-machine.sock" />
    </div>
  </div>
{:else}
  <div class="max-w-xs">
    <MockContainerEngineEnvironmentColumn type={args.type} name={args.name ?? 'podman'} tip={args.tip ?? ''} />
  </div>
{/if}`}}}),_(e,i),v()}var M,N,P,F,I,L,R,z,oe,B,V,H,U,W,G,K,q,J,Y,X,Z,Q,se,ce,le,$,ue;function de(){return(de=e((()=>{w(),E(),S(),D(),A(),u(),te(),M=(e,o,c=p)=>{let u=()=>ee(o?.(),[`_children`]);var f=h(),m=r(f),v=e=>{var r=oe(),o=t(n(r),2);a(o,5,()=>F,e=>e.label,(e,r)=>{var a=z(),o=n(a),c=T(o,!0),l=t(o,2);O(n(l),{get type(){return s(r).type},get name(){return s(r).name},get tip(){return s(r).tip}}),x(l);var u=t(l,2),f=T(u,!0),p=t(u,2),m=e=>{var t=R(),n=T(t,!0);i(()=>d(n,s(r).note)),_(e,t)};b(p,e=>{s(r).note&&e(m)}),x(a),i(()=>{d(c,s(r).label),d(f,s(r).token)}),_(e,a)}),x(o),x(r),_(e,r)},y=e=>{var r=V(),o=t(n(r),2);a(o,5,()=>I,e=>e.label,(e,r)=>{var a=B(),o=n(a);O(n(o),{get type(){return s(r).type},get name(){return s(r).name},get tip(){return s(r).tip}}),x(o);var c=t(o,2),l=n(c),u=T(l,!0),f=t(l,2),p=T(f,!0);x(c),x(a),i(()=>{d(u,s(r).label),d(p,s(r).note)}),_(e,a)}),x(o),x(r),_(e,r)},S=e=>{var r=H(),i=t(n(r),2),a=n(i),o=t(n(a),2);O(n(o),{type:`podman`,name:`Podman Machine Default`,tip:`/var/run/podman-machine.sock`}),x(o),g(2),x(a);var s=t(a,2),c=t(n(s),2);O(n(c),{type:`docker`,name:`docker`,tip:``}),x(c),g(2),x(s);var l=t(s,2),u=t(n(l),2);O(n(u),{type:`docker`,name:`docker`,tip:`/var/run/docker.sock`}),x(u),g(2),x(l);var d=t(l,2),f=t(n(d),2);O(n(f),{type:`podman`,name:`Very Long Podman Machine Display Name`,tip:`/Users/example/.local/share/containers/podman/machine/qemu/podman.sock`}),x(f),g(2),x(d),x(i),x(r),_(e,r)},C=e=>{var r=W(),o=t(n(r),2);a(o,1,()=>L,e=>e.list,(e,r)=>{var a=U(),o=n(a),c=T(o),l=t(o,2),u=t(n(l),2),f=n(u),p=T(f,!0),m=t(f,2),h=T(m,!0);x(u);var g=t(u,4);O(n(g),{get type(){return s(r).type},get name(){return s(r).name},get tip(){return s(r).tip}}),x(g),x(l),x(a),i(e=>{d(c,`${s(r).list??``} list`),d(p,s(r).resource),d(h,e)},[()=>s(r).list.slice(0,-1)]),_(e,a)}),x(r),_(e,r)},w=e=>{var r=G(),i=t(n(r),2),a=n(i),o=t(n(a),2);O(n(o),{type:`podman`,name:`Podman Machine Default`,tip:`/var/run/podman-machine.sock`}),x(o),g(2),x(a);var s=t(a,2),c=t(n(s),2);O(n(c),{type:`docker`,name:`docker`,tip:`/var/run/docker.sock`}),x(c),g(2),x(s);var l=t(s,2),u=t(n(l),2),d=n(u);O(d,{type:`podman`,name:`podman`,tip:`/run/podman/podman.sock`});var f=t(d,2);O(f,{type:`docker`,name:`docker`,tip:`/var/run/docker.sock`}),O(t(f,2),{name:`unknown.engine`}),x(u),g(2),x(l),g(2),x(i),x(r),_(e,r)},E=e=>{var r=K(),i=t(n(r),4);O(t(n(i),2),{type:`podman`,name:`Podman Machine Default`,tip:`/var/run/podman-machine.sock`}),x(i),x(r),_(e,r)},D=e=>{var t=q(),r=n(t);{let e=l(()=>u().name??`podman`),t=l(()=>u().tip??``);O(r,{get type(){return u().type},get name(){return s(e)},get tip(){return s(t)}})}x(t),_(e,t)};b(m,e=>{u().kind===`providers`?e(v):u().kind===`displayNames`?e(y,1):u().kind===`tooltips`?e(S,2):u().kind===`tableContexts`?e(C,3):u().kind===`accessibility`?e(w,4):u().kind===`comparison`?e(E,5):e(D,-1)}),_(e,f)},N={render:M,title:`ContainerEngineEnvironmentColumn`,tags:[`autodocs`],argTypes:{type:{control:`select`,options:[`podman`,`docker`,`kubernetes`,void 0],description:`Provider connection type (colored circle)`},name:{control:`text`,description:`Display label (type when single connection; displayName when multiple)`},tip:{control:`text`,description:`Tooltip text (connection endpoint socket path)`},kind:{table:{disable:!0}}},parameters:{docs:{description:{component:"Stories for the `ContainerEngineEnvironmentColumn` component from `packages/renderer`.\n\nEngine/provider indicator column used in Containers, Images, Volumes, Networks,\nand Pods list tables. Renders a `Label` with a colored `ProviderInfoCircle` and\nan optional tooltip showing the connection socket path.\n\nThe real column resolves `object.engineId` against `providerInfos` /\n`containerConnectionCount` stores. These stories use a presentation helper that\naccepts the resolved props (`type`, `name`, `tip`) so current visuals can be\ndocumented without store wiring.\n\n**Theming**: Uses CSS custom properties `--pd-provider-podman`,\n`--pd-provider-docker`, `--pd-provider-kubernetes`, `--pd-provider-unknown`,\n`--pd-label-bg`, and `--pd-label-text` from the color registry.\n\n**Planned modernization** (#18120): Replace the plain colored circle with an\nicon-based provider indicator consistent with the design system (e.g. StatusDot\n/ StatusDotIcon pattern)."}}}},{Story:P}=ne(N),F=[{label:`Podman`,type:`podman`,name:`podman`,tip:`/var/run/podman-machine.sock`,token:`--pd-provider-podman`},{label:`Docker`,type:`docker`,name:`docker`,tip:`/var/run/docker.sock`,token:`--pd-provider-docker`},{label:`Kubernetes`,type:`kubernetes`,name:`kubernetes`,tip:``,token:`--pd-provider-kubernetes`,note:`Rare in this column; circle supports kubernetes type`},{label:`Unknown / unresolved`,type:void 0,name:`podman.missing-connection`,tip:``,token:`--pd-provider-unknown`,note:`Falls back to engineId as label when connection is missing`}],I=[{label:`Single docker connection`,type:`docker`,name:`docker`,tip:`/var/run/docker.sock`,note:`containerConnectionCount[docker] === 1 → show connection.type`},{label:`Multiple podman — default machine`,type:`podman`,name:`Podman Machine Default`,tip:`/var/run/podman-machine.sock`,note:`containerConnectionCount[podman] > 1 → show connection.displayName`},{label:`Multiple podman — remote`,type:`podman`,name:`Podman Remote`,tip:`/var/run/podman-remote.sock`,note:`containerConnectionCount[podman] > 1 → show connection.displayName`},{label:`Unresolved engineId`,type:void 0,name:`podman.unknown-machine`,tip:``,note:`No matching connection → show raw object.engineId`}],L=[{resource:`nginx`,list:`Containers`,type:`podman`,name:`Podman Machine Default`,tip:`/var/run/podman-machine.sock`},{resource:`docker.io/library/alpine:latest`,list:`Images`,type:`docker`,name:`docker`,tip:`/var/run/docker.sock`},{resource:`my-volume`,list:`Volumes`,type:`podman`,name:`Podman Remote`,tip:`/var/run/podman-remote.sock`},{resource:`bridge`,list:`Networks`,type:`podman`,name:`podman`,tip:`/run/podman/podman.sock`},{resource:`my-web-app-pod`,list:`Pods`,type:`podman`,name:`Podman Machine Default`,tip:`/var/run/podman-machine.sock`}],R=m(`<div class="text-[10px] text-(--pd-content-text)"> </div>`),z=m(`<div class="flex flex-col gap-2 rounded border border-(--pd-content-divider) p-3"><div class="text-xs font-semibold text-(--pd-content-header)"> </div> <div class="max-w-xs py-2"><!></div> <code class="text-[10px] text-(--pd-content-text) break-all"> </code> <!></div>`),oe=m(`<div class="flex flex-col gap-4"><div class="text-sm text-(--pd-content-text)">Provider type drives the colored circle via <code>ProviderInfoCircle</code> and <code>providerColors</code>. Colors come from the color registry tokens below.</div> <div class="grid grid-cols-1 gap-4 sm:grid-cols-2"></div></div>`),B=m(`<div class="flex flex-col gap-2 rounded border border-(--pd-content-divider) p-3 sm:flex-row sm:items-center sm:gap-6"><div class="w-full max-w-xs shrink-0"><!></div> <div class="flex flex-col gap-1"><div class="text-xs font-semibold text-(--pd-content-header)"> </div> <code class="text-[10px] text-(--pd-content-text)"> </code></div></div>`),V=m(`<div class="flex flex-col gap-4"><div class="text-sm text-(--pd-content-text)">Display name logic from <code>ContainerEngineEnvironmentColumn</code>: when more than one
        connection shares a type, show <code>connection.displayName</code>; otherwise show <code>connection.type</code>. If no connection matches, fall back to <code>object.engineId</code>.</div> <div class="flex flex-col gap-3"></div></div>`),H=m(`<div class="flex flex-col gap-4"><div class="text-sm text-(--pd-content-text)">Tooltip content is <code>connection?.endpoint?.socketPath</code>. Hover each label to verify
        tip behavior is preserved.</div> <div class="grid grid-cols-1 gap-4 sm:grid-cols-2"><div class="flex flex-col gap-2 rounded border border-(--pd-content-divider) p-3"><div class="text-xs font-semibold text-(--pd-content-header)">With socket path</div> <div class="max-w-xs py-2"><!></div> <code class="text-[10px] text-(--pd-content-text) break-all">tip="/var/run/podman-machine.sock"</code></div> <div class="flex flex-col gap-2 rounded border border-(--pd-content-divider) p-3"><div class="text-xs font-semibold text-(--pd-content-header)">Empty tip (no tooltip)</div> <div class="max-w-xs py-2"><!></div> <code class="text-[10px] text-(--pd-content-text)">tip="" — Label still renders, no tip</code></div> <div class="flex flex-col gap-2 rounded border border-(--pd-content-divider) p-3"><div class="text-xs font-semibold text-(--pd-content-header)">Docker socket</div> <div class="max-w-xs py-2"><!></div> <code class="text-[10px] text-(--pd-content-text) break-all">tip="/var/run/docker.sock"</code></div> <div class="flex flex-col gap-2 rounded border border-(--pd-content-divider) p-3"><div class="text-xs font-semibold text-(--pd-content-header)">Long path truncation in label</div> <div class="max-w-[10rem] py-2"><!></div> <code class="text-[10px] text-(--pd-content-text)">Narrow column — label ellipsizes; tip remains full path</code></div></div></div>`),U=m(`<div class="flex flex-col gap-2"><div class="text-xs font-semibold uppercase tracking-wide text-(--pd-content-header)"> </div> <div class="flex items-center rounded border border-(--pd-content-divider) bg-(--pd-content-card-bg)"><div class="w-10 px-3 py-2 flex items-center justify-center border-r border-(--pd-content-divider)"><input type="checkbox" class="w-3.5 h-3.5" disabled=""/></div> <div class="min-w-0 flex-1 px-3 py-2 border-r border-(--pd-content-divider)"><div class="truncate text-sm text-(--pd-content-header)"> </div> <div class="text-xs text-(--pd-content-text)"> </div></div> <div class="w-24 px-3 py-2 border-r border-(--pd-content-divider)"><span class="text-xs text-(--pd-content-text)">Running</span></div> <div class="w-48 shrink-0 px-3 py-2"><!></div></div></div>`),W=m(`<div class="flex flex-col gap-6"><div class="text-sm text-(--pd-content-text)">The Environment column appears in five list tables. Each row below mocks a typical table
        cell layout with the Environment column on the right.</div> <!></div>`),G=m(`<div class="flex flex-col gap-6"><div class="text-sm text-(--pd-content-text)">Current accessibility surface before modernization. The circle is a plain <code>div</code> with <code>aria-label="Provider info circle"</code> — color is the only
        differentiator by provider type.</div> <div class="grid grid-cols-1 gap-4 sm:grid-cols-2"><div class="flex flex-col gap-2 rounded border border-(--pd-content-divider) p-3"><div class="text-xs font-semibold text-(--pd-content-header)">ARIA on circle</div> <div class="max-w-xs py-2"><!></div> <code class="text-[10px] text-(--pd-content-text)">aria-label="Provider info circle"</code></div> <div class="flex flex-col gap-2 rounded border border-(--pd-content-divider) p-3"><div class="text-xs font-semibold text-(--pd-content-header)">Tooltip conveys socket path</div> <div class="max-w-xs py-2"><!></div> <code class="text-[10px] text-(--pd-content-text)">Pointer-hover only — no focusable trigger for keyboard access</code></div> <div class="flex flex-col gap-2 rounded border border-(--pd-content-divider) p-3"><div class="text-xs font-semibold text-(--pd-content-header)">High-contrast themes</div> <div class="flex max-w-xs flex-col gap-2 py-2"><!> <!> <!></div> <code class="text-[10px] text-(--pd-content-text)">Switch to hc-light / hc-dark to verify tokens</code></div> <div class="flex flex-col gap-2 rounded border border-(--pd-content-divider) p-3"><div class="text-xs font-semibold text-(--pd-content-header)">Known gaps (modernization)</div> <ul class="list-disc space-y-1 pl-5 text-[10px] text-(--pd-content-text)"><li>Color-only differentiation — no icon shape per provider</li> <li>Circle is a raw <code>div</code>, not an SVG icon</li> <li>Dot is 8×8px (<code>min-w-2 min-h-2</code>) — small visible size; color-only non-text contrast</li></ul></div></div></div>`),K=m(`<div class="flex flex-col gap-4"><div class="text-sm text-(--pd-content-text)">Side-by-side of the current plain-dot treatment versus the icon-based pattern used by
        modernized status indicators (reference for #18120).</div> <div class="grid grid-cols-1 gap-4 sm:grid-cols-2"><div class="flex flex-col gap-2 rounded border border-(--pd-content-divider) p-3"><div class="text-xs font-semibold text-(--pd-content-header)">Current — ProviderInfoCircle</div> <div class="flex items-center gap-3 py-2"><div aria-label="Provider info circle" class="min-h-2 min-w-2 rounded-full bg-(--pd-provider-podman)"></div> <div aria-label="Provider info circle" class="min-h-2 min-w-2 rounded-full bg-(--pd-provider-docker)"></div> <div aria-label="Provider info circle" class="min-h-2 min-w-2 rounded-full bg-(--pd-provider-kubernetes)"></div> <div aria-label="Provider info circle" class="min-h-2 min-w-2 rounded-full bg-(--pd-provider-unknown)"></div></div> <code class="text-[10px] text-(--pd-content-text)">8×8px colored divs — color only</code></div> <div class="flex flex-col gap-2 rounded border border-(--pd-content-divider) p-3"><div class="text-xs font-semibold text-(--pd-content-header)">Target direction — icon-based</div> <div class="text-sm text-(--pd-content-text) py-2">Match <code>StatusDot</code> / <code>StatusDotIcon</code>: SVG icons with <code>role="img"</code>, larger visible indicator, and shape + color differentiation.</div> <code class="text-[10px] text-(--pd-content-text)">See StatusDot stories and #14008</code></div></div> <div class="max-w-xs"><div class="mb-2 text-xs font-semibold text-(--pd-content-header)">Full column (current)</div> <!></div></div>`),q=m(`<div class="max-w-xs"><!></div>`),J=m(`<!> <!> <!> <!> <!> <!> <!>`,1),j.__docgen={data:[],name:`ContainerEngineEnvironmentColumn.stories.svelte`},Y=re(j,N),X=[`Basic`,`ProviderTypes`,`DisplayNames`,`Tooltips`,`TableCellContexts`,`Accessibility`,`Comparison`],Z={...Y.Basic,tags:[`svelte-csf-v5`]},Q={...Y.ProviderTypes,tags:[`svelte-csf-v5`]},se={...Y.DisplayNames,tags:[`svelte-csf-v5`]},ce={...Y.Tooltips,tags:[`svelte-csf-v5`]},le={...Y.TableCellContexts,tags:[`svelte-csf-v5`]},$={...Y.Accessibility,tags:[`svelte-csf-v5`]},ue={...Y.Comparison,tags:[`svelte-csf-v5`]}})))()}de();export{$ as Accessibility,Z as Basic,ue as Comparison,se as DisplayNames,Q as ProviderTypes,le as TableCellContexts,ce as Tooltips,X as __namedExportsOrder,N as default};