<style lang="postcss">
#stepBody::-webkit-scrollbar {
  width: 1em;
  height: 50%;
}
#stepBody::-webkit-scrollbar-track {
  -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.3);
}
#stepBody::-webkit-scrollbar-thumb {
  background-color: [var(--pd-button-tab-hover-border)];
}
#stepBody::-webkit-scrollbar-thumb:hover {
  background-color: [var(--pd-button-tab-hover-border)];
}
#stepBody::-webkit-scrollbar-thumb:active {
  background-color: [var(--pd-button-tab-hover-border)];
}
#stepBody::-webkit-scrollbar-track-piece:start {
  background: transparent;
  margin-top: 100px;
}
.bodyWithBar::-webkit-scrollbar-track-piece:end {
  background: transparent;
  margin-bottom: 70px;
}
</style>

<script lang="ts">
import { faCircleQuestion } from '@fortawesome/free-regular-svg-icons';
import { faForward } from '@fortawesome/free-solid-svg-icons';
import { Button, Link, Spinner } from '@podman-desktop/ui-svelte';
import { onDestroy, onMount } from 'svelte';
import type { Unsubscriber } from 'svelte/store';
import Fa from 'svelte-fa';
import { router } from 'tinro';

import { lastPage } from '/@/stores/breadcrumb';
import { context } from '/@/stores/context';
import { onboardingList } from '/@/stores/onboarding';
import type { OnboardingInfo, OnboardingStepItem } from '/@api/onboarding';

import type { ContextUI } from '../context/context';
import { ContextKeyExpr } from '../context/contextKey';
import {
  type ActiveOnboardingStep,
  cleanSetup,
  isStepCompleted,
  normalizeOnboardingWhenClause,
  replaceContextKeyPlaceholders,
  STATUS_COMPLETED,
  STATUS_SKIPPED,
  updateOnboardingStepStatus,
} from './onboarding-utils';
import OnboardingComponent from './OnboardingComponent.svelte';
import OnboardingItem from './OnboardingItem.svelte';
import { OnboardingTelemetrySession } from './telemetry';

export let extensionIds: string[] = [];
export let global: boolean = false;

let onboardings: OnboardingInfo[] = [];
$: onboardingItems = onboardings;
let activeStep: ActiveOnboardingStep;
let activeStepContent: OnboardingStepItem[][];

$: executing = false;
let globalContext: ContextUI;
let displayCancelSetup = false;

let executedCommands: string[] = [];

let telemetrySession = new OnboardingTelemetrySession();

let onboardingUnsubscribe: Unsubscriber;
let contextsUnsubscribe: Unsubscriber;
// variable used to mark if the onboarding is running or not
let started = false;
onMount(async () => {
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  onboardingUnsubscribe = onboardingList.subscribe(onboardingItems => {
    if (onboardings.length === 0) {
      onboardings = onboardingItems.filter(o => extensionIds.find(extensionId => o.extension === extensionId));
      startOnboarding().catch((err: unknown) => console.warn(String(err)));
    }
  });

  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  contextsUnsubscribe = context.subscribe(value => {
    globalContext = value;

    // When the context is updated while on the content page,
    // update the step content to show / hide rows based on the "when" clause
    activeStepContent =
      activeStep?.step.content?.map(row => {
        return row.filter(item => {
          return evaluateWhen(item.when, activeStep.onboarding.extension);
        });
      }) ?? [];

    // when the context is updated it checks if the onboarding already started
    if (started) {
      //if the onboarding is running, it means there is an active step and verifies if it is complete.
      // e.g the step depends on the value of context.item, context has been refreshed and we verify context.item has the value needed to mark the step as completed.
      assertStepCompleted().catch((err: unknown) => console.warn(String(err)));
    } else {
      //if the onboarding has not started yet, start it
      startOnboarding().catch((err: unknown) => console.warn(String(err)));
    }
  });
});

async function startOnboarding(): Promise<void> {
  if (!started && globalContext && onboardings.length > 0) {
    started = true;
    telemetrySession.restart();
    await restartSetup();
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
  if (onboardings.length === 0) {
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
            const when = normalizeOnboardingWhenClause(step.when, onboarding.extension);
            whenDeserialized = ContextKeyExpr.deserialize(when);
          }
          if (!step.when || whenDeserialized?.evaluate(globalContext)) {
            telemetrySession.startStep(i, step.id, step.title);
            activeStep = {
              onboarding,
              step,
            };
            // When the context is updated while on the content page,
            // update the step content to show / hide rows based on the "when" clause
            activeStepContent =
              step.content?.map(row => {
                return row.filter(item => {
                  return evaluateWhen(item.when, onboarding.extension);
                });
              }) ?? [];
            if (step.command) {
              try {
                await doExecuteCommand(step.command);
              } catch (error: unknown) {
                if (error instanceof Error) {
                  telemetrySession.setStepError(i, step.id, error);
                }
              }
              // after command has been executed, we check if the step must be marked as completed
              await assertStepCompletedAfterCommandExecution();
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
  telemetrySession.send(onboardings.map(o => o.extension).join(','), false);
  // if it reaches this point it means that the onboarding is fully completed and the user is redirected to the dashboard
  router.goto($lastPage.path);
}

// Evaluate the "when" clause with the extension and return true / false
function evaluateWhen(when: string | undefined, extension: string): boolean {
  // If there's no when, just return true
  if (!when) {
    return true;
  }

  // Serialize and return the evaluation of the when clause
  // based upon the global context
  const whenDeserialized = ContextKeyExpr.deserialize(normalizeOnboardingWhenClause(when, extension));
  if (whenDeserialized) {
    return whenDeserialized.evaluate(globalContext);
  }
  return false;
}

async function doExecuteCommand(command: string) {
  inProgressCommandExecution(command, 'starting');
  try {
    await window.executeCommand(command);
  } catch (e) {
    inProgressCommandExecution(command, 'failed', e);
    throw e;
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

/**
 * it verifies if a step must be marked as completed by checking that the step does not depend on any completion event or, if any, that they only
 * contains name of commands that have been executed.
 *
 * N.B: If the step depends on the value of a context item, the step will not be updated.
 *      if you need to verify that a step is completed by looking at some context values use `assertStepCompleted`
 */
async function assertStepCompletedAfterCommandExecution() {
  if (isStepCompleted(activeStep, executedCommands)) {
    await updateOnboardingStep();
  }
}

/**
 * it verifies if a step must be marked as completed by checking that the step does not depend on any completion event or, if any, that they have
 * been satisfied.
 * Most probably it is only called when the context is updated.
 */
async function assertStepCompleted() {
  if (isStepCompleted(activeStep, executedCommands, globalContext)) {
    await updateOnboardingStep();
  }
}

function setExecuting(isExecuting: boolean) {
  executing = isExecuting;
}

function next() {
  const isCompleted = !activeStep.step.completionEvents || activeStep.step.completionEvents.length === 0;
  if (isCompleted) {
    updateOnboardingStep().catch((err: unknown) => console.warn(String(err)));
  }
}

/*
 * it update the status of the step in the backend and calculate which is the new active step to display
 */
async function updateOnboardingStep() {
  await updateOnboardingStepStatus(activeStep.onboarding, activeStep.step, STATUS_COMPLETED);
  // reset executeCommands list
  executedCommands = [];
  await setActiveStep();
}

function setDisplayCancelSetup(display: boolean) {
  displayCancelSetup = display;
}

async function cancelSetup() {
  // TODO: it cancels all running commands
  // it redirect the user to the dashboard
  await cleanSetup(onboardings, globalContext);
  telemetrySession.send(onboardings.map(o => o.extension).join(','), true);
  router.goto($lastPage.path);
}

async function restartSetup() {
  await cleanSetup(onboardings, globalContext);
  await setActiveStep();
}

// If the user hits escape, prompt them to exit the onboarding
function handleEscape({ key }: any) {
  if (key === 'Escape') {
    setDisplayCancelSetup(true);
  }
}

async function skipCurrentOnboarding() {
  if (activeStep) {
    // Find the current onboarding based on the activeStep's extension
    const currentOnboarding = onboardings.find(o => o.extension === activeStep.onboarding.extension);
    if (currentOnboarding) {
      // Iterate over each step of the current onboarding
      for (const step of currentOnboarding.steps) {
        // Update each step's status to STATUS_SKIPPED
        await updateOnboardingStepStatus(currentOnboarding, step, STATUS_SKIPPED);
      }
    }
    // Set the next active step after skipping the current onboarding
    await setActiveStep();
  }
}

// Below is reactive classes & variables for globalOnboarding, this is needed
// when doing the "global onboarding" sequence, replacing some UI elements with
// full-screen ones.
let globalOnboarding = false;
$: globalOnboarding = global;
</script>

<svelte:window on:keydown={handleEscape} />

{#if activeStep}
  <!-- fake div used to hide scrollbar shadow behind the header as it's a bit transparent  -->
  <div class="fixed bg-[var(--pd-content-card-bg)] right-0 top-0 h-[100px] w-[30px] z-10 mt-8"></div>
  <div
    id="stepBody"
    role="region"
    aria-label="Onboarding Body"
    class="flex flex-col bg-[var(--pd-content-card-bg)] text-[var(--pd-details-body-text)] {globalOnboarding
      ? 'flex-auto fixed top-0 left-0 right-0 bottom-0 bg-no-repeat z-[45] pt-9 overflow-y-auto'
      : 'h-full overflow-y-auto w-full overflow-x-hidden'}"
    class:bodyWithBar={!activeStep.step.completionEvents || activeStep.step.completionEvents.length === 0}>
    <div class="flex flex-col h-full">
      <div
        class="flex flex-row justify-between h-[100px] p-5 z-20 fixed w-full bg-opacity-90 bg-[var(--pd-content-bg)]"
        role="heading"
        aria-level={2}
        aria-label="{activeStep.onboarding.title} Header">
        <div class="flex flew-row">
          {#if activeStep?.onboarding?.media && !globalOnboarding}
            <img
              class="w-14 h-14 object-contain mr-3"
              alt={activeStep.onboarding.media.altText}
              src={activeStep.onboarding.media.path} />
          {/if}
          <div class="flex flex-col">
            {#if globalOnboarding}
              <div class="text-lg font-bold text-[var(--pd-content-header)]">Get started with Podman Desktop</div>
            {:else}
              <div class="text-lg font-bold text-[var(--pd-content-header)]">
                {replaceContextKeyPlaceholders(
                  activeStep.onboarding.title,
                  activeStep.onboarding.extension,
                  globalContext,
                )}
              </div>
              {#if activeStep.onboarding.description}
                <div class="text-sm text-[var(--pd-content-sub-header)]">
                  {replaceContextKeyPlaceholders(
                    activeStep.onboarding.description,
                    activeStep.onboarding.extension,
                    globalContext,
                  )}
                </div>
              {/if}
            {/if}
            <button
              class="flex flex-row text-xs items-center hover:underline text-[var(--pd-content-sub-header)] mt-1"
              on:click={() => setDisplayCancelSetup(true)}>
              <span class="mr-1">Skip this entire setup</span>
              <Fa icon={faForward} size="0.8x" />
            </button>
          </div>
        </div>
        <!-- New section for listing onboardings -->
        {#if globalOnboarding}
          <div class="flex justify-right mr-3">
            {#each onboardingItems as onboarding}
              <div class="flex flex-col items-center ml-8">
                <!-- Dot indicating active/inactive state -->
                <span>
                  <div
                    class="w-5 h-5 rounded-full mb-1 border-2 {onboarding.extension ===
                    activeStep?.onboarding?.extension
                      ? 'bg-[var(--pd-onboarding-active-dot-bg)] border-[var(--pd-onboarding-active-dot-border)]'
                      : 'border-[var(--pd-onboarding-inactive-dot-border)] bg-[var(--pd-onboarding-inactive-dot-bg)]'}">
                  </div></span>

                <!-- Onboarding title -->
                <div class="text-md">
                  {onboarding.title}
                </div>

                <!-- Skip button for the onboarding -->
                {#if onboarding.extension === activeStep?.onboarding?.extension}
                  <button
                    class="mt-1 flex flex-row text-xs items-center hover:underline text-[var(--pd-content-sub-header)]"
                    on:click={() => skipCurrentOnboarding()}>
                    <span class="mr-1">Skip</span>
                    <Fa icon={faForward} size="0.8x" />
                  </button>
                {/if}
              </div>
            {/each}
          </div>
        {/if}
      </div>
      {#if activeStep.step.component}
        <div class="min-w-[700px] mx-auto mt-32" aria-label="Onboarding Component">
          <OnboardingComponent component={activeStep.step.component} extensionId={activeStep.onboarding.extension} />
        </div>
      {:else}
        <div class="w-[450px] flex flex-col mt-16 pt-24 mx-auto" aria-label="Step Body">
          {#if activeStep.step.media}
            <div class="mx-auto">
              <img
                class="w-24 h-24 object-contain"
                alt={activeStep.step.media.altText}
                src={activeStep.step.media.path} />
            </div>
          {:else if activeStep.onboarding.media}
            <div class="mx-auto">
              <img
                class="w-24 h-24 object-contain"
                alt={activeStep.onboarding.media.altText}
                src={activeStep.onboarding.media.path} />
            </div>
          {/if}
          <div class="flex flex-row mx-auto">
            {#if executing}
              <div class="mt-1 mr-6">
                <Spinner />
              </div>
            {/if}
            <div class="text-lg" aria-label="Onboarding Status Message">
              {replaceContextKeyPlaceholders(activeStep.step.title, activeStep.onboarding.extension, globalContext)}
            </div>
          </div>
          {#if activeStep.step.description}
            <div class="text-sm mx-auto">
              {replaceContextKeyPlaceholders(
                activeStep.step.description,
                activeStep.onboarding.extension,
                globalContext,
              )}
            </div>
          {/if}
        </div>

        {#if activeStep.step.state === 'failed'}
          <div class="mx-auto mt-4">
            <Button on:click={() => restartSetup()}>Try again</Button>
          </div>
        {/if}

        <div class="max-w-[80%] flex flex-col mx-auto">
          {#if activeStepContent}
            {#each activeStepContent as row}
              <div class="flex flex-row mx-auto">
                {#each row as item}
                  <OnboardingItem
                    extension={activeStep.onboarding.extension}
                    item={item}
                    inProgressCommandExecution={inProgressCommandExecution} />
                {/each}
              </div>
            {/each}
          {/if}
        </div>
      {/if}

      {#if !activeStep.step.completionEvents || activeStep.step.completionEvents.length === 0}
        <!-- fake div used to hide scrollbar shadow  -->
        {#if !globalOnboarding}
          <div class="fixed bg-[var(--pd-details-bg)] right-0 bottom-0 h-[70px] w-[30px] z-10 mb-6"></div>
        {/if}
        <div class="grow"></div>
        {#if activeStep.step.state !== 'failed'}
          <div class="mt-10 mx-auto text-sm min-h-[120px]" aria-label="Next Info Message">
            Press the <span class="text-[var(--pd-button-text)] bg-[var(--pd-button-primary-bg)] p-0.5">Next</span> button
            below to proceed.
          </div>
        {:else}
          <div class="mt-10 mx-auto text-sm min-h-[120px]" aria-label="Exit Info Message">
            <Link on:click={() => setDisplayCancelSetup(true)}>Exit</Link> the setup. You can try again later.
          </div>
        {/if}
        <div
          class="flex flex-row-reverse p-6 bg-[var(--pd-content-bg)] fixed {globalOnboarding
            ? 'w-full'
            : 'w-[calc(100%-theme(width.leftnavbar)-theme(width.leftsidebar))] mb-5'} bottom-0 pr-10 max-h-20 bg-opacity-90 z-20"
          role="group"
          aria-label="Step Buttons">
          <Button
            type="primary"
            aria-label="Next Step"
            disabled={activeStep.step.state === 'failed'}
            on:click={() => next()}>Next</Button>
          {#if activeStep.step.state !== 'completed'}
            <Button
              type="secondary"
              aria-label="Cancel Setup"
              class="mr-2 opacity-100"
              on:click={() => setDisplayCancelSetup(true)}>Cancel</Button>
          {/if}
        </div>
      {/if}
    </div>
  </div>
{/if}
{#if displayCancelSetup}
  <!-- Create overlay-->
  <div class="fixed top-0 left-0 right-0 bottom-0 bg-black bg-opacity-60 bg-blend-multiply h-full grid z-50">
    <div
      class="flex flex-col place-self-center w-[550px] rounded-xl bg-[var(--pd-modal-bg)] shadow-xl shadow-black"
      role="dialog"
      aria-label="Skip Setup Popup">
      <div class="flex items-center justify-between pl-4 pr-3 py-3 space-x-2 text-[var(--pd-modal-header-text)]">
        <Fa class="h-4 w-4" icon={faCircleQuestion} />
        <span class="grow text-md font-bold capitalize">Skip the entire setup?</span>
      </div>

      <div class="px-10 py-4 text-sm text-[var(--pd-modal-text)] leading-5">
        If you exit, you can complete your setup later from the Resources page. Do you want to skip it?
      </div>

      <div class="px-5 py-5 mt-2 flex flex-row w-full justify-end space-x-5">
        <Button type="secondary" aria-label="Cancel" on:click={() => setDisplayCancelSetup(false)}>Cancel</Button>
        <Button type="primary" class="mr-2" on:click={() => cancelSetup()}>Ok</Button>
      </div>
    </div>
  </div>
{/if}
