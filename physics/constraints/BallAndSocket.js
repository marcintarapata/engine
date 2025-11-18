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
const Mat33 = require('../../math/Mat33');
const Quaternion = require('../../math/Quaternion');

const VEC1_REGISTER = new Vec3();
const VEC2_REGISTER = new Vec3();
const VB1_REGISTER = new Vec3();
const VB2_REGISTER = new Vec3();
const WxR_REGISTER = new Vec3();

/**
 * A constraint that maintains positions and orientations with respect to a specific anchor point.
 *
 * @class BallAndSocket
 * @extends Constraint
 * @param {Particle} a - One of the bodies.
 * @param {Particle} b - The other body.
 * @param {Options} options - An object of configurable options.
 */
class BallAndSocket extends Constraint {
    constructor(a, b, options) {
        super(options);

        this.a = a;
        this.b = b;
        this.impulse = new Vec3();
        this.angImpulseA = new Vec3();
        this.angImpulseB = new Vec3();
        this.error = new Vec3();
        this.effMassMatrix = new Mat33();
    }

    /**
     * Initialize the BallAndSocket. Sets defaults if a property was not already set.
     *
     * @method
     * @returns {undefined} undefined
     */
    init() {
        const w = this.anchor;

        const a = this.a;
        const b = this.b;

        const q1t = Quaternion.conjugate(a.orientation, new Quaternion());
        const q2t = Quaternion.conjugate(b.orientation, new Quaternion());

        this.rA = Vec3.subtract(w, a.position, new Vec3());
        this.rB = Vec3.subtract(w, b.position, new Vec3());

        this.bodyRA = q1t.rotateVector(this.rA, new Vec3());
        this.bodyRB = q2t.rotateVector(this.rB, new Vec3());
    }

    /**
     * Detect violations of the constraint. Warm start the constraint, if possible.
     *
     * @method
     * @param {Number} time - The current time in the physics engine.
     * @param {Number} dt - The physics engine frame delta.
     * @returns {undefined} undefined
     */
    update(time, dt) {
        const a = this.a;
        const b = this.b;

        const rA = a.orientation.rotateVector(this.bodyRA, this.rA);
        const rB = b.orientation.rotateVector(this.bodyRB, this.rB);

        const xRA = new Mat33([0,rA.z,-rA.y,-rA.z,0,rA.x,rA.y,-rA.x,0]);
        const xRB = new Mat33([0,rB.z,-rB.y,-rB.z,0,rB.x,rB.y,-rB.x,0]);

        const RIaRt = Mat33.multiply(xRA, a.inverseInertia, new Mat33()).multiply(xRA.transpose());
        const RIbRt = Mat33.multiply(xRB, b.inverseInertia, new Mat33()).multiply(xRB.transpose());

        const invEffInertia = Mat33.add(RIaRt, RIbRt, RIaRt);

        const worldA = Vec3.add(a.position, this.rA, this.anchor);
        const worldB = Vec3.add(b.position, this.rB, VEC2_REGISTER);

        Vec3.subtract(worldB, worldA, this.error);
        this.error.scale(0.2/dt);

        const imA = a.inverseMass;
        const imB = b.inverseMass;

        const invEffMass = new Mat33([imA + imB,0,0,0,imA + imB,0,0,0,imA + imB]);

        Mat33.add(invEffInertia, invEffMass, this.effMassMatrix);
        this.effMassMatrix.inverse();

        const impulse = this.impulse;
        const angImpulseA = this.angImpulseA;
        const angImpulseB = this.angImpulseB;

        b.applyImpulse(impulse);
        b.applyAngularImpulse(angImpulseB);
        impulse.invert();
        a.applyImpulse(impulse);
        a.applyAngularImpulse(angImpulseA);

        impulse.clear();
        angImpulseA.clear();
        angImpulseB.clear();
    }

    /**
     * Apply impulses to resolve the constraint.
     *
     * @method
     * @returns {undefined} undefined
     */
    resolve() {
        const a = this.a;
        const b = this.b;

        const rA = this.rA;
        const rB = this.rB;

        const v1 = Vec3.add(a.velocity, Vec3.cross(a.angularVelocity, rA, WxR_REGISTER), VB1_REGISTER);
        const v2 = Vec3.add(b.velocity, Vec3.cross(b.angularVelocity, rB, WxR_REGISTER), VB2_REGISTER);

        const impulse = v1.subtract(v2).subtract(this.error).applyMatrix(this.effMassMatrix);
        const angImpulseB = Vec3.cross(rB, impulse, VEC1_REGISTER);
        const angImpulseA = Vec3.cross(rA, impulse, VEC2_REGISTER).invert();

        b.applyImpulse(impulse);
        b.applyAngularImpulse(angImpulseB);
        impulse.invert();
        a.applyImpulse(impulse);
        a.applyAngularImpulse(angImpulseA);
        impulse.invert();

        this.impulse.add(impulse);
        this.angImpulseA.add(angImpulseA);
        this.angImpulseB.add(angImpulseB);
    }
}

module.exports = BallAndSocket;
