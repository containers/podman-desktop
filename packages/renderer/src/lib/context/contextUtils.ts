import { ContextUI } from '/@/lib/context/context';

function getObjectProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

export function transformObjectToContext<T>(obj: T, prefix: string | undefined = undefined): ContextUI {
  // Transform our generic object as context
  const context = new ContextUI();
  for (const key in obj) {
    context.setValue(prefix ? `${prefix}:${key}` : key, getObjectProperty(obj, key as keyof T));
  }
  return context;
}
