/**********************************************************************
 * Copyright (C) 2023-2024 Red Hat, Inc.
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

import '@testing-library/jest-dom/vitest';

import { render, screen } from '@testing-library/svelte';
import { beforeAll, expect, test, vi } from 'vitest';

import type { ContainerStatsInfo } from '/@api/container-stats-info';

import { ContainerGroupInfoTypeUI, type ContainerInfoUI } from './ContainerInfoUI';
import ContainerStatistics from './ContainerStatistics.svelte';

const myContainer: ContainerInfoUI = {
  id: 'foobar',
  shortId: 'foobar',
  name: 'foobar',
  image: 'foobar',
  shortImage: 'foobar',
  engineId: 'foobar',
  engineName: 'foobar',
  engineType: 'podman',
  state: 'RUNNING',
  uptime: 'foobar',
  startedAt: 'foobar',
  ports: [],
  portsAsString: 'foobar',
  displayPort: 'foobar',
  command: 'foobar',
  hasPublicPort: false,
  groupInfo: {
    name: 'foobar',
    type: ContainerGroupInfoTypeUI.STANDALONE,
  },
  selected: false,
  created: 0,
  labels: {},
  imageBase64RepoTag: '',
};

const stats: ContainerStatsInfo = {
  memory_stats: {
    usage: 256,
    limit: 1024,
    stats: {
      total_pgmajfault: 0,
      cache: 0,
      mapped_file: 0,
      total_inactive_file: 0,
      pgpgout: 414,
      rss: 6537216,
      total_mapped_file: 0,
      writeback: 0,
      unevictable: 0,
      pgpgin: 477,
      total_unevictable: 0,
      pgmajfault: 0,
      total_rss: 6537216,
      total_rss_huge: 6291456,
      total_writeback: 0,
      total_inactive_anon: 0,
      rss_huge: 6291456,
      hierarchical_memory_limit: 67108864,
      total_pgfault: 964,
      total_active_file: 0,
      active_anon: 6537216,
      total_active_anon: 6537216,
      total_pgpgout: 414,
      total_cache: 0,
      inactive_anon: 0,
      active_file: 0,
      pgfault: 964,
      inactive_file: 0,
      total_pgpgin: 477,
    },
    max_usage: 1024,
    failcnt: 0,
  },
  precpu_stats: {
    cpu_usage: {
      total_usage: 50,
      percpu_usage: [50],
      usage_in_usermode: 4,
      usage_in_kernelmode: 4,
    },
    system_cpu_usage: 50,
    online_cpus: 4,
    throttling_data: {
      periods: 0,
      throttled_periods: 0,
      throttled_time: 0,
    },
  },
  cpu_stats: {
    cpu_usage: {
      total_usage: 60,
      percpu_usage: [60],
      usage_in_usermode: 4,
      usage_in_kernelmode: 4,
    },
    system_cpu_usage: 95,
    online_cpus: 4,
    throttling_data: {
      periods: 0,
      throttled_periods: 0,
      throttled_time: 0,
    },
  },
  engineId: 'podman',
  engineName: 'podman',
  read: '',
  preread: '',
  num_procs: 1,
  networks: {},
};

beforeAll(() => {
  const containerStatsMock = vi.fn();
  containerStatsMock.mockImplementation((engineId, id, stats) => {
    return stats;
  });
  (window as any).getContainerStats = containerStatsMock;
  (window as any).stopContainerStats = vi.fn();
});

test('Expect memory donut', async () => {
  // render the component
  const result = render(ContainerStatistics, { container: myContainer });

  // update twice (needs two samples) and wait for update
  result.component.updateStatistics(stats);
  result.component.updateStatistics(stats);
  await new Promise(resolve => setTimeout(resolve, 500));

  const memValue = screen.getByText('256 B');
  expect(memValue).toBeInTheDocument();

  const memTooltip = screen.getByText('25% MEM usage');
  expect(memTooltip).toBeInTheDocument();

  const memArc = screen.getAllByTestId('arc')[1];
  expect(memArc).toHaveClass('stroke-[var(--pd-state-success)]');
});

test('Expect CPU donut', async () => {
  // render the component
  const result = render(ContainerStatistics, { container: myContainer });

  // update twice (needs two samples) and wait for update
  result.component.updateStatistics(stats);
  result.component.updateStatistics(stats);
  await new Promise(resolve => setTimeout(resolve, 500));

  const cpuValue = screen.getByText('88.9%');
  expect(cpuValue).toBeInTheDocument();

  const cpuTooltip = screen.getByText('89% vCPUs usage');
  expect(cpuTooltip).toBeInTheDocument();

  const cpuArc = screen.getAllByTestId('arc')[0];
  expect(cpuArc).toHaveClass('stroke-[var(--pd-state-error)]');
});
