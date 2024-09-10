---
sidebar_position: 20
title: GPU container access
description: GPU passthrough utilization within Windows, macOS and Linux
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# GPU container access

Leveraging GPU capabilities within a Podman container provides a powerful and efficient method for running GPU-accelerated workloads. Below are instructions on how to get started setting up your OS to utilize the GPU.

<Tabs>
   <TabItem value="win" label="Windows" className="markdown">

#### Prerequisites

- NVIDIA Graphics Card (Pascal or later)
- WSL2 (Hyper-V is not supported)

#### Procedure

1. The [most up-to-date NVIDIA GPU Driver](https://www.nvidia.com/Download/index.aspx) will support WSL 2. You are not required to download anything else on your host machine for your NVIDIA card.

2. [Verify that WSL2 was installed when installing Podman Desktop.](/docs/installation/windows-install)

3. [Create your Podman Machine.](/docs/podman/creating-a-podman-machine)

4. Install NVIDIA Container Toolkit onto the Podman Machine:

Podman Machine requires the NVIDIA Container Toolkit to be installed.

This can be installed by following the [official NVIDIA guide](https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/latest/install-guide.html#installing-with-yum-or-dnf) or running the steps below:

SSH into the Podman Machine:

```sh
$ podman machine ssh
```

Run the following commands **on the Podman Machine, not the host system**:

```sh
$ curl -s -L https://nvidia.github.io/libnvidia-container/stable/rpm/nvidia-container-toolkit.repo | \
 tee /etc/yum.repos.d/nvidia-container-toolkit.repo && \
 yum install -y nvidia-container-toolkit && \
 nvidia-ctk cdi generate --output=/etc/cdi/nvidia.yaml && \
 nvidia-ctk cdi list
```

:::info

A configuration change might occur when you create or remove Multi-Instance GPU (MIG) devices, or upgrade the Compute Unified Device Architecture (CUDA) driver. In such cases, you must generate a new Container Device Interface (CDI) specification.

:::

#### Verification

To verify that containers created can access the GPU, you can use `nvidia-smi` from within a container with NVIDIA drivers installed.

Run the following official NVIDIA container on your host machine:

```sh
$ podman run --rm --device nvidia.com/gpu=all nvidia/cuda:11.0.3-base-ubuntu20.04 nvidia-smi
```

Example output:

```sh
PS C:\Users\admin>  podman run --rm --device nvidia.com/gpu=all nvidia/cuda:11.0.3-base-ubuntu20.04 nvidia-smi
Fri Aug 16 18:58:14 2024
+---------------------------------------------------------------------------------------+
| NVIDIA-SMI 545.36                 Driver Version: 546.33       CUDA Version: 12.3     |
|-----------------------------------------+----------------------+----------------------+
| GPU  Name                 Persistence-M | Bus-Id        Disp.A | Volatile Uncorr. ECC |
| Fan  Temp   Perf          Pwr:Usage/Cap |         Memory-Usage | GPU-Util  Compute M. |
|                                         |                      |               MIG M. |
|=========================================+======================+======================|
|   0  NVIDIA GeForce RTX 3060        On  | 00000000:07:00.0  On |                  N/A |
|  0%   34C    P8              20W / 170W |    886MiB / 12288MiB |      1%      Default |
|                                         |                      |                  N/A |
+-----------------------------------------+----------------------+----------------------+

+---------------------------------------------------------------------------------------+
| Processes:                                                                            |
|  GPU   GI   CI        PID   Type   Process name                            GPU Memory |
|        ID   ID                                                             Usage      |
|=======================================================================================|
|    0   N/A  N/A        33      G   /Xwayland                                 N/A      |
+---------------------------------------------------------------------------------------+
```

#### Troubleshooting

#### Version mismatch

You might encounter the following error inside the containers:

```
# nvidia-smi
Failed to initialize NVML: N/A
```

This problem is related to a mismatch between the Container Device Interface (CDI) and the installed version.

To fix this problem, generate a new CDI specification by running the following inside the Podman machine:

```
nvidia-ctk cdi generate --output=/etc/cdi/nvidia.yaml
```

:::info

You might need to restart your Podman machine.

:::

#### Additional resources

- [NVIDIA Container Toolkit Installation](https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/latest/install-guide.html#installing-with-yum-or-dnf)

</TabItem>
   <TabItem value="macOS" label="macOS (Silicon)" className="markdown">

#### Prerequisites

- macOS Silicon (M1 or later)

#### Procedure

**Important to note** that using the "Metal" GPU on macOS utilizes specialized software to achieve this. Specifically a **virtualized GPU** from within the Podman Machine that provides translation support from [Vulkan](https://www.vulkan.org/) and [MoltenVK](https://github.com/KhronosGroup/MoltenVK) calls to MSL (Metal Shading Language), Apples GPU.

1. Create a Podman Machine that uses `libkrun`:

![libkrun](img/libkrun.png)

#### Verification

Using the GPU functionality requires a specialized Containerfile containing a [patched MESA driver](https://copr.fedorainfracloud.org/coprs/slp/mesa-krunkit/).

1. Create the following Containerfile:

```Dockerfile
FROM fedora:40
USER 0

# Install the patched mesa-krunkit drivers
RUN dnf -y install \
    dnf-plugins-core \
    dnf -y copr enable slp/mesa-krunkit && \
    dnf -y install mesa-vulkan-drivers vulkan-loader-devel vulkan-headers vulkan-tools vulkan-loader && \
    dnf clean all
```

2. Build the image:

![build_libkrun_image](img/build_image.png)

3. Verify you can see the GPU by running a test container:

```sh
$  podman run --rm -it --device /dev/dri --name gpu-info quay.io/slopezpa/fedora-vgpu vulkaninfo | grep "GPU"
```

Example output:

```sh
$  podman run --rm -it --device /dev/dri --name gpu-info quay.io/slopezpa/fedora-vgpu vulkaninfo | grep "GPU"
		GPU id = 0 (Virtio-GPU Venus (Apple M1 Pro))
		GPU id = 1 (llvmpipe (LLVM 17.0.6, 128 bits))
GPU0:
	deviceType        = PHYSICAL_DEVICE_TYPE_INTEGRATED_GPU
	deviceName        = Virtio-GPU Venus (Apple M1 Pro)
GPU1:
```

#### Additional resources

Important note that the virtualized GPU (Virtio-GPU Venus (Apple M1 Pro)) only supports vulkan compute shaders, not rendering / draw. For more information on the available GPU features, see `vulkaninfo` from within the container.

- [Enabling containers to access the GPU on macOS](https://sinrega.org/2024-03-06-enabling-containers-gpu-macos/)
- [libkrun](https://github.com/containers/libkrun)

</TabItem>
   <TabItem value="linux" label="Linux" className="markdown">

#### Prerequisites

- NVIDIA Graphics Card (Pascal or later)

#### Procedure

1. Install the latest NVIDIA GPU Driver for your OS.
2. Follow the instructions on [installing the NVIDIA Container Toolkit](https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/latest/install-guide.html) in relation to your Linux distribution.
3. Generate the CDI Specification file for Podman:

This file is saved either to /etc/cdi or /var/run/cdi on your Linux distribution and is used for Podman to detect your GPU(s).

Generate the CDI file:

```sh
$ nvidia-ctk cdi generate --output=/etc/cdi/nvidia.yaml
```

Check the list of generated devices:

```sh
$ nvidia-ctk cdi list
```

More information as well as troubleshooting tips can be found [on the official NVIDIA CDI guide](https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/latest/cdi-support.html).

#### Verification

To verify that containers created can access the GPU, you can use `nvidia-smi` from within a container with NVIDIA drivers installed.

Run the following official NVIDIA container on your host machine:

```sh
$ podman run --rm --device nvidia.com/gpu=all nvidia/cuda:11.0.3-base-ubuntu20.04 nvidia-smi
```

#### Additional resources

- [NVIDIA CDI guide](https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/latest/cdi-support.html)
- [NVIDIA Container Toolkit installation](https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/latest/install-guide.html#installing-with-yum-or-dnf)

</TabItem>
</Tabs>
