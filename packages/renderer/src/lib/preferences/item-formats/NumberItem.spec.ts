import '@testing-library/jest-dom/vitest';
import { test, expect, vi, beforeAll } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import type { IConfigurationPropertyRecordedSchema } from '../../../../../main/src/plugin/configuration-registry';
import NumberItem from './NumberItem.svelte';

beforeAll(() => {
  (window as any).getConfigurationValue = vi.fn();
});

test('Expect tooltip if NaN provided as value', async () => {
  const record: IConfigurationPropertyRecordedSchema = {
    id: 'record',
    title: 'record',
    parentId: 'parent.record',
    description: 'record-description',
    type: 'number',
    minimum: 1,
    maximum: 34,
  };
  const value = NaN;
  render(NumberItem, { record, value });
  const input = screen.getByLabelText('record-description');
  expect(input).toBeInTheDocument();

  const tooltip = screen.getByLabelText('tooltip');
  expect(tooltip).toBeInTheDocument();
  expect(tooltip.textContent).toBe('Expecting a number');
});
