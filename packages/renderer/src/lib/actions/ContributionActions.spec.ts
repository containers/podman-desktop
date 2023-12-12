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

test('Expect one ListItemButtonIcon without detail', async () => {
  render(ContributionActions, {
    args: [],
    contributions: [
      {
        command: 'dummy.command',
        title: 'dummy-title',
      },
    ],
    onError: () => {},
    dropdownMenu: false,
  });
  const item = screen.getByLabelText('dummy-title');
  expect(item).toBeInTheDocument();
  expect(item).toHaveClass('m-0.5');
});

test('Expect one ListItemButtonIcon with detail', async () => {
  render(ContributionActions, {
    args: [],
    contributions: [
      {
        command: 'dummy.command',
        title: 'dummy-title',
      },
    ],
    onError: () => {},
    dropdownMenu: false,
    detailed: true,
  });
  const item = screen.getByLabelText('dummy-title');
  expect(item).toBeInTheDocument();
  expect(item).not.toHaveClass('m-0.5');
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

test('Expect when property to be true', async () => {
  render(ContributionActions, {
    args: [
      {
        property: 'hello',
      },
    ],
    contributions: [
      {
        command: 'dummy.command',
        title: 'dummy-title',
        when: 'property === hello',
      },
    ],
    onError: () => {},
    dropdownMenu: true,
  });
  const item = screen.getByText('dummy-title');
  expect(item).toBeInTheDocument();
});

test('Expect when property to be false', async () => {
  render(ContributionActions, {
    args: [
      {
        property: 'hello',
      },
    ],
    contributions: [
      {
        command: 'dummy.command',
        title: 'dummy-title',
        when: 'property === world',
      },
    ],
    onError: () => {},
    dropdownMenu: true,
  });
  const item = screen.queryByText('dummy-title');
  expect(item).toBeNull();
});

test('Expect when property to be true multiple args', async () => {
  render(ContributionActions, {
    args: [
      {
        property: 'hello',
      },
      {
        property: 'world',
      },
    ],
    contributions: [
      {
        command: 'dummy.command',
        title: 'dummy-title',
        when: 'property === world',
      },
    ],
    onError: () => {},
    dropdownMenu: true,
  });
  const item = screen.getByText('dummy-title');
  expect(item).toBeInTheDocument();
});
