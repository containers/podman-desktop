<script lang="ts">
import { extensionInfos } from '../../stores/extensions';
import type { ExtensionInfo } from '../../../../main/src/plugin/api/extension-info';
import { onMount } from 'svelte';
import type { ActiveOnboarding } from '../../../../main/src/plugin/api/onboarding';
import { faCircle } from '@fortawesome/free-regular-svg-icons';
import { faCircleCheck, faCircle as faFilledCircle } from '@fortawesome/free-solid-svg-icons';
import Fa from 'svelte-fa/src/fa.svelte';
import type { Unsubscriber } from 'svelte/store';
import { activeOnboarding } from '/@/stores/onboarding';
import PreferencesExtensionOnboardingItem from './PreferencesExtensionOnboardingItem.svelte';

export let extensionId: string = undefined;

let extensionInfo: ExtensionInfo;
$: extensionInfo = $extensionInfos.find(extension => extension.id === extensionId);

let onboardingStep: ActiveOnboarding;
$: onboardingStep;

let executing: boolean;
$: executing = true;
$: enableNextButton = false;

let onboardingsUnsubscribe: Unsubscriber;

onMount(async () => {
    //ask step to backend
    onboardingStep = await window.getOnboardingStep(extensionId);
    for (const command of (onboardingStep?.activeStep?.view?.commandAtActivation || []).sort((s1, s2) => s1.order - s2.order)) {
        executing = true;
        await window.executeOnboardingCommand(extensionId, command.command);
        executing = false;
    }

    onboardingsUnsubscribe = activeOnboarding.subscribe(async onboardings => {
        enableNextButton = false;
        onboardingStep = onboardings.filter(o => o.extension === extensionId)[0];
        for (const command of (onboardingStep?.activeStep?.view?.commandAtActivation || []).sort((s1, s2) => s1.order - s2.order)) {
            executing = true;
            await window.executeOnboardingCommand(extensionId, command.command);
            executing = false;
        }
    });
})

async function next() {
    await window.doNext(extensionId);
}

function showNext(enable: boolean) {
    enableNextButton = enable;
}
</script>

{#if onboardingStep}
    <div class="flex flex-col bg-[#36373a] h-full">
        <div class="flex flex-row justify-between mb-20">
            {#if onboardingStep.media}
            <img
              class="w-14 h-14 object-contain"
              alt="{onboardingStep.media.altText}"
              src="{onboardingStep.media.path}" />
            {/if}
            <div class="flex flex-col ml-8 my-2">
                <div class="text-lg font-bold text-white">{onboardingStep.title}</div>
                {#if onboardingStep.description}
                <div class="text-sm text-white">{onboardingStep.description}</div>
                {/if}                
            </div>
            <div class="flex flex-row mt-1 mr-2">
                {#each onboardingStep.steps as step}
                <div class="flex flex-col mr-2">
                    <div class="flex justify-center mb-2">
                        {#if step.id === onboardingStep.activeStep.id}
                        <Fa class="place-content-center text-purple-500" size="24" icon="{faFilledCircle}" />
                        {:else if step.status === "completed"}
                        <Fa class="place-content-center" size="24" icon="{faCircleCheck}" />
                        {:else} 
                        <Fa class="place-content-center" size="24" icon="{faCircle}" />
                        {/if}
                    </div>
                    <div class="text-sm ">{step.title}</div>
                </div>
                
                {/each}
            </div>            
        </div>
        <div class="w-[450px] flex flex-col mx-auto">
            {#if onboardingStep.activeStep.view.media}
            <div class="mx-auto">
                <img
                    class="w-24 h-24 object-contain"
                    alt="{onboardingStep.activeStep.view.media.altText}"
                    src="{onboardingStep.activeStep.view.media.path}" />
            </div>
            {/if}
            <div class="flex flex-row mx-auto">
                {#if executing}
                <div class="mt-1 mr-6">
                    <i class="pf-c-button__progress text-purple-400">
                      <span class="pf-c-spinner pf-m-md" role="progressbar">
                        <span class="pf-c-spinner__clipper"></span>
                        <span class="pf-c-spinner__lead-ball"></span>
                        <span class="pf-c-spinner__tail-ball"></span>
                      </span>
                    </i>
                  </div>
                {/if}
                <div class="text-lg text-white">{onboardingStep.activeStep.view.title}</div>
            </div> 
            {#if onboardingStep.activeStep.view.description}
            <div class="text-sm text-white mx-auto">{onboardingStep.activeStep.view.description}</div>
            {/if}
        </div>

        <div class="flex flex-col mx-auto">
            {#if onboardingStep.activeStep.view.content}
                {#each onboardingStep.activeStep.view.content.sort((c1,c2) => c1.row - c2.row) as row}
                <div class="flex flex-row mx-auto">
                    {#each row.items as item}
                    <PreferencesExtensionOnboardingItem item={item} extensionId={extensionId} showNext={showNext} />         
                    {/each}
                </div>
                {/each}
            {/if}
        </div>

        {#if onboardingStep.activeStep.view.showNext || enableNextButton}
        <div class="grow"></div>
        <div class="mb-10 mx-auto text-sm">
            Press the <span class="bg-purple-700 p-0.5">Next</span> button below to proceed.
        </div>
        <div class="flex flex-row-reverse p-6 bg-charcoal-600">
            <button class="bg-purple-700 py-1.5 px-5 rounded-md" on:click="{() => next()}">Next</button>
        </div>
        {/if}
    </div>
{/if}
    

