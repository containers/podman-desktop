/**********************************************************************
 * Copyright (C) 2022-2026 Red Hat, Inc.
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

export const ROOTFUL_MACHINE_INIT_SUPPORTED_KEY = 'podman.isRootfulMachineInitSupported';
export const USER_MODE_NETWORKING_SUPPORTED_KEY = 'podman.isUserModeNetworkingSupported';
export const START_NOW_MACHINE_INIT_SUPPORTED_KEY = 'podman.isStartNowAtMachineInitSupported';
export const CLEANUP_REQUIRED_MACHINE_KEY = 'podman.needPodmanMachineCleanup';
export const PODMAN_MACHINE_CPU_SUPPORTED_KEY = 'podman.podmanMachineCpuSupported';
export const PODMAN_MACHINE_MEMORY_SUPPORTED_KEY = 'podman.podmanMachineMemorySupported';
export const PODMAN_MACHINE_DISK_SUPPORTED_KEY = 'podman.podmanMachineDiskSupported';
export const PODMAN_PROVIDER_LIBKRUN_SUPPORTED_KEY = 'podman.isLibkrunSupported';
export const CREATE_WSL_MACHINE_OPTION_SELECTED_KEY = 'podman.isCreateWSLOptionSelected';
export const WSL_HYPERV_ENABLED_KEY = 'podman.wslHypervEnabled';
export const PODMAN_DOCKER_COMPAT_ENABLE_KEY = 'podman.podmanDockerCompatibilityEnabled';
export const PODMAN_MACHINE_EDIT_CPU = 'podman.podmanMachineEditCPUSupported';
export const PODMAN_MACHINE_EDIT_MEMORY = 'podman.podmanMachineEditMemorySupported';
export const PODMAN_MACHINE_EDIT_DISK_SIZE = 'podman.podmanMachineEditDiskSizeSupported';
export const PODMAN_MACHINE_EDIT_ROOTFUL = 'podman.podmanMachineEditRootfulSupported';
export const PODMAN_IMPORT_NATIVE_CA_SUPPORTED_KEY = 'podman.isImportNativeCASupported';
export const PODMAN_EDIT_IMPORT_NATIVE_CA = 'podman.podmanMachineEditImportNativeCASupported';

/**
 * Command ID to uninstall a version of podman installed with non-msi installer
 */
export const UNINSTALL_LEGACY_INSTALLER_COMMAND = 'podman.uninstallLegacyPodmanInstaller';

export const HYPERV_PREP_COMMAND = 'podman.hypervPrep';
export const HYPERV_PREP_SUPPORTED_KEY = 'podman.hypervPrepSupported';
export const HYPERV_PREP_NOT_APPLIED_KEY = 'podman.hypervPrepNotApplied';
export const HYPERV_PREP_RELOGIN_MESSAGE =
  'Sign out of Windows and sign back in (or restart your computer) for Hyper-V Administrators group membership to take effect.';
