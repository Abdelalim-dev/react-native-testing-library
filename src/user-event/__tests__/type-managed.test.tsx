import * as React from 'react';
import { TextInput } from 'react-native';
import { createEventLogger } from '../../test-utils/events';
import { render } from '../..';
import { userEvent } from '..';

beforeEach(() => {
  jest.useRealTimers();
  jest.clearAllMocks();
});

interface ManagedTextInputProps {
  valueTransformer?: (text: string) => string;
  handleEvent: (name: string) => (event: any) => void;
  initialValue?: string;
}

function ManagedTextInput({
  handleEvent,
  valueTransformer,
  initialValue = '',
}: ManagedTextInputProps) {
  const [value, setValue] = React.useState(initialValue);

  const handleChangeText = (text: string) => {
    handleEvent('changeText')(text);
    const newValue = valueTransformer?.(text) ?? text;
    setValue(newValue);
  };

  return (
    <TextInput
      testID="input"
      value={value}
      onChangeText={handleChangeText}
      onFocus={handleEvent('focus')}
      onBlur={handleEvent('blur')}
      onPressIn={handleEvent('pressIn')}
      onPressOut={handleEvent('pressOut')}
      onChange={handleEvent('change')}
      onKeyPress={handleEvent('keyPress')}
      onTextInput={handleEvent('textInput')}
      onSelectionChange={handleEvent('selectionChange')}
      onSubmitEditing={handleEvent('submitEditing')}
      onEndEditing={handleEvent('endEditing')}
      onContentSizeChange={handleEvent('contentSizeChange')}
    />
  );
}

test('userEvent.type on managed TextInput', async () => {
  jest.spyOn(Date, 'now').mockImplementation(() => 100100100100);
  const { events, handleEvent } = createEventLogger();
  const screen = render(<ManagedTextInput handleEvent={handleEvent} />);

  const user = userEvent.setup();
  await user.type(screen.getByTestId('input'), 'Wow');

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

  expect(events).toMatchSnapshot('input: "Wow"');
});

test('userEvent.type on rejecting TextInput', async () => {
  jest.spyOn(Date, 'now').mockImplementation(() => 100100100100);
  const { events, handleEvent } = createEventLogger();
  const screen = render(
    <ManagedTextInput
      initialValue="XXX"
      handleEvent={handleEvent}
      valueTransformer={() => 'XXX'}
    />
  );

  const user = userEvent.setup();
  await user.type(screen.getByTestId('input'), 'ABC');

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

  expect(events).toMatchSnapshot('input: "ABC", value: "XXX"');
});
