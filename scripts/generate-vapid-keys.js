#!/usr/bin/env node

/**
 * Script to generate VAPID keys for push notifications
 * Run: node scripts/generate-vapid-keys.js
 */

const webpush = require('web-push')

console.log('Generating VAPID keys for push notifications...\n')

const vapidKeys = webpush.generateVAPIDKeys()

console.log('VAPID Keys Generated:\n')
console.log('Public Key (add to .env as NEXT_PUBLIC_VAPID_PUBLIC_KEY):')
console.log(vapidKeys.publicKey)
console.log('\nPrivate Key (add to .env as VAPID_PRIVATE_KEY):')
console.log(vapidKeys.privateKey)
console.log('\nVAPID Subject (add to .env as VAPID_SUBJECT, optional):')
console.log('mailto:admin@expira.io')
console.log('\nAdd these to your .env file:')
console.log('NEXT_PUBLIC_VAPID_PUBLIC_KEY=' + vapidKeys.publicKey)
console.log('VAPID_PRIVATE_KEY=' + vapidKeys.privateKey)
console.log('VAPID_SUBJECT=mailto:admin@expira.io')

