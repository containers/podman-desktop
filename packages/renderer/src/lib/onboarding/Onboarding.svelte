<script lang="ts">
import type { OnboardingInfo, OnboardingStepItem } from '@desktop-framework/api';
import { faCircleQuestion } from '@fortawesome/free-regular-svg-icons';
import { faForward } from '@fortawesome/free-solid-svg-icons';
import { Button, ButtonRow, Spinner } from '@podman-desktop/ui-svelte';
import { Icon } from '@podman-desktop/ui-svelte/icons';
import { onDestroy, onMount } from 'svelte';
import type { Unsubscriber } from 'svelte/store';
import { router } from 'tinro';

import type { ContextUI } from '/@/lib/context/context';
import { ContextKeyExpr } from '/@/lib/context/contextKey';
import { lastPage } from '/@/stores/breadcrumb';
import { context } from '/@/stores/context';
import { onboardingList } from '/@/stores/onboarding';

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
import OnboardingWizardShell from './wizard/OnboardingWizardShell.svelte';

interface Props {
  extensionIds?: string[];
  global?: boolean;
}

let { extensionIds = [], global = false }: Props = $props();

let onboardings: OnboardingInfo[] = $state(
  $onboardingList.filter(o => extensionIds.find(extensionId => o.extension === extensionId)),
);
let activeStep: ActiveOnboardingStep | undefined = $state();
let activeStepContent: OnboardingStepItem[][] = $derived(
  activeStep?.step.content?.map(row => {
    return row.filter(item => {
      return evaluateWhen(item.when, activeStep?.onboarding.extension ?? '');
    });
  }) ?? [],
);

let executing: boolean = $state(false);
let globalContext: ContextUI = $derived($context);
let displayCancelSetup: boolean = $state(false);

let executedCommands: string[] = [];

let telemetrySession = new OnboardingTelemetrySession();

let welcomeMessage: string = $derived(activeStep?.onboarding.welcomeMessage ?? '');

let contextsUnsubscribe: Unsubscriber;
// variable used to mark if the onboarding is running or not
let started = $state(false);
onMount(() => {
  if (onboardings.length === 0) {
    startOnboarding().catch((err: unknown) => console.warn(String(err)));
  }

  contextsUnsubscribe = context.subscribe(() => {
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
  if (contextsUnsubscribe) {
    contextsUnsubscribe();
  }
});

async function setActiveStep(): Promise<void> {
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

async function doExecuteCommand(command: string): Promise<void> {
  inProgressCommandExecution(command, 'starting');
  try {
    await window.executeCommand(command);
  } catch (e) {
    inProgressCommandExecution(command, 'failed', e);
    throw e;
  }
  inProgressCommandExecution(command, 'successful');
}

function inProgressCommandExecution(
  command: string,
  state: 'starting' | 'failed' | 'successful',
  value?: unknown,
): void {
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
async function assertStepCompletedAfterCommandExecution(): Promise<void> {
  if (activeStep && isStepCompleted(activeStep, executedCommands)) {
    await updateOnboardingStep();
  }
}

/**
 * it verifies if a step must be marked as completed by checking that the step does not depend on any completion event or, if any, that they have
 * been satisfied.
 * Most probably it is only called when the context is updated.
 */
async function assertStepCompleted(): Promise<void> {
  if (activeStep && isStepCompleted(activeStep, executedCommands, globalContext)) {
    await updateOnboardingStep();
  }
}

function setExecuting(isExecuting: boolean): void {
  executing = isExecuting;
}

function next(): void {
  const isCompleted = !activeStep?.step.completionEvents || activeStep?.step.completionEvents.length === 0;
  if (isCompleted) {
    updateOnboardingStep().catch((err: unknown) => console.warn(String(err)));
  }
}

/*
 * it update the status of the step in the backend and calculate which is the new active step to display
 */
async function updateOnboardingStep(): Promise<void> {
  if (activeStep) {
    await updateOnboardingStepStatus(activeStep.onboarding, activeStep.step, STATUS_COMPLETED);
  }
  // reset executeCommands list
  executedCommands = [];
  await setActiveStep();
}

function setDisplayCancelSetup(display: boolean): void {
  displayCancelSetup = display;
}

async function cancelSetup(): Promise<void> {
  // TODO: it cancels all running commands
  // it redirect the user to the dashboard
  await cleanSetup(onboardings, globalContext);
  telemetrySession.send(onboardings.map(o => o.extension).join(','), true);
  router.goto($lastPage.path);
}

async function restartSetup(): Promise<void> {
  await cleanSetup(onboardings, globalContext);
  await setActiveStep();
}

// If the user hits escape, prompt them to exit the onboarding
function handleEscape({ key }: KeyboardEvent): void {
  if (key === 'Escape') {
    setDisplayCancelSetup(true);
  }
}

async function skipCurrentOnboarding(): Promise<void> {
  if (activeStep) {
    // Find the current onboarding based on the activeStep's extension
    const currentOnboarding = onboardings.find(o => o.extension === activeStep?.onboarding.extension);
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
let globalOnboarding = $derived(global);

let sidebarTitle = $derived(
  activeStep
    ? globalOnboarding
      ? replaceContextKeyPlaceholders(welcomeMessage, activeStep.onboarding.extension, globalContext)
      : replaceContextKeyPlaceholders(activeStep.onboarding.title, activeStep.onboarding.extension, globalContext)
    : '',
);
</script>

<svelte:window on:keydown={handleEscape} />

{#if activeStep}
  <div class={globalOnboarding ? 'fixed inset-0 z-45 flex flex-col bg-[var(--pd-content-card-bg)]' : 'h-full w-full'}>
    {#if globalOnboarding}
      <!-- Drag handle replaces the covered title bar so the window stays movable -->
      <div class="h-10 shrink-0" style="-webkit-app-region: drag;" aria-hidden="true"></div>
    {/if}
    <OnboardingWizardShell
      sidebarTitle={sidebarTitle}
      hideSidebar={!globalOnboarding}
      role="region"
      aria-label="Onboarding Body"
      class={globalOnboarding ? 'min-h-0 flex-1 bg-[var(--pd-content-card-bg)]' : 'bg-[var(--pd-content-card-bg)]'}>

    {#snippet leftSidebar()}
      {#if activeStep}
        {#if globalOnboarding}
          <nav aria-label="Setup steps">
            <ol class="space-y-4">
              {#each onboardings as onboarding, index (index)}
                <li
                  class="flex items-start gap-3"
                  aria-current={onboarding.extension === activeStep.onboarding.extension ? 'step' : undefined}>
                  <div
                    class="mt-0.5 h-4 w-4 shrink-0 rounded-full border-2 {onboarding.extension === activeStep.onboarding.extension
                      ? 'bg-[var(--pd-onboarding-active-dot-bg)] border-[var(--pd-onboarding-active-dot-border)]'
                      : 'border-[var(--pd-onboarding-inactive-dot-border)] bg-[var(--pd-onboarding-inactive-dot-bg)]'}">
                  </div>
                  <div class="flex flex-col">
                    <span class="text-sm {onboarding.extension === activeStep.onboarding.extension ? 'font-semibold text-[var(--pd-content-header)]' : 'text-[var(--pd-content-sub-header)]'}">
                      {onboarding.title}
                    </span>
                    {#if onboarding.extension === activeStep.onboarding.extension}
                      <button
                        class="mt-0.5 flex flex-row text-xs items-center hover:underline text-[var(--pd-content-sub-header)]"
                        onclick={skipCurrentOnboarding}>
                        <span class="mr-1">Skip</span>
                        <Icon icon={faForward} size="0.8x" />
                      </button>
                    {/if}
                  </div>
                </li>
              {/each}
            </ol>
          </nav>
        {/if}
      {/if}
    {/snippet}

    {#snippet leftSidebarFooter()}
      <button
        class="flex flex-row text-xs items-center hover:underline text-[var(--pd-content-sub-header)]"
        onclick={(): void => setDisplayCancelSetup(true)}>
        <span class="mr-1">Skip this entire setup</span>
        <Icon icon={faForward} size="0.8x" />
      </button>
    {/snippet}

    {#snippet rightContent()}
      {#if activeStep}
        {#if activeStep.step.component}
          <div class="w-full max-w-[700px] mx-auto pt-4" aria-label="Onboarding Component">
            <OnboardingComponent component={activeStep.step.component} extensionId={activeStep.onboarding.extension} />
          </div>
        {:else}
          <div class="max-w-lg flex flex-col pt-12 mx-auto" aria-label="Step Body">
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
              <Button on:click={restartSetup}>Try again</Button>
            </div>
          {/if}

          <div class="max-w-[80%] flex flex-col mx-auto">
            {#if activeStepContent}
              {#each activeStepContent as row, index (index)}
                <div class="flex flex-row mx-auto">
                  {#each row as item, index (index)}
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
      {/if}
    {/snippet}

    {#snippet footer()}
      {#if activeStep && (!activeStep.step.completionEvents || activeStep.step.completionEvents.length === 0)}
        <div
          class="flex justify-end gap-3"
          role="group"
          aria-label="Step Buttons">
          {#if activeStep.step.state !== 'completed'}
            <Button
              type="secondary"
              aria-label="Cancel Setup"
              on:click={(): void => setDisplayCancelSetup(true)}>Cancel</Button>
          {/if}
          <Button
            type="primary"
            aria-label="Next Step"
            disabled={activeStep.step.state === 'failed'}
            on:click={next}>Next</Button>
        </div>
      {/if}
    {/snippet}
    </OnboardingWizardShell>
  </div>
{/if}

{#if displayCancelSetup}
  <!-- Create overlay-->
  <div class="fixed top-0 left-0 right-0 bottom-0 bg-(--pd-modal-fade) bg-opacity-60 bg-blend-multiply h-full grid z-50">
    <div
      class="flex flex-col place-self-center w-[550px] rounded-xl bg-[var(--pd-modal-bg)] shadow-xl shadow-(--pd-modal-shadow)"
      role="dialog"
      aria-label="Skip Setup Popup">
      <div class="flex items-center justify-between pl-4 pr-3 py-3 space-x-2 text-[var(--pd-modal-header-text)]">
        <Icon class="h-4 w-4" icon={faCircleQuestion} />
        <span class="grow text-md font-bold capitalize">Skip the entire setup?</span>
      </div>

      <div class="px-10 py-4 text-sm text-[var(--pd-modal-text)] leading-5">
        If you exit, you can complete your setup later from the Resources page. Do you want to skip it?
      </div>

      <ButtonRow class="px-5 py-5">
        <Button type="secondary" aria-label="Cancel" on:click={(): void => setDisplayCancelSetup(false)}>Cancel</Button>
        <Button type="primary" on:click={cancelSetup}>Ok</Button>
      </ButtonRow>
    </div>
  </div>
{/if}
