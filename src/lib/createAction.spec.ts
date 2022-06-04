import { createAction } from './createAction';

it('has the "type" property defined', () => {
  const getRabbit = createAction('getRabbit');

  expect(getRabbit.type).toBe('getRabbit');
});

it('can set up a creator with no props', () => {
  const launchCarrot = createAction('launchCarrot');

  const action = launchCarrot();

  expect(action).toEqual({ type: 'launchCarrot' });
});

it('can set up a creator with props', () => {
  const deliverKick = createAction<{ strength: number }>('deliverKick');

  const action = deliverKick({ strength: 100 });

  expect(action).toEqual({ type: 'deliverKick', strength: 100 });
});
