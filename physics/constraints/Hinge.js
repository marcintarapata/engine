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
const VEC3_REGISTER = new Vec3();
const VEC4_REGISTER = new Vec3();
const VB1_REGISTER = new Vec3();
const VB2_REGISTER = new Vec3();
const WxR_REGISTER = new Vec3();
const DELTA_REGISTER = new Vec3();

/**
 * A constraint that confines two bodies to the plane defined by the axis of the hinge.
 *
 * @class Hinge
 * @extends Constraint
 * @param {Particle} a - One of the bodies.
 * @param {Particle} b - The other body.
 * @param {Options} options - The options hash.
 *
 */
class Hinge extends Constraint {
    constructor(a, b, options) {
        super(options);

        this.a = a;
        this.b = b;
        this.impulse = new Vec3();
        this.angImpulseA = new Vec3();
        this.angImpulseB = new Vec3();
        this.error = new Vec3();
        this.errorRot = [0,0];
        this.effMassMatrix = new Mat33();
        this.effMassMatrixRot = [];
    }

    /**
     * Initialize the Hinge. Sets defaults if a property was not already set.
     *
     * @method
     * @returns {undefined} undefined
     */
    init() {
        const w = this.anchor;

        const u = this.axis.normalize();

        const a = this.a;
        const b = this.b;

        const q1t = Quaternion.conjugate(a.orientation, new Quaternion());
        const q2t = Quaternion.conjugate(b.orientation, new Quaternion());

        this.rA = Vec3.subtract(w, a.position, new Vec3());
        this.rB = Vec3.subtract(w, b.position, new Vec3());

        this.bodyRA = q1t.rotateVector(this.rA, new Vec3());
        this.bodyRB = q2t.rotateVector(this.rB, new Vec3());

        this.axisA = Vec3.clone(u);
        this.axisB = Vec3.clone(u);

        this.axisBTangent1 = new Vec3();
        this.axisBTangent2 = new Vec3();

        this.t1xA = new Vec3();
        this.t2xA = new Vec3();

        this.bodyAxisA = q1t.rotateVector(u, new Vec3());
        this.bodyAxisB = q2t.rotateVector(u, new Vec3());
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

        const axisA = a.orientation.rotateVector(this.bodyAxisA, this.axisA);
        const axisB = b.orientation.rotateVector(this.bodyAxisB, this.axisB);
        this.axis.copy(axisB);

        const n = axisB;
        const t1 = this.axisBTangent1;
        const t2 = this.axisBTangent2;

        if (n.x >= 0.57735) {
            t1.set(n.y, -n.x, 0);
        }
        else {
            t1.set(0, n.z, -n.y);
        }
        t1.normalize();
        Vec3.cross(n, t1, t2);

        const t1xA = Vec3.cross(t1, axisA, this.t1xA);
        const t2xA = Vec3.cross(t2, axisA, this.t2xA);

        const rA = a.orientation.rotateVector(this.bodyRA, this.rA);
        const rB = b.orientation.rotateVector(this.bodyRB, this.rB);

        const xRA = new Mat33([0,rA.z,-rA.y,-rA.z,0,rA.x,rA.y,-rA.x,0]);
        const xRB = new Mat33([0,rB.z,-rB.y,-rB.z,0,rB.x,rB.y,-rB.x,0]);

        const RIaRt = Mat33.multiply(xRA, a.inverseInertia, new Mat33()).multiply(xRA.transpose());
        const RIbRt = Mat33.multiply(xRB, b.inverseInertia, new Mat33()).multiply(xRB.transpose());

        const invEffInertia = Mat33.add(RIaRt, RIbRt, RIaRt);

        const worldA = Vec3.add(a.position, this.rA, this.anchor);
        const worldB = Vec3.add(b.position, this.rB, VEC1_REGISTER);

        const invDt = 1/dt;
        Vec3.subtract(worldB, worldA, this.error);
        this.error.scale(0.2*invDt);

        const imA = a.inverseMass;
        const imB = b.inverseMass;

        const invEffMass = new Mat33([imA + imB,0,0,0,imA + imB,0,0,0,imA + imB]);

        Mat33.add(invEffInertia, invEffMass, this.effMassMatrix);
        this.effMassMatrix.inverse();

        const invIAt1xA = a.inverseInertia.vectorMultiply(t1xA, VEC1_REGISTER);
        const invIAt2xA = a.inverseInertia.vectorMultiply(t2xA, VEC2_REGISTER);
        const invIBt1xA = b.inverseInertia.vectorMultiply(t1xA, VEC3_REGISTER);
        const invIBt2xA = b.inverseInertia.vectorMultiply(t2xA, VEC4_REGISTER);

        const a11 = Vec3.dot(t1xA, invIAt1xA) + Vec3.dot(t1xA, invIBt1xA);
        const a12 = Vec3.dot(t1xA, invIAt2xA) + Vec3.dot(t1xA, invIBt2xA);
        const a21 = Vec3.dot(t2xA, invIAt1xA) + Vec3.dot(t2xA, invIBt1xA);
        const a22 = Vec3.dot(t2xA, invIAt2xA) + Vec3.dot(t2xA, invIBt2xA);

        const det = 1 / (a11*a22 - a12*a21);

        this.effMassMatrixRot[0] = a22 * det;
        this.effMassMatrixRot[1] = -a21 * det;
        this.effMassMatrixRot[2] = -a12 * det;
        this.effMassMatrixRot[3] = a11 * det;

        this.errorRot[0] = Vec3.dot(axisA, t1) * 0.2*invDt;
        this.errorRot[1] = Vec3.dot(axisA, t2) * 0.2*invDt;

        const impulse = this.impulse.scale(0.5);
        const angImpulseA = this.angImpulseA.scale(0.5);
        const angImpulseB = this.angImpulseB.scale(0.5);

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

        const t1xA = this.t1xA;
        const t2xA = this.t2xA;

        const w1 = a.angularVelocity;
        const w2 = b.angularVelocity;

        const v1 = Vec3.add(a.velocity, Vec3.cross(w1, rA, WxR_REGISTER), VB1_REGISTER);
        const v2 = Vec3.add(b.velocity, Vec3.cross(w2, rB, WxR_REGISTER), VB2_REGISTER);

        const impulse = v1.subtract(v2).subtract(this.error).applyMatrix(this.effMassMatrix);

        const diffW = Vec3.subtract(w2, w1, DELTA_REGISTER);

        const errorRot = this.errorRot;
        const jv1 = Vec3.dot(t1xA, diffW) + errorRot[0];
        const jv2 = Vec3.dot(t2xA, diffW) + errorRot[1];

        const K = this.effMassMatrixRot;

        const l1 = -(K[0]*jv1 + K[1]*jv2);
        const l2 = -(K[2]*jv1 + K[3]*jv2);

        const angImpulse = Vec3.scale(t1xA, l1, VEC2_REGISTER).add(Vec3.scale(t2xA, l2, VEC3_REGISTER));

        const angImpulseB = Vec3.cross(rB, impulse, VEC1_REGISTER).add(angImpulse);
        const angImpulseA = Vec3.cross(rA, impulse, VEC4_REGISTER).invert().subtract(angImpulse);

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

module.exports = Hinge;
