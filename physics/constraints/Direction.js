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

const NORMAL_REGISTER = new Vec3();
const IMPULSE_REGISTER = new Vec3();
const V_REGISTER = new Vec3();
const P_REGISTER = new Vec3();
const DIRECTION_REGISTER = new Vec3();

/** @const */
const PI = Math.PI;

/**
 * A constraint that maintains the direction of one body from another.
 *
 * @class Direction
 * @extends Constraint
 * @param {Particle} a - One of the bodies.
 * @param {Particle} b - The other body.
 * @param {Object} options - An object of configurable options.
 */
class Direction extends Constraint {
    constructor(a, b, options) {
        super(options);

        this.a = a;
        this.b = b;
        this.impulse = 0;
        this.distance = 0;
        this.normal = new Vec3();
        this.velocityBias = 0;
        this.divisor = 0;
    }

    /**
     * Initialize the Direction. Sets defaults if a property was not already set.
     *
     * @method
     * @returns {undefined} undefined
     */
    init() {
        this.direction = this.direction || Vec3.subtract(this.b.position, this.a.position, new Vec3());
        this.direction.normalize();
        this.minLength = this.minLength || 0;
        this.period = this.period || 0.2;
        this.dampingRatio = this.dampingRatio || 0.5;

        this.stiffness = 4 * PI * PI / (this.period * this.period);
        this.damping = 4 * PI * this.dampingRatio / this.period;
    }

    /**
     * Warmstart the constraint and prepare calculations used in .resolve.
     *
     * @method
     * @param {Number} time - The current time in the physics engine.
     * @param {Number} dt - The physics engine frame delta.
     * @returns {undefined} undefined
     */
    update(time, dt) {
        const a = this.a;
        const b = this.b;

        const n = NORMAL_REGISTER;
        const diffP = P_REGISTER;
        const impulse = IMPULSE_REGISTER;
        const directionVector = DIRECTION_REGISTER;

        const p1 = a.position;
        const w1 = a.inverseMass;

        const p2 = b.position;
        const w2 = b.inverseMass;

        const direction = this.direction;

        Vec3.subtract(p2, p1, diffP);
        Vec3.scale(direction, Vec3.dot(direction, diffP), directionVector);
        const goal = directionVector.add(p1);

        Vec3.subtract(p2, goal, n);
        const dist = n.length();
        n.normalize();

        const invEffectiveMass = w1 + w2;
        const effectiveMass = 1 / invEffectiveMass;
        let gamma;
        let beta;

        if (this.period === 0) {
            gamma = 0;
            beta  = 1;
        }
        else {
            const c = this.damping * effectiveMass;
            const k = this.stiffness * effectiveMass;

            gamma = 1 / (dt*(c + dt*k));
            beta  = dt*k / (c + dt*k);
        }

        const baumgarte = beta * dist / dt;
        const divisor = gamma + invEffectiveMass;

        const lambda = this.impulse;
        Vec3.scale(n, lambda, impulse);
        b.applyImpulse(impulse);
        a.applyImpulse(impulse.invert());

        this.normal.copy(n);
        this.distance = dist;
        this.velocityBias = baumgarte;
        this.divisor = divisor;
        this.impulse = 0;
    }

    /**
     * Adds an impulse to a physics body's velocity due to the constraint
     *
     * @method
     * @returns {undefined} undefined
     */
    resolve() {
        const a = this.a;
        const b = this.b;

        const impulse  = IMPULSE_REGISTER;
        const diffV = V_REGISTER;

        const minLength = this.minLength;

        const dist = this.distance;
        if (Math.abs(dist) < minLength) return;

        const v1 = a.velocity;
        const v2 = b.velocity;
        const n = this.normal;

        Vec3.subtract(v2, v1, diffV);

        const lambda = -(Vec3.dot(n, diffV) + this.velocityBias) / this.divisor;
        Vec3.scale(n, lambda, impulse);
        b.applyImpulse(impulse);
        a.applyImpulse(impulse.invert());

        this.impulse += lambda;
    }
}

module.exports = Direction;
