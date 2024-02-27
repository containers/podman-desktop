import '@testing-library/jest-dom/vitest';
import { test, expect } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import KubePodSpecArtifact from './KubePodSpecArtifact.svelte'; // Ensure this path matches your file structure
import type { V1PodSpec } from '@kubernetes/client-node';

const fakePodSpec: V1PodSpec = {
  nodeName: 'node-01',
  serviceAccountName: 'default-service-account',
  restartPolicy: 'Always',
  containers: [
    {
      name: 'nginx-container',
      image: 'nginx:latest',
    },
    {
      name: 'redis-container',
      image: 'redis:latest',
    },
  ],
  // Example structure, adjust based on your actual `V1PodSpec` structure
  volumes: [
    {
      name: 'volume-01',
      emptyDir: {},
    },
    {
      name: 'volume-02',
      hostPath: {
        path: '/data',
      },
    },
  ],
};

test('Renders pod spec correctly', () => {
  render(KubePodSpecArtifact, { artifact: fakePodSpec });

  // Static details
  expect(screen.getByText('Details')).toBeInTheDocument();
  expect(screen.getByText('Node Name')).toBeInTheDocument();
  expect(screen.getByText('node-01')).toBeInTheDocument();
  expect(screen.getByText('Service Account')).toBeInTheDocument();
  expect(screen.getByText('default-service-account')).toBeInTheDocument();
  expect(screen.getByText('Restart Policy')).toBeInTheDocument();
  expect(screen.getByText('Always')).toBeInTheDocument();

  expect(screen.getAllByText('nginx-container'));
  expect(screen.getAllByText('redis-container'));
});
