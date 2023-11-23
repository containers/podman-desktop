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

  vi.waitFor(() => {
    const msg = screen.getByText(content => content.includes('Analyzing'));
    expect(msg).toBeInTheDocument();
  });
});

test('expect to abort when clicking the Abort button', async () => {
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
    const abortBtn = screen.getByRole('button', { name: 'Abort' });
    await fireEvent.click(abortBtn);
  });

  vi.waitFor(() => {
    const msg = screen.getByText(content => content.includes('Check aborted'));
    expect(msg).toBeInTheDocument();
  });

  expect(cancelTokenSpy).toHaveBeenCalledWith(tokenID);
});

test('expect to abort when destroying the component', async () => {
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
    screen.getByRole('button', { name: 'Abort' });
  });

  result.unmount();

  expect(cancelTokenSpy).toHaveBeenCalledWith(tokenID);
});

test('expect to not abort again when destroying the component after abort', async () => {
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
    const abortBtn = screen.getByRole('button', { name: 'Abort' });
    await fireEvent.click(abortBtn);
  });

  vi.waitFor(() => {
    const msg = screen.getByText(content => content.includes('Check aborted'));
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

  vi.waitFor(() => {
    const cell = screen.getByText('check1');
    expect(cell).toBeInTheDocument();
  });
});

test('expect to not abort when destroying te component after displaying results from image checker provider', async () => {
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

  vi.waitFor(() => {
    const cell = screen.getByText('check1');
    expect(cell).toBeInTheDocument();
  });

  result.unmount();

  expect(cancelTokenSpy).not.toHaveBeenCalled();
});
