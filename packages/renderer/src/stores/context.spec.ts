import { beforeAll, expect, test, vi } from 'vitest';
import { get } from 'svelte/store';
import { ContextUI } from '../lib/context/context';
import { context } from './context';
import { waitFor } from '@testing-library/dom';

const contextCollectAllValues = vi.fn();
const receiveMock = vi.fn();

beforeAll(() => {
  (window as any).contextCollectAllValues = contextCollectAllValues;
  (window as any).events = { receive: receiveMock };
});

test('context store', async () => {
  contextCollectAllValues.mockResolvedValue({ a: 1, b: 'two' });
  receiveMock.mockImplementation((msg: string, f: (value: unknown) => void) => {
    if (msg === 'context-value-updated') {
      setTimeout(() => f({ key: 'c', value: 'three' }), 5);
      setTimeout(() => f({ key: 'b', value: 2 }), 15);
    } else if (msg === 'context-key-removed') {
      setTimeout(() => f({ key: 'a', value: 1 }), 10);
    }
  });

  vi.useFakeTimers();
  context.subscribe(() => {});

  const expected = new ContextUI();
  expected.setValue('a', 1);
  expected.setValue('b', 'two');
  // initial value comes from contextCollectAllValues
  waitFor(() => {
    expect(get(context)).toEqual(expected);
  });

  vi.advanceTimersByTime(5);
  expected.setValue('c', 'three');
  // context-value-updated has added the value to the store
  waitFor(() => {
    expect(get(context)).toEqual(expected);
  });

  vi.advanceTimersByTime(5);
  expected.removeValue('a');
  // context-key-removed has removed the value from the store
  waitFor(() => {
    expect(get(context)).toEqual(expected);
  });

  vi.advanceTimersByTime(5);
  expected.setValue('b', 2);
  // context-key-updated has updated the value in the store
  waitFor(() => {
    expect(get(context)).toEqual(expected);
  });
});
