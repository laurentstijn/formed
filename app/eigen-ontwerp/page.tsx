"use client";

import React, { useState, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment, ContactShadows, Center } from "@react-three/drei";
import * as THREE from "three";
import { SiteHeader } from "@/components/site-header";
import { useCart } from "@/components/cart-provider";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase/client";
import DxfParser from 'dxf-parser';
import { NURBSCurve } from 'three/examples/jsm/curves/NURBSCurve.js';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

// Simpele basis materialen
const materials = {
  inox: new THREE.MeshStandardMaterial({
    color: "#a8adb0",
    metalness: 0.8,
    roughness: 0.3,
  }),
  chroom: new THREE.MeshStandardMaterial({
    color: "#e8ecef",
    metalness: 1.0,
    roughness: 0.1,
  }),
  messing: new THREE.MeshStandardMaterial({
    color: "#d4af37",
    metalness: 0.9,
    roughness: 0.2,
  })
};

function extractAllPaths(dxfData: any, rawText?: string) {
  let allLayers: Record<string, THREE.Vector3[][]> = {};
  
  // SCAN FOR MIRRORED CIRCLES IN RAW TEXT (since dxf-parser drops code 230)
  const flippedCircles: {x: number, y: number}[] = [];
  if (rawText) {
     const lines = rawText.split(/\r?\n/).map(l => l.trim());
     for(let i=0; i<lines.length; i++) {
        if (lines[i] === 'CIRCLE') {
           let x = null, y = null, extZ = null;
           for(let j=i+1; j<i+30 && j<lines.length; j++) {
              const code = lines[j];
              if (code === '0') break;
              const val = parseFloat(lines[j+1]);
              if (code === '10') x = val;
              if (code === '20') y = val;
              if (code === '230') extZ = val;
              j++;
           }
           if (x !== null && y !== null && extZ !== null && extZ < 0) {
              flippedCircles.push({x, y});
           }
        }
     }
  }
  
  const extract = (entities: any[], parentMatrix = new THREE.Matrix4()) => {
    entities.forEach(ent => {
      if (ent.type === 'INSERT') {
        const block = dxfData.blocks[ent.name];
        if (block && block.entities) {
          const px = ent.position ? ent.position.x : 0;
          const py = ent.position ? ent.position.y : 0;
          const pz = ent.position ? ent.position.z : 0;
          const scaleX = ent.scaleX !== undefined ? ent.scaleX : 1;
          const scaleY = ent.scaleY !== undefined ? ent.scaleY : 1;
          const scaleZ = ent.scaleZ !== undefined ? ent.scaleZ : 1;
          // DXF parser usually provides rotation in degrees for INSERT
          const rotZ = ent.rotation ? (ent.rotation * Math.PI / 180) : 0; 

          const m = new THREE.Matrix4();
          m.compose(
            new THREE.Vector3(px, py, pz),
            new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), rotZ),
            new THREE.Vector3(scaleX, scaleY, scaleZ)
          );

          const childMatrix = parentMatrix.clone().multiply(m);
          extract(block.entities, childMatrix);
        }
      } else {
        const layerName = ent.layer || '0';
        if (!allLayers[layerName]) allLayers[layerName] = [];
        
        let points: THREE.Vector3[] = [];
        if (ent.type === 'LINE') {
          points = [
            new THREE.Vector3(ent.vertices[0].x, ent.vertices[0].y, 0),
            new THREE.Vector3(ent.vertices[1].x, ent.vertices[1].y, 0)
          ];
        } else if (ent.type === 'LWPOLYLINE' || ent.type === 'POLYLINE') {
          const vertices = ent.vertices;
          for (let i = 0; i < vertices.length; i++) {
            const p1 = vertices[i];
            points.push(new THREE.Vector3(p1.x, p1.y, 0));
            
            if (p1.bulge && Math.abs(p1.bulge) > 1e-6) {
              const isLast = i === vertices.length - 1;
              if (isLast && !(ent.shape || ent.closed)) {
                continue;
              }
              const p2 = isLast ? vertices[0] : vertices[i + 1];
              
              const bulge = p1.bulge;
              const theta = 4 * Math.atan(bulge);
              const d = Math.hypot(p2.x - p1.x, p2.y - p1.y);
              const r = Math.abs(d / (2 * Math.sin(theta / 2)));
              const alpha = Math.atan2(p2.y - p1.y, p2.x - p1.x);
              const h = d / (2 * Math.tan(theta / 2));
              
              const mx = (p1.x + p2.x) / 2;
              const my = (p1.y + p2.y) / 2;
              const cx = mx - h * Math.sin(alpha);
              const cy = my + h * Math.cos(alpha);
              
              let startAngle = Math.atan2(p1.y - cy, p1.x - cx);
              let endAngle = Math.atan2(p2.y - cy, p2.x - cx);
              
              const ccw = bulge > 0;
              if (ccw && endAngle < startAngle) endAngle += 2 * Math.PI;
              if (!ccw && startAngle < endAngle) startAngle += 2 * Math.PI;
              
              const curve = new THREE.EllipseCurve(cx, cy, r, r, startAngle, endAngle, !ccw, 0);
              const divisions = Math.max(4, Math.min(16, Math.floor(theta * r / 5)));
              const arcPts = curve.getPoints(divisions).map(p => new THREE.Vector3(p.x, p.y, 0));
              arcPts.shift(); // Verwijder startpunt (al toegevoegd)
              arcPts.pop();   // Verwijder eindpunt (wordt in volgende iteratie of close toegevoegd)
              points.push(...arcPts);
            }
          }
          if (ent.shape || ent.closed) {
            points.push(new THREE.Vector3(vertices[0].x, vertices[0].y, 0));
          }
        } else if (ent.type === 'CIRCLE') {
          const divisions = Math.max(32, Math.min(128, Math.floor(ent.radius * 2)));
          const curve = new THREE.EllipseCurve(ent.center.x, ent.center.y, ent.radius, ent.radius, 0, 2 * Math.PI, false, 0);
          points = curve.getPoints(divisions).map(p => new THREE.Vector3(p.x, p.y, 0));
          
          // Apply manual fix for dxf-parser bug (ignoring code 230 for circles)
          if (flippedCircles.some(c => Math.abs(c.x - ent.center.x) < 0.001 && Math.abs(c.y - ent.center.y) < 0.001)) {
             points = points.map(p => new THREE.Vector3(-p.x, p.y, p.z));
          }
        } else if (ent.type === 'ARC') {
          const curve = new THREE.EllipseCurve(ent.center.x, ent.center.y, ent.radius, ent.radius, ent.startAngle, ent.endAngle, false, 0);
          const divisions = Math.max(16, Math.min(64, Math.floor(Math.abs(ent.endAngle - ent.startAngle) * ent.radius)));
          points = curve.getPoints(divisions).map(p => new THREE.Vector3(p.x, p.y, 0));
        } else if (ent.type === 'ELLIPSE') {
          const angle = Math.atan2(ent.majorAxisEndPoint.y, ent.majorAxisEndPoint.x);
          const rx = Math.sqrt(ent.majorAxisEndPoint.x*ent.majorAxisEndPoint.x + ent.majorAxisEndPoint.y*ent.majorAxisEndPoint.y);
          const ry = rx * ent.axisRatio;
          const curve = new THREE.EllipseCurve(ent.center.x, ent.center.y, rx, ry, ent.startAngle, ent.endAngle, false, angle);
          const divisions = Math.max(32, Math.min(128, Math.floor(rx * 2)));
          points = curve.getPoints(divisions).map(p => new THREE.Vector3(p.x, p.y, 0));
        } else if (ent.type === 'SPLINE') {
          if (ent.knotValues && ent.controlPoints) {
            const degree = ent.degreeOfSplineCurve || 3;
            const ctrlPts = ent.controlPoints.map((p: any) => new THREE.Vector4(p.x, p.y, p.z || 0, p.weight || 1));
            const knots = ent.knotValues;
            try {
              const curve = new NURBSCurve(degree, knots, ctrlPts);
              const divisions = Math.min(200, Math.max(32, ctrlPts.length * 3));
              points = curve.getPoints(divisions).map(p => new THREE.Vector3(p.x, p.y, 0));
              if (ent.closed && points.length > 0) {
                 points.push(points[0].clone());
              }
            } catch (e) {
              console.warn("Failed to create NURBSCurve, falling back to control points", e);
              const pts = ent.controlPoints || ent.fitPoints || ent.vertices || [];
              points = pts.map((v: any) => new THREE.Vector3(v.x, v.y, 0));
            }
          } else {
            const pts = ent.controlPoints || ent.fitPoints || ent.vertices || [];
            points = pts.map((v: any) => new THREE.Vector3(v.x, v.y, 0));
          }
        }
        
        if (points.length > 0) {
          // Check for Object Coordinate System (OCS) mirroring (Arbitrary Axis Algorithm)
          // If extrusion direction Z is negative, the X axis is mirrored.
          let extZ = 1;
          if (ent.extrusionDirectionZ !== undefined) {
             extZ = ent.extrusionDirectionZ;
          } else if (ent.extrusionDirection && ent.extrusionDirection.z !== undefined) {
             extZ = ent.extrusionDirection.z;
          }
          
          if (extZ < 0) {
             points = points.map(p => new THREE.Vector3(-p.x, p.y, p.z));
          }

          // Apply transformation matrix (translation, rotation, scale from INSERT)
          points.forEach(p => p.applyMatrix4(parentMatrix));
          allLayers[layerName].push(points);
        }
      }
    });
  };
  
  if (dxfData && dxfData.entities) {
    extract(dxfData.entities);
  }
  
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  Object.values(allLayers).forEach(layerPaths => {
    layerPaths.forEach(path => {
      path.forEach(v => {
        if (v.x < minX) minX = v.x;
        if (v.x > maxX) maxX = v.x;
        if (v.y < minY) minY = v.y;
        if (v.y > maxY) maxY = v.y;
      });
    });
  });
  
  let width = 200, length = 200;
  if (minX !== Infinity) {
    width = Math.max(1, maxX - minX);
    length = Math.max(1, maxY - minY);
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    
    Object.keys(allLayers).forEach(layer => {
      allLayers[layer] = allLayers[layer].map(path => 
        path.map(v => new THREE.Vector3(v.x - centerX, v.y - centerY, 0))
      );
    });
  }
  
  const layersArray = Object.keys(allLayers).map(name => {
    const paths = allLayers[name];
    const loops = mergePaths(paths);
    loops.sort((a,b) => getLoopArea(b) - getLoopArea(a));
    return {
      name,
      paths,
      loops
    };
  });
  
  return { layers: layersArray, width, length };
}

function mergePaths(paths: THREE.Vector3[][]): THREE.Vector3[][] {
  if (paths.length === 0) return [];
  let unmerged = [...paths];
  let merged: THREE.Vector3[][] = [];
  
  while(unmerged.length > 0) {
    let current = [...unmerged.shift()!];
    let added = true;
    
    while(added) {
      added = false;
      for(let i=0; i<unmerged.length; i++) {
        const p = unmerged[i];
        const eps = 0.5; // tolerantie voor aansluitende lijnen
        if (p[0].distanceTo(current[current.length-1]) < eps) {
           current = [...current, ...p.slice(1)];
           unmerged.splice(i, 1);
           added = true; break;
        } else if (p[p.length-1].distanceTo(current[current.length-1]) < eps) {
           current = [...current, ...[...p].reverse().slice(1)];
           unmerged.splice(i, 1);
           added = true; break;
        } else if (p[p.length-1].distanceTo(current[0]) < eps) {
           current = [...p, ...current.slice(1)];
           unmerged.splice(i, 1);
           added = true; break;
        } else if (p[0].distanceTo(current[0]) < eps) {
           current = [...[...p].reverse(), ...current.slice(1)];
           unmerged.splice(i, 1);
           added = true; break;
        }
      }
    }
    merged.push(current);
  }
  return merged;
}

function getLoopArea(loop: THREE.Vector3[]) {
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for(const p of loop) {
     if(p.x < minX) minX = p.x;
     if(p.x > maxX) maxX = p.x;
     if(p.y < minY) minY = p.y;
     if(p.y > maxY) maxY = p.y;
  }
  return (maxX === -Infinity) ? 0 : (maxX - minX) * (maxY - minY);
}

function DxfRenderer({ dxfLayers, layerSettings }) {
  return (
    <group>
      {dxfLayers && dxfLayers.map((layer: any) => {
        const mode = layerSettings[layer.name] || 'graveren';
        if (mode === 'negeren') return null;
        
        const loops = layer.loops || layer.paths;

        return loops.map((loop: THREE.Vector3[], i: number) => {
          let isCut = false;
          if (mode === 'snijden') isCut = true;
          else if (mode === 'omtrek' && i === 0) isCut = true;
          
          const color = isCut ? '#000000' : '#888888';
          const lineWidth = isCut ? 3 : 1;

          const geo = new THREE.BufferGeometry().setFromPoints(loop);
          return (
            <line key={`${layer.name}-${i}`} geometry={geo}>
              <lineBasicMaterial color={color} linewidth={lineWidth} />
            </line>
          );
        });
      })}
    </group>
  );
}

function CustomDesignModel({ width, length, thickness, materialType, dxfLayers, layerSettings, invertCut, wantsPowderCoating, powderCoatingColor }) {
  const plateMaterial = React.useMemo(() => {
    if (wantsPowderCoating) {
      return new THREE.MeshStandardMaterial({ 
        color: powderCoatingColor, 
        metalness: 0.1, 
        roughness: 0.8,
        side: THREE.DoubleSide
      });
    }
    return materials[materialType] || materials.inox;
  }, [materialType, wantsPowderCoating, powderCoatingColor]);

  const geometry = React.useMemo(() => {
    let cutPathsRaw: THREE.Vector3[][] = [];
    
    dxfLayers.forEach((layer: any) => {
      const mode = layerSettings[layer.name] || 'graveren';
      const loops = layer.loops || layer.paths;
      if (mode === 'snijden') {
        cutPathsRaw.push(...loops);
      } else if (mode === 'omtrek' && loops.length > 0) {
        cutPathsRaw.push(loops[0]);
      }
    });
      
    // Merge all cut paths across all cut layers
    const cutLoops = mergePaths(cutPathsRaw);
    const shapes: THREE.Shape[] = [];

    if (cutLoops.length > 0) {
      // 1. Bereken bounding boxes
      const loopsWithBounds = cutLoops.map(loop => {
        let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
        for(const p of loop) {
           if(p.x < minX) minX = p.x;
           if(p.x > maxX) maxX = p.x;
           if(p.y < minY) minY = p.y;
           if(p.y > maxY) maxY = p.y;
        }
        return { loop, minX, maxX, minY, maxY, originalDepth: 0, depth: 0, isHole: false, isDropped: false, parentIndex: -1, shape: null as THREE.Shape | null };
      });

      // Sorteer op oppervlakte (grootste eerst)
      loopsWithBounds.sort((a,b) => ((b.maxX - b.minX) * (b.maxY - b.minY)) - ((a.maxX - a.minX) * (a.maxY - a.minY)));

      // 2. Bepaal nesting diepte (Shape of Hole)
      for(let i = 0; i < loopsWithBounds.length; i++) {
        let depth = 0;
        let directParent = -1;
        const child = loopsWithBounds[i];
        
        for(let j = i - 1; j >= 0; j--) {
          const parent = loopsWithBounds[j];
          const eps = 0.5; // tolerantie
          if (child.minX >= parent.minX - eps && child.maxX <= parent.maxX + eps &&
              child.minY >= parent.minY - eps && child.maxY <= parent.maxY + eps) {
             directParent = j;
             depth = parent.originalDepth + 1;
             break;
          }
        }
        
        child.originalDepth = depth;
        child.depth = invertCut ? depth - 1 : depth;
        child.isDropped = child.depth < 0;
        child.isHole = (child.depth % 2 !== 0);
        if (child.isHole) {
          child.parentIndex = directParent;
        }
      }

      // 3. Maak Shapes
      loopsWithBounds.forEach(item => {
        if (!item.isDropped && !item.isHole) {
          const shape = new THREE.Shape();
          let pathPoints = [...item.loop];
          if (THREE.ShapeUtils.isClockWise(pathPoints)) {
            pathPoints.reverse();
          }
          shape.moveTo(pathPoints[0].x, pathPoints[0].y);
          for(let k=1; k<pathPoints.length; k++) {
            shape.lineTo(pathPoints[k].x, pathPoints[k].y);
          }
          item.shape = shape;
          shapes.push(shape);
        }
      });

      // 4. Voeg gaten toe aan hun Parent Shape
      loopsWithBounds.forEach(item => {
        if (!item.isDropped && item.isHole && item.parentIndex !== -1) {
          const parent = loopsWithBounds[item.parentIndex];
          if (parent && !parent.isDropped && parent.shape) {
            let holePoints = [...item.loop];
            if (!THREE.ShapeUtils.isClockWise(holePoints)) {
              holePoints.reverse();
            }
            const holePath = new THREE.Path();
            holePath.moveTo(holePoints[0].x, holePoints[0].y);
            for(let k=1; k<holePoints.length; k++) {
              holePath.lineTo(holePoints[k].x, holePoints[k].y);
            }
            parent.shape.holes.push(holePath);
          }
        }
      });
    } else {
      // Fallback: gewone rechthoekige plaat
      const shape = new THREE.Shape();
      const halfW = width / 2;
      const halfL = length / 2;
      shape.moveTo(-halfW, -halfL);
      shape.lineTo(halfW, -halfL);
      shape.lineTo(halfW, halfL);
      shape.lineTo(-halfW, halfL);
      shape.lineTo(-halfW, -halfL);
      shapes.push(shape);
    }

    return new THREE.ExtrudeGeometry(shapes, {
      depth: thickness,
      bevelEnabled: false,
    });
  }, [width, length, thickness, dxfLayers, layerSettings, invertCut]);

  return (
    <group>
      <mesh geometry={geometry} material={plateMaterial} castShadow receiveShadow rotation={[-Math.PI/2, 0, 0]} />
      
      {dxfLayers && dxfLayers.length > 0 && (
        <group position={[0, thickness + 0.1, 0]} rotation={[-Math.PI/2, 0, 0]}>
          <DxfRenderer dxfLayers={dxfLayers} layerSettings={layerSettings} />
        </group>
      )}
    </group>
  );
}

export default function EigenOntwerpConfigurator() {
  const { addItem } = useCart();
  const router = useRouter();
  const controlsRef = useRef<any>(null);
  
  const [pricingSettings, setPricingSettings] = useState<any>(null);
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [invertCut, setInvertCut] = useState(false);
  const quantities = [1, 10, 25, 100, 500];

  const [wantsPowderCoating, setWantsPowderCoating] = useState(false);
  const [powderCoatingColor, setPowderCoatingColor] = useState('#0a0a0a'); // RAL 9005

  const ralColors = [
    { hex: '#0a0a0a', name: 'RAL 9005 (Gitzwart)' },
    { hex: '#f4f4f4', name: 'RAL 9010 (Zuiver wit)' },
    { hex: '#383e42', name: 'RAL 7016 (Antracietgrijs)' },
    { hex: '#cc0605', name: 'RAL 3020 (Verkeersrood)' },
    { hex: '#20214f', name: 'RAL 5002 (Ultramarijnblauw)' },
  ];

  React.useEffect(() => {
    async function loadSettings() {
      try {
        const supabase = createBrowserClient()
        const { data } = await supabase
          .from("settings")
          .select("value")
          .eq("key", "custom_design_settings")
          .maybeSingle()
        if (data?.value) {
          setPricingSettings(JSON.parse(data.value))
        }
      } catch (e) {
        console.error("Fout bij laden van prijzen", e)
      }
    }
    loadSettings()
  }, [])
  
  const [length, setLength] = useState(200);
  const [width, setWidth] = useState(200);
  const [thickness, setThickness] = useState(3);
  const [materialType, setMaterialType] = useState("inox");
  const [bewerking, setBewerking] = useState("graveren");
  
  const [dxfLayers, setDxfLayers] = useState<any[]>([]);
  const [layerSettings, setLayerSettings] = useState<Record<string, 'snijden' | 'graveren' | 'omtrek' | 'negeren'>>({});
  const [dxfFileName, setDxfFileName] = useState("");
  const [dxfContent, setDxfContent] = useState("");
  
  const [isExporting, setIsExporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setDxfFileName(file.name);
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setDxfContent(content);
      try {
        const parser = new DxfParser();
        const parsedDxf = parser.parseSync(content);
        
        const { layers, width: extractedWidth, length: extractedLength } = extractAllPaths(parsedDxf, content);
        setDxfLayers(layers);
        
        const defaultSettings: Record<string, 'snijden' | 'graveren'> = {};
        layers.forEach((l: any) => {
           defaultSettings[l.name] = l.name.toLowerCase().includes('cut') || l.name.toLowerCase().includes('snij') ? 'snijden' : 'graveren';
        });
        setLayerSettings(defaultSettings);
        
        // Update afmetingen o.b.v. DXF bounding box
        setWidth(Number(extractedWidth.toFixed(1)));
        setLength(Number(extractedLength.toFixed(1)));
        
      } catch (err) {
        console.error("Fout bij parsen van DXF", err);
        alert("Kon DXF bestand niet correct inlezen. Zorg dat het een geldig 2D ASCII DXF bestand is.");
      }
    };
    reader.readAsText(file);
  };

  // Dynamische prijs en info
  let cutLength = 0;
  let engraveLength = 0;
  let totalPaths = 0;
  
  dxfLayers.forEach(layer => {
    const mode = layerSettings[layer.name] || 'graveren';
    const loops = layer.loops || layer.paths;
    
    if (mode === 'snijden') {
      loops.forEach((loop: any) => {
        totalPaths++;
        for(let i = 0; i < loop.length - 1; i++) cutLength += loop[i].distanceTo(loop[i+1]);
      });
    } else if (mode === 'omtrek') {
      if (loops.length > 0) {
         totalPaths++;
         for(let i = 0; i < loops[0].length - 1; i++) cutLength += loops[0][i].distanceTo(loops[0][i+1]);
      }
      for(let j = 1; j < loops.length; j++) {
         totalPaths++;
         for(let i = 0; i < loops[j].length - 1; i++) engraveLength += loops[j][i].distanceTo(loops[j][i+1]);
      }
    } else {
      loops.forEach((loop: any) => {
        totalPaths++;
        for(let i = 0; i < loop.length - 1; i++) engraveLength += loop[i].distanceTo(loop[i+1]);
      });
    }
  });

  // --- PRIJSTABEL ---
  const startCost = pricingSettings?.startCost ?? 25;
  
  const pricePerKg = {
    inox: pricingSettings?.pricePerKgInox ?? 8.00,
    chroom: pricingSettings?.pricePerKgChroom ?? 10.00,
    messing: pricingSettings?.pricePerKgMessing ?? 15.00
  };

  const cuttingPricePerMeter = pricingSettings?.cuttingPricePerMeter ?? 4.00;
  const engravePricePerMeter = pricingSettings?.engravePricePerMeter ?? 2.00;
  // ------------------

  const volumeMm3 = length * width * thickness;
  const weightKg = volumeMm3 * 0.00000785; // Dichtheid staal (7.85 g/cm3)
  
  const currentMaterialPrice = pricePerKg[materialType as keyof typeof pricePerKg] || 8;
  const materialCost = weightKg * currentMaterialPrice;
  
  const cuttingCost = (cutLength / 1000) * cuttingPricePerMeter;
  const engraveCost = (engraveLength / 1000) * engravePricePerMeter;
  
  const unitProductionCost = materialCost + cuttingCost + engraveCost;
  
  let coatingUnitPrice = 0;
  if (wantsPowderCoating) {
    const areaM2 = (width * length * 2) / 1000000;
    const coatingSetup = 25.00;
    const coatingPerItem = areaM2 * 45.00;
    coatingUnitPrice = (coatingSetup / selectedQuantity) + coatingPerItem;
  }
  
  const unitPrice = (startCost / selectedQuantity) + unitProductionCost + coatingUnitPrice;
  const totalPrice = unitPrice * selectedQuantity;

  const handleAddToCart = async () => {
    if (dxfLayers.length === 0) {
      alert("Upload eerst een DXF bestand");
      return;
    }
    
    setIsExporting(true);
    try {
      let snapshotDataUrl = "/images/eigen-ontwerp.png";
      const canvas = document.querySelector('canvas');
      if (canvas) {
        try {
          const base64 = canvas.toDataURL('image/jpeg', 0.8);
          const res = await fetch(base64);
          const blob = await res.blob();
          const formData = new FormData();
          formData.append("file", blob, `snapshot_${Date.now()}.jpg`);
          
          const uploadRes = await fetch("/api/upload", {
            method: "POST",
            body: formData,
          });
          
          if (uploadRes.ok) {
            const data = await uploadRes.json();
            snapshotDataUrl = data.url;
          } else {
            snapshotDataUrl = base64;
          }
        } catch (e) {
          console.error("Kon geen snapshot maken", e);
        }
      }

      const selectedRal = ralColors.find(c => c.hex === powderCoatingColor);
      const ralName = selectedRal ? selectedRal.name : powderCoatingColor;

      addItem({
        id: `eigen-ontwerp-${Date.now()}` as any,
        name: `Eigen Ontwerp: ${length}x${width}x${thickness}mm${wantsPowderCoating ? ` (Poedercoating ${ralName})` : ''}`,
        price: Number(unitPrice.toFixed(2)),
        quantity: selectedQuantity,
        image: snapshotDataUrl,
        color: wantsPowderCoating ? ralName : materialType,
        dxf_string: dxfContent,
        dxf_filename: `custom_${dxfFileName}`,
        layer_settings: JSON.stringify({ ...layerSettings, invertCut, wantsPowderCoating, powderCoatingColor: ralName })
      });
      
      router.push('/cart');
    } catch (err) {
      console.error(err);
      alert("Er is een fout opgetreden bij het toevoegen.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SiteHeader />
      
      <div className="flex flex-col md:flex-row flex-1">
        <div className="w-full md:w-[400px] bg-white border-r border-zinc-200 flex flex-col h-[55vh] md:h-[calc(100vh-64px)] order-2 md:order-1">
          <div className="p-6 md:p-8 flex-1 overflow-y-auto space-y-8">
            <div>
              <h1 className="text-2xl font-light tracking-widest text-zinc-900 mb-2">EIGEN ONTWERP</h1>
              <p className="text-zinc-500 text-sm">Upload je DXF voor graveren of snijden op een staalplaat</p>
            </div>

            <div className="space-y-6">
              <div className="space-y-4">
                <label className="text-xs font-semibold tracking-wider text-zinc-400 uppercase">DXF Upload</label>
                <div>
                  <input 
                    type="file" 
                    accept=".dxf" 
                    className="hidden" 
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                  />
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-3 px-4 border-2 border-dashed border-zinc-300 rounded-md text-sm font-medium text-zinc-600 hover:border-black hover:text-black transition-colors"
                  >
                    {dxfFileName ? `✓ ${dxfFileName}` : "+ Kies DXF Bestand"}
                  </button>
                  {dxfLayers.length > 0 && (
                    <div className="text-xs text-green-600 mt-2 space-y-1">
                      <p>✓ DXF succesvol ingeladen ({totalPaths} paden, {dxfLayers.length} lagen)</p>
                      <p>✓ Afmetingen: {length} x {width} mm</p>
                      <p>✓ Snijlengte: {(cutLength / 1000).toFixed(2)} meter</p>
                      <p>✓ Graveerlengte: {(engraveLength / 1000).toFixed(2)} meter</p>
                      <p>✓ Gewicht: {weightKg.toFixed(2)} kg</p>
                    </div>
                  )}
                </div>
              </div>

              {dxfLayers.length > 0 && (
                <Accordion type="single" collapsible defaultValue="item-1" className="w-full space-y-4">
                  <AccordionItem value="item-1" className="border-b-0 bg-zinc-50/50 rounded-lg border border-zinc-200 px-4 data-[state=open]:bg-white transition-colors">
                    <AccordionTrigger className="hover:no-underline py-4">
                      <span className="text-sm font-semibold tracking-wider text-zinc-800 uppercase">1. Materiaal & Dikte</span>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-6 pb-4">
                      <div className="space-y-4">
                        <label className="text-xs font-semibold tracking-wider text-zinc-400 uppercase">Plaat Dikte (mm)</label>
                        <div className="grid grid-cols-4 gap-2">
                          {[1, 2, 3, 4].map((t) => (
                            <button
                              key={t}
                              onClick={() => setThickness(t)}
                              className={`py-2 px-3 rounded-md border text-sm font-medium transition-colors ${
                                thickness === t 
                                  ? 'bg-black text-white border-black' 
                                  : 'bg-transparent border-zinc-200 text-zinc-600 hover:bg-zinc-50'
                              }`}
                            >
                              {t} mm
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <label className="text-xs font-semibold tracking-wider text-zinc-400 uppercase">Materiaal</label>
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            onClick={() => setMaterialType('inox')}
                            className={`py-2 px-3 rounded-md border text-sm font-medium transition-colors ${
                              materialType === 'inox' 
                                ? 'bg-black text-white border-black' 
                                : 'bg-transparent border-zinc-200 text-zinc-600 hover:bg-zinc-50'
                            }`}
                          >
                            Geborsteld INOX
                          </button>
                          <button
                            onClick={() => setMaterialType('chroom')}
                            className={`py-2 px-3 rounded-md border text-sm font-medium transition-colors ${
                              materialType === 'chroom' 
                                ? 'bg-black text-white border-black' 
                                : 'bg-transparent border-zinc-200 text-zinc-600 hover:bg-zinc-50'
                            }`}
                          >
                            Polijst Chroom
                          </button>
                          <button
                            onClick={() => setMaterialType('messing')}
                            className={`py-2 px-3 rounded-md border text-sm font-medium transition-colors ${
                              materialType === 'messing' 
                                ? 'bg-black text-white border-black' 
                                : 'bg-transparent border-zinc-200 text-zinc-600 hover:bg-zinc-50'
                            }`}
                          >
                            Goud / Messing
                          </button>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-semibold tracking-wider text-zinc-400 uppercase">Poedercoaten (RAL Kleuren)</label>
                          <button 
                            onClick={() => setWantsPowderCoating(!wantsPowderCoating)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${wantsPowderCoating ? 'bg-black' : 'bg-zinc-200'}`}
                          >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${wantsPowderCoating ? 'translate-x-6' : 'translate-x-1'}`} />
                          </button>
                        </div>
                        
                        {wantsPowderCoating && (
                          <div className="bg-card border border-border rounded-md p-3">
                            <p className="text-xs text-zinc-500 mb-3">Kies een RAL kleur voor de poedercoating. Dit voegt een setupkost van €25 toe en €45 per m².</p>
                            <div className="relative">
                              <select 
                                value={powderCoatingColor}
                                onChange={(e) => setPowderCoatingColor(e.target.value)}
                                className="w-full appearance-none bg-white border border-zinc-200 text-zinc-700 py-2 pl-10 pr-8 rounded-md text-sm focus:outline-none focus:border-zinc-400 cursor-pointer"
                              >
                                {ralColors.map(c => (
                                  <option key={c.hex} value={c.hex}>{c.name}</option>
                                ))}
                              </select>
                              <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border border-black/10 shadow-sm" style={{ backgroundColor: powderCoatingColor }} />
                              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-2" className="border-b-0 bg-zinc-50/50 rounded-lg border border-zinc-200 px-4 data-[state=open]:bg-white transition-colors">
                    <AccordionTrigger className="hover:no-underline py-4">
                      <span className="text-sm font-semibold tracking-wider text-zinc-800 uppercase">2. Geavanceerde Instellingen</span>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-6 pb-4">
                      <div className="space-y-4">
                        <label className="text-xs font-semibold tracking-wider text-zinc-400 uppercase">Lagen & Bewerkingen</label>
                        <div className="space-y-3">
                          {dxfLayers.map(layer => (
                            <div key={layer.name} className="flex flex-col gap-2 bg-card p-3 rounded-md border border-border">
                              <span className="text-sm font-medium text-zinc-700">Laag: {layer.name}</span>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                <button
                                  onClick={() => setLayerSettings(prev => ({ ...prev, [layer.name]: 'graveren' }))}
                                  className={`py-1.5 px-2 rounded text-xs font-medium transition-colors ${
                                    layerSettings[layer.name] === 'graveren' 
                                      ? 'bg-black text-white' 
                                      : 'bg-transparent text-zinc-500 border border-zinc-200 hover:bg-zinc-100'
                                  }`}
                                >
                                  Graveren
                                </button>
                                <button
                                  onClick={() => setLayerSettings(prev => ({ ...prev, [layer.name]: 'snijden' }))}
                                  className={`py-1.5 px-2 rounded text-xs font-medium transition-colors ${
                                    layerSettings[layer.name] === 'snijden' 
                                      ? 'bg-black text-white' 
                                      : 'bg-transparent text-zinc-500 border border-zinc-200 hover:bg-zinc-100'
                                  }`}
                                >
                                  Alles Snijden
                                </button>
                                <button
                                  onClick={() => setLayerSettings(prev => ({ ...prev, [layer.name]: 'omtrek' }))}
                                  className={`py-1.5 px-2 rounded text-xs font-medium transition-colors ${
                                    layerSettings[layer.name] === 'omtrek' 
                                      ? 'bg-black text-white' 
                                      : 'bg-transparent text-zinc-500 border border-zinc-200 hover:bg-zinc-100'
                                  }`}
                                >
                                  Omtrek Snijden
                                </button>
                                <button
                                  onClick={() => setLayerSettings(prev => ({ ...prev, [layer.name]: 'negeren' }))}
                                  className={`py-1.5 px-2 rounded text-xs font-medium transition-colors ${
                                    layerSettings[layer.name] === 'negeren' 
                                      ? 'bg-red-500 text-white border-red-500' 
                                      : 'bg-transparent text-zinc-500 border border-zinc-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200'
                                  }`}
                                >
                                  Negeren
                                </button>
                              </div>
                            </div>
                          ))}
                          <p className="text-xs text-zinc-500 leading-relaxed mt-2">
                            Tip: Met "Omtrek Snijden" wordt de grootste buitenste rand uitgesneden, en worden alle overige binnenste lijnen van deze laag gegraveerd.
                          </p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <label className="text-xs font-semibold tracking-wider text-zinc-400 uppercase">Weergave / Snijgedrag</label>
                        <div className="bg-card border border-border rounded-md p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-zinc-700">Logo Inverteren (Negatief/Positief)</span>
                            <button 
                              onClick={() => setInvertCut(!invertCut)}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${invertCut ? 'bg-black' : 'bg-zinc-200'}`}
                            >
                              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${invertCut ? 'translate-x-6' : 'translate-x-1'}`} />
                            </button>
                          </div>
                          <p className="text-xs text-zinc-500">
                            {invertCut 
                              ? "Positief (Onderdelen): De buitenste rand wordt genegeerd, de binnenste objecten (zoals losse letters) worden uitgesneden." 
                              : "Negatief (Stencil): De buitenste rand wordt als staalplaat gezien, met het ontwerp eruit gesneden."}
                          </p>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              )}

            </div>
          </div>

          <div className="p-6 md:p-8 bg-secondary border-t border-border shrink-0 z-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
            {dxfLayers.length > 0 && (
              <div className="mb-6">
                <label className="text-xs font-semibold tracking-wider text-zinc-400 uppercase mb-3 block">Hoeveelheid (Stuks)</label>
                <div className="flex flex-wrap gap-2">
                  {quantities.map(q => {
                    const pricePerItem = (startCost / q) + unitProductionCost;
                    return (
                      <button
                        key={q}
                        onClick={() => setSelectedQuantity(q)}
                        className={`flex-1 min-w-[70px] flex flex-col items-center justify-center py-2 px-1 rounded-md border transition-colors ${
                          selectedQuantity === q 
                            ? 'bg-black text-white border-black' 
                            : 'bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-100'
                        }`}
                      >
                        <span className="text-sm font-bold">{q}</span>
                        <span className="text-[10px] mt-1 opacity-80 whitespace-nowrap">€{pricePerItem.toFixed(2)}/st</span>
                      </button>
                    )
                  })}
                  
                  <div className={`flex-1 min-w-[80px] flex flex-col items-center justify-center py-2 px-1 rounded-md border transition-colors relative ${
                    !quantities.includes(selectedQuantity) ? 'bg-black text-white border-black' : 'bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-100'
                  }`}>
                    <input 
                      type="number" 
                      min="1" 
                      value={!quantities.includes(selectedQuantity) ? selectedQuantity : ""} 
                      onChange={(e) => setSelectedQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      placeholder="Typ..."
                      className="w-full text-center bg-transparent outline-none text-sm font-bold placeholder:font-normal placeholder:text-[11px]"
                    />
                    {!quantities.includes(selectedQuantity) && (
                       <span className="text-[10px] mt-1 opacity-80 whitespace-nowrap">€{((startCost / selectedQuantity) + unitProductionCost).toFixed(2)}/st</span>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm text-zinc-500 uppercase tracking-wider">Totaal Prijs</span>
              <span className="text-xl font-medium text-zinc-900">€ {totalPrice.toFixed(2)}</span>
            </div>
            <button
              onClick={handleAddToCart}
              disabled={isExporting || dxfLayers.length === 0}
              className={`w-full py-4 px-6 rounded-md text-sm font-medium uppercase tracking-wider transition-colors ${
                isExporting || dxfLayers.length === 0 ? 'bg-zinc-200 text-zinc-400 cursor-not-allowed' : 'bg-black text-white hover:bg-zinc-800'
              }`}
            >
              {isExporting ? 'Laden...' : dxfLayers.length === 0 ? 'Upload DXF om te bestellen' : `Voeg ${selectedQuantity} ${selectedQuantity === 1 ? 'stuk' : 'stuks'} toe`}
            </button>
          </div>
        </div>

        {/* Rechter paneel: 3D Weergave */}
        <div className="flex-1 bg-background relative h-[45vh] md:h-auto order-1 md:order-2">
          <Canvas shadows camera={{ position: [0, 400, 400], fov: 45 }} gl={{ preserveDrawingBuffer: true }}>
            <color attach="background" args={["#fdf8f8"]} />
            <ambientLight intensity={0.5} />
            <directionalLight
              position={[10, 20, 10]}
              intensity={1}
              castShadow
              shadow-mapSize={[1024, 1024]}
            />
            
            <Center>
              {dxfLayers.length > 0 && (
                <CustomDesignModel 
                  width={width} 
                  length={length} 
                  thickness={thickness} 
                  materialType={materialType}
                  dxfLayers={dxfLayers}
                  layerSettings={layerSettings}
                  invertCut={invertCut}
                  wantsPowderCoating={wantsPowderCoating}
                  powderCoatingColor={powderCoatingColor}
                />
              )}
            </Center>
            
            <ContactShadows 
              position={[0, -2, 0]} 
              opacity={0.4} 
              scale={2000} 
              blur={2} 
              far={100} 
            />
            
            <OrbitControls 
              ref={controlsRef}
              makeDefault 
              minPolarAngle={0} 
              maxPolarAngle={Math.PI / 2.1} 
              enableDamping
            />
            <Environment preset="studio" />
          </Canvas>

          <button 
            onClick={() => controlsRef.current?.reset()}
            className="absolute top-6 right-6 w-10 h-10 bg-white border border-zinc-200 rounded-md shadow-sm flex items-center justify-center text-zinc-600 hover:bg-zinc-50 hover:text-black transition-colors z-10"
            title="Reset Camera"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
          </button>
          
          <div className="absolute bottom-6 right-6 text-xs font-medium tracking-widest text-zinc-400 uppercase">
            SLEEP OM TE DRAAIEN • SCROLL OM TE ZOOMEN
          </div>
        </div>
      </div>
    </div>
  );
}
