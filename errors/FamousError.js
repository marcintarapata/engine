/**
 * Base error class for all Famous Engine errors
 * Provides consistent error handling with codes and suggestions
 */
class FamousError extends Error {
  /**
   * Creates a FamousError
   * @param {string} message - Error message
   * @param {Object} options - Error options
   * @param {string} options.code - Error code for programmatic handling
   * @param {string} options.suggestion - Suggestion for fixing the error
   * @param {*} options.context - Additional context information
   */
  constructor(message, options = {}) {
    super(message);

    this.name = this.constructor.name;
    this.code = options.code || 'FAMOUS_ERROR';
    this.suggestion = options.suggestion || null;
    this.context = options.context || null;

    // Maintains proper stack trace for where our error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  /**
   * Returns a formatted error message with all details
   * @returns {string} Formatted error message
   */
  toString() {
    let message = `${this.name} [${this.code}]: ${this.message}`;

    if (this.suggestion) {
      message += `\n  Suggestion: ${this.suggestion}`;
    }

    if (this.context) {
      message += `\n  Context: ${JSON.stringify(this.context, null, 2)}`;
    }

    return message;
  }

  /**
   * Returns a JSON representation of the error
   * @returns {Object} Error as JSON
   */
  toJSON() {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      suggestion: this.suggestion,
      context: this.context,
      stack: this.stack,
    };
  }
}

module.exports = FamousError;
