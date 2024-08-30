# Website

### Install the project dependencies

```shell-session
$ pnpm install
```

### Local Development of the website / documentation

```shell-session
$ pnpm start
```

This command starts a local development server and opens up a browser window. Most changes are reflected live without having to restart the server.

### Build

```shell-session
$ pnpm build
```

This command generates static content into the `build` directory and can be served using any static contents hosting service.

### Deployment

Using SSH:

```shell-session
$ USE_SSH=true pnpm deploy
```

Not using SSH:

```shell-session
$ GIT_USER=<Your GitHub username> pnpm deploy
```

If you are using GitHub pages for hosting, this command is a convenient way to build the website and push to the `gh-pages` branch.

### Adding a Node.js module to the website

1. Add the module in the `website` context:

   ```shell-session
   $ cd website
   $ pnpm add <module>
   ```

2. Update the `pnpm-lock.yaml` file in the repository root context:

   ```shell-session
   $ cd ..
   $ git checkout HEAD -- pnpm-lock.yaml
   $ pnpm install
   ```
