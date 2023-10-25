---
sidebar_position: 3
title: Registries
description: Working with container registries
tags: [podman-desktop, containers, registries]
keywords: [podman desktop, podman, containers, registries]
hide_table_of_contents: false
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import Preconfigured from './\_preconfigured-registry.md'
import Custom from './\_custom-registry.md'
import Verification from './\_verification-private-registry.md'

# Working with container registries

Podman Desktop has access to public registries by default.

You might want to configure Podman Desktop to authenticate to:

- A pre-configured registry:

  - Red Hat Quay
  - Docker Hub
  - GitHub
  - Google Container registry

- A custom registry.

<Tabs groupId="registry" queryString="registry">
<TabItem value="preconfigured" label="Pre-configured registry">

<Preconfigured />

</TabItem>
<TabItem value="custom" label="Custom registry">

<Custom />

</TabItem>
</Tabs>

<Verification />
