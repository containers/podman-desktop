import '@testing-library/jest-dom';
import { beforeAll, test, expect } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import AppNavigation from './AppNavigation.svelte';

// fake the window.events object
beforeAll(() => {
  (window.events as unknown) = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    receive: (_channel: string, func: any) => {
      func();
    },
  };
});

async function waitRender(customProperties: object): Promise<void> {
  const result = render(AppNavigation, { ...customProperties });
  // wait that result.component.$$.ctx[2] is set
  while (result.component.$$.ctx[2] === undefined) {
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}

describe('AppNavigation testing suite', async () => {
  test('Test rendering of the navigation bar with empty items', async () => {
    await waitRender({
      exitSettingsCallback: () => {},
      meta: {
        url: '/',
      },
    });

    const dasboard = screen.getByRole('link', { name: 'Dashboard' });
    expect(dasboard).toBeInTheDocument();
    const containers = screen.getByRole('link', { name: 'Containers' });
    expect(containers).toBeInTheDocument();
    const pods = screen.getByRole('link', { name: 'Pods' });
    expect(pods).toBeInTheDocument();
    const images = screen.getByRole('link', { name: 'Images' });
    expect(images).toBeInTheDocument();
    const volumes = screen.getByRole('link', { name: 'Volumes' });
    expect(volumes).toBeInTheDocument();
    const settings = screen.getByRole('link', { name: 'Settings' });
    expect(settings).toBeInTheDocument();
  });
});
