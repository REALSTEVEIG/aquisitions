import arcjet, { tokenBucket } from '@arcjet/node';

const aj = arcjet({
  key: process.env.ARCJET_KEY,
  rules: [
    tokenBucket({
      mode: 'LIVE',
      characteristics: ['userId'],
      refillRate: 10,
      interval: 60,
      capacity: 20,
    }),
  ],
});

export default aj;
