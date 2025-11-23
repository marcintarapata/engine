/**
 * The MIT License (MIT)
 * Copyright (c) 2015 Famous Industries Inc.
 */

'use strict';

var Quaternion = require('../Quaternion');

describe('Quaternion', function() {
    describe('constructor', function() {
        it('should be a function', function() {
            expect(typeof Quaternion).toBe('function');
        });

        it('should have correct default values', function() {
            var q = new Quaternion();
            expect(q.w).toBe(1);
            expect(q.x).toBe(0);
            expect(q.y).toBe(0);
            expect(q.z).toBe(0);
        });
    });

    describe('multiply method', function() {
        it('should multiply quaternions correctly', function() {
            var quaternion = new Quaternion(1, 0.5, 0.5, 0.75);
            var result = quaternion.multiply(new Quaternion(1, 0, 1, 0));
            expect(result.w).toBe(0.5);
            expect(result.x).toBe(1.25);
            expect(result.y).toBe(1.5);
            expect(result.z).toBe(0.25);
        });
    });

    describe('length method', function() {
        it('should calculate length correctly', function() {
            var quaternion = new Quaternion(1, 5, 0, 0);
            expect(quaternion.length()).toBe(Math.sqrt(26));
        });
    });

    describe('normalize method', function() {
        it('should normalize to length 1', function() {
            var quaternion = new Quaternion(1, 2, 2, 2);
            quaternion.normalize();
            expect(quaternion.length()).toBe(1);
        });
    });

    describe('conjugate method', function() {
        it('should conjugate quaternion correctly', function() {
            var quaternion = new Quaternion(1.5, 9.2, 2.3, -2.5);
            quaternion.conjugate();
            expect(quaternion.w).toBe(1.5);
            expect(quaternion.x).toBe(-9.2);
            expect(quaternion.y).toBe(-2.3);
            expect(quaternion.z).toBe(2.5);
        });
    });

    describe('dot method', function() {
        it('should calculate dot product', function() {
            var q1 = new Quaternion(Math.PI * 0.5, 8, 1, 3);
            var q2 = new Quaternion(3, 4, 2, 6);
            expect(q1.dot(q2)).toBe(Math.PI * 1.5 + 32 + 2 + 18);
        });
    });
});
