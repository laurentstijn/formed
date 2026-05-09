"use client";

import React, { useState, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment, ContactShadows, Center } from "@react-three/drei";
import * as THREE from "three";
import { SiteHeader } from "@/components/site-header";
import { useCart } from "@/components/cart-provider";
import { useRouter } from "next/navigation";
import DxfParser from 'dxf-parser';

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

function extractAllPaths(dxfData: any) {
  let allLayers: Record<string, THREE.Vector3[][]> = {};
  
  const extract = (entities: any[], offsetX = 0, offsetY = 0) => {
    entities.forEach(ent => {
      if (ent.type === 'INSERT') {
        const block = dxfData.blocks[ent.name];
        if (block && block.entities) {
          const bx = ent.position ? ent.position.x : 0;
          const by = ent.position ? ent.position.y : 0;
          extract(block.entities, offsetX + bx, offsetY + by);
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
          points = ent.vertices.map((v: any) => new THREE.Vector3(v.x, v.y, 0));
          if (ent.shape || ent.closed) {
            points.push(points[0].clone());
          }
        } else if (ent.type === 'CIRCLE') {
          const curve = new THREE.EllipseCurve(ent.center.x, ent.center.y, ent.radius, ent.radius, 0, 2 * Math.PI, false, 0);
          points = curve.getPoints(256).map(p => new THREE.Vector3(p.x, p.y, 0));
        } else if (ent.type === 'ARC') {
          const curve = new THREE.EllipseCurve(ent.center.x, ent.center.y, ent.radius, ent.radius, ent.startAngle, ent.endAngle, false, 0);
          points = curve.getPoints(128).map(p => new THREE.Vector3(p.x, p.y, 0));
        } else if (ent.type === 'ELLIPSE') {
          const angle = Math.atan2(ent.majorAxisEndPoint.y, ent.majorAxisEndPoint.x);
          const rx = Math.sqrt(ent.majorAxisEndPoint.x*ent.majorAxisEndPoint.x + ent.majorAxisEndPoint.y*ent.majorAxisEndPoint.y);
          const ry = rx * ent.axisRatio;
          const curve = new THREE.EllipseCurve(ent.center.x, ent.center.y, rx, ry, ent.startAngle, ent.endAngle, false, angle);
          points = curve.getPoints(256).map(p => new THREE.Vector3(p.x, p.y, 0));
        } else if (ent.type === 'SPLINE') {
          const pts = ent.controlPoints || ent.fitPoints || ent.vertices || [];
          points = pts.map((v: any) => new THREE.Vector3(v.x, v.y, 0));
        }
        
        if (points.length > 0) {
          if (offsetX !== 0 || offsetY !== 0) {
            points = points.map(p => new THREE.Vector3(p.x + offsetX, p.y + offsetY, 0));
          }
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

function CustomDesignModel({ width, length, thickness, materialType, dxfLayers, layerSettings }) {
  const plateMaterial = materials[materialType] || materials.inox;

  const geometry = React.useMemo(() => {
    let cutPathsRaw: THREE.Vector3[][] = [];
    
    dxfLayers.forEach((layer: any) => {
      const mode = layerSettings[layer.name] || 'graveren';
      if (mode === 'snijden' || mode === 'omtrek') {
        cutPathsRaw.push(...layer.paths);
      }
    });
      
    // Merge all cut paths across all cut layers
    const cutLoops = mergePaths(cutPathsRaw);
    const shape = new THREE.Shape();

    if (cutLoops.length > 0) {
      // Sorteer op oppervlakte om de buitenste rand (grootste bounding box) te vinden
      cutLoops.sort((a,b) => getLoopArea(b) - getLoopArea(a));
      
      let outer = [...cutLoops[0]];
      // Three.js vereist dat de buitenste shape tegen de klok in (CCW) is
      if (THREE.ShapeUtils.isClockWise(outer)) {
        outer.reverse();
      }

      shape.moveTo(outer[0].x, outer[0].y);
      for(let i=1; i<outer.length; i++) {
        shape.lineTo(outer[i].x, outer[i].y);
      }
      
      // De overige loops zijn waarschijnlijk gaten (uitsparingen)
      for(let j=1; j<cutLoops.length; j++) {
        let holePath = [...cutLoops[j]];
        if (holePath.length > 2) {
          // Three.js vereist dat gaten met de klok mee (CW) zijn
          if (!THREE.ShapeUtils.isClockWise(holePath)) {
            holePath.reverse();
          }

          const hole = new THREE.Path();
          hole.moveTo(holePath[0].x, holePath[0].y);
          for(let i=1; i<holePath.length; i++) {
            hole.lineTo(holePath[i].x, holePath[i].y);
          }
          shape.holes.push(hole);
        }
      }
    } else {
      // Fallback: gewone rechthoekige plaat
      const halfW = width / 2;
      const halfL = length / 2;
      shape.moveTo(-halfW, -halfL);
      shape.lineTo(halfW, -halfL);
      shape.lineTo(halfW, halfL);
      shape.lineTo(-halfW, halfL);
      shape.lineTo(-halfW, -halfL);
    }

    return new THREE.ExtrudeGeometry(shape, {
      depth: thickness,
      bevelEnabled: false,
    });
  }, [width, length, thickness, dxfLayers, layerSettings]);

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
        
        const { layers, width: extractedWidth, length: extractedLength } = extractAllPaths(parsedDxf);
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

  const startCost = 25; // €25 opstartkosten
  const volumeMm3 = length * width * thickness;
  const weightKg = volumeMm3 * 0.00000785;
  const materialCost = weightKg * 8; // €8 per kg staal
  const cuttingCost = (cutLength / 1000) * 4; // €4 per meter snijden
  const engraveCost = (engraveLength / 1000) * 2; // €2 per meter graveren
  const totalPrice = startCost + materialCost + cuttingCost + engraveCost;

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

      addItem({
        id: `eigen-ontwerp-${Date.now()}` as any, // Gebruik een unieke ID zodat ze niet overschrijven
        name: `Eigen Ontwerp: ${length}x${width}x${thickness}mm`,
        price: Number(totalPrice.toFixed(2)),
        image: snapshotDataUrl,
        color: materialType,
        dxf_string: dxfContent,
        dxf_filename: `custom_${dxfFileName}`,
        layer_settings: JSON.stringify(layerSettings)
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
        <div className="w-full md:w-[400px] bg-white border-r border-zinc-200 flex flex-col h-[55vh] md:h-auto overflow-y-auto order-2 md:order-1">
          <div className="p-6 md:p-8 flex-1 space-y-8">
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
                <label className="text-xs font-semibold tracking-wider text-zinc-400 uppercase">Lagen & Bewerkingen</label>
                {dxfLayers.length === 0 ? (
                  <p className="text-xs text-zinc-500">Upload een DXF om lagen in te stellen.</p>
                ) : (
                  <div className="space-y-3">
                    {dxfLayers.map(layer => (
                      <div key={layer.name} className="flex flex-col gap-2 bg-zinc-50 p-3 rounded-md border border-zinc-200">
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
                )}
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
            </div>
          </div>

          <div className="p-6 md:p-8 bg-zinc-50 border-t border-zinc-200">
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
              {isExporting ? 'Laden...' : dxfLayers.length === 0 ? 'Upload DXF om te bestellen' : 'In Winkelwagen'}
            </button>
          </div>
        </div>

        {/* Rechter paneel: 3D Weergave */}
        <div className="flex-1 bg-[#f5f5f5] relative h-[45vh] md:h-auto order-1 md:order-2">
          <Canvas shadows camera={{ position: [0, 400, 400], fov: 45 }} gl={{ preserveDrawingBuffer: true }}>
            <color attach="background" args={["#f5f5f5"]} />
            <ambientLight intensity={0.5} />
            <directionalLight
              position={[10, 20, 10]}
              intensity={1}
              castShadow
              shadow-mapSize={[1024, 1024]}
            />
            
            <Center>
              <CustomDesignModel 
                width={width} 
                length={length} 
                thickness={thickness} 
                materialType={materialType}
                dxfLayers={dxfLayers}
                layerSettings={layerSettings}
              />
            </Center>
            
            <ContactShadows 
              position={[0, -2, 0]} 
              opacity={0.4} 
              scale={2000} 
              blur={2} 
              far={100} 
            />
            
            <OrbitControls 
              makeDefault 
              minPolarAngle={0} 
              maxPolarAngle={Math.PI / 2.1} 
              enableDamping
            />
            <Environment preset="studio" />
          </Canvas>
          
          <div className="absolute bottom-6 right-6 text-xs font-medium tracking-widest text-zinc-400 uppercase">
            SLEEP OM TE DRAAIEN • SCROLL OM TE ZOOMEN
          </div>
        </div>
      </div>
    </div>
  );
}
