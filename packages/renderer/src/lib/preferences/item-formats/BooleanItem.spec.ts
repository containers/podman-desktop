import '@testing-library/jest-dom/vitest';
import { test, expect, vi, beforeAll } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import type { IConfigurationPropertyRecordedSchema } from '../../../../../main/src/plugin/configuration-registry';
import BooleanItem from './BooleanItem.svelte';

beforeAll(() => {
  (window as any).getConfigurationValue = vi.fn();
});

test('Checkbox checked', async () => {
  const record: IConfigurationPropertyRecordedSchema = {
    id: 'record',
    title: 'record',
    parentId: 'parent.record',
    description: 'record-description',
    type: 'boolean',
    default: true,
  };

  render(BooleanItem, { record, checked: record.default });
  const input = screen.getByLabelText('record-description');
  expect(input).toBeInTheDocument();

  expect(input instanceof HTMLInputElement).toBe(true);
  expect((input as HTMLInputElement).checked).toBe(true);
});

test('Checkbox no default', async () => {
  const record: IConfigurationPropertyRecordedSchema = {
    id: 'record',
    title: 'record',
    parentId: 'parent.record',
    description: 'record-description',
    type: 'boolean',
  };

  render(BooleanItem, { record, checked: record.default });
  const input = screen.getByLabelText('record-description');
  expect(input).toBeInTheDocument();

  expect(input instanceof HTMLInputElement).toBe(true);
  expect((input as HTMLInputElement).checked).toBe(false);
});

test('Expect to see the checkbox disabled / unable to press when readonly is passed into record', async () => {
  const record: IConfigurationPropertyRecordedSchema = {
    title: 'my boolean property',
    id: 'myid',
    parentId: '',
    type: 'boolean',
    default: true,
    readonly: true,
  };
  // remove display name
  render(BooleanItem, { record, checked: record.default });
  const button = screen.getByRole('checkbox');
  expect(button).toBeInTheDocument();
  expect(button).toBeChecked();
  expect(button).toBeDisabled();
});

test('Expect to see checkbox not checked if default is false', async () => {
  const record: IConfigurationPropertyRecordedSchema = {
    title: 'my boolean property',
    id: 'myid',
    parentId: '',
    type: 'boolean',
    default: false,
  };
  // remove display name
  render(BooleanItem, { record, checked: record.default });
  const button = screen.getByRole('checkbox');
  expect(button).toBeInTheDocument();
  expect(button).not.toBeChecked();
});
