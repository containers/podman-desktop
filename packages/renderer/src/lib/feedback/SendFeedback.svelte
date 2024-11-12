<script lang="ts">
import type { FeedbackCategory } from '/@api/feedback';

import DevelopersFeedback from './DevelopersFeedback.svelte';
import GitHubIssueFeedback from './GitHubIssueFeedback.svelte';

let displayModal = false;
const DEFAULT_CATEGORY: FeedbackCategory = 'developers';

// feedback of the user
export let category: FeedbackCategory = DEFAULT_CATEGORY;

window.events?.receive('display-feedback', () => {
  displayModal = true;
});
</script>

{#if category === 'developers'}
  <DevelopersFeedback bind:displayModal={displayModal} bind:category={category} />
{:else}
  <GitHubIssueFeedback bind:displayModal={displayModal} bind:category={category} />
{/if}
