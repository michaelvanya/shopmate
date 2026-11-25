import http from 'node:http';
import { env } from './config/env.js';
import { sequelize, User } from './models/index.js';
import app from './app.js';
import { initRegistry, getTenantModel } from './config/registry.js';
import { initTenantPool, getTenantPool } from './config/tenantPool.js';

const server = http.createServer(app);

// Initialize multi-tenant infrastructure if enabled
if (env.multiTenantEnabled) {
  console.log('🏢 Multi-tenant mode enabled');
  try {
    const registry = initRegistry();
    await registry.authenticate();
    if (env.dbSync) {
      const Tenant = getTenantModel();
      await Tenant.sync({ alter: true });
    }
    console.log('✅ Registry database ready');
  } catch (e) {
    console.error('❌ Registry database connection failed:', e.message);
    process.exit(1);
  }
  
  initTenantPool();
  console.log('✅ Tenant connection pool initialized');
}

try {
  await sequelize.authenticate();
  if (env.dbSync) await sequelize.sync();
  console.log('✅ Database ready');
  if ((await User.count()) === 0) console.log(env.isProd && !env.setupKey ? '⚠️  No admin account exists yet and SETUP_KEY is not set: the first person to open the app can create it. Set SETUP_KEY, or open the app and create your account right now.' : '👋 No admin account yet. Open the app and create it on the first-time setup screen.');
} catch (e) { console.error('❌ Database connection failed:', e.message); process.exit(1); }
server.listen(env.port, () => { console.log(`✅ Identity API on http://localhost:${env.port}`); });
for (const sig of ['SIGINT', 'SIGTERM']) process.on(sig, async () => {
  server.close(async () => {
    if (env.multiTenantEnabled) {
      await getTenantPool().closeAll();
    }
    await sequelize.close();
    process.exit(0);
  });
});
