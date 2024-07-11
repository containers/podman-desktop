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

import { router } from 'tinro';

import { type BuildImageInfo, buildImagesInfo } from '/@/stores/build-images';
import { createTask, isStatefulTask, removeTask } from '/@/stores/tasks';
import type { Task } from '/@api/task';

export interface BuildImageCallback {
  // callback on stream
  onStream: (data: string) => void;
  // callback on errors
  onError: (error: string) => void;
  // when build is finished, this function is called
  onEnd: () => void;
}

export interface BuildReplay {
  // stream replay
  stream: string;

  // error replay
  error: string;

  // end replay
  end: boolean;
}

export interface BuildHold {
  // stream hold
  stream: string;

  // error hold
  error: string;

  // end hold
  end: boolean;
}

// map by build id
const buildCallbacks = new Map<symbol, BuildImageCallback>();
const buildOnHolds = new Map<symbol, BuildHold>();
const buildReplays = new Map<symbol, BuildReplay>();
const allTasks = new Map<symbol, Task>();

// new build is occuring, needs to compute a new key and prepare replay data
export function startBuild(imageName: string, buildImageCallback: BuildImageCallback): BuildImageInfo {
  const key = getKey();
  buildCallbacks.set(key, buildImageCallback);

  // start a task
  const task = createTask(`Build ${imageName}`);

  // go to the images build
  task.action = {
    name: 'Go to task >',
    execute: () => router.goto('/images/build'),
  };

  // store the task
  allTasks.set(key, task);

  // create a new replay value
  buildReplays.set(key, { stream: '', error: '', end: false });
  return { buildImageKey: key, buildRunning: true };
}

// clear all data related to the given build
export function clearBuildTask(info: BuildImageInfo): void {
  buildCallbacks.delete(info.buildImageKey);
  buildOnHolds.delete(info.buildImageKey);
  buildReplays.delete(info.buildImageKey);
  // remove current build
  buildImagesInfo.set({ buildImageKey: getKey(), buildRunning: false });

  // remove the task
  const task = allTasks.get(info.buildImageKey);
  if (task) {
    removeTask(task.id);
  }

  allTasks.delete(info.buildImageKey);
}

// client is leaving the page, disconnect the UI
// need to store the events
export function disconnectUI(key: symbol): void {
  // provide on hold events
  const holdingEvents: BuildHold = { stream: '', error: '', end: false };
  buildOnHolds.set(key, holdingEvents);

  // remove the current callback
  buildCallbacks.delete(key);
}

// reconnecting the UI, needs to replay events / hold events as well
export function reconnectUI(key: symbol, buildImageCallback: BuildImageCallback): void {
  // add the new callback
  buildCallbacks.set(key, buildImageCallback);

  // replay previous lines
  const replay = buildReplays.get(key);
  if (replay) {
    if (replay.stream.length > 0) {
      buildImageCallback.onStream(replay.stream);
    }
    if (replay.error.length > 0) {
      buildImageCallback.onError(replay.error);
    }
  }

  // on hold events should be replayed
  // replay the holding results
  let ended = false;
  const hold = buildOnHolds.get(key);
  if (hold) {
    if (hold.stream.length > 0) {
      buildImageCallback.onStream(hold.stream);
    }
    if (hold.error.length > 0) {
      buildImageCallback.onError(hold.error);
    }
    if (hold.end) {
      ended = true;
      buildImageCallback.onEnd();
    }
  }
  // ok remove the intermediate events
  buildOnHolds.delete(key);

  // check if it was ended in the replay
  if (!ended && replay?.end) {
    buildImageCallback.onEnd();
  }
}

// build a new key
function getKey(): symbol {
  return Symbol();
}

// anonymous function to collect events
export function eventCollect(key: symbol, eventName: 'finish' | 'stream' | 'error', data: string): void {
  const task = allTasks.get(key);
  if (task && isStatefulTask(task)) {
    if (eventName === 'error') {
      // If we errored out, we should store the error message in the task so it is correctly displayed
      task.error = data;
      task.status = 'failure';
      task.state = 'completed';
    } else if (eventName === 'finish') {
      if (task.status !== 'failure') {
        task.status = 'success';
      }
      task.state = 'completed';
    }
  }

  // keep values for replay
  const replay = buildReplays.get(key);
  if (replay) {
    if (eventName === 'stream') {
      replay.stream += `${data}\r`;
    } else if (eventName === 'error') {
      replay.error += `${data}\r`;
    } else if (eventName === 'finish') {
      replay.end = true;
    }
  }
  const callback = buildCallbacks.get(key);
  if (!callback) {
    // need to store the result for later as no UI is connected
    const hold = buildOnHolds.get(key);
    if (hold) {
      if (eventName === 'stream') {
        hold.stream += `${data}\r`;
      } else if (eventName === 'error') {
        hold.error += `${data}\r`;
      } else if (eventName === 'finish') {
        hold.end = true;
      }
      return;
    }
  }
  if (eventName === 'stream') {
    callback?.onStream(data);
  } else if (eventName === 'error') {
    callback?.onError(data);
  } else if (eventName === 'finish') {
    callback?.onEnd();
  }
}
