"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.winstonConfig = void 0;
const nest_winston_1 = require("nest-winston");
const winston = require("winston");
exports.winstonConfig = nest_winston_1.WinstonModule.createLogger({
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({
            filename: 'logs/verification.log',
            level: 'info',
            format: winston.format.combine(winston.format.timestamp(), winston.format.json())
        }),
        new winston.transports.File({
            filename: 'logs/errors.log',
            level: 'error'
        })
    ]
});
//# sourceMappingURL=winston.config.js.map