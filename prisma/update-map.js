const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

const newUrl = 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d884.9892956038706!2d88.43015!3d27.23811!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39e69f52b4f9f64b%3A0x94732fff6207d7ef!2sPoudyal%20Farm!5e0!3m2!1sen!2sin!4v1718272000000!5m2!1sen!2sin';

p.setting.upsert({
  where:  { key: 'map_embed_url' },
  update: { value: newUrl },
  create: { key: 'map_embed_url', value: newUrl },
})
.then(r => console.log('Map updated:', r.key))
.catch(e => console.error(e))
.finally(() => p.$disconnect());
