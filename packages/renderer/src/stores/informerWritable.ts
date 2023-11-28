import type { Invalidator, StartStopNotifier, Subscriber, Unsubscriber, Writable } from 'svelte/store';
import { writable } from 'svelte/store';

/** Writable interface for both updating and subscribing. */
export interface InformerWritable<T> extends Writable<T> {
  /**
   * Get the active informer id
   */
  getInformerId(): number | undefined;
}

export function customWritable<T>(
  value: T,
  startInformer?: () => Promise<number>,
  start?: StartStopNotifier<T>,
): InformerWritable<T> {
  let informer: number | undefined;
  const origWritable = writable(value, start);

  function subscribe(this: void, run: Subscriber<T>, invalidate?: Invalidator<T>): Unsubscriber {
    startInformer?.()
      .then(id => (informer = id))
      .catch((e: unknown) => console.error(e));
    const unsubscriber = origWritable.subscribe(run, invalidate);
    return () => {
      if (informer) {
        window.stopInformer(informer);
        informer = undefined;
      }
      unsubscriber();
    };
  }

  function getInformerId(): number | undefined {
    return informer;
  }

  return { set: origWritable.set, update: origWritable.update, getInformerId, subscribe };
}
