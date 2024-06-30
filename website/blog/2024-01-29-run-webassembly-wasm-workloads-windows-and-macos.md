---
title: Unlock WebAssembly on macOS & Windows
description: Spinning a OCI container image containing a WebAssembly/Wasm workload on macOS or Windows should be as simple as running any other OCI image.
slug: wasm-workloads-on-macos-and-windows-with-podman
authors: [benoitf]
tags: [podman-desktop, wasm, wasi, WebAssembly]
hide_table_of_contents: false
image: /img/blog/run-webassembly-wasm-workloads-windows-and-macos/webassembly-podman.webp
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

Seamlessly run WebAssembly/Wasm binaries on macOS and Windows

You might have heard excitement recently about Wasm and WASI. Imagine a world where you can effortlessly run Wasm binaries and distribute them using Open Container Initiative (OCI) container images – a singular image deployable across multiple architectures.

Though the concept seemed straightforward, accomplishing this task proved to be quite challenging, particularly on macOS and Windows. The complexity comes from the additional virtual machine running Linux. This machine needs all of the dependencies and prerequisites correctly setup.

The wait is over. Our blog post unveils the solution, guiding you through the process of enabling Wasm workloads on both macOS and Windows.

![hero](img/run-webassembly-wasm-workloads-windows-and-macos/webassembly-podman.webp)

<!--truncate-->

---

## What is WebAssembly ?

[WebAssembly](https://webassembly.org/) (abbreviated Wasm) was designed as a portable compilation target for programming languages, improving performance and portability of web applications (including gaming/emulators). Using a low-level binary format instead of JavaScript boosts applications to have near-native performance.

The binary format serves as a compilation target and it allows to use a wider range of programming languages such as C, C++, and Rust. While it was a browser/client technology, now it is evolving beyond the web, for example being adapted for use as a back-end or edge technology (this is for example what happened to Java that was first designed for the client side before landing to the server side).

The Wasm binary format was designed to be secure. Wasm modules are isolated from the rest of the system, and they cannot access any system resources without explicit permission. This makes Wasm modules very safe to run, even in untrusted environments. But on another hand, for developing backend applications, this restriction is limiting the usage of Wasm.

## The extension of WebAssembly

WebAssembly System Interface (WASI) was born as an essential complement to WebAssembly.

It is a system interface that extends WebAssembly's capabilities beyond the browser, making it suitable for a wider range of environments, including servers, edge devices, and more.

While with Wasm you had limited access to the host resources, WASI provides a standard set of system calls, enabling WebAssembly modules to interact with the host operating system in a secure and consistent manner: it includes filesystem access, sockets, and other low-level resources.

## Running WebAssembly outside the browser

Wasm has shipped in the major browser engines so the usage of Wasm is possible without any 3rd party addition in the browser land. But when it comes to the edge/system usage, you need to find a virtual machine to run these workloads supporting WASI extension. And there is not only one application to run them, there are several Wasm runtimes such as WasmEdge, Wasmtime, Wasmer, and so on. All runtimes support different CPU architectures.

Since WASI is still maturing some of the API provided in these runtimes has not reached the standard, so users need to be careful to write portable applications that do not depend on a given runtime.

Besides running Wasm/WASI workloads on your computer, there is also the question of how you package this binary format, share, and distribute it. A convenient way to distribute and run these workloads is to use OCI images as it provides all the basics: package, storage and distribution of the binaries. Then comes the execution part.

## Using Podman engine with Wasm

When using containers with Podman on macOS or Windows, you have a virtual machine called a "Podman machine" that is executing a Linux environment. We need to add support for Wasm inside this Linux environment. Podman is using the crun project as its OCI runtime, so crun needs to be able to run or delegate execution to Wasm runtimes. Lucky for us, crun supports Wasm execution.

From the user's point of view, support for Wasm is provided as an additional platform. So when executing a Wasm workload, we specify as a platform `--platform=wasi/wasm` instead of for example `--platform=linux/arm64` or `--platform=linux/amd64`.

​

## Running Wasm workload with podman

### Setup

<Tabs groupId="operating-systems">
<TabItem value="win" label="Windows">

On Windows, ensure that your podman machine is a recent one. You can check using the `podman version` command.

Depending on the output of the command, you might have extra steps to do.

- Client's version and server's side version >= v4.7.0: Nothing to do, Wasm support is already there using the wasmedge runtime by default.
- Client's version >= 4.6.0 but server's side version < 4.7. You need to create a new podman machine using the command podman machine init --now wasm
- Old client/old server (< 4.7.0) or podman not being installed: follow the getting started at [podman.io](https://podman.io)

</TabItem>
<TabItem value="mac" label="macOS">

On macOS, ensure that your podman machine is a recent one. You can check using the `podman version` command. It requires v4.8+.

Depending on the output of the command, you might have extra steps to do.

- Client's version and server's side version >= v4.8.0: Nothing to do, Wasm support is already there using the wasmedge runtime by default.
- Client's version >= 4.8.0 but server's side version < 4.8. You need to create a new podman machine using the command podman machine init --now wasm
- Old client/old server (< 4.8.0) or podman not being installed: follow the getting started at [podman.io](https://podman.io)

</TabItem>
</Tabs>

### Running Wasm images

Let's try with a simple hello world sample.

We will use example coming from [https://github.com/redhat-developer/podman-desktop-demo/tree/main/wasm/rust-hello-world](https://github.com/redhat-developer/podman-desktop-demo/tree/main/wasm/rust-hello-world)

There is already an OCI image on quay.io

To run the workload, we will use the following command:

```shell-shession
$ podman run --platform wasi/wasm quay.io/podman-desktop-demo/wasm-rust-hello-world
```

When running the command, you will see a Podman Hello World that was compiled using a Rust project using the println function and compiled into Wasm using `--target wasm32-wasi` parameter at compilation time.

![Hello World example running](img/wasm-workloads-on-macos-and-windows-with-podman/wasm-hello-world.png)

you can omit the `--platform wasi/wasm` flag but in that case you'll get a warning that the platform of the image is not matching the platform of your computer (`WARNING: image platform (wasi/wasm) does not match the expected platform (linux/arm64)`)

From this point, you can run other OCI images using Wasm workloads, not only the podman hello world sample.

**_NOTE:_** if you don't have the prerequisites installed in your podman machine you will see this error: `Error: requested OCI runtime crun-wasm is not available: invalid argument`

In that case you should check that the prerequisites from the previous section are met.

## Building Wasm OCI images with podman

### Building with a specific platform/architecture

Running Wasm workload is an interesting use case from a consumer point of view. It helps to consume Wasm binaries. But another interesting case is to distribute and build these Wasm images so anyone could run them quickly.

The goal is to have a minimal image containing only the Wasm binary. For that we will use a multi-stage build. First stage will be the platform to build/compile the `.wasm` binary file and the second/last stage will copy the binary to a scratch image.

When building images it will use by default the architecture of the host operating system. If you are using a Mac computer with ARM chip, then the Linux images will default to `linux/arm64`. Using a mac/intel it will default to `linux/amd64` images. In the case of Wasm workloads, the expected target platform is `wasi/wasm`.

With podman we can use the flag `--platform=wasi/wasm` on the `podman build` command to specify the system/architecture. But if we do that, it means that if the Dockerfile or Containerfile contains as base image `FROM docker.io/redhat/ubi9-minimal` for example it will try to fetch a `ubi9-minimal` image using the `wasi/wasm` platform but of course it does not exist.

So we need to tweak the Containerfile to include a `--platform` directive inside the Containerfile.

Example of Containerfile:

```Dockerfile
FROM --platform=$BUILDPLATFORM docker.io/redhat/ubi9-minimal as builder
```

Using this method, we will fetch an image matching our host architecture but as there is still the  `--platform=wasi/wasm` on the command line, the resulting image will use the right platform.

### Source code

Here is a simple Containerfile to build a rust application using wasm32-wasi binary output and a multi-layer OCI image. One layer for the build (installing rust, dependencies and compiling the application) and one scratch layer where we only add the `.wasm` output and flag it as the entrypoint.

Source code is available at [https://github.com/redhat-developer/podman-desktop-demo/tree/main/wasm/rust-hello-world](https://github.com/redhat-developer/podman-desktop-demo/tree/main/wasm/rust-hello-world)

`Containerfile` content:

```Dockerfile
# Build using the host platform (and not target platform wasi/wasm)
FROM --platform=$BUILDPLATFORM docker.io/redhat/ubi9-minimal as builder

# install rust and Wasm/WASI target
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y \
    && source "$HOME/.cargo/env" && rustup target add wasm32-wasi

# copy source code
COPY Cargo.toml /app/
COPY src /app/src 

# change working directory
WORKDIR /app

# Build
RUN source "$HOME/.cargo/env" && cd /app && cargo build --target wasm32-wasi --release

# now copy the Wasm binary and flag it as the entrypoint
FROM scratch
ENTRYPOINT [ "/rust-hello-world.wasm" ]
COPY --from=builder /app/target/wasm32-wasi/release/rust-hello.wasm /rust-hello-world.wasm
 
```

The `Cargo.toml` content:

```toml
[package]
name = "rust-hello-world"
version = "0.1.0"
edition = "2021"

[[bin]]
name = "rust-hello"
path = "src/main.rs"
```

And the rust program `src/main.rs`:

```toml

  fn main() {

    // use of strings literal for multi-line string
    // https://doc.rust-lang.org/reference/tokens.html#raw-string-literals

    // ascii art from Máirín Duffy @mairin
    let hello = r#"
!... Hello Podman Wasm World ...!

         .--"--.
       / -     - \
      / (O)   (O) \
   ~~~| -=(,Y,)=- |
    .---. /`  \   |~~
 ~/  o  o \~~~~.----. ~~
  | =(X)= |~  / (O (O) \
   ~~~~~~~  ~| =(Y_)=-  |
  ~~~~    ~~~|   U      |~~

Project:   https://github.com/containers/podman
Website:   https://podman.io
Documents: https://docs.podman.io
Twitter:   @Podman_io
"#;
    println!("{}", hello);
    
  }

```

All the source code is available at [https://github.com/redhat-developer/podman-desktop-demo/tree/main/wasm/rust-hello-world](https://github.com/redhat-developer/podman-desktop-demo/tree/main/wasm/rust-hello-world)

### Building Wasm images

Run the command from the `wasm/rust-hello-world` folder if you cloned the repository or from the directory where all the files are present.

```shell-session
$ podman build --platform=wasi/wasm -t rust-hello-world-wasm .
```

example of output will be :

```console
[1/2] STEP 1/6: FROM docker.io/redhat/ubi9-minimal AS builder
Trying to pull docker.io/redhat/ubi9-minimal:latest...
Getting image source signatures
Copying blob sha256:472e9d218c02b84dcd7425232d8b1ac2928602de2de0efc01a7360d1d42bf2f6
Copying config sha256:317fc66dad246d1fac6996189a26f85554dc9fc92ca23bf1e7bf10e16ead7c8c
Writing manifest to image destination
[1/2] STEP 2/6: RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y     && source "$HOME/.cargo/env" && rustup target add wasm32-wasi
info: downloading installer
info: profile set to 'default'
info: default host triple is aarch64-unknown-linux-gnu
info: syncing channel updates for 'stable-aarch64-unknown-linux-gnu'
info: latest update on 2023-10-05, rust version 1.73.0 (cc66ad468 2023-10-03)
info: downloading component 'cargo'
info: downloading component 'clippy'
info: downloading component 'rust-docs'
info: downloading component 'rust-std'
info: downloading component 'rustc'
info: downloading component 'rustfmt'
info: installing component 'cargo'
info: installing component 'clippy'
info: installing component 'rust-docs'
info: installing component 'rust-std'
info: installing component 'rustc'
info: installing component 'rustfmt'
info: default toolchain set to 'stable-aarch64-unknown-linux-gnu'

  stable-aarch64-unknown-linux-gnu installed - rustc 1.73.0 (cc66ad468 2023-10-03)


Rust is installed now. Great!

To get started you may need to restart your current shell.
This would reload your PATH environment variable to include
Cargo's bin directory ($HOME/.cargo/bin).

To configure your current shell, run:
source "$HOME/.cargo/env"
info: downloading component 'rust-std' for 'wasm32-wasi'
info: installing component 'rust-std' for 'wasm32-wasi'
--> c93a3433d432
[1/2] STEP 3/6: COPY Cargo.toml /app/
--> cf4488993835
[1/2] STEP 4/6: COPY src /app/src
--> 531b9389857c
[1/2] STEP 5/6: WORKDIR /app
--> 23379392f585
[1/2] STEP 6/6: RUN source "$HOME/.cargo/env" && cd /app && cargo build --target wasm32-wasi --release
   Compiling rust-hello-world v0.1.0 (/app)
    Finished release [optimized] target(s) in 0.15s
--> e3582e06f45b
[2/2] STEP 1/3: FROM scratch
[2/2] STEP 2/3: ENTRYPOINT [ "/rust-hello-world.wasm" ]
--> 069b1742d906
[2/2] STEP 3/3: COPY --from=builder /app/target/wasm32-wasi/release/rust-hello.wasm /rust-hello-world.wasm
[2/2] COMMIT rust-hello-world-wasm
--> e0948298c0be
Successfully tagged localhost/rust-hello-world-wasm:latest
e0948298c0be20e11da5d92646a2d6453f05e66671f72f0f792c1e1ff8de75ba
```

This is a multi-stage build but at the end we only have a small image containing the Wasm binary.

Launch it quickly using

```shell-session
$ podman run rust-hello-world-wasm
```

and we'll see the expected output

```console
WARNING: image platform (wasi/wasm/v8) does not match the expected platform (linux/arm64)

!... Hello Podman Wasm World ...!

         .--"--.
       / -     - \
      / (O)   (O) \
   ~~~| -=(,Y,)=- |
    .---. /`  \   |~~
 ~/  o  o \~~~~.----. ~~
  | =(X)= |~  / (O (O) \
   ~~~~~~~  ~| =(Y_)=-  |
  ~~~~    ~~~|   U      |~~

Project:   https://github.com/containers/podman
Website:   https://podman.io
Documents: https://docs.podman.io
Twitter:   @Podman_io

```

​

## Conclusion

After witnessing the seamless execution and creation of WebAssembly (Wasm) workloads on both Windows and macOS through the utilization of podman, the possibilities are at your fingertips.

Now, the initiative lies with you to embark on your journey of exploring, experimenting, and pushing the boundaries.

Run and build new examples and do not hesitate to contribute to the podman community by reporting and discussing these issues.
