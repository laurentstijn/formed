"use client";

import React, { useState, useRef, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, Text, Center, ContactShadows, Bounds } from "@react-three/drei";
import * as THREE from "three";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { useCart } from "@/components/cart-provider";
import { useRouter } from "next/navigation";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface DogTagProps {
  shape: string;
  materialType: string;
  frontText: string;
  thickness: number;
}

function DogTagModel({ shape, materialType, frontText, thickness }: DogTagProps) {
  const materials = React.useMemo(() => ({
    inox: new THREE.MeshStandardMaterial({
      color: "#a8adb0",
      metalness: 0.85,
      roughness: 0.35,
    }),
    messing: new THREE.MeshStandardMaterial({
      color: "#d4af37",
      metalness: 0.9,
      roughness: 0.2,
    }),
  }), []);

  const activeMaterial = materials[materialType as keyof typeof materials] || materials.inox;
  const engraveMaterial = new THREE.MeshStandardMaterial({ color: "#222", metalness: 0.5, roughness: 0.8 });

  const geometry = React.useMemo(() => {
    const s = new THREE.Shape();
    if (shape === 'botje') {
      // Perfect Dog Bone Math
      const r = 5;
      const cx = 14;
      const cy = 4;
      const intersectAngle = 0.927; // atan2(4, 3)

      s.moveTo(-9, cy);
      s.lineTo(9, cy);

      // Top Right Arc
      s.absarc(cx, cy, r, Math.PI, -intersectAngle, true);

      // Bottom Right Arc
      s.absarc(cx, -cy, r, intersectAngle, -Math.PI, true);

      // Bottom Line
      s.lineTo(-9, -cy);

      // Bottom Left Arc
      s.absarc(-cx, -cy, r, 0, -Math.PI - intersectAngle, true);

      // Top Left Arc
      s.absarc(-cx, cy, r, -Math.PI + intersectAngle, -2 * Math.PI, true);

      // Add a hole for the keyring
      const hole = new THREE.Path();
      hole.absarc(-14, 0, 2, 0, Math.PI * 2, false);
      s.holes.push(hole);
    } else if (shape === 'rondje') {
      s.absarc(0, 0, 15, 0, Math.PI * 2, false);
      
      // Add a hole
      const hole = new THREE.Path();
      hole.absarc(0, 11, 2.5, 0, Math.PI * 2, false);
      s.holes.push(hole);
    } else if (shape === 'schild') {
      s.moveTo(-12, 15);
      s.lineTo(12, 15);
      s.quadraticCurveTo(15, -5, 0, -18);
      s.quadraticCurveTo(-15, -5, -12, 15);
      
      // Add a hole
      const hole = new THREE.Path();
      hole.absarc(0, 10, 2.5, 0, Math.PI * 2, false);
      s.holes.push(hole);
    }

    return new THREE.ExtrudeGeometry(s, {
      depth: thickness,
      bevelEnabled: true,
      bevelSegments: 4,
      steps: 2,
      bevelSize: 0.5,
      bevelThickness: 0.5,
      curveSegments: 64,
    });
  }, [shape, thickness]);

  return (
    <group>
      <mesh geometry={geometry} material={activeMaterial} castShadow receiveShadow />
      
      {/* Front Text */}
      {frontText && (
        <group position={[0, 0, thickness + 0.05]}>
          <Center>
            <Text
              font="/AllertaStencil-Regular.ttf"
              fontSize={4}
              color="#333"
              anchorX="center"
              anchorY="middle"
              depthOffset={2}
            >
              {frontText}
            </Text>
          </Center>
        </group>
      )}
    </group>
  );
}

export default function HondenlabelPage() {
  const router = useRouter();
  const { addItem } = useCart();
  
  const [shape, setShape] = useState('botje');
  const [materialType, setMaterialType] = useState('inox');
  const [frontText, setFrontText] = useState('MAX');
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const quantities = [1, 2, 5, 10];

  const controlsRef = useRef<any>(null);

  const calculatePrice = () => {
    let base = 15; // Base price
    if (materialType === 'messing') base += 5;
    if (shape === 'schild') base += 2;
    return base;
  };

  const handleAddToCart = () => {
    const unitPrice = calculatePrice();
    const materialName = materialType === 'inox' ? 'RVS' : 'Messing';
    
    addItem({
      id: `hondenlabel-${Date.now()}` as any,
      name: `Hondenlabel: ${shape.toUpperCase()} (${materialName})`,
      price: unitPrice,
      quantity: selectedQuantity,
      image: '/placeholder.svg', // In a real app, generate snapshot
      color: materialName,
      layer_settings: JSON.stringify({ frontText })
    });
    
    router.push('/cart');
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader />
      
      <div className="flex-1 flex flex-col md:flex-row relative">
        <div className="w-full md:w-[400px] bg-white border-r border-border flex flex-col shadow-sm z-20 order-2 md:order-1 shrink-0 h-[60vh] md:h-[calc(100vh-80px)]">
          <div className="p-6 border-b border-border bg-zinc-50/50">
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 uppercase">HONDENLABEL</h1>
            <p className="text-sm text-zinc-500 mt-2 uppercase tracking-wider leading-relaxed">
              Personaliseer een onverwoestbaar label voor je trouwe viervoeter.
            </p>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <Accordion type="multiple" defaultValue={["item-1", "item-2", "item-3"]} className="w-full space-y-4">
              
              {/* Vorm */}
              <AccordionItem value="item-1" className="border-b-0 bg-zinc-50/50 rounded-lg border border-zinc-200 px-4">
                <AccordionTrigger className="hover:no-underline py-4">
                  <span className="text-sm font-semibold tracking-wider text-zinc-800 uppercase">1. Kies een Vorm</span>
                </AccordionTrigger>
                <AccordionContent className="pb-4">
                  <div className="grid grid-cols-3 gap-2">
                    {['botje', 'rondje', 'schild'].map(s => (
                      <button
                        key={s}
                        onClick={() => setShape(s)}
                        className={`py-2 px-2 rounded-md border text-sm font-medium transition-colors uppercase ${
                          shape === s ? 'bg-black text-white border-black' : 'bg-transparent border-zinc-200 text-zinc-600 hover:bg-zinc-50'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Materiaal */}
              <AccordionItem value="item-2" className="border-b-0 bg-zinc-50/50 rounded-lg border border-zinc-200 px-4">
                <AccordionTrigger className="hover:no-underline py-4">
                  <span className="text-sm font-semibold tracking-wider text-zinc-800 uppercase">2. Materiaal</span>
                </AccordionTrigger>
                <AccordionContent className="pb-4">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setMaterialType('inox')}
                      className={`py-2 px-3 rounded-md border text-sm font-medium transition-colors ${
                        materialType === 'inox' ? 'bg-black text-white border-black' : 'bg-transparent border-zinc-200 text-zinc-600 hover:bg-zinc-50'
                      }`}
                    >
                      RVS (Inox)
                    </button>
                    <button
                      onClick={() => setMaterialType('messing')}
                      className={`py-2 px-3 rounded-md border text-sm font-medium transition-colors ${
                        materialType === 'messing' ? 'bg-black text-white border-black' : 'bg-transparent border-zinc-200 text-zinc-600 hover:bg-zinc-50'
                      }`}
                    >
                      Goud / Messing
                    </button>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Gravure */}
              <AccordionItem value="item-3" className="border-b-0 bg-zinc-50/50 rounded-lg border border-zinc-200 px-4">
                <AccordionTrigger className="hover:no-underline py-4">
                  <span className="text-sm font-semibold tracking-wider text-zinc-800 uppercase">3. Tekst Graveren</span>
                </AccordionTrigger>
                <AccordionContent className="pb-4 space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-zinc-500 uppercase">Naam / Tekst (Max 12 karakters)</label>
                    <input 
                      type="text" 
                      value={frontText} 
                      onChange={(e) => setFrontText(e.target.value.toUpperCase())}
                      maxLength={12}
                      className="w-full mt-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-black"
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>

            </Accordion>
          </div>

          <div className="p-6 bg-[#FAF7F5] border-t border-border">
            <div className="space-y-4 mb-6">
              <label className="text-xs font-semibold tracking-wider text-zinc-400 uppercase">Hoeveelheid</label>
              <div className="grid grid-cols-4 gap-2">
                {quantities.map(q => (
                  <button
                    key={q}
                    onClick={() => setSelectedQuantity(q)}
                    className={`py-2 px-1 rounded-md border text-sm font-medium transition-colors flex flex-col items-center justify-center gap-1 ${
                      selectedQuantity === q ? 'bg-black text-white border-black' : 'bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50'
                    }`}
                  >
                    <span>{q}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-between items-end mb-4">
              <span className="text-sm font-medium text-zinc-500 uppercase">Totaal Prijs</span>
              <span className="text-2xl font-bold tracking-tight text-zinc-900">
                € {(calculatePrice() * selectedQuantity).toFixed(2)}
              </span>
            </div>
            
            <button 
              onClick={handleAddToCart}
              className="w-full bg-black text-white font-medium text-sm py-4 rounded-md uppercase tracking-widest hover:bg-zinc-800 transition-colors shadow-lg shadow-black/10 flex items-center justify-center gap-2 group"
            >
              Voeg toe aan winkelmand
            </button>
          </div>
        </div>

        {/* 3D Weergave */}
        <div className="flex-1 bg-background relative h-[45vh] md:h-auto order-1 md:order-2">
          <Canvas shadows camera={{ position: [0, 0, 60], fov: 45 }} gl={{ preserveDrawingBuffer: true }}>
            <color attach="background" args={["#fdf8f8"]} />
            <ambientLight intensity={0.5} />
            <directionalLight position={[10, 20, 10]} intensity={1} castShadow shadow-mapSize={[1024, 1024]} />
            
            <Bounds fit clip observe margin={1.2}>
              <Center>
                <DogTagModel 
                  shape={shape} 
                  materialType={materialType} 
                  frontText={frontText} 
                  thickness={2}
                />
              </Center>
            </Bounds>
            
            <ContactShadows position={[0, -15, 0]} opacity={0.4} scale={50} blur={2} far={20} />
            
            <OrbitControls 
              ref={controlsRef}
              makeDefault 
              minPolarAngle={0} 
              maxPolarAngle={Math.PI / 1.5} 
              enableDamping
            />
            <Environment preset="studio" />
          </Canvas>

          <button 
            onClick={() => controlsRef.current?.reset()}
            className="absolute top-6 right-6 w-10 h-10 bg-white border border-zinc-200 rounded-md shadow-sm flex items-center justify-center text-zinc-600 hover:bg-zinc-50 transition-colors z-10"
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
