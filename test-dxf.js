const Drawing = require('dxf-writer');
const d = new Drawing();
d.setUnits('Millimeters');
d.addLayer('OUTLINE', Drawing.ACI.WHITE, 'CONTINUOUS');
d.setActiveLayer('OUTLINE');
try {
  d.drawRect(-10, -10, 10, 10);
  console.log("drawRect works");
} catch(e) {
  console.log("drawRect error:", e.message);
}
console.log(d.toDxfString().slice(0, 100));
