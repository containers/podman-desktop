<script lang="ts">
import { CloseButton, Dropdown, Modal } from '@podman-desktop/ui-svelte';

import type { FeedbackCategory } from '/@api/feedback';

import DevelopersFeedback from './feedbackForms/DevelopersFeedback.svelte';
import GitHubIssueFeedback from './feedbackForms/GitHubIssueFeedback.svelte';

let displayModal = false;
const DEFAULT_CATEGORY: FeedbackCategory = 'developers';
let category: FeedbackCategory = DEFAULT_CATEGORY;
let hasContent: boolean = false;

const FEEDBACK_CATEGORIES = new Map<FeedbackCategory, string>([
  ['developers', '💬 Direct your words to the developers'],
  ['feature', '🚀 Feature request'],
  ['bug', '🪲 Bug'],
]);

window.events?.receive('display-feedback', () => {
  displayModal = true;
});

function closeModal(): void {
  displayModal = false;
  // reset fields
  category = DEFAULT_CATEGORY;
}

async function hideModal(): Promise<void> {
  // If all of the form fields are empty/ in default state dont show the dialog
  if (!hasContent) {
    closeModal();
    return;
  }

  const result = await window.showMessageBox({
    title: 'Close Feedback form',
    message: 'Do you want to close the Feedback form?\nClosing will erase your input.',
    type: 'warning',
    buttons: ['Yes', 'No'],
  });

  if (result && result.response === 0) {
    closeModal();
    hasContent = false;
  }
}

function handleUpdate(e: boolean): void {
  hasContent = !hasContent && e;
}
</script>

{#if displayModal}
<div class='z-40'>
  <Modal name="Share your feedback" on:close={hideModal}>
    <div class="flex items-center justify-between pl-4 pr-3 py-3 space-x-2 text-[var(--pd-modal-header-text)]">
      <h1 class="grow text-lg font-bold capitalize">Share your feedback</h1>

      <CloseButton on:click={hideModal} />
    </div>

    <div class="relative text-[var(--pd-modal-text)] px-10 pt-4">
      <label for="category" class="block mb-2 text-sm font-medium text-[var(--pd-modal-text)]">Category</label>
      <Dropdown name="category" bind:value={category}
      options={Array.from(FEEDBACK_CATEGORIES).map(e => ({ value: e[0], label: e[1] }))}>
      </Dropdown>
    </div>

    {#if category === 'developers'}
      <DevelopersFeedback onCloseForm={hideModal} contentChange={handleUpdate}/>
    {:else if category === 'bug'}
      <GitHubIssueFeedback onCloseForm={hideModal} category="bug" contentChange={handleUpdate}/>
    {:else if category === 'feature'}
      <GitHubIssueFeedback onCloseForm={hideModal} category="feature" contentChange={handleUpdate}/>
    {/if}
  </Modal>
</div>
{/if}
