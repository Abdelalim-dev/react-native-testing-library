import * as React from 'react';
import { View, TextInput, TextInputProps } from 'react-native';
import { createEventLogger } from '../../test-utils/events';
import { render } from '../..';
import { userEvent } from '..';

beforeEach(() => {
  jest.useRealTimers();
  jest.clearAllMocks();
});

function renderTextInputWithToolkit(props: TextInputProps = {}) {
  const { events, handleEvent } = createEventLogger();

  const screen = render(
    <TextInput
      testID="input"
      onFocus={handleEvent('focus')}
      onBlur={handleEvent('blur')}
      onPressIn={handleEvent('pressIn')}
      onPressOut={handleEvent('pressOut')}
      onChange={handleEvent('change')}
      onChangeText={handleEvent('changeText')}
      onKeyPress={handleEvent('keyPress')}
      onTextInput={handleEvent('textInput')}
      onSelectionChange={handleEvent('selectionChange')}
      onSubmitEditing={handleEvent('submitEditing')}
      onEndEditing={handleEvent('endEditing')}
      onContentSizeChange={handleEvent('contentSizeChange')}
      {...props}
    />
  );

  return {
    ...screen,
    events,
  };
}

test('userEvent.type basic case', async () => {
  jest.spyOn(Date, 'now').mockImplementation(() => 100100100100);
  const { events, ...queries } = renderTextInputWithToolkit();

  const user = userEvent.setup();
  await user.type(queries.getByTestId('input'), 'abc');

  const eventNames = events.map((e) => e.name);
  expect(eventNames).toEqual([
    'pressIn',
    'focus',
    'pressOut',
    'keyPress',
    'change',
    'changeText',
    'selectionChange',
    'keyPress',
    'change',
    'changeText',
    'selectionChange',
    'keyPress',
    'change',
    'changeText',
    'selectionChange',
    'endEditing',
    'blur',
  ]);

  expect(events).toMatchSnapshot('input: "abc"');
});

test('userEvent.type with defaultValue', async () => {
  const { events, ...queries } = renderTextInputWithToolkit({
    defaultValue: 'xxx',
  });

  const user = userEvent.setup();
  await user.type(queries.getByTestId('input'), 'ab');

  const eventNames = events.map((e) => e.name);
  expect(eventNames).toEqual([
    'pressIn',
    'focus',
    'pressOut',
    'keyPress',
    'change',
    'changeText',
    'selectionChange',
    'keyPress',
    'change',
    'changeText',
    'selectionChange',
    'endEditing',
    'blur',
  ]);

  expect(events).toMatchSnapshot('input: "ab", defaultValue: "xxx"');
});

test('userEvent.type with backspace', async () => {
  const { events, ...queries } = renderTextInputWithToolkit({
    defaultValue: 'xxx',
  });

  const user = userEvent.setup();
  await user.type(queries.getByTestId('input'), '{Backspace}a');

  const eventNames = events.map((e) => e.name);
  expect(eventNames).toEqual([
    'pressIn',
    'focus',
    'pressOut',
    'keyPress',
    'change',
    'changeText',
    'selectionChange',
    'keyPress',
    'change',
    'changeText',
    'selectionChange',
    'endEditing',
    'blur',
  ]);

  expect(events).toMatchSnapshot('input: "{Backspace}a", defaultValue: "xxx"');
});

test('userEvent.type with multiline', async () => {
  const { events, ...queries } = renderTextInputWithToolkit({
    multiline: true,
  });

  const user = userEvent.setup();
  await user.type(queries.getByTestId('input'), '{Enter}\n');

  const eventNames = events.map((e) => e.name);
  expect(eventNames).toEqual([
    'pressIn',
    'focus',
    'pressOut',
    'keyPress',
    'textInput',
    'change',
    'changeText',
    'selectionChange',
    'contentSizeChange',
    'keyPress',
    'textInput',
    'change',
    'changeText',
    'selectionChange',
    'contentSizeChange',
    'endEditing',
    'blur',
  ]);

  expect(events).toMatchSnapshot('input: "{Enter}\\n", multiline: true');
});

test('userEvent.type skips press events when `skipPress: true`', async () => {
  const { events, ...queries } = renderTextInputWithToolkit();

  const user = userEvent.setup();
  await user.type(queries.getByTestId('input'), 'a', {
    skipPress: true,
  });

  const eventNames = events.map((e) => e.name);
  expect(eventNames).not.toContainEqual('pressIn');
  expect(eventNames).not.toContainEqual('pressOut');
  expect(eventNames).toEqual([
    'focus',
    'keyPress',
    'change',
    'changeText',
    'selectionChange',
    'endEditing',
    'blur',
  ]);
});

test('userEvent.type triggers submit event with `submitEditing: true`', async () => {
  const { events, ...queries } = renderTextInputWithToolkit();

  const user = userEvent.setup();
  await user.type(queries.getByTestId('input'), 'a', {
    submitEditing: true,
  });

  const eventNames = events.map((e) => e.name);
  expect(eventNames).toEqual([
    'pressIn',
    'focus',
    'pressOut',
    'keyPress',
    'change',
    'changeText',
    'selectionChange',
    'submitEditing',
    'endEditing',
    'blur',
  ]);

  expect(events[7].name).toBe('submitEditing');
  expect(events[7].payload).toEqual({ nativeEvent: { text: 'a', target: 0 } });
});

test('userEvent.type should work when not all events have handlers', async () => {
  const { events, handleEvent } = createEventLogger();
  const screen = render(
    <TextInput
      testID="input"
      onChangeText={handleEvent('changeText')}
      onEndEditing={handleEvent('endEditing')}
    />
  );

  const user = userEvent.setup();
  await user.type(screen.getByTestId('input'), 'abc');

  const eventNames = events.map((e) => e.name);
  expect(eventNames).toEqual([
    'changeText',
    'changeText',
    'changeText',
    'endEditing',
  ]);

  expect(events).toMatchSnapshot('input: "abc"');
});

test('userEvent.type should NOT work on View', async () => {
  const screen = render(<View testID="input" />);

  const user = userEvent.setup();
  await expect(
    user.type(screen.getByTestId('input'), 'abc')
  ).rejects.toThrowErrorMatchingInlineSnapshot(
    `"type() works only with "TextInput" elements. Passed element has type "View"."`
  );
});

// View that ignores props type checking
const AnyView = View as React.ComponentType<any>;

test('userEvent.type should NOT bubble up', async () => {
  const parentHandler = jest.fn();
  const screen = render(
    <AnyView
      onChangeText={parentHandler}
      onChange={parentHandler}
      onKeyPress={parentHandler}
      onTextInput={parentHandler}
      onFocus={parentHandler}
      onBlur={parentHandler}
      onEndEditing={parentHandler}
      onPressIn={parentHandler}
      onPressOut={parentHandler}
    >
      <TextInput testID="input" />
    </AnyView>
  );

  const user = userEvent.setup();
  await user.type(screen.getByTestId('input'), 'abc');
  expect(parentHandler).not.toHaveBeenCalled();
});

test.each(['modern', 'legacy'])('works with %s fake timers', async (type) => {
  jest.useFakeTimers({ legacyFakeTimers: type === 'legacy' });
  const { events, ...queries } = renderTextInputWithToolkit();

  const user = userEvent.setup();
  await user.type(queries.getByTestId('input'), 'abc');

  const eventNames = events.map((e) => e.name);
  expect(eventNames).toEqual([
    'pressIn',
    'focus',
    'pressOut',
    'keyPress',
    'change',
    'changeText',
    'selectionChange',
    'keyPress',
    'change',
    'changeText',
    'selectionChange',
    'keyPress',
    'change',
    'changeText',
    'selectionChange',
    'endEditing',
    'blur',
  ]);
});
