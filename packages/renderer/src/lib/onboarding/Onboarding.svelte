<script lang="ts">
import { onDestroy, onMount } from 'svelte';
import type { OnboardingInfo, OnboardingStep, OnboardingStatus } from '../../../../main/src/plugin/api/onboarding';
import { faCircleQuestion } from '@fortawesome/free-regular-svg-icons';
import { faForward } from '@fortawesome/free-solid-svg-icons';
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
import { lastPage } from '/@/stores/breadcrumb';
import Button from '../ui/Button.svelte';
import Link from '../ui/Link.svelte';
import OnboardingComponent from './OnboardingComponent.svelte';
import Spinner from '../ui/Spinner.svelte';

interface ActiveOnboardingStep {
  onboarding: OnboardingInfo;
  step: OnboardingStep;
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

/*
$: enableNextButton = false;*/
let onboardingUnsubscribe: Unsubscriber;
let contextsUnsubscribe: Unsubscriber;
onMount(async () => {
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  onboardingUnsubscribe = onboardingList.subscribe(onboardingItems => {
    if (!onboardings) {
      onboardings = onboardingItems.filter(o => extensionIds.find(extensionId => o.extension === extensionId));
      startOnboarding().catch((err: unknown) => console.warn(String(err)));
    }
  });

  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  contextsUnsubscribe = context.subscribe(value => {
    globalContext = value;
    startOnboarding().catch((err: unknown) => console.warn(String(err)));
  });
});

let started = false;
async function startOnboarding(): Promise<void> {
  if (!started && globalContext && onboardings) {
    started = true;
    if (isOnboardingsSetupCompleted(onboardings)) {
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
  router.goto($lastPage.path);
}

function normalize(when: string, extension: string): string {
  return when.replaceAll(ONBOARDING_CONTEXT_PREFIX, `${extension}.${SCOPE_ONBOARDING}.`);
}

async function doExecuteCommand(command: string) {
  inProgressCommandExecution(command, 'starting');
  try {
    await window.executeCommand(command);
  } catch (e) {
    inProgressCommandExecution(command, 'failed', e);
    return;
  }
  inProgressCommandExecution(command, 'successful');
}

function inProgressCommandExecution(command: string, state: 'starting' | 'failed' | 'successful', value?: unknown) {
  setExecuting(state === 'starting');
  if (state !== 'starting' && command && !executedCommands.includes(command)) {
    executedCommands.push(command);
  }
  if (state === 'failed' && value) {
    // to be displayed in the UI somewhere
    console.error(value);
  }
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
        return completionEventDeserialized?.evaluate(globalContext);
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
  await window.updateStepState(status, onboarding.extension, step.id);
  // if the completed step is the last one, we mark the onboarding as completed
  // the last step should have a completed state by default
  const lastCompletedStep = onboarding.steps.findLast(s => s.state === 'completed');
  if (lastCompletedStep?.id === step.id) {
    onboarding.status = STATUS_COMPLETED;
    await window.updateStepState(STATUS_COMPLETED, onboarding.extension);
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
  router.goto($lastPage.path);
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
    <div class="flex flex-row justify-between mt-5 mx-5 mb-5">
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
    </div>
    {#if activeStep.step.component}
      <div class="min-w-[700px] mx-auto overflow-y-auto" aria-label="onboarding component">
        <OnboardingComponent component="{activeStep.step.component}" extensionId="{activeStep.onboarding.extension}" />
      </div>
    {:else}
      <div class="w-[450px] flex flex-col mt-16 mx-auto" aria-label="step body">
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
              <Spinner />
            </div>
          {/if}
          <div class="text-lg text-white">{activeStep.step.title}</div>
        </div>
        {#if activeStep.step.description}
          <div class="text-sm text-white mx-auto">{activeStep.step.description}</div>
        {/if}
      </div>

      {#if activeStep.step.state === 'failed'}
        <div class="mx-auto mt-4">
          <Button on:click="{() => restartSetup()}">Try again</Button>
        </div>
      {/if}

      <div class="flex flex-col mx-auto">
        {#if activeStep.step.content}
          {#each activeStep.step.content as row}
            <div class="flex flex-row mx-auto">
              {#each row as item}
                <OnboardingItem
                  extension="{activeStep.onboarding.extension}"
                  item="{item}"
                  getContext="{() => globalContext}"
                  inProgressCommandExecution="{inProgressCommandExecution}" />
              {/each}
            </div>
          {/each}
        {/if}
      </div>
    {/if}

    {#if !activeStep.step.completionEvents || activeStep.step.completionEvents.length === 0}
      <div class="grow"></div>
      {#if activeStep.step.state !== 'failed'}
        <div class="mb-10 mx-auto text-sm" aria-label="next-info-message">
          Press the <span class="bg-purple-700 p-0.5">Next</span> button below to proceed.
        </div>
      {:else}
        <div class="mb-10 mx-auto text-sm" aria-label="exit-info-message">
          <Link on:click="{() => setDisplayCancelSetup(true)}">Exit</Link> the setup. You can try again later.
        </div>
      {/if}
      <div class="flex flex-row-reverse p-6 bg-charcoal-700">
        <Button type="primary" disabled="{activeStep.step.state === 'failed'}" on:click="{() => next()}">Next</Button>
        {#if activeStep.step.state !== 'completed'}
          <Button type="secondary" aria-label="Cancel setup" class="mr-2" on:click="{() => setDisplayCancelSetup(true)}"
            >Cancel</Button>
        {/if}
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
        <Button type="secondary" aria-label="Cancel" on:click="{() => setDisplayCancelSetup(false)}">Cancel</Button>
        <Button type="primary" class="mr-2" on:click="{() => cancelSetup()}">Ok</Button>
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
        <Button
          type="secondary"
          aria-label="Cancel"
          on:click="{() => {
            setDisplayResetSetup(false);
            cancelSetup();
          }}">No</Button>
        <Button type="primary" class="mr-2" on:click="{() => restartSetup()}">Yes</Button>
      </div>
    </div>
  </div>
{/if}
