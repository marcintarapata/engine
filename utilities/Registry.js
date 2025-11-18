/**
 * Registry manages a collection of key-value pairs with efficient lookup and storage.
 */
class Registry {
  constructor() {
    this._keyToValue = {};
    this._values = [];
    this._keys = [];
    this._keyToIndex = {};
    this._freedIndices = [];
  }

  /**
   * Registers a key-value pair in the registry.
   * @param {*} key - The key to register
   * @param {*} value - The value to associate with the key
   */
  register(key, value) {
    let index = this._keyToIndex[key];
    if (index == null) {
      index = this._freedIndices.pop();
      if (index === undefined) {
        index = this._values.length;
      }

      this._values[index] = value;
      this._keys[index] = key;

      this._keyToIndex[key] = index;
      this._keyToValue[key] = value;
    } else {
      this._keyToValue[key] = value;
      this._values[index] = value;
    }
  }

  /**
   * Unregisters a key from the registry.
   * @param {*} key - The key to unregister
   */
  unregister(key) {
    const index = this._keyToIndex[key];

    if (index != null) {
      this._freedIndices.push(index);
      this._keyToValue[key] = null;
      this._keyToIndex[key] = null;
      this._values[index] = null;
      this._keys[index] = null;
    }
  }

  /**
   * Gets the value associated with a key.
   * @param {*} key - The key to look up
   * @returns {*} The value associated with the key
   */
  get(key) {
    return this._keyToValue[key];
  }

  /**
   * Gets all values in the registry.
   * @returns {Array} Array of all values
   */
  getValues() {
    return this._values;
  }

  /**
   * Gets all keys in the registry.
   * @returns {Array} Array of all keys
   */
  getKeys() {
    return this._keys;
  }

  /**
   * Gets the key-to-value mapping object.
   * @returns {Object} The key-to-value mapping
   */
  getKeyToValue() {
    return this._keyToValue;
  }
}

module.exports = Registry;
