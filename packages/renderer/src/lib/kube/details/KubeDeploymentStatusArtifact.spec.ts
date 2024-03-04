import '@testing-library/jest-dom/vitest';
import { test, expect } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import KubeDeploymentStatusArtifact from './KubeDeploymentStatusArtifact.svelte';
import type { V1DeploymentStatus } from '@kubernetes/client-node';

const fakeDeploymentStatus: V1DeploymentStatus = {
  replicas: 3,
  updatedReplicas: 2,
  availableReplicas: 2,
  unavailableReplicas: 1,
  conditions: [
    {
      type: 'Progressing',
      status: 'True',
      reason: 'NewReplicaSetAvailable',
      message: 'ReplicaSet "fake-replicaset" has successfully progressed.',
    },
  ],
};

test('DeploymentStatus artifact renders with correct values', async () => {
  render(KubeDeploymentStatusArtifact, { artifact: fakeDeploymentStatus });

  // Check replicas information
  expect(screen.getByText('Replicas')).toBeInTheDocument();
  expect(screen.getByText('Desired: 3, Updated: 2, Total: 3, Available: 2, Unavailable: 1')).toBeInTheDocument();

  // Check conditions are rendered correctly
  expect(screen.getByText('Conditions')).toBeInTheDocument();

  // Check conditions are shown
  expect(screen.getByText('Progressing')).toBeInTheDocument();
  expect(screen.getByText('ReplicaSet "fake-replicaset" has successfully progressed.')).toBeInTheDocument();
});
