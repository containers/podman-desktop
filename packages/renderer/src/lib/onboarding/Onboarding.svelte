<script lang="ts">
import { extensionInfos } from '../../stores/extensions';
import type { ExtensionInfo } from '../../../../main/src/plugin/api/extension-info';
import { onDestroy, onMount } from 'svelte';
import type {
  OnboardingInfo,
  OnboardingStep,
  OnboardingStepStatus,
  OnboardingStepView,
} from '../../../../main/src/plugin/api/onboarding';
import { faCircle } from '@fortawesome/free-regular-svg-icons';
import {
  faCircleCheck,
  faCircleQuestion,
  faCircle as faFilledCircle,
  faForward,
} from '@fortawesome/free-solid-svg-icons';
import Fa from 'svelte-fa/src/fa.svelte';
import type { Unsubscriber } from 'svelte/store';
import { onboardingList } from '/@/stores/onboarding';
import OnboardingItem from './OnboardingItem.svelte';
import type { ContextUI } from '../context/context';
import { contexts } from '/@/stores/contexts';
import { ContextKeyExpr } from '../context/contextKey';
import { router } from 'tinro';

interface ActiveStep {
  step: OnboardingStep;
  view: OnboardingStepView;
}

export let extensionId: string = undefined;

let extensionInfo: ExtensionInfo;
$: extensionInfo = $extensionInfos.find(extension => extension.id === extensionId);
let onboarding: OnboardingInfo;
let activeStep: ActiveStep;
$: activeStep;

$: executing = false;
let context: ContextUI;
let displayCancelSetup = false;
let displayResetSetup = false;

let contextKeys: string[] = [];
let executionId = 0;
let executions: number[] = [];
/*
$: enableNextButton = false;*/
let onboardingUnsubscribe: Unsubscriber;
let contextsUnsubscribe: Unsubscriber;
onMount(async () => {
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  onboardingUnsubscribe = onboardingList.subscribe(onboardingItems => {
    if (!onboarding) {
      onboarding = onboardingItems.find(o => o.extension === extensionId);
      startOnboarding();
    }
  });

  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  contextsUnsubscribe = contexts.subscribe(value => {
    context = value.find(ctx => ctx.extension === extensionId);
    startOnboarding();
  });
});

let started = false;
async function startOnboarding() {
  if (!started && context && onboarding) {
    started = true;
    if (isOnboardingCompleted(onboarding)) {
      // ask user if she wants to restart
      setDisplayResetSetup(true);
    } else {
      await restartSetup();
    }
  }
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
  if (!onboarding) {
    console.error(`Unable to retrieve the onboarding workflow for ${extensionInfo?.displayName}`);
    return;
  }
  for (const step of onboarding.steps) {
    if (!step.status) {
      for (let i = 0; i < step.views.length; i++) {
        const view = step.views[i];
        if (!view.status) {
          let whenDeserialized;
          if (view.when) {
            whenDeserialized = ContextKeyExpr.deserialize(view.when);
          }
          if (!view.when || whenDeserialized?.evaluate(context)) {
            activeStep = {
              step,
              view,
            };
            await doExecuteCommandsAtActivation(activeStep);
            return;
          } else {
            await updateStepViewStatus(step, view, 'skipped');
            continue;
          }
        }
      }
    }
  }

  // if it reaches this point it means that the onboarding is fully completed and the user is redirected to the dashboard
  cleanContext();
  router.goto('/');
}

async function doExecuteCommandsAtActivation(active: ActiveStep) {
  for (const cmd of active.view.commandAtActivation || []) {
    setExecuting(true);
    await window.executeOnboardingCommand(getExecutionId(), extensionId, active.step.id, cmd.command);
    setExecuting(false);
  }
}

function getExecutionId(): number {
  ++executionId;
  executions.push(executionId);
  return executionId;
}

let eventsCompleted: string[] = [];
window.events?.receive('onboarding:command-executed', async result => {
  // this is a hack to keep the state safe whean receiving multiple events for the same action
  const indexExecution = executions.indexOf(result.executionId);
  if (indexExecution === -1) {
    return;
  }
  executions.splice(indexExecution, 1);

  if (result.status === 'failed') {
    console.error(`Failed at executing command ${result.command}: ${result.body.error}`);
    return;
  }
  context?.setValue(result.command, result.body);
  contextKeys.push(result.command);
  if (!eventsCompleted.includes(result.command)) {
    eventsCompleted.push(result.command);
  }
  await assertStepCompleted();
});

async function assertStepCompleted() {
  const isCompleted =
    !activeStep.view.completionEvents ||
    activeStep.view.completionEvents.length === 0 ||
    activeStep.view.completionEvents.every(cmp => {
      // check if eventCompleted contains the event required by the step to be considered complete
      if (eventsCompleted.includes(cmp)) {
        return true;
      }
      // check if cmp string stem is in eventCompleted and find the value required from context
      const completionEventDeserialized = ContextKeyExpr.deserialize(cmp);
      return completionEventDeserialized.evaluate(context);
    });

  if (isCompleted) {
    await updateStepViewStatus(activeStep.step, activeStep.view, 'completed');
    resetUI();
    await setActiveStep();
  }
}

async function updateStepViewStatus(step: OnboardingStep, view: OnboardingStepView, status: OnboardingStepStatus) {
  view.status = status;
  await window.updateStepState(status, extensionId, step.id, view.id);
  const views = step.views;
  // if completed view is the last of the whole step, mark this as completed
  if (views[views.length - 1].id === view.id) {
    step.status = 'completed';
    await window.updateStepState('completed', extensionId, step.id);
  }
}

function isOnboardingCompleted(onboarding: OnboardingInfo): boolean {
  let completed = true;
  onboarding.steps.forEach(step => {
    if (!step.status) {
      completed = false;
    }
    step.views.forEach(view => {
      if (!view.status) {
        completed = false;
      }
    });
  });
  return completed;
}

function resetUI() {
  eventsCompleted = [];
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

function cancelSetup() {
  // TODO: it cancels all running commands
  // it redirect the user to the dashboard
  cleanContext();
  router.goto('/');
}

async function restartSetup() {
  await window.resetOnboarding(extensionId);
  onboarding.steps.forEach(step => {
    step.status = undefined;
    step.views.forEach(view => {
      view.status = undefined;
    });
  });
  setDisplayResetSetup(false);
  await setActiveStep();
}

function cleanContext() {
  for (const key of contextKeys) {
    context.removeValue(key);
  }
}
</script>

{#if onboarding && activeStep}
  <div class="flex flex-col bg-[#36373a] h-full">
    <div class="flex flex-row justify-between mb-20">
      {#if activeStep.step.media}
        <img
          class="w-14 h-14 object-contain"
          alt="{activeStep.step.media.altText}"
          src="{activeStep.step.media.path}" />
      {/if}
      <div class="flex flex-col ml-8 my-2">
        <div class="text-lg font-bold text-white">{activeStep.step.title}</div>
        {#if activeStep.step.description}
          <div class="text-sm text-white">{activeStep.step.description}</div>
        {/if}
        <button
          class="flex flex-row text-xs items-center hover:underline"
          on:click="{() => setDisplayCancelSetup(true)}">
          <span class="mr-1">Skip this entire setup</span>
          <Fa icon="{faForward}" size="12" />
        </button>
      </div>
      <div class="flex flex-row mt-1 mr-2">
        {#each onboarding.steps as step}
          <div class="flex flex-col mr-2">
            <div class="flex justify-center mb-2">
              {#if step.id === activeStep.step.id}
                <Fa class="place-content-center text-purple-500" size="24" icon="{faFilledCircle}" />
              {:else if step.status === 'completed'}
                <Fa class="place-content-center" size="24" icon="{faCircleCheck}" />
              {:else}
                <Fa class="place-content-center" size="24" icon="{faCircle}" />
              {/if}
            </div>
            <div class="text-sm">{step.title}</div>
          </div>
        {/each}
      </div>
    </div>
    <div class="w-[450px] flex flex-col mx-auto">
      {#if activeStep.view.media}
        <div class="mx-auto">
          <img
            class="w-24 h-24 object-contain"
            alt="{activeStep.view.media.altText}"
            src="{activeStep.view.media.path}" />
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
        <div class="text-lg text-white">{activeStep.view.title}</div>
      </div>
      {#if activeStep.view.description}
        <div class="text-sm text-white mx-auto">{activeStep.view.description}</div>
      {/if}
    </div>

    <div class="flex flex-col mx-auto">
      {#if activeStep.view.content}
        {#each activeStep.view.content as row}
          <div class="flex flex-row mx-auto">
            {#each row as item}
              <OnboardingItem
                item="{item}"
                extensionId="{extensionId}"
                step="{activeStep.step.id}"
                context="{context}"
                setExecuting="{setExecuting}"
                getExecutionId="{getExecutionId}" />
            {/each}
          </div>
        {/each}
      {/if}
    </div>

    {#if !activeStep.view.completionEvents || activeStep.view.completionEvents.length === 0}
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
