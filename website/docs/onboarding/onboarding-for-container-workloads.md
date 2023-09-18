---
sidebar_position: 2
title: Onboarding for containers
description: To run container workloads with Podman Desktop, set up at least one container engine.
tags: [podman-desktop, onboarding]
keywords: [podman desktop, containers, podman, onboarding]
---

# Onboarding for container workloads

To run container workloads, set up at least one container engine.

Podman Desktop does not automatically set up container engine resources that you might not need.

#### Procedure

<!-- [![](https://mermaid.ink/img/pako:eNptU8GOmzAQ_RXLVcSFRgTCQjjuRnvKdqumaqWKi4OHxAr2INtkQ6P8ew0pCVnlAjPz3rx5hvGJFsiBZnQyOeWKEKGEzUgfEuJVuF3BASovIx6HTbP1_P-I3YGErrxhBu6rv5gWbFOB8a5CDqq1kEy3L1ih7vq-pJu4KJ-G1hvjJxztjVUUxYhioEDF72XKdMajEceCtuKOwpNwVpaPZJ5Rc9A3ZhAEI1qJyr4yKaq2A99cZkBrZr0L49y93OM8meTKCgmVUNBFtgLyrjbINBdqS0rUxM2zzMGafKDeV8i4yVWu1lBBYUmLzQ24iGfkB6ITMubWa8ZQ2VQPkBeUNRoY0u94N4eNfIDa9navRMnUkC2x2IP-bHCHxhKswX2B7limNRbk0PJbKI4fVx-SFe_rIVkJ1RzHNhSBIxSNFegidRAalQRlB_43N-AAD053cdmJ70beV25tPtcuJyBLMHuLdTeb-lSClkxwt-z9Wua0X9ecZi5027DPqfuZjscai-tWFTSzugGfNjVnFpaCbTWTNCtZZVwVuLCo3y63p79EPq2ZotmJHmn2NYqmURKHcRyn82T2lPq0pVm0mE-DRZrE8zQN01kYn336F9GJzqZBsoiDMA2TNJ5HDuvV_vRgZ-P8D4qJKgA?type=png)](https://mermaid.live/edit#pako:eNptU8GOmzAQ_RXLVcSFRgTCQjjuRnvKdqumaqWKi4OHxAr2INtkQ6P8ew0pCVnlAjPz3rx5hvGJFsiBZnQyOeWKEKGEzUgfEuJVuF3BASovIx6HTbP1_P-I3YGErrxhBu6rv5gWbFOB8a5CDqq1kEy3L1ih7vq-pJu4KJ-G1hvjJxztjVUUxYhioEDF72XKdMajEceCtuKOwpNwVpaPZJ5Rc9A3ZhAEI1qJyr4yKaq2A99cZkBrZr0L49y93OM8meTKCgmVUNBFtgLyrjbINBdqS0rUxM2zzMGafKDeV8i4yVWu1lBBYUmLzQ24iGfkB6ITMubWa8ZQ2VQPkBeUNRoY0u94N4eNfIDa9navRMnUkC2x2IP-bHCHxhKswX2B7limNRbk0PJbKI4fVx-SFe_rIVkJ1RzHNhSBIxSNFegidRAalQRlB_43N-AAD053cdmJ70beV25tPtcuJyBLMHuLdTeb-lSClkxwt-z9Wua0X9ecZi5027DPqfuZjscai-tWFTSzugGfNjVnFpaCbTWTNCtZZVwVuLCo3y63p79EPq2ZotmJHmn2NYqmURKHcRyn82T2lPq0pVm0mE-DRZrE8zQN01kYn336F9GJzqZBsoiDMA2TNJ5HDuvV_vRgZ-P8D4qJKgA) -->

1. Select a container engine supporting your workload.

   [![](https://mermaid.ink/img/pako:eNp9kk2P0zAQhv-KZVTlEqp8NI3rI7vixEqIRRxQLm48CVZtT2Q7sKHqf8dJgLYI7cWemfeZ15Y9Z9qiBMrpZnNuLCHKqsDJEhKSaOw_wHfQCSeJhOPYJ-lvJXwDA3P5KDzcV78Ip8RRg0_-GkVpcMoINz2gRjf3vWHHqu32f1qvxGd4CVeqbdsbxEOLVt7bdCyX5Q0TwAV1h8i6yLvufzbv0ElwVzLLshusQxveC6P0NItPMfPgnAjJSlzmLS6XzaaxQRnQysIcBQ3kGTS0gQgSTwoiCo6A7eNO_DgMGK9oezLh6MgPdCeNQjb2E2Js9f7a49eTOPmI0gjb2BXqRv0Ks2aP2J7ANfYBzYAeXocaG-v_GMWQptSAM0LJOCDLVzZ0-eKG8hjGFzw1ND5A5MQY8HmyLeXBjZDScZAiwKMSvROG8k5oH6sgVUD3tE7cMngpHYSl_ExfKH9bltuyroqqqtiuzvcspRPl5WG3zQ6srnaMFSwvqktKfyJG03yb1YcqKyLM9ruiyPaL29dFnK9x-QUci-Rd?type=png)](https://mermaid.live/edit#pako:eNp9kk2P0zAQhv-KZVTlEqp8NI3rI7vixEqIRRxQLm48CVZtT2Q7sKHqf8dJgLYI7cWemfeZ15Y9Z9qiBMrpZnNuLCHKqsDJEhKSaOw_wHfQCSeJhOPYJ-lvJXwDA3P5KDzcV78Ip8RRg0_-GkVpcMoINz2gRjf3vWHHqu32f1qvxGd4CVeqbdsbxEOLVt7bdCyX5Q0TwAV1h8i6yLvufzbv0ElwVzLLshusQxveC6P0NItPMfPgnAjJSlzmLS6XzaaxQRnQysIcBQ3kGTS0gQgSTwoiCo6A7eNO_DgMGK9oezLh6MgPdCeNQjb2E2Js9f7a49eTOPmI0gjb2BXqRv0Ks2aP2J7ANfYBzYAeXocaG-v_GMWQptSAM0LJOCDLVzZ0-eKG8hjGFzw1ND5A5MQY8HmyLeXBjZDScZAiwKMSvROG8k5oH6sgVUD3tE7cMngpHYSl_ExfKH9bltuyroqqqtiuzvcspRPl5WG3zQ6srnaMFSwvqktKfyJG03yb1YcqKyLM9ruiyPaL29dFnK9x-QUci-Rd)

   | Workload            | Podman | Docker |
   | :------------------ | :----: | :----: |
   | Rootless containers |  yes   |   no   |
   | Rootful containers  |  yes   |  yes   |
   | Compose             |  yes   |  yes   |
   | Pods                |  yes   |   no   |

   Podman supports rootless container and pods, in addition to rootful containers and Compose.

2. Select an execution environment supporting your container engine and your operating system.

   - Select a Podman execution environment:

     [![](https://mermaid.ink/img/pako:eNp1kkuP2jAUhf-KdSuUTYryMjFeTquumLYSVUeqsjH2DWM1tpHjUCjiv9cJpYDU2STH93w-flyfQDqFwGE2OzWWEG114GSShCSd265wj13CSaJwM2yT9K8TXtHgWN6IHh-r34XXYtNhn_wLitbOayP88YPrnB_nvWMbKtvFdeqN-IaHcKOklHdIj9JZ9RjTslyVd0xAH_QDouoib9v_xTw5r9DfyCzL7rDW2fBJGN0dR_M5jnr0XoTkQpzHX_ycZ7PGBm2w0xZHFToka-xQBiLIV6eMsAQPKIegXVR2r72zBm1obGNftFXuV3-J5FfcCPk6pUXxZf2Weamu4rXdaitth8PV-iyC3iOJpw0iur4fV4QUDHojtIptnxrUwNS4BniU8V5-NhCPFTkxBLc-Wgk8-AFTGHZKBPyoxdYLA7wVXR-rqHRw_vnyjqbnlMJOWOAnOAB_X5bzsqYFpZRVdb5gKRyBl8tqni1ZTSvGCpYX9JzCb-diaD7P6iXNClbljC4qyuiU9mMyx22c_wDcSNa_?type=png)](https://mermaid.live/edit#pako:eNp1kkuP2jAUhf-KdSuUTYryMjFeTquumLYSVUeqsjH2DWM1tpHjUCjiv9cJpYDU2STH93w-flyfQDqFwGE2OzWWEG114GSShCSd265wj13CSaJwM2yT9K8TXtHgWN6IHh-r34XXYtNhn_wLitbOayP88YPrnB_nvWMbKtvFdeqN-IaHcKOklHdIj9JZ9RjTslyVd0xAH_QDouoib9v_xTw5r9DfyCzL7rDW2fBJGN0dR_M5jnr0XoTkQpzHX_ycZ7PGBm2w0xZHFToka-xQBiLIV6eMsAQPKIegXVR2r72zBm1obGNftFXuV3-J5FfcCPk6pUXxZf2Weamu4rXdaitth8PV-iyC3iOJpw0iur4fV4QUDHojtIptnxrUwNS4BniU8V5-NhCPFTkxBLc-Wgk8-AFTGHZKBPyoxdYLA7wVXR-rqHRw_vnyjqbnlMJOWOAnOAB_X5bzsqYFpZRVdb5gKRyBl8tqni1ZTSvGCpYX9JzCb-diaD7P6iXNClbljC4qyuiU9mMyx22c_wDcSNa_)

     | Host operating system | Native containers | Podman machine | Lima machine |
     | :-------------------- | :---------------: | :------------: | :----------: |
     | Windows               |        no         |      yes       |      no      |
     | macOS                 |        no         |      yes       |     yes      |
     | Linux                 |        yes        |       no       |      no      |

   - Select a Docker execution environment:

     [![](https://mermaid.ink/img/pako:eNp1ksuu2jAQhl_FcoWySVEumBgvW9QVp11QtVKVjbEnHAvHRs6EQhHvXiccCkinG3s8_ze_b3Omymuggk4m59oRYpxBQcaQkMT67QoOYBNBEg2bfpukbwq-QgtDeiM7eM7-kMHIjYUu-WcUpX0wrQynz976MNR94Bummvmt9E58hyPeKaXUA9KB8k4_2zQ81-UDgxDQPCG6KvKmec_mkw8awp3MsuwBa7zDL7I19jSIL3HVQQgSkytxGaY4XCaT2qFpwRoHQ4QWyBosKCSSLL3aQSBwBNWj8Y6AO5jgXQsOa1e7n8Zp_7u7WoobvoRuh35fu1aqb-ubuIoPRGLmddzo_YKVcf3xJn6VaA5A4m1Rxprw321oSlsIrTQ6tsL4aTUdP7OmIobxrXY1jVeNnOzRr09OUYGhh5T2ey0RlkZug2ypaKTtYha0QR9err01tlhK99JRcaZHKj6W5bSsWMEY47Mqn_OUnqgoF7NptuAVm3Fe8Lxgl5T-8T6a5tOsWrCs4GzG8oxzNh_dfo3icIzLX_az3Nw?type=png)](https://mermaid.live/edit#pako:eNp1ksuu2jAQhl_FcoWySVEumBgvW9QVp11QtVKVjbEnHAvHRs6EQhHvXiccCkinG3s8_ze_b3Omymuggk4m59oRYpxBQcaQkMT67QoOYBNBEg2bfpukbwq-QgtDeiM7eM7-kMHIjYUu-WcUpX0wrQynz976MNR94Bummvmt9E58hyPeKaXUA9KB8k4_2zQ81-UDgxDQPCG6KvKmec_mkw8awp3MsuwBa7zDL7I19jSIL3HVQQgSkytxGaY4XCaT2qFpwRoHQ4QWyBosKCSSLL3aQSBwBNWj8Y6AO5jgXQsOa1e7n8Zp_7u7WoobvoRuh35fu1aqb-ubuIoPRGLmddzo_YKVcf3xJn6VaA5A4m1Rxprw321oSlsIrTQ6tsL4aTUdP7OmIobxrXY1jVeNnOzRr09OUYGhh5T2ey0RlkZug2ypaKTtYha0QR9err01tlhK99JRcaZHKj6W5bSsWMEY47Mqn_OUnqgoF7NptuAVm3Fe8Lxgl5T-8T6a5tOsWrCs4GzG8oxzNh_dfo3icIzLX_az3Nw)

     | Host operating system | Native containers | Lima machine | Docker Desktop |
     | :-------------------- | :---------------: | :----------: | :------------: |
     | Windows               |        no         |      no      |      yes       |
     | macOS                 |        no         |     yes      |      yes       |
     | Linux                 |        yes        |      no      |      yes       |

3. Setup your container engine.

   Podman Desktop assists you to set up Podman and Podman machines on Windows and macOS, and consumes your native Podman, Lima or Docker setup.

   - [Installing Podman on Windows](/docs/onboarding/).
   - [Installing Podman with OpenShift Local on Windows](/docs/onboarding/installing-podman-with-openshift-local-on-windows).
   - [Creating a Podman machine with Podman Desktop](/docs/onboarding/creating-a-podman-machine-with-podman-desktop).
   - [Creating a Lima machine](/docs/onboarding/creating-a-lima-instance-with-podman-desktop).
   - [Installing Podman on Linux](https://podman.io/docs/installation#installing-on-linux).
