const THREE = require('three');
function getBulgeArc(p1, p2, bulge, segments = 16) {
    if (!bulge) return [new THREE.Vector3(p2.x, p2.y, 0)];
    
    const theta = 4 * Math.atan(bulge);
    const d = Math.hypot(p2.x - p1.x, p2.y - p1.y);
    const r = Math.abs(d / (2 * Math.sin(theta / 2)));
    
    // chord angle
    const alpha = Math.atan2(p2.y - p1.y, p2.x - p1.x);
    // distance from chord center to arc center
    const h = d / (2 * Math.tan(theta / 2));
    
    const mx = (p1.x + p2.x) / 2;
    const my = (p1.y + p2.y) / 2;
    
    // center of circle
    const cx = mx - h * Math.sin(alpha);
    const cy = my + h * Math.cos(alpha);
    
    let startAngle = Math.atan2(p1.y - cy, p1.x - cx);
    let endAngle = Math.atan2(p2.y - cy, p2.x - cx);
    
    // Fix angle wrap around
    const ccw = bulge > 0;
    if (ccw && endAngle < startAngle) endAngle += 2 * Math.PI;
    if (!ccw && startAngle < endAngle) startAngle += 2 * Math.PI;
    
    const curve = new THREE.EllipseCurve(cx, cy, r, r, startAngle, endAngle, !ccw, 0);
    // getPoints returns segments + 1 points (including start and end)
    // we drop the first point because it's p1, which is already in the array
    const pts = curve.getPoints(segments).map(p => new THREE.Vector3(p.x, p.y, 0));
    pts.shift(); // remove p1
    return pts;
}

const p1 = {x: 0, y: 0};
const p2 = {x: 10, y: 0};
const pts = getBulgeArc(p1, p2, 1, 8); // bulge 1 = semi-circle
console.log(pts);
