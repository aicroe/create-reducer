export interface Action<T = any> {
  type: T
}

export type ActionProps<P> = {
  [T in keyof P]: P[T]
}

export interface AnyAction extends Action {
  [extraProps: string]: any
}
