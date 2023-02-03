<script lang="ts">
import type { Registry } from '@tmpwip/extension-api';
import { onMount } from 'svelte';
import { createFieldValidator, requiredValidator, urlValidator } from '../validation/FieldValidation';

export let toggleCallback: () => void;
export let mode: 'edit' | 'create';

export let registry: Registry = {
  source: '',
  serverUrl: '',
  username: '',
  secret: '',
};

let providerSourceNames: string[] = [];

onMount(async () => {
  providerSourceNames = await window.getImageRegistryProviderNames();
  if (providerSourceNames.length > 0) {
    registry.source = providerSourceNames[0];
  }
});

function keydownChoice(e: KeyboardEvent) {
  e.stopPropagation();
  if (e.key === 'Escape') {
    toggleCallback();
  }
}

const [serverUrlValidity, serverUrlValidate] = createFieldValidator(requiredValidator(), urlValidator());
const [userNameValidity, userNameValidate] = createFieldValidator(requiredValidator());
const [passwordValidity, passwordValidate] = createFieldValidator(requiredValidator());

let errorMessage = '';
async function createOrUpdateRegistry() {
  errorMessage = '';
  if (mode === 'create') {
    try {
      await window.createImageRegistry(registry.source, registry);
      toggleCallback();
    } catch (error) {
      errorMessage = error.message;
    }
  } else {
    try {
      await window.updateImageRegistry(registry);
      toggleCallback();
    } catch (error) {
      errorMessage = error.message;
    }
  }
}

let showPassword = false;
let passwordNode: any;

function showHidePassword(_: any) {
  if (passwordNode.type === 'password') {
    passwordNode.type = 'text';
  } else {
    passwordNode.type = 'password';
  }
  passwordNode.focus();
}

const setType = (node: any) => {
  node.type = 'password';
  passwordNode = node;
};
</script>

<div
  class="inline-block w-full overflow-hidden text-left transition-all transform bg-[#4b5563] z-50 rounded-xl shadow-xl shadow-neutral-900"
  on:keydown="{keydownChoice}">
  <div class="flex items-center justify-between bg-black px-6 py-4 border-b-2 border-[#7c3aed]">
    <h1 class="text-xl font-bold">{mode === 'create' ? 'Login to a Registry' : 'Edit Registry'}</h1>

    <button class="hover:text-gray-200 px-2 py-1" on:click="{toggleCallback}">
      <i class="fas fa-times" aria-hidden="true"></i>
    </button>
  </div>

  <div class="px-6 py-4 bg-[#201e20]">
    <form class="">
      <div>
        <label for="serverUrl" class="block text-sm font-bold"
          >Server URL{#if mode === 'edit'}&nbsp;(read only){/if}</label>
        <input
          id="serverUrl"
          name="serverUrl"
          readonly="{mode === 'edit'}"
          bind:value="{registry.serverUrl}"
          required
          placeholder="Enter URL"
          disabled="{mode === 'edit'}"
          type="text"
          tabindex="0"
          use:serverUrlValidate="{registry.serverUrl}"
          class="block disabled:opacity-75 disabled:text-gray-500 w-full px-3 py-2 mt-2 transition ease-in-out delay-50 text-sm text-gray-400 placeholder-gray-400 bg-[#111311] rounded-sm focus:outline-none focus:ring-1 focus:ring-gray-200 focus:ring-opacity-20" />
        <div class="h-3 mt-2 text-xs">
          {#if $serverUrlValidity.dirty && !$serverUrlValidity.valid}
            <p class="text-red-500">
              <i class="fas fa-exclamation-circle pr-1" aria-hidden="true"></i>
              {$serverUrlValidity.message}
            </p>
          {/if}
        </div>
      </div>

      <div class="mt-3">
        <label for="username" class="block text-sm font-bold">Username</label>
        <input
          id="username"
          bind:value="{registry.username}"
          name="username"
          required
          placeholder="Username or email"
          type="text"
          use:userNameValidate="{registry.username}"
          class="block w-full w-full px-3 py-2 mt-2 transition ease-in-out delay-50 text-sm text-gray-400 placeholder-gray-400 bg-[#111311] rounded-sm focus:outline-none focus:ring-1 focus:ring-gray-200 focus:ring-opacity-20" />
        <p class="mt-2 text-xs text-red-500 h-3">
          {#if $userNameValidity.dirty && !$userNameValidity.valid}
            <i class="fas fa-exclamation-circle pr-1" aria-hidden="true"></i>
            {$userNameValidity.message}
          {/if}
        </p>
      </div>

      <div class="mt-3 relative">
        <label for="password" class="block text-sm font-bold">Password</label>
        <div class="absolute inset-y-0 right-0 flex items-center px-2 mt-2">
          <input
            id="password"
            class="hidden password-toggle"
            type="checkbox"
            value="false"
            tabindex="-1"
            on:change="{event => showHidePassword(event)}"
            bind:checked="{showPassword}" />
          <label class="px-2 py-1 text text-gray-600 cursor-pointer" for="password">
            {#if showPassword}
              <i class="fas fa-eye-slash"></i>
            {:else}
              <i class="fas fa-eye"></i>
            {/if}
          </label>
        </div>
        <input
          bind:value="{registry.secret}"
          name="password"
          required
          placeholder="Password"
          use:setType
          use:passwordValidate="{registry.secret}"
          class="block w-full w-full px-3 py-2 mt-2 transition ease-in-out delay-50 text-sm text-gray-400 placeholder-gray-400 bg-[#111311] rounded-sm focus:outline-none focus:ring-1 focus:ring-gray-200 focus:ring-opacity-20" />
        <p class="mt-2 text-xs text-red-500 h-3">
          {#if $passwordValidity.dirty && !$passwordValidity.valid}
            <i class="fas fa-exclamation-circle pr-1" aria-hidden="true"></i>
            {$passwordValidity.message}
          {/if}
        </p>
      </div>

      {#if errorMessage}
        <div class="">
          <p class="mt-2 text-xs text-red-500 h-3">
            <i class="fas fa-exclamation-circle pr-1" aria-hidden="true"></i>
            {errorMessage}
          </p>
        </div>
      {/if}

      <div class="text-center mt-6 mb-2">
        <button
          class="bg-[#6e4ff5] hover:bg-[#613ff4] transition ease-in-out delay-50 hover:cursor-pointer disabled:bg-gray-400 text-sm font-medium uppercase px-6 py-2 rounded-sm shadow hover:shadow-lg"
          type="button"
          disabled="{!$serverUrlValidity.valid || !$userNameValidity.valid || !$passwordValidity.valid}"
          on:click="{createOrUpdateRegistry}">
          {mode === 'create' ? 'Login to a registry' : 'Update registry'}
        </button>
      </div>
    </form>
  </div>
</div>
