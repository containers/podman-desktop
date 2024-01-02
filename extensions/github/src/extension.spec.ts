import { expect, test, vi } from 'vitest';
import { GitHubProvider } from './extension';
import * as extensionApi from '@podman-desktop/api';
import type { Configuration } from '@podman-desktop/api';

function fakeConfiguration(accessToken?: string): Configuration {
  return {
    get(section: string, defaultValue?: string): string | undefined {
      return section === 'token' ? accessToken || defaultValue : defaultValue;
    },
    has(): boolean {
      throw new Error('not implemented');
    },
    update(): Promise<void> {
      throw new Error('not implemented');
    },
  };
}

vi.mock('@podman-desktop/api', async () => {
  return {
    EventEmitter: vi.fn().mockReturnValue({
      fire: vi.fn(),
    }),
    configuration: {
      getConfiguration: vi.fn(),
    },
  };
});

vi.mock('@octokit/rest', () => {
  const users = {
    getAuthenticated: vi.fn().mockReturnValue({
      data: { id: 'mocked', name: '@mocked' },
    }),
  };
  return {
    Octokit: vi.fn().mockReturnValue({ users: users }),
  };
});

test('error: cannot create session: empty access token', async () => {
  vi.spyOn(extensionApi.configuration, 'getConfiguration').mockReturnValue(fakeConfiguration());

  const authProvider = new GitHubProvider();

  // createSession without access token configured
  try {
    await authProvider.createSession([]);
    // Expect that showErrorMessage is called
    expect(extensionApi.window.showErrorMessage).toHaveBeenCalled();
  } catch (err) {
    expect(err).to.be.a('Error');
    expect(err).toBeDefined();
  }
});

test('valid access token', async () => {
  vi.spyOn(extensionApi.configuration, 'getConfiguration').mockReturnValue(fakeConfiguration('dummy'));

  const authProvider = new GitHubProvider();

  // createSession without access token configured
  const session = await authProvider.createSession([]);
  expect(session).toBeDefined();
  expect(session.accessToken).toBe('dummy');
});
