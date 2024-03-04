import '@testing-library/jest-dom/vitest';
import { test, expect } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import OpenshiftRouteArtifact from './OpenshiftRouteArtifact.svelte';
import type { V1Route } from '../../../../../main/src/plugin/api/openshift-types';

const fakeRoute: V1Route = {
  apiVersion: 'v1',
  kind: 'Route',
  metadata: {
    name: 'example-route',
    namespace: 'default',
    annotations: { 'annotation-key': 'annotation-value' },
    labels: { 'label-key': 'label-value' },
  },
  spec: {
    host: 'example.com',
    path: '/api',
    port: {
      targetPort: 'http2',
    },
    tls: {
      termination: 'edge',
      insecureEdgeTerminationPolicy: 'Redirect',
    },
    to: {
      kind: 'Service',
      name: 'backend-service',
      weight: 100,
    },
    wildcardPolicy: 'None',
  },
};

test('Renders V1Route details correctly with hardcoded values', () => {
  render(OpenshiftRouteArtifact, { artifact: fakeRoute });

  // Verify metadata and spec details are displayed
  expect(screen.getByText('Details')).toBeInTheDocument();
  expect(screen.getByText('Host')).toBeInTheDocument();
  expect(screen.getByText('example.com')).toBeInTheDocument();
  expect(screen.getByText('Path')).toBeInTheDocument();
  expect(screen.getByText('/api')).toBeInTheDocument();
  expect(screen.getByText('Port')).toBeInTheDocument();
  expect(screen.getByText('http2')).toBeInTheDocument();
  expect(screen.getByText('TLS')).toBeInTheDocument();
  expect(screen.getByText('Termination: edge • Insecure Edge Policy: Redirect')).toBeInTheDocument();
  expect(screen.getByText('Backend')).toBeInTheDocument();
  expect(screen.getByText('Service / backend-service (Weight: 100)')).toBeInTheDocument();
  expect(screen.getByText('Link')).toBeInTheDocument();
  expect(screen.getByText(`https://example.com/api`)).toBeInTheDocument(); // Verifying the constructed link
});
