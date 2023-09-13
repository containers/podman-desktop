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

[![](https://mermaid.ink/img/pako:eNqNU99vmzAQ_lcsTxEvLOJHKITHNVorNdnaZqq0iReDD2IFbGSONizK_z5DQpNsfdgLnO_77rvz-W5PM8WBxnQy2SeSECEFxmQwCbFKVSzhFUorJhaHtC0s-4TgBiro3Slr4Nr7wrRgaQmN9S5koFqLiunuVpVK93GfojTI8psx9Mz4ATs8s7Isu6A0kCnJr2XyyOX-BQdBo7ii8NBz8_wjmS9Kc9BnpuM4F7RcSfzKKlF2Pbgypwa0ZmgdGYf-Zz6HySSRKCoohYTewhLIGhCFLEhbk061moB8FVrJCiSSN4Eb8qh4xSRZQLNFVSfyG-Cb0lsTc1SPyaNWuy6RL0Jjy0pSsWxjEjTkHR8UxtMzcHLPkHyvQa43IkeyVBkrR3hpepvIW3MHZkT6eope7GOthcq2oBP50KagJeCZ9yAkH-2VmZWtYfxnBf_CayZ5qnYj4Wffpz4lMa-TC9OHZyhEg1qc8x8rI_dt-rfsU8u60Xcn8IJxp1RhXuR895Nsd5VYn5zUphXoiglulmIY34QOY53Q2JhmarYJNY9ueKxFte5kRmPULdi0rTlDWAhWaFbROGdlY7zABSq9Om7ZsGw2rZmk8Z7uaPzZ96d-GHhBEESz0L2JbNrR2J_Pps48CoNZFHmR6wUHm_5Wyoi6UyecB44XRm7keTfzmT-o_RrAvozDH1yWMaU?type=png)](https://mermaid.live/edit#pako:eNqNU99vmzAQ_lcsTxEvLOJHKITHNVorNdnaZqq0iReDD2IFbGSONizK_z5DQpNsfdgLnO_77rvz-W5PM8WBxnQy2SeSECEFxmQwCbFKVSzhFUorJhaHtC0s-4TgBiro3Slr4Nr7wrRgaQmN9S5koFqLiunuVpVK93GfojTI8psx9Mz4ATs8s7Isu6A0kCnJr2XyyOX-BQdBo7ii8NBz8_wjmS9Kc9BnpuM4F7RcSfzKKlF2Pbgypwa0ZmgdGYf-Zz6HySSRKCoohYTewhLIGhCFLEhbk061moB8FVrJCiSSN4Eb8qh4xSRZQLNFVSfyG-Cb0lsTc1SPyaNWuy6RL0Jjy0pSsWxjEjTkHR8UxtMzcHLPkHyvQa43IkeyVBkrR3hpepvIW3MHZkT6eope7GOthcq2oBP50KagJeCZ9yAkH-2VmZWtYfxnBf_CayZ5qnYj4Wffpz4lMa-TC9OHZyhEg1qc8x8rI_dt-rfsU8u60Xcn8IJxp1RhXuR895Nsd5VYn5zUphXoiglulmIY34QOY53Q2JhmarYJNY9ueKxFte5kRmPULdi0rTlDWAhWaFbROGdlY7zABSq9Om7ZsGw2rZmk8Z7uaPzZ96d-GHhBEESz0L2JbNrR2J_Pps48CoNZFHmR6wUHm_5Wyoi6UyecB44XRm7keTfzmT-o_RrAvozDH1yWMaU)

<!--
https://mermaid.live/edit#pako:eNqNU99vmzAQ_lcsTxEvLOJHKITHNVorNdnaZqq0iReDD2IFbGSONizK_z5DQpNsfdgLnO_77rvz-W5PM8WBxnQy2SeSECEFxmQwCbFKVSzhFUorJhaHtC0s-4TgBiro3Slr4Nr7wrRgaQmN9S5koFqLiunuVpVK93GfojTI8psx9Mz4ATs8s7Isu6A0kCnJr2XyyOX-BQdBo7ii8NBz8_wjmS9Kc9BnpuM4F7RcSfzKKlF2Pbgypwa0ZmgdGYf-Zz6HySSRKCoohYTewhLIGhCFLEhbk061moB8FVrJCiSSN4Eb8qh4xSRZQLNFVSfyG-Cb0lsTc1SPyaNWuy6RL0Jjy0pSsWxjEjTkHR8UxtMzcHLPkHyvQa43IkeyVBkrR3hpepvIW3MHZkT6eope7GOthcq2oBP50KagJeCZ9yAkH-2VmZWtYfxnBf_CayZ5qnYj4Wffpz4lMa-TC9OHZyhEg1qc8x8rI_dt-rfsU8u60Xcn8IJxp1RhXuR895Nsd5VYn5zUphXoiglulmIY34QOY53Q2JhmarYJNY9ueKxFte5kRmPULdi0rTlDWAhWaFbROGdlY7zABSq9Om7ZsGw2rZmk8Z7uaPzZ96d-GHhBEESz0L2JbNrR2J_Pps48CoNZFHmR6wUHm_5Wyoi6UyecB44XRm7keTfzmT-o_RrAvozDH1yWMaU

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
    : Minikube
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
