"use client";

import React, { useState, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, Text3D, Center, ContactShadows } from "@react-three/drei";
import * as THREE from "three";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";
import { TTFLoader } from "three/examples/jsm/loaders/TTFLoader.js";
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import { ErrorBoundary } from 'react-error-boundary';
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import Drawing from "dxf-writer";
import { useCart } from "@/components/cart-provider";
import { useRouter } from "next/navigation";

interface ShowerDrainProps {
  length: number;
  width: number;
  height: number;
  thickness: number;
  text: string;
  patternType: string;
  materialType: string;
  fontData: any;
}

function ShowerDrainModel({ length, width, height, thickness, text, patternType, materialType, fontData }: ShowerDrainProps) {
  // Luxe materialen opzetten met useMemo zodat ze niet elke frame opnieuw opbouwen
  const materials = React.useMemo(() => ({
    inox: new THREE.MeshStandardMaterial({
      color: "#a8adb0",
      metalness: 0.85,
      roughness: 0.35,
      envMapIntensity: 1.2,
    }),
    chrome: new THREE.MeshPhysicalMaterial({
      color: "#ffffff",
      metalness: 1.0,
      roughness: 0.05,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
      envMapIntensity: 2.0,
    }),
    messing: new THREE.MeshPhysicalMaterial({
      color: "#c6a87c",
      metalness: 0.8,
      roughness: 0.4,
      clearcoat: 0.3,
      clearcoatRoughness: 0.2,
      envMapIntensity: 0.8,
    }),
  }), []);

  const steelMaterial = materials[materialType as keyof typeof materials] || materials.inox;

  // Realistische plooiradius (standaard plaatwerk: binnenradius = dikte, buitenradius R = dikte * 2)
  const R = thickness * 2;

  // 1. Tekst Bounding Box & Paden berekenen
  const { clearance, textPaths } = React.useMemo(() => {
    let realClearance = 15;
    const paths: THREE.Path[] = [];

    if (!text || !fontData) return { clearance: 0, textPaths: paths };
    try {
      const font = new FontLoader().parse(fontData);
      const shapes = font.generateShapes(text.toUpperCase(), width * 0.4);
      let xMin = Infinity, xMax = -Infinity, yMin = Infinity, yMax = -Infinity;
      shapes.forEach(s => {
        s.getPoints().forEach(p => {
          if (p.x < xMin) xMin = p.x;
          if (p.x > xMax) xMax = p.x;
          if (p.y < yMin) yMin = p.y;
          if (p.y > yMax) yMax = p.y;
        });
      });
      realClearance = (xMax - xMin) / 2 + 15;

      const offsetX = -(xMax + xMin) / 2;
      const offsetY = -(yMax + yMin) / 2;

      shapes.forEach(letterShape => {
        const points = letterShape.getPoints(4); // 4 is laag genoeg voor performance
        const letterPath = new THREE.Path();
        points.forEach((p, i) => {
          const px = p.x + offsetX;
          const py = p.y + offsetY;
          // 90 graden rotatie
          const rotX = -py; 
          const rotY = px;
          if (i === 0) letterPath.moveTo(rotX, rotY);
          else letterPath.lineTo(rotX, rotY);
        });
        paths.push(letterPath);
      });
      
      return { clearance: realClearance, textPaths: paths };
    } catch (e) {
      console.error("Font error", e);
      return { clearance: 0, textPaths: paths };
    }
  }, [text, fontData, width]);

  // Wiskunde voor de Top Plaat (Solid, patroongaten, géén CSG)
  const topPlateGeometry = React.useMemo(() => {
    const visualWidth = width - 2 * R;
    const shapeFull = new THREE.Shape();
    shapeFull.moveTo(-visualWidth / 2, -length / 2);
    shapeFull.lineTo(visualWidth / 2, -length / 2);
    shapeFull.lineTo(visualWidth / 2, length / 2);
    shapeFull.lineTo(-visualWidth / 2, length / 2);
    shapeFull.lineTo(-visualWidth / 2, -length / 2);

    // 2. Patroon Gaten met Ronde Hoeken (Radius)
    const edgeMargin = 20;
    const usableLength = length - 2 * edgeMargin;

    if (patternType === "vierkant") {
      const holeSize = 6, holeSpacing = 4, numRows = 3;
      const step = holeSize + holeSpacing;
      if (step > 2) {
        const numCols = Math.floor(usableLength / step);
        const startY = -((numCols * step) / 2) + step / 2;
        const rowStep = holeSize + holeSpacing;
        const totalPatternWidth = numRows * holeSize + (numRows - 1) * holeSpacing;
        const startX = -totalPatternWidth / 2 + holeSize / 2;

        for (let c = 0; c < numCols; c++) {
          const y = startY + c * step;
          if (Math.abs(y) > clearance || text === "") {
            for (let r = 0; r < numRows; r++) {
              const x = startX + r * rowStep;
              const holePath = new THREE.Path();
              const rRadius = 1;
              const w = holeSize;
              const h = holeSize;
              holePath.moveTo(x - w/2 + rRadius, y + h/2);
              holePath.lineTo(x + w/2 - rRadius, y + h/2);
              holePath.absarc(x + w/2 - rRadius, y + h/2 - rRadius, rRadius, Math.PI/2, 0, true);
              holePath.lineTo(x + w/2, y - h/2 + rRadius);
              holePath.absarc(x + w/2 - rRadius, y - h/2 + rRadius, rRadius, 0, -Math.PI/2, true);
              holePath.lineTo(x - w/2 + rRadius, y - h/2);
              holePath.absarc(x - w/2 + rRadius, y - h/2 + rRadius, rRadius, -Math.PI/2, -Math.PI, true);
              holePath.lineTo(x - w/2, y + h/2 - rRadius);
              holePath.absarc(x - w/2 + rRadius, y + h/2 - rRadius, rRadius, Math.PI, Math.PI/2, true);
              
              shapeFull.holes.push(holePath);
            }
          }
        }
      }
    } else if (patternType === "sleuven") {
      const slotSpacing = 20;
      const slotWidth = 4;
      const slotLength = width * 0.4;
      const numSlots = Math.floor(usableLength / slotSpacing);
      const startY = -((numSlots * slotSpacing) / 2) + slotSpacing / 2;
      for (let i = 0; i < numSlots; i++) {
        const y = startY + i * slotSpacing;
        if (Math.abs(y) > clearance || text === "") {
          const holePath = new THREE.Path();
          const rRadius = 2;
          const w = slotLength;
          const h = slotWidth;
          const x = 0;
          holePath.moveTo(x - w/2 + rRadius, y + h/2);
          holePath.lineTo(x + w/2 - rRadius, y + h/2);
          holePath.absarc(x + w/2 - rRadius, y + h/2 - rRadius, rRadius, Math.PI/2, 0, true);
          holePath.lineTo(x + w/2, y - h/2 + rRadius);
          holePath.absarc(x + w/2 - rRadius, y - h/2 + rRadius, rRadius, 0, -Math.PI/2, true);
          holePath.lineTo(x - w/2 + rRadius, y - h/2);
          holePath.absarc(x - w/2 + rRadius, y - h/2 + rRadius, rRadius, -Math.PI/2, -Math.PI, true);
          holePath.lineTo(x - w/2, y + h/2 - rRadius);
          holePath.absarc(x - w/2 + rRadius, y + h/2 - rRadius, rRadius, Math.PI, Math.PI/2, true);
          
          shapeFull.holes.push(holePath);
        }
      }
    } else if (patternType === "golven") {
      const waveSpacing = 16;
      const waveWidth = 4;
      const waveLength = width * 0.45;
      const numWaves = Math.floor(usableLength / waveSpacing);
      const startY = -((numWaves * waveSpacing) / 2) + waveSpacing / 2;
      for (let i = 0; i < numWaves; i++) {
        const y = startY + i * waveSpacing;
        if (Math.abs(y) > clearance || text === "") {
          const holePath = new THREE.Path();
          const rRadius = waveWidth / 2;
          const xLeft = -waveLength / 2;
          const xRight = waveLength / 2;
          const w = waveWidth;
          const A = 5; // amplitude
          
          const steps = 12; // Aantal segmenten voor de golf
          
          holePath.moveTo(xLeft, y + w/2);
          
          // Top curve left to right
          for (let s = 1; s <= steps; s++) {
            const t = s / steps;
            const ptX = xLeft + t * waveLength;
            const p0 = y + w/2;
            const p1 = y + w/2 + A;
            const p2 = y + w/2 - A;
            const p3 = y + w/2;
            const ptY = p0*Math.pow(1-t, 3) + p1*3*t*Math.pow(1-t, 2) + p2*3*Math.pow(t, 2)*(1-t) + p3*Math.pow(t, 3);
            holePath.lineTo(ptX, ptY);
          }
          
          holePath.absarc(xRight, y, rRadius, Math.PI/2, -Math.PI/2, true);
          
          // Bottom curve right to left
          for (let s = 1; s <= steps; s++) {
            const t = s / steps;
            const ptX = (xLeft + waveLength) - t * waveLength;
            const p0 = y - w/2;
            const p1 = y - w/2 - A;
            const p2 = y - w/2 + A;
            const p3 = y - w/2;
            const ptY = p0*Math.pow(1-t, 3) + p1*3*t*Math.pow(1-t, 2) + p2*3*Math.pow(t, 2)*(1-t) + p3*Math.pow(t, 3);
            holePath.lineTo(ptX, ptY);
          }
          
          holePath.absarc(xLeft, y, rRadius, -Math.PI/2, Math.PI/2, true);
          
          shapeFull.holes.push(holePath);
        }
      }
    }
    // Voeg de 3D tekstgaten toe aan de plaat
    textPaths.forEach(path => shapeFull.holes.push(path));

    return new THREE.ExtrudeGeometry(shapeFull, { 
      depth: thickness, 
      bevelEnabled: false,
      curveSegments: 3 // Extreem belangrijk voor performance: voorkomt dat duizenden punten per hole de browser laten crashen
    });
  }, [length, width, thickness, text, patternType, fontData, R, clearance, textPaths]);

  // Wiskunde voor de Plooien (Bend Radius) links en rechts
  const bendExtrudeSettings = { depth: length, bevelEnabled: false, curveSegments: 16 };
  
  const bendGeometryLeft = React.useMemo(() => {
    const shape = new THREE.Shape();
    // Buitenboog (van 90 graden boven naar 180 graden links)
    shape.absarc(0, 0, R, Math.PI/2, Math.PI, false);
    // Lijn naar binnenste curve
    shape.lineTo(-R + thickness, 0); 
    // Binnenboog (van 180 graden links naar 90 graden boven, kloksgewijs)
    shape.absarc(0, 0, R - thickness, Math.PI, Math.PI/2, true);
    // Lijn naar startpunt
    shape.lineTo(0, R); 
    return new THREE.ExtrudeGeometry(shape, bendExtrudeSettings);
  }, [R, thickness, length]);

  const bendGeometryRight = React.useMemo(() => {
    const shape = new THREE.Shape();
    // Buitenboog (van 0 graden rechts naar 90 graden boven)
    shape.absarc(0, 0, R, 0, Math.PI/2, false);
    // Lijn naar binnenste curve
    shape.lineTo(0, R - thickness); 
    // Binnenboog (van 90 graden boven naar 0 graden rechts, kloksgewijs)
    shape.absarc(0, 0, R - thickness, Math.PI/2, 0, true);
    // Lijn naar startpunt
    shape.lineTo(R, 0); 
    return new THREE.ExtrudeGeometry(shape, bendExtrudeSettings);
  }, [R, thickness, length]);

  // Zorg voor DoubleSide materiaal zodat de binnenkant niet onzichtbaar is
  const doubleSidedSteel = React.useMemo(() => {
    const mat = steelMaterial.clone();
    mat.side = THREE.DoubleSide;
    return mat;
  }, [steelMaterial]);

  return (
    <group rotation={[0, 0, 0]}>
      {/* Top plaat (1 geheel met patroongaten EN tekstgaten) */}
      <mesh 
        material={doubleSidedSteel} 
        geometry={topPlateGeometry} 
        position={[0, height - thickness, 0]} 
        rotation={[-Math.PI / 2, 0, 0]} 
        castShadow 
        receiveShadow 
      />

      {/* Linker Plooi (Radius) */}
      <mesh 
        material={doubleSidedSteel} 
        geometry={bendGeometryLeft} 
        position={[-width / 2 + R, height - R, -length / 2]} 
        castShadow 
        receiveShadow 
      />

      {/* Rechter Plooi (Radius) */}
      <mesh 
        material={doubleSidedSteel} 
        geometry={bendGeometryRight} 
        position={[width / 2 - R, height - R, -length / 2]} 
        castShadow 
        receiveShadow 
      />

      {/* Linker rand (Rechte stuk naar beneden) */}
      <mesh material={doubleSidedSteel} position={[-width / 2 + thickness / 2, (height - R) / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[thickness, height - R, length]} />
      </mesh>

      {/* Rechter rand (Rechte stuk naar beneden) */}
      <mesh material={doubleSidedSteel} position={[width / 2 - thickness / 2, (height - R) / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[thickness, height - R, length]} />
      </mesh>
    </group>
  );
}

export default function ShowerDrainConfigurator() {
  const router = useRouter();
  const { addItem } = useCart();
  const [length, setLength] = useState<number | "">(800);
  const [width, setWidth] = useState<number | "">(50);
  const [height, setHeight] = useState<number | "">(15);
  const [thickness, setThickness] = useState<number>(1);
  const [text, setText] = useState<string>("UW TEKST");
  const [patternType, setPatternType] = useState<string>("vierkant");
  const [materialType, setMaterialType] = useState<string>("inox"); // 'inox', 'chrome', 'messing'
  const [fontData, setFontData] = useState<any>(null);
  const [fontUrl, setFontUrl] = useState<string>("/AllertaStencil-Regular.ttf");
  const [isExporting, setIsExporting] = useState<boolean>(false);

  // Bereken dynamisch maximaal aantal karakters op basis van beschikbare lengte
  const maxTextLength = React.useMemo(() => {
    const l = typeof length === "number" ? length : 800;
    const w = typeof width === "number" ? width : 50;
    const usableLength = l - 40; // 2 * 20mm van de zijkanten
    const fontSize = w * 0.4;
    const approxCharWidth = fontSize * 0.75; // Stencil letters zijn best breed
    return Math.max(1, Math.floor(usableLength / approxCharWidth));
  }, [length, width]);

  // Laad de Stencil font bij het opstarten
  React.useEffect(() => {
    setFontData(null); // Clear previous font
    const loader = new TTFLoader();
    loader.load(fontUrl, (json) => {
      setFontData(json);
    });
  }, [fontUrl]);

  // Functie om de DXF (Uitslag) te genereren
  const handleExportDXF = async () => {
    if (isExporting) return;
    setIsExporting(true);
    
    try {
      const d = new Drawing();
      d.setUnits("Millimeters");
      
      // Fallback voor lege inputs
      const safeLength = typeof length === "number" ? length : 800;
      const safeWidth = typeof width === "number" ? width : 50;
      const safeHeight = typeof height === "number" ? height : 15;
      
      // Maak handige layers aan voor de productiemachines
      d.addLayer("OUTLINE", Drawing.ACI.WHITE, "CONTINUOUS");
      d.addLayer("BEND", Drawing.ACI.YELLOW, "DASHED");
      d.addLayer("CUT", Drawing.ACI.RED, "CONTINUOUS");
      d.addLayer("TEXT", Drawing.ACI.CYAN, "CONTINUOUS");

      // 1. De Uitslag Buitenlijn
      const flatWidth = safeWidth + safeHeight * 2; 
      d.setActiveLayer("OUTLINE");
      d.drawRect(-flatWidth / 2, -safeLength / 2, flatWidth / 2, safeLength / 2);

      // 2. Plooilijnen
      d.setActiveLayer("BEND");
      const bendX1 = -flatWidth / 2 + safeHeight;
      const bendX2 = flatWidth / 2 - safeHeight;
      d.drawLine(bendX1, -safeLength / 2, bendX1, safeLength / 2);
      d.drawLine(bendX2, -safeLength / 2, bendX2, safeLength / 2);

      let clearance = 0;

      // 3. Tekst
      if (text && fontData) {
        d.setActiveLayer("TEXT");
        const font = new FontLoader().parse(fontData);
        const shapes = font.generateShapes(text.toUpperCase(), safeWidth * 0.4);
        
        let xMin = Infinity, xMax = -Infinity, yMin = Infinity, yMax = -Infinity;
        shapes.forEach(s => {
          s.getPoints().forEach(p => {
            if (p.x < xMin) xMin = p.x;
            if (p.x > xMax) xMax = p.x;
            if (p.y < yMin) yMin = p.y;
            if (p.y > yMax) yMax = p.y;
          });
        });
        const offsetX = -(xMax + xMin) / 2;
        const offsetY = -(yMax + yMin) / 2;
        
        const realClearance = (xMax - xMin) / 2 + 15;
        clearance = text === "" ? 0 : realClearance;

        shapes.forEach(shape => {
          const points = shape.getPoints(4);
          const pts: [number, number][] = points.map(p => {
            let px = p.x + offsetX;
            let py = p.y + offsetY;
            // Zelfde orientatie als 3D model
            const rotX = -py;
            const rotY = px;
            return [rotX, rotY];
          });
          d.drawPolyline(pts, true);
          
          shape.holes.forEach(hole => {
            const hPoints = hole.getPoints(4);
            const hPts: [number, number][] = hPoints.map(p => {
              let px = p.x + offsetX;
              let py = p.y + offsetY;
              const rotX = -py;
              const rotY = px;
              return [rotX, rotY];
            });
            d.drawPolyline(hPts, true);
          });
        });
      }

      // 4. Afvoer Gaten Patroon met Afronding
      d.setActiveLayer("CUT");
      const edgeMargin = 20;
      const usableLength = safeLength - 2 * edgeMargin;
      
      if (patternType === "vierkant") {
        const holeSize = 6, holeSpacing = 4, numRows = 3;
        const step = holeSize + holeSpacing;
        if (step > 2) {
          const numCols = Math.floor(usableLength / step);
          const startY = -((numCols * step) / 2) + step / 2; // Y is de lengte in DXF
    
          const rowStep = holeSize + holeSpacing;
          const totalPatternWidth = numRows * holeSize + (numRows - 1) * holeSpacing;
          const startX = -totalPatternWidth / 2 + holeSize / 2; // X is breedte in DXF
    
          for (let c = 0; c < numCols; c++) {
            const y = startY + c * step;
            if (Math.abs(y) > clearance || text === "") {
              for (let r = 0; r < numRows; r++) {
                const x = startX + r * rowStep;
                const path = new THREE.Path();
                const rRadius = 1;
                const w = holeSize;
                const h = holeSize;
                path.moveTo(x - w/2 + rRadius, y + h/2);
                path.lineTo(x + w/2 - rRadius, y + h/2);
                path.absarc(x + w/2 - rRadius, y + h/2 - rRadius, rRadius, Math.PI/2, 0, true);
                path.lineTo(x + w/2, y - h/2 + rRadius);
                path.absarc(x + w/2 - rRadius, y - h/2 + rRadius, rRadius, 0, -Math.PI/2, true);
                path.lineTo(x - w/2 + rRadius, y - h/2);
                path.absarc(x - w/2 + rRadius, y - h/2 + rRadius, rRadius, -Math.PI/2, -Math.PI, true);
                path.lineTo(x - w/2, y + h/2 - rRadius);
                path.absarc(x - w/2 + rRadius, y + h/2 - rRadius, rRadius, Math.PI, Math.PI/2, true);
                
                const pts: [number, number][] = path.getPoints(2).map(p => [p.x, p.y]);
                d.drawPolyline(pts, true);
              }
            }
          }
        }
      } else if (patternType === "sleuven") {
        const slotSpacing = 20;
        const slotWidth = 4;
        const slotLength = safeWidth * 0.4;
        const numSlots = Math.floor(usableLength / slotSpacing);
        const startY = -((numSlots * slotSpacing) / 2) + slotSpacing / 2;
        
        for (let i = 0; i < numSlots; i++) {
          const y = startY + i * slotSpacing;
          if (Math.abs(y) > clearance || text === "") {
            const path = new THREE.Path();
            const rRadius = 2;
            const w = slotLength;
            const h = slotWidth;
            const x = 0;
            path.moveTo(x - w/2 + rRadius, y + h/2);
            path.lineTo(x + w/2 - rRadius, y + h/2);
            path.absarc(x + w/2 - rRadius, y + h/2 - rRadius, rRadius, Math.PI/2, 0, true);
            path.lineTo(x + w/2, y - h/2 + rRadius);
            path.absarc(x + w/2 - rRadius, y - h/2 + rRadius, rRadius, 0, -Math.PI/2, true);
            path.lineTo(x - w/2 + rRadius, y - h/2);
            path.absarc(x - w/2 + rRadius, y - h/2 + rRadius, rRadius, -Math.PI/2, -Math.PI, true);
            path.lineTo(x - w/2, y + h/2 - rRadius);
            path.absarc(x - w/2 + rRadius, y + h/2 - rRadius, rRadius, Math.PI, Math.PI/2, true);
            
            const pts: [number, number][] = path.getPoints(2).map(p => [p.x, p.y]);
            d.drawPolyline(pts, true);
          }
        }
      } else if (patternType === "golven") {
        const waveSpacing = 16;
        const waveWidth = 4;
        const waveLength = safeWidth * 0.45;
        const numWaves = Math.floor(usableLength / waveSpacing);
        const startY = -((numWaves * waveSpacing) / 2) + waveSpacing / 2;
        
        for (let i = 0; i < numWaves; i++) {
          const y = startY + i * waveSpacing;
          if (Math.abs(y) > clearance || text === "") {
            const steps = 16;
            const pts: [number, number][] = [];
            const xLeft = -waveLength / 2;
            const w = waveWidth;
            const A = 5;
            
            for (let s = 0; s <= steps; s++) {
              const t = s / steps;
              const ptX = xLeft + t * waveLength;
              const p0 = y + w/2;
              const p1 = y + w/2 + A;
              const p2 = y + w/2 - A;
              const p3 = y + w/2;
              const ptY = p0*Math.pow(1-t, 3) + p1*3*t*Math.pow(1-t, 2) + p2*3*Math.pow(t, 2)*(1-t) + p3*Math.pow(t, 3);
              pts.push([ptX, ptY]);
            }
            
            const rRadius = waveWidth / 2;
            const rightCapSteps = 4;
            for (let s = 1; s <= rightCapSteps; s++) {
              const angle = Math.PI/2 - (Math.PI * s / rightCapSteps);
              pts.push([
                (xLeft + waveLength) + Math.cos(angle) * rRadius,
                y + Math.sin(angle) * rRadius
              ]);
            }
            
            for (let s = 0; s <= steps; s++) {
              const t = s / steps;
              const ptX = (xLeft + waveLength) - t * waveLength;
              const p0 = y - w/2;
              const p1 = y - w/2 - A;
              const p2 = y - w/2 + A;
              const p3 = y - w/2;
              const ptY = p0*Math.pow(1-t, 3) + p1*3*t*Math.pow(1-t, 2) + p2*3*Math.pow(t, 2)*(1-t) + p3*Math.pow(t, 3);
              pts.push([ptX, ptY]);
            }
            
            for (let s = 1; s < rightCapSteps; s++) {
              const angle = -Math.PI/2 - (Math.PI * s / rightCapSteps);
              pts.push([
                xLeft + Math.cos(angle) * rRadius,
                y + Math.sin(angle) * rRadius
              ]);
            }
            
            d.drawPolyline(pts, true);
          }
        }
      }

      // Forceer dunne lijnen (Hairline) in de header
      d.header("LWDEFAULT", [[280, 0]]); // Default line weight: 0.00mm
      
      // Genereer de file
      let dxfString = d.toDxfString();
      // Vervang alle 'ByLayer' (-1) line weights naar 'Hairline' (0) voor polylines
      dxfString = dxfString.replace(/370\n-1/g, '370\n0');
      
      const safeText = text.replace(/[^a-zA-Z0-9]/g, '_');
      const fileName = `uitslag_douchegoot_${safeLength}x${safeWidth}_${safeText}.dxf`;
      
      // Neem een snapshot van de 3D canvas
      let snapshotDataUrl = "/images/douchegoot.png";
      const canvas = document.querySelector('canvas');
      if (canvas) {
        try {
          snapshotDataUrl = canvas.toDataURL('image/jpeg', 0.8);
        } catch (e) {
          console.error("Kon geen snapshot maken", e);
        }
      }

      // Voeg toe aan winkelwagen zonder eerst naar de server te posten
      addItem({
        id: "936ed3f8-a94f-4a3c-88cc-8c1afb63c9c9" as any, // Gebruik de UUID van de database, we casten even als any omdat addItem number verwacht in de oude typings
        name: `Douchegoot op maat: ${safeLength}x${safeWidth}mm`,
        price: 149.00,
        image: snapshotDataUrl,
        color: materialType,
        dxf_string: dxfString,
        dxf_filename: fileName
      });
      
      // Navigeer naar cart
      router.push('/cart');
    } catch (err) {
      console.error(err);
      alert("Er is een fout opgetreden.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SiteHeader />
      
      <div className="flex-1 flex flex-col md:flex-row max-h-[calc(100vh-80px)] overflow-hidden">
        
        {/* Linker paneel: Configuratie */}
        <div className="w-full md:w-[400px] lg:w-[450px] bg-card md:border-r border-t md:border-t-0 p-6 z-10 flex flex-col gap-6 overflow-y-auto order-2 md:order-1 flex-1 md:flex-none">
          <div>
            <h1 className="text-2xl font-bold text-foreground uppercase tracking-wider">Douchegoot</h1>
            <p className="text-sm text-muted-foreground mt-1">Live 3D & DXF Configurator</p>
          </div>
          
          <div className="space-y-6">
            {/* Tekst Invoer */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Gepersonaliseerde Tekst
              </label>
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                maxLength={maxTextLength}
                placeholder="Bijv. UW TEKST"
                className="w-full border border-input rounded-md p-3 bg-background text-foreground uppercase outline-none focus:ring-2 focus:ring-primary font-mono tracking-widest transition-all"
              />
              <p className="text-xs text-green-600 mt-2 font-medium flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                Live Stencil lettertype geactiveerd
              </p>
              
              <div className="pt-4">
                <label className="text-xs text-muted-foreground block mb-2">Lettertype</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { url: '/AllertaStencil-Regular.ttf', name: 'Allerta Stencil' },
                    { url: '/SairaStencilOne.ttf', name: 'Saira Stencil' },
                    { url: '/StardosStencil.ttf', name: 'Stardos Stencil' },
                    { url: '/BlackOpsOne.ttf', name: 'Black Ops' },
                    { url: '/SirinStencil.ttf', name: 'Sirin Stencil' }
                  ].map((f) => (
                    <button
                      key={f.url}
                      onClick={() => setFontUrl(f.url)}
                      className={`py-2 px-3 rounded-md border text-xs font-medium transition-colors ${
                        fontUrl === f.url 
                          ? 'bg-black text-white border-black' 
                          : 'bg-transparent border-zinc-200 text-zinc-600 hover:bg-zinc-50'
                      }`}
                    >
                      {f.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <hr className="border-border" />

            {/* Afmetingen (Invoervelden i.p.v. Sliders) */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm">Afmetingen (mm)</h3>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">Lengte</label>
                  <div className="relative">
                    <input
                      type="number"
                      min="100"
                      max="3000"
                      value={length}
                      onChange={(e) => setLength(e.target.value ? Number(e.target.value) : "")}
                      className="w-full border border-input rounded-md p-2 pl-2 pr-6 bg-background text-foreground outline-none focus:ring-2 focus:ring-primary font-mono text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-muted-foreground block mb-1">Breedte</label>
                  <div className="relative">
                    <input
                      type="number"
                      min="30"
                      max="300"
                      value={width}
                      onChange={(e) => setWidth(e.target.value ? Number(e.target.value) : "")}
                      className="w-full border border-input rounded-md p-2 pl-2 pr-6 bg-background text-foreground outline-none focus:ring-2 focus:ring-primary font-mono text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-muted-foreground block mb-1">Hoogte rand</label>
                  <div className="relative">
                    <input
                      type="number"
                      min="5"
                      max="100"
                      value={height}
                      onChange={(e) => setHeight(e.target.value ? Number(e.target.value) : "")}
                      className="w-full border border-input rounded-md p-2 pl-2 pr-6 bg-background text-foreground outline-none focus:ring-2 focus:ring-primary font-mono text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            <hr className="border-border" />

            {/* Patroon Keuze (Knoppen i.p.v. Sliders) */}
            <div className="space-y-3">
              <h3 className="font-semibold text-sm">Design Opties</h3>
              
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground">Materiaal / Finish</label>
                <div className="flex gap-2 bg-muted p-1 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setMaterialType("inox")}
                    className={`flex-1 py-2 rounded-md font-medium text-xs transition-all ${
                      materialType === 'inox' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Geborsteld INOX
                  </button>
                  <button
                    type="button"
                    onClick={() => setMaterialType("chrome")}
                    className={`flex-1 py-2 rounded-md font-medium text-xs transition-all ${
                      materialType === 'chrome' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Polijst Chroom
                  </button>
                  <button
                    type="button"
                    onClick={() => setMaterialType("messing")}
                    className={`flex-1 py-2 rounded-md font-medium text-xs transition-all ${
                      materialType === 'messing' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Goud / Messing
                  </button>
                </div>
              </div>

              <div className="space-y-1.5 pt-2">
                <label className="text-xs text-muted-foreground">Waterafvoer Patroon</label>
                <div className="flex gap-2 bg-muted p-1 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setPatternType("vierkant")}
                    className={`flex-1 py-2 rounded-md font-medium text-sm transition-all ${
                    patternType === 'vierkant' 
                      ? 'bg-background text-foreground shadow-sm' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Vierkantjes
                </button>
                <button
                  type="button"
                  onClick={() => setPatternType("sleuven")}
                  className={`flex-1 py-2.5 rounded-md font-medium text-sm transition-all ${
                    patternType === 'sleuven' 
                      ? 'bg-background text-foreground shadow-sm' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Sleuven
                </button>
                <button
                  type="button"
                  onClick={() => setPatternType("golven")}
                  className={`flex-1 py-2.5 rounded-md font-medium text-sm transition-all ${
                    patternType === 'golven' 
                      ? 'bg-background text-foreground shadow-sm' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Golven
                </button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Gaten blijven automatisch altijd 20mm van de buitenranden verwijderd.
              </p>
              </div>
            </div>

            {/* Productie Export Knop */}
            <div className="pt-4">
              <button 
                type="button"
                disabled={isExporting}
                onClick={(e) => {
                  e.preventDefault();
                  handleExportDXF();
                }}
                className={`w-full font-semibold py-3.5 px-4 rounded-lg transition-opacity flex items-center justify-center gap-2 shadow-sm ${
                  isExporting 
                    ? 'bg-muted text-muted-foreground cursor-not-allowed' 
                    : 'bg-foreground text-background hover:opacity-90'
                }`}
              >
                {isExporting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Toevoegen aan winkelwagen...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
                    In Winkelwagen
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Rechter paneel: 3D Weergave */}
        <div className="flex-1 relative bg-zinc-100 min-h-[350px] md:min-h-[500px] h-[45vh] md:h-auto shrink-0 md:shrink md:flex-1 order-1 md:order-2">
          <Canvas gl={{ preserveDrawingBuffer: true }} camera={{ position: [600, 400, -600], fov: 40, near: 0.1, far: 10000 }}>
            <color attach="background" args={["#f4f4f5"]} />
            
            <ambientLight intensity={0.8} />
            <directionalLight position={[100, 300, 100]} intensity={1.0} castShadow />
            <Environment preset="studio" /> 

            <Suspense fallback={null}>
              <Center position={[0, -20, 0]}>
                <ShowerDrainModel
                  length={typeof length === "number" ? length : 800}
                  width={typeof width === "number" ? width : 50}
                  height={typeof height === "number" ? height : 15}
                  thickness={thickness}
                  text={text}
                  patternType={patternType}
                  materialType={materialType}
                  fontData={fontData}
                />
              </Center>
              <ContactShadows 
                key={`${length}-${width}-${text}-${patternType}`}
                position={[0, -20, 0]} 
                opacity={0.4} 
                scale={1500} 
                blur={2.5} 
                far={40} 
                frames={1} 
                resolution={256} 
              />
            </Suspense>

            <OrbitControls makeDefault minDistance={100} maxDistance={2000} maxPolarAngle={Math.PI / 2 + 0.1} />
          </Canvas>
          
          <div className="absolute bottom-6 right-6 text-sm pointer-events-none px-3 py-1.5 rounded-full backdrop-blur-sm text-black/50 bg-white/50">
            Sleep om te draaien • Scroll om te zoomen
          </div>
        </div>
      </div>
    </div>
  );
}
