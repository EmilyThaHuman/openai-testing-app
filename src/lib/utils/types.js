/**
 * @param {*} value
 * @returns {boolean}
 */
export const isString = value => typeof value === 'string';

/**
 * @param {*} value
 * @returns {boolean}
 */
export const isNumber = value => typeof value === 'number' && !isNaN(value);

/**
 * @param {*} value
 * @returns {boolean}
 */
export const isFunction = value => typeof value === 'function';

/**
 * @param {*} value
 * @returns {boolean}
 */
export const isObject = value =>
  value !== null && typeof value === 'object' && !Array.isArray(value);

/**
 * @param {*} value
 * @returns {boolean}
 */
export const isArray = value => Array.isArray(value);

/**
 * @template T
 * @param {T|null|undefined} value
 * @returns {value is T}
 */
export const isDefined = value => value !== null && value !== undefined;
