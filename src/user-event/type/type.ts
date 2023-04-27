import { ReactTestInstance } from 'react-test-renderer';
import { getConfig } from '../../config';
import { EventBuilder } from '../event-builder';
import { ErrorWithStack } from '../../helpers/errors';
import { UserEventInstance } from '../setup';
import {
  dispatchHostEvent,
  wait,
  getTextRange,
  getTextContentSize,
} from '../utils';

import { parseKeys } from './parseKeys';

export interface TypeOptions {
  skipPress?: boolean;
  submitEditing?: boolean;
}

export async function type(
  this: UserEventInstance,
  element: ReactTestInstance,
  text: string,
  options?: TypeOptions
): Promise<void> {
  if (element.type !== getConfig().hostComponentNames?.textInput) {
    throw new ErrorWithStack(
      `type() works only with "TextInput" elements. Passed element has type "${element.type}".`,
      type
    );
  }

  const keys = parseKeys(text);

  if (options?.skipPress !== true) {
    await wait(this.config);
    dispatchHostEvent(element, 'pressIn', EventBuilder.Common.touch());
  }

  await wait(this.config);
  dispatchHostEvent(element, 'focus', EventBuilder.Common.focus());

  if (options?.skipPress !== true) {
    dispatchHostEvent(element, 'pressOut', EventBuilder.Common.touch());
  }

  let currentText = element.props.value ?? element.props.defaultValue ?? '';
  for (const key of keys) {
    const previousText = element.props.value ?? currentText;
    currentText = applyKey(previousText, key);

    await wait(this.config);
    emitTypingEvents(element, key, currentText, previousText);
  }

  const finalText = element.props.value ?? currentText;

  if (options?.submitEditing === true) {
    await wait(this.config);
    dispatchHostEvent(
      element,
      'submitEditing',
      EventBuilder.TextInput.submitEditing(finalText)
    );
  }

  await wait(this.config);
  dispatchHostEvent(
    element,
    'endEditing',
    EventBuilder.TextInput.endEditing(finalText)
  );
  dispatchHostEvent(element, 'blur', EventBuilder.Common.blur());
}

async function emitTypingEvents(
  element: ReactTestInstance,
  key: string,
  currentText: string,
  previousText: string
) {
  const isMultiline = element.props.multiline === true;

  dispatchHostEvent(element, 'keyPress', EventBuilder.TextInput.keyPress(key));

  if (isMultiline) {
    dispatchHostEvent(
      element,
      'textInput',
      EventBuilder.TextInput.textInput(currentText, previousText)
    );
  }

  dispatchHostEvent(
    element,
    'change',
    EventBuilder.TextInput.change(currentText)
  );

  dispatchHostEvent(element, 'changeText', currentText);

  const selectionRange = getTextRange(currentText);
  dispatchHostEvent(
    element,
    'selectionChange',
    EventBuilder.TextInput.selectionChange(selectionRange)
  );

  if (isMultiline) {
    const contentSize = getTextContentSize(currentText);
    dispatchHostEvent(
      element,
      'contentSizeChange',
      EventBuilder.TextInput.contentSizeChange(contentSize)
    );
  }
}

function applyKey(text: string, key: string) {
  if (key === 'Enter') {
    return `${text}\n`;
  }

  if (key === 'Backspace') {
    return text.slice(0, -1);
  }

  return text + key;
}
