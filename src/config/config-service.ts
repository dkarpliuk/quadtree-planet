interface Warmable {
  warm(): Promise<void>;
}

//every service registers here on construction, so one pass warms them all
const registry: Warmable[] = [];

/**
 * Load every config domain once, up front.
 * Each realm (main thread and each worker) warms only the domains its bundle imported.
 * Call before reading any `value`.
 */
export const warmConfig = async () =>
  await Promise.all(registry.map(service => service.warm()));

/**
 * Domain-scoped config, where `T` is the domain's shape.
 * Async `warm`: a single startup load (future: IndexedDB overrides),
 * then a synchronous `value`, so consumers stay sync past startup.
 */
export class ConfigService<T> {
  private readonly _defaults: T;
  private _value?: T;

  constructor(defaults: T) {
    this._defaults = defaults;
    registry.push(this);
  }

  async warm(): Promise<void> {
    this._value = this._defaults;
  }

  get value(): T {
    if (this._value == null)
      throw new Error('config read before warm()');

    return this._value;
  }
}
