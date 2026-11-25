// Creates the dedicated admin account with a unique, randomly generated password.
//   npm run create-admin -- --email you@example.com --name "Your Name"
// Add --password "..." to choose your own (must meet the password rules).
import bcrypt from 'bcryptjs';
import { sequelize, User } from '../models/index.js';
import { generatePassword, passwordRule } from '../utils/password.js';

const arg = (k) => { const i = process.argv.indexOf('--' + k); return i > -1 ? process.argv[i + 1] : undefined; };
const email = arg('email'), name = arg('name') || 'Admin';
if (!email) { console.error('Usage: npm run create-admin -- --email you@example.com [--name "Your Name"] [--password "..."]'); process.exit(1); }
await sequelize.sync();
if (await User.findOne({ where: { email: email.toLowerCase() } })) { console.error('A user with that email already exists.'); process.exit(1); }
const chosen = arg('password');
if (chosen) { const { error } = passwordRule.validate(chosen); if (error) { console.error(error.message); process.exit(1); } }
const password = chosen || generatePassword(18);
await User.create({ name, email, role: 'admin', passwordHash: await bcrypt.hash(password, 12), mustChangePassword: true });
console.log(`\n✅ Admin created\n   Email:    ${email}\n   Password: ${password}\n\nSave this now, it is not shown again. You must change it at first sign-in.\nThen turn on two-factor (POST /api/auth/2fa/setup).\n`);
await sequelize.close();
