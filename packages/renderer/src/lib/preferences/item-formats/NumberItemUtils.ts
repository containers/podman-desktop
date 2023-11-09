import type { IConfigurationPropertyRecordedSchema } from '../../../../../main/src/plugin/configuration-registry';

export interface NumericValue {
  valid: boolean;
  error?: string;
}

export function checkNumericValueValid(record: IConfigurationPropertyRecordedSchema, value: number): NumericValue {
  if (isNaN(value)) {
    return {
      valid: false,
      error: `Expecting a number. The value cannot be less than ${record.minimum}${
        record.maximum ? ` or greater than ${record.maximum}` : ''
      }`,
    };
  }
  if (record.maximum && typeof record.maximum === 'number' && value > record.maximum) {
    return {
      valid: false,
      error: `The value cannot be greater than ${record.maximum}`,
    };
  }
  if (record.minimum && typeof record.minimum === 'number' && value < record.minimum) {
    return {
      valid: false,
      error: `The value cannot be less than ${record.minimum}`,
    };
  }
  return {
    valid: true,
  };
}
