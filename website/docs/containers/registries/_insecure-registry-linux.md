#### Prerequisites

- Podman is installed.

#### Procedure

1. Add your insecure registry within **<Icon icon="fa-solid fa-cog" size="lg" /> Settings > Registries**.

   ![Adding a custom registry](img/adding-a-custom-registry.png)

1. Click "Yes" to the insecure registry warning.

   ![Podman Desktop Registry Warning](img/registry-warning-insecure.png)

1. Open `registries.conf`.

   ```shell-session
   $ sudo vi /etc/containers/registries.conf
   ```

1. Add the insecure registry: Add a new `[[registry]]` section for the URL of the insecure registry you want to use. For example, if your insecure registry is located at `http://registry.example.com`, add the following lines:

   ```toml
   [[registry]]
   location = "registry.example.com"
   insecure = true
   ```

   If you have multiple registries, you can add one `[[registry]]` block per registry:

1. Save and exit the file.

1. Restart Podman.

   ```shell-session
   $ sudo systemctl restart podman
   ```
