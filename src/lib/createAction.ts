import { Action, ActionProps } from './action';

export type ActionCreatorMetadata<T = string> = { type: T };
export type ActionCreator<P, T = string> = (
  props: P,
) => Action<T> & ActionProps<P>;
export type ActionCreatorWithoutProps<T = string> = () => Action<T>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyActionCreator = ActionCreator<any, any>;

export function createAction<T>(
  type: T,
): ActionCreatorWithoutProps<T> & ActionCreatorMetadata<T>;
export function createAction<P, T = string>(
  type: T,
): ActionCreator<P, T> & ActionCreatorMetadata<T>;
export function createAction<P, T = string>(
  type: T,
): ActionCreator<P, T> & ActionCreatorMetadata<T> {
  const creator = <U>(props?: U) => ({ type, ...props });
  return Object.defineProperty(creator, 'type', {
    value: type,
    writable: false,
  }) as ActionCreator<P, T> & ActionCreatorMetadata<T>;
}
