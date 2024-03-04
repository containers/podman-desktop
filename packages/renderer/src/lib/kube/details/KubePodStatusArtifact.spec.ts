import '@testing-library/jest-dom/vitest';
import { test, expect } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import KubePodStatusArtifact from './KubePodStatusArtifact.svelte'; // Adjust the import path as necessary
import type { V1PodStatus } from '@kubernetes/client-node';

const fakePodStatus: V1PodStatus = {
  phase: 'Running',
  podIP: '192.168.1.1',
  hostIP: '192.168.1.2',
};

test('Renders pod status correctly with hardcoded values', () => {
  render(KubePodStatusArtifact, { artifact: fakePodStatus });

  // Verify the status title and details are displayed with hardcoded expectations
  expect(screen.getByText('Status')).toBeInTheDocument();
  expect(screen.getByText('Phase')).toBeInTheDocument();
  expect(screen.getByText('Running')).toBeInTheDocument();

  expect(screen.getByText('Pod IP')).toBeInTheDocument();
  expect(screen.getByText('192.168.1.1')).toBeInTheDocument();

  expect(screen.getByText('Host IP')).toBeInTheDocument();
  expect(screen.getByText('192.168.1.2')).toBeInTheDocument();
});
