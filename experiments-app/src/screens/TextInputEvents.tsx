import * as React from 'react';
import { StyleSheet, SafeAreaView, TextInput } from 'react-native';
import { buildEventLogger, logEvent } from '../utils/helpers';

const handlePressIn = buildEventLogger('pressIn');
const handlePressOut = buildEventLogger('pressOut');
const handleFocus = buildEventLogger('focus');
const handleBlur = buildEventLogger('blur');
const handleChange = buildEventLogger('change');
const handleSubmitEditing = buildEventLogger('submitEditing');
const handleKeyPress = buildEventLogger('keyPress');
const handleTextInput = buildEventLogger('textInput');
const handleSelectionChange = buildEventLogger('selectionChange');

export function TextInputEvents() {
  const [value, setValue] = React.useState('');

  const handleChangeText = (value: string) => {
    setValue(value);
    logEvent('changeText', value);
  };

  return (
    <SafeAreaView style={styles.container}>
      <TextInput
        style={styles.textInput}
        value={value}
        editable={true}
        onChangeText={handleChangeText}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onChange={handleChange}
        onSubmitEditing={handleSubmitEditing}
        onSelectionChange={handleSelectionChange}
        onKeyPress={handleKeyPress}
        onTextInput={handleTextInput}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  textInput: {
    backgroundColor: 'white',
    margin: 20,
    padding: 8,
    fontSize: 18,
    borderWidth: 1,
    borderColor: 'grey',
  },
});
