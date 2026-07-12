#!/usr/bin/env node
/**
 * Vedaz Chat — Database Purge Script
 * Usage: npm run db:purge
 *
 * Deletes ALL messages and users from the MongoDB database.
 * Requires MONGO_URI to be set in backend/.env
 */

require('dotenv').config();
const mongoose = require('mongoose');
const readline = require('readline');

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('\n❌  MONGO_URI is not set in .env — aborting.\n');
  process.exit(1);
}

// ─── Inline minimal models (avoids full app bootstrap) ──────────────────────
const MessageSchema = new mongoose.Schema({}, { strict: false, collection: 'messages' });
const UserSchema    = new mongoose.Schema({}, { strict: false, collection: 'users' });
const Message = mongoose.model('Message', MessageSchema);
const User    = mongoose.model('User',    UserSchema);

// ─── Confirmation prompt ─────────────────────────────────────────────────────
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

const ask = (q) => new Promise((resolve) => rl.question(q, resolve));

(async () => {
  console.log('\n⚠️   VEDAZ CHAT — DATABASE PURGE');
  console.log('─'.repeat(40));
  console.log(`  Target DB : ${MONGO_URI.replace(/:([^@]+)@/, ':****@')}`);
  console.log('─'.repeat(40));
  console.log('  This will permanently delete ALL messages and ALL users.\n');

  const answer = await ask('  Type "yes" to confirm: ');
  rl.close();

  if (answer.trim().toLowerCase() !== 'yes') {
    console.log('\n  Aborted — no data was deleted.\n');
    process.exit(0);
  }

  console.log('\n  Connecting to MongoDB…');

  try {
    await mongoose.connect(MONGO_URI);
    console.log('  ✅  Connected.\n');

    const [msgResult, userResult] = await Promise.all([
      Message.deleteMany({}),
      User.deleteMany({}),
    ]);

    console.log(`  🗑   Messages deleted : ${msgResult.deletedCount}`);
    console.log(`  🗑   Users deleted    : ${userResult.deletedCount}`);
    console.log('\n  ✅  Purge complete.\n');
  } catch (err) {
    console.error(`\n  ❌  Error: ${err.message}\n`);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
})();
