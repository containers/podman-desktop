import '@testing-library/jest-dom/vitest';
import { beforeAll, beforeEach, expect, test, vi } from 'vitest';
import ImageDetailsCheck from './ImageDetailsCheck.svelte';
import { fireEvent, render, screen } from '@testing-library/svelte';
import type { ImageChecks } from '@podman-desktop/api';
import { imageCheckerProviders } from '/@/stores/image-checker-providers';

const getCancellableTokenSourceMock = vi.fn();
const imageCheckMock = vi.fn();
const cancelTokenSpy = vi.fn();

const tokenID = 70735;
beforeAll(() => {
  (window as any).getCancellableTokenSource = getCancellableTokenSourceMock;
  getCancellableTokenSourceMock.mockImplementation(() => tokenID);
  (window as any).imageCheck = imageCheckMock;
  (window as any).cancelToken = cancelTokenSpy;
  (window as any).telemetryTrack = vi.fn();
});

beforeEach(() => {
  vi.clearAllMocks();
});

test('expect to display wait message before to receive results', async () => {
  imageCheckerProviders.set([
    {
      id: 'provider1',
      label: 'Image Checker',
    },
  ]);

  imageCheckMock.mockImplementation(async () => {
    // never returns results
    return new Promise(() => {});
  });

  render(ImageDetailsCheck, {
    image: {
      id: '123456',
      shortId: '123',
      name: 'an-image',
      engineId: 'podman',
      engineName: 'Podman',
      tag: 'a-tag',
      createdAt: 123,
      age: '1 day',
      humanSize: '1Mb',
      base64RepoTag: Buffer.from('<none>', 'binary').toString('base64'),
      selected: false,
      inUse: false,
    },
  });

  await vi.waitFor(() => {
    const msg = screen.getByText(content => content.includes('Image analysis in progress'));
    expect(msg).toBeInTheDocument();
  });
});

test('expect to cancel when clicking the Cancel button', async () => {
  imageCheckerProviders.set([
    {
      id: 'provider1',
      label: 'Image Checker',
    },
  ]);

  imageCheckMock.mockImplementation(async () => {
    // never returns results
    return new Promise(() => {});
  });

  render(ImageDetailsCheck, {
    image: {
      id: '123456',
      shortId: '123',
      name: 'an-image',
      engineId: 'podman',
      engineName: 'Podman',
      tag: 'a-tag',
      createdAt: 123,
      age: '1 day',
      humanSize: '1Mb',
      base64RepoTag: Buffer.from('<none>', 'binary').toString('base64'),
      selected: false,
      inUse: false,
    },
  });

  await vi.waitFor(async () => {
    const abortBtn = screen.getByRole('button', { name: 'Cancel' });
    await fireEvent.click(abortBtn);
  });

  await vi.waitFor(() => {
    const msg = screen.getByText(content => content.includes('Image analysis canceled'));
    expect(msg).toBeInTheDocument();
  });

  expect(cancelTokenSpy).toHaveBeenCalledWith(tokenID);
});

test('expect to cancel when destroying the component', async () => {
  imageCheckerProviders.set([
    {
      id: 'provider1',
      label: 'Image Checker',
    },
  ]);

  imageCheckMock.mockImplementation(async () => {
    // never returns results
    return new Promise(() => {});
  });

  const result = render(ImageDetailsCheck, {
    image: {
      id: '123456',
      shortId: '123',
      name: 'an-image',
      engineId: 'podman',
      engineName: 'Podman',
      tag: 'a-tag',
      createdAt: 123,
      age: '1 day',
      humanSize: '1Mb',
      base64RepoTag: Buffer.from('<none>', 'binary').toString('base64'),
      selected: false,
      inUse: false,
    },
  });

  await vi.waitFor(async () => {
    screen.getByRole('button', { name: 'Cancel' });
  });

  result.unmount();

  expect(cancelTokenSpy).toHaveBeenCalledWith(tokenID);
});

test('expect to not cancel again when destroying the component after manual cancel', async () => {
  imageCheckerProviders.set([
    {
      id: 'provider1',
      label: 'Image Checker',
    },
  ]);

  imageCheckMock.mockImplementation(async () => {
    // never returns results
    return new Promise(() => {});
  });

  const result = render(ImageDetailsCheck, {
    image: {
      id: '123456',
      shortId: '123',
      name: 'an-image',
      engineId: 'podman',
      engineName: 'Podman',
      tag: 'a-tag',
      createdAt: 123,
      age: '1 day',
      humanSize: '1Mb',
      base64RepoTag: Buffer.from('<none>', 'binary').toString('base64'),
      selected: false,
      inUse: false,
    },
  });

  await vi.waitFor(async () => {
    const abortBtn = screen.getByRole('button', { name: 'Cancel' });
    await fireEvent.click(abortBtn);
  });

  await vi.waitFor(() => {
    const msg = screen.getByText(content => content.includes('Image analysis canceled'));
    expect(msg).toBeInTheDocument();
  });

  expect(cancelTokenSpy).toHaveBeenCalledWith(tokenID);

  result.unmount();

  expect(cancelTokenSpy).toHaveBeenCalledTimes(1);
});

test('expect to display results from image checker provider', async () => {
  imageCheckerProviders.set([
    {
      id: 'provider1',
      label: 'Image Checker',
    },
  ]);

  imageCheckMock.mockResolvedValue({
    checks: [
      {
        name: 'check1',
        status: 'failed',
        markdownDescription: 'an error for check1',
        severity: 'critical',
      },
    ],
  } as ImageChecks);

  render(ImageDetailsCheck, {
    image: {
      id: '123456',
      shortId: '123',
      name: 'an-image',
      engineId: 'podman',
      engineName: 'Podman',
      tag: 'a-tag',
      createdAt: 123,
      age: '1 day',
      humanSize: '1Mb',
      base64RepoTag: Buffer.from('<none>', 'binary').toString('base64'),
      selected: false,
      inUse: false,
    },
  });

  await vi.waitFor(() => {
    const msg = screen.getByText(content => content.includes('Image analysis complete'));
    expect(msg).toBeInTheDocument();
  });

  await vi.waitFor(() => {
    const cell = screen.getByText('check1');
    expect(cell).toBeInTheDocument();
  });
});

test('expect to not cancel when destroying the component after displaying results from image checker provider', async () => {
  imageCheckerProviders.set([
    {
      id: 'provider1',
      label: 'Image Checker',
    },
  ]);

  imageCheckMock.mockResolvedValue({
    checks: [
      {
        name: 'check1',
        status: 'failed',
        markdownDescription: 'an error for check1',
        severity: 'critical',
      },
    ],
  } as ImageChecks);

  const result = render(ImageDetailsCheck, {
    image: {
      id: '123456',
      shortId: '123',
      name: 'an-image',
      engineId: 'podman',
      engineName: 'Podman',
      tag: 'a-tag',
      createdAt: 123,
      age: '1 day',
      humanSize: '1Mb',
      base64RepoTag: Buffer.from('<none>', 'binary').toString('base64'),
      selected: false,
      inUse: false,
    },
  });

  await vi.waitFor(() => {
    const cell = screen.getByText('check1');
    expect(cell).toBeInTheDocument();
  });

  result.unmount();

  expect(cancelTokenSpy).not.toHaveBeenCalled();
});
