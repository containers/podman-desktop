<script lang="ts">
import { faEye, faEyeSlash } from '@fortawesome/free-regular-svg-icons';
import { Input } from '@podman-desktop/ui-svelte';
import { createEventDispatcher, onMount } from 'svelte';
import Fa from 'svelte-fa';

export let id: string;
export let password: string | undefined = undefined;
export let passwordHidden: boolean = true;
export let readonly: boolean = false;

let element: HTMLInputElement;

const dispatch = createEventDispatcher();

onMount(() => {
  element.type = 'password';
});

// show/hide if the parent doesn't override
async function onShowHide() {
  if (dispatch('toggleShowHide', { cancelable: true })) {
    passwordHidden = !passwordHidden;
    element.type = passwordHidden ? 'password' : 'text';
  }
}
</script>

<Input
  class={$$props.class || ''}
  id="password-{id}"
  name="password-{id}"
  placeholder="password"
  bind:value={password}
  aria-label="password {id}"
  bind:readonly={readonly}
  on:input
  bind:element={element}>
  <svelte:fragment slot="right">
    <button
      class="px-1 cursor-pointer text-[var(--pd-input-field-stroke)] group-hover:text-[var(--pd-input-field-hover-stroke)] group-focus-within:text-[var(--pd-input-field-hover-stroke)]"
      class:hidden={!password || readonly}
      aria-label="show/hide"
      on:click={onShowHide}
      >{#if passwordHidden}
        <Fa icon={faEye} />
      {:else}
        <Fa icon={faEyeSlash} />
      {/if}
    </button>
  </svelte:fragment>
</Input>
