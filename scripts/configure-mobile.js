#!/usr/bin/env node

/**
 * Mobile App Configuration Script
 * 
 * Automatically configures the mobile app with your local IP address
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import os from 'os';

console.log('\n🔧 Configuring Mobile App for Local Development...\n');

// Get local IP address
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // Skip internal and non-IPv4 addresses
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  
  return 'localhost';
}

const localIP = getLocalIP();
const webUrl = `http://${localIP}:5000`;

console.log(`📍 Detected local IP: ${localIP}`);
console.log(`🌐 Web URL will be: ${webUrl}\n`);

// Update mobile/app.json
try {
  const appJsonPath = 'mobile/app.json';
  const appJson = JSON.parse(readFileSync(appJsonPath, 'utf8'));
  
  // Add webUrl to expo.extra
  if (!appJson.expo.extra) {
    appJson.expo.extra = {};
  }
  appJson.expo.extra.webUrl = webUrl;
  
  writeFileSync(appJsonPath, JSON.stringify(appJson, null, 2));
  console.log('✅ Updated mobile/app.json with local IP\n');
} catch (error) {
  console.error('❌ Failed to update mobile/app.json:', error.message);
  process.exit(1);
}

console.log('📱 Mobile app is now configured!\n');
console.log('Next steps:');
console.log('   1. Make sure web app is running: npm run dev');
console.log('   2. Start mobile app: npm run mobile');
console.log('   3. Scan QR code with Expo Go app on your phone\n');

console.log('⚠️  Important:');
console.log('   - Your phone must be on the same WiFi network');
console.log(`   - Web app must be accessible at: ${webUrl}`);
console.log('   - If you change networks, run this script again\n');
