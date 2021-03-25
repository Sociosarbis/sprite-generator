import { useReducer } from 'react';

type State = { show: boolean; progress: number };
type Payload =
  | {
      type: 'SET_VISIBILITY';
      value: boolean;
    }
  | {
      type: 'SET_PROGRESS';
      value: number;
    };

export default function useProgress(
  initialState: State = { show: false, progress: 0 },
) {
  const [state, dispatch] = useReducer((state: State, payload: Payload) => {
    switch (payload.type) {
      case 'SET_VISIBILITY':
        return { ...state, show: payload.value };
      case 'SET_PROGRESS':
        return { ...state, progress: payload.value };
    }
  }, initialState);
  return {
    state,
    dispatch,
  };
}
