import '@testing-library/jest-dom/vitest';
import { test, expect } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import KubeServiceStatusArtifact from './KubeServiceStatusArtifact.svelte'; // Adjust the import path as necessary
import type { V1ServiceStatus } from '@kubernetes/client-node';

const fakeServiceStatus: V1ServiceStatus = {
  loadBalancer: {
    ingress: [{ ip: '192.0.2.1' }, { hostname: 'example.com' }],
  },
};

test('Renders service status correctly', () => {
  render(KubeServiceStatusArtifact, { artifact: fakeServiceStatus });

  expect(screen.getByText('Status')).toBeInTheDocument();
  expect(screen.getByText('Load Balancer')).toBeInTheDocument();
  expect(screen.getByText('192.0.2.1')).toBeInTheDocument(); // Verifying the IP address is rendered
  expect(screen.getByText('example.com')).toBeInTheDocument(); // Verifying the hostname is rendered
});
