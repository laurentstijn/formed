const Drawing = require('dxf-writer');
const d = new Drawing();
try {
  d.drawText(0, 0, 20, 90, "TEST", "center", "middle");
  console.log("drawText works");
} catch(e) {
  console.log("drawText error:", e.message);
}
