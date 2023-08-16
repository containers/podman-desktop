import type { TestContext } from 'vitest';
import type { PodmanDesktopRunner } from '../runner/podman-desktop-runner';

export interface RunnerTestContext extends TestContext {
  pdRunner: PodmanDesktopRunner;
}
