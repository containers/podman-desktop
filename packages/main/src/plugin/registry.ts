import type { Disposable } from './types/disposable.js';

/**
 * Registry is an abstract class representing a registry pattern for managing
 * items with unique identifiers.
 *
 * @typeparam T - The type of items to be registered, must have a partial
 * property `id` of type `E`.
 * @typeparam E - The type of unique identifiers used to register and unregister
 * items.
 *
 * @remarks
 * This class serves as a foundation for creating registries that can be used
 * to manage collections of items with unique identifiers. Subclasses should
 * implement the `register` and `unregister` methods to define how items are
 * added to and removed from the registry.
 */
export abstract class Registry<T extends Partial<{ id: E }>, E> {
  /**
   * Registers an item into the registry.
   *
   * @param item - The item to be registered. It must have a partial property
   * `id` of type `E` to uniquely identify the item.
   * @returns A Disposable object that can be used to unregister the item
   * from the registry and dispose of associated resources.
   *
   * @remarks
   * Subclasses must implement this method to define how items are added to the
   * registry.
   */
  abstract register(item: T): Disposable;

  /**
   * Unregisters an item from the registry based on its unique identifier.
   *
   * @param id - The unique identifier of the item to be unregistered.
   *
   * @remarks
   * Subclasses must implement this method to define how items are removed
   * from the registry.
   */
  abstract unregister(id: E): void;
}
