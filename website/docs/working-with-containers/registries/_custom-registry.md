#### Prerequisites

- Your registry URL, such as `https://my-registry.tld`.
- You have credentials on the image registry.

#### Procedure

1. Go to **<icon icon="fa-solid fa-cog" size="lg" /> Settings > Registries**.
1. Click **Add registry**.

   1. **URL**: Enter your registry URL, such as `https://my-registry.tld`.
   2. **User name**: Enter your user name.
   3. **Password**: Enter your password or OAuth secret.
   4. Click **Login**.

      ![Adding a custom registry](img/adding-a-custom-registry.png)

<details>
<summary>

1. (Optionally) If you have an **Invalid Certificate** warning:

</summary>

- [Add the custom certificate to the Podman configuration](/docs/working-with-containers/registries/insecure-registry).

  ![Podman Desktop Registry Warning](img/registry-warning-insecure.png)

</details>
