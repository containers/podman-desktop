import '@testing-library/jest-dom/vitest';
import { test, expect } from 'vitest';
import { removeNonSerializableProperties } from '/@/lib/actions/ActionUtils';

test('Object with single non serializable property', async () => {
  expect(
    removeNonSerializableProperties({
      nonSerializable: () => {},
    }),
  ).toStrictEqual({});
});

test('Array with single non serializable property', async () => {
  expect(removeNonSerializableProperties([() => {}])).toStrictEqual([]);
});

test('Array with single non serializable and serializable property', async () => {
  expect(removeNonSerializableProperties([() => {}, 'dummy'])).toStrictEqual(['dummy']);
});

test('Object with properties nested in object', async () => {
  expect(
    removeNonSerializableProperties({
      parent: {
        nonSerializable: () => {},
        serializable: 'dummy',
      },
    }),
  ).toStrictEqual({
    parent: {
      serializable: 'dummy',
    },
  });
});

test('Object with properties nested in array', async () => {
  expect(
    removeNonSerializableProperties({
      parent: [
        {
          nonSerializable: () => {},
          serializable: 'dummy',
        },
      ],
    }),
  ).toStrictEqual({
    parent: [
      {
        serializable: 'dummy',
      },
    ],
  });
});

test('Object with single non serializable property nested in array', async () => {
  expect(
    removeNonSerializableProperties({
      parent: [
        {
          nonSerializable: () => {},
          serializable: 'dummy',
        },
      ],
    }),
  ).toStrictEqual({
    parent: [
      {
        serializable: 'dummy',
      },
    ],
  });
});
