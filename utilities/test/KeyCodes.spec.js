/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 Famous Industries Inc.
 */

'use strict';

var KeyCodes = require('../KeyCodes');

describe('KeyCodes', function() {
    it('should export an object', function() {
        expect(typeof KeyCodes).toBe('object');
    });

    it('should be a flat object with number codes as values', function() {
        for (var key in KeyCodes) {
            expect(typeof KeyCodes[key]).toBe('number');
        }
    });
});
