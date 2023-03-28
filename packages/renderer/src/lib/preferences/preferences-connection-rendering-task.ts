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

import { createConnectionsInfo } from '/@/stores/create-connections';
import { router } from 'tinro';

import type { Logger as LoggerType } from '@podman-desktop/api';
import type { Task } from '/@/stores/tasks';
import { createTask, removeTask } from '/@/stores/tasks';

export interface CreateConnectionCallback extends LoggerType {
  // when build is finished, this function is called
  onEnd: () => void;
}

export interface CreateReplay {
  // log replay
  log: string[][];

  // error replay
  error: string[][];

  // warn replay
  warn: string[][];

  // end replay
  end: boolean;
}

export interface CreateHold {
  // log replay
  log: string[][];

  // error replay
  error: string[][];

  // warn replay
  warn: string[][];

  // end hold
  end: boolean;
}

// map by build id
const createLogCallbacks = new Map<symbol, CreateConnectionCallback>();
const createLogOnHolds = new Map<symbol, CreateHold>();
const createLogReplays = new Map<symbol, CreateReplay>();
const allTasks = new Map<symbol, Task>();

// new create is occuring, needs to compute a new key and prepare replay data
export function startCreate(
  name: string,
  providerInternalId: string,
  createCallback: CreateConnectionCallback,
): symbol {
  const key = getKey();
  createLogCallbacks.set(key, createCallback);

  // start a task
  const task = createTask(name);

  // go to the images build
  task.gotoTask = () => {
    router.goto(`/preferences/provider/${providerInternalId}`);
  };

  // store the task
  allTasks.set(key, task);

  // create a new replay value
  createLogReplays.set(key, { log: [], warn: [], error: [], end: false });
  return key;
}

// clear all data related to the given build
export function clearCreateTask(key: symbol): void {
  createLogCallbacks.delete(key);
  createLogOnHolds.delete(key);
  createLogReplays.delete(key);
  // remove current create
  createConnectionsInfo.set(undefined);

  // remove the task
  const task = allTasks.get(key);
  if (task) {
    removeTask(task.id);
  }
  allTasks.delete(key);
}

// client is leaving the page, disconnect the UI
// need to store the events
export function disconnectUI(key: symbol): void {
  // provide on hold events
  const holdingEvents: CreateHold = { log: [], warn: [], error: [], end: false };
  createLogOnHolds.set(key, holdingEvents);

  // remove the current callback
  createLogCallbacks.delete(key);
}

// reconnecting the UI, needs to replay events / hold events as well
export function reconnectUI(key: symbol, createCallback: CreateConnectionCallback): void {
  // add the new callback
  createLogCallbacks.set(key, createCallback);

  // replay previous lines
  const replay = createLogReplays.get(key);
  if (replay) {
    if (replay.log.length > 0) {
      createCallback.log(replay.log);
    }
    if (replay.warn.length > 0) {
      createCallback.warn(replay.warn);
    }
    if (replay.error.length > 0) {
      createCallback.error(replay.error);
    }
  }

  // on hold events should be replayed
  // replay the holding results
  let ended = false;
  const hold = createLogOnHolds.get(key);
  if (hold) {
    if (hold.log.length > 0) {
      createCallback.log(hold.log);
    }
    if (hold.error.length > 0) {
      createCallback.error(hold.error);
    }
    if (hold.warn.length > 0) {
      createCallback.warn(hold.warn);
    }
    if (hold.end) {
      ended = true;
      createCallback.onEnd();
    }
  }
  // ok remove the intermediate events
  createLogOnHolds.delete(key);

  // check if it was ended in the replay
  if (!ended) {
    if (replay && replay.end) {
      createCallback.onEnd();
    }
  }
}

// build a new key
function getKey(): symbol {
  return Symbol();
}

export function eventCollect(key: symbol, eventName: 'log' | 'warn' | 'error' | 'finish', args: string[]): void {
  const task = allTasks.get(key);
  if (task) {
    if (eventName === 'error') {
      task.status = 'failure';
    } else if (eventName === 'finish') {
      if (task.status !== 'failure') {
        task.status = 'success';
      }
      task.state = 'completed';
    }
  }

  // keep values for replay
  const replay = createLogReplays.get(key);
  if (replay) {
    if (eventName === 'log') {
      replay.log.push(args);
    } else if (eventName === 'error') {
      replay.error.push(args);
    } else if (eventName === 'warn') {
      replay.warn.push(args);
    } else if (eventName === 'finish') {
      replay.end = true;
    }
  }
  const callback = createLogCallbacks.get(key);

  if (!callback) {
    // need to store the result for later as no UI is connected
    const hold = createLogOnHolds.get(key);
    if (hold) {
      if (eventName === 'log') {
        hold.log.push(args);
      } else if (eventName === 'warn') {
        hold.warn.push(args);
      } else if (eventName === 'error') {
        hold.error.push(args);
      } else if (eventName === 'finish') {
        hold.end = true;
      }
      return;
    }
  }
  if (eventName === 'log') {
    callback.log(args);
  } else if (eventName === 'warn') {
    callback.warn(args);
  } else if (eventName === 'error') {
    callback.error(args);
  } else if (eventName === 'finish') {
    callback.onEnd();
  }
}
