<script lang="ts">
import type { FeedbackCategory } from '@desktop-framework/api';
import { Button, CloseButton, Dropdown, Link, Modal } from '@podman-desktop/ui-svelte';
import { onMount } from 'svelte';
import { SvelteMap } from 'svelte/reactivity';

import FeedbackForm from '/@/lib/feedback/FeedbackForm.svelte';

import DirectFeedback from './feedbackForms/DirectFeedback.svelte';
import GitHubIssueFeedback from './feedbackForms/GitHubIssueFeedback.svelte';

let displayModal = $state(false);
const DEFAULT_CATEGORY: FeedbackCategory = 'developers';
let category: FeedbackCategory = $state(DEFAULT_CATEGORY);
let hasContent: boolean = false;
let categoryGitHubLinks: { [category: string]: string } | undefined = $state({});
let feedbackLinks: { [category: string]: string } = $state({});

const feedbackCategories = new SvelteMap<FeedbackCategory, string>([
  ['developers', '💬 Direct your words to the developers'],
  ['design', '🎨 User experience or design thoughts'],
]);

window.events?.receive('display-feedback', () => {
  displayModal = true;
});

function closeModal(): void {
  displayModal = false;
  // reset fields
  category = DEFAULT_CATEGORY;
}

async function hideModal(confirm = true): Promise<void> {
  // If all of the form fields are empty/ in default state dont show the dialog
  if (!hasContent || !confirm) {
    closeModal();
    // reset
    hasContent = false;
    return;
  }

  const result = await window.showMessageBox({
    title: 'Close Feedback Form?',
    message: 'Do you want to close the Feedback form?\nClosing will erase your input.',
    type: 'warning',
    buttons: ['Close', 'Cancel'],
  });

  if (result?.response === 'Close') {
    closeModal();
    hasContent = false;
  }
}

function handleUpdate(e: boolean): void {
  hasContent = e;
}

onMount(async () => {
  categoryGitHubLinks = await window.getGitHubFeedbackLinks();
  if (categoryGitHubLinks && (categoryGitHubLinks.feature || categoryGitHubLinks.bug)) {
    if (categoryGitHubLinks.feature) {
      feedbackCategories.set('feature', '🚀 Feature request');
    }
    if (categoryGitHubLinks.bug) {
      feedbackCategories.set('bug', '🪲 Bug');
    }
  } else {
    feedbackLinks = (await window.getFeedbackLinks()) ?? {};
    if (Object.keys(feedbackLinks).length > 0) {
      feedbackCategories.set('other', '❓ Other');
    }
  }
});
</script>

{#if displayModal}
<div class='z-40'>
  <Modal name="Share your feedback" onclose={(): Promise<void> => hideModal()} ignoreFocusOut={true}>
    <div class="flex items-center justify-between pl-4 pr-3 py-3 space-x-2 text-[var(--pd-modal-header-text)]">
      <h1 class="grow text-lg font-bold capitalize">Share your feedback</h1>
      <CloseButton onclick={(): Promise<void> => hideModal()} />
    </div>

    <div class="relative text-[var(--pd-modal-text)] px-10 pt-4">
      <label for="category" class="block mb-2 text-sm font-medium text-[var(--pd-modal-text)]">Category</label>
      <Dropdown name="category" bind:value={category}
      options={Array.from(feedbackCategories).map(e => ({ value: e[0], label: e[1] }))}>
      </Dropdown>
    </div>

    {#if category === 'developers' || category === 'design'}
      <DirectFeedback onCloseForm={hideModal} category={category} contentChange={handleUpdate}/>
    {:else if category === 'bug' || category === 'feature'}
      <GitHubIssueFeedback onCloseForm={hideModal} category={category} categoryLinks={categoryGitHubLinks} contentChange={handleUpdate}/>
    {:else if category === 'other'}
      <FeedbackForm>
        <svelte:fragment slot="content">
          <p class="block mt-4 mb-4 text-sm font-medium text-[var(--pd-modal-text)]">Could not find the right category? Take a look at these additional options:</p>
          {#each Object.entries(feedbackLinks) as [category, link] (category)}
            <Link aria-label={`${category} link`} class="block mt-1" onclick={(): Promise<void> => window.openExternal(link)}>{category}</Link>
          {/each}
        </svelte:fragment>
        <svelte:fragment slot="buttons">
          <Button class="underline" type="link" aria-label="Cancel" onclick={hideModal}>Cancel</Button>
        </svelte:fragment>
      </FeedbackForm>
    {/if}
  </Modal>
</div>
{/if}
