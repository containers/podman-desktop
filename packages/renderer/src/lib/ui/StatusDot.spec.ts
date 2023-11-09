import '@testing-library/jest-dom/vitest';
import { test, expect } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import StatusDot from './StatusDot.svelte';

const renderStatusDot = (containerStatus: string) => {
  return render(StatusDot, { name: 'foobar', status: containerStatus });
};

test('Expect the dot to have the correct color for running status', () => {
  renderStatusDot('running');
  const dot = screen.getByTestId('status-dot');
  expect(dot).toHaveClass('bg-status-running');
});

test('Expect the dot to have the correct color for terminated status', () => {
  renderStatusDot('terminated');
  const dot = screen.getByTestId('status-dot');
  expect(dot).toHaveClass('bg-status-terminated');
});

test('Expect the dot to have the correct color for waiting status', () => {
  renderStatusDot('waiting');
  const dot = screen.getByTestId('status-dot');
  expect(dot).toHaveClass('bg-status-waiting');
});

test('Expect the dot to have the correct color for stopped status', () => {
  renderStatusDot('stopped');
  const dot = screen.getByTestId('status-dot');
  expect(dot).toHaveClass('outline-status-stopped');
});

test('Expect the dot to have the correct color for paused status', () => {
  renderStatusDot('paused');
  const dot = screen.getByTestId('status-dot');
  expect(dot).toHaveClass('bg-status-paused');
});

test('Expect the dot to have the correct color for exited status', () => {
  renderStatusDot('exited');
  const dot = screen.getByTestId('status-dot');
  expect(dot).toHaveClass('outline-status-exited');
});

test('Expect the dot to have the correct color for dead status', () => {
  renderStatusDot('dead');
  const dot = screen.getByTestId('status-dot');
  expect(dot).toHaveClass('bg-status-dead');
});

test('Expect the dot to have the correct color for created status', () => {
  renderStatusDot('created');
  const dot = screen.getByTestId('status-dot');
  expect(dot).toHaveClass('outline-status-created');
});

test('Expect the dot to have the correct color for degraded status', () => {
  renderStatusDot('degraded');
  const dot = screen.getByTestId('status-dot');
  expect(dot).toHaveClass('bg-status-degraded');
});

test('Expect the dot to have the correct color for unknown status', () => {
  renderStatusDot('unknown');
  const dot = screen.getByTestId('status-dot');
  expect(dot).toHaveClass('bg-status-unknown');
});
