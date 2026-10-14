<script lang="ts">
import type { IDisposable } from '@desktop-framework/api';
import type { KubernetesObject, V1Job } from '@kubernetes/client-node';
import { StatusIcon, Tab } from '@podman-desktop/ui-svelte';
import { onDestroy, onMount } from 'svelte';
import { router } from 'tinro';
import { stringify } from 'yaml';

import MonacoEditor from '/@/lib/editor/MonacoEditor.svelte';
import JobIcon from '/@/lib/images/JobIcon.svelte';
import KubeEditYAML from '/@/lib/kube/KubeEditYAML.svelte';
import { listenResource } from '/@/lib/kube/resource-listen';
import DetailsPage from '/@/lib/ui/DetailsPage.svelte';
import StateChange from '/@/lib/ui/StateChange.svelte';
import { getTabUrl, isTabSelected } from '/@/lib/ui/Util';
import Route from '/@/Route.svelte';
import { kubernetesCurrentContextJobs } from '/@/stores/kubernetes-contexts-state';

import { JobUtils } from './job-utils';
import JobActions from './JobActions.svelte';
import JobDetailsSummary from './JobDetailsSummary.svelte';
import type { JobUI } from './JobUI';

interface Props {
  name: string;
  namespace: string;
}
let { name, namespace }: Props = $props();

let job = $state<JobUI | undefined>();
let detailsPage = $state<DetailsPage | undefined>();
let kubeJob = $state<V1Job | undefined>();
let kubeError = $state<string | undefined>();

let listener: IDisposable | undefined;

onMount(async () => {
  const jobUtils = new JobUtils();
  listener = await listenResource({
    resourceName: 'jobs',
    name,
    namespace,
    listenEvents: false,
    legacyResourceStore: kubernetesCurrentContextJobs,
    onResourceNotFound: () => {
      if (detailsPage) {
        // the job has been deleted
        detailsPage.close();
      }
    },
    onResourceUpdated: (resource: KubernetesObject, isExperimental: boolean) => {
      job = jobUtils.getJobUI(resource);
      if (isExperimental) {
        kubeJob = resource;
      } else {
        loadDetails().catch((err: unknown) => console.error(`Error getting Job details ${name}`, err));
      }
    },
  });
});

onDestroy(() => {
  listener?.dispose();
});

async function loadDetails(): Promise<void> {
  const getKubeJob = await window.kubernetesReadNamespacedJob(name, namespace);
  if (getKubeJob) {
    kubeJob = getKubeJob;
  } else {
    kubeError = `Unable to retrieve Kubernetes details for ${name}`;
  }
}
</script>

{#if job}
  <DetailsPage title={job.name} subtitle={job.namespace} bind:this={detailsPage}>
    {#snippet iconSnippet()}
      {#if job}<StatusIcon icon={JobIcon} size={24} status={job.status} />{/if}
    {/snippet}
    {#snippet actionsSnippet()}
      {#if job}<JobActions job={job} detailed={true} />{/if}
    {/snippet}
    {#snippet detailSnippet()}
      {#if job}
        <div class="flex py-2 w-full justify-end text-sm text-[var(--pd-content-text)]">
          <StateChange state={job.status} />
        </div>
      {/if}
    {/snippet}
    {#snippet tabsSnippet()}
      <Tab title="Summary" selected={isTabSelected($router.path, 'summary')} url={getTabUrl($router.path, 'summary')} />
      <Tab title="Inspect" selected={isTabSelected($router.path, 'inspect')} url={getTabUrl($router.path, 'inspect')} />
      <Tab title="Kube" selected={isTabSelected($router.path, 'kube')} url={getTabUrl($router.path, 'kube')} />
    {/snippet}
    {#snippet contentSnippet()}
      <Route path="/summary" breadcrumb="Summary" navigationHint="tab">
        <JobDetailsSummary job={kubeJob} kubeError={kubeError} />
      </Route>
      <Route path="/inspect" breadcrumb="Inspect" navigationHint="tab">
        <MonacoEditor content={JSON.stringify(kubeJob, undefined, 2)} language="json" />
      </Route>
      <Route path="/kube" breadcrumb="Kube" navigationHint="tab">
        <KubeEditYAML content={stringify(kubeJob)} />
      </Route>
    {/snippet}
  </DetailsPage>
{/if}
