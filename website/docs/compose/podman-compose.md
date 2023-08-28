---
title: Podman Compose with Podman Desktop
sidebar_position: 3
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## Introduction

The [Compose spec](https://compose-spec.io) is a container specification that allows you to define a multi-container application in a simple YAML file.

If you have not used a [Compose file](https://github.com/compose-spec/compose-spec/blob/master/spec.md#compose-file) or the [Compose spec](https://compose-spec.io/), visit [this guide](https://github.com/compose-spec/compose-spec/blob/master/spec.md) for more information.

### Implementations

There are two implementations that Podman Desktop supports:

- [Podman Compose](https://github.com/containers/podman-compose): The Python implementation of the Compose specification with native Podman integration.
- [Compose](https://github.com/docker/compose): The Go reference implementation of the Compose specification.

### Requirements

- [Podman Desktop installed](/docs/installation)
- [Compose installed](https://github.com/docker/compose) OR [Podman Compose installed](https://github.com/containers/podman-compose#installation)

## Getting started

Use the [Flask Redis project](https://github.com/docker/awesome-compose/tree/master/flask-redis) from the [awesome-compose repository](https://github.com/docker/awesome-compose) as an example project.

1. Git clone the project and `cd` into the directory:

   ```shell-session
   $ git clone https://github.com/docker/awesome-compose
   $ cd awesome-compose/redis-flask
   ```

2. Run the `compose.yaml` file:

<Tabs groupId="compose">
<TabItem value="go" label="Compose (macOS)">

Before running the command, confirm you have:

- [Setup podman-mac-helper](/docs/migrating-from-docker/using-podman-mac-helper) or clicked on the "Docker Compatibility" button within Podman Desktop.
- [Set the DOCKER_HOST variable](/docs/migrating-from-docker/using-the-docker_host-environment-variable).

Run the command:

```shell-session
$ docker-compose -f compose.yaml up -d
```

</TabItem>

<TabItem value="golinux" label="Compose (Linux)">

Before running the command, confirm you have:

- Clicked on the "Docker Compatibility" button within Podman Desktop.
- [Set the DOCKER_HOST variable](/docs/migrating-from-docker/using-the-docker_host-environment-variable).

Run the command:

```shell-session
$ docker-compose -f compose.yaml up -d
```

</TabItem>

<TabItem value="gowindows" label="Compose (Windows)">

Before running the command, confirm you have:

- [Set the DOCKER_HOST variable](/docs/migrating-from-docker/using-the-docker_host-environment-variable).

Run the command:

```shell-session
$ docker-compose -f compose.yaml up -d
```

Alternatively, you can also run the `compose.bat` script that automatically adds the `DOCKER_HOST` and `$PATH` variables:

```shell-session
$ %HOMEPATH%\.local\share\containers\podman-desktop\extensions-storage\podman-desktop.compose\bin\compose docker-compose -f compose.yaml up -d
```

</TabItem>
<TabItem value="python" label="Podman Compose">

```shell-session
$ podman-compose -f compose.yaml up -d
```

</TabItem>
</Tabs>

3. Manage Compose with Podman Desktop

   To confirm if the containers are running, open Podman Desktop and click on the ‘Containers’ option on the left side of the application. You will have the containers bundled together under a Pod named `flask-redis (compose)` in this case. Here, the compose within the bracket indicates it has been generated from a Compose YAML file.

   ![img2](img/compose_doc_image_2.png)

4. You can further configure or work with these containers within the Podman Desktop application now that they are visible. Here, clicking on the ‘Open Browser’ button allows us to confirm if the application is running expectedly.

   ![img3](img/compose_doc_image_3.png)

5. You can do much more such as checking logs, opening the terminal or inspecting the files for more details.

   ![img4](img/compose_doc_image_4.png)
