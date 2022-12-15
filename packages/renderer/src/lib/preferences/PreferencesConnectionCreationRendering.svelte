<script lang="ts">
import type { IConfigurationPropertyRecordedSchema } from '../../../../main/src/plugin/configuration-registry';
import type { ProviderInfo } from '../../../../main/src/plugin/api/provider-info';
import PreferencesRenderingItemFormat from './PreferencesRenderingItemFormat.svelte';
export let properties: IConfigurationPropertyRecordedSchema[] = [];
export let providerInfo: ProviderInfo;
export let propertyScope: string;
export let callback: (string, data) => Promise<void>;

let creationInProgress = false;
let creationSuccessful = false;

// get only ContainerProviderConnectionFactory scope fields that are starting by the provider id
let configurationKeys: IConfigurationPropertyRecordedSchema[];
$: configurationKeys = properties
  .filter(property => property.scope === propertyScope)
  .filter(property => property.id.startsWith(providerInfo.id));

let isValid = true;
let errorMessage = undefined;

function handleInvalidComponent(_error: string) {
  isValid = false;
}

function handleValidComponent() {
  isValid = true;
}

async function handleOnSubmit(e) {
  errorMessage = undefined;
  const formData = new FormData(e.target);

  const data = {};
  for (let field of formData) {
    const [key, value] = field;
    data[key] = value;
  }

  // send the data to the right provider
  creationInProgress = true;
  errorMessage = undefined;
  try {
    await callback(providerInfo.internalId, data);
    window.dispatchEvent(new CustomEvent('provider-lifecycle-change'));
    creationSuccessful = true;
  } catch (error) {
    //display error
    errorMessage = error;
  }
  creationInProgress = false;
}
</script>

<div class="flex flex-1 flex-col">
  {#if creationSuccessful}
    <div class="pf-c-empty-state h-full">
      <div class="pf-c-empty-state__content">
        <i class="fas fa-cubes pf-c-empty-state__icon" aria-hidden="true"></i>
        <h1 class="pf-c-title pf-m-lg">Creation</h1>
        <div class="pf-c-empty-state__body">Successful operation</div>
      </div>
    </div>
  {:else}
    <h1 class="capitalize text-xl">Creation</h1>
    <form novalidate class="pf-c-form" on:submit|preventDefault="{handleOnSubmit}">
      {#each configurationKeys as configurationKey}
        <div>
          <div class="italic">{configurationKey.description}:</div>
          <PreferencesRenderingItemFormat
            invalidRecord="{handleInvalidComponent}"
            validRecord="{handleValidComponent}"
            record="{configurationKey}" />
        </div>
      {/each}
      <button disabled="{!isValid || creationInProgress}" class="pf-c-button pf-m-primary" type="submit">
        <span class="pf-c-button__icon pf-m-start">
          {#if creationInProgress === true}
            <i class="pf-c-button__progress">
              <span class="pf-c-spinner pf-m-md" role="progressbar">
                <span class="pf-c-spinner__clipper"></span>
                <span class="pf-c-spinner__lead-ball"></span>
                <span class="pf-c-spinner__tail-ball"></span>
              </span>
            </i>
          {:else}
            <i class="fas fa-plus-circle" aria-hidden="true"></i>
          {/if}
        </span>
        Create
      </button>
    </form>
    {#if errorMessage}
      <div class="text-red-600">
        {errorMessage}
      </div>
    {/if}
  {/if}
</div>
