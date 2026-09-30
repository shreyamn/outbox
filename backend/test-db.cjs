const { PrismaClient } = require('./node_modules/@prisma/client');
const p = new PrismaClient();
const connect = '$connect';
const disconnect = '$disconnect';
p[connect]()
  .then(() => { console.log('DB OK'); return p[disconnect](); })
  .catch(e => { console.error('ERR:', e.message); process.exit(1); });
