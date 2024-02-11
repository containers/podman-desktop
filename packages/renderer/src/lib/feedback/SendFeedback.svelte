<script lang="ts">
import { faFrown, faGrinStars, faMeh, faSmile } from '@fortawesome/free-solid-svg-icons';
import Fa from 'svelte-fa';
import Modal from '../dialogs/Modal.svelte';
import type { FeedbackProperties } from '../../../../preload/src/index';
import ErrorMessage from '../ui/ErrorMessage.svelte';
import Button from '../ui/Button.svelte';
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
</script>

{#if displayModal}
  <Modal on:close="{() => hideModal()}">
    <div
      class="inline-block w-full overflow-hidden text-left transition-all transform bg-charcoal-600 z-50 rounded-xl shadow-xl shadow-charcoal-900">
      <div class="flex items-center justify-between bg-black px-5 py-4 border-b-2 border-violet-700">
        <h1 class="text-xl font-bold">Share your feedback</h1>

        <button class="hover:text-gray-300 px-2 py-1" on:click="{() => hideModal()}">
          <i class="fas fa-times" aria-hidden="true"></i>
        </button>
      </div>

      <div class="overflow-y-auto p-4">
        <label for="smiley" class="block mb-2 text-sm font-medium text-gray-400"
          >How was your experience with Podman Desktop ?</label>
        <div class="flex space-x-4">
          <button aria-label="very-sad-smiley" on:click="{() => selectSmiley(1)}">
            <Fa
              size="24"
              class="cursor-pointer {smileyRating === 1 ? 'text-violet-400' : 'text-gray-900'}"
              icon="{faFrown}" />
          </button>
          <button aria-label="sad-smiley" on:click="{() => selectSmiley(2)}">
            <Fa
              size="24"
              class="cursor-pointer {smileyRating === 2 ? 'text-violet-400' : 'text-gray-900'}"
              icon="{faMeh}" />
          </button>
          <button aria-label="happy-smiley" on:click="{() => selectSmiley(3)}">
            <Fa
              size="24"
              class="cursor-pointer {smileyRating === 3 ? 'text-violet-400' : 'text-gray-900'}"
              icon="{faSmile}" />
          </button>
          <button aria-label="very-happy-smiley" on:click="{() => selectSmiley(4)}">
            <Fa
              size="24"
              class="cursor-pointer {smileyRating === 4 ? 'text-violet-400' : 'text-gray-900'}"
              icon="{faGrinStars}" />
          </button>
        </div>

        <label for="tellUsWhyFeedback" class="block mt-4 mb-2 text-sm font-medium text-gray-400"
          >Tell us why, or share any suggestion or issue to improve your experience: ({1000 - tellUsWhyFeedback.length} characters
          left)</label>
        <textarea
          rows="4"
          maxlength="1000"
          name="tellUsWhyFeedback"
          id="tellUsWhyFeedback"
          data-testid="tellUsWhyFeedback"
          bind:value="{tellUsWhyFeedback}"
          class="w-full p-2 outline-none text-sm bg-charcoal-800 rounded-sm text-gray-700 placeholder-gray-700"
          placeholder="Please enter your feedback here, we appreciate and review all comments"></textarea>

        <label for="contactInformation" class="block mt-4 mb-2 text-sm font-medium text-gray-400"
          >Share your contact information if you'd like us to answer you:</label>
        <input
          type="email"
          name="contactInformation"
          id="contactInformation"
          bind:value="{contactInformation}"
          placeholder="Enter email address, or leave blank for anonymous feedback"
          class="w-full p-2 outline-none text-sm bg-charcoal-800 rounded-sm text-gray-700 placeholder-gray-700" />

        <div class="pt-5 flex flex-row w-full justify-between">
          <div>
            {#if smileyRating === 0}
              <ErrorMessage class="flex flex-row w-[350px] text-xs" error="Please select an experience smiley" />
            {:else if smileyRating === 1 && !hasFeedback}
              <ErrorMessage
                class="flex flex-row w-[350px] text-xs"
                error="Please share contact info or details on how we can improve" />
            {:else if smileyRating === 2 && !hasFeedback}
              <WarningMessage
                class="flex flex-row w-[350px] text-xs"
                error="We would really appreciate knowing how we can improve" />
            {/if}
          </div>

          <Button
            disabled="{smileyRating === 0 || (smileyRating === 1 && !hasFeedback)}"
            on:click="{() => sendFeedback()}">Send feedback</Button>
        </div>
      </div>
    </div>
  </Modal>
{/if}
