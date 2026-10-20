import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{Bt as t,It as n,Lt as r,Nt as i,Q as a,Tt as o,c as s,dt as c,gt as l,ht as u,m as d,mt as f,nn as p,pn as m,rn as h,tt as g,un as _,vn as v,x as y,xn as b,zt as x}from"./iframe-sF1-xrou.js";import{a as S,i as C,n as w,r as ee,t as te}from"./create-runtime-stories-CoglhQR-.js";import{r as T}from"./ErrorMessage-Drn8twLv.js";import{t as E}from"./dist-kVelWpkA.js";function D(e,n){h(n,!1),y();var i=W(),a=r(i);A(a,{name:`Basic`,args:{tip:`this is a custom tooltip`},parameters:{__svelteCsf:{rawCode:`{#if args.kind === 'placements'}
  <div class="bg-(--pd-content-card-bg) p-8">
    <div class="flex flex-col gap-4 text-(--pd-content-text)">
      <div class="text-sm font-semibold text-(--pd-content-text)">Placements</div>
      <div class="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {#each placementVariants as variant (variant.name)}
          <div class="flex flex-col gap-2">
            <div class="text-xs text-(--pd-content-text)">{variant.name}</div>
            <Tooltip {...variant.args}>
              <span
                class="inline-flex h-5 w-5 items-center justify-center rounded-full border border-(--pd-tooltip-border) text-xs text-(--pd-tooltip-text)">
                i
              </span>
            </Tooltip>
          </div>
        {/each}
      </div>
    </div>
  </div>
{:else if args.kind === 'long'}
  <div class="bg-(--pd-content-card-bg) p-8">
    <div class="flex flex-row items-center gap-2 text-(--pd-content-text)">
      <span>Long text tooltip example</span>
      <Tooltip top tip={longText}>
        <span
          class="inline-flex h-5 w-5 items-center justify-center rounded-full border border-(--pd-tooltip-border) text-xs text-(--pd-tooltip-text)">
          i
        </span>
      </Tooltip>
    </div>
  </div>
{:else if args.kind === 'snippet'}
  <div class="bg-(--pd-content-card-bg) p-8">
    <div class="flex flex-row items-center gap-2 text-(--pd-content-text)">
      <span>Snippet tooltip content</span>
      <Tooltip>
        {#snippet tipSnippet()}
          <div class="flex flex-col gap-1 max-w-64">
            <div class="font-semibold">Custom snippet content</div>
            <div class="text-xs">
              Useful for richer tooltip layouts with multiple lines of information.
            </div>
          </div>
        {/snippet}
        <span
          class="inline-flex h-5 w-5 items-center justify-center rounded-full border border-(--pd-tooltip-border) text-xs text-(--pd-tooltip-text)">
          i
        </span>
      </Tooltip>
    </div>
  </div>
{:else if args.kind === 'i18n'}
  <div class="bg-(--pd-content-card-bg) p-8">
    <div class="flex flex-col gap-6 text-(--pd-content-text)">
      <div class="text-sm font-semibold text-(--pd-content-text)">i18n text wrapping</div>
      {#each i18nVariants as variant (variant.lang)}
        <div class="flex flex-row items-center gap-2">
          <span class="w-32 text-xs text-(--pd-content-text)">{variant.lang}</span>
          <Tooltip top tip={variant.text}>
            <span
              class="inline-flex h-5 w-5 items-center justify-center rounded-full border border-(--pd-tooltip-border) text-xs text-(--pd-tooltip-text)">
              i
            </span>
          </Tooltip>
        </div>
      {/each}
    </div>
  </div>
{:else if args.kind === 'container'}
  <div class="bg-(--pd-content-card-bg) p-8">
    <div class="flex flex-row items-center gap-2 text-(--pd-content-text)">
      <span>Container/class example</span>
      <Tooltip tip="Top-right tooltip with container class applied" topRight containerClass="inline-flex" class="mb-[20px]">
        <span
          class="inline-flex h-5 w-5 items-center justify-center rounded-full border border-(--pd-tooltip-border) text-xs text-(--pd-tooltip-text)">
          i
        </span>
      </Tooltip>
    </div>
  </div>
{:else}
  <div class="bg-(--pd-content-card-bg) p-8">
    <div class="flex flex-row items-center gap-2 text-(--pd-content-text)">
      <span>Move mouse over the icon to see the tooltip</span>
      <Tooltip {...args}>
        <span
          class="inline-flex h-5 w-5 items-center justify-center rounded-full border border-(--pd-tooltip-border) text-xs text-(--pd-tooltip-text)">
          i
        </span>
      </Tooltip>
    </div>
  </div>
{/if}`}}});var o=t(a,2);A(o,{name:`Placements`,args:{kind:`placements`},parameters:{__svelteCsf:{rawCode:`{#if args.kind === 'placements'}
  <div class="bg-(--pd-content-card-bg) p-8">
    <div class="flex flex-col gap-4 text-(--pd-content-text)">
      <div class="text-sm font-semibold text-(--pd-content-text)">Placements</div>
      <div class="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {#each placementVariants as variant (variant.name)}
          <div class="flex flex-col gap-2">
            <div class="text-xs text-(--pd-content-text)">{variant.name}</div>
            <Tooltip {...variant.args}>
              <span
                class="inline-flex h-5 w-5 items-center justify-center rounded-full border border-(--pd-tooltip-border) text-xs text-(--pd-tooltip-text)">
                i
              </span>
            </Tooltip>
          </div>
        {/each}
      </div>
    </div>
  </div>
{:else if args.kind === 'long'}
  <div class="bg-(--pd-content-card-bg) p-8">
    <div class="flex flex-row items-center gap-2 text-(--pd-content-text)">
      <span>Long text tooltip example</span>
      <Tooltip top tip={longText}>
        <span
          class="inline-flex h-5 w-5 items-center justify-center rounded-full border border-(--pd-tooltip-border) text-xs text-(--pd-tooltip-text)">
          i
        </span>
      </Tooltip>
    </div>
  </div>
{:else if args.kind === 'snippet'}
  <div class="bg-(--pd-content-card-bg) p-8">
    <div class="flex flex-row items-center gap-2 text-(--pd-content-text)">
      <span>Snippet tooltip content</span>
      <Tooltip>
        {#snippet tipSnippet()}
          <div class="flex flex-col gap-1 max-w-64">
            <div class="font-semibold">Custom snippet content</div>
            <div class="text-xs">
              Useful for richer tooltip layouts with multiple lines of information.
            </div>
          </div>
        {/snippet}
        <span
          class="inline-flex h-5 w-5 items-center justify-center rounded-full border border-(--pd-tooltip-border) text-xs text-(--pd-tooltip-text)">
          i
        </span>
      </Tooltip>
    </div>
  </div>
{:else if args.kind === 'i18n'}
  <div class="bg-(--pd-content-card-bg) p-8">
    <div class="flex flex-col gap-6 text-(--pd-content-text)">
      <div class="text-sm font-semibold text-(--pd-content-text)">i18n text wrapping</div>
      {#each i18nVariants as variant (variant.lang)}
        <div class="flex flex-row items-center gap-2">
          <span class="w-32 text-xs text-(--pd-content-text)">{variant.lang}</span>
          <Tooltip top tip={variant.text}>
            <span
              class="inline-flex h-5 w-5 items-center justify-center rounded-full border border-(--pd-tooltip-border) text-xs text-(--pd-tooltip-text)">
              i
            </span>
          </Tooltip>
        </div>
      {/each}
    </div>
  </div>
{:else if args.kind === 'container'}
  <div class="bg-(--pd-content-card-bg) p-8">
    <div class="flex flex-row items-center gap-2 text-(--pd-content-text)">
      <span>Container/class example</span>
      <Tooltip tip="Top-right tooltip with container class applied" topRight containerClass="inline-flex" class="mb-[20px]">
        <span
          class="inline-flex h-5 w-5 items-center justify-center rounded-full border border-(--pd-tooltip-border) text-xs text-(--pd-tooltip-text)">
          i
        </span>
      </Tooltip>
    </div>
  </div>
{:else}
  <div class="bg-(--pd-content-card-bg) p-8">
    <div class="flex flex-row items-center gap-2 text-(--pd-content-text)">
      <span>Move mouse over the icon to see the tooltip</span>
      <Tooltip {...args}>
        <span
          class="inline-flex h-5 w-5 items-center justify-center rounded-full border border-(--pd-tooltip-border) text-xs text-(--pd-tooltip-text)">
          i
        </span>
      </Tooltip>
    </div>
  </div>
{/if}`}}});var s=t(o,2);A(s,{name:`Long Text`,args:{kind:`long`},parameters:{__svelteCsf:{rawCode:`{#if args.kind === 'placements'}
  <div class="bg-(--pd-content-card-bg) p-8">
    <div class="flex flex-col gap-4 text-(--pd-content-text)">
      <div class="text-sm font-semibold text-(--pd-content-text)">Placements</div>
      <div class="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {#each placementVariants as variant (variant.name)}
          <div class="flex flex-col gap-2">
            <div class="text-xs text-(--pd-content-text)">{variant.name}</div>
            <Tooltip {...variant.args}>
              <span
                class="inline-flex h-5 w-5 items-center justify-center rounded-full border border-(--pd-tooltip-border) text-xs text-(--pd-tooltip-text)">
                i
              </span>
            </Tooltip>
          </div>
        {/each}
      </div>
    </div>
  </div>
{:else if args.kind === 'long'}
  <div class="bg-(--pd-content-card-bg) p-8">
    <div class="flex flex-row items-center gap-2 text-(--pd-content-text)">
      <span>Long text tooltip example</span>
      <Tooltip top tip={longText}>
        <span
          class="inline-flex h-5 w-5 items-center justify-center rounded-full border border-(--pd-tooltip-border) text-xs text-(--pd-tooltip-text)">
          i
        </span>
      </Tooltip>
    </div>
  </div>
{:else if args.kind === 'snippet'}
  <div class="bg-(--pd-content-card-bg) p-8">
    <div class="flex flex-row items-center gap-2 text-(--pd-content-text)">
      <span>Snippet tooltip content</span>
      <Tooltip>
        {#snippet tipSnippet()}
          <div class="flex flex-col gap-1 max-w-64">
            <div class="font-semibold">Custom snippet content</div>
            <div class="text-xs">
              Useful for richer tooltip layouts with multiple lines of information.
            </div>
          </div>
        {/snippet}
        <span
          class="inline-flex h-5 w-5 items-center justify-center rounded-full border border-(--pd-tooltip-border) text-xs text-(--pd-tooltip-text)">
          i
        </span>
      </Tooltip>
    </div>
  </div>
{:else if args.kind === 'i18n'}
  <div class="bg-(--pd-content-card-bg) p-8">
    <div class="flex flex-col gap-6 text-(--pd-content-text)">
      <div class="text-sm font-semibold text-(--pd-content-text)">i18n text wrapping</div>
      {#each i18nVariants as variant (variant.lang)}
        <div class="flex flex-row items-center gap-2">
          <span class="w-32 text-xs text-(--pd-content-text)">{variant.lang}</span>
          <Tooltip top tip={variant.text}>
            <span
              class="inline-flex h-5 w-5 items-center justify-center rounded-full border border-(--pd-tooltip-border) text-xs text-(--pd-tooltip-text)">
              i
            </span>
          </Tooltip>
        </div>
      {/each}
    </div>
  </div>
{:else if args.kind === 'container'}
  <div class="bg-(--pd-content-card-bg) p-8">
    <div class="flex flex-row items-center gap-2 text-(--pd-content-text)">
      <span>Container/class example</span>
      <Tooltip tip="Top-right tooltip with container class applied" topRight containerClass="inline-flex" class="mb-[20px]">
        <span
          class="inline-flex h-5 w-5 items-center justify-center rounded-full border border-(--pd-tooltip-border) text-xs text-(--pd-tooltip-text)">
          i
        </span>
      </Tooltip>
    </div>
  </div>
{:else}
  <div class="bg-(--pd-content-card-bg) p-8">
    <div class="flex flex-row items-center gap-2 text-(--pd-content-text)">
      <span>Move mouse over the icon to see the tooltip</span>
      <Tooltip {...args}>
        <span
          class="inline-flex h-5 w-5 items-center justify-center rounded-full border border-(--pd-tooltip-border) text-xs text-(--pd-tooltip-text)">
          i
        </span>
      </Tooltip>
    </div>
  </div>
{/if}`}}});var c=t(s,2);A(c,{name:`Snippet Content`,args:{kind:`snippet`},parameters:{__svelteCsf:{rawCode:`{#if args.kind === 'placements'}
  <div class="bg-(--pd-content-card-bg) p-8">
    <div class="flex flex-col gap-4 text-(--pd-content-text)">
      <div class="text-sm font-semibold text-(--pd-content-text)">Placements</div>
      <div class="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {#each placementVariants as variant (variant.name)}
          <div class="flex flex-col gap-2">
            <div class="text-xs text-(--pd-content-text)">{variant.name}</div>
            <Tooltip {...variant.args}>
              <span
                class="inline-flex h-5 w-5 items-center justify-center rounded-full border border-(--pd-tooltip-border) text-xs text-(--pd-tooltip-text)">
                i
              </span>
            </Tooltip>
          </div>
        {/each}
      </div>
    </div>
  </div>
{:else if args.kind === 'long'}
  <div class="bg-(--pd-content-card-bg) p-8">
    <div class="flex flex-row items-center gap-2 text-(--pd-content-text)">
      <span>Long text tooltip example</span>
      <Tooltip top tip={longText}>
        <span
          class="inline-flex h-5 w-5 items-center justify-center rounded-full border border-(--pd-tooltip-border) text-xs text-(--pd-tooltip-text)">
          i
        </span>
      </Tooltip>
    </div>
  </div>
{:else if args.kind === 'snippet'}
  <div class="bg-(--pd-content-card-bg) p-8">
    <div class="flex flex-row items-center gap-2 text-(--pd-content-text)">
      <span>Snippet tooltip content</span>
      <Tooltip>
        {#snippet tipSnippet()}
          <div class="flex flex-col gap-1 max-w-64">
            <div class="font-semibold">Custom snippet content</div>
            <div class="text-xs">
              Useful for richer tooltip layouts with multiple lines of information.
            </div>
          </div>
        {/snippet}
        <span
          class="inline-flex h-5 w-5 items-center justify-center rounded-full border border-(--pd-tooltip-border) text-xs text-(--pd-tooltip-text)">
          i
        </span>
      </Tooltip>
    </div>
  </div>
{:else if args.kind === 'i18n'}
  <div class="bg-(--pd-content-card-bg) p-8">
    <div class="flex flex-col gap-6 text-(--pd-content-text)">
      <div class="text-sm font-semibold text-(--pd-content-text)">i18n text wrapping</div>
      {#each i18nVariants as variant (variant.lang)}
        <div class="flex flex-row items-center gap-2">
          <span class="w-32 text-xs text-(--pd-content-text)">{variant.lang}</span>
          <Tooltip top tip={variant.text}>
            <span
              class="inline-flex h-5 w-5 items-center justify-center rounded-full border border-(--pd-tooltip-border) text-xs text-(--pd-tooltip-text)">
              i
            </span>
          </Tooltip>
        </div>
      {/each}
    </div>
  </div>
{:else if args.kind === 'container'}
  <div class="bg-(--pd-content-card-bg) p-8">
    <div class="flex flex-row items-center gap-2 text-(--pd-content-text)">
      <span>Container/class example</span>
      <Tooltip tip="Top-right tooltip with container class applied" topRight containerClass="inline-flex" class="mb-[20px]">
        <span
          class="inline-flex h-5 w-5 items-center justify-center rounded-full border border-(--pd-tooltip-border) text-xs text-(--pd-tooltip-text)">
          i
        </span>
      </Tooltip>
    </div>
  </div>
{:else}
  <div class="bg-(--pd-content-card-bg) p-8">
    <div class="flex flex-row items-center gap-2 text-(--pd-content-text)">
      <span>Move mouse over the icon to see the tooltip</span>
      <Tooltip {...args}>
        <span
          class="inline-flex h-5 w-5 items-center justify-center rounded-full border border-(--pd-tooltip-border) text-xs text-(--pd-tooltip-text)">
          i
        </span>
      </Tooltip>
    </div>
  </div>
{/if}`}}});var l=t(c,2);A(l,{name:`i18n Wrapping`,args:{kind:`i18n`},parameters:{__svelteCsf:{rawCode:`{#if args.kind === 'placements'}
  <div class="bg-(--pd-content-card-bg) p-8">
    <div class="flex flex-col gap-4 text-(--pd-content-text)">
      <div class="text-sm font-semibold text-(--pd-content-text)">Placements</div>
      <div class="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {#each placementVariants as variant (variant.name)}
          <div class="flex flex-col gap-2">
            <div class="text-xs text-(--pd-content-text)">{variant.name}</div>
            <Tooltip {...variant.args}>
              <span
                class="inline-flex h-5 w-5 items-center justify-center rounded-full border border-(--pd-tooltip-border) text-xs text-(--pd-tooltip-text)">
                i
              </span>
            </Tooltip>
          </div>
        {/each}
      </div>
    </div>
  </div>
{:else if args.kind === 'long'}
  <div class="bg-(--pd-content-card-bg) p-8">
    <div class="flex flex-row items-center gap-2 text-(--pd-content-text)">
      <span>Long text tooltip example</span>
      <Tooltip top tip={longText}>
        <span
          class="inline-flex h-5 w-5 items-center justify-center rounded-full border border-(--pd-tooltip-border) text-xs text-(--pd-tooltip-text)">
          i
        </span>
      </Tooltip>
    </div>
  </div>
{:else if args.kind === 'snippet'}
  <div class="bg-(--pd-content-card-bg) p-8">
    <div class="flex flex-row items-center gap-2 text-(--pd-content-text)">
      <span>Snippet tooltip content</span>
      <Tooltip>
        {#snippet tipSnippet()}
          <div class="flex flex-col gap-1 max-w-64">
            <div class="font-semibold">Custom snippet content</div>
            <div class="text-xs">
              Useful for richer tooltip layouts with multiple lines of information.
            </div>
          </div>
        {/snippet}
        <span
          class="inline-flex h-5 w-5 items-center justify-center rounded-full border border-(--pd-tooltip-border) text-xs text-(--pd-tooltip-text)">
          i
        </span>
      </Tooltip>
    </div>
  </div>
{:else if args.kind === 'i18n'}
  <div class="bg-(--pd-content-card-bg) p-8">
    <div class="flex flex-col gap-6 text-(--pd-content-text)">
      <div class="text-sm font-semibold text-(--pd-content-text)">i18n text wrapping</div>
      {#each i18nVariants as variant (variant.lang)}
        <div class="flex flex-row items-center gap-2">
          <span class="w-32 text-xs text-(--pd-content-text)">{variant.lang}</span>
          <Tooltip top tip={variant.text}>
            <span
              class="inline-flex h-5 w-5 items-center justify-center rounded-full border border-(--pd-tooltip-border) text-xs text-(--pd-tooltip-text)">
              i
            </span>
          </Tooltip>
        </div>
      {/each}
    </div>
  </div>
{:else if args.kind === 'container'}
  <div class="bg-(--pd-content-card-bg) p-8">
    <div class="flex flex-row items-center gap-2 text-(--pd-content-text)">
      <span>Container/class example</span>
      <Tooltip tip="Top-right tooltip with container class applied" topRight containerClass="inline-flex" class="mb-[20px]">
        <span
          class="inline-flex h-5 w-5 items-center justify-center rounded-full border border-(--pd-tooltip-border) text-xs text-(--pd-tooltip-text)">
          i
        </span>
      </Tooltip>
    </div>
  </div>
{:else}
  <div class="bg-(--pd-content-card-bg) p-8">
    <div class="flex flex-row items-center gap-2 text-(--pd-content-text)">
      <span>Move mouse over the icon to see the tooltip</span>
      <Tooltip {...args}>
        <span
          class="inline-flex h-5 w-5 items-center justify-center rounded-full border border-(--pd-tooltip-border) text-xs text-(--pd-tooltip-text)">
          i
        </span>
      </Tooltip>
    </div>
  </div>
{/if}`}}});var u=t(l,2);A(u,{name:`Container/Class`,args:{kind:`container`},parameters:{__svelteCsf:{rawCode:`{#if args.kind === 'placements'}
  <div class="bg-(--pd-content-card-bg) p-8">
    <div class="flex flex-col gap-4 text-(--pd-content-text)">
      <div class="text-sm font-semibold text-(--pd-content-text)">Placements</div>
      <div class="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {#each placementVariants as variant (variant.name)}
          <div class="flex flex-col gap-2">
            <div class="text-xs text-(--pd-content-text)">{variant.name}</div>
            <Tooltip {...variant.args}>
              <span
                class="inline-flex h-5 w-5 items-center justify-center rounded-full border border-(--pd-tooltip-border) text-xs text-(--pd-tooltip-text)">
                i
              </span>
            </Tooltip>
          </div>
        {/each}
      </div>
    </div>
  </div>
{:else if args.kind === 'long'}
  <div class="bg-(--pd-content-card-bg) p-8">
    <div class="flex flex-row items-center gap-2 text-(--pd-content-text)">
      <span>Long text tooltip example</span>
      <Tooltip top tip={longText}>
        <span
          class="inline-flex h-5 w-5 items-center justify-center rounded-full border border-(--pd-tooltip-border) text-xs text-(--pd-tooltip-text)">
          i
        </span>
      </Tooltip>
    </div>
  </div>
{:else if args.kind === 'snippet'}
  <div class="bg-(--pd-content-card-bg) p-8">
    <div class="flex flex-row items-center gap-2 text-(--pd-content-text)">
      <span>Snippet tooltip content</span>
      <Tooltip>
        {#snippet tipSnippet()}
          <div class="flex flex-col gap-1 max-w-64">
            <div class="font-semibold">Custom snippet content</div>
            <div class="text-xs">
              Useful for richer tooltip layouts with multiple lines of information.
            </div>
          </div>
        {/snippet}
        <span
          class="inline-flex h-5 w-5 items-center justify-center rounded-full border border-(--pd-tooltip-border) text-xs text-(--pd-tooltip-text)">
          i
        </span>
      </Tooltip>
    </div>
  </div>
{:else if args.kind === 'i18n'}
  <div class="bg-(--pd-content-card-bg) p-8">
    <div class="flex flex-col gap-6 text-(--pd-content-text)">
      <div class="text-sm font-semibold text-(--pd-content-text)">i18n text wrapping</div>
      {#each i18nVariants as variant (variant.lang)}
        <div class="flex flex-row items-center gap-2">
          <span class="w-32 text-xs text-(--pd-content-text)">{variant.lang}</span>
          <Tooltip top tip={variant.text}>
            <span
              class="inline-flex h-5 w-5 items-center justify-center rounded-full border border-(--pd-tooltip-border) text-xs text-(--pd-tooltip-text)">
              i
            </span>
          </Tooltip>
        </div>
      {/each}
    </div>
  </div>
{:else if args.kind === 'container'}
  <div class="bg-(--pd-content-card-bg) p-8">
    <div class="flex flex-row items-center gap-2 text-(--pd-content-text)">
      <span>Container/class example</span>
      <Tooltip tip="Top-right tooltip with container class applied" topRight containerClass="inline-flex" class="mb-[20px]">
        <span
          class="inline-flex h-5 w-5 items-center justify-center rounded-full border border-(--pd-tooltip-border) text-xs text-(--pd-tooltip-text)">
          i
        </span>
      </Tooltip>
    </div>
  </div>
{:else}
  <div class="bg-(--pd-content-card-bg) p-8">
    <div class="flex flex-row items-center gap-2 text-(--pd-content-text)">
      <span>Move mouse over the icon to see the tooltip</span>
      <Tooltip {...args}>
        <span
          class="inline-flex h-5 w-5 items-center justify-center rounded-full border border-(--pd-tooltip-border) text-xs text-(--pd-tooltip-text)">
          i
        </span>
      </Tooltip>
    </div>
  </div>
{/if}`}}}),f(e,i),p()}var O,k,A,j,M,N,P,F,I,L,R,z,B,V,H,U,W,G,K,q,J,Y,X,Z,Q;function $(){return($=e((()=>{b(),S(),v(),E(),C(),s(),w(),O=(e,s)=>{let l=()=>m(s?.(),[]);var p=u(),h=r(p),v=e=>{var r=I(),s=n(r),l=t(n(s),2);a(l,5,()=>j,e=>e.name,(e,r)=>{var a=F(),s=n(a),l=x(s,!0),u=t(s,2);T(u,d(()=>o(r).args,{children:(e,t)=>{var n=P();f(e,n)},$$slots:{default:!0}})),_(a),i(()=>c(l,o(r).name)),f(e,a)}),_(l),_(s),_(r),f(e,r)},y=e=>{var r=L(),i=n(r),a=t(n(i),2);T(a,{top:!0,tip:M,children:(e,t)=>{var n=P();f(e,n)},$$slots:{default:!0}}),_(i),_(r),f(e,r)},b=e=>{var r=z(),i=n(r),a=t(n(i),2);T(a,{tipSnippet:e=>{var t=R();f(e,t)},children:(e,t)=>{var n=P();f(e,n)},$$slots:{tipSnippet:!0,default:!0}}),_(i),_(r),f(e,r)},S=e=>{var r=V(),s=n(r),l=t(n(s),2);a(l,1,()=>N,e=>e.lang,(e,r)=>{var a=B(),s=n(a),l=x(s,!0),u=t(s,2);T(u,{top:!0,get tip(){return o(r).text},children:(e,t)=>{var n=P();f(e,n)},$$slots:{default:!0}}),_(a),i(()=>c(l,o(r).lang)),f(e,a)}),_(s),_(r),f(e,r)},C=e=>{var r=H(),i=n(r),a=t(n(i),2);T(a,{tip:`Top-right tooltip with container class applied`,topRight:!0,containerClass:`inline-flex`,class:`mb-[20px]`,children:(e,t)=>{var n=P();f(e,n)},$$slots:{default:!0}}),_(i),_(r),f(e,r)},w=e=>{var r=U(),i=n(r),a=t(n(i),2);T(a,d(l,{children:(e,t)=>{var n=P();f(e,n)},$$slots:{default:!0}})),_(i),_(r),f(e,r)};g(h,e=>{l().kind===`placements`?e(v):l().kind===`long`?e(y,1):l().kind===`snippet`?e(b,2):l().kind===`i18n`?e(S,3):l().kind===`container`?e(C,4):e(w,-1)}),f(e,p)},k={component:T,render:O,title:`Tooltip`,tags:[`autodocs`],argTypes:{kind:{table:{disable:!0}},tip:{control:`text`,description:`Text to show in the tooltip`,defaultValue:`This is a tooltip`},top:{control:`boolean`,description:`Flag the tooltip as being at the top`,defaultValue:!1},topLeft:{control:`boolean`,description:`Flag the tooltip as being at the top left`,defaultValue:!1},topRight:{control:`boolean`,description:`Flag the tooltip as being at the top right`,defaultValue:!1},right:{control:`boolean`,description:`Flag the tooltip as being at the right`,defaultValue:!1},bottom:{control:`boolean`,description:`Flag the tooltip as being at the bottom`,defaultValue:!1},bottomLeft:{control:`boolean`,description:`Flag the tooltip as being at the bottom left`,defaultValue:!1},bottomRight:{control:`boolean`,description:`Flag the tooltip as being at the bottom right`,defaultValue:!1},left:{control:`boolean`,description:`Flag the tooltip as being at the left`,defaultValue:!1}},parameters:{docs:{description:{component:`These are the stories for the \`Tooltip\` component.
Allow to display a tooltip at a given position (top, bottom, etc.).
Supports simple text tooltips and complex content using snippets.`}}}},{Story:A}=ee(k),j=[{name:`Top`,args:{tip:`this is a custom top tooltip`,top:!0}},{name:`Top Left`,args:{tip:`this is a custom top left tooltip`,topLeft:!0}},{name:`Top Right`,args:{tip:`this is a custom top right tooltip`,topRight:!0}},{name:`Right`,args:{tip:`this is a custom right tooltip`,right:!0}},{name:`Bottom`,args:{tip:`this is a custom bottom tooltip`,bottom:!0}},{name:`Bottom Left`,args:{tip:`this is a custom bottom left tooltip`,bottomLeft:!0}},{name:`Bottom Right`,args:{tip:`this is a custom bottom right tooltip`,bottomRight:!0}},{name:`Left`,args:{tip:`this is a custom left tooltip`,left:!0}}],M=`This is a very long tooltip message that demonstrates how tooltips handle extended content. It can contain detailed information that users need to understand the context of the UI element.`,N=[{lang:`German`,text:`Dieser Container wurde erfolgreich gestartet und ist jetzt bereit, eingehende Netzwerkanfragen zu verarbeiten.`},{lang:`Finnish`,text:`Tämä säilö on käynnistetty onnistuneesti ja se on nyt valmis käsittelemään saapuvia verkkopyyntöjä.`},{lang:`English (long)`,text:`This container engine connection has been successfully established and is currently running with all configured network interfaces active.`}],P=l(`<span class="inline-flex h-5 w-5 items-center justify-center rounded-full border border-(--pd-tooltip-border) text-xs text-(--pd-tooltip-text)">i</span>`),F=l(`<div class="flex flex-col gap-2"><div class="text-xs text-(--pd-content-text)"> </div> <!></div>`),I=l(`<div class="bg-(--pd-content-card-bg) p-8"><div class="flex flex-col gap-4 text-(--pd-content-text)"><div class="text-sm font-semibold text-(--pd-content-text)">Placements</div> <div class="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3"></div></div></div>`),L=l(`<div class="bg-(--pd-content-card-bg) p-8"><div class="flex flex-row items-center gap-2 text-(--pd-content-text)"><span>Long text tooltip example</span> <!></div></div>`),R=l(`<div class="flex flex-col gap-1 max-w-64"><div class="font-semibold">Custom snippet content</div> <div class="text-xs">Useful for richer tooltip layouts with multiple lines of information.</div></div>`),z=l(`<div class="bg-(--pd-content-card-bg) p-8"><div class="flex flex-row items-center gap-2 text-(--pd-content-text)"><span>Snippet tooltip content</span> <!></div></div>`),B=l(`<div class="flex flex-row items-center gap-2"><span class="w-32 text-xs text-(--pd-content-text)"> </span> <!></div>`),V=l(`<div class="bg-(--pd-content-card-bg) p-8"><div class="flex flex-col gap-6 text-(--pd-content-text)"><div class="text-sm font-semibold text-(--pd-content-text)">i18n text wrapping</div> <!></div></div>`),H=l(`<div class="bg-(--pd-content-card-bg) p-8"><div class="flex flex-row items-center gap-2 text-(--pd-content-text)"><span>Container/class example</span> <!></div></div>`),U=l(`<div class="bg-(--pd-content-card-bg) p-8"><div class="flex flex-row items-center gap-2 text-(--pd-content-text)"><span>Move mouse over the icon to see the tooltip</span> <!></div></div>`),W=l(`<!> <!> <!> <!> <!> <!>`,1),D.__docgen={data:[],name:`Tooltip.stories.svelte`},G=te(D,k),K=[`Basic`,`Placements`,`LongText`,`SnippetContent`,`I18nWrapping`,`ContainerClass`],q={...G.Basic,tags:[`svelte-csf-v5`]},J={...G.Placements,tags:[`svelte-csf-v5`]},Y={...G.LongText,tags:[`svelte-csf-v5`]},X={...G.SnippetContent,tags:[`svelte-csf-v5`]},Z={...G.I18nWrapping,tags:[`svelte-csf-v5`]},Q={...G.ContainerClass,tags:[`svelte-csf-v5`]}})))()}$();export{q as Basic,Q as ContainerClass,Z as I18nWrapping,Y as LongText,J as Placements,X as SnippetContent,K as __namedExportsOrder,k as default};