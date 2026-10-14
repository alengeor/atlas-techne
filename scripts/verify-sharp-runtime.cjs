'use strict';

const sharp = require('sharp');

void sharp({ create: { width: 1, height: 1, channels: 4, background: '#00000000' } })
  .png()
  .toBuffer()
  .then(buffer => sharp(buffer).metadata())
  .then(metadata => {
    if (metadata.format !== 'png' || metadata.width !== 1 || metadata.height !== 1) {
      throw new Error('La operación de prueba de sharp produjo un resultado inválido.');
    }
    process.stdout.write(`sharp ${sharp.versions.sharp} / libvips ${sharp.versions.vips} validado en Electron ${process.versions.electron}.\n`);
  })
  .catch(error => {
    console.error(error);
    process.exitCode = 1;
  });
