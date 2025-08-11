"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
const typeorm_1 = require("typeorm");
const config_1 = require("@nestjs/config");
const dotenv_1 = require("dotenv");
const entities = require("./src/common/entities");
(0, dotenv_1.config)();
const configService = new config_1.ConfigService();
exports.AppDataSource = new typeorm_1.DataSource({
    type: 'postgres',
    host: configService.get('DB_HOST', 'localhost'),
    port: configService.get('DB_PORT', 5432),
    username: configService.get('DB_USERNAME', 'postgres'),
    password: configService.get('DB_PASSWORD'),
    database: configService.get('DB_NAME', 'ecommerce_db'),
    entities: Object.values(entities),
    migrations: ['src/database/migrations/*{.ts,.js}'],
    synchronize: false,
    logging: ['error', 'warn', 'migration'],
    ssl: configService.get('NODE_ENV') === 'production' ? { rejectUnauthorized: false } : false,
});
exports.default = exports.AppDataSource;
//# sourceMappingURL=ormconfig.js.map