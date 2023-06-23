import '@testing-library/jest-dom';
import { test, expect } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import RenameImageModal from './RenameImageModal.svelte';

describe('RenameImageModel', () => {
  test('Expect that modal is available and save button displays', async () => {
    const imageInfo = {
      id: 'sha256:5cdc39fa62556cfcf51e079654a95a6c45574905bce69f49ffc8ea72848612e9',
      shortId: '5cdc39fa6255',
      name: 'image-name',
      engineId: 'podman.Podman Machine',
      engineName: 'Podman',
      humanSize: '128kb',
      age: '2 hours',
      selected: false,
      inUse: false,
    };
    const callback = () => {};

    render(RenameImageModal, {
      imageInfoToRename: imageInfo,
      closeCallback: callback,
    });

    const saveButton = screen.getByRole('button', { name: 'Save' });
    expect(saveButton).toBeInTheDocument();
    expect(saveButton).toBeEnabled();
  });
});
