import '@testing-library/jest-dom/vitest';
import { test, expect } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import KubeObjectMetaArtifact from './KubeObjectMetaArtifact.svelte';
import type { V1ObjectMeta } from '@kubernetes/client-node';

const fakeObjectMeta: V1ObjectMeta = {
  name: 'test-name',
  namespace: 'test-namespace',
  labels: {
    'custom-label': 'custom-value',
  },
  annotations: {
    'custom-annotation': 'custom-value',
  },
};

test('Renders object meta correctly', () => {
  render(KubeObjectMetaArtifact, { artifact: fakeObjectMeta });
  expect(screen.getByText('Metadata')).toBeInTheDocument();
  expect(screen.getByText('Name')).toBeInTheDocument();
  expect(screen.getByText('test-name')).toBeInTheDocument();
  expect(screen.getByText('Namespace')).toBeInTheDocument();
  expect(screen.getByText('test-namespace')).toBeInTheDocument();
  expect(screen.getByText('Created')).toBeInTheDocument();
  expect(screen.getByText('Labels')).toBeInTheDocument();
  expect(screen.getByText('custom-label: custom-value')).toBeInTheDocument();
  expect(screen.getByText('Annotations')).toBeInTheDocument();
  expect(screen.getByText('custom-annotation: custom-value')).toBeInTheDocument();
});
