"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jwtConstants = void 0;
exports.jwtConstants = {
    secret: process.env.JWT_SECRET || 'defaultSecretKey',
    expiresIn: '1d'
};
//# sourceMappingURL=constants.js.map