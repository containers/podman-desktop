---
sidebar_position: 51
title: Adding certificates to a Podman machine
description: Adding certificates to a Podman machine
keywords: [podman desktop, podman, certificates]
tags: [adding-certificates]
---

# Adding certificates to a Podman machine

You can add certificates from your local certificate authority (CA) or from a third-party vendor into a Podman machine. After adding these certificates, you can use them in your images:

- To secure the communication channel between the running applications in your container and the external host system
- To validate the SSL or TLS certificates provided by external services for authentication

You can also use the added certificates to fix any secure connection issue. For example, you might add some certificates into your Podman machine running on Windows Subsystem for Linux (WSL) to fix an SSL issue.

#### Prerequisites

- You have created a [Podman machine](/docs/podman/creating-a-podman-machine).
- On Windows: The certificates to be installed are available on an accessible server using the `curl` command.
- On macOS: You have downloaded or created a certificate.

#### Procedure: On Windows

1. Start an interactive session with the default Podman machine:

```shell-session
$ podman machine ssh
```

2. Switch to a root shell:

```shell-session
 $ sudo su -
```

3. Change to the directory where the certificates must be placed:

```shell-session
# cd /usr/local/share/ca-certificates/
```

4. Perform one of the following steps to download or create a certificate:

- Use the `curl` command to download a certificate:

  ```shell-session
  # curl -k -o <my-certificate.pem> https://<my-server.com/my-certificate.pem>
  ```

  - Optional: Use the `-k` option only to connect securely to a server for which the certificate is not yet trusted
  - Replace `my-certificate.pem` with the actual name of the .pem certificate
  - Replace `my-server.com/my-certificate.pem` with a valid server URL and a .pem certificate

- Using the vi editor to create a certificate:

  ```shell-session
  # vi <my-certificate.pem>
  ```

:::note

To add another certificate, repeat the above step.

:::

5. Add the certificate to the list of trusted certificates:

```shell-session
# update-ca-certificates
```

6. Exit the Podman machine:

```shell-session
# exit
```

#### Procedure: On macOS

1. Start an interactive session with the default Podman machine:

```shell-session
$ podman machine ssh
```

2. Change to the directory, such as _/Downloads_ where the certificate is placed:

```shell-session
# cd /Downloads
```

3. Add the certificate to the list of trusted certificates:

```shell-session
# security add-trusted-cert -d -r trustRoot -k /Library/Keychains/System.keychain <certificate-name.crt>
```

- Replace `certificate-name.crt` with the actual certificate name, such as _rootCA.crt_.

:::note

To add another certificate, repeat the above step.

:::

4. Exit the Podman machine:

```shell-session
# exit
```
