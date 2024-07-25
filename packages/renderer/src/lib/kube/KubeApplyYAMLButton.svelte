<script lang="ts">
import type { KubernetesObject } from '@kubernetes/client-node';
import { Button } from '@podman-desktop/ui-svelte';

import SolidKubeIcon from '../images/SolidKubeIcon.svelte';

let inProgress = false;

async function kubeApply(): Promise<void> {
  let contextName = await window.kubernetesGetCurrentContextName();
  if (!contextName) {
    return;
  }

  const result = await window.openDialog({
    title: 'Select a .yaml file to apply',
    filters: [
      {
        name: 'YAML files',
        extensions: ['yaml', 'yml'],
      },
    ],
  });
  if (result?.length !== 1) {
    return;
  }

  let file = result[0];
  if (!file) {
    return;
  }

  inProgress = true;
  try {
    const namespace = await window.kubernetesGetCurrentNamespace();
    let objects: KubernetesObject[] = await window.kubernetesApplyResourcesFromFile(contextName, file, namespace);
    if (objects.length === 0) {
      await window.showMessageBox({
        title: 'Kubernetes',
        type: 'warning',
        message: `No resource(s) were applied`,
        buttons: ['OK'],
      });
    } else {
      await window.showMessageBox({
        title: 'Kubernetes',
        type: 'info',
        message: `Successfully applied ${objects.length} resource(s)`,
        buttons: ['OK'],
      });
    }
  } catch (error) {
    await window.showMessageBox({
      title: 'Kubernetes',
      type: 'error',
      message: 'Could not apply Kubernetes YAML: ' + error,
      buttons: ['OK'],
    });
  }
  inProgress = false;
}
</script>

<Button on:click={() => kubeApply()} title="Apply YAML" icon={SolidKubeIcon} inProgress={inProgress}>Apply YAML</Button>
