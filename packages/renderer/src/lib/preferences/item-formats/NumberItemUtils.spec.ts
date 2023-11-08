import '@testing-library/jest-dom/vitest';
import { test, expect } from 'vitest';
import type { IConfigurationPropertyRecordedSchema } from '../../../../../main/src/plugin/configuration-registry';
import { checkNumericValueValid } from './NumberItemUtils';

test('Expect an error message if value input is NaN', async () => {
  const record: IConfigurationPropertyRecordedSchema = {
    id: 'record',
    title: 'record',
    parentId: 'parent.record',
    description: 'record-description',
    type: 'number',
    minimum: 1,
    maximum: 34,
  };
  const value = Number('unknown');

  const numericValueValid = checkNumericValueValid(record, value);
  expect(numericValueValid.valid).toBeFalsy();
  expect(numericValueValid.error).toBeDefined();
  expect(numericValueValid.error).toEqual(
    `Expecting a number. The value cannot be less than ${record.minimum}${
      record.maximum ? ` or greater than ${record.maximum}` : ''
    }`,
  );
});

test('Expect an error message if value input is above the upper range', async () => {
  const record: IConfigurationPropertyRecordedSchema = {
    id: 'record',
    title: 'record',
    parentId: 'parent.record',
    description: 'record-description',
    type: 'number',
    minimum: 1,
    maximum: 34,
  };
  const value = 40;

  const numericValueValid = checkNumericValueValid(record, value);
  expect(numericValueValid.valid).toBeFalsy();
  expect(numericValueValid.error).toBeDefined();
  expect(numericValueValid.error).toEqual(`The value cannot be greater than ${record.maximum}`);
});

test('Expect an error message if value input is below the lower range', async () => {
  const record: IConfigurationPropertyRecordedSchema = {
    id: 'record',
    title: 'record',
    parentId: 'parent.record',
    description: 'record-description',
    type: 'number',
    minimum: 1,
    maximum: 34,
  };
  const value = 0;

  const numericValueValid = checkNumericValueValid(record, value);
  expect(numericValueValid.valid).toBeFalsy();
  expect(numericValueValid.error).toBeDefined();
  expect(numericValueValid.error).toEqual(`The value cannot be less than ${record.minimum}`);
});

test('Expect no error if value input is valid', async () => {
  const record: IConfigurationPropertyRecordedSchema = {
    id: 'record',
    title: 'record',
    parentId: 'parent.record',
    description: 'record-description',
    type: 'number',
    minimum: 1,
    maximum: 34,
  };
  const value = 2;

  const numericValueValid = checkNumericValueValid(record, value);
  expect(numericValueValid.valid).toBeTruthy();
  expect(numericValueValid.error).toBeUndefined();
});
