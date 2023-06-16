/**********************************************************************
 * Copyright (C) 2023 Red Hat, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * SPDX-License-Identifier: Apache-2.0
 ***********************************************************************/

import { ActiveOnboarding, Onboarding, OnboardingActiveStep, OnboardingPlaceHolderStep } from "./api/onboarding.js";
import { CommandRegistry } from "./command-registry.js";

export class OnboardingRegistry {
  private onboardings = new Map<string, Onboarding>();
  private activeOnboarding = new Map<string, ActiveOnboarding>();

  constructor(private commandRegisty: CommandRegistry) {}

  registerOnboarding(extension: string, onboarding: Onboarding): void {
    //TODO we need to check the onboarding has a valid schema. contains atleast a step and substep
    this.onboardings.set(extension, onboarding);
  }

  unregisterOnboarding(extension: string): void {
    this.onboardings.delete(extension);
  }

  getOnboardingStep(extension: string): ActiveOnboarding {
    // TODO we should retrieve if the onboarding has already been started from a file
    const onboardingWorkflow = this.onboardings.get(extension);
    if (!onboardingWorkflow) {
      throw "no onboarding workflow";
    }

    const activeOnboarding = this.activeOnboarding.get(extension);
    if (!activeOnboarding) {
      const firstStep = onboardingWorkflow.steps[0];

      const firstSubstep = firstStep.substeps[0];
      const activeOnboardingStep: OnboardingActiveStep = {
        ...firstStep,
        substep: firstSubstep,
      };
      const activeOnboarding: ActiveOnboarding = {
        ...onboardingWorkflow,
        steps: onboardingWorkflow.steps.map(step => {
          return {
            id: step.id,
            title: step.title,
            description: step.description,
            status: "unknown",
          } as OnboardingPlaceHolderStep
        }),
        activeStep: activeOnboardingStep,
      };
      return activeOnboarding;
    } else {
      return activeOnboarding;
    }
  }

  /*executeOnboardingCommand(extension: string, command: string) {
    const activeOnboarding = this.activeOnboarding.get(extension);
    const commandToExecute = activeOnboarding?.step.commands.filter(cmd => cmd.id === command)[0];
    this.commandRegisty.executeCommand(commandToExecute?.id);
  }*/

}
