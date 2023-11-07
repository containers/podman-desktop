import '@testing-library/jest-dom/vitest';
import { test, expect, vi, beforeAll } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import type { IConfigurationPropertyRecordedSchema } from '../../../../../main/src/plugin/configuration-registry';
import NumberItem from './NumberItem.svelte';
import userEvent from '@testing-library/user-event';

beforeAll(() => {
  (window as any).getConfigurationValue = vi.fn();
});

test('Expect tooltip if value input is NaN', async () => {
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
  render(NumberItem, { record, value });

  const input = screen.getByLabelText('record-description');
  expect(input).toBeInTheDocument();
  await userEvent.click(input);
  await userEvent.clear(input);
  await userEvent.keyboard('unknown');

  const tooltip = screen.getByLabelText('tooltip');
  expect(tooltip).toBeInTheDocument();
  expect(tooltip.textContent).toContain('Expecting a number');
});

test('Expect decrement button disabled if value is less than minimum', async () => {
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
  render(NumberItem, { record, value });

  const input = screen.getByLabelText('decrement');
  expect(input).toBeInTheDocument();
  expect(input).toBeDisabled();
});

test('Expect increment button disabled if value is less than minimum', async () => {
  const record: IConfigurationPropertyRecordedSchema = {
    id: 'record',
    title: 'record',
    parentId: 'parent.record',
    description: 'record-description',
    type: 'number',
    minimum: 1,
    maximum: 34,
  };
  const value = 35;
  render(NumberItem, { record, value });

  const input = screen.getByLabelText('increment');
  expect(input).toBeInTheDocument();
  expect(input).toBeDisabled();
});

test('Expect increment button only works one if maximum value is reached after one click', async () => {
  const record: IConfigurationPropertyRecordedSchema = {
    id: 'record',
    title: 'record',
    parentId: 'parent.record',
    description: 'record-description',
    type: 'number',
    minimum: 1,
    maximum: 34,
  };
  const value = 33;
  render(NumberItem, { record, value });

  const input = screen.getByLabelText('increment');
  expect(input).toBeInTheDocument();
  expect(input).toBeEnabled();
  await userEvent.click(input);

  expect(input).toBeDisabled();
});

test('Expect decrement button only works one if minimum value is reached after one click', async () => {
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
  render(NumberItem, { record, value });

  const input = screen.getByLabelText('decrement');
  expect(input).toBeInTheDocument();
  expect(input).toBeEnabled();
  await userEvent.click(input);

  expect(input).toBeDisabled();
});

test('Expect to have both buttons hidden if onlyTextInput is true', async () => {
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
  render(NumberItem, { record, value, onlyTextInput: true });

  const decrementButton = screen.queryByRole('button', { name: 'decrement' });
  expect(decrementButton).not.toBeInTheDocument();

  const incrementButton = screen.queryByRole('button', { name: 'increment' });
  expect(incrementButton).not.toBeInTheDocument();

  const input = screen.getByLabelText('record-description');
  expect(input).toBeInTheDocument();
});
