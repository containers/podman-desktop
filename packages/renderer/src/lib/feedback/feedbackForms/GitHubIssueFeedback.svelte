<script lang="ts">
import { Button, ErrorMessage, Link } from '@podman-desktop/ui-svelte';

import FeedbackForm from '/@/lib/feedback/FeedbackForm.svelte';

let issueTitle = '';
let issueDescription = '';
let issueValidaionError = '';

$: if (!issueTitle) {
  if (!issueDescription) {
    issueValidaionError = 'Please enter bug title and description';
  } else {
    issueValidaionError = 'Please enter bug title';
  }
} else {
  if (!issueDescription) {
    issueValidaionError = 'Please enter bug description';
  }
}

export let onCloseForm = () => {};

async function openGitHubIssues(): Promise<void> {
  onCloseForm();
  await window.openExternal('https://github.com/containers/podman-desktop/issues');
}
</script>

<FeedbackForm>
  <svelte:fragment slot="content">
    <div class="text-sm text-[var(--pd-state-warning)]">You can search existing issues on <Link aria-label="GitHub issues" onclick={openGitHubIssues}>github.com/containers/podman-desktop/issues</Link></div>
    <label for="issueTitle" class="block mt-4 mb-2 text-sm font-medium text-[var(--pd-modal-text)]">Title</label>
    <input type="text" name="issueTitle" id="issueTitle" bind:value={issueTitle} data-testid="issueTitle" placeholder="Bug Report Title" class="w-full p-2 outline-none text-sm bg-[var(--pd-input-field-focused-bg)] rounded-sm text-[var(--pd-input-field-focused-text)] placeholder-[var(--pd-input-field-placeholder-text)]"/>
    <label for="issueDescription" class="block mt-4 mb-2 text-sm font-medium text-[var(--pd-modal-text)]"
      >Description</label>
    <textarea
      rows="3"
      maxlength="1000"
      name="issueDescription"
      id="issueDescription"
      data-testid="issueDescription"
      bind:value={issueDescription}
      class="w-full p-2 outline-none text-sm bg-[var(--pd-input-field-focused-bg)] rounded-sm text-[var(--pd-input-field-focused-text)] placeholder-[var(--pd-input-field-placeholder-text)]"
      placeholder="Bug Description"></textarea>

  </svelte:fragment>
  <svelte:fragment slot="validation">
    {#if !issueTitle || !issueDescription}
      <ErrorMessage class="text-xs" error={issueValidaionError}/>
    {/if}
  </svelte:fragment>
  <svelte:fragment slot="buttons">
    <Button class="underline" type="link" aria-label="Cancel" on:click={() => onCloseForm()}>Cancel</Button>
    <Button aria-label="Preview on GitHub" on:click={() => openGitHubIssues()} disabled={!issueTitle || !issueDescription}>Preview on GitHub</Button>
  </svelte:fragment>
</FeedbackForm>
