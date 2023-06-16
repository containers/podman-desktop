<script lang="ts">
import Route from '../../Route.svelte';
import { extensionInfos } from '../../stores/extensions';
import type { ExtensionInfo } from '../../../../main/src/plugin/api/extension-info';
import SettingsPage from './SettingsPage.svelte';
import ConnectionStatus from '../ui/ConnectionStatus.svelte';
import { onMount } from 'svelte';
import type { ActiveOnboarding } from '../../../../main/src/plugin/api/onboarding';

export let extensionId: string = undefined;

let extensionInfo: ExtensionInfo;
$: extensionInfo = $extensionInfos.find(extension => extension.id === extensionId);

let onboardingStep: ActiveOnboarding;
$: onboardingStep;

onMount(async () => {
    //ask step to backend
    onboardingStep = await window.getOnboardingStep(extensionId);
})
</script>

{#if onboardingStep}
    <div class="flex flex-col bg-[#36373a]">
        <div class="flex flex-row">
            {#if onboardingStep.media}
            <img
              class="w-25 h-25 object-contain"
              alt="{onboardingStep.media.altText}"
              src="{onboardingStep.media.path}" />
            {/if}
            <div class="flex flex-col">
                <div class="text-lg font-bold text-white">{onboardingStep.title}</div>
                {#if onboardingStep.description}
                <div class="text-sm text-white">{onboardingStep.description}</div>
                {/if}                
            </div>
            <div class="flex flex-row-reverse">
                {#each onboardingStep.steps as step}
                <div>{step.title} ({step.status})</div>
                {/each}
            </div>            
        </div>
        <div>ICON</div>
        <
        Walkthrough 
    </div>
{/if}
    

