# react-hooks-simple-global-state

Simple global state for React with Hooks, which just depends on React's `useEffect` and `useState`.

The idea here is simply to create a kind of `useState` that shares the information between all the different components that use the same `stateName`. For this, only the state and lifecycle control of React components with Hooks, associated with the Observer pattern, is used to synchronize the update of all independent states.

## Interface

```ts
useGlobalState = (stateName: string, initValue?: Value, listening?: boolean = true) => [Value, FuncSetValue];
```

Note that the structure is very similar to React's `useState`, but here we need to inform the `stateName` so we can distinguish which global state we want to use.

One important thing that can be noticed about `initValue`, is that it can have different values in each use of `useGlobalState`, but only one of them will actually be used, and that will be the one executed first during the rendering of React, that is, it follows the order of the component tree. But you don't have to worry about that, as there are ways to make it even easier, with the following examples.

The `listening` parameter can be set to `false` when you don't want to receive state updates. This can be useful when you just want to access the information, for example when you just need to access the `FuncSetValue` function, this prevents the current component from being updated unnecessarily.

## Examples of use

You can use it in the simplest and most direct way:
```jsx
import React from 'react';
import { useGlobalState } from 'react-hooks-simple-global-state';

const TabNavigation = () => {
  const [activeTab, setActiveTab] = useGlobalState('activeTab', 3);

  return (
    <>
      <button onClick={() => setActiveTab(activeTab - 1)} type="button">Previous tab</button>
      {activeTab}
      <button onClick={() => setActiveTab(activeTab + 1)} type="button">Next tab</button>
    </>
  );
};

export default TabNavigation;
```

To avoid having to repeat over and over or use constants for `stateName` or to not have difficulties with `initValue`, you can centralize this information in a single function:
```jsx
// ...
const useActiveTab = () => useGlobalState('activeTab', 3);

const TabNavigation = () => {
  const [activeTab, setActiveTab] = useActiveTab();
  // ...
};
```

Another alternative to not having to worry about `initValue` is to use `useEffect`, as this guarantees the expected value in the global state:
```jsx
import React, { useEffect } from 'react';
import useGlobalState from 'react-hooks-simple-global-state';

const TabNavigation = ({ initTab }) => {
  const [activeTab, setActiveTab] = useGlobalState('activeTab');

  useEffect(() => initTab && setActiveTab(initTab), []);

  if (activeTab == null) return 'Loading...';
  // ...
};
```
