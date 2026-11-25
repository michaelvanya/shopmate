import { sequelize } from '../models/index.js';
await sequelize.sync({ alter: process.argv.includes('--alter') });
console.log('✅ Tables created/updated'); await sequelize.close();
