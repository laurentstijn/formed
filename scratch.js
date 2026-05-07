import fs from 'fs';
import { Font } from 'three/examples/jsm/loaders/FontLoader.js';
import { TTFLoader } from 'three/examples/jsm/loaders/TTFLoader.js';

const buffer = fs.readFileSync('./public/Plaster.ttf');
const fontData = new TTFLoader().parse(buffer.buffer);
const font = new Font(fontData);

try {
  const shapes = font.generateShapes("UW TEKST", 100);
  console.log("Shapes generated successfully:", shapes.length);
} catch (e) {
  console.log("Error generating shapes:", e);
}
