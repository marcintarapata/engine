/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 Famous Industries Inc.
 */

'use strict';

var CallbackStore = require('../CallbackStore');

describe('CallbackStore', function() {
    describe('constructor', function() {
        it('should not throw on instantiation', function() {
            expect(function() {
                new CallbackStore();
            }).not.toThrow();
        });
    });

    describe('on method', function() {
        it('should be a function', function() {
            var cs = new CallbackStore();
            expect(typeof cs.on).toBe('function');
        });

        it('should register and trigger callbacks', function() {
            var cs = new CallbackStore();
            var called = false;
            var eggEv = {};

            cs.on('egg', function(ev) {
                called = true;
                expect(ev).toBe(eggEv);
            });

            cs.trigger('egg', eggEv);
            expect(called).toBe(true);
        });

        it('should support removing callbacks by id', function() {
            var cs = new CallbackStore();
            var callCount = 0;

            var id = cs.on('egg', function() {
                callCount++;
            });

            cs.trigger('egg');
            expect(callCount).toBe(1);

            cs.off('egg', id);
            cs.trigger('egg');
            expect(callCount).toBe(1);
        });
    });

    describe('off method', function() {
        it('should be a function', function() {
            var cs = new CallbackStore();
            expect(typeof cs.off).toBe('function');
        });

        it('should remove callbacks by reference', function() {
            var cs = new CallbackStore();
            var callCount = 0;

            var listener = function() {
                callCount++;
            };

            cs.on('chicken', listener);
            cs.trigger('chicken');
            expect(callCount).toBe(1);

            cs.off('chicken', listener);
            cs.trigger('chicken');
            expect(callCount).toBe(1);
        });
    });

    describe('trigger method', function() {
        it('should be a function', function() {
            var cs = new CallbackStore();
            expect(typeof cs.trigger).toBe('function');
        });

        it('should trigger all registered callbacks for an event', function() {
            var cs = new CallbackStore();
            var calls = [];
            var chickenEv = {};

            cs.on('chicken', function(ev) {
                calls.push({ cb: 1, ev: ev });
            });

            cs.on('chicken', function(ev) {
                calls.push({ cb: 2, ev: ev });
            });

            cs.trigger('chicken', chickenEv);

            expect(calls.length).toBe(2);
            expect(calls[0].ev).toBe(chickenEv);
            expect(calls[1].ev).toBe(chickenEv);
        });

        it('should not trigger callbacks for different events', function() {
            var cs = new CallbackStore();
            var chickenCalled = false;
            var eggCalled = false;

            cs.on('chicken', function() {
                chickenCalled = true;
            });

            cs.on('egg', function() {
                eggCalled = true;
            });

            cs.trigger('chicken');
            expect(chickenCalled).toBe(true);
            expect(eggCalled).toBe(false);
        });
    });
});
