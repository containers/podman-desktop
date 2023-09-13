---
sidebar_position: 2
title: Installing Podman Desktop
description: You can install Podman Desktop on Windows, macOS, and Linux.
tags: [podman-desktop, installing, windows, macos, linux]
keywords: [podman desktop, containers, podman, installing, installation, windows, macos, linux]
---

# Installing Podman Desktop

You can install Podman Desktop on:

- [Windows](./installation/windows-install)
- [macOS](./installation/macos-install)
- [Linux](./installation/linux-install)

[![](https://mermaid.ink/img/pako:eNqNU99vmzAQ_lcsTxEvLOJHCITHNVorNd3aZqq0iReDD2IFbGSONizK_z5DkpJsfdgLnO_77rs7n29PM8WBxnQy2SeSECEFxmQwCbFKVazgFUorJhaHtC0s-4TgBiro3Slr4Nr7wrRgaQmN9S5koFqLiunuRpVK93GfojTI8vk5dGT8gB2OrCzLLigNZErya5k8crl_wUHQKK4oPPTcPP9I5ovSHPTIdBzngpYriV9ZJcquBx_MqQGtGVpHxqH_mc9hMkkkigpKIaG3sASyBkQhC9LWpFOtJiBfhVayAonkTeCGPCpeMUmW0GxR1Yn8Bvim9NbEHNVj8qjVrkvki9DYspJULNuYBA15xweF8-kZOLljSL7XINcbkSNZqYyVZ3hl7jaRN6YHZkT6eope7GOtpcq2oBN536agJeDIuxeS_2fGf-E1kzxVuzPhZ38vfQpippEL0_czFKJBLcZ8x0rIXZv-LfvUsu7suxV4wbhVqjATGHs9yXZXifXJSW1aga6Y4GYJhuea0OEZJzQ2pnkl24SaIRsea1GtO5nRGHULNm1rzhCWghWaVTTOWdkYL3CBSj8ct2pYLpvWTNJ4T3c0_uz7Uz8MvCAIolnoziObdjT2F7Ops4jCYBZFXuR6wcGmv5Uyou7UCReB44WRG3nefDHzB7VfA9iXcfgDiX8szQ?type=png)](https://mermaid.live/edit#pako:eNqNU99vmzAQ_lcsTxEvLOJHCITHNVorNd3aZqq0iReDD2IFbGSONizK_z5DkpJsfdgLnO_77rs7n29PM8WBxnQy2SeSECEFxmQwCbFKVazgFUorJhaHtC0s-4TgBiro3Slr4Nr7wrRgaQmN9S5koFqLiunuRpVK93GfojTI8vk5dGT8gB2OrCzLLigNZErya5k8crl_wUHQKK4oPPTcPP9I5ovSHPTIdBzngpYriV9ZJcquBx_MqQGtGVpHxqH_mc9hMkkkigpKIaG3sASyBkQhC9LWpFOtJiBfhVayAonkTeCGPCpeMUmW0GxR1Yn8Bvim9NbEHNVj8qjVrkvki9DYspJULNuYBA15xweF8-kZOLljSL7XINcbkSNZqYyVZ3hl7jaRN6YHZkT6eope7GOtpcq2oBN536agJeDIuxeS_2fGf-E1kzxVuzPhZ38vfQpippEL0_czFKJBLcZ8x0rIXZv-LfvUsu7suxV4wbhVqjATGHs9yXZXifXJSW1aga6Y4GYJhuea0OEZJzQ2pnkl24SaIRsea1GtO5nRGHULNm1rzhCWghWaVTTOWdkYL3CBSj8ct2pYLpvWTNJ4T3c0_uz7Uz8MvCAIolnoziObdjT2F7Ops4jCYBZFXuR6wcGmv5Uyou7UCReB44WRG3nefDHzB7VfA9iXcfgDiX8szQ)

<!--
https://mermaid.live/edit#pako:eNqNU99vmzAQ_lcsTxEvLOJHCITHNVorNd3aZqq0iReDD2IFbGSONizK_z5DkpJsfdgLnO_77rs7n29PM8WBxnQy2SeSECEFxmQwCbFKVazgFUorJhaHtC0s-4TgBiro3Slr4Nr7wrRgaQmN9S5koFqLiunuRpVK93GfojTI8vk5dGT8gB2OrCzLLigNZErya5k8crl_wUHQKK4oPPTcPP9I5ovSHPTIdBzngpYriV9ZJcquBx_MqQGtGVpHxqH_mc9hMkkkigpKIaG3sASyBkQhC9LWpFOtJiBfhVayAonkTeCGPCpeMUmW0GxR1Yn8Bvim9NbEHNVj8qjVrkvki9DYspJULNuYBA15xweF8-kZOLljSL7XINcbkSNZqYyVZ3hl7jaRN6YHZkT6eope7GOtpcq2oBN536agJeDIuxeS_2fGf-E1kzxVuzPhZ38vfQpippEL0_czFKJBLcZ8x0rIXZv-LfvUsu7suxV4wbhVqjATGHs9yXZXifXJSW1aga6Y4GYJhuea0OEZJzQ2pnkl24SaIRsea1GtO5nRGHULNm1rzhCWghWaVTTOWdkYL3CBSj8ct2pYLpvWTNJ4T3c0_uz7Uz8MvCAIolnoziObdjT2F7Ops4jCYBZFXuR6wcGmv5Uyou7UCReB44WRG3nefDHzB7VfA9iXcfgDiX8szQ

```mermaid
%%{
  init: {
    'logLevel': 'debug',
    'theme': 'base',
    'themeVariables': {
      'primaryColor': '#8b5cf6',
      'primaryTextColor': '#ccc',
      'secondaryColor': '#8f81d3',
      'tertiaryColor': '#d721ff',
      'secondaryBorderColor': '#000',
      'fontFamily': 'Montserrat'
    }
  }
}%%

timeline
title Setting up your environment with Podman Desktop
Networking
    : Proxy
Virtual machines
    : Podman
    : Red Hat OpenShift Local
    : Lima
Container engines
    : Podman
    : Docker
Kubernetes
    : Kind
    : Red Hat OpenShift Local
    : Red Hat OpenShift Sandbox
    : Your Kube config
Registries
    : Docker Hub
    : Red Hat Quay
    : GitHub
    : Google Container Registry
    : Your registry
``` -->

Podman Desktop requires you to install at least one container engine.

Podman Desktop does not install any container engine automatically.

Podman Desktop can use different virtual machines, such as:

- Lima
- Podman Machine

Podman Desktop can control various container engines, such as:

- Docker
- Podman

Consider installing the Podman container engine for:

- Added security
- No daemon
- Open source
- Rootless
