import '@testing-library/jest-dom/vitest';
import { test, expect, vi, beforeAll } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import type { IConfigurationPropertyRecordedSchema } from '../../../../../main/src/plugin/configuration-registry';
import FileItem from './FileItem.svelte';
import userEvent from '@testing-library/user-event';

const openDialogMock = vi.fn();
beforeAll(() => {
  (window as any).getConfigurationValue = vi.fn();
  (window as any).openDialog = openDialogMock;
});

test('Ensure HTMLInputElement', async () => {
  const record: IConfigurationPropertyRecordedSchema = {
    id: 'record',
    title: 'record',
    parentId: 'parent.record',
    description: 'record-description',
    type: 'string',
    format: 'file',
  };

  render(FileItem, { record, value: '' });
  const input = screen.getByLabelText('record-description');
  expect(input).toBeInTheDocument();

  expect(input instanceof HTMLInputElement).toBe(true);
});

test('Ensure clicking on Browser invoke openDialog', async () => {
  openDialogMock.mockResolvedValue([]);
  const record: IConfigurationPropertyRecordedSchema = {
    id: 'record',
    title: 'record',
    parentId: 'parent.record',
    description: 'record-description',
    type: 'string',
    format: 'file',
  };

  render(FileItem, { record, value: '' });
  const input = screen.getByRole('button', { name: `button-${record.description}` });
  expect(input).toBeInTheDocument();
  await userEvent.click(input);

  expect(openDialogMock).toBeCalled();
});
