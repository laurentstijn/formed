"use client";

import React, { useState, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, Center, ContactShadows } from "@react-three/drei";
import * as THREE from "three";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";
import { TTFLoader } from "three/examples/jsm/loaders/TTFLoader.js";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import Drawing from "dxf-writer";

interface NamePlateProps {
  width: number;
  height: number;
  thickness: number;
  huisnummer: string;
  naam: string;
  materialType: string;
  fontData: any;
}

function NamePlateModel({ width, height, thickness, huisnummer, naam, materialType, fontData }: NamePlateProps) {
  const materials = React.useMemo(() => ({
    inox: new THREE.MeshStandardMaterial({
      color: "#a8adb0",
      metalness: 0.85,
      roughness: 0.35,
      envMapIntensity: 1.2,
    }),
    zwart: new THREE.MeshStandardMaterial({
      color: "#1a1a1a",
      metalness: 0.2,
      roughness: 0.8,
      envMapIntensity: 0.5,
    }),
    messing: new THREE.MeshPhysicalMaterial({
      color: "#c6a87c",
      metalness: 1.0,
      roughness: 0.25,
      clearcoat: 0.3,
      clearcoatRoughness: 0.2,
      envMapIntensity: 1.5,
    }),
  }), []);

  const plateMaterial = materials[materialType as keyof typeof materials] || materials.zwart;

  const geometry = React.useMemo(() => {
    const shape = new THREE.Shape();
    
    // Buitenrand
    const hw = width / 2;
    const hh = height / 2;
    shape.moveTo(-hw, hh);
    shape.lineTo(hw, hh);
    shape.lineTo(hw, -hh);
    shape.lineTo(-hw, -hh);
    shape.lineTo(-hw, hh);

    // Schroefgaten in hoeken
    const r = 2.5; // 5mm diameter
    const margin = 12;
    const holePositions = [
      {x: -hw + margin, y: hh - margin},
      {x: hw - margin, y: hh - margin},
      {x: hw - margin, y: -hh + margin},
      {x: -hw + margin, y: -hh + margin},
    ];

    holePositions.forEach(pos => {
      const holePath = new THREE.Path();
      holePath.absarc(pos.x, pos.y, r, 0, Math.PI * 2, false);
      shape.holes.push(holePath);
    });

    // Functie om tekst toe te voegen als gaten
    const addTextHoles = (text: string, size: number, yOffset: number) => {
      if (!text || !fontData) return;
      try {
        const font = new FontLoader().parse(fontData);
        const shapes = font.generateShapes(text.toUpperCase(), size);
        
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
        const offsetY = -(yMax + yMin) / 2 + yOffset;

        shapes.forEach(letterShape => {
          const points = letterShape.getPoints(4);
          const letterPath = new THREE.Path();
          points.forEach((p, i) => {
            const px = p.x + offsetX;
            const py = p.y + offsetY;
            if (i === 0) letterPath.moveTo(px, py);
            else letterPath.lineTo(px, py);
          });
          shape.holes.push(letterPath);
          
          // Als de letter binnenste gaten heeft (normaal niet bij stencil, maar voor de zekerheid)
          letterShape.holes.forEach(hole => {
            const hPoints = hole.getPoints(4);
            const innerPath = new THREE.Path();
            hPoints.forEach((p, i) => {
              const px = p.x + offsetX;
              const py = p.y + offsetY;
              if (i === 0) innerPath.moveTo(px, py);
              else innerPath.lineTo(px, py);
            });
            shape.holes.push(innerPath);
          });
        });
      } catch (e) {
        console.error("Font error", e);
      }
    };

    // Voeg huisnummer en naam toe
    addTextHoles(huisnummer, height * 0.4, height * 0.15); // Bovenste helft, groot
    addTextHoles(naam, height * 0.12, -height * 0.25); // Onderste helft, kleiner

    return new THREE.ExtrudeGeometry(shape, {
      depth: thickness,
      bevelEnabled: false,
      curveSegments: 3
    });
  }, [width, height, thickness, huisnummer, naam, fontData]);

  return (
    <mesh geometry={geometry} material={plateMaterial} rotation={[-Math.PI / 2, 0, 0]} castShadow receiveShadow />
  );
}

export default function NaambordjeConfigurator() {
  const [width, setWidth] = useState<number>(200);
  const [height, setHeight] = useState<number>(150);
  const [thickness, setThickness] = useState<number>(2);
  const [huisnummer, setHuisnummer] = useState<string>("42");
  const [naam, setNaam] = useState<string>("FAM. JANSEN");
  const [materialType, setMaterialType] = useState<string>("zwart");
  
  const [fontData, setFontData] = useState<any>(null);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  React.useEffect(() => {
    const loader = new TTFLoader();
    loader.load('/AllertaStencil-Regular.ttf', (json) => {
      setFontData(json);
    });
  }, []);

  const handleExportDXF = async () => {
    if (isExporting) return;
    setIsExporting(true);
    
    try {
      const d = new Drawing();
      d.setUnits("Millimeters");
      
      d.addLayer("OUTLINE", Drawing.ACI.WHITE, "CONTINUOUS");
      d.addLayer("CUT", Drawing.ACI.RED, "CONTINUOUS");
      d.addLayer("TEXT", Drawing.ACI.CYAN, "CONTINUOUS");

      const hw = width / 2;
      const hh = height / 2;

      // 1. Buitenlijn
      d.setActiveLayer("OUTLINE");
      d.drawRect(-hw, -hh, hw, hh);

      // 2. Schroefgaten
      d.setActiveLayer("CUT");
      const r = 2.5;
      const margin = 12;
      d.drawCircle(-hw + margin, hh - margin, r);
      d.drawCircle(hw - margin, hh - margin, r);
      d.drawCircle(hw - margin, -hh + margin, r);
      d.drawCircle(-hw + margin, -hh + margin, r);

      // 3. Tekst
      if (fontData) {
        d.setActiveLayer("TEXT");
        const font = new FontLoader().parse(fontData);

        const addTextToDXF = (text: string, size: number, yOffset: number) => {
          if (!text) return;
          const shapes = font.generateShapes(text.toUpperCase(), size);
          
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
          const offsetY = -(yMax + yMin) / 2 + yOffset;

          shapes.forEach(shape => {
            const points = shape.getPoints(4);
            const pts: [number, number][] = points.map(p => [p.x + offsetX, p.y + offsetY]);
            d.drawPolyline(pts, true);
            
            shape.holes.forEach(hole => {
              const hPoints = hole.getPoints(4);
              const hPts: [number, number][] = hPoints.map(p => [p.x + offsetX, p.y + offsetY]);
              d.drawPolyline(hPts, true);
            });
          });
        };

        addTextToDXF(huisnummer, height * 0.4, height * 0.15);
        addTextToDXF(naam, height * 0.12, -height * 0.25);
      }

      // DXF Header & String
      d.header("LWDEFAULT", [[280, 0]]);
      let dxfString = d.toDxfString();
      dxfString = dxfString.replace(/370\n-1/g, '370\n0');
      
      const safeNaam = naam.replace(/[^a-zA-Z0-9]/g, '_');
      const fileName = `naambordje_${width}x${height}_${huisnummer}_${safeNaam}.dxf`;
      
      const res = await fetch('/api/save-dxf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: fileName, dxfContent: dxfString })
      });
      
      if (res.ok) {
        alert(`SUCCES!\nDe productieklare DXF (${fileName}) is zojuist direct gemaild naar info@formd.be.`);
      } else {
        alert("Oeps, er ging iets mis bij het mailen van de DXF.");
      }
    } catch (err) {
      console.error(err);
      alert("Kan e-mail niet verzenden.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SiteHeader />
      
      <div className="flex flex-col md:flex-row flex-1">
        {/* Linker paneel: Controls */}
        <div className="w-full md:w-[400px] bg-white border-r border-zinc-200 flex flex-col h-[55vh] md:h-auto overflow-y-auto order-2 md:order-1">
          <div className="p-6 md:p-8 flex-1 space-y-8">
            <div>
              <h1 className="text-2xl font-light tracking-widest text-zinc-900 mb-2">NAAMBORDJE</h1>
              <p className="text-zinc-500 text-sm">Configureer je gepersonaliseerde naambordje</p>
            </div>

            <div className="space-y-6">
              <div className="space-y-4">
                <label className="text-xs font-semibold tracking-wider text-zinc-400 uppercase">Afmetingen (mm)</label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-zinc-500 mb-1 block">Breedte</label>
                    <input 
                      type="number" 
                      min="100" max="600" 
                      value={width} 
                      onChange={(e) => setWidth(Number(e.target.value))}
                      className="w-full bg-zinc-50 border border-zinc-200 text-zinc-900 text-sm rounded-md focus:ring-black focus:border-black block p-2.5"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-zinc-500 mb-1 block">Hoogte</label>
                    <input 
                      type="number" 
                      min="50" max="400" 
                      value={height} 
                      onChange={(e) => setHeight(Number(e.target.value))}
                      className="w-full bg-zinc-50 border border-zinc-200 text-zinc-900 text-sm rounded-md focus:ring-black focus:border-black block p-2.5"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-xs font-semibold tracking-wider text-zinc-400 uppercase">Tekst</label>
                <div>
                  <label className="text-xs text-zinc-500 mb-1 block">Huisnummer</label>
                  <input 
                    type="text" 
                    value={huisnummer} 
                    onChange={(e) => setHuisnummer(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 text-zinc-900 text-sm rounded-md focus:ring-black focus:border-black block p-2.5 font-mono"
                    maxLength={10}
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-500 mb-1 block">Naam / Familie</label>
                  <input 
                    type="text" 
                    value={naam} 
                    onChange={(e) => setNaam(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 text-zinc-900 text-sm rounded-md focus:ring-black focus:border-black block p-2.5 font-mono uppercase"
                    maxLength={25}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-semibold tracking-wider text-zinc-400 uppercase">Materiaal / Finish</label>
                <div className="flex bg-zinc-100 p-1 rounded-lg">
                  {['zwart', 'inox', 'messing'].map((type) => (
                    <button
                      key={type}
                      onClick={() => setMaterialType(type)}
                      className={`flex-1 py-2 text-xs rounded-md transition-colors ${
                        materialType === type 
                          ? 'bg-white text-black shadow-sm font-medium' 
                          : 'text-zinc-500 hover:text-zinc-900'
                      }`}
                    >
                      {type === 'zwart' ? 'Zwart Gecoat' : type === 'inox' ? 'Geborsteld INOX' : 'Goud / Messing'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 border-t border-zinc-200 bg-zinc-50">
            <button
              onClick={handleExportDXF}
              disabled={isExporting}
              className="w-full bg-[#111] hover:bg-black text-white font-medium py-3.5 px-4 rounded-md transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isExporting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  DXF Genereren...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 17a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9.5C2 7 4 5 6.5 5H18c2.2 0 4 1.8 4 4v8Z"/><polyline points="15,9 18,9 18,11"/><path d="M5.5 7.4L12 12l6.5-4.6"/></svg>
                  Verstuur DXF naar info@formd.be
                </>
              )}
            </button>
          </div>
        </div>

        {/* Rechter paneel: 3D Weergave */}
        <div className="flex-1 relative bg-zinc-100 min-h-[350px] md:min-h-[500px] h-[45vh] md:h-auto shrink-0 md:shrink md:flex-1 order-1 md:order-2">
          <Canvas camera={{ position: [0, 0, 400], fov: 40, near: 0.1, far: 10000 }}>
            <color attach="background" args={["#f4f4f5"]} />
            <ambientLight intensity={0.8} />
            <directionalLight position={[100, 300, 100]} intensity={1.0} castShadow />
            <Environment preset="studio" /> 

            <Suspense fallback={null}>
              <Center position={[0, 0, 0]}>
                <NamePlateModel
                  width={width}
                  height={height}
                  thickness={thickness}
                  huisnummer={huisnummer}
                  naam={naam}
                  materialType={materialType}
                  fontData={fontData}
                />
              </Center>
              <ContactShadows 
                key={`${width}-${height}-${huisnummer}-${naam}`}
                position={[0, -height/2 - 20, 0]} 
                opacity={0.4} 
                scale={1000} 
                blur={2.5} 
                far={40} 
                frames={1} 
                resolution={256} 
              />
            </Suspense>
            <OrbitControls makeDefault minDistance={100} maxDistance={2000} />
          </Canvas>
          <div className="absolute bottom-6 right-6 text-sm pointer-events-none px-3 py-1.5 rounded-full backdrop-blur-sm text-black/50 bg-white/50">
            Sleep om te draaien • Scroll om te zoomen
          </div>
        </div>
      </div>
    </div>
  );
}
