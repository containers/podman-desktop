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

import type { Logger as LoggerType } from '@podman-desktop/api';
import { router } from 'tinro';

import { operationConnectionsInfo } from '/@/stores/operation-connections';
import { createTask, isStatefulTask, removeTask } from '/@/stores/tasks';
import type { Task } from '/@api/task';

export interface ConnectionCallback extends LoggerType {
  // when build is finished, this function is called
  onEnd: () => void;
}

export interface TaskReplay {
  // log replay
  log: string[][];

  // error replay
  error: string[][];

  // warn replay
  warn: string[][];

  // end replay
  end: boolean;
}

export interface TaskHold {
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
const taskLogCallbacks = new Map<symbol, ConnectionCallback>();
const taskLogOnHolds = new Map<symbol, TaskHold>();
const taskLogReplays = new Map<symbol, TaskReplay>();
const allTasks = new Map<symbol, Task>();

export function startTask(name: string, goToUrl: string, createCallback: ConnectionCallback): symbol {
  const key = getKey();
  taskLogCallbacks.set(key, createCallback);

  // start a task
  const task = createTask(name);

  // go to the images build
  task.action = {
    name: 'Go to task >',
    execute: () => router.goto(goToUrl),
  };
  // store the task
  allTasks.set(key, task);

  // create a new replay value
  taskLogReplays.set(key, { log: [], warn: [], error: [], end: false });
  return key;
}

// clear all data related to the given build
export function clearCreateTask(key: symbol): void {
  taskLogCallbacks.delete(key);
  taskLogOnHolds.delete(key);
  taskLogReplays.delete(key);
  // remove current create
  operationConnectionsInfo.set(new Map());

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
  const holdingEvents: TaskHold = { log: [], warn: [], error: [], end: false };
  taskLogOnHolds.set(key, holdingEvents);

  // remove the current callback
  taskLogCallbacks.delete(key);
}

// reconnecting the UI, needs to replay events / hold events as well
export function reconnectUI(key: symbol, connectionCallback: ConnectionCallback): void {
  // add the new callback
  taskLogCallbacks.set(key, connectionCallback);

  // replay previous lines
  const replay = taskLogReplays.get(key);
  if (replay) {
    if (replay.log.length > 0) {
      connectionCallback.log(replay.log);
    }
    if (replay.warn.length > 0) {
      connectionCallback.warn(replay.warn);
    }
    if (replay.error.length > 0) {
      connectionCallback.error(replay.error);
    }
  }

  // on hold events should be replayed
  // replay the holding results
  let ended = false;
  const hold = taskLogOnHolds.get(key);
  if (hold) {
    if (hold.log.length > 0) {
      connectionCallback.log(hold.log);
    }
    if (hold.error.length > 0) {
      connectionCallback.error(hold.error);
    }
    if (hold.warn.length > 0) {
      connectionCallback.warn(hold.warn);
    }
    if (hold.end) {
      ended = true;
      connectionCallback.onEnd();
    }
  }
  // ok remove the intermediate events
  taskLogOnHolds.delete(key);

  // check if it was ended in the replay
  if (!ended && replay?.end) {
    connectionCallback.onEnd();
  }
}

// build a new key
function getKey(): symbol {
  return Symbol();
}

export function eventCollect(key: symbol, eventName: 'log' | 'warn' | 'error' | 'finish', args: string[]): void {
  const task = allTasks.get(key);
  if (task && isStatefulTask(task)) {
    if (eventName === 'error') {
      task.status = 'failure';
      task.error = args.join('\n');
      task.state = 'completed';
    } else if (eventName === 'finish') {
      if (task.status !== 'failure') {
        task.status = 'success';
      }
      task.state = 'completed';
    }
  }

  // keep values for replay
  const replay = taskLogReplays.get(key);
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
  const callback = taskLogCallbacks.get(key);

  if (!callback) {
    // need to store the result for later as no UI is connected
    const hold = taskLogOnHolds.get(key);
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
    callback?.log(args);
  } else if (eventName === 'warn') {
    callback?.warn(args);
  } else if (eventName === 'error') {
    callback?.error(args);
  } else if (eventName === 'finish') {
    callback?.onEnd();
  }
}
