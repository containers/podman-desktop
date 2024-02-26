import '@testing-library/jest-dom/vitest';
import { test, expect } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import type { V1DeploymentSpec } from '@kubernetes/client-node';
import KubeDeploymentArtifact from './KubeDeploymentArtifact.svelte'; // Adjust the import path as necessary

const fakeDeploymentSpec: V1DeploymentSpec = {
  replicas: 3,
  selector: {
    matchLabels: {
      foo: 'bar',
    },
  },
  strategy: {
    type: 'RollingUpdate',
  },
  template: {},
};

test('DeploymentSpec artifact renders with correct values', async () => {
  render(KubeDeploymentArtifact, { artifact: fakeDeploymentSpec });

  // Check if replicas are displayed correctly
  expect(screen.getByText('Replicas')).toBeInTheDocument();
  expect(screen.getByText('3')).toBeInTheDocument();

  // Check if selector is displayed correctly
  expect(screen.getByText('Selector')).toBeInTheDocument();
  expect(screen.getByText('foo: bar')).toBeInTheDocument();

  // Check if strategy type is displayed correctly
  expect(screen.getByText('Strategy')).toBeInTheDocument();
  expect(screen.getByText('RollingUpdate')).toBeInTheDocument();
});
