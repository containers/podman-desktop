<script lang="ts">
import { faFrown, faGrinStars, faMeh, faSmile } from '@fortawesome/free-solid-svg-icons';
import Fa from 'svelte-fa/src/fa.svelte';
import Modal from '../dialogs/Modal.svelte';
import type { FeedbackProperties } from '../../../../preload/src/index';
let displayModal = false;

// feedback of the user
let smileyRating = 0;
let tellUsWhyFeedback = '';
let contactInformation = '';

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
      class="inline-block w-full overflow-hidden text-left transition-all transform bg-zinc-800 z-50 rounded-xl shadow-xl shadow-neutral-900">
      <div class="flex items-center justify-between bg-black px-5 py-4 border-b-2 border-violet-700">
        <h1 class="text-xl font-bold">Login</h1>

        <button class="hover:text-gray-200 px-2 py-1" on:click="{() => hideModal()}">
          <i class="fas fa-times" aria-hidden="true"></i>
        </button>
      </div>

      <div>
        <webview
        id="dd-webview-test"
        src="https://developers.redhat.com/"
        style="height: 700px;"
        class="w-full"></webview>
      </div>
    </div>
  </Modal>
{/if}
