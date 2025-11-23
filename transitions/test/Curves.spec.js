/**
 * The MIT License (MIT)
 * Copyright (c) 2015 Famous Industries Inc.
 */

'use strict';

var curves = require('../Curves');

describe('Curves', function() {
    var curveNames = [
        'linear', 'easeIn', 'easeOut', 'easeInOut', 'easeOutBounce', 'spring',
        'inQuad', 'outQuad', 'inOutQuad', 'inCubic', 'outCubic', 'inOutCubic',
        'inQuart', 'outQuart', 'inOutQuart', 'inQuint', 'outQuint', 'inOutQuint',
        'inSine', 'outSine', 'inOutSine', 'inExpo', 'outExpo', 'inOutExpo',
        'inCirc', 'outCirc', 'inOutCirc', 'inElastic', 'outElastic', 'inOutElastic',
        'inBounce', 'outBounce', 'inOutBounce'
    ];

    curveNames.forEach(function(name) {
        describe(name, function() {
            it('should be a function', function() {
                expect(typeof curves[name]).toBe('function');
            });

            it('should start with 0', function() {
                expect(Math.round(curves[name](0) * 1000) / 1000).toBe(0);
            });

            it('should end with 1', function() {
                expect(Math.round(curves[name](1) * 1000) / 1000).toBe(1);
            });
        });
    });
});
