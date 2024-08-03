import { act } from '@testing-library/react';

export const click = (selector: string, clickCount = 1, element: HTMLElement = document.body) => {
  const actFunc = () => {
    element.querySelector(selector)?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  };
  for (let i = 0; i < clickCount; i += 1) {
    act(actFunc);
  }
};

export const sleep = (ms = 20) => act(() => new Promise<void>((resolve) => {
  setTimeout(resolve, ms);
}));

export default click;
