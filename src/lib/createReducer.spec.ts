import { createAction } from './createAction';
import { createReducer, on } from './createReducer';

it('creates a function that maps the current state and an action to a new state', () => {
  const increment = createAction('increment');
  const reducer = createReducer(
    { count: 0 },
    on(increment, ({ count }) => ({ count: count + 1 })),
  );

  const result = reducer({ count: 10 }, increment());

  expect(result).toEqual({ count: 11 });
});

it('uses the initial state if the current state is undefined', () => {
  const toggle = createAction('toggle');
  const reducer = createReducer(
    { flag: false },
    on(toggle, ({ flag }) => ({ flag: !flag })),
  );

  const result = reducer(undefined, toggle());

  expect(result).toEqual({ flag: true });
});

it('returns the current state if the reducer does not know the action', () => {
  const start = createAction('start');
  const restart = createAction('restart');
  const reducer = createReducer(
    { running: false, active: -1 },
    on(start, () => ({ running: true, active: 0 })),
  );

  const currentState = reducer(undefined, start());
  const result = reducer(currentState, restart());

  expect(result).toEqual({ running: true, active: 0 });
});

it('can create a reducer that does not mutate any state', () => {
  const jump = createAction('jump');
  const reducer = createReducer({ count: 0 });

  const result = reducer(undefined, jump());

  expect(result).toEqual({ count: 0 });
});

it('can listen to several actions', () => {
  const moveLeft = createAction('moveLeft');
  const moveRight = createAction('moveRight');
  const restart = createAction('restart');
  const reducer = createReducer(
    { x: 0 },
    on(moveLeft, ({ x }) => ({ x: x - 1 })),
    on(moveRight, ({ x }) => ({ x: x + 1 })),
    on(restart, () => ({ x: 0 })),
  );

  let state = reducer(undefined, moveLeft());
  state = reducer(state, moveLeft());
  state = reducer(state, moveLeft());
  state = reducer(state, restart());
  state = reducer(state, moveLeft());
  state = reducer(state, moveRight());
  state = reducer(state, moveRight());
  state = reducer(state, restart());
  state = reducer(state, moveRight());
  state = reducer(state, moveRight());
  state = reducer(state, moveLeft());

  expect(state).toEqual({ x: 1 });
});

it('uses the last callback if more than one callback is registered for the same action', () => {
  const add = createAction('add');
  const reducer = createReducer<{ items: number[] }>(
    { items: [] },
    on(add, (state) => ({ ...state, items: [] })),
    on(add, () => ({ items: [NaN] })),
    on(add, ({ items }) => ({ items: [...items, items.length] })),
  );

  let state = reducer(undefined, add());
  state = reducer(state, add());
  state = reducer(state, add());

  expect(state).toEqual({ items: [0, 1, 2] });
});

it('creates a reducer that accepts actions with props', () => {
  const move = createAction<{ x: number; y: number }>('move');
  const reducer = createReducer(
    { x: 0, y: 0 },
    on(move, (_state, { x, y }) => ({ x, y })),
  );

  const result = reducer(undefined, move({ x: 20, y: 11 }));

  expect(result).toEqual({ x: 20, y: 11 });
});

it('keeps track of all the action creators that is related to', () => {
  const toGreen = createAction('toGreen');
  const toRed = createAction('toRed');
  const toBlue = createAction('toBlue');

  const reducer = createReducer(
    { color: 'black' },
    on(toGreen, () => ({ color: 'green' })),
    on(toRed, () => ({ color: 'red' })),
    on(toBlue, () => ({ color: 'blue' })),
  );

  expect(reducer.actions).toEqual([toGreen, toRed, toBlue]);
});

it('keeps track of all the action creators that is related to even nested ones', () => {
  const toGreen = createAction('toGreen');
  const toPurple = createAction('toPurple');
  const toPink = createAction('toPink');
  const toOrange = createAction('toOrange');
  const toBlue = createAction('toBlue');

  const reducer = createReducer(
    { color: 'black' },
    on(toGreen, () => ({ color: 'green' })),
    on([toPurple, toPink, toOrange], () => ({ color: 'red' })),
    on(toBlue, () => ({ color: 'blue' })),
  );

  expect(reducer.actions).toEqual([
    toGreen,
    toPurple,
    toPink,
    toOrange,
    toBlue,
  ]);
});

it('can register a single callback for several actions', () => {
  // Reducer composition example
  type ProductsState = { milk: number; chair: number; blanket: number };
  const addMilk = createAction('addMilk');
  const addChair = createAction('addChair');
  const addBlanket = createAction('addBlanket');
  const productsReducer = createReducer<ProductsState>(
    { milk: 0, chair: 0, blanket: 0 },
    on(addMilk, (state) => ({ ...state, milk: state.milk + 1 })),
    on(addChair, (state) => ({ ...state, chair: state.chair + 1 })),
    on(addBlanket, (state) => ({ ...state, blanket: state.blanket + 1 })),
  );
  const rootReducer = createReducer<{ products?: ProductsState }>(
    { products: undefined },
    on(productsReducer.actions, (state, action) => ({
      ...state,
      products: productsReducer(state.products, action),
    })),
  );

  let state = rootReducer(undefined, addMilk());
  state = rootReducer(state, addBlanket());
  state = rootReducer(state, addChair());
  state = rootReducer(state, addBlanket());
  state = rootReducer(state, addChair());
  state = rootReducer(state, addBlanket());

  expect(state).toEqual({ products: { milk: 1, chair: 2, blanket: 3 } });
});

it('can register a single callback for several actions with different props', () => {
  // Reducer composition example
  type ProductsState = { milk: number; chair: number; blanket: number };
  const addMilk = createAction<{ units: number }>('addMilk');
  const addChair = createAction<{ amount: number }>('addChair');
  const addBlanket = createAction('addBlanket');
  const productsReducer = createReducer<ProductsState>(
    { milk: 0, chair: 0, blanket: 0 },
    on(addMilk, (state, { units }) => ({ ...state, milk: state.milk + units })),
    on(addChair, (state, { amount }) => ({
      ...state,
      chair: state.chair + amount,
    })),
    on(addBlanket, (state) => ({ ...state, blanket: state.blanket + 1 })),
  );
  const rootReducer = createReducer<{ products?: ProductsState }>(
    { products: undefined },
    on(productsReducer.actions, (state, action) => ({
      ...state,
      products: productsReducer(state.products, action),
    })),
  );

  let state = rootReducer(undefined, addMilk({ units: 10 }));
  state = rootReducer(state, addBlanket());
  state = rootReducer(state, addChair({ amount: 5 }));
  state = rootReducer(state, addBlanket());
  state = rootReducer(state, addChair({ amount: 2 }));
  state = rootReducer(state, addBlanket());

  expect(state).toEqual({ products: { milk: 10, chair: 7, blanket: 3 } });
});
