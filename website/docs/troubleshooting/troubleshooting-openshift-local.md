---
sidebar_position: 30
---

# Troubleshooting OpenShift Local

You can find here troubleshooting help for issues specific to OpenShift Local.

1. To verify that your user can run `crc`, check that the `crc` binary is available in the user PATH (`/usr/local/bin/crc` on macOS and Linux).

2. To verify that the host is ready to run OpenShift Local, in a terminal, run this command and verify the output has no errors:

   ```
   $ crc setup --check-only
   ```

   Sample output:

   ```
   INFO Using bundle path <bundle_path>
   INFO Checking if running as non-root
   INFO Checking if running inside WSL2
   INFO Checking if crc-admin-helper executable is cached
   crc-admin-helper executable is not cached
   ```

3. To verify the configured preset, in a terminal, run:

   ```
   $ crc config get preset
   ```
