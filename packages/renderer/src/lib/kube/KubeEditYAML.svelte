<script lang="ts">
import MonacoEditor from '../editor/MonacoEditor.svelte';
import Button from '../ui/Button.svelte';
import Tooltip from '../ui/Tooltip.svelte';

// Make sure that when using the MonacoEditor, the content is "stringified" before
// being passed into this component. ex. stringify(kubeDeploymentYAML)
// this is the 'initial' content.
export let content = '';
let key = 0; // Initial key
let originalContent = '';
let editorContent: string;
let inProgress = false;

// Reactive statement to update originalContent only if it's blank and content is not
// as sometimes content is blank until it's "loaded". This does not work with onMount,
// so we use the reactive statement
$: if (originalContent === '' && content !== '') {
  originalContent = content;
}

// Handle the content change from the MonacoEditor / store it for us to use for applying to the cluster.
function handleContentChange(event: CustomEvent<string>) {
  editorContent = event.detail;
}

/////////////
// Buttons //
/////////////

// Function that will update content with originalContent
// when 'revertChanges' button is pressed.
async function revertChanges() {
  content = originalContent;
  key++; // Increment the key to force re-render
}

async function applyToCluster() {
  // Get the current context name
  let contextName = await window.kubernetesGetCurrentContextName();
  if (!contextName) {
    return;
  }

  try {
    inProgress = true;
    await window.kubernetesApplyResourcesFromYAML(contextName, editorContent);
    await window.showMessageBox({
      title: 'Kubernetes',
      type: 'info',
      message: 'Succesfully applied Kubernetes YAML',
      buttons: ['OK'],
    });
  } catch (error) {
    console.error('error playing kube file', error);
    await window.showMessageBox({
      title: 'Kubernetes',
      type: 'error',
      message: 'Could not apply Kubernetes YAML: ' + error,
      buttons: ['OK'],
    });
  } finally {
    inProgress = false;
  }
}
</script>

<div
  class="flex flex-row-reverse p-6 bg-transparent fixed bottom-0 right-0 mb-5 pr-10 max-h-20 bg-opacity-90 z-50"
  role="group"
  aria-label="Edit Buttons">
  <Tooltip tip="Apply the changes to the cluster, similar to 'kubectl apply'" topLeft="{true}">
    <Button type="primary" aria-label="Apply to cluster" on:click="{applyToCluster}" inProgress="{inProgress}"
      >Apply to cluster</Button>
  </Tooltip>
  <Tooltip tip="Revert the changes to the original content" topLeft="{true}">
    <Button type="secondary" aria-label="Revert changes" class="mr-2 opacity-100" on:click="{revertChanges}"
      >Revert edits</Button>
  </Tooltip>
</div>

<!-- We use key to force a re-render of the MonacoEditor component
    The reasoning is that MonacoEditor is complex and uses it's own rendering components
    and does not allow a way to reactively update the content externally. So we just re-render with the original content -->
{#key key}
  <MonacoEditor content="{content}" language="yaml" readOnly="{false}" on:contentChange="{handleContentChange}" />
{/key}
