import { beforeEach, expect, test, vi } from 'vitest';
import { activate, getGitHubAccessToken, GitHubProvider } from './extension';
import * as extensionApi from '@podman-desktop/api';
import type {
  AuthenticationProvider,
  AuthenticationProviderOptions,
  Configuration,
  TelemetryLogger,
} from '@podman-desktop/api';

// Mock telemetry
const telemetryLogUsageMock = vi.fn();
const telemetryLogErrorMock = vi.fn();
const telemetryLoggerMock = {
  logUsage: telemetryLogUsageMock,
  logError: telemetryLogErrorMock,
} as unknown as TelemetryLogger;

// Mock configurable properties
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

const fireMock = vi.hoisted(() => vi.fn());

vi.mock('@podman-desktop/api', async () => {
  return {
    EventEmitter: vi.fn().mockReturnValue({
      fire: fireMock,
    }),
    configuration: {
      getConfiguration: vi.fn(),
    },
    authentication: {
      registerAuthenticationProvider: vi.fn(),
    },
    env: {
      createTelemetryLogger: vi.fn().mockImplementation(() => telemetryLoggerMock),
    },
    window: {
      showErrorMessage: vi.fn(),
    },
  };
});

beforeEach(() => {
  vi.clearAllMocks();
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

test('expect token configuration undefined', async () => {
  vi.spyOn(extensionApi.configuration, 'getConfiguration').mockReturnValue(fakeConfiguration());
  expect(getGitHubAccessToken()).toBeUndefined();
});

test('expect token configuration defined', async () => {
  vi.spyOn(extensionApi.configuration, 'getConfiguration').mockReturnValue(fakeConfiguration('dummy'));
  expect(getGitHubAccessToken()).toBe('dummy');
});

test('error: cannot create session: empty access token', async () => {
  vi.spyOn(extensionApi.configuration, 'getConfiguration').mockReturnValue(fakeConfiguration());

  const authProvider = new GitHubProvider(telemetryLoggerMock);

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
  // Configured access token
  vi.spyOn(extensionApi.configuration, 'getConfiguration').mockReturnValue(fakeConfiguration('dummy'));

  const authProvider = new GitHubProvider(telemetryLoggerMock);

  // createSession without access token configured
  const session = await authProvider.createSession([]);
  expect(session).toBeDefined();
  expect(session.accessToken).toBe('dummy');
  expect(fireMock).toHaveBeenNthCalledWith(1, {
    added: [session],
  });
});

test('expect createSession to be called automatically', async () => {
  // We have a configured access token value
  vi.spyOn(extensionApi.configuration, 'getConfiguration').mockReturnValue(fakeConfiguration('dummy'));

  let provider: AuthenticationProvider | undefined = undefined;
  vi.spyOn(extensionApi.authentication, 'registerAuthenticationProvider').mockImplementation(
    (_id: string, _label: string, nProvider: AuthenticationProvider, _options?: AuthenticationProviderOptions) => {
      provider = nProvider;
      return undefined;
    },
  );

  await activate();
  expect(provider).toBeDefined();
  expect(await provider.getSessions([])).toHaveLength(1);
});

test('expect createSession not to be called automatically', async () => {
  // We DO NOT have a configured access token value
  vi.spyOn(extensionApi.configuration, 'getConfiguration').mockReturnValue(fakeConfiguration());

  let provider: AuthenticationProvider | undefined = undefined;
  vi.spyOn(extensionApi.authentication, 'registerAuthenticationProvider').mockImplementation(
    (_id: string, _label: string, nProvider: AuthenticationProvider, _options?: AuthenticationProviderOptions) => {
      provider = nProvider;
      return undefined;
    },
  );

  await activate();
  expect(provider).toBeDefined();
  expect(await provider.getSessions([])).toHaveLength(0);
});

test('expect session removed properly', async () => {
  vi.spyOn(extensionApi.configuration, 'getConfiguration').mockReturnValue(fakeConfiguration('dummy'));

  const authProvider = new GitHubProvider(telemetryLoggerMock);

  // createSession with access token configured
  const session = await authProvider.createSession([]);
  // Ensure the session is created and event fired
  expect(await authProvider.getSessions()).toHaveLength(1);
  expect(fireMock).toHaveBeenNthCalledWith(1, {
    added: [session],
  });

  // Reset the fire mock
  fireMock.mockReset();
  await authProvider.removeSession(session.id);

  expect(await authProvider.getSessions()).toHaveLength(0);
  expect(fireMock).toHaveBeenNthCalledWith(1, {
    removed: [session],
  });
});
