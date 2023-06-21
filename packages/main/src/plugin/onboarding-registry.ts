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

import * as path from 'path';
import * as fs from 'fs';
import { ActiveOnboarding, Onboarding, OnboardingActiveStep, OnboardingViewRadioItem, OnboardingCommandResponse, OnboardingInputResponse, OnboardingPlaceHolderStep, OnboardingStepView, OnboardingViewItem } from "./api/onboarding.js";
import { CommandRegistry } from "./command-registry.js";
import { ApiSenderType } from './api.js';
import { enableNetConnect } from 'nock';

interface CommandResult {
  command: string;
  response: OnboardingCommandResponse;
}

export class OnboardingRegistry {
  private onboardings = new Map<string, Onboarding>();
  private activeOnboarding = new Map<string, ActiveOnboarding>();

  constructor(private apiSender: ApiSenderType, private commandRegisty: CommandRegistry) {}

  registerOnboarding(extension: string, extensionPath: string, onboarding: Onboarding): void {
    //TODO we need to check the onboarding has a valid schema. contains atleast a step and substep
    this.convertImages(extensionPath, onboarding);
    this.onboardings.set(extension, onboarding);
    this.initOnboarding(extension);
  }

  unregisterOnboarding(extension: string): void {
    this.onboardings.delete(extension);
  }

  getActiveOnboardings(): ActiveOnboarding[] {
    return Array.from(this.activeOnboarding.values());
  }

  initOnboarding(extension: string) {
    // TODO we should retrieve if the onboarding has already been started from a file
    const onboardingWorkflow = this.onboardings.get(extension);
    if (!onboardingWorkflow) {
      return;
    }

    const firstStep = onboardingWorkflow.steps[0];

    const firstSubstep = firstStep.views[0];
    const activeOnboardingStep: OnboardingActiveStep = {
      ...firstStep,
      view: {
        ...firstSubstep,
        showNext: !firstSubstep.completionEvents && !firstSubstep.enableCompletionEvents
      },
      context: {},
    };
    const activeOnboarding: ActiveOnboarding = {
      ...onboardingWorkflow,
      extension,
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
    this.activeOnboarding.set(extension, activeOnboarding);
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

      const firstSubstep = firstStep.views[0];
      const activeOnboardingStep: OnboardingActiveStep = {
        ...firstStep,
        view: {
          ...firstSubstep,
          showNext: !firstSubstep.completionEvents && !firstSubstep.enableCompletionEvents
        },
        context: {},
      };
      const activeOnboarding: ActiveOnboarding = {
        ...onboardingWorkflow,
        extension,
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

  convertImages(rootPath: string, onboarding: Onboarding) {
    if (onboarding.media?.path) {
      onboarding.media.path = this.getBase64Image(rootPath, onboarding.media.path);
    }

    for (const step of onboarding.steps) {
      if (step.media?.path) {
        step.media.path =  this.getBase64Image(rootPath, step.media.path);
      }
      for (const sub of step.views) {
        sub.media.path = this.getBase64Image(rootPath, sub.media.path);
        if (sub.content) {
          for (const row of sub.content) {
            for (const item of row.items) {
              if (item.component === "checkbox_card" && item.media?.path) {
                item.media.path = this.getBase64Image(rootPath, item.media.path);
              }
              if (item.component === "radiogroup") {
                for (const option of item.options) {
                  if (option.component === "checkbox_card" && option.media?.path) {
                    option.media.path = this.getBase64Image(rootPath, option.media.path);
                  }
                }
              }
            }
          }
        }        
      }
    }
  }

  // Return the base64 of the file
  getBase64Image(rootPath: string, file: string): string {
    const imageContent = fs.readFileSync(path.resolve(rootPath, file));

    // convert to base64
    const base64Content = Buffer.from(imageContent).toString('base64');

    // create base64 image content
    return `data:image/png;base64,${base64Content}`;
  }

  async doNext(extension: string): Promise<void> {
    const activeOnboarding = this.activeOnboarding.get(extension);

    if (activeOnboarding?.activeStep.view.completionEvents) {
      // do nothing, show error??
      console.error(`This step is not completed yet`);
      return;
    }

    this.updateOnboardingStep(extension);
  }

  async executeOnboardingCommand(extension: string, command: string): Promise<void> {
    const activeOnboarding = this.activeOnboarding.get(extension);
    const commandToExecute = activeOnboarding?.activeStep.commands.filter(cmd => cmd.id === command)[0];

    if (!commandToExecute) {
      // do nothing, show error??
      console.error(`no command found by name ${commandToExecute}`);
      return;
    }

    const args = [];
    if (commandToExecute.args) {
      for (const arg of commandToExecute.args) {
        args.push(this.sanitizePropValues(arg, activeOnboarding.activeStep.context));
      }
    }
    const response = await this.commandRegisty.executeCommand<OnboardingCommandResponse>(commandToExecute?.command, args);
    const completedEventTag = this.getCompletedEventTag({command, response});
    const isCompleted = activeOnboarding.activeStep.view.completionEvents.find(ce => completedEventTag.includes(ce)) !== undefined;
    if (isCompleted) {
      this.updateOnboardingStep(extension, {
        command,
        response
      });
    }
  }

  updateOnboardingStep(extension: string, commandResult?: CommandResult) {
    const onboarding = this.onboardings.get(extension);
    const activeOnboarding = this.activeOnboarding.get(extension);

    const step = onboarding?.steps.filter(s => s.id === activeOnboarding?.activeStep.id)[0];
    const orderLastView = step?.views.reduce((prev, current) => {
      return prev.order > current.order ? prev : current;
    }).order;
    const ids = step?.views.filter(v => v.order === orderLastView).map(v => v.id);
    if (ids?.find(id => id === activeOnboarding?.activeStep.view.id)) {
      // we are at the last view, mark the step as completed and go to the next
      // what if the last screen is the failed one??
      const currStepIndex = onboarding?.steps?.findIndex(s => s.id === step?.id);
      if (currStepIndex === undefined) {
        console.error("current step not found???")
        return;
      }
      const nextStepIndex = currStepIndex + 1;
      if (nextStepIndex < onboarding!.steps!.length) {
        const newStep = onboarding?.steps?.[nextStepIndex]!;
        const activeOnboardingStep: OnboardingActiveStep = {
          ...newStep,
          view: {
            ...newStep.views[0],
            showNext: !newStep.views[0].completionEvents && !newStep.views[0].enableCompletionEvents
          },
          context: {}
        };
        activeOnboarding!.activeStep = activeOnboardingStep;
        // mark the finished step as completed
        activeOnboarding!.steps![currStepIndex].status = "completed";
        this.apiSender.send('onboarding-update', {});
        return;
      } else {
        console.error("next step not found???")
        return;
      }
    } 
    
    let completedEventTag;
    if(commandResult) {
      completedEventTag = this.getCompletedEventTag(commandResult);
    }
    
    if (step?.views) {
      let canNext = false;
      for (const sub of step.views.sort((sub1, sub2) => sub1.order - sub2.order)) {
        if (canNext && (!sub.when || (completedEventTag && sub.when.includes(completedEventTag)))) {
          // this is the next view to display
          // replace content with response value, if any
          if (commandResult) {
            if (sub.content) {
              for (const entry of sub.content) {
                for (const item of entry.items) {
                  // replace placeholder only on text components.
                  // todo should it be extended?
                  if (!item.component || item.component === "text") {
                    item.value = this.replaceResultPlaceholder(item.value, commandResult);
                  }                
                }
              }
            }
          }
                    
          const activeOnboardingStep: OnboardingActiveStep = {
            ...step,
            view: {
              ...this.sanitizeViewPropsValues(sub, activeOnboarding!.activeStep.context),
              showNext: !sub.completionEvents && !sub.enableCompletionEvents
            },
            context: activeOnboarding!.activeStep.context
          };
          activeOnboarding!.activeStep = activeOnboardingStep;
          this.apiSender.send('onboarding-update', {});
          break;
        }
        if (sub.id === activeOnboarding?.activeStep.view.id) {
          canNext = true;
        }
      }
    }    
  }

  getCompletedEventTag(commandResult: CommandResult) {
    return `onCommandResult:${commandResult.command}.status.${commandResult.response.status}`
  }

  sanitizeViewPropsValues(view: OnboardingStepView, context: {[key:string]: string}): OnboardingStepView {
    //todo it should sanitize all props
    view.title = this.sanitizePropValues(view.title, context);
    return view;
  }

  sanitizePropValues(prop: string, context: {[key:string]: any}): string {
    const regex = /(onRadioSelected:\S+)/g;    
    const found = prop.match(regex);
    if (found) {
      found.forEach((v) => {
        const placeholder = v.replace("onRadioSelected:", "");
        const parts = placeholder.split(".");
        const value = context[`${parts[0]}.${parts[1]}.${parts[2]}`];
        if (parts[3]) {
          prop = prop.replace(v, value[parts[3]]);
        } else {
          prop = prop.replace(v, value);
        }        
      });
    }
    return prop;
  }

  replaceResultPlaceholder(value: string, commandResult: CommandResult): string {
    const commandResponseBaseTag = `onCommandResult:${commandResult.command}.body.`;
    const startIndexTag = value.indexOf(commandResponseBaseTag);
    let endIndexTag = value.substring(startIndexTag).indexOf(' ');
    endIndexTag = endIndexTag === -1 ? value.length : endIndexTag;
    if (startIndexTag >= 0) {
      const cleaned = value.substring(startIndexTag + commandResponseBaseTag.length, endIndexTag)
      // after cleaning the value, only the actual children of body field should be here
      // e.g. if originally it was onCommandResult:copy.body.media.path, the cleaned value is media.path
      const fields = cleaned.split('.');
      let valueField = commandResult.response.body; 
      for (const field of fields) {
        valueField = valueField[field];
      }

      if (typeof valueField === 'string') {
        value = value.replace(value.substring(startIndexTag, endIndexTag), valueField);
      }
    }
    return value;
  }

  setOnboardingRadioInputSelection(extension: string, radiogroup: string, idSelected: string): OnboardingInputResponse {
    const activeOnboarding = this.activeOnboarding.get(extension);
    let isInContext = activeOnboarding!.activeStep.context[this.getInputTag(extension, radiogroup)] !== undefined;
    const optionSelected = this.getRadioInputById(extension, radiogroup, idSelected);
    activeOnboarding!.activeStep.context[this.getInputTag(extension, radiogroup)] = isInContext 
                                                                                        ? undefined // de-selected
                                                                                        : optionSelected; //selected
    
    if (activeOnboarding!.activeStep.view.enableCompletionEvents) {
      for (const ece of activeOnboarding!.activeStep.view.enableCompletionEvents) {
        if (ece === `onRadioSelected:${radiogroup}` && !isInContext) {
          return {
            stepCompleted: true
          };
        }
      }
    }
    // todo if the step does not have any enableCompletionEvents we should check if there are completionEvents and the step has to be automatically updated
    return {
      stepCompleted: false
    }
  }

  getRadioInputById(extension: string, radiogroup: string, idSelected: string): OnboardingViewItem | undefined {
    const activeOnboarding = this.activeOnboarding.get(extension);
    for (const row of activeOnboarding!.activeStep.view.content) {
      for(const item of row.items) {
        if (item.id === radiogroup) {
          const option = (item as OnboardingViewRadioItem).options.filter(o => o.id === idSelected)[0];
          return option;
        }
      } 
    }
    return undefined;
  }

  getInputTag(extension: string, inputId: string): string {
    const activeOnboarding = this.activeOnboarding.get(extension);
    return `${activeOnboarding!.activeStep.id}.${activeOnboarding!.activeStep.view.id}.${inputId}`;
  }
}
