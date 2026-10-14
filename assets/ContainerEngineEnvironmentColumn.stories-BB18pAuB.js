import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{$t as t,Bt as n,Ht as r,It as i,Q as a,Tt as o,U as s,Ut as c,an as l,c as u,dt as d,f,fn as p,gn as m,gt as h,ht as g,mt as _,on as v,pn as y,tn as b,tt as ee,wn as x,x as S,xn as C,yn as te,zt as w}from"./iframe-CDN0TtU_.js";import{a as T,i as E,n as ne,r as re,t as ie}from"./create-runtime-stories-Cgl6zKXK.js";import{r as ae}from"./ErrorMessage-CXHpAYiQ.js";import{t as oe}from"./dist-CUVSA1aI.js";function D(e,t){let n={podman:`bg-(--pd-provider-podman)`,docker:`bg-(--pd-provider-docker)`,kubernetes:`bg-(--pd-provider-kubernetes)`,unknown:`bg-(--pd-provider-unknown)`},a=f(t,`tip`,3,``),l=b(()=>n[t.type??`unknown`]);ae(e,{get tip(){return a()},children:(e,n)=>{var a=O(),u=w(a),f=c(u,2),p=r(f,!0);y(a),i(()=>{s(u,1,`min-h-2 min-w-2 shrink-0 rounded-full ${o(l)??``}`),d(p,t.name)}),_(e,a)},$$slots:{default:!0}})}var O;function k(){return(k=e((()=>{x(),C(),u(),oe(),O=h(`<div class="flex w-full items-center gap-x-1 rounded-md bg-[var(--pd-label-bg)] p-1 text-sm text-[var(--pd-label-text)]"><div aria-label="Provider info circle"></div> <span class="min-w-0 flex-1 overflow-x-hidden text-ellipsis whitespace-nowrap"> </span></div>`),D.__docgen={data:[{name:`type`,visibility:`public`,description:`Provider connection type driving the colored indicator.`,keywords:[],kind:`let`,type:{kind:`union`,type:[{kind:`const`,type:`string`,value:`kubernetes`,text:`"kubernetes"`},{kind:`const`,type:`string`,value:`podman`,text:`"podman"`},{kind:`const`,type:`string`,value:`docker`,text:`"docker"`}],text:`"kubernetes" | "podman" | "docker"`},static:!1,readonly:!1},{name:`name`,visibility:`public`,description:`Label text (connection type, or displayName when multiple connections share a type).`,keywords:[{name:`required`,description:``}],kind:`let`,type:{kind:`type`,type:`string`,text:`string`},static:!1,readonly:!1},{name:`tip`,visibility:`public`,description:"Tooltip content — typically `connection.endpoint.socketPath`.",keywords:[],kind:`let`,type:{kind:`type`,type:`string`,text:`string`},static:!1,readonly:!1,defaultValue:`""`}],name:`MockContainerEngineEnvironmentColumn.svelte`}})))()}function A(e,t){v(t,!1),S();var r=q(),i=n(r);N(i,{name:`Basic`,args:{type:`podman`,name:`Podman Machine Default`,tip:`/var/run/podman-machine.sock`},parameters:{__svelteCsf:{rawCode:`{#if args.kind === 'providers'}
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
{/if}`}}});var a=c(i,2);N(a,{name:`Provider Types`,args:{kind:`providers`},parameters:{__svelteCsf:{rawCode:`{#if args.kind === 'providers'}
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
{/if}`}}});var o=c(a,2);N(o,{name:`Display Names`,args:{kind:`displayNames`},parameters:{__svelteCsf:{rawCode:`{#if args.kind === 'providers'}
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
{/if}`}}});var s=c(o,2);N(s,{name:`Tooltips`,args:{kind:`tooltips`},parameters:{__svelteCsf:{rawCode:`{#if args.kind === 'providers'}
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
{/if}`}}});var u=c(s,2);N(u,{name:`Table Cell Contexts`,args:{kind:`tableContexts`},parameters:{__svelteCsf:{rawCode:`{#if args.kind === 'providers'}
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
{/if}`}}});var d=c(u,2);N(d,{name:`Accessibility`,args:{kind:`accessibility`},parameters:{__svelteCsf:{rawCode:`{#if args.kind === 'providers'}
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
{/if}`}}});var f=c(d,2);N(f,{name:`Comparison`,args:{kind:`comparison`},parameters:{__svelteCsf:{rawCode:`{#if args.kind === 'providers'}
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
{/if}`}}}),_(e,r),l()}var j,M,N,P,F,se,I,L,R,z,B,V,H,U,W,G,K,q,J,Y,X,Z,Q,ce,le,$,ue;function de(){return(de=e((()=>{x(),T(),C(),E(),k(),u(),ne(),j=(e,s,l=te)=>{let u=()=>m(s?.(),[`_children`]);var f=g(),h=n(f),v=e=>{var t=R(),n=c(w(t),2);a(n,5,()=>P,e=>e.label,(e,t)=>{var n=L(),a=w(n),s=r(a,!0),l=c(a,2);D(w(l),{get type(){return o(t).type},get name(){return o(t).name},get tip(){return o(t).tip}}),y(l);var u=c(l,2),f=r(u,!0),p=c(u,2),m=e=>{var n=I(),a=r(n,!0);i(()=>d(a,o(t).note)),_(e,n)};ee(p,e=>{o(t).note&&e(m)}),y(n),i(()=>{d(s,o(t).label),d(f,o(t).token)}),_(e,n)}),y(n),y(t),_(e,t)},b=e=>{var t=B(),n=c(w(t),2);a(n,5,()=>F,e=>e.label,(e,t)=>{var n=z(),a=w(n);D(w(a),{get type(){return o(t).type},get name(){return o(t).name},get tip(){return o(t).tip}}),y(a);var s=c(a,2),l=w(s),u=r(l,!0),f=c(l,2),p=r(f,!0);y(s),y(n),i(()=>{d(u,o(t).label),d(p,o(t).note)}),_(e,n)}),y(n),y(t),_(e,t)},x=e=>{var t=V(),n=c(w(t),2),r=w(n),i=c(w(r),2);D(w(i),{type:`podman`,name:`Podman Machine Default`,tip:`/var/run/podman-machine.sock`}),y(i),p(2),y(r);var a=c(r,2),o=c(w(a),2);D(w(o),{type:`docker`,name:`docker`,tip:``}),y(o),p(2),y(a);var s=c(a,2),l=c(w(s),2);D(w(l),{type:`docker`,name:`docker`,tip:`/var/run/docker.sock`}),y(l),p(2),y(s);var u=c(s,2),d=c(w(u),2);D(w(d),{type:`podman`,name:`Very Long Podman Machine Display Name`,tip:`/Users/example/.local/share/containers/podman/machine/qemu/podman.sock`}),y(d),p(2),y(u),y(n),y(t),_(e,t)},S=e=>{var t=U(),n=c(w(t),2);a(n,1,()=>se,e=>e.list,(e,t)=>{var n=H(),a=w(n),s=r(a),l=c(a,2),u=c(w(l),2),f=w(u),p=r(f,!0),m=c(f,2),h=r(m,!0);y(u);var g=c(u,4);D(w(g),{get type(){return o(t).type},get name(){return o(t).name},get tip(){return o(t).tip}}),y(g),y(l),y(n),i(e=>{d(s,`${o(t).list??``} list`),d(p,o(t).resource),d(h,e)},[()=>o(t).list.slice(0,-1)]),_(e,n)}),y(t),_(e,t)},C=e=>{var t=W(),n=c(w(t),2),r=w(n),i=c(w(r),2);D(w(i),{type:`podman`,name:`Podman Machine Default`,tip:`/var/run/podman-machine.sock`}),y(i),p(2),y(r);var a=c(r,2),o=c(w(a),2);D(w(o),{type:`docker`,name:`docker`,tip:`/var/run/docker.sock`}),y(o),p(2),y(a);var s=c(a,2),l=c(w(s),2),u=w(l);D(u,{type:`podman`,name:`podman`,tip:`/run/podman/podman.sock`});var d=c(u,2);D(d,{type:`docker`,name:`docker`,tip:`/var/run/docker.sock`}),D(c(d,2),{name:`unknown.engine`}),y(l),p(2),y(s),p(2),y(n),y(t),_(e,t)},T=e=>{var t=G(),n=c(w(t),4);D(c(w(n),2),{type:`podman`,name:`Podman Machine Default`,tip:`/var/run/podman-machine.sock`}),y(n),y(t),_(e,t)},E=e=>{var n=K(),r=w(n);{let e=t(()=>u().name??`podman`),n=t(()=>u().tip??``);D(r,{get type(){return u().type},get name(){return o(e)},get tip(){return o(n)}})}y(n),_(e,n)};ee(h,e=>{u().kind===`providers`?e(v):u().kind===`displayNames`?e(b,1):u().kind===`tooltips`?e(x,2):u().kind===`tableContexts`?e(S,3):u().kind===`accessibility`?e(C,4):u().kind===`comparison`?e(T,5):e(E,-1)}),_(e,f)},M={render:j,title:`ContainerEngineEnvironmentColumn`,tags:[`autodocs`],argTypes:{type:{control:`select`,options:[`podman`,`docker`,`kubernetes`,void 0],description:`Provider connection type (colored circle)`},name:{control:`text`,description:`Display label (type when single connection; displayName when multiple)`},tip:{control:`text`,description:`Tooltip text (connection endpoint socket path)`},kind:{table:{disable:!0}}},parameters:{docs:{description:{component:"Stories for the `ContainerEngineEnvironmentColumn` component from `packages/renderer`.\n\nEngine/provider indicator column used in Containers, Images, Volumes, Networks,\nand Pods list tables. Renders a `Label` with a colored `ProviderInfoCircle` and\nan optional tooltip showing the connection socket path.\n\nThe real column resolves `object.engineId` against `providerInfos` /\n`containerConnectionCount` stores. These stories use a presentation helper that\naccepts the resolved props (`type`, `name`, `tip`) so current visuals can be\ndocumented without store wiring.\n\n**Theming**: Uses CSS custom properties `--pd-provider-podman`,\n`--pd-provider-docker`, `--pd-provider-kubernetes`, `--pd-provider-unknown`,\n`--pd-label-bg`, and `--pd-label-text` from the color registry.\n\n**Planned modernization** (#18120): Replace the plain colored circle with an\nicon-based provider indicator consistent with the design system (e.g. StatusDot\n/ StatusDotIcon pattern)."}}}},{Story:N}=re(M),P=[{label:`Podman`,type:`podman`,name:`podman`,tip:`/var/run/podman-machine.sock`,token:`--pd-provider-podman`},{label:`Docker`,type:`docker`,name:`docker`,tip:`/var/run/docker.sock`,token:`--pd-provider-docker`},{label:`Kubernetes`,type:`kubernetes`,name:`kubernetes`,tip:``,token:`--pd-provider-kubernetes`,note:`Rare in this column; circle supports kubernetes type`},{label:`Unknown / unresolved`,type:void 0,name:`podman.missing-connection`,tip:``,token:`--pd-provider-unknown`,note:`Falls back to engineId as label when connection is missing`}],F=[{label:`Single docker connection`,type:`docker`,name:`docker`,tip:`/var/run/docker.sock`,note:`containerConnectionCount[docker] === 1 → show connection.type`},{label:`Multiple podman — default machine`,type:`podman`,name:`Podman Machine Default`,tip:`/var/run/podman-machine.sock`,note:`containerConnectionCount[podman] > 1 → show connection.displayName`},{label:`Multiple podman — remote`,type:`podman`,name:`Podman Remote`,tip:`/var/run/podman-remote.sock`,note:`containerConnectionCount[podman] > 1 → show connection.displayName`},{label:`Unresolved engineId`,type:void 0,name:`podman.unknown-machine`,tip:``,note:`No matching connection → show raw object.engineId`}],se=[{resource:`nginx`,list:`Containers`,type:`podman`,name:`Podman Machine Default`,tip:`/var/run/podman-machine.sock`},{resource:`docker.io/library/alpine:latest`,list:`Images`,type:`docker`,name:`docker`,tip:`/var/run/docker.sock`},{resource:`my-volume`,list:`Volumes`,type:`podman`,name:`Podman Remote`,tip:`/var/run/podman-remote.sock`},{resource:`bridge`,list:`Networks`,type:`podman`,name:`podman`,tip:`/run/podman/podman.sock`},{resource:`my-web-app-pod`,list:`Pods`,type:`podman`,name:`Podman Machine Default`,tip:`/var/run/podman-machine.sock`}],I=h(`<div class="text-[10px] text-(--pd-content-text)"> </div>`),L=h(`<div class="flex flex-col gap-2 rounded border border-(--pd-content-divider) p-3"><div class="text-xs font-semibold text-(--pd-content-header)"> </div> <div class="max-w-xs py-2"><!></div> <code class="text-[10px] text-(--pd-content-text) break-all"> </code> <!></div>`),R=h(`<div class="flex flex-col gap-4"><div class="text-sm text-(--pd-content-text)">Provider type drives the colored circle via <code>ProviderInfoCircle</code> and <code>providerColors</code>. Colors come from the color registry tokens below.</div> <div class="grid grid-cols-1 gap-4 sm:grid-cols-2"></div></div>`),z=h(`<div class="flex flex-col gap-2 rounded border border-(--pd-content-divider) p-3 sm:flex-row sm:items-center sm:gap-6"><div class="w-full max-w-xs shrink-0"><!></div> <div class="flex flex-col gap-1"><div class="text-xs font-semibold text-(--pd-content-header)"> </div> <code class="text-[10px] text-(--pd-content-text)"> </code></div></div>`),B=h(`<div class="flex flex-col gap-4"><div class="text-sm text-(--pd-content-text)">Display name logic from <code>ContainerEngineEnvironmentColumn</code>: when more than one
        connection shares a type, show <code>connection.displayName</code>; otherwise show <code>connection.type</code>. If no connection matches, fall back to <code>object.engineId</code>.</div> <div class="flex flex-col gap-3"></div></div>`),V=h(`<div class="flex flex-col gap-4"><div class="text-sm text-(--pd-content-text)">Tooltip content is <code>connection?.endpoint?.socketPath</code>. Hover each label to verify
        tip behavior is preserved.</div> <div class="grid grid-cols-1 gap-4 sm:grid-cols-2"><div class="flex flex-col gap-2 rounded border border-(--pd-content-divider) p-3"><div class="text-xs font-semibold text-(--pd-content-header)">With socket path</div> <div class="max-w-xs py-2"><!></div> <code class="text-[10px] text-(--pd-content-text) break-all">tip="/var/run/podman-machine.sock"</code></div> <div class="flex flex-col gap-2 rounded border border-(--pd-content-divider) p-3"><div class="text-xs font-semibold text-(--pd-content-header)">Empty tip (no tooltip)</div> <div class="max-w-xs py-2"><!></div> <code class="text-[10px] text-(--pd-content-text)">tip="" — Label still renders, no tip</code></div> <div class="flex flex-col gap-2 rounded border border-(--pd-content-divider) p-3"><div class="text-xs font-semibold text-(--pd-content-header)">Docker socket</div> <div class="max-w-xs py-2"><!></div> <code class="text-[10px] text-(--pd-content-text) break-all">tip="/var/run/docker.sock"</code></div> <div class="flex flex-col gap-2 rounded border border-(--pd-content-divider) p-3"><div class="text-xs font-semibold text-(--pd-content-header)">Long path truncation in label</div> <div class="max-w-[10rem] py-2"><!></div> <code class="text-[10px] text-(--pd-content-text)">Narrow column — label ellipsizes; tip remains full path</code></div></div></div>`),H=h(`<div class="flex flex-col gap-2"><div class="text-xs font-semibold uppercase tracking-wide text-(--pd-content-header)"> </div> <div class="flex items-center rounded border border-(--pd-content-divider) bg-(--pd-content-card-bg)"><div class="w-10 px-3 py-2 flex items-center justify-center border-r border-(--pd-content-divider)"><input type="checkbox" class="w-3.5 h-3.5" disabled=""/></div> <div class="min-w-0 flex-1 px-3 py-2 border-r border-(--pd-content-divider)"><div class="truncate text-sm text-(--pd-content-header)"> </div> <div class="text-xs text-(--pd-content-text)"> </div></div> <div class="w-24 px-3 py-2 border-r border-(--pd-content-divider)"><span class="text-xs text-(--pd-content-text)">Running</span></div> <div class="w-48 shrink-0 px-3 py-2"><!></div></div></div>`),U=h(`<div class="flex flex-col gap-6"><div class="text-sm text-(--pd-content-text)">The Environment column appears in five list tables. Each row below mocks a typical table
        cell layout with the Environment column on the right.</div> <!></div>`),W=h(`<div class="flex flex-col gap-6"><div class="text-sm text-(--pd-content-text)">Current accessibility surface before modernization. The circle is a plain <code>div</code> with <code>aria-label="Provider info circle"</code> — color is the only
        differentiator by provider type.</div> <div class="grid grid-cols-1 gap-4 sm:grid-cols-2"><div class="flex flex-col gap-2 rounded border border-(--pd-content-divider) p-3"><div class="text-xs font-semibold text-(--pd-content-header)">ARIA on circle</div> <div class="max-w-xs py-2"><!></div> <code class="text-[10px] text-(--pd-content-text)">aria-label="Provider info circle"</code></div> <div class="flex flex-col gap-2 rounded border border-(--pd-content-divider) p-3"><div class="text-xs font-semibold text-(--pd-content-header)">Tooltip conveys socket path</div> <div class="max-w-xs py-2"><!></div> <code class="text-[10px] text-(--pd-content-text)">Pointer-hover only — no focusable trigger for keyboard access</code></div> <div class="flex flex-col gap-2 rounded border border-(--pd-content-divider) p-3"><div class="text-xs font-semibold text-(--pd-content-header)">High-contrast themes</div> <div class="flex max-w-xs flex-col gap-2 py-2"><!> <!> <!></div> <code class="text-[10px] text-(--pd-content-text)">Switch to hc-light / hc-dark to verify tokens</code></div> <div class="flex flex-col gap-2 rounded border border-(--pd-content-divider) p-3"><div class="text-xs font-semibold text-(--pd-content-header)">Known gaps (modernization)</div> <ul class="list-disc space-y-1 pl-5 text-[10px] text-(--pd-content-text)"><li>Color-only differentiation — no icon shape per provider</li> <li>Circle is a raw <code>div</code>, not an SVG icon</li> <li>Dot is 8×8px (<code>min-w-2 min-h-2</code>) — small visible size; color-only non-text contrast</li></ul></div></div></div>`),G=h(`<div class="flex flex-col gap-4"><div class="text-sm text-(--pd-content-text)">Side-by-side of the current plain-dot treatment versus the icon-based pattern used by
        modernized status indicators (reference for #18120).</div> <div class="grid grid-cols-1 gap-4 sm:grid-cols-2"><div class="flex flex-col gap-2 rounded border border-(--pd-content-divider) p-3"><div class="text-xs font-semibold text-(--pd-content-header)">Current — ProviderInfoCircle</div> <div class="flex items-center gap-3 py-2"><div aria-label="Provider info circle" class="min-h-2 min-w-2 rounded-full bg-(--pd-provider-podman)"></div> <div aria-label="Provider info circle" class="min-h-2 min-w-2 rounded-full bg-(--pd-provider-docker)"></div> <div aria-label="Provider info circle" class="min-h-2 min-w-2 rounded-full bg-(--pd-provider-kubernetes)"></div> <div aria-label="Provider info circle" class="min-h-2 min-w-2 rounded-full bg-(--pd-provider-unknown)"></div></div> <code class="text-[10px] text-(--pd-content-text)">8×8px colored divs — color only</code></div> <div class="flex flex-col gap-2 rounded border border-(--pd-content-divider) p-3"><div class="text-xs font-semibold text-(--pd-content-header)">Target direction — icon-based</div> <div class="text-sm text-(--pd-content-text) py-2">Match <code>StatusDot</code> / <code>StatusDotIcon</code>: SVG icons with <code>role="img"</code>, larger visible indicator, and shape + color differentiation.</div> <code class="text-[10px] text-(--pd-content-text)">See StatusDot stories and #14008</code></div></div> <div class="max-w-xs"><div class="mb-2 text-xs font-semibold text-(--pd-content-header)">Full column (current)</div> <!></div></div>`),K=h(`<div class="max-w-xs"><!></div>`),q=h(`<!> <!> <!> <!> <!> <!> <!>`,1),A.__docgen={data:[],name:`ContainerEngineEnvironmentColumn.stories.svelte`},J=ie(A,M),Y=[`Basic`,`ProviderTypes`,`DisplayNames`,`Tooltips`,`TableCellContexts`,`Accessibility`,`Comparison`],X={...J.Basic,tags:[`svelte-csf-v5`]},Z={...J.ProviderTypes,tags:[`svelte-csf-v5`]},Q={...J.DisplayNames,tags:[`svelte-csf-v5`]},ce={...J.Tooltips,tags:[`svelte-csf-v5`]},le={...J.TableCellContexts,tags:[`svelte-csf-v5`]},$={...J.Accessibility,tags:[`svelte-csf-v5`]},ue={...J.Comparison,tags:[`svelte-csf-v5`]}})))()}de();export{$ as Accessibility,X as Basic,ue as Comparison,Q as DisplayNames,Z as ProviderTypes,le as TableCellContexts,ce as Tooltips,Y as __namedExportsOrder,M as default};