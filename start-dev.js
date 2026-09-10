const { spawn } = require('child_process');
const os = require('os');

function getNetworkIp() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return '0.0.0.0';
}

const ip = getNetworkIp();
console.log(`\n\x1b[36m[Network Config]\x1b[0m Local URL: \x1b[32mhttp://localhost:3000\x1b[0m`);
console.log(`\x1b[36m[Network Config]\x1b[0m Network URL: \x1b[32mhttp://${ip}:3000\x1b[0m\n`);

const child = spawn('npx', ['next', 'dev', '-H', '0.0.0.0', '-p', '3000'], { stdio: 'inherit', shell: true });

child.on('exit', code => process.exit(code));
