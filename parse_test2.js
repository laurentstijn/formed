const fs = require('fs');
const DxfParser = require('dxf-parser');
const parser = new DxfParser();
const dxf = fs.readFileSync('/Users/stijnlaurent/Downloads/Beugel.dxf', 'utf8');
const parsed = parser.parseSync(dxf);

let minX = Infinity, maxX = -Infinity;
parsed.entities.forEach(e => {
  if (e.layer === 'OUTER_PROFILES') {
    if (e.vertices) {
       e.vertices.forEach(v => {
          if (v.x < minX) minX = v.x;
          if (v.x > maxX) maxX = v.x;
       });
    }
  }
});
console.log(`OUTER_PROFILES X bounds: minX=${minX}, maxX=${maxX}`);
