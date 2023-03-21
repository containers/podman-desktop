---
sidebar_position: 4
title: Installing
description: Install Podman Desktop extension
tags: [podman-desktop, extension, publishing]
keywords: [podman desktop, extension, publishing]
---

# Installing a Podman Desktop extension

Consider installing Podman Desktop extensions to enrich the default capabilities of Podman Desktop.

#### Prerequisites

* The extension Open Container Initiative (OCI) image name, such as: `quay.io/fbenoit/my-first-extension`.

   See [Publishing a Podman Desktop extension](publish).

#### Procedure

1. Go to the **Settings > Extensions**.

1. In the **Name of the Image** field, write the extension OCI image name.

1. Click the **Install extension from the OCI image** button.

#### Verification

* If Podman Desktop satisfies the minimum required version of the extension, the extension activates.

* Depending on the extension, items can appear in the status bar, tray menu, or other contributions.
