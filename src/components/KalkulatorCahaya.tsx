import React, { useState, useEffect, useCallback } from 'react';
import { Calculator, Lightbulb, CheckCircle2, AlertTriangle, Settings2, Info, Maximize, Map, X, Maximize2, Download } from 'lucide-react';

// ============================================================
// Bug #4 FIX: Constants moved OUTSIDE component (module-level)
// Prevents re-creation on every render & stabilizes useEffect deps
// ============================================================
const PRESETS = [
  // Bug #1 FIX: Each value is now truly unique (no ambiguous duplicates)
  { label: 'Ruang Kerja / Administrasi (300 Lux)', value: '300_kerja', lux: 300 },
  { label: 'Dapur / Pengolahan Pangan (TPP) (500 Lux)', value: '500_dapur', lux: 500 },
  { label: 'Kantin / Ruang Makan (300 Lux)', value: '300_kantin', lux: 300 },
  { label: 'Ruang Tunggu Penumpang (TFU) (200 Lux)', value: '200_tunggu', lux: 200 },
  { label: 'Toilet / Kamar Mandi (100 Lux)', value: '100_toilet', lux: 100 },
  { label: 'Gudang (100 Lux)', value: '100_gudang', lux: 100 },
  { label: 'Kustom (Isi Manual)', value: 'custom', lux: 0 },
];

// Bug #3 FIX: Efficacy tuned to realistic field values (Indonesia market)
// LED: 80-100 → use 90 (average quality brands like Philips/Osram)
// TL:  60-80  → use 65 (fluorescent w/ ballast losses)
// CFL: 45-60  → use 55 (compact fluorescent w/ aging)
const LAMP_EFFICACY: Record<string, number> = {
  'LED': 90,
  'TL': 65,
  'CFL': 55,
};

const INDO_WATT_STANDARDS = [5, 7, 9, 12, 15, 18, 24, 30, 36, 40, 50, 60, 80, 100] as const;

// ============================================================
// Bug #8 FIX: Pre-calculate initial values from defaults
// so that the very first render shows correct numbers (no 0W flash)
// ============================================================
function calculateInitial() {
  const p = 5, l = 5, hPlafon = 3.0, hKerja = 0.8;
  const tLux = 300, eff = 90, cLlf = 0.8; // LED default, Sedang refleksi
  const h = hPlafon - hKerja;
  const luas = p * l;
  const k = luas / (h * (p + l));
  // k = 25 / (2.2 * 10) = 1.136 → Sedang CU = 0.45
  const cu = 0.45;
  const totalLumen = (tLux * luas) / (cu * cLlf);
  const targetSpacing = Math.max(1, h * 1.2);
  const c = Math.max(1, Math.round(p / targetSpacing));
  const r = Math.max(1, Math.round(l / targetSpacing));
  const n = c * r;
  const reqWattPerLamp = (totalLumen / n) / eff;
  const stdWatt = INDO_WATT_STANDARDS.find(w => w >= reqWattPerLamp) || 24;
  return { k, cu, n, c, r, stdWatt, lumen: stdWatt * eff };
}
const INIT = calculateInitial();

export default function KalkulatorCahaya() {
  // Inputs
  const [ruanganPreset, setRuanganPreset] = useState('300_kerja');
  const [targetLux, setTargetLux] = useState(300);
  
  const [panjang, setPanjang] = useState(5);
  const [lebar, setLebar] = useState(5);
  const [tinggiPlafon, setTinggiPlafon] = useState(3.0);
  const [tinggiBidangKerja, setTinggiBidangKerja] = useState(0.8);
  
  const [wattLampuInput, setWattLampuInput] = useState('Otomatis');
  const [tipeLampu, setTipeLampu] = useState('LED'); 
  const [bentukLampu, setBentukLampu] = useState('Otomatis');
  
  const [refleksi, setRefleksi] = useState('Sedang');
  const [llf, setLlf] = useState(0.8);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Bug #8 FIX: Initialize outputs from pre-calculated values
  const [hasilK, setHasilK] = useState(INIT.k);
  const [hasilCU, setHasilCU] = useState(INIT.cu);
  const [hasilLumen, setHasilLumen] = useState(INIT.lumen);
  const [hasilJumlahLampu, setHasilJumlahLampu] = useState(INIT.n);
  const [hasilTotalWatt, setHasilTotalWatt] = useState(INIT.n * INIT.stdWatt);
  const [luxAktual, setLuxAktual] = useState(300);
  const [rekomendasiBentuk, setRekomendasiBentuk] = useState('Bulat');
  const [hasilWattLampu, setHasilWattLampu] = useState(INIT.stdWatt);
  
  // Grid layout for SVG
  const [gridCols, setGridCols] = useState(INIT.c);
  const [gridRows, setGridRows] = useState(INIT.r);

  // ============================================================
  // Bug #2 FIX: Direct handler instead of useEffect for preset
  // This guarantees targetLux is ALWAYS synced when user switches
  // even if they switch back to the same preset after Custom
  // ============================================================
  const handlePresetChange = useCallback((value: string) => {
    setRuanganPreset(value);
    if (value !== 'custom') {
      const preset = PRESETS.find(p => p.value === value);
      if (preset) {
        setTargetLux(preset.lux);
      }
    }
  }, []);

  // Main Calculation Logic
  useEffect(() => {
    // 1. Effective Height
    const h = tinggiPlafon - tinggiBidangKerja;
    const effectiveH = h > 0 ? h : 0.1;

    // 2. Room Index (k) — SNI formula
    const luas = panjang * lebar;
    const keliling = panjang + lebar;
    const k = luas / (effectiveH * keliling);
    setHasilK(k);

    // 3. Shape recommendation
    const ratio = panjang > lebar ? panjang / lebar : lebar / panjang;
    const recommendedShape = ratio >= 1.5 ? 'Panjang' : 'Bulat';
    setRekomendasiBentuk(recommendedShape);

    // 4. Utilization Factor (CU) based on k and reflectance
    let cu = 0.5; 
    if (k < 1) {
      cu = refleksi === 'Terang' ? 0.45 : refleksi === 'Sedang' ? 0.35 : 0.25;
    } else if (k >= 1 && k < 2) {
      cu = refleksi === 'Terang' ? 0.55 : refleksi === 'Sedang' ? 0.45 : 0.35;
    } else {
      cu = refleksi === 'Terang' ? 0.65 : refleksi === 'Sedang' ? 0.55 : 0.45;
    }
    setHasilCU(cu);

    // 5. Lamp & Power Calculations
    const efficacy = LAMP_EFFICACY[tipeLampu] || 90;
    
    // Total raw lumen required (Zonal Cavity formula)
    const totalLumenRequired = (targetLux * luas) / (cu * llf);

    let finalCols = 1;
    let finalRows = 1;
    let finalWatt = 0;
    let finalN = 1;

    if (totalLumenRequired > 0) {
      if (wattLampuInput === 'Otomatis') {
        // --- EXPERT AUTO MODE ---
        // Space-Height Ratio (SHR) for uniform illumination: 1.0 - 1.5x mounting height
        const targetSpacing = Math.max(1, effectiveH * 1.2);
        
        let c = Math.max(1, Math.round(panjang / targetSpacing));
        let r = Math.max(1, Math.round(lebar / targetSpacing));
        
        // Bug #7 FIX: Ensure grid orientation matches room orientation
        if (panjang > lebar && r > c) {
          const temp = c; c = r; r = temp;
        } else if (lebar > panjang && c > r) {
          const temp = c; c = r; r = temp;
        }
        
        let found = false;
        
        // Find a grid that allows use of a standard Indonesian lamp wattage
        while (!found && c < 20 && r < 20) {
          const n = c * r;
          const lumenPerLamp = totalLumenRequired / n;
          const reqWatt = lumenPerLamp / efficacy;
          
          // Find the smallest standard watt >= required
          const stdWatt = INDO_WATT_STANDARDS.find(w => w >= reqWatt);
          
          if (stdWatt) {
            finalCols = c;
            finalRows = r;
            finalN = n;
            finalWatt = stdWatt;
            found = true;
          } else {
            // Increase density along the dimension with larger spacing
            if (panjang / c > lebar / r) {
              c++;
            } else {
              r++;
            }
          }
        }
        
        // Fallback for extremely large rooms
        if (!found) {
           finalCols = c;
           finalRows = r;
           finalN = c * r;
           finalWatt = INDO_WATT_STANDARDS[INDO_WATT_STANDARDS.length - 1];
        }
        
      } else {
        // --- MANUAL WATT MODE ---
        const manualWatt = Number(wattLampuInput);
        const lumenPerLamp = manualWatt * efficacy;
        const nExact = totalLumenRequired / lumenPerLamp;
        const nRounded = Math.ceil(nExact);
        
        // Find smallest symmetric grid that fits nRounded lamps
        const roomRatio = panjang / lebar;
        let bestCols = 1;
        let bestRows = 1;
        let bestScore = Infinity;
        
        for (let c = 1; c <= Math.max(nRounded, 20); c++) {
          const r = Math.ceil(nRounded / c);
          if (c * r >= nRounded) {
            const gridRatio = c / r;
            const ratioDiff = Math.abs(roomRatio - gridRatio);
            const waste = (c * r) - nRounded;
            // Composite score: penalize ratio mismatch and excess lamps
            const score = ratioDiff * 3 + waste;
            
            if (score < bestScore) {
              bestScore = score;
              bestCols = c;
              bestRows = r;
            }
          }
        }
        
        // Force grid orientation to match room orientation
        if (panjang > lebar && bestRows > bestCols) {
           const temp = bestCols; bestCols = bestRows; bestRows = temp;
        } else if (lebar > panjang && bestCols > bestRows) {
           const temp = bestCols; bestCols = bestRows; bestRows = temp;
        }
        
        finalCols = bestCols;
        finalRows = bestRows;
        finalN = bestCols * bestRows; // Symmetric grid count
        
        // ============================================================
        // Bug #5 FIX: After grid is determined, optimize wattage DOWN
        // If grid has more lamps than formula requires, find a lower
        // standard watt that still meets the target Lux
        // ============================================================
        const lumenNeededPerLamp = totalLumenRequired / finalN;
        const wattNeededPerLamp = lumenNeededPerLamp / efficacy;
        
        // Find the smallest standard watt that still meets or exceeds target
        const optimizedWatt = INDO_WATT_STANDARDS.find(w => w >= wattNeededPerLamp);
        
        if (optimizedWatt && optimizedWatt <= manualWatt) {
          // Use the optimized (possibly lower) wattage
          finalWatt = optimizedWatt;
        } else {
          // User-selected watt is still the minimum needed
          finalWatt = manualWatt;
        }
      }
    }

    setGridCols(finalCols);
    setGridRows(finalRows);
    setHasilJumlahLampu(finalN);
    setHasilWattLampu(finalWatt);
    setHasilTotalWatt(finalN * finalWatt);
    setHasilLumen(finalWatt * efficacy);
    
    // Recalculate actual lux based on the symmetric grid installed
    const actualLux = (finalN * (finalWatt * efficacy) * cu * llf) / luas;
    setLuxAktual(Math.round(actualLux));

  }, [panjang, lebar, tinggiPlafon, tinggiBidangKerja, targetLux, wattLampuInput, tipeLampu, refleksi, llf, bentukLampu]);

  const bentukFinal = bentukLampu === 'Otomatis' ? rekomendasiBentuk : bentukLampu;
  const hVisual = Math.max(0.1, tinggiPlafon - tinggiBidangKerja);
  const coverageRadius = hVisual * 1.73; // ~60 degree half-angle spread

  // ============================================================
  // Bug #9 FIX: Revoke blob URL after download to prevent memory leak
  // ============================================================
  const handleDownloadSVG = useCallback(() => {
    const svgElement = document.getElementById('room-sketch-svg');
    if (!svgElement) return;
    const serializer = new XMLSerializer();
    let source = serializer.serializeToString(svgElement);
    if (!source.match(/^<svg[^>]+xmlns="http\:\/\/www\.w3\.org\/2000\/svg"/)) {
        source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
    }
    const blob = new Blob([source], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Denah-Cahaya-${panjang}x${lebar}m.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    // Bug #9: Free up memory
    URL.revokeObjectURL(url);
  }, [panjang, lebar]);

  const renderVisualizer = (maxH: string = '360px', isFullScreen: boolean = false) => {
    const pad = Math.max(panjang, lebar) * 0.15;
    const infoW = Math.max(panjang, lebar) * 0.85;
    const vW = Math.max(panjang, 1) + pad * 2 + infoW;
    const vH = Math.max(Math.max(lebar, 1) + pad * 2, infoW * 0.9);
    const wallT = Math.min(panjang, lebar) * 0.03;
    
    // Spacing between grid points
    const xSpacing = panjang / gridCols;
    const ySpacing = lebar / gridRows;

    // Bug #6 FIX: Unique clipPath IDs to avoid SVG ID collisions when
    // two instances of the visualizer exist (inline + modal)
    const clipId = isFullScreen ? 'roomClipFS' : 'roomClip';

    return (
      <div className={`relative w-full ${isFullScreen ? 'h-full flex-1' : 'max-w-xl'} flex flex-col items-center justify-center bg-slate-100 border border-slate-300 rounded-lg overflow-hidden p-4 shadow-inner`}>
        
        {/* HTML Labels Overlays */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-10 bg-white/95 text-slate-800 border border-slate-200 px-4 py-1.5 rounded-full text-xs md:text-sm font-bold shadow-md whitespace-nowrap backdrop-blur-sm tracking-wide">
          Panjang: <span className="text-sky-600">{panjang} m</span>
        </div>
        
        <div className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white/95 text-slate-800 border border-slate-200 px-3 py-1.5 rounded-full text-xs md:text-sm font-bold shadow-md whitespace-nowrap backdrop-blur-sm tracking-wide" style={{ writingMode: 'vertical-rl', textOrientation: 'mixed', transform: 'translateY(-50%) rotate(180deg)' }}>
          Lebar: <span className="text-sky-600">{lebar} m</span>
        </div>

        {/* SVG Canvas */}
        <svg 
          id="room-sketch-svg"
          viewBox={`0 0 ${vW} ${vH}`} 
          className="w-full drop-shadow-md h-full"
          preserveAspectRatio="xMidYMid meet"
          style={{ maxHeight: maxH }}
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Grid Pattern */}
            <pattern id={`floorGrid-${clipId}`} x={pad} y={pad} width={Math.min(panjang, lebar)*0.1} height={Math.min(panjang, lebar)*0.1} patternUnits="userSpaceOnUse">
              <rect width={Math.min(panjang, lebar)*0.1} height={Math.min(panjang, lebar)*0.1} fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="0.02" />
            </pattern>
            {/* Bug #6 FIX: ClipPath to constrain light coverage within room walls */}
            <clipPath id={clipId}>
              <rect x={pad} y={pad} width={panjang} height={lebar} />
            </clipPath>
          </defs>

          {/* Room Floor */}
          <rect x={pad} y={pad} width={panjang} height={lebar} fill={`url(#floorGrid-${clipId})`} />

          {/* Light Coverage — CLIPPED to room boundary (Bug #6 FIX) */}
          <g clipPath={`url(#${clipId})`}>
            {Array.from({ length: gridRows }).map((_, rIndex) => {
              return Array.from({ length: gridCols }).map((_, cIndex) => {
                const lampNum = (rIndex * gridCols) + cIndex;
                if (lampNum >= hasilJumlahLampu) return null;

                const cx = pad + (cIndex * xSpacing) + (xSpacing / 2);
                const cy = pad + (rIndex * ySpacing) + (ySpacing / 2);

                return (
                  <g key={`coverage-${rIndex}-${cIndex}`}>
                    {bentukFinal === 'Bulat' ? (
                      <circle 
                        cx={cx} cy={cy} r={coverageRadius} 
                        fill="rgba(250, 204, 21, 0.12)" stroke="#facc15" strokeWidth="0.02" strokeDasharray="0.1 0.1" 
                      />
                    ) : (
                      <ellipse
                        cx={cx} cy={cy}
                        rx={panjang > lebar ? coverageRadius * 1.3 : coverageRadius}
                        ry={panjang > lebar ? coverageRadius : coverageRadius * 1.3}
                        fill="rgba(250, 204, 21, 0.12)" stroke="#facc15" strokeWidth="0.02" strokeDasharray="0.1 0.1"
                      />
                    )}
                  </g>
                );
              });
            })}
          </g>

          {/* Grid lines (Blueprint dashed) */}
          {Array.from({ length: gridRows }).map((_, rIndex) => (
            <line key={`hline-${rIndex}`} x1={pad} y1={pad + (rIndex * ySpacing) + (ySpacing / 2)} x2={pad + panjang} y2={pad + (rIndex * ySpacing) + (ySpacing / 2)} stroke="#94a3b8" strokeWidth="0.03" strokeDasharray="0.15 0.15" />
          ))}
          {Array.from({ length: gridCols }).map((_, cIndex) => (
            <line key={`vline-${cIndex}`} x1={pad + (cIndex * xSpacing) + (xSpacing / 2)} y1={pad} x2={pad + (cIndex * xSpacing) + (xSpacing / 2)} y2={pad + lebar} stroke="#94a3b8" strokeWidth="0.03" strokeDasharray="0.15 0.15" />
          ))}

          {/* Lamp Fixtures */}
          {Array.from({ length: gridRows }).map((_, rIndex) => {
            return Array.from({ length: gridCols }).map((_, cIndex) => {
              const lampNum = (rIndex * gridCols) + cIndex;
              if (lampNum >= hasilJumlahLampu) return null;

              const cx = pad + (cIndex * xSpacing) + (xSpacing / 2);
              const cy = pad + (rIndex * ySpacing) + (ySpacing / 2);

              const maxTL_Len = Math.min(xSpacing * 0.8, ySpacing * 0.8, Math.max(panjang, lebar) * 0.15);
              const tlThick = Math.min(xSpacing * 0.2, ySpacing * 0.2, maxTL_Len * 0.2);
              const bulatRad = Math.min(xSpacing * 0.3, ySpacing * 0.3, Math.max(panjang, lebar) * 0.05);

              return (
                <g key={`lamp-${rIndex}-${cIndex}`}>
                  {bentukFinal === 'Bulat' ? (
                    <circle cx={cx} cy={cy} r={bulatRad} fill="#dc2626" />
                  ) : (
                    <>
                      {panjang > lebar ? (
                        <rect x={cx - maxTL_Len / 2} y={cy - tlThick / 2} width={maxTL_Len} height={tlThick} fill="#dc2626" rx={tlThick * 0.2} />
                      ) : (
                        <rect x={cx - tlThick / 2} y={cy - maxTL_Len / 2} width={tlThick} height={maxTL_Len} fill="#dc2626" rx={tlThick * 0.2} />
                      )}
                    </>
                  )}
                  {/* Center precision dot */}
                  <circle cx={cx} cy={cy} r={Math.min(bulatRad, tlThick) * 0.2} fill="#ffffff" />
                </g>
              );
            });
          })}

          {/* Walls */}
          <rect x={pad} y={pad} width={panjang} height={lebar} fill="none" stroke="#0f172a" strokeWidth={wallT} />
          <rect x={pad + wallT/2} y={pad + wallT/2} width={panjang - wallT} height={lebar - wallT} fill="none" stroke="#cbd5e1" strokeWidth={wallT * 0.3} />

          {/* Coverage radius annotation on first lamp */}
          {hasilJumlahLampu > 0 && (
            <g>
              {/* Show the coverage radius value near first lamp */}
              <text 
                x={pad + (xSpacing / 2)} 
                y={pad + (ySpacing / 2) + (bentukFinal === 'Bulat' ? coverageRadius * 0.5 : coverageRadius * 0.4)}
                fill="#b45309" fontSize={Math.max(panjang, lebar) * 0.04} fontFamily="sans-serif" fontWeight="bold" textAnchor="middle"
              >
                r = {coverageRadius.toFixed(1)}m
              </text>
            </g>
          )}

          {/* ========================================================= */}
          {/* EMBEDDED INFO PANEL FOR DOWNLOAD (CAD Title Block style)  */}
          {/* ========================================================= */}
          <g transform={`translate(${pad + panjang + pad * 0.5}, ${pad})`}>
            <rect x="0" y="0" width={infoW - pad * 0.5} height={infoW * 0.85} fill="#0f172a" rx={infoW * 0.03} />
            
            {/* Header */}
            <text x={infoW * 0.05} y={infoW * 0.1} fill="#94a3b8" fontSize={infoW * 0.035} fontFamily="sans-serif" fontWeight="bold" letterSpacing="0.05em">REKOMENDASI SNI K3</text>
            <text x={infoW * 0.05} y={infoW * 0.16} fill="#ffffff" fontSize={infoW * 0.045} fontFamily="sans-serif" fontWeight="bold">Kebutuhan Instalasi Penerangan</text>
            
            {/* Giant Number */}
            <text x={infoW * 0.05} y={infoW * 0.32} fill="#7dd3fc" fontSize={infoW * 0.15} fontFamily="sans-serif" fontWeight="900">{hasilJumlahLampu}</text>
            <text x={infoW * 0.15 + (hasilJumlahLampu.toString().length * infoW * 0.08)} y={infoW * 0.3} fill="#94a3b8" fontSize={infoW * 0.05} fontFamily="sans-serif" fontWeight="bold">Titik Lampu</text>
            
            {/* Lamp Spec */}
            <text x={infoW * 0.05} y={infoW * 0.4} fill="#cbd5e1" fontSize={infoW * 0.035} fontFamily="sans-serif">
              Lampu <tspan fill="#ffffff" fontWeight="bold">{bentukFinal.toUpperCase()} {tipeLampu} {hasilWattLampu}W</tspan> ({hasilLumen} Lm/titik)
            </text>

            <line x1={infoW * 0.05} y1={infoW * 0.45} x2={infoW * 0.8} y2={infoW * 0.45} stroke="#334155" strokeWidth={infoW * 0.005} />

            {/* Metrics */}
            <text x={infoW * 0.05} y={infoW * 0.53} fill="#94a3b8" fontSize={infoW * 0.035} fontFamily="sans-serif">Total Daya Listrik:</text>
            <text x={infoW * 0.8} y={infoW * 0.53} fill="#34d399" fontSize={infoW * 0.04} fontFamily="sans-serif" fontWeight="bold" textAnchor="end">{hasilTotalWatt} Watt</text>
            
            <text x={infoW * 0.05} y={infoW * 0.61} fill="#94a3b8" fontSize={infoW * 0.035} fontFamily="sans-serif">Iluminasi Aktual:</text>
            <text x={infoW * 0.8} y={infoW * 0.61} fill={luxAktual >= targetLux ? "#34d399" : "#fbbf24"} fontSize={infoW * 0.04} fontFamily="sans-serif" fontWeight="bold" textAnchor="end">{luxAktual} / {targetLux} Lux</text>

            <line x1={infoW * 0.05} y1={infoW * 0.66} x2={infoW * 0.8} y2={infoW * 0.66} stroke="#334155" strokeWidth={infoW * 0.005} />

            {/* Zonal Cavity Details */}
            <text x={infoW * 0.05} y={infoW * 0.74} fill="#94a3b8" fontSize={infoW * 0.03} fontFamily="sans-serif">Luas Ruangan (A): <tspan fill="#ffffff" fontWeight="bold">{panjang * lebar} m²</tspan></text>
            <text x={infoW * 0.5} y={infoW * 0.74} fill="#94a3b8" fontSize={infoW * 0.03} fontFamily="sans-serif">Indeks Ruang (k): <tspan fill="#ffffff" fontWeight="bold">{hasilK.toFixed(2)}</tspan></text>
            
            <text x={infoW * 0.05} y={infoW * 0.8} fill="#94a3b8" fontSize={infoW * 0.03} fontFamily="sans-serif">Tinggi Efektif (h): <tspan fill="#ffffff" fontWeight="bold">{hVisual.toFixed(1)} m</tspan></text>
            <text x={infoW * 0.5} y={infoW * 0.8} fill="#94a3b8" fontSize={infoW * 0.03} fontFamily="sans-serif">Util. Factor (CU): <tspan fill="#ffffff" fontWeight="bold">{hasilCU}</tspan></text>
          </g>

        </svg>

        {/* Action Buttons overlay */}
        <div className="absolute bottom-4 right-4 flex gap-3">
          <button 
            onClick={handleDownloadSVG}
            className="bg-slate-800 hover:bg-slate-700 text-white p-2.5 rounded-full shadow-lg transition-all flex items-center gap-2 group"
            title="Download SVG"
          >
            <Download className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold pr-1 hidden group-hover:block transition-all">Unduh Sketsa</span>
          </button>

          {!isFullScreen && (
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-sky-600 hover:bg-sky-500 text-white p-2.5 rounded-full shadow-lg transition-all flex items-center gap-2 group"
              title="Fokus Gambar"
            >
              <Maximize2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold pr-1 hidden group-hover:block transition-all">Perbesar Denah</span>
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-800 tracking-tight flex items-center gap-3">
            <Calculator className="w-7 h-7 text-sky-600" />
            Kalkulator Pencahayaan (SNI)
          </h1>
          <p className="text-sm text-gray-500 mt-1 font-medium">
            Standard: Permenaker No. 5/2018 & SNI 03-6575-2001 (Metode Zonal Cavity)
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* INPUT PANEL */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-slate-50 border-b border-gray-200 px-5 py-4 flex items-center gap-2">
              <Settings2 className="w-5 h-5 text-slate-500" />
              <h2 className="font-bold text-slate-700">Parameter Ruangan (TFU / TPP)</h2>
            </div>
            
            <div className="p-5 space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Jenis Ruangan (Target Lux)</label>
                {/* Bug #2 FIX: Use direct handler instead of useEffect */}
                <select 
                  className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-sky-500 focus:border-sky-500 block p-2.5 font-medium"
                  value={ruanganPreset}
                  onChange={(e) => handlePresetChange(e.target.value)}
                >
                  {PRESETS.map(p => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
              </div>

              {ruanganPreset === 'custom' && (
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Target Lux Manual</label>
                  <input 
                    type="number" min="10" max="2000"
                    className="w-full bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-sky-500 focus:border-sky-500 block p-2.5"
                    value={targetLux}
                    onChange={(e) => setTargetLux(Number(e.target.value))}
                  />
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Dimensi Ruang (Meter)</label>
                  <div className="flex gap-2">
                    <div className="relative w-full">
                      <input type="number" min="1" step="0.5" className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg p-2.5 pr-8" value={panjang} onChange={(e) => setPanjang(Math.max(1, Number(e.target.value)))} />
                      <span className="absolute right-3 top-2.5 text-xs text-gray-500 font-bold">P</span>
                    </div>
                    <div className="relative w-full">
                      <input type="number" min="1" step="0.5" className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg p-2.5 pr-8" value={lebar} onChange={(e) => setLebar(Math.max(1, Number(e.target.value)))} />
                      <span className="absolute right-3 top-2.5 text-xs text-gray-500 font-bold">L</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Tinggi Vertikal (Meter)</label>
                  <div className="flex gap-2">
                    <div className="relative w-full" title="Tinggi Plafon dari lantai">
                      <input type="number" min="2" step="0.1" className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg p-2.5 pr-8" value={tinggiPlafon} onChange={(e) => setTinggiPlafon(Number(e.target.value))} />
                      <span className="absolute right-3 top-2.5 text-xs text-gray-500 font-bold">Plafon</span>
                    </div>
                    <div className="relative w-full" title="Tinggi Bidang Kerja (Meja = 0.8m, Lantai = 0m)">
                      <input type="number" min="0" step="0.1" className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg p-2.5 pr-8" value={tinggiBidangKerja} onChange={(e) => setTinggiBidangKerja(Number(e.target.value))} />
                      <span className="absolute right-3 top-2.5 text-xs text-gray-500 font-bold">Meja</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4 border-t border-gray-100">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Warna / Pantulan Ruang</label>
                  <select 
                    className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg p-2.5"
                    value={refleksi}
                    onChange={(e) => setRefleksi(e.target.value)}
                  >
                    <option value="Terang">Terang (Putih / Kaca / Bersih)</option>
                    <option value="Sedang">Sedang (Krem / Abu-abu terang)</option>
                    <option value="Gelap">Gelap (Warna tua / Kayu gelap)</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Faktor Depresiasi (LLF)</label>
                  <select 
                    className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg p-2.5"
                    value={llf}
                    onChange={(e) => setLlf(Number(e.target.value))}
                  >
                    <option value="0.8">0.8 - Bersih / AC (Baik)</option>
                    <option value="0.7">0.7 - Berdebu Sedang (Normal)</option>
                    <option value="0.6">0.6 - Kotor / Gudang Terbuka (Buruk)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-slate-50 border-b border-gray-200 px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-slate-500" />
                <h2 className="font-bold text-slate-700">Spesifikasi Lampu</h2>
              </div>
            </div>
            <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Jenis</label>
                <select 
                  className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg p-2.5"
                  value={tipeLampu}
                  onChange={(e) => setTipeLampu(e.target.value)}
                >
                  <option value="LED">LED (~90 Lm/W)</option>
                  <option value="TL">TL/Neon (~65 Lm/W)</option>
                  <option value="CFL">CFL (~55 Lm/W)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Bentuk</label>
                <select 
                  className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg p-2.5"
                  value={bentukLampu}
                  onChange={(e) => setBentukLampu(e.target.value)}
                >
                  <option value="Otomatis">Otomatis (AI Rekomendasi)</option>
                  <option value="Bulat">Bulat / Downlight</option>
                  <option value="Panjang">Panjang / TL Tube</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Daya (Watt)</label>
                <select 
                  className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg p-2.5 font-semibold text-sky-700"
                  value={wattLampuInput}
                  onChange={(e) => setWattLampuInput(e.target.value)}
                >
                  <option value="Otomatis">Auto (Simetris)</option>
                  {INDO_WATT_STANDARDS.map(w => (
                    <option key={w} value={w}>{w} Watt</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* VISUALIZATION PANEL */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-sky-50 border-b border-sky-100 px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Map className="w-5 h-5 text-sky-600" />
                <h2 className="font-bold text-sky-900">Sketsa Persebaran Cahaya</h2>
              </div>
              <div className="text-xs font-bold text-sky-600 bg-sky-100 px-3 py-1 rounded-full uppercase tracking-wider">
                Simulasi K3
              </div>
            </div>
            
            <div className="p-6 bg-white flex flex-col items-center justify-center relative overflow-hidden" style={{ minHeight: '400px' }}>
              {renderVisualizer('360px', false)}

              {/* Legend */}
              <div className="flex items-center gap-5 mt-6 border-t border-gray-200 pt-4 w-full justify-center">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-red-600"></div>
                  <span className="text-slate-600 text-[10px] font-bold uppercase">Lampu Fisik</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-100 border border-yellow-400"></div>
                  <span className="text-slate-600 text-[10px] font-bold uppercase">Area Terang</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-slate-200 border border-slate-300"></div>
                  <span className="text-slate-600 text-[10px] font-bold uppercase">Area Gelap (Blind Spot)</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 border-t border-gray-200 p-4">
               <div className="flex items-start gap-3 text-sm">
                 <div className="p-2 bg-sky-100 rounded-full text-sky-600 shrink-0 mt-1">
                   <Info className="w-4 h-4" />
                 </div>
                 <div>
                   <h4 className="font-bold text-slate-800">Analisis Distribusi Cahaya</h4>
                   <p className="text-slate-600 mt-1">
                     Kalkulator mengutamakan <strong className="text-sky-700">simetri letak lampu</strong>. Jika hitungan ganjil/tidak simetris, sistem membulatkan jumlah lampu ke formasi grid penuh dan <strong className="text-sky-700">mengoptimalkan watt ke bawah</strong> agar Lux aktual mendekati target tanpa pemborosan.
                   </p>
                 </div>
               </div>
            </div>
          </div>

        </div>

        {/* OUTPUT PANEL */}
        <div className="space-y-6">
          <div className="bg-slate-900 rounded-xl shadow-lg border border-slate-700 overflow-hidden text-white relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-sky-400 to-emerald-400"></div>
            
            <div className="p-6">
              <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Rekomendasi SNI K3</h3>
              <p className="text-lg font-semibold leading-tight mb-6">Kebutuhan Instalasi Penerangan</p>
              
              <div className="flex items-end gap-2 mb-2">
                <span className="text-6xl font-black tracking-tighter text-sky-300 leading-none">{hasilJumlahLampu}</span>
                <span className="text-xl font-bold text-slate-400 mb-1">Titik Lampu</span>
              </div>
              
              <p className="text-sm text-slate-400 mb-6">
                Lampu <strong className="text-white uppercase">{bentukFinal} {tipeLampu} {hasilWattLampu}W</strong> ({hasilLumen} Lumen/titik).
              </p>

              <div className="space-y-4 border-t border-slate-700 pt-5">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-400">Total Beban Daya Listrik</span>
                  <span className="font-bold text-emerald-400">{hasilTotalWatt} Watt</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-400">Iluminasi Aktual (Est)</span>
                  <span className={`font-bold ${luxAktual >= targetLux ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {luxAktual} / {targetLux} Lux
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-slate-800 p-4 px-6 border-t border-slate-700">
               {luxAktual >= targetLux ? (
                 <div className="flex gap-3 items-center text-emerald-400 text-sm font-bold">
                   <CheckCircle2 className="w-5 h-5" />
                   Memenuhi Syarat Kesling
                 </div>
               ) : (
                 <div className="flex gap-3 items-center text-rose-400 text-sm font-bold">
                   <AlertTriangle className="w-5 h-5" />
                   Tingkatkan Jumlah Lampu
                 </div>
               )}
            </div>
          </div>

          <div className="bg-sky-50 border border-sky-100 rounded-xl p-5 relative overflow-hidden">
            <Maximize className="w-24 h-24 text-sky-100 absolute -right-6 -bottom-6 opacity-50" />
            <h4 className="text-sky-800 font-bold text-sm mb-3 relative z-10">Metrik Teknis (Zonal Cavity)</h4>
            <div className="space-y-2 text-xs text-sky-700 relative z-10">
              <div className="flex justify-between">
                <span>Luas Ruangan (A)</span>
                <strong className="font-mono">{panjang * lebar} m²</strong>
              </div>
              <div className="flex justify-between">
                <span>Tinggi Efektif (h)</span>
                <strong className="font-mono">{Math.max(0.1, tinggiPlafon - tinggiBidangKerja).toFixed(1)} m</strong>
              </div>
              <div className="flex justify-between">
                <span>Indeks Ruang (k)</span>
                <strong className="font-mono">{hasilK.toFixed(2)}</strong>
              </div>
              <div className="flex justify-between">
                <span>Utilization Factor (CU)</span>
                <strong className="font-mono">{hasilCU}</strong>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* POP UP / MODAL FULL SCREEN VISUALIZER */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden">
            
            <div className="flex justify-between items-center p-4 border-b border-slate-200 bg-slate-50">
              <h3 className="text-slate-800 font-bold flex items-center gap-2">
                <Map className="w-5 h-5 text-sky-600" />
                Fokus Denah Penyinaran (CAD)
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded hover:bg-slate-200 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="flex-1 overflow-auto p-4 md:p-8 flex items-center justify-center bg-white relative">
              {renderVisualizer('80vh', true)}
            </div>

            <div className="bg-slate-50 border-t border-slate-200 p-4 flex justify-between items-center">
               <div className="text-slate-600 text-sm">
                 <span className="font-bold text-sky-700">Total: {hasilJumlahLampu} Titik Lampu</span> ({panjang}m x {lebar}m)
               </div>
               <button 
                 onClick={() => setIsModalOpen(false)}
                 className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
               >
                 Tutup Denah
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
