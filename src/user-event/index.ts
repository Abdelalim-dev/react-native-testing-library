import { ReactTestInstance } from 'react-test-renderer';
import { setup } from './setup';
import { TypeOptions } from './type';

export const userEvent = {
  setup,

  // Direct access for User Event v13 compatibility
  press: (element: ReactTestInstance) => setup().press(element),
  type: (element: ReactTestInstance, text: string, options?: TypeOptions) =>
    setup().type(element, text, options),
};
