/**********************************************************************
 * Copyright (C) 2024 Red Hat, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * SPDX-License-Identifier: Apache-2.0
 ***********************************************************************/

export interface ContainerInteractiveParams {
  interactive?: boolean;
  attachTerminal?: boolean;
  attachVolumeName?: string;
  attachVolumePath?: string;
}

export interface KindClusterOptions {
  configFilePath?: string;
  providerType?: string;
  httpPort?: string;
  httpsPort?: string;
  useIngressController?: boolean;
  containerImage?: string;
}

export interface DeployPodOptions {
  useKubernetesServices?: boolean;
  useRestrictedSecurityContext?: boolean;
  useKubernetesIngress?: boolean;
  containerExposedPort?: string;
  isOpenShiftCluster?: boolean;
  useOpenShiftRoutes?: boolean;
}

export enum PodmanKubePlayOptions {
  SelectYamlFile = 0,
  CreateYamlFileFromScratch = 1,
  EnterYamlFilePath = 2,
}

export interface PlayFromScratch {
  podmanKubePlayOption: PodmanKubePlayOptions.CreateYamlFileFromScratch;
  jsonResourceDefinition: string;
}

export interface PlayFromYaml {
  podmanKubePlayOption: PodmanKubePlayOptions.SelectYamlFile;
  pathToYaml: string;
}

export interface PlayFromTypedYaml {
  podmanKubePlayOption: PodmanKubePlayOptions.EnterYamlFilePath;
  pathToYaml: string;
}

export type PlayYamlOptions = PlayFromScratch | PlayFromYaml | PlayFromTypedYaml;

export enum KubernetesResources {
  Nodes = 'Nodes',
  Deployments = 'Deployments',
  Services = 'Services',
  IngeressesRoutes = 'Ingresses & Routes',
  PVCs = 'Persistent Volume Claims',
  ConfigMapsSecrets = 'ConfigMaps & Secrets',
  PortForwarding = 'Port Forwarding',
  Pods = 'Pods',
  Cronjobs = 'CronJobs',
  Jobs = 'Jobs',
}

export const KubernetesResourceAttributes: Record<KubernetesResources, string[]> = {
  [KubernetesResources.Nodes]: ['Status', 'Name', 'Roles', 'Version', 'OS', 'Kernel', 'Age'],
  [KubernetesResources.Deployments]: ['Selected', 'Status', 'Name', 'Conditions', 'Pods', 'Age', 'Actions'],
  [KubernetesResources.Services]: ['Selected', 'Status', 'Name', 'Type', 'Cluster IP', 'Ports', 'Age', 'Actions'],
  [KubernetesResources.IngeressesRoutes]: ['Selected', 'Status', 'Name', 'Host/Path', 'Backend', 'Age', 'Actions'],
  [KubernetesResources.PVCs]: ['Selected', 'Status', 'Name', 'Environment', 'Age', 'Size', 'Actions'],
  [KubernetesResources.ConfigMapsSecrets]: ['Selected', 'Status', 'Name', 'Type', 'Keys', 'Age', 'Actions'],
  [KubernetesResources.PortForwarding]: ['Status', 'Name', 'Type', 'Local Port', 'Remote Port', 'Actions'],
  [KubernetesResources.Pods]: ['Selected', 'Status', 'Name', 'Containers', 'Age', 'Actions'],
  [KubernetesResources.Cronjobs]: [
    'Selected',
    'Status',
    'Name',
    'Schedule',
    'Last scheduled',
    'Suspended',
    'Active',
    'Age',
    'Actions',
  ],
  [KubernetesResources.Jobs]: ['Selected', 'Status', 'Name', 'Conditions', 'Completions', 'Age', 'Actions'],
};

export enum PodmanVirtualizationProviders {
  WSL = 'Wsl',
  HyperV = 'Hyperv',
  AppleHV = 'Apple HyperVisor',
  LibKrun = 'default GPU enabled (LibKrun)',
  Qemu = 'Qemu',
  Native = '', //not a real provider, used for 'Connection Type' check in Resources page of Linux machines
}

/**
 * Maps each virtualization provider enum value to an array of possible UI values.
 * This allows handling version differences where the same provider may appear with different names.
 * For example, HyperV can appear as 'Hyperv' or 'Hyper-V' in different versions.
 */
export const PodmanVirtualizationProviderVariants: Record<PodmanVirtualizationProviders, string[]> = {
  [PodmanVirtualizationProviders.WSL]: ['Wsl', 'WSL'],
  [PodmanVirtualizationProviders.HyperV]: ['Hyperv', 'Hyper-V', 'HyperV'],
  [PodmanVirtualizationProviders.AppleHV]: ['Apple HyperVisor', 'Apple Hypervisor', 'AppleHV'],
  [PodmanVirtualizationProviders.LibKrun]: ['default GPU enabled (LibKrun)', 'LibKrun', 'libkrun'],
  [PodmanVirtualizationProviders.Qemu]: ['Qemu', 'QEMU', 'qemu'],
  [PodmanVirtualizationProviders.Native]: [''],
};

/**
 * Checks if a given value matches any of the possible variants for a provider enum value.
 * @param provider - The provider enum value to check against
 * @param value - The value to check (case-insensitive comparison)
 * @returns True if the value matches any variant of the provider
 */
export function matchesProviderVariant(provider: PodmanVirtualizationProviders, value: string): boolean {
  const variants = PodmanVirtualizationProviderVariants[provider];
  const normalizedValue = value.toLowerCase().trim();
  return variants.some(variant => variant.toLowerCase().trim() === normalizedValue);
}

/**
 * Gets the first matching provider enum value for a given UI value, or undefined if no match.
 * @param value - The UI value to match (case-insensitive comparison)
 * @returns The matching provider enum value, or undefined if no match
 */
export function getProviderFromVariant(value: string): PodmanVirtualizationProviders | undefined {
  const normalizedValue = value.toLowerCase().trim();
  for (const [provider, variants] of Object.entries(PodmanVirtualizationProviderVariants)) {
    if (variants.some(variant => variant.toLowerCase().trim() === normalizedValue)) {
      return provider as PodmanVirtualizationProviders;
    }
  }
  return undefined;
}

export enum PodmanMachinePrivileges {
  Rootful = 'rootful',
  Rootless = 'rootless',
}

export enum ProxyTypes {
  Disabled = 'Disabled',
  Manual = 'Manual',
  System = 'System',
}

export enum ProxyLabel {
  PROXY_CONFIGURATION = 'Proxy configuration',
  HTTP = 'Web Proxy (HTTP)',
  HTTPS = 'Secure Web Proxy (HTTPS)',
  NO_PROXY = 'Bypass proxy settings for these hosts and domains',
  MANAGED = 'Managed by your organization',
}

export enum ProxyElementId {
  TOGGLE_PROXY = 'toggle-proxy',
  HTTP_PROXY = 'httpProxy',
  HTTPS_PROXY = 'httpsProxy',
  NO_PROXY = 'noProxy',
}

export interface ProductHelpMenuItem {
  title: string;
  tooltip?: string;
  icon: string;
  link?: string;
  command?: string;
}

export interface ProductConfiguration {
  helpMenu: { items: ProductHelpMenuItem[] };
}

export interface HelpMenuAction {
  kind: HelpMenuActionKind;
  parameter: string;
}

export interface HelpMenuItem {
  title: string;
  tooltip?: string;
  icon: string;
  enabled: boolean;
  action?: HelpMenuAction;
}

export interface HelpMenuWindow extends Window {
  helpMenuGetItems: () => Promise<HelpMenuItem[]>;
}

export enum HelpMenuActionKind {
  LINK = 0,
  COMMAND = 1,
}
