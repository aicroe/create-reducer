import { Action, ActionProps, AnyAction } from './action'
import {
  ActionCreator,
  AnyActionCreator,
  ActionCreatorMetadata,
} from './createAction'
import { Reducer } from './reducer'

type ActionCreatorWithMetadata<P> = ActionCreator<P> & ActionCreatorMetadata
type AnyActionCreatorWithMetadata = AnyActionCreator & ActionCreatorMetadata

export type ReducerMetadata = { actions: AnyActionCreatorWithMetadata[] }

export type OnReducer<S, A> = (state: S, action: A) => S

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type On<S, P = any> = {
  reducer: OnReducer<S, Action & ActionProps<P>>
  actions: AnyActionCreatorWithMetadata[]
}

function getReducerMap<S>(...ons: On<S>[]): Record<string, OnReducer<S, AnyAction>> {
  return ons.reduce<Record<string, OnReducer<S, AnyAction>>>(
    (reducerMap, { actions, reducer }) => ({
      ...reducerMap,
      ...actions.reduce<Record<string, OnReducer<S, AnyAction>>>(
        (innerMap, actionCreator) => ({ ...innerMap, [actionCreator.type]: reducer }),
        { },
      ),
    }),
    { },
  )
}

function getOnsActionCreators<S>(ons: On<S>[]): AnyActionCreatorWithMetadata[] {
  return ons.reduce<AnyActionCreatorWithMetadata[]>(
    (actions, eachOn) => {
      actions.push(...eachOn.actions)
      return actions
    },
    [],
  )
}

export function createReducer<S>(
  initialState: S,
  ...ons: On<S>[]
): Reducer<S, AnyAction> & ReducerMetadata {
  const reducerMap = getReducerMap<S>(...ons)

  const rootReducer: Reducer<S, AnyAction> = (state = initialState, action) => {
    const reducer = reducerMap[action.type]
    return reducer ? reducer(state, action) : state
  }

  return Object.defineProperty(rootReducer, 'actions', {
    value: getOnsActionCreators(ons),
    writable: false,
  }) as Reducer<S, AnyAction> & ReducerMetadata
}

export function on<S, P>(
  actionCreator: ActionCreatorWithMetadata<P>,
  reducer: OnReducer<S, Action & ActionProps<P>>,
): On<S, P>
export function on<S, P>(
  actionCreators: ActionCreatorWithMetadata<P>[],
  reducer: OnReducer<S, Action & ActionProps<P>>,
): On<S, P>
export function on<S>(
  actionCreators: AnyActionCreatorWithMetadata[],
  reducer: OnReducer<S, AnyAction>,
): On<S>
export function on<S, P>(
  actionCreator: AnyActionCreatorWithMetadata | AnyActionCreatorWithMetadata[],
  reducer: OnReducer<S, Action & ActionProps<P>>,
): On<S, P> {
  if (Array.isArray(actionCreator)) {
    const actions = actionCreator
    return { reducer, actions }
  }
  return { reducer, actions: [actionCreator] }
}
