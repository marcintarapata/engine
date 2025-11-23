/**
 * The MIT License (MIT)
 * Copyright (c) 2015 Famous Industries Inc.
 */

'use strict';

var Mat33 = require('../Mat33');
var Vec3 = require('../Vec3');

describe('Mat33', function() {
    describe('constructor', function() {
        it('should be a function', function() {
            expect(typeof Mat33).toBe('function');
        });

        it('should not throw on instantiation', function() {
            expect(function() { new Mat33(); }).not.toThrow();
        });
    });

    describe('get method', function() {
        it('should be a function', function() {
            var matrix = new Mat33();
            expect(typeof matrix.get).toBe('function');
        });

        it('should have correct default state', function() {
            var matrix = new Mat33();
            expect(matrix.get()).toEqual([1, 0, 0, 0, 1, 0, 0, 0, 1]);
        });
    });

    describe('set method', function() {
        it('should set state of matrix', function() {
            var matrix = new Mat33();
            var desired = [0.1, 0, 0, 0, 0.1, 0, 0, 20, 0.1];
            matrix.set(desired);
            expect(matrix.get()).toEqual(desired);
        });
    });

    describe('copy method', function() {
        it('should copy matrix values', function() {
            var matrix = new Mat33();
            var sourceMat33 = new Mat33([1, 2, 3, 4, 5, 6, 7, 8, 9]);
            matrix.copy(sourceMat33);
            expect(matrix.get()).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
        });
    });

    describe('multiply method', function() {
        it('should multiply matrices correctly', function() {
            var original = [1, 2, 4, 1, 6, 4, 4, 5, 9];
            var expected = [7, 24, 41, 11, 36, 69, 25, 66, 108];
            var m = new Mat33(original);
            var result = m.multiply(new Mat33([5, 6, 7, 1, 3, 7, 0, 3, 5]));
            expect(result.get()).toEqual(expected);
        });
    });

    describe('getDeterminant method', function() {
        it('should calculate determinant', function() {
            var matrix = new Mat33();
            matrix.set([1, 2, 3, 4, 5, 6, 4, 8, 9]);
            expect(matrix.getDeterminant()).toBe(9);
        });
    });

    describe('Mat33.add', function() {
        it('should add matrices', function() {
            var summand1 = new Mat33([1, 2, 3, 4, 5, 6, 7, 8, 9]);
            var summand2 = new Mat33([2, 3, 4, 5, 6, 7, 8, 9, 10]);
            var output = new Mat33();
            Mat33.add(summand1, summand2, output);
            expect(output.get()).toEqual([3, 5, 7, 9, 11, 13, 15, 17, 19]);
        });
    });

    describe('Mat33.subtract', function() {
        it('should subtract matrices', function() {
            var mat1 = new Mat33([1, 2, 3, 4, 5, 6, 7, 8, 9]);
            var mat2 = new Mat33([2, 3, 4, 5, 6, 7, 8, 9, 10]);
            var output = new Mat33();
            Mat33.subtract(mat1, mat2, output);
            expect(output.get()).toEqual([-1, -1, -1, -1, -1, -1, -1, -1, -1]);
        });
    });

    describe('Mat33.multiply', function() {
        it('should multiply matrices', function() {
            var mat1 = new Mat33([1, 2, 3, 4, 5, 6, 7, 8, 9]);
            var mat2 = new Mat33([2, 3, 4, 5, 6, 7, 8, 9, 10]);
            var output = new Mat33();
            Mat33.multiply(mat1, mat2, output);
            expect(output.get()).toEqual([36, 42, 48, 81, 96, 111, 126, 150, 174]);
        });
    });
});
