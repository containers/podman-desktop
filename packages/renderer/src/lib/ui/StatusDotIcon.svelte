<script lang="ts">
import { capitalize } from './Util';

interface Props {
  status: string;
  size?: string;
  class?: string;
  decorative?: boolean;
}

let { status, size = '12', class: className = '', decorative = false }: Props = $props();

const statusCssVars: Record<string, string> = {
  running: 'var(--pd-status-running)',
  terminated: 'var(--pd-status-terminated)',
  waiting: 'var(--pd-status-waiting)',
  stopped: 'var(--pd-status-stopped)',
  paused: 'var(--pd-status-paused)',
  exited: 'var(--pd-status-exited)',
  dead: 'var(--pd-status-dead)',
  created: 'var(--pd-status-created)',
  degraded: 'var(--pd-status-degraded)',
  downloadable: 'var(--pd-notification-dot)',
  unknown: 'var(--pd-status-unknown)',
  starting: 'var(--pd-status-starting)',
  'not-running': 'var(--pd-status-not-running)',
  connected: 'var(--pd-status-connected)',
  disconnected: 'var(--pd-status-disconnected)',
  updated: 'var(--pd-status-updated)',
  ready: 'var(--pd-status-ready)',
};

let fillColor = $derived(statusCssVars[status] ?? 'var(--pd-status-unknown)');
let label = $derived(capitalize(status));
let role = $derived(decorative ? undefined : 'img');
let ariaLabel = $derived(decorative ? undefined : label);
let ariaHidden = $derived(decorative ? true : undefined);
</script>

{#if status === 'running'}
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 12 12" {role} aria-label={ariaLabel} aria-hidden={ariaHidden} class={className} data-testid="status-dot-icon">
    <path fill={fillColor} d="M6 0a6 6 0 1 1 0 12A6 6 0 0 1 6 0m.767 5.53c-1.365-2.22-4.763-1.48-5.08 1.106a.901.901 0 0 0 1.787.218c.11-.895 1.287-1.152 1.76-.383 1.364 2.22 4.762 1.479 5.08-1.107a.901.901 0 0 0-1.788-.218c-.11.895-1.287 1.151-1.76.383" />
  </svg>
{:else if status === 'terminated'}
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 12 12" {role} aria-label={ariaLabel} aria-hidden={ariaHidden} class={className} data-testid="status-dot-icon">
    <path fill={fillColor} d="M6 0a6 6 0 1 1 0 12A6 6 0 0 1 6 0m2.97 2.978a.78.78 0 0 0-1.1 0L6 4.848l-1.87-1.87a.779.779 0 0 0-1.1 1.1L4.95 6 3.03 7.921a.779.779 0 0 0 1.1 1.1L6 7.151l1.87 1.87a.779.779 0 0 0 1.1-1.1L7.05 5.999l1.922-1.92a.78.78 0 0 0 0-1.101" />
  </svg>
{:else if status === 'waiting'}
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 12 12" {role} aria-label={ariaLabel} aria-hidden={ariaHidden} class={className} data-testid="status-dot-icon">
    <path fill={fillColor} d="M6 0a6 6 0 1 1 0 12A6 6 0 0 1 6 0m-.25 2a.75.75 0 0 0-.75.75v3.5l2.766 2.766a.884.884 0 1 0 1.25-1.25L7 5.75v-3A.75.75 0 0 0 6.25 2z" />
  </svg>
{:else if status === 'stopped'}
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 12 12" {role} aria-label={ariaLabel} aria-hidden={ariaHidden} class={className} data-testid="status-dot-icon">
    <path fill={fillColor} d="M6 0a6 6 0 1 1 0 12A6 6 0 0 1 6 0M2.75 5a.75.75 0 0 0-.75.75v.5c0 .414.336.75.75.75h6.5a.75.75 0 0 0 .75-.75v-.5A.75.75 0 0 0 9.25 5z" />
  </svg>
{:else if status === 'paused'}
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 12 12" {role} aria-label={ariaLabel} aria-hidden={ariaHidden} class={className} data-testid="status-dot-icon">
    <path fill={fillColor} d="M6 0a6 6 0 1 1 0 12A6 6 0 0 1 6 0M4.25 3a.75.75 0 0 0-.75.75v4.5c0 .414.336.75.75.75h.5a.75.75 0 0 0 .75-.75v-4.5A.75.75 0 0 0 4.75 3zm3 0a.75.75 0 0 0-.75.75v4.5c0 .414.336.75.75.75h.5a.75.75 0 0 0 .75-.75v-4.5A.75.75 0 0 0 7.75 3z" />
  </svg>
{:else if status === 'exited'}
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 12 12" {role} aria-label={ariaLabel} aria-hidden={ariaHidden} class={className} data-testid="status-dot-icon">
    <path fill={fillColor} d="M6 0a6 6 0 1 1 0 12A6 6 0 0 1 6 0m2.97 2.978a.78.78 0 0 0-1.1 0L6 4.848l-1.87-1.87a.779.779 0 0 0-1.1 1.1L4.95 6 3.03 7.921a.779.779 0 0 0 1.1 1.1L6 7.151l1.87 1.87a.779.779 0 0 0 1.1-1.1L7.05 5.999l1.922-1.92a.78.78 0 0 0 0-1.101" />
  </svg>
{:else if status === 'dead'}
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 12 12" {role} aria-label={ariaLabel} aria-hidden={ariaHidden} class={className} data-testid="status-dot-icon">
    <path fill={fillColor} d="M6 0a6 6 0 1 1 0 12A6 6 0 0 1 6 0m0 8a.97.97 0 0 0-.704.292.96.96 0 0 0-.296.703q0 .42.296.713A.97.97 0 0 0 6 10a.95.95 0 0 0 .495-.133q.228-.137.364-.365A.95.95 0 0 0 7 8.995q0-.41-.3-.703A.96.96 0 0 0 6 8m-.25-6a.75.75 0 0 0-.75.75v4c0 .414.336.75.75.75h.5A.75.75 0 0 0 7 6.75v-4A.75.75 0 0 0 6.25 2z" />
  </svg>
{:else if status === 'created'}
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 12 12" {role} aria-label={ariaLabel} aria-hidden={ariaHidden} class={className} data-testid="status-dot-icon">
    <path fill={fillColor} d="M6 0a6 6 0 1 1 0 12A6 6 0 0 1 6 0m0 4a2 2 0 1 0 0 4 2 2 0 0 0 0-4" />
  </svg>
{:else if status === 'degraded'}
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 12 12" {role} aria-label={ariaLabel} aria-hidden={ariaHidden} class={className} data-testid="status-dot-icon">
    <path fill={fillColor} d="M6 0a6 6 0 1 1 0 12A6 6 0 0 1 6 0m-.25 2a.75.75 0 0 0-.75.75v3.752l-.875-.875a.884.884 0 0 0-1.25 1.25L6 10.002l3.125-3.125a.884.884 0 0 0-1.25-1.25L7 6.502V2.75A.75.75 0 0 0 6.25 2z" />
  </svg>
{:else if status === 'downloadable'}
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 12 12" {role} aria-label={ariaLabel} aria-hidden={ariaHidden} class={className} data-testid="status-dot-icon">
    <path fill={fillColor} d="M6 0a6 6 0 1 1 0 12A6 6 0 0 1 6 0" />
  </svg>
{:else}
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 12 12" {role} aria-label={ariaLabel} aria-hidden={ariaHidden} class={className} data-testid="status-dot-icon">
    <path fill={fillColor} d="M6 0a6 6 0 1 1 0 12A6 6 0 0 1 6 0m-.25 8a.97.97 0 0 0-.704.292.95.95 0 0 0-.296.703q0 .42.296.713A.97.97 0 0 0 5.75 10a.95.95 0 0 0 .495-.133q.228-.137.364-.365a.95.95 0 0 0 .141-.507q0-.41-.3-.703A.96.96 0 0 0 5.75 8m.248-6q-.747 0-1.365.26a2.3 2.3 0 0 0-.99.782c-.248.347-.379.942-.393 1.458h1.5c.014-.255.098-.63.215-.795q.18-.252.448-.374.273-.126.576-.126.33 0 .593.13.27.13.427.366a1 1 0 0 1 .158.558q0 .286-.12.517-.119.228-.328.415C6.155 5.696 5 5.9 4.75 6.652l.001.345c0 .277.225.503.502.503h.997a.5.5 0 0 0 .5-.5c.071-.198.011-.201.156-.348q.222-.219.569-.423.392-.223.677-.508t.44-.652a2.1 2.1 0 0 0 .158-.83q0-.687-.35-1.19a2.2 2.2 0 0 0-.968-.777Q6.813 2 5.998 2" />
  </svg>
{/if}
