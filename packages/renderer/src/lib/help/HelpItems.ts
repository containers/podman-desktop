/**********************************************************************
 * Copyright (C) 2024 Red Hat, Inc.
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

import { faDiscord, faSlack } from '@fortawesome/free-brands-svg-icons';
import { faComment } from '@fortawesome/free-regular-svg-icons';
import {
  faExclamationTriangle,
  faExternalLinkAlt,
  faLightbulb,
  faListUl,
  type IconDefinition,
} from '@fortawesome/free-solid-svg-icons';

import { homepage, repository } from '../../../../../package.json';

export enum ActionKind {
  LINK,
  COMMAND,
}

export interface ItemAction {
  kind: ActionKind;
  parameter: string;
}

export interface ItemInfo {
  title: string;
  tooltip?: string;
  icon: IconDefinition;
  enabled: boolean;
  action?: ItemAction;
}

export const Items: readonly ItemInfo[] = [
  {
    title: 'Getting Started',
    icon: faExternalLinkAlt,
    enabled: true,
    action: {
      kind: ActionKind.LINK,
      parameter: `${homepage}/docs/intro`,
    },
  },
  {
    title: 'Troubleshooting',
    icon: faLightbulb,
    enabled: true,
    action: {
      kind: ActionKind.COMMAND,
      parameter: 'troubleshooting',
    },
  },
  {
    title: 'Report a Bug',
    icon: faExclamationTriangle,
    enabled: true,
    action: {
      kind: ActionKind.LINK,
      parameter: `${repository}/issues/new/choose`,
    },
  },
  {
    title: 'Share Your Feedback',
    icon: faComment,
    enabled: true,
    action: {
      kind: ActionKind.COMMAND,
      parameter: 'feedback',
    },
  },
  {
    title: 'Community',
    icon: faListUl,
    enabled: false,
  },
  {
    title: '#podman-desktop',
    tooltip: 'Join Discord #podman-desktop channel',
    icon: faDiscord,
    enabled: true,
    action: {
      kind: ActionKind.LINK,
      parameter: 'https://discord.com/invite/x5GzFF6QH4',
    },
  },
  {
    title: '#podman-desktop',
    tooltip: 'Join Slack #podman-desktop channel',
    icon: faSlack,
    enabled: true,
    action: {
      kind: ActionKind.LINK,
      parameter: 'https://slack.k8s.io',
    },
  },
];
