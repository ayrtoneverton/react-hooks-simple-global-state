import { useEffect, useState } from 'react';

type ValueOrFunc<T> = T | ((currentValue: T) => T);

type FuncSetValue<T> = (newValueOrFunc: ValueOrFunc<T>) => void;

type FuncStateListener = (f: ((v: boolean) => boolean)) => void;

interface State<T> {
  value: T;
  statesListening: Set<(FuncStateListener)>;
  set: FuncSetValue<T>;
}

interface GlobalState {
  [stateName: string]: State<any>;
}

const globalState: GlobalState = {};

const funcToggleValue = (v: boolean) => !v;

export const useGlobalState = <T>(
  stateName: string,
  initValue?: T,
  listening = true,
): [currentValue: T, setValue: FuncSetValue<T>] => {
  const [, setToggleState] = useState(false);
  let state: State<T> = globalState[stateName];

  if (!state) {
    state = {
      value: initValue as T,
      statesListening: new Set<FuncStateListener>(),
      set(newValue: ValueOrFunc<T>): void {
        // I'm not sending the value directly to each state as this generates unnecessary rendering.
        const oldValue = state.value;
        state.value = newValue instanceof Function ? newValue(oldValue) : newValue;

        if (state.value !== oldValue) {
          state.statesListening.forEach((setState) => setState(funcToggleValue));
        }
      },
    };
    globalState[stateName] = state;
  }

  if (listening) state.statesListening.add(setToggleState);

  useEffect(() => {
    if (listening) state.statesListening.add(setToggleState);

    return () => { state.statesListening.delete(setToggleState); };
  }, [state.statesListening, listening]);

  return [state.value, state.set];
};

export default useGlobalState;

interface AsyncData<T> {
  loading: boolean,
  data?: T,
  error?: any,
  refetch: () => void,
}

interface InternalAsyncData<T> extends AsyncData<T> {
  initialized?: boolean,
}

const getInitAsyncData = <T>(): InternalAsyncData<T> => ({
  loading: true,
  refetch: () => {},
});

export const useAsyncGlobalState = <T>(
  stateName: string,
  funcLoadAsyncData?: () => Promise<T>,
): AsyncData<T> => {
  const [asyncData, setAsyncData] = useGlobalState(`async_${stateName}`, getInitAsyncData<T>());

  useEffect(() => {
    if (asyncData.initialized || !funcLoadAsyncData) return;
    asyncData.initialized = true;

    const newAsyncData = {
      loading: false,
      initialized: true,
      refetch: () => setAsyncData(getInitAsyncData()),
    };
    funcLoadAsyncData()
      .then((data) => setAsyncData({ ...newAsyncData, data }))
      .catch((error) => setAsyncData({ ...newAsyncData, error }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [asyncData.initialized]);

  return asyncData;
};
