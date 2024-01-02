import '@testing-library/jest-dom/vitest';
import { test, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import ConnectionStatusBadge from './ConnectionStatusBadge.svelte';

const mock = vi.hoisted(() => {
  return {
    subscribe: vi.fn(),
  };
});

vi.mock('../../stores/kubernetes-connection', () => {
  return {
    kubernetesConnection: {
      subscribe: mock.subscribe,
    },
  };
});

beforeEach(() => {
  vi.resetAllMocks();
});

test('Expect connected to be green', async () => {
  mock.subscribe.mockImplementation(callable => {
    callable({
      context: 'mocked-context',
      status: 'connected',
    });
  });

  render(ConnectionStatusBadge);
  const label = screen.getByText('connected');
  expect(label).toBeInTheDocument();
  expect(label.parentElement?.firstChild).toBeInTheDocument();
  expect(label.parentElement?.firstChild).toHaveClass('bg-green-600');
});

test('Expect unknown to be gray', async () => {
  mock.subscribe.mockImplementation(callable => {
    callable(undefined);
  });

  render(ConnectionStatusBadge);
  const label = screen.getByText('unknown');
  expect(label).toBeInTheDocument();
  expect(label.parentElement?.firstChild).toBeInTheDocument();
  expect(label.parentElement?.firstChild).toHaveClass('bg-gray-900');
});

test('Expect error to have tooltip', async () => {
  mock.subscribe.mockImplementation(callable => {
    callable({
      status: 'error',
      context: 'mocked-context',
      error: 'error-msg',
    });
  });

  render(ConnectionStatusBadge);
  const label = screen.getByText('error');
  expect(label).toBeInTheDocument();
  expect(label.parentElement?.firstChild).toBeInTheDocument();
  expect(label.parentElement?.firstChild).toHaveClass('tooltip-slot');
  expect(label.parentElement?.parentElement?.parentElement?.firstChild).toHaveClass('bg-gray-900');
});
