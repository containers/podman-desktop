<script lang="ts">
import type { Registry } from '@tmpwip/extension-api';

import { onMount } from 'svelte';

export let toggleCallback: () => void;
let providerSourceNames: string[] = [];
let registryToCreate: Registry = {
  source: '',
  serverUrl: '',
  username: '',
  secret: '',
};

onMount(async () => {
  providerSourceNames = await window.getImageRegistryProviderNames();
  if (providerSourceNames.length > 0) {
    registryToCreate.source = providerSourceNames[0];
  }
});

function keydownChoice(e: KeyboardEvent) {
  e.stopPropagation();
  if (e.key === 'Escape') {
    toggleCallback();
  }
}

let isServerUrlInvalid = 'Enter a value';
function checkServerValue(event: any) {
  const userValue = event.target.value;
  if (userValue === '' || userValue === undefined) {
    isServerUrlInvalid = 'Please enter a value';
  } else {
    isServerUrlInvalid = '';
  }
}

let isUsernameInvalid = 'Enter a value';
function checkUsernameValue(event: any) {
  const userValue = event.target.value;
  if (userValue === '' || userValue === undefined) {
    isUsernameInvalid = 'Please enter a value';
  } else {
    isUsernameInvalid = '';
  }
}

let isPasswordInvalid = 'Enter a value';
function checkPasswordValue(event: any) {
  const userValue = event.target.value;
  if (userValue === '' || userValue === undefined) {
    isPasswordInvalid = 'Please enter a value';
  } else {
    isPasswordInvalid = '';
  }
}

let creationError = '';

async function addRegistry() {
  creationError = '';
  try {
    await window.createImageRegistry(registryToCreate.source, registryToCreate);
    toggleCallback();
  } catch (error) {
    creationError = error;
  }
}
</script>

<div class="pf-c-backdrop">
  <div class="pf-l-bullseye">
    <div
      class="pf-c-modal-box pf-m-sm modal z-50 "
      tabindex="{0}"
      autofocus
      aria-modal="true"
      on:keydown="{keydownChoice}"
      aria-labelledby="modal-title-modal-basic-example-modal"
      aria-describedby="modal-description-modal-basic-example-modal">
      <button
        class="pf-c-button pf-m-plain"
        type="button"
        aria-label="Close dialog"
        on:click="{() => toggleCallback()}">
        <i class="fas fa-times" aria-hidden="true"></i>
      </button>
      <header class="pf-c-modal-box__header" on:keydown="{keydownChoice}">
        <h1 class="pf-c-modal-box__title">Add a new registry</h1>
      </header>
      <div class="pf-c-modal-box__body">
        <form novalidate class="pf-c-form pf-m-horizontal-on-sm">
          <div class="pf-c-form__group">
            <div class="pf-c-form__group-label">
              <label class="pf-c-form__label" for="form-horizontal-custom-breakpoint-name">
                <span class="pf-c-form__label-text">Server URL:</span>
                <span class="pf-c-form__label-required" aria-hidden="true">&#42;</span>
              </label>
            </div>
            <div class="pf-c-form__group-control">
              <input
                class="pf-c-form-control"
                type="text"
                name="serverUrl"
                on:input="{event => checkServerValue(event)}"
                bind:value="{registryToCreate.serverUrl}"
                aria-invalid="{!!isServerUrlInvalid}"
                required />
              {#if isServerUrlInvalid}
                <p class="pf-c-form__helper-text pf-m-error" id="form-help-text-address-helper" aria-live="polite">
                  {isServerUrlInvalid}
                </p>
              {/if}
            </div>
          </div>
          <div class="pf-c-form__group">
            <div class="pf-c-form__group-label">
              <label class="pf-c-form__label" for="form-horizontal-custom-breakpoint-name">
                <span class="pf-c-form__label-text">username:</span>
                <span class="pf-c-form__label-required" aria-hidden="true">&#42;</span>
              </label>
            </div>
            <div class="pf-c-form__group-control">
              <input
                class="pf-c-form-control"
                type="text"
                bind:value="{registryToCreate.username}"
                on:input="{event => checkUsernameValue(event)}"
                aria-invalid="{!!isUsernameInvalid}"
                name="username"
                required />
              {#if isUsernameInvalid}
                <p class="pf-c-form__helper-text pf-m-error" id="form-help-text-address-helper" aria-live="polite">
                  {isUsernameInvalid}
                </p>
              {/if}
            </div>
          </div>
          <div class="pf-c-form__group">
            <div class="pf-c-form__group-label">
              <label class="pf-c-form__label" for="form-horizontal-custom-breakpoint-name">
                <span class="pf-c-form__label-text">password:</span>
                <span class="pf-c-form__label-required" aria-hidden="true">&#42;</span>
              </label>
            </div>
            <div class="pf-c-form__group-control">
              <input
                class="pf-c-form-control"
                type="password"
                bind:value="{registryToCreate.secret}"
                on:input="{event => checkPasswordValue(event)}"
                aria-invalid="{!!isPasswordInvalid}"
                name="password"
                required />
              {#if isPasswordInvalid}
                <p class="pf-c-form__helper-text pf-m-error" id="form-help-text-address-helper" aria-live="polite">
                  {isPasswordInvalid}
                </p>
              {/if}
            </div>
          </div>
          {#if providerSourceNames.length > 1}
            <div class="pf-c-form__group">
              <div class="pf-c-form__group-label">
                <label class="pf-c-form__label" for="form-horizontal-custom-breakpoint-name">
                  <span class="pf-c-form__label-text">Provider:</span>
                  <span class="pf-c-form__label-required" aria-hidden="true">&#42;</span>
                </label>
              </div>
              <div class="pf-c-form__group-control">
                <select
                  class="border  text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 bg-gray-600 border-gray-500 placeholder-gray-400 text-white"
                  name="providerChoice"
                  bind:value="{registryToCreate.source}">
                  {#each providerSourceNames as providerSourceName}
                    <option value="{providerSourceName}">{providerSourceName}</option>
                  {/each}
                </select>
              </div>
            </div>
          {/if}
          {#if providerSourceNames.length == 1}
            <input type="hidden" name="source" readonly bind:value="{registryToCreate.source}" />
          {/if}
        </form>
      </div>
      <footer class="pf-c-modal-box__footer">
        <div class="w-full flex flex-col justify-end">
          <button
            class="pf-c-button pf-m-primary"
            disabled="{!!isServerUrlInvalid || !!isUsernameInvalid || !!isPasswordInvalid}"
            type="button"
            on:click="{() => addRegistry()}">Add registry</button>
          {#if creationError}
            <p class="pf-c-form__helper-text pf-m-error" id="form-help-text-address-helper" aria-live="polite">
              {creationError}
            </p>
          {/if}
        </div>
      </footer>
    </div>
  </div>
</div>
