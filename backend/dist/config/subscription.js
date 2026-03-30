"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPlanLimit = exports.PLAN_LIMITS = void 0;
exports.PLAN_LIMITS = {
    FREE: 50,
    STARTER: 500,
    GROWTH: 5000,
    AGENCY: 1000000,
};
const getPlanLimit = (plan) => {
    return exports.PLAN_LIMITS[plan] ?? exports.PLAN_LIMITS.FREE;
};
exports.getPlanLimit = getPlanLimit;
