import '@testing-library/jest-dom/vitest';
import { beforeAll, test, expect, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/svelte';
import ContributionActions from '/@/lib/actions/ContributionActions.svelte';

const executeCommand = vi.fn();

beforeAll(() => {
  (window as any).executeCommand = executeCommand;
  executeCommand.mockImplementation(() => {});

  (window.events as unknown) = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    receive: (_channel: string, func: any) => {
      func();
    },
  };
});

test('Expect no ListItemButtonIcon', async () => {
  render(ContributionActions, {
    args: [],
    contributions: [],
    onError: () => {},
  });
  const imgs = screen.queryAllByRole('img');
  expect(imgs).lengthOf(0);
});

test('Expect one ListItemButtonIcon', async () => {
  render(ContributionActions, {
    args: [],
    contributions: [
      {
        command: 'dummy.command',
        title: 'dummy-title',
      },
    ],
    onError: () => {},
    dropdownMenu: true,
  });
  const item = screen.getByText('dummy-title');
  expect(item).toBeInTheDocument();
});

test('Expect executeCommand to be called', async () => {
  render(ContributionActions, {
    args: [],
    contributions: [
      {
        command: 'dummy.command',
        title: 'dummy-title',
      },
    ],
    onError: () => {},
    dropdownMenu: true,
  });
  const item = screen.getByText('dummy-title');

  await fireEvent.click(item);
  expect(executeCommand).toBeCalledWith('dummy.command');
});

test('Expect executeCommand to be called with sanitize object', async () => {
  render(ContributionActions, {
    args: [
      {
        nonSerializable: () => {},
        serializable: 'hello',
      },
    ],
    contributions: [
      {
        command: 'dummy.command',
        title: 'dummy-title',
      },
    ],
    onError: () => {},
    dropdownMenu: true,
  });
  const item = screen.getByText('dummy-title');

  await fireEvent.click(item);
  expect(executeCommand).toBeCalledWith('dummy.command', { serializable: 'hello' });
});

test('Expect executeCommand to be called with sanitize object nested', async () => {
  render(ContributionActions, {
    args: [
      {
        parent: {
          nonSerializable: () => {},
          serializable: 'hello',
        },
      },
    ],
    contributions: [
      {
        command: 'dummy.command',
        title: 'dummy-title',
      },
    ],
    onError: () => {},
    dropdownMenu: true,
  });
  const item = screen.getByText('dummy-title');

  await fireEvent.click(item);
  expect(executeCommand).toBeCalledWith('dummy.command', { parent: { serializable: 'hello' } });
});
