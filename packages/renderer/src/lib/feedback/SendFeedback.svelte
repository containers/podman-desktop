<script lang="ts">
import {
  faFrown,
  faGrinStars,
  faHeart,
  faMeh,
  faQuestionCircle,
  faSmile,
  faStar,
} from '@fortawesome/free-solid-svg-icons';
import { Button, ErrorMessage, Link } from '@podman-desktop/ui-svelte';
import Fa from 'svelte-fa';

import type { FeedbackProperties } from '../../../../preload/src/index';
import Dialog from '../dialogs/Dialog.svelte';
import WarningMessage from '../ui/WarningMessage.svelte';

let displayModal = false;

// feedback of the user
let smileyRating = 0;
let tellUsWhyFeedback = '';
let contactInformation = '';

$: hasFeedback =
  (tellUsWhyFeedback && tellUsWhyFeedback.trim().length > 4) ||
  (contactInformation && contactInformation.trim().length > 4);

window.events?.receive('display-feedback', () => {
  displayModal = true;
});

function hideModal(): void {
  displayModal = false;

  // reset fields
  smileyRating = 0;
  tellUsWhyFeedback = '';
  contactInformation = '';
}

function selectSmiley(item: number): void {
  smileyRating = item;
}

async function sendFeedback(): Promise<void> {
  const properties: FeedbackProperties = {
    rating: smileyRating,
  };

  if (tellUsWhyFeedback) {
    properties.comment = tellUsWhyFeedback;
  }

  if (contactInformation) {
    properties.contact = contactInformation;
  }

  // send
  await window.sendFeedback(properties);
  // close the modal
  hideModal();
}

async function openGitHub(): Promise<void> {
  hideModal();
  await window.telemetryTrack('feedback.openGitHub');
  await window.openExternal('https://github.com/containers/podman-desktop');
}
</script>

{#if displayModal}
  <Dialog title="Share your feedback" on:close={() => hideModal()}>
    <svelte:fragment slot="content">
      <label for="smiley" class="block mb-2 text-sm font-medium text-[var(--pd-modal-text)]"
        >How was your experience with Podman Desktop?</label>
      <div class="flex space-x-4">
        <button aria-label="very-sad-smiley" on:click={() => selectSmiley(1)}>
          <Fa
            size="1.5x"
            class="cursor-pointer {smileyRating === 1
              ? 'text-[var(--pd-button-primary-bg)]'
              : 'text-[var(--pd-button-disabled-text)]'}"
            icon={faFrown} />
        </button>
        <button aria-label="sad-smiley" on:click={() => selectSmiley(2)}>
          <Fa
            size="1.5x"
            class="cursor-pointer {smileyRating === 2
              ? 'text-[var(--pd-button-primary-bg)]'
              : 'text-[var(--pd-button-disabled-text)]'}"
            icon={faMeh} />
        </button>
        <button aria-label="happy-smiley" on:click={() => selectSmiley(3)}>
          <Fa
            size="1.5x"
            class="cursor-pointer {smileyRating === 3
              ? 'text-[var(--pd-button-primary-bg)]'
              : 'text-[var(--pd-button-disabled-text)]'}"
            icon={faSmile} />
        </button>
        <button aria-label="very-happy-smiley" on:click={() => selectSmiley(4)}>
          <Fa
            size="1.5x"
            class="cursor-pointer {smileyRating === 4
              ? 'text-[var(--pd-button-primary-bg)]'
              : 'text-[var(--pd-button-disabled-text)]'}"
            icon={faGrinStars} />
        </button>
      </div>

      <label for="tellUsWhyFeedback" class="block mt-4 mb-2 text-sm font-medium text-[var(--pd-modal-text)]"
        >Tell us why, or share any suggestion or issue to improve your experience: ({1000 - tellUsWhyFeedback.length} characters
        left)</label>
      <textarea
        rows="3"
        maxlength="1000"
        name="tellUsWhyFeedback"
        id="tellUsWhyFeedback"
        data-testid="tellUsWhyFeedback"
        bind:value={tellUsWhyFeedback}
        class="w-full p-2 outline-none text-sm bg-[var(--pd-input-field-focused-bg)] rounded-sm text-[var(--pd-input-field-focused-text)] placeholder-[var(--pd-input-field-placeholder-text)]"
        placeholder="Please enter your feedback here, we appreciate and review all comments"></textarea>

      <label for="contactInformation" class="block mt-4 mb-2 text-sm font-medium text-[var(--pd-modal-text)]"
        >Share your contact information if you'd like us to answer you:</label>
      <input
        type="email"
        name="contactInformation"
        id="contactInformation"
        bind:value={contactInformation}
        placeholder="Enter email address, or leave blank for anonymous feedback"
        class="w-full p-2 outline-none text-sm bg-[var(--pd-input-field-focused-bg)] rounded-sm text-[var(--pd-input-field-focused-text)] placeholder-[var(--pd-input-field-placeholder-text)]" />
    </svelte:fragment>
    <svelte:fragment slot="validation">
      {#if smileyRating === 0}
        <ErrorMessage class="text-xs" error="Please select an experience smiley" />
      {:else if smileyRating === 1 && !hasFeedback}
        <ErrorMessage class="text-xs" error="Please share contact info or details on how we can improve" />
      {:else if smileyRating === 2 && !hasFeedback}
        <WarningMessage class="text-xs" error="We would really appreciate knowing how we can improve" />
      {:else if smileyRating > 2}
        <div class="text-[var(--pd-modal-text)] p-1 flex flex-row items-center text-xs">
          <Fa size="1.125x" class="cursor-pointer" icon={faQuestionCircle} />
          <span aria-label="Like Podman Desktop? Give us a star on GitHub" class="flex items-center">
            <Fa class="px-1 text-purple-500" icon={faHeart} />{smileyRating === 3 ? 'Like' : 'Love'} It? Give us a <Fa
              class="px-1 text-amber-400"
              icon={faStar} />on <Link aria-label="GitHub" onclick={openGitHub}>GitHub</Link>
          </span>
        </div>
      {/if}
    </svelte:fragment>
    <svelte:fragment slot="buttons">
      <Button disabled={smileyRating === 0 || (smileyRating === 1 && !hasFeedback)} on:click={() => sendFeedback()}
        >Send feedback</Button>
    </svelte:fragment>
  </Dialog>
{/if}
