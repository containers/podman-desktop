# Extension API type declarations

The `@podman-desktop/api` type declarations are split in several files:

```text
src/
  extension-api.d.ts  # entry file: license, @module doc, version/apiVersion and one /// <reference /> per fragment
  common/             # types shared by several namespaces (Disposable, Event, ...)
  api/                # one file per namespace (commands, containerEngine, ...)
```

Each fragment wraps its declarations in `declare module '@podman-desktop/api' { ... }`. TypeScript merges all the blocks
with the same module name into one module, so a fragment can use `Disposable`, `Event<T>`, `Uri`, etc. without any
import. Nothing is generated or concatenated at build time: the files are published as they are.

## Rules for fragments

- exactly one `declare module '@podman-desktop/api' { }` block per file
- no top-level `import` or `export`: it would turn the file into a module and the block into an augmentation
- the license header, as a plain `/* ... */` block comment: TypeDoc reads any `/** ... */` comment placed before a
  `declare module` as its documentation, which would hide the `@module` comment of `extension-api.d.ts` on the website
- when moving existing declarations, move them verbatim: no reformatting, renaming or doc edits in the same change
- add a `/// <reference path="..." />` line for the fragment in `extension-api.d.ts`, keeping the list sorted

These rules are checked by `extension-api.spec.ts`.
