---
sidebar_position: 51
title: Adding certificates to a Podman machine
description: Adding certificates to a Podman machine
keywords: [podman desktop, podman, certificates]
tags: [adding-certificates]
---

# Adding certificates to a Podman machine

You can add certificates from your local certificate authority (CA) or from a third-party vendor into a Podman machine. After adding these certificates, you can use them in your images to:

- Secure the communication channel between the running applications in your container and the external host system
- Validate the SSL or TLS certificates provided by external services for authentication

#### Prerequisites

- A running [Podman machine](/docs/podman/creating-a-podman-machine).
- Obtained the required certificates for installation, such as _certificate.pem_ or _certificate.crt_.

#### Procedure

1. Start an interactive session with the default Podman machine:

```sh
$ podman machine ssh
```

2. Switch to a root shell:

```sh
 $ sudo su -
```

3. Change to the directory where the certificates must be placed:

```sh
# cd /etc/pki/ca-trust/source/anchors
```

4. Perform one of the following steps:

- Use the `curl` command to download a certificate:

  ```sh
  # curl [-k] -o <my-certificate> https://<my-server.com/my-certificate>
  ```

- Use any editor, such as Notepad or Vim to create a certificate file with .crt, .cer, or .pem extension.

5. Add the certificate to the list of trusted certificates:

```sh
# update-ca-trust
```

6. Exit the Podman machine:

```sh
# exit
```

7. Rerun the `exit` command to return to regular user permissions.
