import '@testing-library/jest-dom';
import { test, expect, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/svelte';
import ComposeDetails from './ComposeDetails.svelte';
import { mockBreadcrumb } from '../../stores/breadcrumb';

vi.mock('xterm', () => {
  return {
    Terminal: vi.fn().mockReturnValue({ loadAddon: vi.fn(), open: vi.fn(), write: vi.fn(), clear: vi.fn() }),
  };
});

beforeAll(() => {
  (window.events as unknown) = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    receive: (_channel: string, func: any) => {
      func();
    },
  };
  (window as any).getConfigurationValue = vi.fn();
  (window as any).matchMedia = vi.fn().mockReturnValue({
    addListener: vi.fn(),
  });
  (window as any).telemetryPage = vi.fn().mockReturnValue({
    sendPageView: vi.fn(),
  });
  (window as any).ResizeObserver = vi.fn().mockReturnValue({ observe: vi.fn(), unobserve: vi.fn() });
  (window as any).initializeProvider = vi.fn().mockResolvedValue([]);
  (window as any).generatePodmanKube = vi.fn();
  mockBreadcrumb();
});

test('Simple test that compose logs are clickable and loadable', async () => {
  render(ComposeDetails, { composeName: 'foobar', engineId: 'engine' });
  // Click on the logs href
  const logsHref = screen.getByRole('link', { name: 'Logs' });
  await fireEvent.click(logsHref);

  // Checks that the 'emptyscreen' of the logs is displayed
  // which should display "Log output of foobar"
  expect(screen.getByText('Log output of foobar')).toBeInTheDocument();
});

test('Simple test that compose name is displayed', async () => {
  render(ComposeDetails, { composeName: 'foobar', engineId: 'engine' });
  expect(screen.getByText('foobar')).toBeInTheDocument();
});

test('Test that compose kube tab is clickable and loadable', async () => {
  render(ComposeDetails, { composeName: 'foobar', engineId: 'engine' });
  const kubeHref = screen.getByRole('link', { name: 'Kube' });
  await fireEvent.click(kubeHref);
});
