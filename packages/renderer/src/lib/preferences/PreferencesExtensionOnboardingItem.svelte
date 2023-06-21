<script lang="ts">
import { afterUpdate, onDestroy, onMount } from 'svelte';
import type { OnboardingViewCheckboxCardItem, OnboardingViewItem } from "../../../../main/src/plugin/api/onboarding";
import Markdown from "../markdown/Markdown.svelte";

export let item: OnboardingViewItem;
export let extensionId: string;
export let showNext: (show: boolean) => void;
let html;
let isMarkdown = false;
$: buttons = new Map<string, string>();

const eventListeners = [];

onMount(() => {
    const itemHtml = createItem(item);
    html = itemHtml;
    const clickListener = async (e) => {
        if(e.target instanceof HTMLButtonElement) {
            const buttonId = e.target.id;
            let buttonCommand = buttons.get(buttonId);
            if (buttonCommand) {
                buttonCommand = buttonCommand.replace("onCommand:", ""); // todo in the registry when recording onboarding
                await window.executeOnboardingCommand(extensionId, buttonCommand);
            }
        }       
    };
    eventListeners.push(clickListener);
    document.addEventListener('click', clickListener);

    const changeListener = async (e) => {
        if (e.target instanceof HTMLInputElement) {
            const inputId = e.target.id;
            if (item.component === "radiogroup") {
                const response = await window.setOnboardingRadioInputSelection(extensionId, item.id, inputId);
                showNext(response.stepCompleted);
            }
        }
    }
    eventListeners.push(changeListener);
    document.addEventListener('change', changeListener);
    
});

onDestroy(() => {
    eventListeners.forEach((listener) => document.removeEventListener('click', listener));
});

function createItem(item: OnboardingViewItem): string {
    let html = '';
    switch(item.component) {
        case 'button': {
            const buttonId = `button-${buttons.size}`;
            const value = `<button id="${buttonId}" class="bg-purple-700 py-1.5 px-1 rounded-md">${item.label}</button>`
            buttons.set(buttonId, item.value);
            buttons = buttons;
            html = value;
            break;
        }
        case 'radiogroup': {
            let value = '';
            item.options.forEach((option) => {
                value += createItem(option);
            })
            html = value;
            break;
        }
        case 'checkbox_card': {
            html = createCheckboxCard(item);
            break;
        }
        default: {
            html = item.value
            isMarkdown = true;
        }
    }
    return html;
}

function createCheckboxCard(item: OnboardingViewCheckboxCardItem, parent?: string): string {
    return `
        <div class="flex flex-col items-start bg-charcoal-600 m-3">
            <div class="flex flex-col px-4 pt-4 mb-2">
                ${item.media ?
                `<div class="mb-2">
                <img
                class="w-10 h-10 object-contain"
                alt="${item.media.altText}"
                src="${item.media.path}" />
                </div>` :
                ''
                }
                <div class="flex flex-row">
                    <div class="text-md font-bold text-white mr-2">${item.title}</div>
                    ${item.subtitle ?
                        `<div class="text-xs text-gray-700">${item.subtitle}</div>` :
                        ''                
                    }                
                </div>                
            </div>
            <div class="text-[14px] leading-4 flex grow px-4 mb-3">
                    ${item.body}
                </div>
            
            <div class="bg-charcoal-800 w-full px-2 py-4">
                <input type="checkbox" id="${item.id}" class="mx-2 outline-none text-sm" />
                  ${item.checkbox}
            </div>

        </div>
    `;   
    
}
</script>

{#if html}
    {#if !isMarkdown}
    {@html html}
    {:else}
    <Markdown>{html}</Markdown>
    {/if}
{/if}