/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 Famous Industries Inc.
 */

'use strict';

var strip = require('../strip');

describe('strip', function() {
    it('should be a function', function() {
        expect(typeof strip).toBe('function');
    });

    it('should handle empty objects', function() {
        expect(strip({})).toEqual({});
    });

    it('should strip functions from objects', function() {
        expect(strip({
            aFunction: function() {}
        })).toEqual({
            aFunction: null
        });
    });

    it('should strip functions from nested objects', function() {
        expect(strip({ nested: { aFunction: function() {} } }))
            .toEqual({ nested: { aFunction: null } });
    });

    it('should strip multiple functions from nested objects', function() {
        expect(strip({
            nested: { aFunction: function() {} },
            nested2: { aFunction: function() {}, bFunction: null }
        })).toEqual({
            nested: { aFunction: null },
            nested2: { aFunction: null, bFunction: null }
        });
    });

    it('should preserve non-function values', function() {
        expect(strip({
            nested: { aFunction: function() {}, c: 'string' },
            nested2: { aFunction: function() {}, bFunction: null }
        })).toEqual({
            nested: { aFunction: null, c: 'string' },
            nested2: { aFunction: null, bFunction: null }
        });
    });

    it('should preserve empty objects', function() {
        expect(strip({
            nested: { aFunction: function() {}, c: 'string', d: {} },
            nested2: { aFunction: function() {}, bFunction: null }
        })).toEqual({
            nested: { aFunction: null, c: 'string', d: {} },
            nested2: { aFunction: null, bFunction: null }
        });
    });

    it('should strip class instances', function() {
        function MyClass() {}
        expect(strip({
            nested: { aFunction: function() {}, c: 'string', d: new MyClass() },
            nested2: { aFunction: function() {}, bFunction: null }
        })).toEqual({
            nested: { aFunction: null, c: 'string', d: null },
            nested2: { aFunction: null, bFunction: null }
        });
    });
});
