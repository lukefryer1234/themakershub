import React, { useState, useEffect, useMemo } from 'react';
import { parse } from 'gcode-parser';
import { Canvas } from '@react-three/fiber';
import { Line, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

const GCodeAnalyzer = () => {
  const [gcode, setGcode] = useState<string | null>(null);
  const [settings, setSettings] = useState<{ electricityCost?: string; printerPower?: string }>({});
  const [filaments, setFilaments] = useState([]);
  const [selectedFilamentId, setSelectedFilamentId] = useState<number | null>(null);
  const [currentLayer, setCurrentLayer] = useState(0);

  useEffect(() => {
    window.electron.getSettings().then(setSettings);
    window.electron.getFilaments().then(setFilaments);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        setGcode(event.target.result as string);
      };
      reader.readAsText(file);
    }
  };

  const analysis = useMemo(() => {
    if (!gcode) return null;
    const parsed = parse(gcode);
    const filamentUsedMm = parsed.layers.reduce((total: number, layer: any) => total + layer.extrusion, 0);
    const selectedFilament = filaments.find((f: any) => f.id === selectedFilamentId);
    const filamentUsedGrams = selectedFilament ? (filamentUsedMm * selectedFilament.density) / 1000 : 0;
    const printTimeHours = parsed.metadata.printTime / 3600;
    const materialCost = selectedFilament ? (filamentUsedGrams / selectedFilament.spoolWeight) * selectedFilament.purchasePrice : 0;
    const electricityCost = settings.electricityCost && settings.printerPower ? (printTimeHours * (parseInt(settings.printerPower) / 1000)) * parseFloat(settings.electricityCost) : 0;
    const totalCost = materialCost + electricityCost;

    const travelPoints: THREE.Vector3[] = [];
    const extrusionPoints: THREE.Vector3[] = [];
    let lastPosition = new THREE.Vector3();
    parsed.layers.slice(0, currentLayer).forEach((layer: any) => {
      layer.lines.forEach((line: any) => {
        const newPosition = new THREE.Vector3(line.x, line.y, layer.z);
        if (line.extrusion) {
          extrusionPoints.push(lastPosition, newPosition);
        } else {
          travelPoints.push(lastPosition, newPosition);
        }
        lastPosition = newPosition;
      });
    });

    return { filamentUsedMm, filamentUsedGrams, printTimeHours, materialCost, electricityCost, totalCost, travelPoints, extrusionPoints, totalLayers: parsed.layers.length };
  }, [gcode, settings, filaments, selectedFilamentId, currentLayer]);

  return (
    <div>
      <h2>G-Code Analyzer & Cost Calculator</h2>
      <input type="file" accept=".gcode" onChange={handleFileChange} />
      <select onChange={(e) => setSelectedFilamentId(parseInt(e.target.value))}>
        <option>Select Filament</option>
        {filaments.map(f => <option key={f.id} value={f.id}>{f.manufacturer} {f.materialType}</option>)}
      </select>
      {analysis && (
        <div>
          <input
            type="range"
            min="0"
            max={analysis.totalLayers}
            value={currentLayer}
            onChange={(e) => setCurrentLayer(parseInt(e.target.value))}
          />
          <p>Layer: {currentLayer} / {analysis.totalLayers}</p>
          <h3>Analysis Results</h3>
          <p>Filament Used: {analysis.filamentUsedMm.toFixed(2)} mm ({analysis.filamentUsedGrams.toFixed(2)} g)</p>
          <p>Estimated Print Time: {analysis.printTimeHours.toFixed(2)} hours</p>
          <p>Material Cost: ${analysis.materialCost.toFixed(2)}</p>
          <p>Electricity Cost: ${analysis.electricityCost.toFixed(2)}</p>
          <p>Total Print Cost: ${analysis.totalCost.toFixed(2)}</p>
          <Canvas style={{ height: '500px' }}>
            <ambientLight />
            <pointLight position={[10, 10, 10]} />
            <Line points={analysis.extrusionPoints} color="blue" />
            <Line points={analysis.travelPoints} color="red" />
            <OrbitControls />
          </Canvas>
        </div>
      )}
    </div>
  );
};

export default GCodeAnalyzer;
