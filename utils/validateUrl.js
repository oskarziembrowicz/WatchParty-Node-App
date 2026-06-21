const dns = require('dns').promises;
const net = require('net');

function isPrivateIp(ip) {
  if (!net.isIP(ip)) {
    return true;
  }

  if (net.isIPv4(ip)) {
    const parts = ip.split('.').map(Number);

    return (
      parts[0] === 10 ||
      parts[0] === 127 ||
      (parts[0] === 169 && parts[1] === 254) ||
      (parts[0] === 192 && parts[1] === 168) ||
      (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31)
    );
  }

  return ip === '::1' || ip.startsWith('fc') || ip.startsWith('fe80');
}

async function validateHttpUrl(value) {
  let parsed;

  try {
    parsed = new URL(value);
  } catch {
    throw new Error('Invalid URL');
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new Error('URL must use http or https');
  }

  const addresses = await dns.resolve(parsed.hostname);

  if (addresses.some(isPrivateIp)) {
    throw new Error('URL points to private network');
  }

  return parsed.href;
}

module.exports = {
  validateHttpUrl,
};
