import type { TestContext } from 'vitest';
import type { PodmanDesktopRunner } from '../runner/podman-desktop-runner';

declare module 'vitest' {
  export interface PDRunnerTestContext extends TestContext {
    pdRunner: PodmanDesktopRunner;
  }
}
