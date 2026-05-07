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
import { useCart } from "@/components/cart-provider";
import { useRouter } from "next/navigation";

interface NamePlateProps {
  width: number;
  height: number;
  thickness: number;
  huisnummer: string;
  naam: string;
  materialType: string;
  fontData: any;
  vorm: string;
}

function NamePlateModel({ width, height, thickness, huisnummer, naam, materialType, fontData, vorm, letterSpacing }: NamePlateProps & { letterSpacing: number }) {
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
      metalness: 0.8,
      roughness: 0.4,
      clearcoat: 0.3,
      clearcoatRoughness: 0.2,
      envMapIntensity: 0.8,
    }),
  }), []);

  const plateMaterial = materials[materialType as keyof typeof materials] || materials.zwart;

  const geometry = React.useMemo(() => {
    const shape = new THREE.Shape();
    const w = vorm === 'vierkant' ? width : width;
    const h = vorm === 'vierkant' ? width : height;

    if (vorm === 'ovaal') {
      shape.ellipse(0, 0, w / 2, h / 2, 0, Math.PI * 2, false, 0);
    } else {
      shape.moveTo(-w / 2, -h / 2);
      shape.lineTo(w / 2, -h / 2);
      shape.lineTo(w / 2, h / 2);
      shape.lineTo(-w / 2, h / 2);
      shape.lineTo(-w / 2, -h / 2);
    }

    const holeRadius = 2.5;
    const margin = 12;
    const addHole = (hx: number, hy: number) => {
      const holePath = new THREE.Path();
      holePath.absarc(hx, hy, holeRadius, 0, Math.PI * 2, false);
      shape.holes.push(holePath);
    };

    if (vorm === 'ovaal') {
      addHole(-w / 2 + margin * 1.5, 0);
      addHole(w / 2 - margin * 1.5, 0);
    } else {
      addHole(-w / 2 + margin, h / 2 - margin);
      addHole(w / 2 - margin, h / 2 - margin);
      addHole(w / 2 - margin, -h / 2 + margin);
      addHole(-w / 2 + margin, -h / 2 + margin);
    }

    const addTextHoles = (text: string, size: number, yOffset: number) => {
      if (!text || !fontData) return;
      try {
        const font = new FontLoader().parse(fontData);
        const textUpper = text.toUpperCase();
        
        let currentX = 0;
        let globalXMin = Infinity, globalXMax = -Infinity, globalYMin = Infinity, globalYMax = -Infinity;
        const charData: { shape: THREE.Shape, points: THREE.Vector2[], xOffset: number, holes: THREE.Vector2[][] }[] = [];

        for (let i = 0; i < textUpper.length; i++) {
          const char = textUpper.charAt(i);
          if (char === ' ') {
            currentX += size * 0.3 + letterSpacing;
            continue;
          }
          
          const cShapes = font.generateShapes(char, size);
          let cMinX = Infinity, cMaxX = -Infinity;
          
          cShapes.forEach(s => {
            s.getPoints().forEach(p => {
              if (p.x < cMinX) cMinX = p.x;
              if (p.x > cMaxX) cMaxX = p.x;
              if (p.y < globalYMin) globalYMin = p.y;
              if (p.y > globalYMax) globalYMax = p.y;
            });
          });
          
          const cWidth = cMaxX === -Infinity ? 0 : cMaxX - cMinX;
          
          cShapes.forEach(s => {
            const pts = s.getPoints(4);
            const holePts = s.holes ? s.holes.map(h => h.getPoints(4)) : [];
            
            pts.forEach(p => {
              const finalX = p.x - cMinX + currentX;
              if (finalX < globalXMin) globalXMin = finalX;
              if (finalX > globalXMax) globalXMax = finalX;
            });
            
            charData.push({ shape: s, points: pts, xOffset: currentX - cMinX, holes: holePts });
          });
          
          currentX += cWidth + letterSpacing;
        }
        
        const textWidth = globalXMax - globalXMin;
        const availableWidth = vorm === 'ovaal' ? w * 0.75 : w;
        const maxWidth = availableWidth - 50;
        const scale = textWidth > maxWidth ? maxWidth / textWidth : 1.0;

        const offsetX = -(globalXMax + globalXMin) / 2;
        const offsetY = -(globalYMax + globalYMin) / 2;

        charData.forEach(cd => {
          const letterPath = new THREE.Path();
          cd.points.forEach((p, i) => {
            const px = (p.x + cd.xOffset + offsetX) * scale;
            const py = (p.y + offsetY) * scale + yOffset;
            if (i === 0) letterPath.moveTo(px, py);
            else letterPath.lineTo(px, py);
          });
          shape.holes.push(letterPath);
          
          cd.holes.forEach(holePoints => {
            const innerPath = new THREE.Path();
            holePoints.forEach((p, i) => {
              const px = (p.x + cd.xOffset + offsetX) * scale;
              const py = (p.y + offsetY) * scale + yOffset;
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

    addTextHoles(huisnummer, h * 0.4, h * 0.15);
    addTextHoles(naam, h * 0.12, -h * 0.25);

    return new THREE.ExtrudeGeometry(shape, {
      depth: thickness,
      bevelEnabled: false,
      curveSegments: 24
    });
  }, [width, height, thickness, huisnummer, naam, fontData, vorm]);

  return (
    <mesh geometry={geometry} material={plateMaterial} castShadow receiveShadow />
  );
}

export default function NaambordjeConfigurator() {
  const router = useRouter();
  const { addItem } = useCart();
  const [width, setWidth] = useState<number>(200);
  const [height, setHeight] = useState<number>(150);
  const [thickness, setThickness] = useState<number>(2);
  const [huisnummer, setHuisnummer] = useState<string>("42");
  const [naam, setNaam] = useState<string>("FAM. JANSEN");
  const [materialType, setMaterialType] = useState<string>("zwart");
  const [vorm, setVorm] = useState<string>("rechthoek");
  
  const [fontData, setFontData] = useState<any>(null);
  const [fontUrl, setFontUrl] = useState<string>("/AllertaStencil-Regular.ttf");
  const [letterSpacing, setLetterSpacing] = useState<number>(0);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  React.useEffect(() => {
    setFontData(null); // Clear previous font while loading
    const loader = new TTFLoader();
    loader.load(fontUrl, (json) => {
      setFontData(json);
    });
  }, [fontUrl]);

  const handleExportDXF = async () => {
    if (isExporting) return;
    setIsExporting(true);
    
    try {
      const d = new Drawing();
      d.setUnits("Millimeters");
      
      d.addLayer("OUTLINE", Drawing.ACI.WHITE, "CONTINUOUS");
      d.addLayer("CUT", Drawing.ACI.RED, "CONTINUOUS");
      d.addLayer("TEXT", Drawing.ACI.CYAN, "CONTINUOUS");

      const w = vorm === 'vierkant' ? width : width;
      const h = vorm === 'vierkant' ? width : height;

      d.setActiveLayer("OUTLINE");
      if (vorm === 'ovaal') {
        const isHorizontal = w >= h;
        const majorX = isHorizontal ? w / 2 : 0;
        const majorY = isHorizontal ? 0 : h / 2;
        const ratio = isHorizontal ? h / w : w / h;
        d.drawEllipse(0, 0, majorX, majorY, ratio);
      } else {
        d.drawRect(-w / 2, -h / 2, w / 2, h / 2);
      }

      d.setActiveLayer("CUT");
      const r = 2.5;
      const margin = 12;
      if (vorm === 'ovaal') {
        d.drawCircle(-w / 2 + margin * 1.5, 0, r);
        d.drawCircle(w / 2 - margin * 1.5, 0, r);
      } else {
        d.drawCircle(-w / 2 + margin, h / 2 - margin, r);
        d.drawCircle(w / 2 - margin, h / 2 - margin, r);
        d.drawCircle(w / 2 - margin, -h / 2 + margin, r);
        d.drawCircle(-w / 2 + margin, -h / 2 + margin, r);
      }

      if (fontData) {
        d.setActiveLayer("TEXT");
        const font = new FontLoader().parse(fontData);

        const addTextToDXF = (text: string, size: number, yOffset: number) => {
          if (!text) return;
          const textUpper = text.toUpperCase();
          
          let currentX = 0;
          let globalXMin = Infinity, globalXMax = -Infinity, globalYMin = Infinity, globalYMax = -Infinity;
          const charData: { points: THREE.Vector2[], xOffset: number, holes: THREE.Vector2[][] }[] = [];

          for (let i = 0; i < textUpper.length; i++) {
            const char = textUpper.charAt(i);
            if (char === ' ') {
              currentX += size * 0.3 + letterSpacing;
              continue;
            }
            
            const cShapes = font.generateShapes(char, size);
            let cMinX = Infinity, cMaxX = -Infinity;
            
            cShapes.forEach(s => {
              s.getPoints().forEach(p => {
                if (p.x < cMinX) cMinX = p.x;
                if (p.x > cMaxX) cMaxX = p.x;
                if (p.y < globalYMin) globalYMin = p.y;
                if (p.y > globalYMax) globalYMax = p.y;
              });
            });
            
            const cWidth = cMaxX === -Infinity ? 0 : cMaxX - cMinX;
            
            cShapes.forEach(s => {
              const pts = s.getPoints(4);
              const holePts = s.holes ? s.holes.map(h => h.getPoints(4)) : [];
              
              pts.forEach(p => {
                const finalX = p.x - cMinX + currentX;
                if (finalX < globalXMin) globalXMin = finalX;
                if (finalX > globalXMax) globalXMax = finalX;
              });
              
              charData.push({ points: pts, xOffset: currentX - cMinX, holes: holePts });
            });
            
            currentX += cWidth + letterSpacing;
          }
          
          const textWidth = globalXMax - globalXMin;
          const availableWidth = vorm === 'ovaal' ? w * 0.75 : w;
          const maxWidth = availableWidth - 50;
          const scale = textWidth > maxWidth ? maxWidth / textWidth : 1.0;

          const offsetX = -(globalXMax + globalXMin) / 2;
          const offsetY = -(globalYMax + globalYMin) / 2;

          charData.forEach(cd => {
            const pts: [number, number][] = cd.points.map(p => {
              let px = (p.x + cd.xOffset + offsetX) * scale;
              let py = (p.y + offsetY) * scale + yOffset;
              return [px, py];
            });
            d.drawPolyline(pts, true);
            
            cd.holes.forEach(hPoints => {
              const hPts: [number, number][] = hPoints.map(p => {
                let px = (p.x + cd.xOffset + offsetX) * scale;
                let py = (p.y + offsetY) * scale + yOffset;
                return [px, py];
              });
              d.drawPolyline(hPts, true);
            });
          });
        };

        addTextToDXF(huisnummer, h * 0.4, h * 0.15);
        addTextToDXF(naam, h * 0.12, -h * 0.25);
      }

      d.header("LWDEFAULT", [[280, 0]]);
      let dxfString = d.toDxfString();
      dxfString = dxfString.replace(/370\n-1/g, '370\n0');
      
      const safeNaam = naam.replace(/[^a-zA-Z0-9]/g, '_');
      const fileName = `naambordje_${w}x${h}_${huisnummer}_${safeNaam}.dxf`;
      
      let snapshotDataUrl = "/images/naambordje.png";
      const canvas = document.querySelector('canvas');
      if (canvas) {
        try {
          snapshotDataUrl = canvas.toDataURL('image/jpeg', 0.8);
        } catch (e) {
          console.error("Kon geen snapshot maken", e);
        }
      }

      addItem({
        id: "d423aeb6-fd6f-4eea-9d47-407e44419923" as any,
        name: `Naambordje op maat: ${huisnummer} - ${naam} (${w}x${h}mm, ${vorm})`,
        price: 89.00,
        image: snapshotDataUrl,
        color: materialType,
        dxf_string: dxfString,
        dxf_filename: fileName
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
              <h1 className="text-2xl font-light tracking-widest text-zinc-900 mb-2">NAAMBORDJE</h1>
              <p className="text-zinc-500 text-sm">Configureer je gepersonaliseerde naambordje</p>
            </div>

            <div className="space-y-6">
              <div className="space-y-4">
                <label className="text-xs font-semibold tracking-wider text-zinc-400 uppercase">Vorm</label>
                <div className="grid grid-cols-3 gap-3">
                  {['rechthoek', 'vierkant', 'ovaal'].map((v) => (
                    <button
                      key={v}
                      onClick={() => setVorm(v)}
                      className={`py-2 px-4 rounded-md border text-sm font-medium transition-colors capitalize ${
                        vorm === v 
                          ? 'bg-black text-white border-black' 
                          : 'bg-transparent border-zinc-200 text-zinc-600 hover:bg-zinc-50'
                      }`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>

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
                  {vorm !== 'vierkant' && (
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
                  )}
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
              
              <div className="space-y-4 pt-2">
                <label className="text-xs text-muted-foreground block mb-2">Letter Spatiëring ({letterSpacing}mm)</label>
                <input 
                  type="range" 
                  min="0" 
                  max="20" 
                  step="0.5"
                  value={letterSpacing}
                  onChange={(e) => setLetterSpacing(Number(e.target.value))}
                  className="w-full accent-primary"
                />
              </div>

              <div className="space-y-4 pt-2">
                <label className="text-xs font-semibold tracking-wider text-zinc-400 uppercase">Lettertype</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { url: '/AllertaStencil-Regular.ttf', name: 'Allerta Stencil' },
                    { url: '/SairaStencilOne.ttf', name: 'Saira Stencil' },
                    { url: '/Plaster.ttf', name: 'Plaster' },
                    { url: '/BlackOpsOne.ttf', name: 'Black Ops' },
                    { url: '/SirinStencil.ttf', name: 'Sirin Stencil' }
                  ].map((f) => (
                    <button
                      key={f.url}
                      onClick={() => setFontUrl(f.url)}
                      style={{ fontFamily: f.name }}
                      className={`py-2 px-3 rounded-md border text-sm transition-colors ${
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

            {/* Productie Export Knop */}
            <div className="pt-4">
              <button
                onClick={handleExportDXF}
                disabled={isExporting}
                className="w-full bg-[#111] hover:bg-black text-white font-medium py-3.5 px-4 rounded-md transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
          <Canvas gl={{ preserveDrawingBuffer: true }} camera={{ position: [-150, -50, 400], fov: 40, near: 0.1, far: 10000 }}>
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
                  vorm={vorm}
                  letterSpacing={letterSpacing}
                />
              </Center>
              <ContactShadows 
                key={`${width}-${height}-${huisnummer}-${naam}`}
                position={[0, 0, -2]} 
                rotation={[Math.PI / 2, 0, 0]}
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
