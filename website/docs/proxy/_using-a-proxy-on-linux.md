#### Procedure

1. Edit the `containers.conf` file to pass the proxy environment variables to the Podman engine.

   The file location depends on your connection mode:

   - `rootless`: `$HOME/.config/containers/containers.conf`

   - `rootful`: `/etc/containers/containers.conf`

   ```toml
   [engine]
   env = ["http_proxy=<your.proxy.tld:port>", "https_proxy=<your.proxy.tld:port>"]
   ```

<details>
<summary>
2. (Optionally) If your containers require access to the restricted network, set up the proxy for your containers.
</summary>

- Edit the `containers.conf` file.

  ```toml
  [containers]
  http_proxy = true
  env = ["http_proxy=<your.proxy.tld:port>", "https_proxy=<your.proxy.tld:port>"]
  ```

</details>

<details>
<summary>
3. (Optionally) If your proxy has a custom Certificate Authorities (CA), such as a self-signed certificate, set up the proxy custom CA.
</summary>

1. Store your proxy Certificate Authorities (CA) in your home directory, in the `proxy_ca.pem` file, in Privacy-Enhanced Mail (PEM) format.

2. Copy the certificate to the CA trust store:

   ```shell-session
   $ sudo cp <proxy_ca.pem> /etc/pki/ca-trust/source/anchors/
   ```

3. Update your CA trust store:

   ```
   $ sudo update-ca-trust
   ```

</details>

4. Restart all `podman` processes.

   ```shell-session
   $ pkill podman
   ```

1. Restart Podman Desktop: <kbd>Ctrl</kbd> + <kbd>q</kbd>.

#### Verification

1. Go to **Images**.
1. Click **Pull an image**.
1. **Image to Pull**: `bash`
1. Click **Pull image**.
1. Podman Desktop reports `Download complete`.
