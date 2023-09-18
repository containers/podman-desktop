function isSerializable(value: any): boolean {
  switch (typeof value) {
    case 'string':
    case 'number':
    case 'boolean':
    case 'object':
      return true;
    default:
      return false;
  }
}

// Does not support circular properties
export function removeNonSerializableProperties<T>(obj: T): T {
  if (typeof obj !== 'object' || obj === undefined) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.reduce((previousValue, currentValue) => {
      if (isSerializable(currentValue)) return [...previousValue, removeNonSerializableProperties(currentValue)];
      return previousValue;
    }, []);
  }

  const result: Partial<T> = {};

  for (const key in obj) {
    if (isSerializable(obj[key])) {
      result[key] = removeNonSerializableProperties(obj[key]);
    }
  }

  return result as T;
}
