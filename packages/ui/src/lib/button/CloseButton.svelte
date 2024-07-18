<script lang="ts">
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { createEventDispatcher } from 'svelte';
import Fa from 'svelte-fa';

const dispatch = createEventDispatcher<{ click: undefined }>();

function click(): void {
  dispatch('click');
}
</script>

<button
  type="button"
  class="text-gray-800 hover:bg-white hover:bg-opacity-10 transition-all rounded-[4px] p-1 no-underline cursor-pointer {$$props.class ||
    ''}"
  on:click={click}
  title="Close"
  aria-label="Close">
  <Fa icon={faTimes} />
</button>
