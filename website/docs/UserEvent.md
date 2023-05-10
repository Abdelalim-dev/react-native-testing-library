---
id: user-event
title: User Event
---

### Table of contents

- [`userEvent.setup`](#usereventsetup)
  - [Options](#options)
- [`type()`](#type)
  - [Options:](#options-1)
  - [Sequence of events](#sequence-of-events)


## `userEvent.setup`

```ts
userEvent.setup(options?: {
  delay: number;
  advanceTimers: (delay: number) => Promise<void> | void;
})
```

Example
```ts
const user = userEvent.setup();
```

Creates User Event instances which can be used to trigger events.

### Options
- `delay` - controls the default delay between subsequent events, e.g. keystrokes, etc.
- `advanceTimers` - time advancement utility function that should be used for fake timers. The default setup handles both real and Jest fake timers.

## `type()`

```ts
type(
  element: ReactTestInstance,
  text: string,
  options?: {
    skipPress?: boolean
    submitEditing?: boolean
  }
): Promise<void>
```

Example
```ts
await user.type(textInput, "Hello world!");
```

This helper simulates user focusing on `TextInput` element, typing `text` one character at a time, and leaving the element.

This function supports only host `TextInput` elements. Passing other element type will result in throwing error.

### Options:
 - `skipPress` - if true, `pressIn` and `pressOut` events will not be triggered.
 - `submitEditing` - if true, `submitEditing` event will be triggered after typing the text.

### Sequence of events

The sequence of events depends on `multiline` prop, as well as passed options.

Events will not be emitted if `editable` prop is set to `false`.

Entering the element:
- `pressIn` (optional)
- `focus`
- `pressOut` (optional)

The `pressIn` and `pressOut` events are send by default, but can be skipped by passing `skipPress: true` option.

Typing (for each character):
- `keyPress`
- `textInput` (optional)
- `change`
- `changeText`
- `selectionChange`

The `textInput` event is sent only for mutliline text inputs.

Leaving the element:
- `submitEditing` (optional)
- `endEditing`
- `blur`

The `submitEditing` event is skipped by default. It can be send by setting `submitEditing: true` option.
