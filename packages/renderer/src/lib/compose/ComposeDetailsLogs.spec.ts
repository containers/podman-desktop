import '@testing-library/jest-dom/vitest';
import { beforeAll, expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import { mockBreadcrumb } from '../../stores/breadcrumb.spec';
import ComposeDetailsLogs from './ComposeDetailsLogs.svelte';
import type { ComposeInfoUI } from './ComposeInfoUI';
import { ContainerGroupInfoTypeUI, type ContainerInfoUI } from '../container/ContainerInfoUI';

vi.mock('xterm', () => {
  return {
    Terminal: vi.fn().mockReturnValue({ loadAddon: vi.fn(), open: vi.fn(), write: vi.fn(), clear: vi.fn() }),
  };
});

beforeAll(() => {
  (window as any).getConfigurationValue = vi.fn();
  (window as any).ResizeObserver = vi.fn().mockReturnValue({ observe: vi.fn(), unobserve: vi.fn() });
  (window as any).telemetryPage = vi.fn().mockResolvedValue(undefined);
  (window as any).logsContainer = vi.fn().mockResolvedValue(undefined);
  (window as any).refreshTerminal = vi.fn();
  mockBreadcrumb();
});

const containerInfoUIMock: ContainerInfoUI = {
  id: 'foobar',
  shortId: 'foobar',
  name: 'foobar',
  image: 'foobar',
  shortImage: 'foobar',
  engineId: 'foobar',
  engineName: 'foobar',
  engineType: ContainerGroupInfoTypeUI.PODMAN,
  state: 'running',
  uptime: 'foobar',
  startedAt: 'foobar',
  ports: [],
  portsAsString: 'foobar',
  displayPort: 'foobar',
  command: 'foobar',
  hasPublicPort: false,
  groupInfo: {
    name: 'foobar',
    type: ContainerGroupInfoTypeUI.COMPOSE,
  },
  selected: false,
  created: 0,
  labels: {},
};

const composeInfoUIMock: ComposeInfoUI = {
  engineId: 'foobar',
  engineType: ContainerGroupInfoTypeUI.PODMAN,
  name: 'foobar',
  status: 'running',
  containers: [containerInfoUIMock],
};

test('Render compose logs and expect EmptyScreen and no loading via logsContainer', async () => {
  // Mock compose has no containers, so expect No Log to appear
  render(ComposeDetailsLogs, { compose: composeInfoUIMock });

  // Expect no logs since we mock logs
  const heading = screen.getByRole('heading', { name: 'No Log' });
  expect(heading).toBeInTheDocument();
});
