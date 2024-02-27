import '@testing-library/jest-dom/vitest';
import { test, expect } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import KubeServiceSpecArtifact from './KubeServiceArtifact.svelte'; // Adjust the import path as necessary

const fakeServiceSpec = {
  type: 'ClusterIP',
  clusterIP: '10.96.0.1',
  externalIPs: ['192.168.1.1', '192.168.1.2'],
  sessionAffinity: 'None',
  ports: [
    { name: 'http', port: 80, protocol: 'TCP' },
    { port: 443, protocol: 'TCP' },
  ],
  selector: {
    app: 'myApp',
    department: 'engineering',
  },
};

test('Renders service spec correctly', () => {
  render(KubeServiceSpecArtifact, { artifact: fakeServiceSpec });

  // Verify static details
  expect(screen.getByText('Details')).toBeInTheDocument();
  expect(screen.getByText('Type')).toBeInTheDocument();
  expect(screen.getByText('ClusterIP')).toBeInTheDocument();
  expect(screen.getByText('Cluster IP')).toBeInTheDocument();
  expect(screen.getByText('10.96.0.1')).toBeInTheDocument();
  expect(screen.getByText('External IPs')).toBeInTheDocument();
  expect(screen.getByText('192.168.1.1, 192.168.1.2')).toBeInTheDocument();
  expect(screen.getByText('Session Affinity')).toBeInTheDocument();
  expect(screen.getByText('None')).toBeInTheDocument();

  // Verify ports are displayed correctly
  expect(screen.getByText('Ports')).toBeInTheDocument();
  expect(screen.getByText('http:80/TCP')).toBeInTheDocument();
  expect(screen.getByText('443/TCP')).toBeInTheDocument();

  // Verify selectors are displayed correctly
  expect(screen.getByText('Selectors')).toBeInTheDocument();
  expect(screen.getByText('app: myApp')).toBeInTheDocument();
  expect(screen.getByText('department: engineering')).toBeInTheDocument();
});
