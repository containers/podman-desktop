import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{Bt as t,Ut as n,an as r,c as i,fn as a,gn as o,gt as s,ht as c,m as l,mt as u,on as d,pn as f,tt as p,wn as m,x as h,xn as g,zt as _}from"./iframe-CYu10MOy.js";import{a as v,i as y,n as b,r as x,t as S}from"./create-runtime-stories-F6SWag8j.js";import{n as C,t as w}from"./LinearProgress-i9Nh4N-O.js";import{n as T,t as E}from"./ProgressBar-llj3tvne.js";function D(e,i){d(i,!1),h();var a=F(),o=t(a);A(o,{name:`Basic`,parameters:{__svelteCsf:{rawCode:`{#if args.kind === 'pageHeader'}
  <div class="flex flex-col gap-6">
    <div class="text-sm text-(--pd-content-text)">
      LinearProgress is used inside <code>Page.svelte</code> between the header and tab bar.
      It appears when the <code>inProgress</code> prop is set to <code>true</code>.
    </div>

    <div class="flex flex-col gap-2">
      <div class="text-xs font-semibold text-(--pd-content-header)">Active (inProgress=true)</div>

      <div class="rounded border border-(--pd-content-divider) overflow-hidden">
        <div class="flex flex-col bg-(--pd-content-bg)">
          <div class="flex flex-row items-center px-5 pt-4 pb-2">
            <div class="flex flex-col w-full">
              <div class="flex items-center text-sm text-(--pd-content-breadcrumb)">
                <span>Containers</span>
                <span class="mx-2">&gt;</span>
                <span class="font-extralight">Create a container</span>
              </div>
              <h1 class="text-xl font-bold text-(--pd-content-header) pt-1">Create a container</h1>
            </div>
          </div>

          <LinearProgress />

          <div class="flex flex-row px-2 border-b border-(--pd-content-divider)">
            <div class="px-4 py-2 text-sm text-(--pd-content-header) border-b-2 border-(--pd-content-header)">Details</div>
            <div class="px-4 py-2 text-sm text-(--pd-content-text)">Networking</div>
            <div class="px-4 py-2 text-sm text-(--pd-content-text)">Volumes</div>
          </div>

          <div class="p-5 text-sm text-(--pd-content-text) h-24">
            Tab content area
          </div>
        </div>
      </div>
    </div>

    <div class="flex flex-col gap-2">
      <div class="text-xs font-semibold text-(--pd-content-header)">Idle (inProgress=false)</div>

      <div class="rounded border border-(--pd-content-divider) overflow-hidden">
        <div class="flex flex-col bg-(--pd-content-bg)">
          <div class="flex flex-row items-center px-5 pt-4 pb-2">
            <div class="flex flex-col w-full">
              <div class="flex items-center text-sm text-(--pd-content-breadcrumb)">
                <span>Containers</span>
                <span class="mx-2">&gt;</span>
                <span class="font-extralight">Create a container</span>
              </div>
              <h1 class="text-xl font-bold text-(--pd-content-header) pt-1">Create a container</h1>
            </div>
          </div>

          <div class="flex flex-row px-2 border-b border-(--pd-content-divider)">
            <div class="px-4 py-2 text-sm text-(--pd-content-header) border-b-2 border-(--pd-content-header)">Details</div>
            <div class="px-4 py-2 text-sm text-(--pd-content-text)">Networking</div>
            <div class="px-4 py-2 text-sm text-(--pd-content-text)">Volumes</div>
          </div>

          <div class="p-5 text-sm text-(--pd-content-text) h-24">
            Tab content area
          </div>
        </div>
      </div>
    </div>
  </div>
{:else if args.kind === 'formPage'}
  <div class="flex flex-col gap-6">
    <div class="text-sm text-(--pd-content-text)">
      FormPage and EngineFormPage pass <code>inProgress</code> to <code>Page</code>, which renders
      LinearProgress. These pages are used for operations like deploying to Kubernetes, creating
      pods from containers, and running Kubernetes YAML files.
    </div>

    <div class="flex flex-col gap-2">
      <div class="text-xs font-semibold text-(--pd-content-header)">Deploy to Kubernetes (deploying)</div>

      <div class="rounded border border-(--pd-content-divider) overflow-hidden">
        <div class="flex flex-col bg-(--pd-content-bg)">
          <div class="flex flex-row items-center px-5 pt-4 pb-2">
            <div class="flex flex-col w-full">
              <div class="flex items-center text-sm text-(--pd-content-breadcrumb)">
                <span>Pods</span>
                <span class="mx-2">&gt;</span>
                <span class="font-extralight">Deploy generated pod to Kubernetes</span>
              </div>
              <h1 class="text-xl font-bold text-(--pd-content-header) pt-1">Deploy generated pod to Kubernetes</h1>
            </div>
          </div>

          <LinearProgress aria-label="Deploying pod to Kubernetes" />

          <div class="flex flex-row px-2 border-b border-(--pd-content-divider)"></div>

          <div class="p-5 text-sm text-(--pd-content-text) h-24">
            Form content area
          </div>
        </div>
      </div>
    </div>

    <div class="flex flex-col gap-2">
      <div class="text-xs font-semibold text-(--pd-content-header)">Create pods from YAML (running)</div>

      <div class="rounded border border-(--pd-content-divider) overflow-hidden">
        <div class="flex flex-col bg-(--pd-content-bg)">
          <div class="flex flex-row items-center px-5 pt-4 pb-2">
            <div class="flex flex-col w-full">
              <div class="flex items-center text-sm text-(--pd-content-breadcrumb)">
                <span>Pods</span>
                <span class="mx-2">&gt;</span>
                <span class="font-extralight">Create pods from a Kubernetes YAML file</span>
              </div>
              <h1 class="text-xl font-bold text-(--pd-content-header) pt-1">Create pods from a Kubernetes YAML file</h1>
            </div>
          </div>

          <LinearProgress aria-label="Creating pods from YAML" />

          <div class="flex flex-row px-2 border-b border-(--pd-content-divider)"></div>

          <div class="p-5 text-sm text-(--pd-content-text) h-24">
            Form content area
          </div>
        </div>
      </div>
    </div>
  </div>
{:else if args.kind === 'accessibility'}
  <div class="flex flex-col gap-4">
    <div class="text-sm text-(--pd-content-text)">
      The inner animated bar element uses <code>role="progressbar"</code> with <code>aria-valuemin</code>
      and <code>aria-valuemax</code>. Since LinearProgress is always indeterminate, <code>aria-valuenow</code>
      is never set. Additional ARIA props (e.g. <code>aria-label</code>) land on the outer wrapper via
      <code>restProps</code>. The animation respects <code>prefers-reduced-motion: reduce</code>.
    </div>

    <div class="grid grid-cols-2 gap-4">
      <div class="flex flex-col gap-2 rounded border border-(--pd-content-divider) p-3">
        <div class="text-xs font-semibold text-(--pd-content-header)">Default</div>

        <div class="py-2">
          <LinearProgress />
        </div>

        <code class="text-[10px] text-(--pd-content-text) break-all">role="progressbar" aria-valuemin="0" aria-valuemax="100"</code>
      </div>

      <div class="flex flex-col gap-2 rounded border border-(--pd-content-divider) p-3">
        <div class="text-xs font-semibold text-(--pd-content-header)">With aria-label</div>

        <div class="py-2">
          <LinearProgress aria-label="Loading page content" />
        </div>

        <code class="text-[10px] text-(--pd-content-text) break-all">aria-label="Loading page content" on wrapper</code>
      </div>
    </div>

    <div class="flex flex-col gap-2 rounded border border-(--pd-content-divider) p-3">
      <div class="text-xs font-semibold text-(--pd-content-header)">High-contrast guide line</div>

      <div class="text-sm text-(--pd-content-text)">
        A 1px guide line using <code>--pd-progressBar-hc-line-bg</code> is rendered behind the animated
        bar. In standard themes it is transparent. In high-contrast themes it becomes visible
        (white in HC Dark, black in HC Light) to ensure the bar track is perceivable.
      </div>
    </div>

    <div class="flex flex-col gap-2 rounded border border-(--pd-content-divider) p-3">
      <div class="text-xs font-semibold text-(--pd-content-header)">Reduced motion</div>

      <div class="text-sm text-(--pd-content-text)">
        When <code>prefers-reduced-motion: reduce</code> is active, the sweep animation is disabled
        entirely. The bar remains visible as a static filled indicator.
      </div>
    </div>
  </div>
{:else if args.kind === 'comparison'}
  <div class="flex flex-col gap-6">
    <div class="text-sm text-(--pd-content-text)">
      LinearProgress and ProgressBar serve different purposes. LinearProgress is a page-level
      indicator (full-width, thin, indeterminate-only). ProgressBar is a general-purpose component
      used in tables, status bars, and dialogs (configurable dimensions, supports determinate mode
      with percentage text).
    </div>

    <div class="grid grid-cols-1 gap-4">
      <div class="flex flex-col gap-2 rounded border border-(--pd-content-divider) p-4">
        <div class="text-xs font-semibold text-(--pd-content-header)">LinearProgress (page-level, indeterminate only)</div>

        <div class="py-2">
          <LinearProgress />
        </div>

        <code class="text-[10px] text-(--pd-content-text)">Full width, h-0.5 (2px), no rounded corners, no text</code>
      </div>

      <div class="flex flex-col gap-2 rounded border border-(--pd-content-divider) p-4">
        <div class="text-xs font-semibold text-(--pd-content-header)">ProgressBar - indeterminate (component-level)</div>

        <div class="py-2">
          <ProgressBar />
        </div>

        <code class="text-[10px] text-(--pd-content-text)">Configurable width (default w-36), h-2 (8px), rounded, no text</code>
      </div>

      <div class="flex flex-col gap-2 rounded border border-(--pd-content-divider) p-4">
        <div class="text-xs font-semibold text-(--pd-content-header)">ProgressBar - determinate (component-level)</div>

        <div class="py-2">
          <ProgressBar progress={65} />
        </div>

        <code class="text-[10px] text-(--pd-content-text)">Configurable width (default w-36), h-2 (8px), rounded, shows 65%</code>
      </div>
    </div>
  </div>
{:else}
  <LinearProgress {...args} />
{/if}`}}});var s=n(o,2);A(s,{name:`Page Header`,args:{kind:`pageHeader`},parameters:{__svelteCsf:{rawCode:`{#if args.kind === 'pageHeader'}
  <div class="flex flex-col gap-6">
    <div class="text-sm text-(--pd-content-text)">
      LinearProgress is used inside <code>Page.svelte</code> between the header and tab bar.
      It appears when the <code>inProgress</code> prop is set to <code>true</code>.
    </div>

    <div class="flex flex-col gap-2">
      <div class="text-xs font-semibold text-(--pd-content-header)">Active (inProgress=true)</div>

      <div class="rounded border border-(--pd-content-divider) overflow-hidden">
        <div class="flex flex-col bg-(--pd-content-bg)">
          <div class="flex flex-row items-center px-5 pt-4 pb-2">
            <div class="flex flex-col w-full">
              <div class="flex items-center text-sm text-(--pd-content-breadcrumb)">
                <span>Containers</span>
                <span class="mx-2">&gt;</span>
                <span class="font-extralight">Create a container</span>
              </div>
              <h1 class="text-xl font-bold text-(--pd-content-header) pt-1">Create a container</h1>
            </div>
          </div>

          <LinearProgress />

          <div class="flex flex-row px-2 border-b border-(--pd-content-divider)">
            <div class="px-4 py-2 text-sm text-(--pd-content-header) border-b-2 border-(--pd-content-header)">Details</div>
            <div class="px-4 py-2 text-sm text-(--pd-content-text)">Networking</div>
            <div class="px-4 py-2 text-sm text-(--pd-content-text)">Volumes</div>
          </div>

          <div class="p-5 text-sm text-(--pd-content-text) h-24">
            Tab content area
          </div>
        </div>
      </div>
    </div>

    <div class="flex flex-col gap-2">
      <div class="text-xs font-semibold text-(--pd-content-header)">Idle (inProgress=false)</div>

      <div class="rounded border border-(--pd-content-divider) overflow-hidden">
        <div class="flex flex-col bg-(--pd-content-bg)">
          <div class="flex flex-row items-center px-5 pt-4 pb-2">
            <div class="flex flex-col w-full">
              <div class="flex items-center text-sm text-(--pd-content-breadcrumb)">
                <span>Containers</span>
                <span class="mx-2">&gt;</span>
                <span class="font-extralight">Create a container</span>
              </div>
              <h1 class="text-xl font-bold text-(--pd-content-header) pt-1">Create a container</h1>
            </div>
          </div>

          <div class="flex flex-row px-2 border-b border-(--pd-content-divider)">
            <div class="px-4 py-2 text-sm text-(--pd-content-header) border-b-2 border-(--pd-content-header)">Details</div>
            <div class="px-4 py-2 text-sm text-(--pd-content-text)">Networking</div>
            <div class="px-4 py-2 text-sm text-(--pd-content-text)">Volumes</div>
          </div>

          <div class="p-5 text-sm text-(--pd-content-text) h-24">
            Tab content area
          </div>
        </div>
      </div>
    </div>
  </div>
{:else if args.kind === 'formPage'}
  <div class="flex flex-col gap-6">
    <div class="text-sm text-(--pd-content-text)">
      FormPage and EngineFormPage pass <code>inProgress</code> to <code>Page</code>, which renders
      LinearProgress. These pages are used for operations like deploying to Kubernetes, creating
      pods from containers, and running Kubernetes YAML files.
    </div>

    <div class="flex flex-col gap-2">
      <div class="text-xs font-semibold text-(--pd-content-header)">Deploy to Kubernetes (deploying)</div>

      <div class="rounded border border-(--pd-content-divider) overflow-hidden">
        <div class="flex flex-col bg-(--pd-content-bg)">
          <div class="flex flex-row items-center px-5 pt-4 pb-2">
            <div class="flex flex-col w-full">
              <div class="flex items-center text-sm text-(--pd-content-breadcrumb)">
                <span>Pods</span>
                <span class="mx-2">&gt;</span>
                <span class="font-extralight">Deploy generated pod to Kubernetes</span>
              </div>
              <h1 class="text-xl font-bold text-(--pd-content-header) pt-1">Deploy generated pod to Kubernetes</h1>
            </div>
          </div>

          <LinearProgress aria-label="Deploying pod to Kubernetes" />

          <div class="flex flex-row px-2 border-b border-(--pd-content-divider)"></div>

          <div class="p-5 text-sm text-(--pd-content-text) h-24">
            Form content area
          </div>
        </div>
      </div>
    </div>

    <div class="flex flex-col gap-2">
      <div class="text-xs font-semibold text-(--pd-content-header)">Create pods from YAML (running)</div>

      <div class="rounded border border-(--pd-content-divider) overflow-hidden">
        <div class="flex flex-col bg-(--pd-content-bg)">
          <div class="flex flex-row items-center px-5 pt-4 pb-2">
            <div class="flex flex-col w-full">
              <div class="flex items-center text-sm text-(--pd-content-breadcrumb)">
                <span>Pods</span>
                <span class="mx-2">&gt;</span>
                <span class="font-extralight">Create pods from a Kubernetes YAML file</span>
              </div>
              <h1 class="text-xl font-bold text-(--pd-content-header) pt-1">Create pods from a Kubernetes YAML file</h1>
            </div>
          </div>

          <LinearProgress aria-label="Creating pods from YAML" />

          <div class="flex flex-row px-2 border-b border-(--pd-content-divider)"></div>

          <div class="p-5 text-sm text-(--pd-content-text) h-24">
            Form content area
          </div>
        </div>
      </div>
    </div>
  </div>
{:else if args.kind === 'accessibility'}
  <div class="flex flex-col gap-4">
    <div class="text-sm text-(--pd-content-text)">
      The inner animated bar element uses <code>role="progressbar"</code> with <code>aria-valuemin</code>
      and <code>aria-valuemax</code>. Since LinearProgress is always indeterminate, <code>aria-valuenow</code>
      is never set. Additional ARIA props (e.g. <code>aria-label</code>) land on the outer wrapper via
      <code>restProps</code>. The animation respects <code>prefers-reduced-motion: reduce</code>.
    </div>

    <div class="grid grid-cols-2 gap-4">
      <div class="flex flex-col gap-2 rounded border border-(--pd-content-divider) p-3">
        <div class="text-xs font-semibold text-(--pd-content-header)">Default</div>

        <div class="py-2">
          <LinearProgress />
        </div>

        <code class="text-[10px] text-(--pd-content-text) break-all">role="progressbar" aria-valuemin="0" aria-valuemax="100"</code>
      </div>

      <div class="flex flex-col gap-2 rounded border border-(--pd-content-divider) p-3">
        <div class="text-xs font-semibold text-(--pd-content-header)">With aria-label</div>

        <div class="py-2">
          <LinearProgress aria-label="Loading page content" />
        </div>

        <code class="text-[10px] text-(--pd-content-text) break-all">aria-label="Loading page content" on wrapper</code>
      </div>
    </div>

    <div class="flex flex-col gap-2 rounded border border-(--pd-content-divider) p-3">
      <div class="text-xs font-semibold text-(--pd-content-header)">High-contrast guide line</div>

      <div class="text-sm text-(--pd-content-text)">
        A 1px guide line using <code>--pd-progressBar-hc-line-bg</code> is rendered behind the animated
        bar. In standard themes it is transparent. In high-contrast themes it becomes visible
        (white in HC Dark, black in HC Light) to ensure the bar track is perceivable.
      </div>
    </div>

    <div class="flex flex-col gap-2 rounded border border-(--pd-content-divider) p-3">
      <div class="text-xs font-semibold text-(--pd-content-header)">Reduced motion</div>

      <div class="text-sm text-(--pd-content-text)">
        When <code>prefers-reduced-motion: reduce</code> is active, the sweep animation is disabled
        entirely. The bar remains visible as a static filled indicator.
      </div>
    </div>
  </div>
{:else if args.kind === 'comparison'}
  <div class="flex flex-col gap-6">
    <div class="text-sm text-(--pd-content-text)">
      LinearProgress and ProgressBar serve different purposes. LinearProgress is a page-level
      indicator (full-width, thin, indeterminate-only). ProgressBar is a general-purpose component
      used in tables, status bars, and dialogs (configurable dimensions, supports determinate mode
      with percentage text).
    </div>

    <div class="grid grid-cols-1 gap-4">
      <div class="flex flex-col gap-2 rounded border border-(--pd-content-divider) p-4">
        <div class="text-xs font-semibold text-(--pd-content-header)">LinearProgress (page-level, indeterminate only)</div>

        <div class="py-2">
          <LinearProgress />
        </div>

        <code class="text-[10px] text-(--pd-content-text)">Full width, h-0.5 (2px), no rounded corners, no text</code>
      </div>

      <div class="flex flex-col gap-2 rounded border border-(--pd-content-divider) p-4">
        <div class="text-xs font-semibold text-(--pd-content-header)">ProgressBar - indeterminate (component-level)</div>

        <div class="py-2">
          <ProgressBar />
        </div>

        <code class="text-[10px] text-(--pd-content-text)">Configurable width (default w-36), h-2 (8px), rounded, no text</code>
      </div>

      <div class="flex flex-col gap-2 rounded border border-(--pd-content-divider) p-4">
        <div class="text-xs font-semibold text-(--pd-content-header)">ProgressBar - determinate (component-level)</div>

        <div class="py-2">
          <ProgressBar progress={65} />
        </div>

        <code class="text-[10px] text-(--pd-content-text)">Configurable width (default w-36), h-2 (8px), rounded, shows 65%</code>
      </div>
    </div>
  </div>
{:else}
  <LinearProgress {...args} />
{/if}`}}});var c=n(s,2);A(c,{name:`Form Page`,args:{kind:`formPage`},parameters:{__svelteCsf:{rawCode:`{#if args.kind === 'pageHeader'}
  <div class="flex flex-col gap-6">
    <div class="text-sm text-(--pd-content-text)">
      LinearProgress is used inside <code>Page.svelte</code> between the header and tab bar.
      It appears when the <code>inProgress</code> prop is set to <code>true</code>.
    </div>

    <div class="flex flex-col gap-2">
      <div class="text-xs font-semibold text-(--pd-content-header)">Active (inProgress=true)</div>

      <div class="rounded border border-(--pd-content-divider) overflow-hidden">
        <div class="flex flex-col bg-(--pd-content-bg)">
          <div class="flex flex-row items-center px-5 pt-4 pb-2">
            <div class="flex flex-col w-full">
              <div class="flex items-center text-sm text-(--pd-content-breadcrumb)">
                <span>Containers</span>
                <span class="mx-2">&gt;</span>
                <span class="font-extralight">Create a container</span>
              </div>
              <h1 class="text-xl font-bold text-(--pd-content-header) pt-1">Create a container</h1>
            </div>
          </div>

          <LinearProgress />

          <div class="flex flex-row px-2 border-b border-(--pd-content-divider)">
            <div class="px-4 py-2 text-sm text-(--pd-content-header) border-b-2 border-(--pd-content-header)">Details</div>
            <div class="px-4 py-2 text-sm text-(--pd-content-text)">Networking</div>
            <div class="px-4 py-2 text-sm text-(--pd-content-text)">Volumes</div>
          </div>

          <div class="p-5 text-sm text-(--pd-content-text) h-24">
            Tab content area
          </div>
        </div>
      </div>
    </div>

    <div class="flex flex-col gap-2">
      <div class="text-xs font-semibold text-(--pd-content-header)">Idle (inProgress=false)</div>

      <div class="rounded border border-(--pd-content-divider) overflow-hidden">
        <div class="flex flex-col bg-(--pd-content-bg)">
          <div class="flex flex-row items-center px-5 pt-4 pb-2">
            <div class="flex flex-col w-full">
              <div class="flex items-center text-sm text-(--pd-content-breadcrumb)">
                <span>Containers</span>
                <span class="mx-2">&gt;</span>
                <span class="font-extralight">Create a container</span>
              </div>
              <h1 class="text-xl font-bold text-(--pd-content-header) pt-1">Create a container</h1>
            </div>
          </div>

          <div class="flex flex-row px-2 border-b border-(--pd-content-divider)">
            <div class="px-4 py-2 text-sm text-(--pd-content-header) border-b-2 border-(--pd-content-header)">Details</div>
            <div class="px-4 py-2 text-sm text-(--pd-content-text)">Networking</div>
            <div class="px-4 py-2 text-sm text-(--pd-content-text)">Volumes</div>
          </div>

          <div class="p-5 text-sm text-(--pd-content-text) h-24">
            Tab content area
          </div>
        </div>
      </div>
    </div>
  </div>
{:else if args.kind === 'formPage'}
  <div class="flex flex-col gap-6">
    <div class="text-sm text-(--pd-content-text)">
      FormPage and EngineFormPage pass <code>inProgress</code> to <code>Page</code>, which renders
      LinearProgress. These pages are used for operations like deploying to Kubernetes, creating
      pods from containers, and running Kubernetes YAML files.
    </div>

    <div class="flex flex-col gap-2">
      <div class="text-xs font-semibold text-(--pd-content-header)">Deploy to Kubernetes (deploying)</div>

      <div class="rounded border border-(--pd-content-divider) overflow-hidden">
        <div class="flex flex-col bg-(--pd-content-bg)">
          <div class="flex flex-row items-center px-5 pt-4 pb-2">
            <div class="flex flex-col w-full">
              <div class="flex items-center text-sm text-(--pd-content-breadcrumb)">
                <span>Pods</span>
                <span class="mx-2">&gt;</span>
                <span class="font-extralight">Deploy generated pod to Kubernetes</span>
              </div>
              <h1 class="text-xl font-bold text-(--pd-content-header) pt-1">Deploy generated pod to Kubernetes</h1>
            </div>
          </div>

          <LinearProgress aria-label="Deploying pod to Kubernetes" />

          <div class="flex flex-row px-2 border-b border-(--pd-content-divider)"></div>

          <div class="p-5 text-sm text-(--pd-content-text) h-24">
            Form content area
          </div>
        </div>
      </div>
    </div>

    <div class="flex flex-col gap-2">
      <div class="text-xs font-semibold text-(--pd-content-header)">Create pods from YAML (running)</div>

      <div class="rounded border border-(--pd-content-divider) overflow-hidden">
        <div class="flex flex-col bg-(--pd-content-bg)">
          <div class="flex flex-row items-center px-5 pt-4 pb-2">
            <div class="flex flex-col w-full">
              <div class="flex items-center text-sm text-(--pd-content-breadcrumb)">
                <span>Pods</span>
                <span class="mx-2">&gt;</span>
                <span class="font-extralight">Create pods from a Kubernetes YAML file</span>
              </div>
              <h1 class="text-xl font-bold text-(--pd-content-header) pt-1">Create pods from a Kubernetes YAML file</h1>
            </div>
          </div>

          <LinearProgress aria-label="Creating pods from YAML" />

          <div class="flex flex-row px-2 border-b border-(--pd-content-divider)"></div>

          <div class="p-5 text-sm text-(--pd-content-text) h-24">
            Form content area
          </div>
        </div>
      </div>
    </div>
  </div>
{:else if args.kind === 'accessibility'}
  <div class="flex flex-col gap-4">
    <div class="text-sm text-(--pd-content-text)">
      The inner animated bar element uses <code>role="progressbar"</code> with <code>aria-valuemin</code>
      and <code>aria-valuemax</code>. Since LinearProgress is always indeterminate, <code>aria-valuenow</code>
      is never set. Additional ARIA props (e.g. <code>aria-label</code>) land on the outer wrapper via
      <code>restProps</code>. The animation respects <code>prefers-reduced-motion: reduce</code>.
    </div>

    <div class="grid grid-cols-2 gap-4">
      <div class="flex flex-col gap-2 rounded border border-(--pd-content-divider) p-3">
        <div class="text-xs font-semibold text-(--pd-content-header)">Default</div>

        <div class="py-2">
          <LinearProgress />
        </div>

        <code class="text-[10px] text-(--pd-content-text) break-all">role="progressbar" aria-valuemin="0" aria-valuemax="100"</code>
      </div>

      <div class="flex flex-col gap-2 rounded border border-(--pd-content-divider) p-3">
        <div class="text-xs font-semibold text-(--pd-content-header)">With aria-label</div>

        <div class="py-2">
          <LinearProgress aria-label="Loading page content" />
        </div>

        <code class="text-[10px] text-(--pd-content-text) break-all">aria-label="Loading page content" on wrapper</code>
      </div>
    </div>

    <div class="flex flex-col gap-2 rounded border border-(--pd-content-divider) p-3">
      <div class="text-xs font-semibold text-(--pd-content-header)">High-contrast guide line</div>

      <div class="text-sm text-(--pd-content-text)">
        A 1px guide line using <code>--pd-progressBar-hc-line-bg</code> is rendered behind the animated
        bar. In standard themes it is transparent. In high-contrast themes it becomes visible
        (white in HC Dark, black in HC Light) to ensure the bar track is perceivable.
      </div>
    </div>

    <div class="flex flex-col gap-2 rounded border border-(--pd-content-divider) p-3">
      <div class="text-xs font-semibold text-(--pd-content-header)">Reduced motion</div>

      <div class="text-sm text-(--pd-content-text)">
        When <code>prefers-reduced-motion: reduce</code> is active, the sweep animation is disabled
        entirely. The bar remains visible as a static filled indicator.
      </div>
    </div>
  </div>
{:else if args.kind === 'comparison'}
  <div class="flex flex-col gap-6">
    <div class="text-sm text-(--pd-content-text)">
      LinearProgress and ProgressBar serve different purposes. LinearProgress is a page-level
      indicator (full-width, thin, indeterminate-only). ProgressBar is a general-purpose component
      used in tables, status bars, and dialogs (configurable dimensions, supports determinate mode
      with percentage text).
    </div>

    <div class="grid grid-cols-1 gap-4">
      <div class="flex flex-col gap-2 rounded border border-(--pd-content-divider) p-4">
        <div class="text-xs font-semibold text-(--pd-content-header)">LinearProgress (page-level, indeterminate only)</div>

        <div class="py-2">
          <LinearProgress />
        </div>

        <code class="text-[10px] text-(--pd-content-text)">Full width, h-0.5 (2px), no rounded corners, no text</code>
      </div>

      <div class="flex flex-col gap-2 rounded border border-(--pd-content-divider) p-4">
        <div class="text-xs font-semibold text-(--pd-content-header)">ProgressBar - indeterminate (component-level)</div>

        <div class="py-2">
          <ProgressBar />
        </div>

        <code class="text-[10px] text-(--pd-content-text)">Configurable width (default w-36), h-2 (8px), rounded, no text</code>
      </div>

      <div class="flex flex-col gap-2 rounded border border-(--pd-content-divider) p-4">
        <div class="text-xs font-semibold text-(--pd-content-header)">ProgressBar - determinate (component-level)</div>

        <div class="py-2">
          <ProgressBar progress={65} />
        </div>

        <code class="text-[10px] text-(--pd-content-text)">Configurable width (default w-36), h-2 (8px), rounded, shows 65%</code>
      </div>
    </div>
  </div>
{:else}
  <LinearProgress {...args} />
{/if}`}}});var l=n(c,2);A(l,{name:`Accessibility`,args:{kind:`accessibility`},parameters:{__svelteCsf:{rawCode:`{#if args.kind === 'pageHeader'}
  <div class="flex flex-col gap-6">
    <div class="text-sm text-(--pd-content-text)">
      LinearProgress is used inside <code>Page.svelte</code> between the header and tab bar.
      It appears when the <code>inProgress</code> prop is set to <code>true</code>.
    </div>

    <div class="flex flex-col gap-2">
      <div class="text-xs font-semibold text-(--pd-content-header)">Active (inProgress=true)</div>

      <div class="rounded border border-(--pd-content-divider) overflow-hidden">
        <div class="flex flex-col bg-(--pd-content-bg)">
          <div class="flex flex-row items-center px-5 pt-4 pb-2">
            <div class="flex flex-col w-full">
              <div class="flex items-center text-sm text-(--pd-content-breadcrumb)">
                <span>Containers</span>
                <span class="mx-2">&gt;</span>
                <span class="font-extralight">Create a container</span>
              </div>
              <h1 class="text-xl font-bold text-(--pd-content-header) pt-1">Create a container</h1>
            </div>
          </div>

          <LinearProgress />

          <div class="flex flex-row px-2 border-b border-(--pd-content-divider)">
            <div class="px-4 py-2 text-sm text-(--pd-content-header) border-b-2 border-(--pd-content-header)">Details</div>
            <div class="px-4 py-2 text-sm text-(--pd-content-text)">Networking</div>
            <div class="px-4 py-2 text-sm text-(--pd-content-text)">Volumes</div>
          </div>

          <div class="p-5 text-sm text-(--pd-content-text) h-24">
            Tab content area
          </div>
        </div>
      </div>
    </div>

    <div class="flex flex-col gap-2">
      <div class="text-xs font-semibold text-(--pd-content-header)">Idle (inProgress=false)</div>

      <div class="rounded border border-(--pd-content-divider) overflow-hidden">
        <div class="flex flex-col bg-(--pd-content-bg)">
          <div class="flex flex-row items-center px-5 pt-4 pb-2">
            <div class="flex flex-col w-full">
              <div class="flex items-center text-sm text-(--pd-content-breadcrumb)">
                <span>Containers</span>
                <span class="mx-2">&gt;</span>
                <span class="font-extralight">Create a container</span>
              </div>
              <h1 class="text-xl font-bold text-(--pd-content-header) pt-1">Create a container</h1>
            </div>
          </div>

          <div class="flex flex-row px-2 border-b border-(--pd-content-divider)">
            <div class="px-4 py-2 text-sm text-(--pd-content-header) border-b-2 border-(--pd-content-header)">Details</div>
            <div class="px-4 py-2 text-sm text-(--pd-content-text)">Networking</div>
            <div class="px-4 py-2 text-sm text-(--pd-content-text)">Volumes</div>
          </div>

          <div class="p-5 text-sm text-(--pd-content-text) h-24">
            Tab content area
          </div>
        </div>
      </div>
    </div>
  </div>
{:else if args.kind === 'formPage'}
  <div class="flex flex-col gap-6">
    <div class="text-sm text-(--pd-content-text)">
      FormPage and EngineFormPage pass <code>inProgress</code> to <code>Page</code>, which renders
      LinearProgress. These pages are used for operations like deploying to Kubernetes, creating
      pods from containers, and running Kubernetes YAML files.
    </div>

    <div class="flex flex-col gap-2">
      <div class="text-xs font-semibold text-(--pd-content-header)">Deploy to Kubernetes (deploying)</div>

      <div class="rounded border border-(--pd-content-divider) overflow-hidden">
        <div class="flex flex-col bg-(--pd-content-bg)">
          <div class="flex flex-row items-center px-5 pt-4 pb-2">
            <div class="flex flex-col w-full">
              <div class="flex items-center text-sm text-(--pd-content-breadcrumb)">
                <span>Pods</span>
                <span class="mx-2">&gt;</span>
                <span class="font-extralight">Deploy generated pod to Kubernetes</span>
              </div>
              <h1 class="text-xl font-bold text-(--pd-content-header) pt-1">Deploy generated pod to Kubernetes</h1>
            </div>
          </div>

          <LinearProgress aria-label="Deploying pod to Kubernetes" />

          <div class="flex flex-row px-2 border-b border-(--pd-content-divider)"></div>

          <div class="p-5 text-sm text-(--pd-content-text) h-24">
            Form content area
          </div>
        </div>
      </div>
    </div>

    <div class="flex flex-col gap-2">
      <div class="text-xs font-semibold text-(--pd-content-header)">Create pods from YAML (running)</div>

      <div class="rounded border border-(--pd-content-divider) overflow-hidden">
        <div class="flex flex-col bg-(--pd-content-bg)">
          <div class="flex flex-row items-center px-5 pt-4 pb-2">
            <div class="flex flex-col w-full">
              <div class="flex items-center text-sm text-(--pd-content-breadcrumb)">
                <span>Pods</span>
                <span class="mx-2">&gt;</span>
                <span class="font-extralight">Create pods from a Kubernetes YAML file</span>
              </div>
              <h1 class="text-xl font-bold text-(--pd-content-header) pt-1">Create pods from a Kubernetes YAML file</h1>
            </div>
          </div>

          <LinearProgress aria-label="Creating pods from YAML" />

          <div class="flex flex-row px-2 border-b border-(--pd-content-divider)"></div>

          <div class="p-5 text-sm text-(--pd-content-text) h-24">
            Form content area
          </div>
        </div>
      </div>
    </div>
  </div>
{:else if args.kind === 'accessibility'}
  <div class="flex flex-col gap-4">
    <div class="text-sm text-(--pd-content-text)">
      The inner animated bar element uses <code>role="progressbar"</code> with <code>aria-valuemin</code>
      and <code>aria-valuemax</code>. Since LinearProgress is always indeterminate, <code>aria-valuenow</code>
      is never set. Additional ARIA props (e.g. <code>aria-label</code>) land on the outer wrapper via
      <code>restProps</code>. The animation respects <code>prefers-reduced-motion: reduce</code>.
    </div>

    <div class="grid grid-cols-2 gap-4">
      <div class="flex flex-col gap-2 rounded border border-(--pd-content-divider) p-3">
        <div class="text-xs font-semibold text-(--pd-content-header)">Default</div>

        <div class="py-2">
          <LinearProgress />
        </div>

        <code class="text-[10px] text-(--pd-content-text) break-all">role="progressbar" aria-valuemin="0" aria-valuemax="100"</code>
      </div>

      <div class="flex flex-col gap-2 rounded border border-(--pd-content-divider) p-3">
        <div class="text-xs font-semibold text-(--pd-content-header)">With aria-label</div>

        <div class="py-2">
          <LinearProgress aria-label="Loading page content" />
        </div>

        <code class="text-[10px] text-(--pd-content-text) break-all">aria-label="Loading page content" on wrapper</code>
      </div>
    </div>

    <div class="flex flex-col gap-2 rounded border border-(--pd-content-divider) p-3">
      <div class="text-xs font-semibold text-(--pd-content-header)">High-contrast guide line</div>

      <div class="text-sm text-(--pd-content-text)">
        A 1px guide line using <code>--pd-progressBar-hc-line-bg</code> is rendered behind the animated
        bar. In standard themes it is transparent. In high-contrast themes it becomes visible
        (white in HC Dark, black in HC Light) to ensure the bar track is perceivable.
      </div>
    </div>

    <div class="flex flex-col gap-2 rounded border border-(--pd-content-divider) p-3">
      <div class="text-xs font-semibold text-(--pd-content-header)">Reduced motion</div>

      <div class="text-sm text-(--pd-content-text)">
        When <code>prefers-reduced-motion: reduce</code> is active, the sweep animation is disabled
        entirely. The bar remains visible as a static filled indicator.
      </div>
    </div>
  </div>
{:else if args.kind === 'comparison'}
  <div class="flex flex-col gap-6">
    <div class="text-sm text-(--pd-content-text)">
      LinearProgress and ProgressBar serve different purposes. LinearProgress is a page-level
      indicator (full-width, thin, indeterminate-only). ProgressBar is a general-purpose component
      used in tables, status bars, and dialogs (configurable dimensions, supports determinate mode
      with percentage text).
    </div>

    <div class="grid grid-cols-1 gap-4">
      <div class="flex flex-col gap-2 rounded border border-(--pd-content-divider) p-4">
        <div class="text-xs font-semibold text-(--pd-content-header)">LinearProgress (page-level, indeterminate only)</div>

        <div class="py-2">
          <LinearProgress />
        </div>

        <code class="text-[10px] text-(--pd-content-text)">Full width, h-0.5 (2px), no rounded corners, no text</code>
      </div>

      <div class="flex flex-col gap-2 rounded border border-(--pd-content-divider) p-4">
        <div class="text-xs font-semibold text-(--pd-content-header)">ProgressBar - indeterminate (component-level)</div>

        <div class="py-2">
          <ProgressBar />
        </div>

        <code class="text-[10px] text-(--pd-content-text)">Configurable width (default w-36), h-2 (8px), rounded, no text</code>
      </div>

      <div class="flex flex-col gap-2 rounded border border-(--pd-content-divider) p-4">
        <div class="text-xs font-semibold text-(--pd-content-header)">ProgressBar - determinate (component-level)</div>

        <div class="py-2">
          <ProgressBar progress={65} />
        </div>

        <code class="text-[10px] text-(--pd-content-text)">Configurable width (default w-36), h-2 (8px), rounded, shows 65%</code>
      </div>
    </div>
  </div>
{:else}
  <LinearProgress {...args} />
{/if}`}}});var f=n(l,2);A(f,{name:`Comparison`,args:{kind:`comparison`},parameters:{__svelteCsf:{rawCode:`{#if args.kind === 'pageHeader'}
  <div class="flex flex-col gap-6">
    <div class="text-sm text-(--pd-content-text)">
      LinearProgress is used inside <code>Page.svelte</code> between the header and tab bar.
      It appears when the <code>inProgress</code> prop is set to <code>true</code>.
    </div>

    <div class="flex flex-col gap-2">
      <div class="text-xs font-semibold text-(--pd-content-header)">Active (inProgress=true)</div>

      <div class="rounded border border-(--pd-content-divider) overflow-hidden">
        <div class="flex flex-col bg-(--pd-content-bg)">
          <div class="flex flex-row items-center px-5 pt-4 pb-2">
            <div class="flex flex-col w-full">
              <div class="flex items-center text-sm text-(--pd-content-breadcrumb)">
                <span>Containers</span>
                <span class="mx-2">&gt;</span>
                <span class="font-extralight">Create a container</span>
              </div>
              <h1 class="text-xl font-bold text-(--pd-content-header) pt-1">Create a container</h1>
            </div>
          </div>

          <LinearProgress />

          <div class="flex flex-row px-2 border-b border-(--pd-content-divider)">
            <div class="px-4 py-2 text-sm text-(--pd-content-header) border-b-2 border-(--pd-content-header)">Details</div>
            <div class="px-4 py-2 text-sm text-(--pd-content-text)">Networking</div>
            <div class="px-4 py-2 text-sm text-(--pd-content-text)">Volumes</div>
          </div>

          <div class="p-5 text-sm text-(--pd-content-text) h-24">
            Tab content area
          </div>
        </div>
      </div>
    </div>

    <div class="flex flex-col gap-2">
      <div class="text-xs font-semibold text-(--pd-content-header)">Idle (inProgress=false)</div>

      <div class="rounded border border-(--pd-content-divider) overflow-hidden">
        <div class="flex flex-col bg-(--pd-content-bg)">
          <div class="flex flex-row items-center px-5 pt-4 pb-2">
            <div class="flex flex-col w-full">
              <div class="flex items-center text-sm text-(--pd-content-breadcrumb)">
                <span>Containers</span>
                <span class="mx-2">&gt;</span>
                <span class="font-extralight">Create a container</span>
              </div>
              <h1 class="text-xl font-bold text-(--pd-content-header) pt-1">Create a container</h1>
            </div>
          </div>

          <div class="flex flex-row px-2 border-b border-(--pd-content-divider)">
            <div class="px-4 py-2 text-sm text-(--pd-content-header) border-b-2 border-(--pd-content-header)">Details</div>
            <div class="px-4 py-2 text-sm text-(--pd-content-text)">Networking</div>
            <div class="px-4 py-2 text-sm text-(--pd-content-text)">Volumes</div>
          </div>

          <div class="p-5 text-sm text-(--pd-content-text) h-24">
            Tab content area
          </div>
        </div>
      </div>
    </div>
  </div>
{:else if args.kind === 'formPage'}
  <div class="flex flex-col gap-6">
    <div class="text-sm text-(--pd-content-text)">
      FormPage and EngineFormPage pass <code>inProgress</code> to <code>Page</code>, which renders
      LinearProgress. These pages are used for operations like deploying to Kubernetes, creating
      pods from containers, and running Kubernetes YAML files.
    </div>

    <div class="flex flex-col gap-2">
      <div class="text-xs font-semibold text-(--pd-content-header)">Deploy to Kubernetes (deploying)</div>

      <div class="rounded border border-(--pd-content-divider) overflow-hidden">
        <div class="flex flex-col bg-(--pd-content-bg)">
          <div class="flex flex-row items-center px-5 pt-4 pb-2">
            <div class="flex flex-col w-full">
              <div class="flex items-center text-sm text-(--pd-content-breadcrumb)">
                <span>Pods</span>
                <span class="mx-2">&gt;</span>
                <span class="font-extralight">Deploy generated pod to Kubernetes</span>
              </div>
              <h1 class="text-xl font-bold text-(--pd-content-header) pt-1">Deploy generated pod to Kubernetes</h1>
            </div>
          </div>

          <LinearProgress aria-label="Deploying pod to Kubernetes" />

          <div class="flex flex-row px-2 border-b border-(--pd-content-divider)"></div>

          <div class="p-5 text-sm text-(--pd-content-text) h-24">
            Form content area
          </div>
        </div>
      </div>
    </div>

    <div class="flex flex-col gap-2">
      <div class="text-xs font-semibold text-(--pd-content-header)">Create pods from YAML (running)</div>

      <div class="rounded border border-(--pd-content-divider) overflow-hidden">
        <div class="flex flex-col bg-(--pd-content-bg)">
          <div class="flex flex-row items-center px-5 pt-4 pb-2">
            <div class="flex flex-col w-full">
              <div class="flex items-center text-sm text-(--pd-content-breadcrumb)">
                <span>Pods</span>
                <span class="mx-2">&gt;</span>
                <span class="font-extralight">Create pods from a Kubernetes YAML file</span>
              </div>
              <h1 class="text-xl font-bold text-(--pd-content-header) pt-1">Create pods from a Kubernetes YAML file</h1>
            </div>
          </div>

          <LinearProgress aria-label="Creating pods from YAML" />

          <div class="flex flex-row px-2 border-b border-(--pd-content-divider)"></div>

          <div class="p-5 text-sm text-(--pd-content-text) h-24">
            Form content area
          </div>
        </div>
      </div>
    </div>
  </div>
{:else if args.kind === 'accessibility'}
  <div class="flex flex-col gap-4">
    <div class="text-sm text-(--pd-content-text)">
      The inner animated bar element uses <code>role="progressbar"</code> with <code>aria-valuemin</code>
      and <code>aria-valuemax</code>. Since LinearProgress is always indeterminate, <code>aria-valuenow</code>
      is never set. Additional ARIA props (e.g. <code>aria-label</code>) land on the outer wrapper via
      <code>restProps</code>. The animation respects <code>prefers-reduced-motion: reduce</code>.
    </div>

    <div class="grid grid-cols-2 gap-4">
      <div class="flex flex-col gap-2 rounded border border-(--pd-content-divider) p-3">
        <div class="text-xs font-semibold text-(--pd-content-header)">Default</div>

        <div class="py-2">
          <LinearProgress />
        </div>

        <code class="text-[10px] text-(--pd-content-text) break-all">role="progressbar" aria-valuemin="0" aria-valuemax="100"</code>
      </div>

      <div class="flex flex-col gap-2 rounded border border-(--pd-content-divider) p-3">
        <div class="text-xs font-semibold text-(--pd-content-header)">With aria-label</div>

        <div class="py-2">
          <LinearProgress aria-label="Loading page content" />
        </div>

        <code class="text-[10px] text-(--pd-content-text) break-all">aria-label="Loading page content" on wrapper</code>
      </div>
    </div>

    <div class="flex flex-col gap-2 rounded border border-(--pd-content-divider) p-3">
      <div class="text-xs font-semibold text-(--pd-content-header)">High-contrast guide line</div>

      <div class="text-sm text-(--pd-content-text)">
        A 1px guide line using <code>--pd-progressBar-hc-line-bg</code> is rendered behind the animated
        bar. In standard themes it is transparent. In high-contrast themes it becomes visible
        (white in HC Dark, black in HC Light) to ensure the bar track is perceivable.
      </div>
    </div>

    <div class="flex flex-col gap-2 rounded border border-(--pd-content-divider) p-3">
      <div class="text-xs font-semibold text-(--pd-content-header)">Reduced motion</div>

      <div class="text-sm text-(--pd-content-text)">
        When <code>prefers-reduced-motion: reduce</code> is active, the sweep animation is disabled
        entirely. The bar remains visible as a static filled indicator.
      </div>
    </div>
  </div>
{:else if args.kind === 'comparison'}
  <div class="flex flex-col gap-6">
    <div class="text-sm text-(--pd-content-text)">
      LinearProgress and ProgressBar serve different purposes. LinearProgress is a page-level
      indicator (full-width, thin, indeterminate-only). ProgressBar is a general-purpose component
      used in tables, status bars, and dialogs (configurable dimensions, supports determinate mode
      with percentage text).
    </div>

    <div class="grid grid-cols-1 gap-4">
      <div class="flex flex-col gap-2 rounded border border-(--pd-content-divider) p-4">
        <div class="text-xs font-semibold text-(--pd-content-header)">LinearProgress (page-level, indeterminate only)</div>

        <div class="py-2">
          <LinearProgress />
        </div>

        <code class="text-[10px] text-(--pd-content-text)">Full width, h-0.5 (2px), no rounded corners, no text</code>
      </div>

      <div class="flex flex-col gap-2 rounded border border-(--pd-content-divider) p-4">
        <div class="text-xs font-semibold text-(--pd-content-header)">ProgressBar - indeterminate (component-level)</div>

        <div class="py-2">
          <ProgressBar />
        </div>

        <code class="text-[10px] text-(--pd-content-text)">Configurable width (default w-36), h-2 (8px), rounded, no text</code>
      </div>

      <div class="flex flex-col gap-2 rounded border border-(--pd-content-divider) p-4">
        <div class="text-xs font-semibold text-(--pd-content-header)">ProgressBar - determinate (component-level)</div>

        <div class="py-2">
          <ProgressBar progress={65} />
        </div>

        <code class="text-[10px] text-(--pd-content-text)">Configurable width (default w-36), h-2 (8px), rounded, shows 65%</code>
      </div>
    </div>
  </div>
{:else}
  <LinearProgress {...args} />
{/if}`}}}),u(e,a),r()}var O,k,A,j,M,N,P,F,I,L,R,z,B,V,H;function U(){return(U=e((()=>{m(),v(),g(),C(),T(),y(),i(),b(),O=(e,r)=>{let i=()=>o(r?.(),[`_children`]);var s=c(),d=t(s),m=e=>{var t=j(),r=n(_(t),2),i=n(_(r),2),o=_(i),s=n(_(o),2);w(s,{}),a(4),f(o),f(i),f(r),a(2),f(t),u(e,t)},h=e=>{var t=M(),r=n(_(t),2),i=n(_(r),2),o=_(i),s=n(_(o),2);w(s,{"aria-label":`Deploying pod to Kubernetes`}),a(4),f(o),f(i),f(r);var c=n(r,2),l=n(_(c),2),d=_(l),p=n(_(d),2);w(p,{"aria-label":`Creating pods from YAML`}),a(4),f(d),f(l),f(c),f(t),u(e,t)},g=e=>{var t=N(),r=n(_(t),2),i=_(r),o=n(_(i),2),s=_(o);w(s,{}),f(o),a(2),f(i);var c=n(i,2),l=n(_(c),2),d=_(l);w(d,{"aria-label":`Loading page content`}),f(l),a(2),f(c),f(r),a(4),f(t),u(e,t)},v=e=>{var t=P(),r=n(_(t),2),i=_(r),o=n(_(i),2),s=_(o);w(s,{}),f(o),a(2),f(i);var c=n(i,2),l=n(_(c),2),d=_(l);E(d,{}),f(l),a(2),f(c);var p=n(c,2),m=n(_(p),2),h=_(m);E(h,{progress:65}),f(m),a(2),f(p),f(r),f(t),u(e,t)},y=e=>{w(e,l(i))};p(d,e=>{i().kind===`pageHeader`?e(m):i().kind===`formPage`?e(h,1):i().kind===`accessibility`?e(g,2):i().kind===`comparison`?e(v,3):e(y,-1)}),u(e,s)},k={component:w,render:O,title:`Progress/LinearProgress`,tags:[`autodocs`],argTypes:{class:{control:`text`,description:`Additional CSS classes on the wrapper element`},"aria-label":{control:`text`,description:`Accessible label for the progress indicator`},kind:{table:{disable:!0}}},parameters:{docs:{description:{component:'Stories for the `LinearProgress` component from `packages/ui`.\n\nA full-width, indeterminate linear progress indicator used in page headers\nto signal that an async operation is in progress. Unlike `ProgressBar`, this\ncomponent has no determinate mode, no percentage text, and always spans the\nfull container width at 2px height.\n\n**Usage**: Rendered inside `Page.svelte` when `inProgress` is `true`,\nappearing between the page header and the tab bar. Propagated through\n`FormPage` and `EngineFormPage` to pages like DeployPodToKube,\nPodCreateFromContainers, and KubePlayYAML.\n\n**Accessibility**: Uses `role="progressbar"` with `aria-valuemin` and\n`aria-valuemax`. Supports `prefers-reduced-motion` to disable animation.\nAdditional ARIA attributes (e.g. `aria-label`) are spread onto the outer\nwrapper element.\n\n**Theming**: Uses CSS custom properties `--pd-progressBar-bg`,\n`--pd-progressBar-in-progress-bg`, `--pd-progressBar-in-progress-border`,\nand `--pd-progressBar-hc-line-bg` from the color registry.'}}}},{Story:A}=x(k),j=s(`<div class="flex flex-col gap-6"><div class="text-sm text-(--pd-content-text)">LinearProgress is used inside <code>Page.svelte</code> between the header and tab bar.
        It appears when the <code>inProgress</code> prop is set to <code>true</code>.</div> <div class="flex flex-col gap-2"><div class="text-xs font-semibold text-(--pd-content-header)">Active (inProgress=true)</div> <div class="rounded border border-(--pd-content-divider) overflow-hidden"><div class="flex flex-col bg-(--pd-content-bg)"><div class="flex flex-row items-center px-5 pt-4 pb-2"><div class="flex flex-col w-full"><div class="flex items-center text-sm text-(--pd-content-breadcrumb)"><span>Containers</span> <span class="mx-2">&gt;</span> <span class="font-extralight">Create a container</span></div> <h1 class="text-xl font-bold text-(--pd-content-header) pt-1">Create a container</h1></div></div> <!> <div class="flex flex-row px-2 border-b border-(--pd-content-divider)"><div class="px-4 py-2 text-sm text-(--pd-content-header) border-b-2 border-(--pd-content-header)">Details</div> <div class="px-4 py-2 text-sm text-(--pd-content-text)">Networking</div> <div class="px-4 py-2 text-sm text-(--pd-content-text)">Volumes</div></div> <div class="p-5 text-sm text-(--pd-content-text) h-24">Tab content area</div></div></div></div> <div class="flex flex-col gap-2"><div class="text-xs font-semibold text-(--pd-content-header)">Idle (inProgress=false)</div> <div class="rounded border border-(--pd-content-divider) overflow-hidden"><div class="flex flex-col bg-(--pd-content-bg)"><div class="flex flex-row items-center px-5 pt-4 pb-2"><div class="flex flex-col w-full"><div class="flex items-center text-sm text-(--pd-content-breadcrumb)"><span>Containers</span> <span class="mx-2">&gt;</span> <span class="font-extralight">Create a container</span></div> <h1 class="text-xl font-bold text-(--pd-content-header) pt-1">Create a container</h1></div></div> <div class="flex flex-row px-2 border-b border-(--pd-content-divider)"><div class="px-4 py-2 text-sm text-(--pd-content-header) border-b-2 border-(--pd-content-header)">Details</div> <div class="px-4 py-2 text-sm text-(--pd-content-text)">Networking</div> <div class="px-4 py-2 text-sm text-(--pd-content-text)">Volumes</div></div> <div class="p-5 text-sm text-(--pd-content-text) h-24">Tab content area</div></div></div></div></div>`),M=s(`<div class="flex flex-col gap-6"><div class="text-sm text-(--pd-content-text)">FormPage and EngineFormPage pass <code>inProgress</code> to <code>Page</code>, which renders
        LinearProgress. These pages are used for operations like deploying to Kubernetes, creating
        pods from containers, and running Kubernetes YAML files.</div> <div class="flex flex-col gap-2"><div class="text-xs font-semibold text-(--pd-content-header)">Deploy to Kubernetes (deploying)</div> <div class="rounded border border-(--pd-content-divider) overflow-hidden"><div class="flex flex-col bg-(--pd-content-bg)"><div class="flex flex-row items-center px-5 pt-4 pb-2"><div class="flex flex-col w-full"><div class="flex items-center text-sm text-(--pd-content-breadcrumb)"><span>Pods</span> <span class="mx-2">&gt;</span> <span class="font-extralight">Deploy generated pod to Kubernetes</span></div> <h1 class="text-xl font-bold text-(--pd-content-header) pt-1">Deploy generated pod to Kubernetes</h1></div></div> <!> <div class="flex flex-row px-2 border-b border-(--pd-content-divider)"></div> <div class="p-5 text-sm text-(--pd-content-text) h-24">Form content area</div></div></div></div> <div class="flex flex-col gap-2"><div class="text-xs font-semibold text-(--pd-content-header)">Create pods from YAML (running)</div> <div class="rounded border border-(--pd-content-divider) overflow-hidden"><div class="flex flex-col bg-(--pd-content-bg)"><div class="flex flex-row items-center px-5 pt-4 pb-2"><div class="flex flex-col w-full"><div class="flex items-center text-sm text-(--pd-content-breadcrumb)"><span>Pods</span> <span class="mx-2">&gt;</span> <span class="font-extralight">Create pods from a Kubernetes YAML file</span></div> <h1 class="text-xl font-bold text-(--pd-content-header) pt-1">Create pods from a Kubernetes YAML file</h1></div></div> <!> <div class="flex flex-row px-2 border-b border-(--pd-content-divider)"></div> <div class="p-5 text-sm text-(--pd-content-text) h-24">Form content area</div></div></div></div></div>`),N=s(`<div class="flex flex-col gap-4"><div class="text-sm text-(--pd-content-text)">The inner animated bar element uses <code>role="progressbar"</code> with <code>aria-valuemin</code> and <code>aria-valuemax</code>. Since LinearProgress is always indeterminate, <code>aria-valuenow</code> is never set. Additional ARIA props (e.g. <code>aria-label</code>) land on the outer wrapper via <code>restProps</code>. The animation respects <code>prefers-reduced-motion: reduce</code>.</div> <div class="grid grid-cols-2 gap-4"><div class="flex flex-col gap-2 rounded border border-(--pd-content-divider) p-3"><div class="text-xs font-semibold text-(--pd-content-header)">Default</div> <div class="py-2"><!></div> <code class="text-[10px] text-(--pd-content-text) break-all">role="progressbar" aria-valuemin="0" aria-valuemax="100"</code></div> <div class="flex flex-col gap-2 rounded border border-(--pd-content-divider) p-3"><div class="text-xs font-semibold text-(--pd-content-header)">With aria-label</div> <div class="py-2"><!></div> <code class="text-[10px] text-(--pd-content-text) break-all">aria-label="Loading page content" on wrapper</code></div></div> <div class="flex flex-col gap-2 rounded border border-(--pd-content-divider) p-3"><div class="text-xs font-semibold text-(--pd-content-header)">High-contrast guide line</div> <div class="text-sm text-(--pd-content-text)">A 1px guide line using <code>--pd-progressBar-hc-line-bg</code> is rendered behind the animated
          bar. In standard themes it is transparent. In high-contrast themes it becomes visible
          (white in HC Dark, black in HC Light) to ensure the bar track is perceivable.</div></div> <div class="flex flex-col gap-2 rounded border border-(--pd-content-divider) p-3"><div class="text-xs font-semibold text-(--pd-content-header)">Reduced motion</div> <div class="text-sm text-(--pd-content-text)">When <code>prefers-reduced-motion: reduce</code> is active, the sweep animation is disabled
          entirely. The bar remains visible as a static filled indicator.</div></div></div>`),P=s(`<div class="flex flex-col gap-6"><div class="text-sm text-(--pd-content-text)">LinearProgress and ProgressBar serve different purposes. LinearProgress is a page-level
        indicator (full-width, thin, indeterminate-only). ProgressBar is a general-purpose component
        used in tables, status bars, and dialogs (configurable dimensions, supports determinate mode
        with percentage text).</div> <div class="grid grid-cols-1 gap-4"><div class="flex flex-col gap-2 rounded border border-(--pd-content-divider) p-4"><div class="text-xs font-semibold text-(--pd-content-header)">LinearProgress (page-level, indeterminate only)</div> <div class="py-2"><!></div> <code class="text-[10px] text-(--pd-content-text)">Full width, h-0.5 (2px), no rounded corners, no text</code></div> <div class="flex flex-col gap-2 rounded border border-(--pd-content-divider) p-4"><div class="text-xs font-semibold text-(--pd-content-header)">ProgressBar - indeterminate (component-level)</div> <div class="py-2"><!></div> <code class="text-[10px] text-(--pd-content-text)">Configurable width (default w-36), h-2 (8px), rounded, no text</code></div> <div class="flex flex-col gap-2 rounded border border-(--pd-content-divider) p-4"><div class="text-xs font-semibold text-(--pd-content-header)">ProgressBar - determinate (component-level)</div> <div class="py-2"><!></div> <code class="text-[10px] text-(--pd-content-text)">Configurable width (default w-36), h-2 (8px), rounded, shows 65%</code></div></div></div>`),F=s(`<!> <!> <!> <!> <!>`,1),D.__docgen={data:[],name:`LinearProgress.stories.svelte`},I=S(D,k),L=[`Basic`,`PageHeader`,`FormPage`,`Accessibility`,`Comparison`],R={...I.Basic,tags:[`svelte-csf-v5`]},z={...I.PageHeader,tags:[`svelte-csf-v5`]},B={...I.FormPage,tags:[`svelte-csf-v5`]},V={...I.Accessibility,tags:[`svelte-csf-v5`]},H={...I.Comparison,tags:[`svelte-csf-v5`]}})))()}U();export{V as Accessibility,R as Basic,H as Comparison,B as FormPage,z as PageHeader,L as __namedExportsOrder,k as default};