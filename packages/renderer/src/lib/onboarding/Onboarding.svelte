<script lang="ts">
import { onDestroy, onMount } from 'svelte';
import type { OnboardingInfo, OnboardingStep, OnboardingStatus } from '../../../../main/src/plugin/api/onboarding';
import { faCircleCheck, faCircleQuestion, faCircleXmark, faCircle } from '@fortawesome/free-regular-svg-icons';
import { faCircleChevronRight, faCircle as faFilledCircle, faForward } from '@fortawesome/free-solid-svg-icons';
import Fa from 'svelte-fa/src/fa.svelte';
import type { Unsubscriber } from 'svelte/store';
import { onboardingList } from '/@/stores/onboarding';
import OnboardingItem from './OnboardingItem.svelte';
import type { ContextUI } from '../context/context';
import { ContextKeyExpr } from '../context/contextKey';
import { router } from 'tinro';
import { context } from '/@/stores/context';
import {
  ON_COMMAND_PREFIX,
  ONBOARDING_CONTEXT_PREFIX,
  SCOPE_ONBOARDING,
  STATUS_COMPLETED,
  STATUS_SKIPPED,
} from './onboarding-utils';

interface ActiveOnboardingStep {
  onboarding: OnboardingInfo;
  step: OnboardingStep;
}

interface OnboardingStepLabels {
  label: string;
  status?: OnboardingStatus;
}

export let extensionIds: string[] = [];

let onboardings: OnboardingInfo[];
let activeStep: ActiveOnboardingStep;
$: activeStep;

$: executing = false;
let globalContext: ContextUI;
let displayCancelSetup = false;
let displayResetSetup = false;

let executedCommands: string[] = [];
const onboardingLabels: OnboardingStepLabels[] = [];
/*
$: enableNextButton = false;*/
let onboardingUnsubscribe: Unsubscriber;
let contextsUnsubscribe: Unsubscriber;
onMount(async () => {
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  onboardingUnsubscribe = onboardingList.subscribe(onboardingItems => {
    if (!onboardings) {
      onboardings = onboardingItems.filter(o => extensionIds.find(extensionId => o.extension === extensionId));
      // if there is only one extensionId, it is only executing a single extension onboarding and it needs to show its step in the top right
      // if there are multiple steps with the same label, it only shows once
      if (extensionIds.length === 1) {
        onboardings[0].steps.forEach(step => {
          if (!onboardingLabels.find(l => l.label === step.label)) {
            onboardingLabels.push({
              label: step.label,
              status: undefined,
            });
          }
        });
      }
      startOnboarding();
    }
  });

  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  contextsUnsubscribe = context.subscribe(async value => {
    globalContext = value;
    const gotStarted = await startOnboarding();
    if (!gotStarted) {
      await assertStepCompleted();
    }
  });
});

let started = false;
async function startOnboarding(): Promise<boolean> {
  if (!started && globalContext && onboardings) {
    started = true;
    if (isOnboardingsSetupCompleted(onboardings)) {
      // ask user if she wants to restart
      setDisplayResetSetup(true);
    } else {
      await restartSetup();
    }
    return true;
  }
  return false;
}

onDestroy(() => {
  if (onboardingUnsubscribe) {
    onboardingUnsubscribe();
  }
  if (contextsUnsubscribe) {
    contextsUnsubscribe();
  }
});

async function setActiveStep() {
  if (!onboardings) {
    console.error(`Unable to retrieve the onboarding workflow`);
    return;
  }
  for (const onboarding of onboardings) {
    if (!onboarding.status) {
      for (let i = 0; i < onboarding.steps.length; i++) {
        const step = onboarding.steps[i];
        if (!step.status) {
          let whenDeserialized;
          if (step.when) {
            const when = normalize(step.when, onboarding.extension);
            whenDeserialized = ContextKeyExpr.deserialize(when);
          }
          if (!step.when || whenDeserialized?.evaluate(globalContext)) {
            activeStep = {
              onboarding,
              step,
            };
            if (step.command) {
              await doExecuteCommand(step.command);
              await assertStepCompleted();
            }
            return;
          } else {
            await updateOnboardingStepStatus(onboarding, step, STATUS_SKIPPED);
            continue;
          }
        }
      }
    }
  }

  // if it reaches this point it means that the onboarding is fully completed and the user is redirected to the dashboard
  router.goto('/');
}

function normalize(when: string, extension: string): string {
  return when.replaceAll(ONBOARDING_CONTEXT_PREFIX, `${extension}.${SCOPE_ONBOARDING}.`);
}

async function doExecuteCommand(command: string) {
  setExecuting(true);
  await window.executeCommand(command);
  if (!executedCommands.includes(command)) {
    executedCommands.push(command);
  }
  setExecuting(false);
}

async function assertStepCompleted() {
  const isCompleted =
    !activeStep.step.completionEvents ||
    activeStep.step.completionEvents.length === 0 ||
    activeStep.step.completionEvents.every(cmp => {
      // check if command has been executed
      if (cmp.startsWith(ON_COMMAND_PREFIX) && executedCommands.includes(cmp.replace(ON_COMMAND_PREFIX, ''))) {
        return true;
      }

      // check if cmp string is an onContext event, check the value from context
      if (cmp.startsWith(ONBOARDING_CONTEXT_PREFIX)) {
        cmp = cmp.replace(ONBOARDING_CONTEXT_PREFIX, `${activeStep.onboarding.extension}.${SCOPE_ONBOARDING}.`);
        const completionEventDeserialized = ContextKeyExpr.deserialize(cmp);
        if (!globalContext) {
          return false;
        }
        return completionEventDeserialized.evaluate(globalContext);
      }

      return false;
    });

  if (isCompleted) {
    await updateOnboardingStepStatus(activeStep.onboarding, activeStep.step, STATUS_COMPLETED);
    // reset executeCommands list
    executedCommands = [];
    await setActiveStep();
  }
}

async function updateOnboardingStepStatus(onboarding: OnboardingInfo, step: OnboardingStep, status: OnboardingStatus) {
  step.status = status;
  updateStepLabel(step.label, status);
  await window.updateStepState(status, onboarding.extension, step.id);
  // if completed view is the last of the whole step, mark this as completed
  if (onboardingLabels[onboardingLabels.length - 1].label === step.label) {
    onboarding.status = STATUS_COMPLETED;
    await window.updateStepState(STATUS_COMPLETED, onboarding.extension);
  }
}

function updateStepLabel(label: string, status: OnboardingStatus) {
  for (const lbl of onboardingLabels) {
    if (lbl.label === label) {
      lbl.status = status;
      return;
    }
  }
}

function isOnboardingsSetupCompleted(onboardings: OnboardingInfo[]): boolean {
  for (const onboarding of onboardings) {
    if (!isOnboardingCompleted(onboarding)) {
      return false;
    }
  }
  return true;
}

function isOnboardingCompleted(onboarding: OnboardingInfo): boolean {
  if (!onboarding.status) {
    return false;
  }
  for (const step of onboarding.steps) {
    if (!step.status) {
      return false;
    }
  }
  return true;
}

function setExecuting(isExecuting: boolean) {
  executing = isExecuting;
}

function next() {
  assertStepCompleted();
}

function setDisplayCancelSetup(display: boolean) {
  displayCancelSetup = display;
}

function setDisplayResetSetup(display: boolean) {
  displayResetSetup = display;
}

async function cancelSetup() {
  // TODO: it cancels all running commands
  // it redirect the user to the dashboard
  await cleanContext();
  router.goto('/');
}

async function restartSetup() {
  await cleanContext();
  onboardings.forEach(onboarding => {
    onboarding.status = undefined;
    onboarding.steps.forEach(step => {
      step.status = undefined;
    });
  });
  setDisplayResetSetup(false);
  await setActiveStep();
}

async function cleanContext() {
  // reset onboarding on backend
  await window.resetOnboarding(extensionIds);
  // clean ui context
  const contextValues = globalContext.collectAllValues();
  onboardings.forEach(onboarding => {
    // remove context key added during the onboarding
    for (const key in contextValues) {
      if (key.startsWith(`${onboarding.extension}.${SCOPE_ONBOARDING}`)) {
        globalContext.removeValue(key);
      }
    }
  });
}
</script>

{#if activeStep}
  <div class="flex flex-col bg-[#36373a] h-full">
    <div class="flex flex-row justify-between mt-5 mx-5 mb-20">
      <div class="flex flew-row">
        {#if activeStep.onboarding.media}
          <img
            class="w-14 h-14 object-contain"
            alt="{activeStep.onboarding.media.altText}"
            src="{activeStep.onboarding.media.path}" />
        {/if}
        <div class="flex flex-col ml-8 my-2">
          <div class="text-lg font-bold text-white">{activeStep.onboarding.title}</div>
          {#if activeStep.onboarding.description}
            <div class="text-sm text-white">{activeStep.onboarding.description}</div>
          {/if}
          <button
            class="flex flex-row text-xs items-center hover:underline"
            on:click="{() => setDisplayCancelSetup(true)}">
            <span class="mr-1">Skip this entire setup</span>
            <Fa icon="{faForward}" size="12" />
          </button>
        </div>
      </div>
      <div class="flex flex-row mt-1 mr-2">
        {#each onboardingLabels as step}
          <div class="flex flex-col mr-2">
            <div class="flex justify-center mb-2">
              {#if step.label === activeStep.step.label}
                <Fa class="place-content-center text-purple-500" size="24" icon="{faFilledCircle}" />
              {:else if step.status === 'completed'}
                <Fa class="place-content-center" size="24" icon="{faCircleCheck}" />
              {:else if step.status === 'skipped'}
                <Fa class="place-content-center" size="24" icon="{faCircleChevronRight}" />
              {:else if step.status === 'failed'}
                <Fa class="place-content-center" size="24" icon="{faCircleXmark}" />
              {:else}
                <Fa class="place-content-center" size="24" icon="{faCircle}" />
              {/if}
            </div>
            <div class="text-sm">{step.label}</div>
          </div>
        {/each}
      </div>
    </div>
    <div class="w-[450px] flex flex-col mx-auto">
      {#if activeStep.step.media}
        <div class="mx-auto">
          <img
            class="w-24 h-24 object-contain"
            alt="{activeStep.step.media.altText}"
            src="{activeStep.step.media.path}" />
        </div>
      {:else if activeStep.onboarding.media}
        <div class="mx-auto">
          <img
            class="w-24 h-24 object-contain"
            alt="{activeStep.onboarding.media.altText}"
            src="{activeStep.onboarding.media.path}" />
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
        <div class="text-lg text-white">{activeStep.step.title}</div>
      </div>
      {#if activeStep.step.description}
        <div class="text-sm text-white mx-auto">{activeStep.step.description}</div>
      {/if}
    </div>

    <div class="flex flex-col mx-auto">
      {#if activeStep.step.content}
        {#each activeStep.step.content as row}
          <div class="flex flex-row mx-auto">
            {#each row as item}
              <OnboardingItem
                extension="{activeStep.onboarding.extension}"
                item="{item}"
                getContext="{() => globalContext}"
                executeCommand="{command => doExecuteCommand(command)}" />
            {/each}
          </div>
        {/each}
      {/if}
    </div>

    {#if !activeStep.step.completionEvents || activeStep.step.completionEvents.length === 0}
      <div class="grow"></div>
      <div class="mb-10 mx-auto text-sm">
        Press the <span class="bg-purple-700 p-0.5">Next</span> button below to proceed.
      </div>
      <div class="flex flex-row-reverse p-6 bg-charcoal-700">
        <button class="bg-purple-700 py-1.5 px-5 rounded-md text-sm" on:click="{() => next()}">Next</button>
        <button class="bg-purple-700 py-1.5 px-5 mr-2 rounded-md text-sm" on:click="{() => setDisplayCancelSetup(true)}"
          >Cancel</button>
      </div>
    {/if}
  </div>
{/if}
{#if displayCancelSetup}
  <!-- Create overlay-->
  <div class="fixed top-0 left-0 right-0 bottom-0 bg-black bg-opacity-60 bg-blend-multiply h-full grid z-50">
    <div class="flex flex-col place-self-center w-[550px] rounded-xl bg-charcoal-800 shadow-xl shadow-black">
      <div class="flex items-center justify-between pl-4 pr-3 py-3 space-x-2 text-gray-400">
        <Fa class="h-4 w-4" icon="{faCircleQuestion}" />
        <span class="grow text-md font-bold capitalize">Skip the entire setup?</span>
      </div>

      <div class="px-10 py-4 text-sm text-gray-500 leading-5">
        If you exit, you can complete your setup later from the Resources page. Do you want to skip it?
      </div>

      <div class="px-5 py-5 mt-2 flex flex-row w-full justify-end space-x-5">
        <button aria-label="Cancel" class="text-xs hover:underline" on:click="{() => setDisplayCancelSetup(false)}"
          >Cancel</button>
        <button class="bg-purple-700 py-1.5 px-5 mr-2 rounded-md text-xs" on:click="{() => cancelSetup()}">Ok</button>
      </div>
    </div>
  </div>
{/if}
{#if displayResetSetup}
  <!-- Create overlay-->
  <div class="fixed top-0 left-0 right-0 bottom-0 bg-black bg-opacity-60 bg-blend-multiply h-full grid z-50">
    <div class="flex flex-col place-self-center w-[550px] rounded-xl bg-charcoal-800 shadow-xl shadow-black">
      <div class="flex items-center justify-between pl-4 pr-3 py-3 space-x-2 text-gray-400">
        <Fa class="h-4 w-4" icon="{faCircleQuestion}" />
        <span class="grow text-md font-bold capitalize">Restart the entire setup?</span>
      </div>

      <div class="px-10 py-4 text-sm text-gray-500 leading-5">
        You have already completed this setup. Do you want to complete it again?
      </div>

      <div class="px-5 py-5 mt-2 flex flex-row w-full justify-end space-x-5">
        <button
          aria-label="Cancel"
          class="text-xs hover:underline"
          on:click="{() => {
            setDisplayResetSetup(false);
            cancelSetup();
          }}">No</button>
        <button class="bg-purple-700 py-1.5 px-5 mr-2 rounded-md text-xs" on:click="{() => restartSetup()}">Yes</button>
      </div>
    </div>
  </div>
{/if}
