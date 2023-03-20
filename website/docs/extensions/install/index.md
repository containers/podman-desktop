---
sidebar_position: 3
title: Installing
description: Install Podman Desktop extension
tags: [podman-desktop, extension, publishing]
keywords: [podman desktop, extension, publishing]
---

# Installing a Podman Desktop extension

Consider installing Podman Desktop extensions to enrich the default capabilities of Podman Desktop.

#### Prerequisites

* The extension Open Container Initiative (OCI) image name.

   For example: `quay.io/fbenoit/my-first-extension`.

   See [Publishing a Podman Desktop extension](../extensions/publish).

#### Procedure

1. Go to the **Settings** page on the bottom left of Podman Desktop UI.

1. Click on **Extensions** in the navigation bar tree.

1. In the **Name of the Image** field, write the name of the OCI image containing the extension.

1. Click the **Install extension from the OCI image** button.

#### Verification

* If Podman Desktop satisfies the minimum required version of the extension, the extension activates.

* Depending on the extension, items can appear in the status bar, tray menu, or other contributions.
