/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 Famous Industries Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

/**
 * A 3x3 numerical matrix, represented as an array.
 */
class Mat33 {
  /**
   * @param {Array} [values] - A 3x3 matrix flattened
   */
  constructor(values) {
    this.values = values || [1, 0, 0, 0, 1, 0, 0, 0, 1];
  }

  /**
   * Return the values in the Mat33 as an array.
   *
   * @returns {Array} Matrix values as array of rows
   */
  get() {
    return this.values;
  }

  /**
   * Set the values of the current Mat33.
   *
   * @param {Array} values - Array of nine numbers to set in the Mat33
   * @returns {Mat33} this instance for chaining
   */
  set(values) {
    this.values = values;
    return this;
  }

  /**
   * Copy the values of the input Mat33.
   *
   * @param {Mat33} matrix - The Mat33 to copy
   * @returns {Mat33} this instance for chaining
   */
  copy(matrix) {
    const A = this.values;
    const B = matrix.values;

    A[0] = B[0];
    A[1] = B[1];
    A[2] = B[2];
    A[3] = B[3];
    A[4] = B[4];
    A[5] = B[5];
    A[6] = B[6];
    A[7] = B[7];
    A[8] = B[8];

    return this;
  }

  /**
   * Take this Mat33 as A, input vector V as a column vector, and return Mat33 product (A)(V).
   *
   * @param {Vec3} v - Vector to rotate
   * @param {Vec3} output - Vec3 in which to place the result
   * @returns {Vec3} The input vector after multiplication
   */
  vectorMultiply(v, output) {
    const M = this.values;
    const v0 = v.x;
    const v1 = v.y;
    const v2 = v.z;

    output.x = M[0] * v0 + M[1] * v1 + M[2] * v2;
    output.y = M[3] * v0 + M[4] * v1 + M[5] * v2;
    output.z = M[6] * v0 + M[7] * v1 + M[8] * v2;

    return output;
  }

  /**
   * Multiply the provided Mat33 with the current Mat33.  Result is (this) * (matrix).
   *
   * @param {Mat33} matrix - Input Mat33 to multiply on the right
   * @returns {Mat33} this instance for chaining
   */
  multiply(matrix) {
    const A = this.values;
    const B = matrix.values;

    const A0 = A[0];
    const A1 = A[1];
    const A2 = A[2];
    const A3 = A[3];
    const A4 = A[4];
    const A5 = A[5];
    const A6 = A[6];
    const A7 = A[7];
    const A8 = A[8];

    const B0 = B[0];
    const B1 = B[1];
    const B2 = B[2];
    const B3 = B[3];
    const B4 = B[4];
    const B5 = B[5];
    const B6 = B[6];
    const B7 = B[7];
    const B8 = B[8];

    A[0] = A0 * B0 + A1 * B3 + A2 * B6;
    A[1] = A0 * B1 + A1 * B4 + A2 * B7;
    A[2] = A0 * B2 + A1 * B5 + A2 * B8;
    A[3] = A3 * B0 + A4 * B3 + A5 * B6;
    A[4] = A3 * B1 + A4 * B4 + A5 * B7;
    A[5] = A3 * B2 + A4 * B5 + A5 * B8;
    A[6] = A6 * B0 + A7 * B3 + A8 * B6;
    A[7] = A6 * B1 + A7 * B4 + A8 * B7;
    A[8] = A6 * B2 + A7 * B5 + A8 * B8;

    return this;
  }

  /**
   * Transposes the Mat33.
   *
   * @returns {Mat33} this instance for chaining
   */
  transpose() {
    const M = this.values;

    const M1 = M[1];
    const M2 = M[2];
    const M3 = M[3];
    const M5 = M[5];
    const M6 = M[6];
    const M7 = M[7];

    M[1] = M3;
    M[2] = M6;
    M[3] = M1;
    M[5] = M7;
    M[6] = M2;
    M[7] = M5;

    return this;
  }

  /**
   * The determinant of the Mat33.
   *
   * @returns {number} The determinant
   */
  getDeterminant() {
    const M = this.values;

    const M3 = M[3];
    const M4 = M[4];
    const M5 = M[5];
    const M6 = M[6];
    const M7 = M[7];
    const M8 = M[8];

    const det = M[0] * (M4 * M8 - M5 * M7) -
              M[1] * (M3 * M8 - M5 * M6) +
              M[2] * (M3 * M7 - M4 * M6);

    return det;
  }

  /**
   * The inverse of the Mat33.
   *
   * @returns {Mat33|null} this instance for chaining, or null if not invertible
   */
  inverse() {
    const M = this.values;

    const M0 = M[0];
    const M1 = M[1];
    const M2 = M[2];
    const M3 = M[3];
    const M4 = M[4];
    const M5 = M[5];
    const M6 = M[6];
    const M7 = M[7];
    const M8 = M[8];

    let det = M0 * (M4 * M8 - M5 * M7) -
              M1 * (M3 * M8 - M5 * M6) +
              M2 * (M3 * M7 - M4 * M6);

    if (Math.abs(det) < 1e-40) return null;

    det = 1 / det;

    M[0] = (M4 * M8 - M5 * M7) * det;
    M[3] = (-M3 * M8 + M5 * M6) * det;
    M[6] = (M3 * M7 - M4 * M6) * det;
    M[1] = (-M1 * M8 + M2 * M7) * det;
    M[4] = (M0 * M8 - M2 * M6) * det;
    M[7] = (-M0 * M7 + M1 * M6) * det;
    M[2] = (M1 * M5 - M2 * M4) * det;
    M[5] = (-M0 * M5 + M2 * M3) * det;
    M[8] = (M0 * M4 - M1 * M3) * det;

    return this;
  }

  /**
   * Clones the input Mat33.
   *
   * @static
   * @param {Mat33} m - Mat33 to clone
   * @returns {Mat33} New copy of the original Mat33
   */
  static clone(m) {
    return new Mat33(m.values.slice());
  }

  /**
   * The inverse of the Mat33.
   *
   * @static
   * @param {Mat33} matrix - Mat33 to invert
   * @param {Mat33} output - Mat33 in which to place the result
   * @returns {Mat33|null} The Mat33 after the invert, or null if not invertible
   */
  static inverse(matrix, output) {
    const M = matrix.values;
    const result = output.values;

    const M0 = M[0];
    const M1 = M[1];
    const M2 = M[2];
    const M3 = M[3];
    const M4 = M[4];
    const M5 = M[5];
    const M6 = M[6];
    const M7 = M[7];
    const M8 = M[8];

    let det = M0 * (M4 * M8 - M5 * M7) -
              M1 * (M3 * M8 - M5 * M6) +
              M2 * (M3 * M7 - M4 * M6);

    if (Math.abs(det) < 1e-40) return null;

    det = 1 / det;

    result[0] = (M4 * M8 - M5 * M7) * det;
    result[3] = (-M3 * M8 + M5 * M6) * det;
    result[6] = (M3 * M7 - M4 * M6) * det;
    result[1] = (-M1 * M8 + M2 * M7) * det;
    result[4] = (M0 * M8 - M2 * M6) * det;
    result[7] = (-M0 * M7 + M1 * M6) * det;
    result[2] = (M1 * M5 - M2 * M4) * det;
    result[5] = (-M0 * M5 + M2 * M3) * det;
    result[8] = (M0 * M4 - M1 * M3) * det;

    return output;
  }

  /**
   * Transposes the Mat33.
   *
   * @static
   * @param {Mat33} matrix - Mat33 to transpose
   * @param {Mat33} output - Mat33 in which to place the result
   * @returns {Mat33} The Mat33 after the transpose
   */
  static transpose(matrix, output) {
    const M = matrix.values;
    const result = output.values;

    const M0 = M[0];
    const M1 = M[1];
    const M2 = M[2];
    const M3 = M[3];
    const M4 = M[4];
    const M5 = M[5];
    const M6 = M[6];
    const M7 = M[7];
    const M8 = M[8];

    result[0] = M0;
    result[1] = M3;
    result[2] = M6;
    result[3] = M1;
    result[4] = M4;
    result[5] = M7;
    result[6] = M2;
    result[7] = M5;
    result[8] = M8;

    return output;
  }

  /**
   * Add the provided Mat33's.
   *
   * @static
   * @param {Mat33} matrix1 - The left Mat33
   * @param {Mat33} matrix2 - The right Mat33
   * @param {Mat33} output - Mat33 in which to place the result
   * @returns {Mat33} The result of the addition
   */
  static add(matrix1, matrix2, output) {
    const A = matrix1.values;
    const B = matrix2.values;
    const result = output.values;

    const A0 = A[0];
    const A1 = A[1];
    const A2 = A[2];
    const A3 = A[3];
    const A4 = A[4];
    const A5 = A[5];
    const A6 = A[6];
    const A7 = A[7];
    const A8 = A[8];

    const B0 = B[0];
    const B1 = B[1];
    const B2 = B[2];
    const B3 = B[3];
    const B4 = B[4];
    const B5 = B[5];
    const B6 = B[6];
    const B7 = B[7];
    const B8 = B[8];

    result[0] = A0 + B0;
    result[1] = A1 + B1;
    result[2] = A2 + B2;
    result[3] = A3 + B3;
    result[4] = A4 + B4;
    result[5] = A5 + B5;
    result[6] = A6 + B6;
    result[7] = A7 + B7;
    result[8] = A8 + B8;

    return output;
  }

  /**
   * Subtract the provided Mat33's.
   *
   * @static
   * @param {Mat33} matrix1 - The left Mat33
   * @param {Mat33} matrix2 - The right Mat33
   * @param {Mat33} output - Mat33 in which to place the result
   * @returns {Mat33} The result of the subtraction
   */
  static subtract(matrix1, matrix2, output) {
    const A = matrix1.values;
    const B = matrix2.values;
    const result = output.values;

    const A0 = A[0];
    const A1 = A[1];
    const A2 = A[2];
    const A3 = A[3];
    const A4 = A[4];
    const A5 = A[5];
    const A6 = A[6];
    const A7 = A[7];
    const A8 = A[8];

    const B0 = B[0];
    const B1 = B[1];
    const B2 = B[2];
    const B3 = B[3];
    const B4 = B[4];
    const B5 = B[5];
    const B6 = B[6];
    const B7 = B[7];
    const B8 = B[8];

    result[0] = A0 - B0;
    result[1] = A1 - B1;
    result[2] = A2 - B2;
    result[3] = A3 - B3;
    result[4] = A4 - B4;
    result[5] = A5 - B5;
    result[6] = A6 - B6;
    result[7] = A7 - B7;
    result[8] = A8 - B8;

    return output;
  }

  /**
   * Multiply the provided Mat33 M2 with this Mat33.  Result is (this) * (M2).
   *
   * @static
   * @param {Mat33} matrix1 - The left Mat33
   * @param {Mat33} matrix2 - The right Mat33
   * @param {Mat33} output - Mat33 in which to place the result
   * @returns {Mat33} The result of the multiplication
   */
  static multiply(matrix1, matrix2, output) {
    const A = matrix1.values;
    const B = matrix2.values;
    const result = output.values;

    const A0 = A[0];
    const A1 = A[1];
    const A2 = A[2];
    const A3 = A[3];
    const A4 = A[4];
    const A5 = A[5];
    const A6 = A[6];
    const A7 = A[7];
    const A8 = A[8];

    const B0 = B[0];
    const B1 = B[1];
    const B2 = B[2];
    const B3 = B[3];
    const B4 = B[4];
    const B5 = B[5];
    const B6 = B[6];
    const B7 = B[7];
    const B8 = B[8];

    result[0] = A0 * B0 + A1 * B3 + A2 * B6;
    result[1] = A0 * B1 + A1 * B4 + A2 * B7;
    result[2] = A0 * B2 + A1 * B5 + A2 * B8;
    result[3] = A3 * B0 + A4 * B3 + A5 * B6;
    result[4] = A3 * B1 + A4 * B4 + A5 * B7;
    result[5] = A3 * B2 + A4 * B5 + A5 * B8;
    result[6] = A6 * B0 + A7 * B3 + A8 * B6;
    result[7] = A6 * B1 + A7 * B4 + A8 * B7;
    result[8] = A6 * B2 + A7 * B5 + A8 * B8;

    return output;
  }
}

module.exports = Mat33;
