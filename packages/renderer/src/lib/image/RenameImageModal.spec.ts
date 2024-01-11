import '@testing-library/jest-dom/vitest';
import { test, expect, describe } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import RenameImageModal from './RenameImageModal.svelte';
import userEvent from '@testing-library/user-event';

const imageInfo = {
  id: 'sha256:5cdc39fa62556cfcf51e079654a95a6c45574905bce69f49ffc8ea72848612e9',
  shortId: '5cdc39fa6255',
  name: 'image-name',
  tag: 'image-tag',
  engineId: 'podman.Podman Machine',
  engineName: 'Podman',
  humanSize: '128kb',
  age: '2 hours',
  selected: false,
  status: 'UNUSED',
};
const closeCallback = () => {};

describe('RenameImageModel', () => {
  test('Expect that modal has and save button displays', async () => {
    render(RenameImageModal, {
      imageInfoToRename: imageInfo,
      closeCallback: closeCallback,
    });

    const imageNameEntry = screen.getByLabelText('Image Name');
    expect(imageNameEntry).toBeInTheDocument();
    const imageTagEntry = screen.getByLabelText('Image Tag');
    expect(imageTagEntry).toBeInTheDocument();
    const saveButton = screen.getByRole('button', { name: 'Save' });
    expect(saveButton).toBeInTheDocument();
  });

  test('Expect that save button is disabled by default', async () => {
    render(RenameImageModal, {
      imageInfoToRename: imageInfo,
      closeCallback: closeCallback,
    });

    const saveButton = screen.getByRole('button', { name: 'Save' });
    expect(saveButton).toBeInTheDocument();
    expect(saveButton).toBeDisabled();
  });

  test('Expect that empty image name disables save button', async () => {
    render(RenameImageModal, {
      imageInfoToRename: imageInfo,
      closeCallback: closeCallback,
    });

    const saveButton = screen.getByRole('button', { name: 'Save' });
    expect(saveButton).toBeInTheDocument();
    expect(saveButton).toBeDisabled();

    const imageName = screen.getByLabelText('Image Name');
    await userEvent.click(imageName);
    await userEvent.paste('');

    expect(saveButton).toBeDisabled();
  });

  test('Expect that empty image tag disables save button', async () => {
    render(RenameImageModal, {
      imageInfoToRename: imageInfo,
      closeCallback: closeCallback,
    });

    const saveButton = screen.getByRole('button', { name: 'Save' });
    expect(saveButton).toBeInTheDocument();
    expect(saveButton).toBeDisabled();

    const imageTag = screen.getByLabelText('Image Tag');
    await userEvent.click(imageTag);
    await userEvent.paste('');

    expect(saveButton).toBeDisabled();
  });

  test('Expect that valid image name enables save button', async () => {
    render(RenameImageModal, {
      imageInfoToRename: imageInfo,
      closeCallback: closeCallback,
    });

    const saveButton = screen.getByRole('button', { name: 'Save' });
    expect(saveButton).toBeInTheDocument();
    expect(saveButton).toBeDisabled();

    const imageName = screen.getByLabelText('Image Name');
    await userEvent.click(imageName);
    await userEvent.paste('some-valid-name');

    expect(saveButton).toBeEnabled();
  });

  test('Expect that valid image tag enables save button', async () => {
    render(RenameImageModal, {
      imageInfoToRename: imageInfo,
      closeCallback: closeCallback,
    });

    const saveButton = screen.getByRole('button', { name: 'Save' });
    expect(saveButton).toBeInTheDocument();
    expect(saveButton).toBeDisabled();

    const imageTag = screen.getByLabelText('Image Tag');
    await userEvent.click(imageTag);
    await userEvent.paste('some-valid-tag');

    expect(saveButton).toBeEnabled();
  });
});
