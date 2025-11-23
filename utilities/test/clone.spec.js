/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 Famous Industries Inc.
 */

'use strict';

var clone = require('../clone');

describe('clone', function() {
    it('should be a function', function() {
        expect(typeof clone).toBe('function');
    });

    it('should clone flat object', function() {
        var flatObject = {a: {}, b: {}, c: {}};
        expect(clone(flatObject)).toEqual(flatObject);
    });

    it('should deep clone nested object', function() {
        var nestedObject = {
            test1: {
                test1test1: {
                    test1test1test1: 3
                },
                test1test2: 3
            },
            test2: {},
            test3: {}
        };
        expect(clone(nestedObject)).toEqual(nestedObject);
    });
});
