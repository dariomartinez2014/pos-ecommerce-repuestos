// Prepara configuración privada local y credenciales aleatorias sin imprimir secretos.

// genera secretos privados y preserva las contraseñas del seed existente.
const fs = require('node:fs');
const path = require('node:path');
const { randomBytes } = require('node:crypto');
const root = path.resolve(__dirname, '..');
const local = path.join(root, '.local');
fs.mkdirSync(local, { recursive: true });
const configPath = path.join(local, 'config.json');
const config = fs.existsSync(configPath) ? JSON.parse(fs.readFileSync(configPath, 'utf8').replace(/^\uFEFF/, '')) : { port: 55433, database: 'pos_ecommerce', user: 'postgres', password: randomBytes(24).toString('hex') };
fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
const envPath = path.join(root, '.env');
const existing = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';
const current = {};
for (const line of existing.split(/\r?\n/)) {
  const match = line.match(/^([A-Z_]+)=(.*)$/);
  if (match) current[match[1]] = match[2].replace(/^['"]|['"]$/g, '');
}
// el ayudante local no reemplaza una conexión remota configurada manualmente.
if (current.DATABASE_URL && !['localhost', '127.0.0.1'].includes(new URL(current.DATABASE_URL).hostname)) {
  throw new Error('Tu .env apunta a una base remota. Usa npm start con esa configuración o guarda tu .env antes de preparar el entorno local.');
}
const url = `postgresql://${config.user}:${config.password}@127.0.0.1:${config.port}/${config.database}`;
const values = { ...current, DATABASE_URL: url, JWT_SECRET: current.JWT_SECRET || randomBytes(48).toString('hex'), SEED_PASSWORD: current.SEED_PASSWORD || randomBytes(18).toString('base64url'), PORT: current.PORT || '3000', NODE_ENV: 'development', CORS_ORIGINS: current.CORS_ORIGINS || 'http://localhost:3000', STORE_CURRENCY: 'GTQ' };
fs.writeFileSync(envPath, '# CONFIGURACIÓN PRIVADA: no subir a GitHub.\n' + Object.entries(values).map(([key, value]) => `${key}=${value}`).join('\n') + '\n');
// ACCESOS: el archivo se guarda dentro de .local, excluido de Git.
fs.writeFileSync(path.join(local, 'ACCESOS-DEMO.md'), `# Accesos privados de demostración\n\nSwagger: http://localhost:${values.PORT}/api/docs\n\n| Rol | Correo |\n| --- | --- |\n| Administrador | admin@repuestos.demo |\n| Cajero | cajero@repuestos.demo |\n| Cliente | cliente@repuestos.demo |\n\nContraseña para las tres cuentas: ${values.SEED_PASSWORD}\n\nEstos accesos son locales. No publiques este archivo. Cambiar SEED_PASSWORD después de crear cuentas no modifica sus contraseñas existentes.\n`);
console.log('Configuración local lista. Accesos guardados en .local/ACCESOS-DEMO.md.');
