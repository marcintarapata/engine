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

const Vec3 = require('../../math/Vec3');
const Constraint = require('./Constraint');

const SweepAndPrune = require('./collision/SweepAndPrune');
const BruteForce = require('./collision/BruteForce');
const ConvexCollision = require('./collision/ConvexCollisionDetection');
const gjk = ConvexCollision.gjk;
const epa = ConvexCollision.epa;
const ContactManifoldTable = require('./collision/ContactManifold');

const ObjectManager = require('../../utilities/ObjectManager');
ObjectManager.register('CollisionData', CollisionData);
const oMRequestCollisionData = ObjectManager.requestCollisionData;

const VEC_REGISTER = new Vec3();

/**
 * Helper function to clamp a value to a given range.
 *
 * @method
 * @private
 * @param {Number} value - The value to clamp.
 * @param {Number} lower - The lower end.
 * @param {Number} upper - The upper end.
 * @returns {Number} The clamped value.
 */
function clamp(value, lower, upper) {
    return value < lower ? lower : value > upper ? upper : value;
}

/**
 * Object maintaining various figures of a collision. Registered in ObjectManager.
 *
 * @class CollisionData
 * @param {Number} penetration - The degree of penetration.
 * @param {Vec3} normal - The normal for the collision.
 * @param {Vec3} worldContactA - The contact for A in world coordinates.
 * @param {Vec3} worldContactB - The contact for B in world coordinates.
 * @param {Vec3} localContactA - The contact for A in local coordinates.
 * @param {Vec3} localContactB - The contact for B in local coordinates.
 */
function CollisionData(penetration, normal, worldContactA, worldContactB, localContactA, localContactB) {
    this.penetration = penetration;
    this.normal = normal;
    this.worldContactA = worldContactA;
    this.worldContactB = worldContactB;
    this.localContactA = localContactA;
    this.localContactB = localContactB;
}

/**
 * Used by ObjectManager to reset the object with different data.
 *
 * @method
 * @param {Number} penetration - The degree of penetration.
 * @param {Vec3} normal - The normal for the collision.
 * @param {Vec3} worldContactA - The contact for A in world coordinates.
 * @param {Vec3} worldContactB - The contact for B in world coordinates.
 * @param {Vec3} localContactA - The contact for A in local coordinates.
 * @param {Vec3} localContactB - The contact for B in local coordinates.
 * @returns {CollisionData} this
 */
CollisionData.prototype.reset = function reset(penetration, normal, worldContactA, worldContactB, localContactA, localContactB) {
    this.penetration = penetration;
    this.normal = normal;
    this.worldContactA = worldContactA;
    this.worldContactB = worldContactB;
    this.localContactA = localContactA;
    this.localContactB = localContactB;

    return this;
};

/**
 * Ridid body Elastic Collision
 *
 * @class Collision
 * @extends Constraint
 * @param {Particle[]} targets - The bodies to track.
 * @param {Object} options - The options hash.
 */
class Collision extends Constraint {
    constructor(targets, options) {
        super(options);

        this.targets = [];
        if (targets) this.targets = this.targets.concat(targets);
    }

    /**
     * Initialize the Collision tracker. Sets defaults if a property was not already set.
     *
     * @method
     * @returns {undefined} undefined
     */
    init() {
        if (this.broadPhase) {
            const BroadPhase = this.broadphase;
            if (BroadPhase instanceof Function) this.broadPhase = new BroadPhase(this.targets);
        }
        else this.broadPhase = new SweepAndPrune(this.targets);
        this.contactManifoldTable = this.contactManifoldTable || new ContactManifoldTable();
    }

    /**
     * Collison detection. Updates the existing contact manifolds, runs the broadphase, and performs narrowphase
     * collision detection. Warm starts the contacts based on the results of the previous physics frame
     * and prepares necesssary calculations for the resolution.
     *
     * @method
     * @param {Number} time - The current time in the physics engine.
     * @param {Number} dt - The physics engine frame delta.
     * @returns {undefined} undefined
     */
    update(time, dt) {
        this.contactManifoldTable.update(dt);
        if (this.targets.length === 0) return;
        let i, len;
        for (i = 0, len = this.targets.length; i < len; i++) {
            this.targets[i].updateShape();
        }
        const potentialCollisions = this.broadPhase.update();
        let pair;
        for (i = 0, len = potentialCollisions.length; i < len; i++) {
            pair = potentialCollisions[i];
            if (pair) this.applyNarrowPhase(pair);
        }
        this.contactManifoldTable.prepContacts(dt);
    }

    /**
     * Apply impulses to resolve all Contact constraints.
     *
     * @method
     * @param {Number} time - The current time in the physics engine.
     * @param {Number} dt - The physics engine frame delta.
     * @returns {undefined} undefined
     */
    resolve(time, dt) {
        this.contactManifoldTable.resolveManifolds(dt);
    }

    /**
     * Add a target or targets to the collision system.
     *
     * @method
     * @param {Particle} target - The body to begin tracking.
     * @returns {undefined} undefined
     */
    addTarget(target) {
        this.targets.push(target);
        this.broadPhase.add(target);
    }

    /**
     * Remove a target or targets from the collision system.
     *
     * @method
     * @param {Particle} target - The body to remove.
     * @returns {undefined} undefined
     */
    removeTarget(target) {
        const index = this.targets.indexOf(target);
        if (index < 0) return;
        this.targets.splice(index, 1);
        this.broadPhase.remove(target);
    }

    /**
     * Narrowphase collision detection,
     * registers the Contact constraints for colliding bodies.
     *
     * Will detect the type of bodies in the collision.
     *
     * @method
     * @param {Particle[]} targets - The targets.
     * @returns {undefined} undefined
     */
    applyNarrowPhase(targets) {
        for (let i = 0, len = targets.length; i < len; i++) {
            for (let j = i + 1; j < len; j++) {
                const  a = targets[i];
                const b = targets[j];

                if ((a.collisionMask & b.collisionGroup && a.collisionGroup & b.collisionMask) === 0) continue;

                const collisionType = a.type | b.type;

                if (dispatch[collisionType]) dispatch[collisionType](this, a, b);
            }
        }
    }
}

const CONVEX = 1 << 0;
const BOX = 1 << 1;
const SPHERE = 1 << 2;
const WALL = 1 << 3;

const CONVEX_CONVEX = CONVEX | CONVEX;
const BOX_BOX = BOX | BOX;
const BOX_CONVEX = BOX | CONVEX;
const SPHERE_SPHERE = SPHERE | SPHERE;
const BOX_SPHERE = BOX | SPHERE;
const CONVEX_SPHERE = CONVEX | SPHERE;
const CONVEX_WALL = CONVEX | WALL;
const BOX_WALL = BOX | WALL;
const SPHERE_WALL = SPHERE | WALL;

const dispatch = {};
dispatch[CONVEX_CONVEX] = convexIntersectConvex;
dispatch[BOX_BOX] = convexIntersectConvex;
dispatch[BOX_CONVEX] = convexIntersectConvex;
dispatch[CONVEX_SPHERE] = convexIntersectConvex;
dispatch[SPHERE_SPHERE] = sphereIntersectSphere;
dispatch[BOX_SPHERE] = boxIntersectSphere;
dispatch[CONVEX_WALL] = convexIntersectWall;
dispatch[BOX_WALL] = convexIntersectWall;
dispatch[SPHERE_WALL] = convexIntersectWall;

/**
 * Detects sphere-sphere collisions and registers the Contact.
 *
 * @private
 * @method
 * @param {Object} context - The Collision instance.
 * @param {Sphere} sphere1 - One sphere collider.
 * @param {Sphere} sphere2 - The other sphere collider.
 * @returns {undefined} undefined
 */
function sphereIntersectSphere(context, sphere1, sphere2) {
    const p1 = sphere1.position;
    const p2 = sphere2.position;
    const relativePosition = Vec3.subtract(p2, p1, new Vec3());
    const distance = relativePosition.length();
    const sumRadii = sphere1.radius + sphere2.radius;
    const n = relativePosition.scale(1/distance);

    const overlap = sumRadii - distance;

    // Distance check
    if (overlap < 0) return;

    const rSphere1 = Vec3.scale(n, sphere1.radius, new Vec3());
    const rSphere2 = Vec3.scale(n, -sphere2.radius, new Vec3());

    const wSphere1 = Vec3.add(p1, rSphere1, new Vec3());
    const wSphere2 = Vec3.add(p2, rSphere2, new Vec3());

    const collisionData = oMRequestCollisionData().reset(overlap, n, wSphere1, wSphere2, rSphere1, rSphere2);

    context.contactManifoldTable.registerContact(sphere1, sphere2, collisionData);
}

/**
* Detects box-sphere collisions and registers the Contact.
*
* @param {Object} context - The Collision instance.
* @param {Box} box - The box collider.
* @param {Sphere} sphere - The sphere collider.
* @returns {undefined} undefined
*/
function boxIntersectSphere(context, box, sphere) {
    if (box.type === SPHERE) {
        const temp = sphere;
        sphere = box;
        box = temp;
    }

    const pb = box.position;
    const ps = sphere.position;
    const relativePosition = Vec3.subtract(ps, pb, VEC_REGISTER);

    const q = box.orientation;

    const r = sphere.radius;

    const bsize = box.size;
    const halfWidth = bsize[0]*0.5;
    const halfHeight = bsize[1]*0.5;
    const halfDepth = bsize[2]*0.5;

    // x, y, z
    const bnormals = box.normals;
    const n1 = q.rotateVector(bnormals[1], new Vec3());
    const n2 = q.rotateVector(bnormals[0], new Vec3());
    const n3 = q.rotateVector(bnormals[2], new Vec3());

    // Find the point on the cube closest to the center of the sphere
    const closestPoint = new Vec3();
    closestPoint.x = clamp(Vec3.dot(relativePosition,n1), -halfWidth, halfWidth);
    closestPoint.y = clamp(Vec3.dot(relativePosition,n2), -halfHeight, halfHeight);
    closestPoint.z = clamp(Vec3.dot(relativePosition,n3), -halfDepth, halfDepth);
    // The vector found is relative to the center of the unrotated box -- rotate it
    // to find the point w.r.t. to current orientation
    closestPoint.applyRotation(q);

    // The impact point in world space
    const impactPoint = Vec3.add(pb, closestPoint, new Vec3());
    const sphereToImpact = Vec3.subtract(impactPoint, ps, impactPoint);
    const distanceToSphere = sphereToImpact.length();

    // If impact point is not closer to the sphere's center than its radius -> no collision
    const overlap = r - distanceToSphere;
    if (overlap < 0) return;

    const n = Vec3.scale(sphereToImpact, -1 / distanceToSphere, new Vec3());
    const rBox = closestPoint;
    const rSphere = sphereToImpact;

    const wBox = Vec3.add(pb, rBox, new Vec3());
    const wSphere = Vec3.add(ps, rSphere, new Vec3());

    const collisionData = oMRequestCollisionData().reset(overlap, n, wBox, wSphere, rBox, rSphere);

    context.contactManifoldTable.registerContact(box, sphere, collisionData);
}

/**
* Detects convex-convex collisions and registers the Contact. Uses GJK to determine overlap and then
* EPA to determine the actual collision data.
*
* @param {Object} context - The Collision instance.
* @param {Particle} convex1 - One convex body collider.
* @param {Particle} convex2 - The other convex body collider.
* @returns {undefined} undefined
*/
function convexIntersectConvex(context, convex1, convex2) {
    const glkSimplex = gjk(convex1, convex2);

    // No simplex -> no collision
    if (!glkSimplex) return;

    const collisionData = epa(convex1, convex2, glkSimplex);
    if (collisionData !== null) context.contactManifoldTable.registerContact(convex1, convex2, collisionData);
}

/**
* Detects convex-wall collisions and registers the Contact.
*
* @param {Object} context - The Collision instance.
* @param {Particle} convex - The convex body collider.
* @param {Wall} wall - The wall collider.
* @returns {undefined} undefined
*/
function convexIntersectWall(context, convex, wall) {
    if (convex.type === WALL) {
        const temp = wall;
        wall = convex;
        convex = temp;
    }

    const convexPos = convex.position;
    const wallPos = wall.position;

    const n = wall.normal;
    const invN = wall.invNormal;

    const rConvex = convex.support(invN);
    const wConvex = Vec3.add(convexPos, rConvex, new Vec3());

    const diff = Vec3.subtract(wConvex, wallPos, VEC_REGISTER);

    const penetration = Vec3.dot(diff, invN);

    if (penetration < 0) return;

    const wWall = Vec3.scale(n, penetration, new Vec3()).add(wConvex);
    const rWall = Vec3.subtract(wWall, wall.position, new Vec3());

    const collisionData = oMRequestCollisionData().reset(penetration, invN, wConvex, wWall, rConvex, rWall);

    context.contactManifoldTable.registerContact(convex, wall, collisionData);
}

Collision.SweepAndPrune = SweepAndPrune;
Collision.BruteForce = BruteForce.BruteForce;
Collision.BruteForceAABB = BruteForce.BruteForceAABB;

module.exports = Collision;
