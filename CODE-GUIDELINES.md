# Guidelines for Podman Desktop Code

## Production code

## Unit tests code

### Use `vi.mocked`, not a generic `myFunctionMock`

If you define a mock with `const myFunctionMock = vi.fn();` its type is `Mock<Procedure>`, which is a generic type.

For example, do not write this, or Typescript won't be able to detect that you passed an object instead of a string to `mockResolvedValue`:

```ts
const windowMethodMock = vi.fn();

Object.defineProperty(global, 'window', {
  value: {
    windowMethod: windowMethodMock,
  },
});

test('...', () => {
  windowMethodMock.mockResolvedValue({ msg: 'a string' }); // here, Typescript is not able to detect that the type is wrong
});
```

Instead, you can write `vi.mocked(window.windowMethod).mock...`, and Typescript will check that you correctly pass a string to `mockResolvedValue`:

```ts
Object.defineProperty(global, 'window', {
  value: {
    windowMethod: vi.fn(),
  },
});

test('...', () => {
  vi.mocked(window.windowMethod).mockResolvedValue('a string');
});
```

### Do not use `try {} catch` in tests

The following code has a problem, if the code in the try block do not raise an error, we do not check the error message.

```ts
// bad
test('expect error to be properly catched and verified', async () => {
  try {
    await Promise.reject(new Error('Dummy Error'));
  } catch(err: unknown) {
    expect(err.message).toBe('Dummy Error')
  }
});
```

Here is a version where we are sure the block rejected an error.

```ts
  await expect(async () => {
    await Promise.reject(new Error('Dummy Error'));
  }).rejects.toThrowError('Dummy Error');
```
