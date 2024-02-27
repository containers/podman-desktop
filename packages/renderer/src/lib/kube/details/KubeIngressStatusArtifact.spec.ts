import '@testing-library/jest-dom/vitest';
import { describe, test, expect } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import KubeIngressStatusArtifact from './KubeIngressStatusArtifact.svelte';
import type { V1IngressStatus } from '@kubernetes/client-node';

const validIngressStatus: V1IngressStatus = {
  loadBalancer: {
    ingress: [{ ip: '192.168.1.1' }, { hostname: 'example.com' }],
  },
};

describe('KubeIngressStatusArtifact', () => {
  test('renders load balancer ingress information correctly', async () => {
    render(KubeIngressStatusArtifact, { artifact: validIngressStatus });

    // Check if the Title "Status" is rendered
    expect(screen.getByText('Status')).toBeInTheDocument();

    // Check if the Cell "Load Balancer" is rendered
    expect(screen.getByText('Load Balancer')).toBeInTheDocument();

    // Verify that the ingress IP and hostname are rendered
    expect(screen.getByText('192.168.1.1')).toBeInTheDocument();
    expect(screen.getByText('example.com')).toBeInTheDocument();
  });

  test('does not render without loadBalancer.ingress', async () => {
    const invalidIngressStatus = {
      loadBalancer: {
        // Missing ingress array
      },
    };
    render(KubeIngressStatusArtifact, { artifact: invalidIngressStatus });

    // Attempt to find elements that should not be rendered
    const statusElement = screen.queryByText('Status');
    expect(statusElement).toBeNull();

    const loadBalancerElement = screen.queryByText('Load Balancer');
    expect(loadBalancerElement).toBeNull();
  });
});
