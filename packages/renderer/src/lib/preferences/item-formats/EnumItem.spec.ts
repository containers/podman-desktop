import '@testing-library/jest-dom/vitest';
import { test, expect, vi, beforeAll } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import type { IConfigurationPropertyRecordedSchema } from '../../../../../main/src/plugin/configuration-registry';
import EnumItem from './EnumItem.svelte';

beforeAll(() => {
  (window as any).getConfigurationValue = vi.fn();
});

test('Enum without default', async () => {
  const record: IConfigurationPropertyRecordedSchema = {
    id: 'record',
    title: 'record',
    parentId: 'parent.record',
    description: 'record-description',
    enum: ['hello', 'world'],
  };

  render(EnumItem, { record });
  const input = screen.getByLabelText('record-description');
  expect(input).toBeInTheDocument();

  expect(input instanceof HTMLSelectElement).toBe(true);
  expect((input as HTMLSelectElement).selectedIndex).toBe(0);
});

test('Enum with default', async () => {
  const record: IConfigurationPropertyRecordedSchema = {
    id: 'record',
    title: 'record',
    parentId: 'parent.record',
    description: 'record-description',
    enum: ['hello', 'world'],
    default: 'world',
  };

  render(EnumItem, { record, value: record.default });
  const input = screen.getByLabelText('record-description');
  expect(input).toBeInTheDocument();

  expect(input instanceof HTMLSelectElement).toBe(true);
  expect((input as HTMLSelectElement).selectedIndex).toBe(1);
  expect((input as HTMLSelectElement).selectedOptions.length).toBe(1);
  expect((input as HTMLSelectElement).selectedOptions[0].text).toBe('world');
});
