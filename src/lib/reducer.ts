import { Action, AnyAction } from './action';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Reducer<S = any, A extends Action = AnyAction> = (
  state: S | undefined,
  action: A,
) => S;
