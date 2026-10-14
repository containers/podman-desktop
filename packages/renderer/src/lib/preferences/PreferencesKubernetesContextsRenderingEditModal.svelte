<script lang="ts">
import type { KubeContext } from '@desktop-framework/api';
import type { Cluster, User } from '@kubernetes/client-node';
import { Button, Dropdown, ErrorMessage, Input } from '@podman-desktop/ui-svelte';
import { onMount } from 'svelte';
import { router } from 'tinro';

import Dialog from '/@/lib/dialogs/Dialog.svelte';
import { kubernetesContexts } from '/@/stores/kubernetes-contexts';

interface Props {
  detailed?: boolean;
  contextToEdit: KubeContext;
  closeCallback: () => void;
}

let { detailed = false, contextToEdit, closeCallback }: Props = $props();

let contextName = $state('');
let contextNamespace = $state('');
let contextCluster = $state('');
let contextUser = $state('');

let contextNameErrorMessage = $state('');
let contextNamespaceErrorMessage = $state('');

let contexts: KubeContext[] = $state($kubernetesContexts);
let users: User[] | undefined = $state();
let clusters: Cluster[] | undefined = $state();
let kubeConfig = $state('~/.kube/config');

$effect(() => {
  const context = contexts?.find(ctx => ctx.name === contextName);
  // Show error when is the new name identical with any other context name in the kubeConfig
  if (context && context.name !== contextToEdit.name) {
    contextNameErrorMessage = `This context name already exists in ${kubeConfig}`;
  } else {
    contextNameErrorMessage = contextName === '' ? 'Please enter a value' : '';
  }
});

onMount(async () => {
  contextName = contextToEdit.name;
  contextNamespace = contextToEdit.namespace ?? '';
  contextCluster = contextToEdit.cluster;
  contextUser = contextToEdit.user;
  clusters = await window.kubernetesGetClusters();
  users = await window.kubernetesGetUsers();
  kubeConfig = (await window.getConfigurationValue('kubernetes.Kubeconfig')) ?? kubeConfig;
});

function disableSave(name: string, namespace: string): boolean {
  // Name is invalid when:
  // 1. is empty
  // 2. is default value (without change)
  // 3. current name is same as other context name in kubeconfig
  const invalidName =
    name.trim() === '' || contexts?.find(ctx => ctx.name === contextName) !== undefined || name === contextToEdit.name;
  const invalidNamespace = namespace === (contextToEdit.namespace ?? '');
  const invalidCluster = contextCluster === contextToEdit.cluster;
  const invalidUser = contextUser === contextToEdit.user;
  return invalidName && invalidNamespace && invalidCluster && invalidUser;
}

async function editContext(
  contextName: string,
  contextNamespace: string,
  contextUser: string,
  contextCluster: string,
): Promise<void> {
  try {
    await window.kubernetesUpdateContext(
      contextToEdit.name,
      contextName,
      contextNamespace,
      contextCluster,
      contextUser,
    );
    closeCallback();
  } catch (error: unknown) {
    contextNameErrorMessage =
      error && typeof error === 'object' && 'message' in error && error.message ? String(error.message) : String(error);
  }

  if (detailed) {
    router.goto('/preferences/kubernetes-contexts');
  }
}

function onClusterStateChange(key: unknown): void {
  const entry = clusters?.find(val => val.name === key);
  if (entry) {
    contextCluster = entry.name;
  }
}

function onUserStateChange(key: unknown): void {
  const entry = users?.find(val => val.name === key);
  if (entry) {
    contextUser = entry.name;
  }
}
</script>

<Dialog
    title="Edit Context"
    onclose={closeCallback}>
    {#snippet content()}
    <div  class="w-full">
      <label for="contextName" class="block my-2 text-sm font-bold text-[var(--pd-modal-text)]">Name</label>
      <Input
          bind:value={contextName}
          name="contextName"
          id="contextName"
          placeholder="Enter context name (e.g. kind-context-name-1)"
          aria-invalid={contextNameErrorMessage !== ''}
          aria-label="contextName"
          required />
      {#if contextNameErrorMessage}
          <ErrorMessage error={contextNameErrorMessage} />
      {/if}

      <label for="contextCluster" class="block my-2 text-sm font-bold text-[var(--pd-modal-text)]">Cluster</label>
      <Dropdown
        class="text-sm"
        id="contextCluster"
        onChange={onClusterStateChange}
        value={contextCluster}
        options={clusters?.map((cluster) => ({
          value: cluster.name,
          label: cluster.name,
        }))}>
      </Dropdown>

      <label for="contextUser" class="block my-2 text-sm font-bold text-[var(--pd-modal-text)]">User</label>
      <Dropdown
        class="text-sm"
        id="contextUser"
        onChange={onUserStateChange}
        value={contextUser}
        options={users?.map((user) => ({
          value: user.name,
          label: user.name,
        }))}>
      </Dropdown>

      <label for="contextNamespace" class="block my-2 text-sm font-bold text-[var(--pd-modal-text)]">Namespace</label>
      <Input
          bind:value={contextNamespace}
          name="contextNamespace"
          id="contextNamespace"
          placeholder="Enter context namespace (e.g. production)"
          aria-invalid={contextNamespaceErrorMessage !== ''}
          aria-label="contextNamespace"
          required />
      {#if contextNamespaceErrorMessage}
          <ErrorMessage error={contextNamespaceErrorMessage} />
      {/if}
      </div>
  {/snippet}
    {#snippet buttons()}
  
      <Button
          class="pcol-start-3"
          type="link"
          on:click={closeCallback}>Cancel</Button>
      <Button
          class="col-start-4"
          type="primary"
          disabled={disableSave(contextName, contextNamespace)}
          on:click={async (): Promise<void> => {
          await editContext(contextName, contextNamespace, contextUser, contextCluster);
          }}>Save</Button>
      
  {/snippet}
</Dialog>
