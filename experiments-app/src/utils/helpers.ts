import { NativeSyntheticEvent } from 'react-native/types';

export function buildEventLogger(name: string) {
  return (event: NativeSyntheticEvent<unknown>) => {
    const payload = event?.nativeEvent ?? event;
    logEvent(name, payload);
  };
}

export function logEvent(name: string, payload: unknown) {
  console.log(`Event: ${name}`, payload);

  queueMicrotask(() => {
    console.log(` - ${name} (microtask)`);
  });

  setTimeout(() => {
    console.log(` - ${name} (macrotask)`);
  }, 0);
}
