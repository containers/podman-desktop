import '@testing-library/jest-dom/vitest';
import { test, expect } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import KubeIngressArtifact from './KubeIngressArtifact.svelte';
import type { V1IngressSpec } from '@kubernetes/client-node';

const fakeIngress: V1IngressSpec = {
  rules: [
    {
      host: 'example.com',
      http: {
        paths: [
          {
            path: '/api',
            pathType: 'Prefix',
            backend: {
              service: {
                name: 'api-service',
                port: {
                  number: 8080,
                },
              },
            },
          },
        ],
      },
    },
  ],
  tls: [
    {
      hosts: ['example.com'],
      secretName: 'example-tls',
    },
  ],
};

test('Ingress artifact renders with correct values', async () => {
  render(KubeIngressArtifact, { artifact: fakeIngress });

  expect(screen.getByText(/Path: \/api/)).toBeInTheDocument();
  expect(screen.getByText(/https:\/\/example\.com\/api/)).toBeInTheDocument();
  expect(screen.getByText(/api-service:8080/)).toBeInTheDocument();
});
