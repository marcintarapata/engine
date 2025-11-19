/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 Famous Industries Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

const Constraint = require('./Constraint');
const Vec3 = require('../../math/Vec3');

const IMPULSE_REGISTER = new Vec3();
const NORMAL_REGISTER = new Vec3();

/** @const */
const EPSILSON = 1e-7;
/** @const */
const PI = Math.PI;


/**
 * A constraint that keeps a physics body on a given implicit curve.
 *
 * @class Curve
 * @extends Constraint
 * @param {Particle[]} targets - The bodies to track.
 * @param {Object} options - The options hash.
 */
class Curve extends Constraint {
    constructor(targets, options) {
        super(options);

        if (targets) {
            if (targets instanceof Array) this.targets = targets;
            else this.targets = [targets];
        }
        else this.targets = [];

        this.impulses = {};
        this.normals = {};
        this.velocityBiases = {};
        this.divisors = {};
    }

    /**
     * Initialize the Curve. Sets defaults if a property was not already set.
     *
     * @method
     * @returns {undefined} undefined
     */
    init() {
        this.equation1 = this.equation1 || function() {
            return 0;
        };
        this.equation2 = this.equation2 || function(x, y, z) {
            return z;
        };
        this.period = this.period || 1;
        this.dampingRatio = this.dampingRatio || 0.5;

        this.stiffness = 4 * PI * PI / (this.period * this.period);
        this.damping = 4 * PI * this.dampingRatio / this.period;
    }

    /**
     * Warmstart the constraint and prepare calculations used in the .resolve step.
     *
     * @method
     * @param {Number} time - The current time in the physics engine.
     * @param {Number} dt - The physics engine frame delta.
     * @returns {undefined} undefined
     */
    update(time, dt) {
        const targets = this.targets;

        const normals = this.normals;
        const velocityBiases = this.velocityBiases;
        const divisors = this.divisors;
        const impulses = this.impulses;

        const impulse = IMPULSE_REGISTER;
        const n = NORMAL_REGISTER;

        const f = this.equation1;
        const g = this.equation2;

        const _c = this.damping;
        const _k = this.stiffness;

        for (let i = 0, len = targets.length; i < len; i++) {
            const body = targets[i];
            const ID = body._ID;
            if (body.immune) continue;

            const p = body.position;
            const m = body.mass;

            let gamma;
            let beta;

            if (this.period === 0) {
                gamma = 0;
                beta = 1;
            }
            else {
                const c = _c * m;
                const k = _k * m;

                gamma = 1 / (dt*(c + dt*k));
                beta  = dt*k / (c + dt*k);
            }

            const x = p.x;
            const y = p.y;
            const z = p.z;

            const f0 = f(x, y, z);
            const dfx = (f(x + EPSILSON, y, z) - f0) / EPSILSON;
            const dfy = (f(x, y + EPSILSON, z) - f0) / EPSILSON;
            const dfz = (f(x, y, z + EPSILSON) - f0) / EPSILSON;

            const g0 = g(x, y, z);
            const dgx = (g(x + EPSILSON, y, z) - g0) / EPSILSON;
            const dgy = (g(x, y + EPSILSON, z) - g0) / EPSILSON;
            const dgz = (g(x, y, z + EPSILSON) - g0) / EPSILSON;

            n.set(dfx + dgx, dfy + dgy, dfz + dgz);
            n.normalize();

            const baumgarte = beta * (f0 + g0) / dt;
            const divisor = gamma + 1 / m;

            const lambda = impulses[ID] || 0;
            Vec3.scale(n, lambda, impulse);
            body.applyImpulse(impulse);

            normals[ID] = normals[ID] || new Vec3();
            normals[ID].copy(n);
            velocityBiases[ID] = baumgarte;
            divisors[ID] = divisor;
            impulses[ID] = 0;
        }
    }

    /**
     * Adds a curve impulse to a physics body.
     *
     * @method
     * @returns {undefined} undefined
     */
    resolve() {
        const targets = this.targets;

        const normals = this.normals;
        const velocityBiases = this.velocityBiases;
        const divisors = this.divisors;
        const impulses = this.impulses;

        const impulse = IMPULSE_REGISTER;

        for (let i = 0, len = targets.length; i < len; i++) {
            const body = targets[i];
            const ID = body._ID;
            if (body.immune) continue;

            const v = body.velocity;
            const n = normals[ID];

            const lambda = -(Vec3.dot(n, v) + velocityBiases[ID]) / divisors[ID];

            Vec3.scale(n, lambda, impulse);
            body.applyImpulse(impulse);


            impulses[ID] += lambda;
        }
    }
}

module.exports = Curve;
