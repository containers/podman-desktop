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
    selectors: ['openFile', 'multiSelections'],
    filters: [
      {
        name: 'YAML files',
        extensions: ['yaml', 'yml', 'YAML', 'YML'],
      },
    ],
  });

  if (!result || result.length === 0) {
    return;
  }

  inProgress = true;
  try {
    const namespace = await window.kubernetesGetCurrentNamespace();
    let objects: KubernetesObject[] = await window.kubernetesApplyResourcesFromFile(contextName, result, namespace);
    if (objects.length === 0) {
      await window.showMessageBox({
        title: 'Kubernetes',
        type: 'warning',
        message: `No resource(s) were applied.`,
        buttons: ['OK'],
      });
    } else if (objects.length === 1) {
      await window.showMessageBox({
        title: 'Kubernetes',
        type: 'info',
        message: `Successfully applied 1 ${objects[0].kind ?? 'unknown resource'}.`,
        buttons: ['OK'],
      });
    } else {
      const counts = objects.reduce(
        (acc, obj) => {
          acc[obj.kind ?? 'unknown'] = (acc[obj.kind ?? 'unknown'] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>,
      );
      const resources = Object.entries(counts)
        .map(obj => `${obj[1]} ${obj[0]}`)
        .join(', ');

      await window.showMessageBox({
        title: 'Kubernetes',
        type: 'info',
        message: `Successfully applied ${objects.length} resources (${resources}).`,
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
