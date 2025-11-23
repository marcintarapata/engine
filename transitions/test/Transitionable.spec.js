/**
 * The MIT License (MIT)
 * Copyright (c) 2015 Famous Industries Inc.
 */

'use strict';

var Transitionable = require('../Transitionable');

var time = 0;

describe('Transitionable', function() {
    beforeEach(function() {
        time = 0;
        Transitionable.Clock = {
            now: function() { return time; }
        };
    });

    describe('constructor', function() {
        it('should be a function', function() {
            expect(typeof Transitionable).toBe('function');
        });

        it('should set initial state', function() {
            var transitionable = new Transitionable(2);
            expect(transitionable.get()).toBe(2);
        });
    });

    describe('set method', function() {
        it('should set state', function() {
            var transitionable = new Transitionable();
            transitionable.set(5);
            expect(transitionable.get()).toBe(5);
        });
    });

    describe('get method', function() {
        it('should interpolate values', function() {
            var transitionable = new Transitionable();
            time = 0;
            transitionable.set(0);
            transitionable.set(1, { duration: 500 });
            time = 250;
            expect(transitionable.get()).toBe(0.5);
        });
    });

    describe('isActive method', function() {
        it('should return true during transition', function() {
            var transitionable = new Transitionable();
            transitionable.set(1, { duration: 100 });
            expect(transitionable.isActive()).toBe(true);
        });

        it('should return false after halt', function() {
            var transitionable = new Transitionable();
            transitionable.set(1, { duration: 100 });
            transitionable.halt();
            expect(transitionable.isActive()).toBe(false);
        });
    });

    describe('halt method', function() {
        it('should stop transition', function() {
            var transitionable = new Transitionable();
            time = 0;
            transitionable.set(0);
            transitionable.set(1, { duration: 500 });
            time = 250;
            transitionable.halt();
            time = 600;
            expect(transitionable.get()).toBe(0.5);
        });
    });
});
