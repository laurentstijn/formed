const Drawing = require('dxf-writer');
const d = new Drawing();
try {
  d.drawPolyline([[0,0], [10,10], [20,0]]);
  console.log("drawPolyline works");
} catch(e) {
  console.log("drawPolyline error:", e.message);
}
