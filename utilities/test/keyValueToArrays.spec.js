/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 Famous Industries Inc.
 */

'use strict';

var keyValueToArrays = require('../keyValueToArrays');

describe('keyValueToArrays', function() {
    it('should be a function', function() {
        expect(typeof keyValueToArrays).toBe('function');
    });

    it('should only extract own properties', function() {
        var obj = Object.create({
            a: 1,
            b: 2,
            c: 3
        });

        obj.d = 4;
        obj.e = 5;
        obj.f = 6;

        expect(keyValueToArrays(obj)).toEqual({
            keys: ['d', 'e', 'f'],
            values: [4, 5, 6]
        });
    });
});
