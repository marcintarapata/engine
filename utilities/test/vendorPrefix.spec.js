/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 Famous Industries Inc.
 */

'use strict';

var vendorPrefix = require('../vendorPrefix');

describe('vendorPrefix', function() {
    it('should return vendor prefixed version of transform property', function() {
        var result = vendorPrefix('transform');
        var validValues = [
            'transform',
            '-ms-transform',
            '-webkit-transform',
            '-moz-transform',
            '-o-transform',
            false  // vendorPrefix returns false if property not supported
        ];
        expect(validValues.indexOf(result)).not.toBe(-1);
    });
});
