# Custom Update Server Support

## Overview

Downstream forks can point the auto-updater at any HTTPS server by setting `update.url` in `product.json`.
When empty (default), the existing GitHub Releases behavior is preserved.

```json
"update": {
  "url": "https://updates.myserver.com/this/dir"
}
```

The fork then hosts the electron-builder metadata files (`latest-mac.yml`, `latest.yml`) and SIGNED binaries on that server.

---

## Testing with a Local Update Server

Test the full update flow locally using nginx in a Podman container. Build 2 versions, a high version (v99.0.0) served as the update, and a low version (v1.0.0) that you run locally.

### macOS

#### Step 1: Clean assets directory

For testing locally remove old `.pkg` files and `.zst` machine images in `extensions/podman/packages/extension/assets/` before building. These inflate the ZIP from ~200MB to 1.5GB+, causing Squirrel.Mac to crash (it buffers the entire download in memory).

```bash
rm extensions/podman/packages/extension/assets/*
```

#### Step 2: Create a self-signed code signing certificate

Squirrel.Mac (how it downloads) requires both the running app and the update to share the same code signing identity.
Ad-hoc signatures (`--sign -`) produce a unique identity per signing, so you need to generate a named certificate.

```bash
cat > /tmp/cert.cfg <<'EOF'
[ req ]
default_bits = 2048
prompt = no
default_md = sha256
distinguished_name = dn

[ dn ]
CN = Podman Desktop Test
O = Test
C = US

[ v3_code_signing ]
keyUsage = digitalSignature
extendedKeyUsage = codeSigning
EOF

openssl req -x509 -newkey rsa:2048 -keyout /tmp/test-key.pem -out /tmp/test-cert.pem \
  -days 365 -nodes -config /tmp/cert.cfg -extensions v3_code_signing

# Export to p12 (-legacy flag required for macOS compatibility)
openssl pkcs12 -export -out /tmp/test-cert.p12 -inkey /tmp/test-key.pem \
  -in /tmp/test-cert.pem -passout pass:test123 -legacy

# Import into keychain
security import /tmp/test-cert.p12 -k ~/Library/Keychains/login.keychain-db \
  -P test123 -T /usr/bin/codesign -T /usr/bin/security

# Trust for code signing
security add-trusted-cert -d -r trustRoot -p codeSign \
  -k ~/Library/Keychains/login.keychain-db /tmp/test-cert.pem

# Verify — should show "Podman Desktop Test" with 1 valid identity
security find-identity -v -p codesigning
```

#### Step 3: Configure `product.json`

Get your local IP and set it in `product.json`, this will be used for our "update server":

```bash
ipconfig getifaddr en0
```

```json
"update": {
  "url": "http://<YOUR_LOCAL_IP>:8080"
}
```

#### Step 4: Build the initial binary (v1.0.0)

```bash
# pre-build
pnpm install && pnpm build

# set version to 1.0.0
sed -i '' 's/"version": ".*"/"version": "1.0.0"/' package.json

# build the dmg
CSC_NAME="Podman Desktop Test" pnpm compile:current --mac dmg --arm64

# save the v1.0.0 dmg (building v99.0.0 next will overwrite dist/)
cp dist/podman-desktop-1.0.0-arm64.dmg /tmp/podman-desktop-1.0.0-arm64.dmg
```

#### Step 5: Build the update binary (v99.0.0)

```bash
sed -i '' 's/"version": ".*"/"version": "99.0.0"/' package.json

# default targets include zip, which is needed for latest-mac.yml
CSC_NAME="Podman Desktop Test" pnpm compile:current --mac --arm64
```

#### Step 6: Re-sign, repackage, and host the update

electron-builder signs the main executable, but the Electron Framework inside the bundle may retain a different Team ID. You must re-sign with `--deep`, repackage the ZIP, and update the checksum.

```bash
# Re-sign with --deep
codesign --force --deep --sign "Podman Desktop Test" "dist/mac-arm64/Podman Desktop.app"
codesign --verify --deep --strict "dist/mac-arm64/Podman Desktop.app"

# Repackage ZIP (ditto matches electron-builder's format)
mkdir -p /tmp/update-repack
cd dist/mac-arm64
ditto -c -k --sequesterRsrc --keepParent "Podman Desktop.app" /tmp/update-repack/podman-desktop-99.0.0-arm64.zip
cd -

# Get new checksum and size
NEW_SHA512=$(shasum -a 512 /tmp/update-repack/podman-desktop-99.0.0-arm64.zip | awk '{print $1}' | xxd -r -p | base64)
NEW_SIZE=$(stat -f%z /tmp/update-repack/podman-desktop-99.0.0-arm64.zip)
echo "sha512: $NEW_SHA512"
echo "size: $NEW_SIZE"

# Copy to a server directory (we will use ~/update-server dir, or use whatever you'd like)
mkdir -p ~/update-server
cp dist/latest-mac.yml ~/update-server/
cp /tmp/update-repack/podman-desktop-99.0.0-arm64.zip ~/update-server/
cp dist/podman-desktop-99.0.0-arm64.zip.blockmap ~/update-server/
```

**IMPORTANT!:**

Edit `~/update-server/latest-mac.yml` and replace the `sha512` and `size` for the `arm64.zip` entry with the values printed above, or this will NOT work.

#### Step 7: Start the update server

We'll use nginx in order to host the files.

```bash
podman run --rm -d \
  --name update-server \
  -p 8080:80 \
  -v "$HOME/update-server:/usr/share/nginx/html:ro,Z" \
  docker.io/library/nginx:alpine

# Verify
curl http://<YOUR_LOCAL_IP>:8080/latest-mac.yml | head -2
```

#### Step 8: Install and run

Install v1.0.0 from the dmg:

```bash
# Open the v1.0.0 dmg and drag "Podman Desktop" to the Applications folder
open /tmp/podman-desktop-1.0.0-arm64.dmg

# After installing, re-sign and launch
codesign --force --deep --sign "Podman Desktop Test" "/Applications/Podman Desktop.app"
open "/Applications/Podman Desktop.app"
```

The app should show v1.0.0 and detect v99.0.0.

Test downloading the update, and after restarting it will show v99.0.0.

#### Step 9: Clean up

Stop the update server, and clean up / remove your test keys!

```bash
podman stop update-server
rm -rf ~/update-server /tmp/update-repack
rm -f /tmp/podman-desktop-1.0.0-arm64.dmg
rm -f /tmp/test-key.pem /tmp/test-cert.pem /tmp/test-cert.p12 /tmp/cert.cfg
security delete-identity -c "Podman Desktop Test"
git checkout product.json package.json
```

### Windows

Windows uses NSIS (not Squirrel) for updating, so no need for signing at all.

#### Step 1: Configure `product.json`

Get your local IP and set it:

```powershell
(Get-NetIPAddress -AddressFamily IPv4 -InterfaceAlias "Wi-Fi").IPAddress
```

```json
"update": {
  "url": "http://<YOUR_LOCAL_IP>:8080"
}
```

#### Step 2: Build the initial binary (v1.0.0)

```powershell
pnpm install
pnpm build

# Set version to 1.0.0
(Get-Content package.json -Raw) -replace '"version":\s*".*?"', '"version": "1.0.0"' | Set-Content package.json

pnpm compile:current

# Save the v1.0.0 installer (building v99.0.0 next will overwrite dist/)
copy dist\podman-desktop-1.0.0-setup-x64.exe $HOME\podman-desktop-1.0.0-setup-x64.exe
```

#### Step 3: Build the update binary (v99.0.0)

```powershell
# Set version to 99.0.0
(Get-Content package.json -Raw) -replace '"version":\s*".*?"', '"version": "99.0.0"' | Set-Content package.json

pnpm compile:current
```

#### Step 4: Host the update

```powershell
mkdir $HOME\update-server

copy dist\latest.yml $HOME\update-server\
copy dist\podman-desktop-99.0.0-setup-x64.exe $HOME\update-server\
copy dist\podman-desktop-99.0.0-setup-x64.exe.blockmap $HOME\update-server\
```

#### Step 5: Start the update server

```powershell
podman run --rm -d --name update-server -p 8080:80 -v "$HOME/update-server:/usr/share/nginx/html:ro" docker.io/library/nginx:alpine

# Verify
curl http://<YOUR_LOCAL_IP>:8080/latest.yml
```

#### Step 6: Install and run

Install the v1.0.0 setup exe from `$HOME\podman-desktop-1.0.0-setup-x64.exe`, then launch the app. It should detect v99.0.0 and offer to update. Test that it downloads / updates.

#### Step 7: Clean up

Clean up by stopping podman + removing the gen files.

```powershell
podman stop update-server
Remove-Item -Recurse $HOME\update-server
Remove-Item $HOME\podman-desktop-1.0.0-setup-x64.exe
git checkout product.json package.json
```

---

### HTTPS

The above example uses http, however, electron-updater WILL reject self-signed TLS certs by default on the server.

If you want to test with an https server, you could use:

- GitHub pages
- Let's Encrypt via a reverse proxy with a real domain
- [ngrok](https://ngrok.com/) — tunnels with a valid HTTPS certificate:
  ```bash
  ngrok http 8080
  # Use the ngrok HTTPS URL in product.json
  ```
