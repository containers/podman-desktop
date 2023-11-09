import '@testing-library/jest-dom/vitest';
import { test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import type { IConfigurationPropertyRecordedSchema } from '../../../../../main/src/plugin/configuration-registry';
import userEvent from '@testing-library/user-event';
import EditableItem from './EditableItem.svelte';

test('Expect input not being visible if editing is NOT in progress', async () => {
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
  render(EditableItem, { record, value });

  const input = screen.queryByLabelText('record-description');
  expect(input).not.toBeInTheDocument();

  const description = screen.queryByLabelText('description');
  expect(description).not.toBeInTheDocument();

  const buttonEdit = screen.getByRole('button', { name: 'Edit' });
  expect(buttonEdit).toBeInTheDocument();

  const buttonCancel = screen.queryByRole('button', { name: 'Cancel' });
  expect(buttonCancel).not.toBeInTheDocument();

  const buttonSave = screen.queryByRole('button', { name: 'Save' });
  expect(buttonSave).not.toBeInTheDocument();
});

test('Expect input being visible if editing is in progress', async () => {
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
  render(EditableItem, { record, value });

  const buttonEdit = screen.getByRole('button', { name: 'Edit' });
  expect(buttonEdit).toBeInTheDocument();

  await userEvent.click(buttonEdit);

  const input = await screen.findByLabelText('record-description');
  expect(input).toBeInTheDocument();

  const buttonCancel = await screen.findByRole('button', { name: 'Cancel' });
  expect(buttonCancel).toBeInTheDocument();

  const buttonSave = await screen.findByRole('button', { name: 'Save' });
  expect(buttonSave).toBeInTheDocument();

  const buttonEditAfterRendering = screen.queryByRole('button', { name: 'Edit' });
  expect(buttonEditAfterRendering).not.toBeInTheDocument();
});

test('Expect description to be visible if defined', async () => {
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
  const description = 'unknown';
  render(EditableItem, { record, value, description });

  const descriptionDiv = screen.queryByLabelText('description');
  expect(descriptionDiv).toBeInTheDocument();
  expect(descriptionDiv?.textContent).toEqual(description);
});

test('Expect save button is disabled if input value is invalid', async () => {
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
  render(EditableItem, { record, value });

  const buttonEdit = screen.getByRole('button', { name: 'Edit' });
  expect(buttonEdit).toBeInTheDocument();

  await userEvent.click(buttonEdit);

  const input = await screen.findByLabelText('record-description');
  expect(input).toBeInTheDocument();

  await userEvent.click(input);
  await userEvent.clear(input);
  await userEvent.keyboard('35');

  const buttonCancel = await screen.findByRole('button', { name: 'Cancel' });
  expect(buttonCancel).toBeInTheDocument();

  const buttonSave = await screen.findByRole('button', { name: 'Save' });
  expect(buttonSave).toBeInTheDocument();
  expect((buttonSave as HTMLButtonElement).disabled).toBeTruthy();

  const buttonEditAfterRendering = screen.queryByRole('button', { name: 'Edit' });
  expect(buttonEditAfterRendering).not.toBeInTheDocument();
});

test('Expect onSave function called if save button is clicked', async () => {
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
  const onSave = vi.fn();
  render(EditableItem, { record, value, onSave });

  const buttonEdit = screen.getByRole('button', { name: 'Edit' });
  expect(buttonEdit).toBeInTheDocument();

  await userEvent.click(buttonEdit);

  const input = await screen.findByLabelText('record-description');
  expect(input).toBeInTheDocument();

  await userEvent.click(input);
  await userEvent.clear(input);
  await userEvent.keyboard('20');

  // wait setTimeout in NumberItem expires and push call
  await new Promise(resolve => setTimeout(resolve, 600));

  const buttonCancel = await screen.findByRole('button', { name: 'Cancel' });
  expect(buttonCancel).toBeInTheDocument();

  const buttonSave = await screen.findByRole('button', { name: 'Save' });
  expect(buttonSave).toBeInTheDocument();
  expect((buttonSave as HTMLButtonElement).disabled).toBeFalsy();

  await userEvent.click(buttonSave);

  expect(onSave).toBeCalledWith('record', 20);
});

test('Expect onSave function not called and in progress is disabled if Cancel button is clicked', async () => {
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
  const onSave = vi.fn();
  render(EditableItem, { record, value, onSave });

  const buttonEdit = screen.getByRole('button', { name: 'Edit' });
  expect(buttonEdit).toBeInTheDocument();

  await userEvent.click(buttonEdit);

  const input = await screen.findByLabelText('record-description');
  expect(input).toBeInTheDocument();

  await userEvent.click(input);
  await userEvent.clear(input);
  await userEvent.keyboard('20');

  // wait setTimeout in NumberItem expires and push call
  await new Promise(resolve => setTimeout(resolve, 600));

  const buttonSave = await screen.findByRole('button', { name: 'Save' });
  expect(buttonSave).toBeInTheDocument();
  expect((buttonSave as HTMLButtonElement).disabled).toBeFalsy();

  const buttonCancel = await screen.findByRole('button', { name: 'Cancel' });
  expect(buttonCancel).toBeInTheDocument();

  await userEvent.click(buttonCancel);

  expect(onSave).not.toBeCalled();

  const buttonEditAfterRendering = await screen.findByRole('button', { name: 'Edit' });
  expect(buttonEditAfterRendering).toBeInTheDocument();
});
