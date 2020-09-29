declare module "redux-bundler" {

  interface CreateSelector {
    <State, I, O>(n1: string, f: (inn: I) => O): (state: State) => O,
    <State, I1, I2, O>(n1: string, n2: string, f: (i1: I1, i2: I2) => O): (state: State) => O
    <State, I1, I2, I3, O>(n1: string, n2: string, n3: string, f: (i1: I1, i2: I2, i3: I3) => O): (state: State) => O
    <State, I1, I2, I3, I4, O>(n1: string, n2: string, n3: string, n4: string, f: (i1: I1, i2: I2, i3: I3, i4: I4) => O): (state: State) => O
    <State, I1, I2, I3, I4, I5, O>(n1: string, n2: string, n3: string, n4: string, n5: string, f: (i1: I1, i2: I2, i3: I3, i4: I4, i5: I5) => O): (state: State) => O

    <State, I1, O>(s1: (state: State) => I1, f: (inn: I1) => O): (state: State) => O,
    <State, I1, I2, O>(s1: (state: State) => I1, s2: (state: State) => I2, f: (i1: I1, i2: I2) => O): (state: State) => O
    <State, I1, I2, I3, O>(s1: (state: State) => I1, s2: (state: State) => I2, s3: (state: State) => I3, f: (i1: I1, i2: I2, i3: I3) => O): (state: State) => O
    <State, I1, I2, I3, I4, O>(s1: (state: State) => I1, s2: (state: State) => I2, s3: (state: State) => I3, s4: (state: State) => I4, f: (i1: I1, i2: I2, i3: I3, i4: I4) => O): (state: State) => O
    <State, I1, I2, I3, I4, I5, O>(s1: (state: State) => I1, s2: (state: State) => I2, s3: (state: State) => I3, s4: (state: State) => I4, s5: (state: State) => I5, f: (i1: I1, i2: I2, i3: I3, i4: I4, i5: I5) => O): (state: State) => O
  }

  declare export var createSelector: CreateSelector

  export type Selector<State, Data> =
    (state: State) => Data

  type Action = { type: string }



  export type BaseStore<State, Message extends Action> = {
    getState(): State
    dispatch(message: Message): void

    destroy(): void
  }

  export type Store<State, Message extends Action, Ext = {}> = {
    getState(): State
    dispatch(message: Message): void
    subscribeToSelectors(selectors: string[], callback: (any) => void | (() => void)): void

    destroy(): void
  } & Ext


  export type Context<State, Message extends Action, Ext, Extra = {}> = {
    getState(): State
    dispatch(message: Message): void
    store: Store<State, Message, Ext>
  } & Extra

  export type Reducer<State, Message> =
    (state?: State, message: Message) => State

  export type BundleInit<State, Messag extends Action, Ext = {}> =
    (store: Store<State, Message, Ext>) => void | (() => void)

  export type Bundle<State, Message extends Action, Ext = {}, Extra = never> = {
    name: string
    reducer?: Reducer<State, Message>
    getReducer?: () => Reducer<State, Message>
  }


  export type Selectors<T> = {
    [K in keyof T]: T[K] extends Selector<any, infer D>
    ? () => D
    : never
  }

  export type Actions<T> = {
    [K in keyof T]: (...args: ParamsType<T[K]>) => ReturnType<ReturnType<T[K]>>
  }
}