<script lang="ts">
import { Button, Checkbox, ErrorMessage, Link } from '@podman-desktop/ui-svelte';

import FeedbackForm from '/@/lib/feedback/FeedbackForm.svelte';
import type { FeedbackCategory, GitHubIssue } from '/@api/feedback';

interface Props {
  onCloseForm: () => void;
  category: FeedbackCategory;
  contentChange: (e: boolean) => void;
}

let { onCloseForm = () => {}, category = 'bug', contentChange }: Props = $props();

let issueTitle = $state('');
let issueDescription = $state('');
let includeSystemInfo: boolean = $state(true); // default to true
let includeExtensionInfo: boolean = $state(true); // default to true

let issueValidationError = $derived.by(() => {
  if (!issueTitle) {
    if (!issueDescription) {
      return `Please enter ${category} ${category === 'bug' ? 'title' : 'name'} and description`;
    } else {
      return `Please enter ${category} ${category === 'bug' ? 'title' : 'name'}`;
    }
  } else {
    if (!issueDescription) {
      return `Please enter ${category} description`;
    }
    return '';
  }
});

let titlePlaceholder = $state(category === 'bug' ? 'Bug Report Title' : 'Feature name');
let descriptionPlaceholder = $state(category === 'bug' ? 'Bug description' : 'Feature description');
let existingIssuesLink = $state(
  category === 'bug'
    ? 'https://github.com/podman-desktop/podman-desktop/issues?q=label%3A%22kind%2Fbug%20%F0%9F%90%9E%22'
    : 'https://github.com/podman-desktop/podman-desktop/issues?q=label%3A%22kind%2Ffeature%20%F0%9F%92%A1%22',
);

$effect(() => contentChange(Boolean(issueTitle || issueDescription)));

async function openGitHubIssues(): Promise<void> {
  onCloseForm();
  await window.openExternal(existingIssuesLink);
}

async function previewOnGitHub(): Promise<void> {
  const issueProperties: GitHubIssue = {
    category: $state.snapshot(category),
    title: $state.snapshot(issueTitle),
    description: $state.snapshot(issueDescription),
    includeSystemInfo: $state.snapshot(includeSystemInfo),
    includeExtensionInfo: $state.snapshot(includeExtensionInfo),
  };
  try {
    await window.previewOnGitHub(issueProperties);
    onCloseForm();
  } catch (error: unknown) {
    console.error('There was a problem with preview on GitHub', error);
  }
}
</script>

<FeedbackForm>
  <svelte:fragment slot="content">
    <div class="text-sm text-[var(--pd-state-warning)]">You can search existing {category} issues on <Link aria-label="GitHub issues" onclick={openGitHubIssues}>github.com/podman-desktop/podman-desktop/issues</Link></div>
    <!-- issue title -->
    <label for="issueTitle" class="block mt-4 mb-2 text-sm font-medium text-[var(--pd-modal-text)]">Title</label>
    <input
      type="text"
      name="issueTitle"
      id="issueTitle"
      aria-label="Issue Title"
      bind:value={issueTitle}
      placeholder={titlePlaceholder}
      class="w-full p-2 outline-none text-sm bg-[var(--pd-input-field-focused-bg)] rounded-sm text-[var(--pd-input-field-focused-text)] placeholder-[var(--pd-input-field-placeholder-text)]"/>

    <!-- issue body -->
    <label for="issueDescription" class="block mt-4 mb-2 text-sm font-medium text-[var(--pd-modal-text)]"
      >Description</label>
    <textarea
      rows="3"
      maxlength="1000"
      name="issueDescription"
      aria-label="Issue Description"
      id="issueDescription"
      bind:value={issueDescription}
      class="w-full p-2 outline-none text-sm bg-[var(--pd-input-field-focused-bg)] rounded-sm text-[var(--pd-input-field-focused-text)] placeholder-[var(--pd-input-field-placeholder-text)]"
      placeholder={descriptionPlaceholder}></textarea>

    <!-- additional form content for bug category -->
    {#if category === 'bug'}
      <div class="flex flex-row align-items items-center mt-2">
        <Checkbox
          title="Include system information"
          bind:checked={includeSystemInfo} />
        <div>Include system information (os, architecture etc.)</div>
      </div>
      <div class="flex flex-row align-items items-center mt-2">
        <Checkbox
          title="Include enabled extensions"
          bind:checked={includeExtensionInfo} />
        <div>Include enabled extensions</div>
      </div>
    {/if}
  </svelte:fragment>
  <svelte:fragment slot="validation">
    {#if !issueTitle || !issueDescription}
      <ErrorMessage class="text-xs" error={issueValidationError}/>
    {/if}
  </svelte:fragment>
  <svelte:fragment slot="buttons">
    <Button class="underline" type="link" aria-label="Cancel" on:click={() => onCloseForm()}>Cancel</Button>
    <Button aria-label="Preview on GitHub" on:click={previewOnGitHub} disabled={!issueTitle || !issueDescription}>Preview on GitHub</Button>
  </svelte:fragment>
</FeedbackForm>
