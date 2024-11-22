// This file exports default data values as named types to mimic TypeScript-like type checking
// Each export provides both a default value and type information for schema validation

import { Database } from './database';

// === STRING === //
export const string = '';

// === NUMBER === //
export const number = 0;

// === BOOLEAN === //
export const boolean = false;

// === NULL === //
export const nullValue = null;

// === UNDEFINED === //
export const undefinedValue = undefined;

// === ARRAY === //
export const array = [];

// === OBJECT === //
export const object = {};

// === JSON === //
export const json = '{}';

// === DATE === //
export const date = new Date();

// === FUNCTION === //
export const func = () => {};

// === SYMBOL === //
export const symbol = Symbol();

// === BIGINT === //
export const bigint = BigInt(0);

// === REGEXP === //
export const regexp = /./;

// === SPECIALIZED TYPES === //

// Email type with basic format
export const email = 'user@example.com';

// URL type with basic format
export const url = 'https://example.com';

// UUID v4 format
export const uuid = '00000000-0000-0000-0000-000000000000';

// ISO Date string
export const isoDate = '2024-01-01T00:00:00.000Z';

// Phone number format
export const phone = '+1-234-567-8900';

// Currency amount
export const currency = '0.00';

// === COMPOSITE TYPES === //

// Key-value pair
export const keyValue = {
  key: string,
  value: string,
};

// Generic list item
export const listItem = {
  id: string,
  value: string,
  selected: boolean,
};

// Pagination metadata
export const pagination = {
  page: number,
  limit: number,
  total: number,
  hasMore: boolean,
};

// Error structure
export const error = {
  code: number,
  message: string,
  details: object,
};

// Success response wrapper
export const response = {
  success: boolean,
  data: object,
  error: null,
};

// === UTILITY FUNCTIONS === //

// Type checker functions
export const isString = value => typeof value === 'string';
export const isNumber = value => typeof value === 'number' && !isNaN(value);
export const isBoolean = value => typeof value === 'boolean';
export const isObject = value =>
  value !== null && typeof value === 'object' && !Array.isArray(value);
export const isArray = value => Array.isArray(value);
export const isDate = value => value instanceof Date && !isNaN(value);
export const isFunction = value => typeof value === 'function';
export const isJson = value => {
  try {
    JSON.parse(value);
    return true;
  } catch {
    return false;
  }
};

// Validator functions
export const validateEmail = email => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

export const validateUrl = url => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const validateUuid = uuid => {
  const regex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return regex.test(uuid);
};

// Schema validator
export const validateSchema = (value, schema) => {
  if (schema === string) return isString(value);
  if (schema === number) return isNumber(value);
  if (schema === boolean) return isBoolean(value);
  if (schema === object) return isObject(value);
  if (schema === array) return isArray(value);
  if (schema === date) return isDate(value);
  if (schema === json) return isJson(value);
  if (schema === email) return validateEmail(value);
  if (schema === url) return validateUrl(value);
  if (schema === uuid) return validateUuid(value);

  // For composite types, recursively validate each property
  if (isObject(schema)) {
    if (!isObject(value)) return false;
    return Object.keys(schema).every(key =>
      validateSchema(value[key], schema[key])
    );
  }

  return false;
};

// Add advanced type validators
export const validateComplexTypes = {
  workspace: data => {
    return (
      validateSchema(data, Database.public.Tables.workspaces.Row) &&
      data.name.length <= 100 &&
      data.description.length <= 500
    );
  },
  assistant: data => {
    return (
      validateSchema(data, Database.public.Tables.assistants.Row) &&
      data.temperature >= 0 &&
      data.temperature <= 1
    );
  },
};

// Add composite type validators
export const validateRelationships = (parentData, childData, relationship) => {
  const validParent = validateSchema(parentData, relationship.parent);
  const validChild = validateSchema(childData, relationship.child);
  return validParent && validChild;
};
