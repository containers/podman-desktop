import type { ContextInfo, IContext } from '../../../../main/src/plugin/api/context-info';

export class ContextUI implements IContext {
  private _value: Record<string, any>;

  constructor(private _id: number, private _parent: ContextUI | null, private _extension: string | null) {
    this._value = Object.create(null);
  }

  get id(): number {
    return this._id;
  }

  get extension(): string | null {
    return this._extension;
  }

  get value(): Record<string, any> {
    return { ...this._value };
  }

  setValue(key: string, value: any): boolean {
    if (this._value[key] !== value) {
      this._value[key] = value;
      return true;
    }
    return false;
  }

  removeValue(key: string): boolean {
    if (key in this._value) {
      delete this._value[key];
      return true;
    }
    return false;
  }

  getValue<T>(key: string): T | undefined {
    const ret = this._value[key];
    if (typeof ret === 'undefined' && this._parent) {
      return this._parent.getValue<T>(key);
    }
    return ret;
  }

  updateParent(parent: ContextUI): void {
    this._parent = parent;
  }

  collectAllValues(): Record<string, any> {
    let result = this._parent ? this._parent.collectAllValues() : Object.create(null);
    result = { ...result, ...this._value };
    return result;
  }

  dispose(): void {
    this._parent = null;
  }

  static adaptContext(ctx: ContextInfo, parent: ContextUI | null): ContextUI {
    return new ContextUI(ctx.id, parent, ctx.extension);
  }
}
