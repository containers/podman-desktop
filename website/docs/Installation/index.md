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

[![](https://mermaid.ink/img/pako:eNqNVG1vmzAQ_iuWpyiblFUESkL5uERrpSZd10yTNvHF4INYAV9kjjQsyn-fIaUJ096-wPnueZ570dkHnqAEHvLB4BBpxpRWFLLWZGyYY7aAHeTDkA0lxFU2HL1EaA0FNO5YlND3fhVGiTiHcvgqZENbowph6hnmaBremyD2k3TSUc-IL7CnMypJkgtICQlq2ZdJg7H0LjAEhlQPIqfuOE1_J_MBjQRzRjqOcwFLUdNHUai8boJLeyrBGEHDE-LY_OznOBhEmlQBudLQWJQDWwGR0hmrtqzGyjDQO2VQF6CJPStas0eUhdBsDuWGcBtpS2jAD0DPaDaWekoSskeD-zrSszViCScxK0WVyFkhkrXNacWzNvULoVXuTk8g2Z0g9mkLerVWKbEFJiLvwgs7885-EKR2wN6itm5d7d_1s9qZkbB5zF_zzTHZgOkz76sYjAaCkklVklFxRQpfKfdKy85e2gXcWPify18JLWPcd4BzwJb9j2aXKjH4v-BvXeVN46nK-i0ZyNpOoOw3zu6q-NfaP1ei7ny3ii4Qt4iZXZbZ62SfTrJ1r4iXXDUf8QJMIZS097W9WRFvb1zEQ2vahd5E3O6jxYmKcFXrhIdkKhjxaisFwVyJzIiCh6nIS-sFqQjN8vQAtO_AiG-F5uGB73n43vOuvKnv-r4fXE_Hk2DEax56N9dXzk0w9a-DwA3Grn8c8R-IVnR85UxvfMcNJt7Uc1x3MmnVvrfBpozjT6SPZ-E?type=png)](https://mermaid.live/edit#pako:eNqNVG1vmzAQ_iuWpyiblFUESkL5uERrpSZd10yTNvHF4INYAV9kjjQsyn-fIaUJ096-wPnueZ570dkHnqAEHvLB4BBpxpRWFLLWZGyYY7aAHeTDkA0lxFU2HL1EaA0FNO5YlND3fhVGiTiHcvgqZENbowph6hnmaBremyD2k3TSUc-IL7CnMypJkgtICQlq2ZdJg7H0LjAEhlQPIqfuOE1_J_MBjQRzRjqOcwFLUdNHUai8boJLeyrBGEHDE-LY_OznOBhEmlQBudLQWJQDWwGR0hmrtqzGyjDQO2VQF6CJPStas0eUhdBsDuWGcBtpS2jAD0DPaDaWekoSskeD-zrSszViCScxK0WVyFkhkrXNacWzNvULoVXuTk8g2Z0g9mkLerVWKbEFJiLvwgs7885-EKR2wN6itm5d7d_1s9qZkbB5zF_zzTHZgOkz76sYjAaCkklVklFxRQpfKfdKy85e2gXcWPify18JLWPcd4BzwJb9j2aXKjH4v-BvXeVN46nK-i0ZyNpOoOw3zu6q-NfaP1ei7ny3ii4Qt4iZXZbZ62SfTrJ1r4iXXDUf8QJMIZS097W9WRFvb1zEQ2vahd5E3O6jxYmKcFXrhIdkKhjxaisFwVyJzIiCh6nIS-sFqQjN8vQAtO_AiG-F5uGB73n43vOuvKnv-r4fXE_Hk2DEax56N9dXzk0w9a-DwA3Grn8c8R-IVnR85UxvfMcNJt7Uc1x3MmnVvrfBpozjT6SPZ-E)

<!--
https://mermaid.live/edit#pako:eNqNVG1vmzAQ_iuWpyiblFUESkL5uERrpSZd10yTNvHF4INYAV9kjjQsyn-fIaUJ096-wPnueZ570dkHnqAEHvLB4BBpxpRWFLLWZGyYY7aAHeTDkA0lxFU2HL1EaA0FNO5YlND3fhVGiTiHcvgqZENbowph6hnmaBremyD2k3TSUc-IL7CnMypJkgtICQlq2ZdJg7H0LjAEhlQPIqfuOE1_J_MBjQRzRjqOcwFLUdNHUai8boJLeyrBGEHDE-LY_OznOBhEmlQBudLQWJQDWwGR0hmrtqzGyjDQO2VQF6CJPStas0eUhdBsDuWGcBtpS2jAD0DPaDaWekoSskeD-zrSszViCScxK0WVyFkhkrXNacWzNvULoVXuTk8g2Z0g9mkLerVWKbEFJiLvwgs7885-EKR2wN6itm5d7d_1s9qZkbB5zF_zzTHZgOkz76sYjAaCkklVklFxRQpfKfdKy85e2gXcWPify18JLWPcd4BzwJb9j2aXKjH4v-BvXeVN46nK-i0ZyNpOoOw3zu6q-NfaP1ei7ny3ii4Qt4iZXZbZ62SfTrJ1r4iXXDUf8QJMIZS097W9WRFvb1zEQ2vahd5E3O6jxYmKcFXrhIdkKhjxaisFwVyJzIiCh6nIS-sFqQjN8vQAtO_AiG-F5uGB73n43vOuvKnv-r4fXE_Hk2DEax56N9dXzk0w9a-DwA3Grn8c8R-IVnR85UxvfMcNJt7Uc1x3MmnVvrfBpozjT6SPZ-E

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

title Setting up your environment with Podman Desktop
Set up Networking
    : Proxy
Choose your virtual machine engine
    : Podman
    : Red Hat OpenShift Local
    : Lima
    : Native (on Linux)
Choose your container engine
    : Podman
    : Docker
Choose your Kubernetes distribution
    : Kind
    : Minikube
    : Red Hat OpenShift Sandbox
    : OpenShift on Red Hat OpenShift Local
    : MicroShift on Red Hat OpenShift Local
    : Your Kube config
Choose your registries
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
