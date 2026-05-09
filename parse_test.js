const fs = require('fs');
const DxfParser = require('dxf-parser');
const parser = new DxfParser();
const dxf = fs.readFileSync('/Users/stijnlaurent/Downloads/Beugel.dxf', 'utf8');
const parsed = parser.parseSync(dxf);

console.log("Entities in INTERIOR_PROFILES:");
parsed.entities.forEach(e => {
  if (e.layer === 'INTERIOR_PROFILES') {
    console.log(`Type: ${e.type}, center: ${JSON.stringify(e.center)}, extrusion: ${JSON.stringify(e.extrusionDirection)}`);
    if (e.type === 'CIRCLE') {
       console.log(`Radius: ${e.radius}, extZ: ${e.extrusionDirectionZ || (e.extrusionDirection && e.extrusionDirection.z)}`);
    }
  }
});

