<script lang="ts">
import type { DirectFeedbackCategory, FeedbackProperties } from '@desktop-framework/api';
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
import { Icon } from '@podman-desktop/ui-svelte/icons';

import FeedbackForm from '/@/lib/feedback/FeedbackForm.svelte';
import WarningMessage from '/@/lib/ui/WarningMessage.svelte';

interface Props {
  onCloseForm: (confirmation: boolean) => void;
  contentChange: (e: boolean) => void;
  category: DirectFeedbackCategory;
}

const SMILEYS = [
  { rating: 1, icon: faFrown, label: 'very-sad-smiley' },
  { rating: 2, icon: faMeh, label: 'sad-smiley' },
  { rating: 3, icon: faSmile, label: 'happy-smiley' },
  { rating: 4, icon: faGrinStars, label: 'very-happy-smiley' },
] as const;

// feedback of the user
let smileyRating = $state(0);
let tellUsWhyFeedback = $state('');
let contactInformation = $state('');
let repository = $derived(await window.getAppRepository());
let hasFeedback = $derived(
  (tellUsWhyFeedback && tellUsWhyFeedback.trim().length > 4) ||
    (contactInformation && contactInformation.trim().length > 4),
);

let { onCloseForm, contentChange, category }: Props = $props();

$effect(() => contentChange(Boolean(smileyRating || tellUsWhyFeedback || contactInformation)));

function selectSmiley(item: number): void {
  smileyRating = item;
}

let feedbackMessages = $derived(await window.getFeedbackMessages());

async function sendFeedback(): Promise<void> {
  const properties: FeedbackProperties = {
    category,
    rating: smileyRating,
  };

  if (tellUsWhyFeedback) {
    properties.comment = tellUsWhyFeedback;
  }

  if (contactInformation) {
    properties.contact = contactInformation;
  }

  // 1. send the feedback
  await window.sendFeedback(properties);

  // 2. close the form without confirmation
  onCloseForm(false);

  // 3. Display confirmation dialog
  await window.showMessageBox({
    title: 'Feedback Submitted',
    message: feedbackMessages?.thankYouMessage ?? '',
    type: 'info',
    buttons: ['Dismiss'],
  });
}

async function openGitHub(): Promise<void> {
  if (repository) {
    await window.telemetryTrack('feedback.openGitHub');
    await window.openExternal(repository);
  }
}
</script>

<FeedbackForm>
  <svelte:fragment slot="content">
    <label for="smiley" class="block mt-4 mb-2 text-sm font-medium text-[var(--pd-modal-text)]"
      >{feedbackMessages?.experienceLabel}</label>
    <div class="flex space-x-4" role="group" aria-label={feedbackMessages?.experienceLabel}>
      {#each SMILEYS as { rating, icon, label } (rating)}
        <button
          aria-label={label}
          aria-pressed={smileyRating === rating ? 'true' : 'false'}
          class="rounded-full p-1 border-2 {smileyRating === rating
            ? 'border-(--pd-content-card-border-selected)'
            : 'border-transparent'}"
          onclick={(): void => selectSmiley(rating)}>
          <Icon
            size="1.5x"
            class="cursor-pointer {smileyRating === rating
              ? 'text-(--pd-action-button-primary-text)'
              : 'text-(--pd-button-disabled-text)'}"
            {icon} />
        </button>
      {/each}
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
      class="w-full p-2 outline-hidden text-sm bg-[var(--pd-input-field-focused-bg)] rounded-xs text-[var(--pd-input-field-focused-text)] placeholder-[var(--pd-input-field-placeholder-text)]"
      placeholder="Please enter your feedback here, we appreciate and review all comments"></textarea>

    <label for="contactInformation" class="block mt-4 mb-2 text-sm font-medium text-[var(--pd-modal-text)]">
      Share your email address if we can follow up with you regarding your feedback. We will only use your email address for this purpose:
    </label>
    <input
      type="email"
      name="contactInformation"
      id="contactInformation"
      bind:value={contactInformation}
      placeholder="Enter email address, or leave blank for anonymous feedback"
      class="w-full p-2 outline-hidden text-sm bg-[var(--pd-input-field-focused-bg)] rounded-xs text-[var(--pd-input-field-focused-text)] placeholder-[var(--pd-input-field-placeholder-text)]" />
  </svelte:fragment>
  <svelte:fragment slot="validation">
    {#if smileyRating === 0}
      <ErrorMessage class="text-xs" error="Please select an experience smiley" />
    {:else if smileyRating === 1 && !hasFeedback}
      <ErrorMessage class="text-xs" error="Please share contact info or details on how we can improve" />
    {:else if smileyRating === 2 && !hasFeedback}
      <WarningMessage class="text-xs" error="We would really appreciate knowing how we can improve" />
    {:else if smileyRating > 2 && repository?.toLowerCase().includes('github.com')}
      <div class="text-[var(--pd-modal-text)] p-1 flex flex-row items-center text-xs">
        <Icon size="1.125x" class="cursor-pointer" icon={faQuestionCircle} />
        <span aria-label="{feedbackMessages?.gitHubStarsMessage}" class="flex items-center">
          <Icon class="px-1 text-[var(--pd-invert-content-info-icon)]" icon={faHeart} />{smileyRating === 3 ? 'Like' : 'Love'} It? Give us a <Icon
            class="px-1 text-[var(--pd-state-warning)]"
            icon={faStar} />on <Link aria-label="GitHub" on:click={openGitHub}>GitHub</Link>
        </span>
      </div>
    {/if}
  </svelte:fragment>
  <svelte:fragment slot="buttons">
    <Button disabled={smileyRating === 0 || (smileyRating === 1 && !hasFeedback)} on:click={sendFeedback}
    >Send feedback</Button>
  </svelte:fragment>
</FeedbackForm>
