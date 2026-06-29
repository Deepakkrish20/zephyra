import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowUpRight,
  ArrowRight,
  Compass,
  ShoppingBag,
  MapPin,
  Truck,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { Button } from '@/components/Button';

const highlightLastWord = (text) => {
  const words = text.split(' ');
  if (words.length <= 1) return text;
  const lastWord = words.pop();
  return (
    <>
      {words.join(' ')} <span className="text-[#71eb44]">{lastWord}</span>
    </>
  );
};

const BlueprintMarkers = () => (
  <div className="absolute inset-0 pointer-events-none select-none dark:hidden">
    <div className="hud-bracket hud-bracket-tl" />
    <div className="hud-bracket hud-bracket-tr" />
    <div className="hud-bracket hud-bracket-bl" />
    <div className="hud-bracket hud-bracket-br" />
    {/* Plus marks inside */}
    <div className="absolute top-2.5 left-2.5 text-[8px] text-slate-300 font-mono select-none">
      +
    </div>
    <div className="absolute top-2.5 right-2.5 text-[8px] text-slate-300 font-mono select-none">
      +
    </div>
    <div className="absolute bottom-2.5 left-2.5 text-[8px] text-slate-300 font-mono select-none">
      +
    </div>
    <div className="absolute bottom-2.5 right-2.5 text-[8px] text-slate-300 font-mono select-none">
      +
    </div>
  </div>
);

const CrosshairOverlay = () => (
  <div className="absolute inset-0 flex items-center justify-center bg-black/[0.01] opacity-0 group-hover:opacity-100 transition-opacity duration-300 dark:hidden pointer-events-none overflow-hidden">
    {/* Rotating radar circle */}
    <svg className="absolute w-24 h-24 text-slate-200/60 animate-radar-sweep" viewBox="0 0 100 100">
      <circle
        cx="50"
        cy="50"
        r="45"
        fill="none"
        stroke="currentColor"
        strokeWidth="0.5"
        strokeDasharray="2 6"
      />
      <circle
        cx="50"
        cy="50"
        r="30"
        fill="none"
        stroke="currentColor"
        strokeWidth="0.5"
        strokeDasharray="4 8"
      />
      <line x1="50" y1="5" x2="50" y2="95" stroke="currentColor" strokeWidth="0.5" />
      <line x1="5" y1="50" x2="95" y2="50" stroke="currentColor" strokeWidth="0.5" />
    </svg>

    <div className="relative w-8 h-8 flex items-center justify-center">
      <div className="w-4 h-px bg-[#71eb44]" />
      <div className="h-4 w-px bg-[#71eb44] absolute" />
      <div className="w-6 h-6 rounded-full border border-[#71eb44]/30 absolute animate-ping" />
    </div>

    <div className="absolute bottom-3 right-3 font-mono text-[7px] text-slate-400">
      [SYS_TGT_LOCK]
    </div>
  </div>
);

const HardwareHeader = ({ address = '0x4F8A', bus = 'BUS_01' }) => (
  <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4 font-mono text-[9px] text-slate-400 dark:hidden">
    <div className="flex items-center gap-2">
      {/* Glass indicator dots */}
      <div className="flex gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-red-400/60" />
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400/60" />
        <span className="w-1.5 h-1.5 rounded-full bg-[#71eb44]" />
      </div>
      <span className="font-bold tracking-wider text-slate-500">
        DEV_{address} {'//'} {bus}
      </span>
    </div>
    <div className="flex items-center gap-1.5">
      <span className="w-1 h-1 rounded-full bg-[#71eb44] animate-pulse" />
      <span className="text-[8px] uppercase tracking-widest text-slate-400 font-semibold">
        SIGNAL: OK
      </span>
    </div>
  </div>
);

const FloatingTelemetryWidget = () => (
  <div className="fixed bottom-4 right-4 z-50 p-4 bg-white/80 backdrop-blur-md border border-slate-200 rounded-2xl shadow-xl font-mono text-[9px] text-slate-500 space-y-2 dark:hidden max-w-[200px] pointer-events-none select-none">
    <div className="flex items-center justify-between border-b border-slate-150 pb-1.5">
      <span className="font-bold text-slate-800 flex items-center gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-[#71eb44] animate-ping" />
        SYSTEM STATUS
      </span>
      <span className="text-slate-400">v2026.06</span>
    </div>
    <div className="grid grid-cols-2 gap-x-2 gap-y-1">
      <span>LATENCY:</span>
      <span className="text-right font-semibold text-slate-800">14ms</span>
      <span>NODES:</span>
      <span className="text-right font-semibold text-slate-800">4 / 4 ACTIVE</span>
      <span>SECTOR:</span>
      <span className="text-right font-semibold text-slate-800">INS_SEC_A1</span>
      <span>SYS_LOAD:</span>
      <span className="text-right font-semibold text-slate-800">0.08%</span>
    </div>
    <div className="border-t border-slate-150 pt-1.5 text-[8px] text-slate-400 text-center uppercase tracking-widest">
      ZEPHYRA ENGINE ACTIVE
    </div>
  </div>
);

export const Home = () => {
  const [activeSlide, setActiveSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const slides = [
    {
      id: 'headphones',
      index: '01',
      category: 'AUDIO // INS-01',
      name: 'STUDIO WIRELESS HEADPHONES',
      description:
        'HIGH-FIDELITY ACTIVE NOISE CANCELLATION. HANDCRAFTED FOR ZERO-DISTORTION ACOUSTICS AND LONG-TERM ACOUSTICAL PERFORMANCE.',
      price: '$299.00',
      image:
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
      specs: [
        { label: 'BATTERY', value: '40 Hours' },
        { label: 'DRIVERS', value: '40mm Neodymium' },
        { label: 'CONNECT', value: 'Bluetooth 5.2' },
      ],
    },
    {
      id: 'keyboard',
      index: '02',
      category: 'ACCESSORIES // INS-02',
      name: 'ERGONOMIC MECHANICAL KEYBOARD',
      description:
        '75% MECHANICAL CHASSIS. HOT-SWAPPABLE TACTILE SWITCHES WITH DEEP-PROFILE DOUBLE-SHOT PBT KEYCAPS.',
      price: '$189.00',
      image:
        'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80',
      specs: [
        { label: 'SWITCHES', value: 'Gateron Tactile' },
        { label: 'KEYCAPS', value: 'Double-Shot PBT' },
        { label: 'LAYOUT', value: '75% Compact' },
      ],
    },
    {
      id: 'desk',
      index: '03',
      category: 'FURNITURE // INS-03',
      name: 'WOODEN STANDING DESK',
      description:
        'SOLID OAK TIMBER PLATFORM. DOUBLE-MOTOR SYMMETRICAL HEIGHT REGULATION FOR SEAMLESS ARCHITECTURAL ALIGNMENT.',
      price: '$499.00',
      image:
        'https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?w=800&auto=format&fit=crop&q=80',
      specs: [
        { label: 'MATERIAL', value: 'Solid Oak Wood' },
        { label: 'MOTOR', value: 'Dual Lift System' },
        { label: 'HEIGHTS', value: '60cm - 125cm' },
      ],
    },
  ];

  const handleNext = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
      setIsTransitioning(false);
    }, 250);
  };

  const handlePrev = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setActiveSlide((prev) => (prev - 1 + slides.length) % slides.length);
      setIsTransitioning(false);
    }, 250);
  };

  // Auto slide transition every 8 seconds
  useEffect(() => {
    const timer = setInterval(handleNext, 8000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const slide = slides[activeSlide];

  return (
    <div className="relative space-y-32 py-4 animate-fade-up">
      {/* Floating Telemetry Control Widget (Light Mode only) */}
      <FloatingTelemetryWidget />

      {/* Background Blueprint Grid (Light Mode only) */}
      <div className="absolute inset-0 top-0 -z-25 bg-blueprint-grid-fine pointer-events-none opacity-45 dark:hidden" />

      {/* Technical page-edge measurement coordinates (Light Mode only) */}
      <div className="absolute top-10 left-8 font-mono text-[8px] text-slate-300 dark:hidden tracking-widest select-none pointer-events-none">
        [Y_COORD // 0.0]
      </div>
      <div className="absolute bottom-10 left-8 font-mono text-[8px] text-slate-300 dark:hidden tracking-widest select-none pointer-events-none">
        [Y_COORD // 1.0]
      </div>
      <div className="absolute top-10 right-8 font-mono text-[8px] text-slate-300 dark:hidden tracking-widest select-none pointer-events-none">
        [X_COORD // 1.0]
      </div>
      <div className="absolute bottom-10 right-8 font-mono text-[8px] text-slate-300 dark:hidden tracking-widest select-none pointer-events-none">
        [X_COORD // 0.0]
      </div>

      {/* Background Dot Pattern */}
      <div className="absolute inset-0 top-0 -z-20 bg-dot-pattern pointer-events-none opacity-40" />

      {/* Light Theme Premium Ambient Radial Green Glows */}
      <div className="absolute top-[-10%] left-[10%] -z-10 w-[70vw] h-[70vh] rounded-full bg-[radial-gradient(circle,_rgba(113,235,68,0.05)_0%,_transparent_65%)] dark:hidden pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-10%] -z-10 w-[60vw] h-[60vh] rounded-full bg-[radial-gradient(circle,_rgba(113,235,68,0.03)_0%,_transparent_60%)] dark:hidden pointer-events-none" />

      {/* Light Theme Slow-Moving Mesh Gradient Blobs */}
      <div className="absolute top-[10%] left-[5%] -z-10 w-[45vw] h-[45vw] rounded-full bg-[radial-gradient(circle,_rgba(113,235,68,0.05)_0%,_transparent_70%)] blur-[80px] animate-blob-1 dark:hidden pointer-events-none" />
      <div className="absolute top-[50%] right-[10%] -z-10 w-[50vw] h-[50vw] rounded-full bg-[radial-gradient(circle,_rgba(113,235,68,0.03)_0%,_transparent_70%)] blur-[100px] animate-blob-2 dark:hidden pointer-events-none" />
      <div className="absolute bottom-[5%] left-[15%] -z-10 w-[40vw] h-[40vw] rounded-full bg-[radial-gradient(circle,_rgba(113,235,68,0.04)_0%,_transparent_70%)] blur-[90px] animate-blob-1 dark:hidden pointer-events-none" />

      {/* Light Theme Technical Layout Vertical Guidelines */}
      <div className="hidden xl:block absolute left-4 top-0 bottom-0 w-px bg-slate-100 dark:hidden pointer-events-none" />
      <div className="hidden xl:block absolute right-4 top-0 bottom-0 w-px bg-slate-100 dark:hidden pointer-events-none" />

      {/* Hero Carousel Section - Styled as a dark slate island block in light mode, and blends in dark mode */}
      <section className="relative w-full bg-[#0f172a] dark:bg-transparent text-white rounded-[32px] border border-slate-900 dark:border-transparent p-8 sm:p-12 lg:p-16 shadow-2xl dark:shadow-none overflow-hidden min-h-[60vh] flex flex-col justify-between">
        {/* Centered Watermark Backdrop inside the Hero */}
        <div className="absolute inset-0 flex items-center justify-center -z-10 select-none pointer-events-none overflow-hidden">
          <span className="text-[12vw] font-black tracking-[0.25em] text-white/[0.025] dark:text-app-watermark leading-none uppercase font-sans">
            ZEPHYRA
          </span>
        </div>

        {/* Hero Dot Pattern */}
        <div className="absolute inset-0 -z-20 bg-dot-pattern opacity-15 pointer-events-none" />
        <div className="absolute top-[20%] left-[50%] -translate-x-1/2 -z-10 w-[50vw] h-[30vh] rounded-full bg-slate-800/10 dark:bg-primary-900/5 blur-[80px] pointer-events-none" />

        {/* Top Header of the Carousel */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800 dark:border-app-border font-mono text-[10px] text-slate-500 dark:text-app-text-secondary">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-slate-800 dark:border-app-border bg-slate-950/40 text-slate-300 dark:text-app-text-secondary">
            <span className="w-1.5 h-1.5 rounded-full bg-[#71eb44] animate-pulse" />
            <span>ZEPHYRA // CATALOG COLLECTION 2026</span>
          </div>
          <div className="px-3 py-1 rounded-full border border-slate-800 dark:border-app-border bg-slate-950/20">
            <span>
              SLIDE {slide.index} {'//'} 0{slides.length}
            </span>
          </div>
        </div>

        {/* Main Content Grid with Fade Transition */}
        <div
          className={`relative grid grid-cols-1 lg:grid-cols-12 gap-12 items-center py-8 transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}
        >
          {/* Left Column: Slide Product Details */}
          <div className="lg:col-span-7 space-y-8">
            <div className="inline-flex items-center gap-2 text-[10px] font-bold tracking-widest text-slate-400 dark:text-app-text-secondary font-mono uppercase">
              <span className="w-1 h-1 rounded-full bg-[#71eb44]" />
              <span>{slide.category}</span>
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[0.85] uppercase text-white dark:text-app-text-primary">
              {highlightLastWord(slide.name)}
            </h1>

            <p className="text-sm text-slate-300 dark:text-app-text-secondary max-w-xl leading-relaxed font-normal">
              {slide.description}
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link to="/products">
                <button className="bg-[#71eb44] hover:bg-[#71eb44]/90 text-black font-extrabold px-8 py-3.5 rounded-full flex items-center gap-2 transition-all duration-200 cursor-pointer shadow-lg shadow-[#71eb44]/20 text-xs tracking-wider uppercase font-mono">
                  Shop Instrument <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
            </div>

            {/* Custom Monospace Specs for the active slide */}
            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-slate-800 dark:border-app-border max-w-lg font-mono">
              {slide.specs.map((spec, i) => (
                <div key={i} className="space-y-1">
                  <span className="text-[9px] uppercase tracking-wider text-slate-500 dark:text-app-text-secondary font-semibold">
                    {'//'} {spec.label}
                  </span>
                  <div className="text-sm font-bold text-white dark:text-app-text-primary uppercase">
                    {spec.value}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Slide High-Fi Product Image */}
          <div className="lg:col-span-5 relative flex justify-center lg:justify-end animate-float">
            <div className="relative w-full max-w-[340px] bg-slate-900/60 backdrop-blur-md dark:bg-transparent border border-slate-850 dark:border-app-border rounded-3xl p-5 shadow-2xl dark:shadow-none">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 dark:border-app-border mb-4 font-mono text-[9px] text-slate-500 dark:text-app-text-secondary">
                <span>EST. UNIT VALUE</span>
                <span className="text-white dark:text-app-text-primary font-bold">
                  {slide.price}
                </span>
              </div>

              <div className="relative overflow-hidden rounded-2xl bg-zinc-950 dark:bg-transparent aspect-square flex items-center justify-center border border-slate-800 dark:border-app-border">
                <img src={slide.image} alt={slide.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/25 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Footer Controls of the Carousel */}
        <div className="flex items-center justify-between pt-6 border-t border-slate-800 dark:border-app-border">
          {/* Quick dots navigation */}
          <div className="flex items-center gap-3">
            {slides.map((s, index) => (
              <button
                key={s.id}
                onClick={() => {
                  if (isTransitioning) return;
                  setActiveSlide(index);
                }}
                className={`h-1.5 transition-all duration-300 rounded-full cursor-pointer
                  ${activeSlide === index ? 'w-8 bg-[#71eb44]' : 'w-2 bg-slate-700 dark:bg-zinc-800 hover:bg-slate-500 dark:hover:bg-zinc-700'}
                `}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>

          {/* Typographic Navigation Controls */}
          <div className="flex items-center gap-4 font-mono text-[9px] tracking-widest text-slate-400">
            <button
              onClick={handlePrev}
              className="hover:text-[#71eb44] transition-colors cursor-pointer"
              aria-label="Previous Slide"
            >
              [ PREV_UNIT ]
            </button>
            <span className="text-slate-800">/</span>
            <button
              onClick={handleNext}
              className="hover:text-[#71eb44] transition-colors cursor-pointer"
              aria-label="Next Slide"
            >
              [ NEXT_UNIT ]
            </button>
          </div>
        </div>
      </section>

      {/* Featured Collection Section */}
      <section className="space-y-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-app-border pb-6">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-app-border bg-app-bg-secondary text-xs font-bold text-app-text-secondary font-mono tracking-widest uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-[#71eb44] animate-ping" />
              {'// CATALOG SELECTIONS'}
            </span>
            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight text-app-text-primary leading-[0.85] pt-2">
              Featured <span className="text-[#71eb44]">Instruments</span>
            </h2>
          </div>

          {/* Light-theme specific GPS tracking widget */}
          <div className="hidden lg:flex flex-col text-right font-mono text-[8px] text-slate-400 tracking-wider dark:hidden">
            <span>SYS_COORD: 40.7128° N, 74.0060° W</span>
            <span>ALTITUDE: 12M // SECTOR: INS_SEC_01 // LOCK: OK</span>
          </div>

          <Link to="/products">
            <Button
              variant="outline"
              className="rounded-full px-6 font-mono text-xs font-bold group"
            >
              View Catalog{' '}
              <ArrowUpRight className="w-4 h-4 ml-1.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Button>
          </Link>
        </div>

        {/* 3 Grid items */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="group relative bg-white dark:bg-transparent border border-slate-200 dark:border-app-border rounded-2xl overflow-hidden transition-all duration-300 hover:border-[#71eb44] dark:hover:border-[#71eb44] hover:shadow-[0_12px_32px_rgba(113,235,68,0.08)] dark:hover:shadow-[0_0_20px_rgba(113,235,68,0.12)] hover:-translate-y-1 dark:hover:translate-y-0">
            <BlueprintMarkers />
            {/* Left-side sliding ribbon accent (Light theme only) */}
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#71eb44] scale-y-0 group-hover:scale-y-100 transition-transform origin-top duration-300 dark:hidden" />
            <div className="relative aspect-video overflow-hidden bg-slate-50 dark:bg-transparent border-b border-slate-200 dark:border-app-border">
              <img
                src="https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500&auto=format&fit=crop&q=80"
                alt="Mechanical Keyboard"
                className="w-full h-full object-cover grayscale-[35%] contrast-[105%] brightness-[98%] group-hover:grayscale-0 group-hover:contrast-100 group-hover:brightness-100 transition-all duration-700 group-hover:scale-105"
              />
              <CrosshairOverlay />
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between font-mono">
                <span className="inline-flex items-center gap-1.5 text-[10px] uppercase font-bold text-slate-500 dark:text-app-text-secondary tracking-widest">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#71eb44]" />[ KB-88 ]
                </span>
                <span className="text-xs font-extrabold text-zinc-950 bg-[#71eb44]/20 dark:text-[#71eb44] dark:bg-[#71eb44]/10 px-3 py-1 rounded-full">
                  $189.00
                </span>
              </div>
              <h3 className="text-lg font-bold text-app-text-primary">
                {highlightLastWord('Ergonomic Mechanical Keyboard')}
              </h3>
              <p className="text-[10px] font-mono text-app-text-secondary leading-relaxed uppercase tracking-wider">
                HOT-SWAPPABLE TACTILE SWITCHES. ACOUSTICALLY TUNED CHASSIS FOR DEEP FREQUENCY
                RESPONSE.
              </p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="group relative bg-white dark:bg-transparent border border-slate-200 dark:border-app-border rounded-2xl overflow-hidden transition-all duration-300 hover:border-[#71eb44] dark:hover:border-[#71eb44] hover:shadow-[0_12px_32px_rgba(113,235,68,0.08)] dark:hover:shadow-[0_0_20px_rgba(113,235,68,0.12)] hover:-translate-y-1 dark:hover:translate-y-0">
            <BlueprintMarkers />
            {/* Left-side sliding ribbon accent (Light theme only) */}
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#71eb44] scale-y-0 group-hover:scale-y-100 transition-transform origin-top duration-300 dark:hidden" />
            <div className="relative aspect-video overflow-hidden bg-slate-50 dark:bg-transparent border-b border-slate-200 dark:border-app-border">
              <img
                src="https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?w=500&auto=format&fit=crop&q=80"
                alt="Wooden Standing Desk"
                className="w-full h-full object-cover grayscale-[35%] contrast-[105%] brightness-[98%] group-hover:grayscale-0 group-hover:contrast-100 group-hover:brightness-100 transition-all duration-700 group-hover:scale-105"
              />
              <CrosshairOverlay />
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between font-mono">
                <span className="inline-flex items-center gap-1.5 text-[10px] uppercase font-bold text-slate-500 dark:text-app-text-secondary tracking-widest">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#71eb44]" />[ DS-02 ]
                </span>
                <span className="text-xs font-extrabold text-zinc-950 bg-[#71eb44]/20 dark:text-[#71eb44] dark:bg-[#71eb44]/10 px-3 py-1 rounded-full">
                  $499.00
                </span>
              </div>
              <h3 className="text-lg font-bold text-app-text-primary">
                {highlightLastWord('Wooden Standing Desk')}
              </h3>
              <p className="text-[10px] font-mono text-app-text-secondary leading-relaxed uppercase tracking-wider">
                SOLID OAK TIMBER TOP. QUIET DUAL-MOTOR ELEVATION STABILITY CONTROL SYSTEM.
              </p>
            </div>
          </div>

          {/* Card 3 */}
          <div className="group relative bg-white dark:bg-transparent border border-slate-200 dark:border-app-border rounded-2xl overflow-hidden transition-all duration-300 hover:border-[#71eb44] dark:hover:border-[#71eb44] hover:shadow-[0_12px_32px_rgba(113,235,68,0.08)] dark:hover:shadow-[0_0_20px_rgba(113,235,68,0.12)] hover:-translate-y-1 dark:hover:translate-y-0">
            <BlueprintMarkers />
            {/* Left-side sliding ribbon accent (Light theme only) */}
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#71eb44] scale-y-0 group-hover:scale-y-100 transition-transform origin-top duration-300 dark:hidden" />
            <div className="relative aspect-video overflow-hidden bg-slate-50 dark:bg-transparent border-b border-slate-200 dark:border-app-border">
              <img
                src="https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=500&auto=format&fit=crop&q=80"
                alt="Fitness Tracker"
                className="w-full h-full object-cover grayscale-[35%] contrast-[105%] brightness-[98%] group-hover:grayscale-0 group-hover:contrast-100 group-hover:brightness-100 transition-all duration-700 group-hover:scale-105"
              />
              <CrosshairOverlay />
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between font-mono">
                <span className="inline-flex items-center gap-1.5 text-[10px] uppercase font-bold text-slate-500 dark:text-app-text-secondary tracking-widest">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#71eb44]" />[ FT-105 ]
                </span>
                <span className="text-xs font-extrabold text-zinc-950 bg-[#71eb44]/20 dark:text-[#71eb44] dark:bg-[#71eb44]/10 px-3 py-1 rounded-full">
                  $149.00
                </span>
              </div>
              <h3 className="text-lg font-bold text-app-text-primary">
                {highlightLastWord('Smart Fitness Tracker')}
              </h3>
              <p className="text-[10px] font-mono text-app-text-secondary leading-relaxed uppercase tracking-wider">
                OPTICAL HEART-RATE AND BIOMETRIC SENSORS WITH PRECISE METRIC LOGGING.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Bento Layout */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Item 1 */}
        <div className="group relative overflow-hidden p-8 bg-white dark:bg-transparent border border-slate-200 dark:border-app-border rounded-3xl space-y-4 hover:border-[#71eb44] dark:hover:border-[#71eb44] hover:shadow-[0_12px_32px_rgba(113,235,68,0.08)] dark:hover:shadow-[0_0_20px_rgba(113,235,68,0.12)] hover:-translate-y-1 dark:hover:translate-y-0 transition-all duration-350">
          <BlueprintMarkers />
          {/* Left-side sliding ribbon accent (Light theme only) */}
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#71eb44] scale-y-0 group-hover:scale-y-100 transition-transform origin-top duration-300 dark:hidden" />

          <HardwareHeader address="HW_01" bus="SYS_PERIPH" />

          <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-transparent flex items-center justify-center text-[#71eb44] border border-slate-200 dark:border-app-border">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div className="space-y-3">
            <div className="inline-flex items-center gap-1.5 font-mono text-[10px] text-slate-500 dark:text-app-text-secondary font-bold uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-[#71eb44]" />
              <span>01 // BESPOKE HARDWARE</span>
            </div>
            <h3 className="text-lg font-bold text-app-text-primary uppercase tracking-tight">
              Workspace {highlightLastWord('Workspace Instruments')}
            </h3>
            <p className="text-[10px] font-mono text-app-text-secondary leading-relaxed uppercase tracking-wider">
              CURATED DEVELOPER INSTRUMENTS. DESELECTED FLUFF, ACCENTUATED TOUCH AND ACOUSTICS.
            </p>
          </div>
        </div>

        {/* Item 2 */}
        <div className="group relative overflow-hidden p-8 bg-white dark:bg-transparent border border-slate-200 dark:border-app-border rounded-3xl space-y-4 hover:border-[#71eb44] dark:hover:border-[#71eb44] hover:shadow-[0_12px_32px_rgba(113,235,68,0.08)] dark:hover:shadow-[0_0_20px_rgba(113,235,68,0.12)] hover:-translate-y-1 dark:hover:translate-y-0 transition-all duration-350">
          <BlueprintMarkers />
          {/* Left-side sliding ribbon accent (Light theme only) */}
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#71eb44] scale-y-0 group-hover:scale-y-100 transition-transform origin-top duration-300 dark:hidden" />

          <HardwareHeader address="SEC_02" bus="AUTH_NODE" />

          <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-transparent flex items-center justify-center text-[#71eb44] border border-slate-200 dark:border-app-border">
            <Lock className="w-5 h-5" />
          </div>
          <div className="space-y-3">
            <div className="inline-flex items-center gap-1.5 font-mono text-[10px] text-slate-500 dark:text-app-text-secondary font-bold uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-[#71eb44]" />
              <span>02 // VERIFIED CUSTOMERS</span>
            </div>
            <h3 className="text-lg font-bold text-app-text-primary uppercase tracking-tight">
              6-Digit {highlightLastWord('6-Digit Verification')}
            </h3>
            <p className="text-[10px] font-mono text-app-text-secondary leading-relaxed uppercase tracking-wider">
              SECURE IDENTITY SIGNATURES. 6-DIGIT SINGLE-USE PASSCODE AUTHENTICATION.
            </p>
          </div>
        </div>

        {/* Item 3 */}
        <div className="group relative overflow-hidden p-8 bg-white dark:bg-transparent border border-slate-200 dark:border-app-border rounded-3xl space-y-4 hover:border-[#71eb44] dark:hover:border-[#71eb44] hover:shadow-[0_12px_32px_rgba(113,235,68,0.08)] dark:hover:shadow-[0_0_20px_rgba(113,235,68,0.12)] hover:-translate-y-1 dark:hover:translate-y-0 transition-all duration-350">
          <BlueprintMarkers />
          {/* Left-side sliding ribbon accent (Light theme only) */}
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#71eb44] scale-y-0 group-hover:scale-y-100 transition-transform origin-top duration-300 dark:hidden" />

          <HardwareHeader address="GPS_03" bus="TELEMETRY" />

          <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-transparent flex items-center justify-center text-[#71eb44] border border-slate-200 dark:border-app-border">
            <Compass className="w-5 h-5" />
          </div>
          <div className="space-y-3">
            <div className="inline-flex items-center gap-1.5 font-mono text-[10px] text-slate-500 dark:text-app-text-secondary font-bold uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-[#71eb44]" />
              <span>03 // DYNAMIC COORDINATES</span>
            </div>
            <h3 className="text-lg font-bold text-app-text-primary uppercase tracking-tight">
              Active GPS {highlightLastWord('Active GPS Telemetry')}
            </h3>
            <p className="text-[10px] font-mono text-app-text-secondary leading-relaxed uppercase tracking-wider">
              REAL-TIME LOGISTICS BROADCASTS. MULTI-NODE SIGNAL PROPAGATION MAPS.
            </p>
          </div>
        </div>
      </section>

      {/* Advanced Telemetry Section */}
      <section className="group relative overflow-hidden bg-white dark:bg-transparent border border-slate-200 dark:border-app-border rounded-3xl p-8 lg:p-12 dark:shadow-none hover:border-[#71eb44] dark:hover:border-[#71eb44] hover:shadow-[0_12px_32px_rgba(113,235,68,0.08)] dark:hover:shadow-[0_0_20px_rgba(113,235,68,0.12)] hover:-translate-y-1 dark:hover:translate-y-0 transition-all duration-350">
        <BlueprintMarkers />
        {/* Left-side sliding ribbon accent (Light theme only) */}
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#71eb44] scale-y-0 group-hover:scale-y-100 transition-transform origin-top duration-300 dark:hidden" />
        <div className="absolute top-0 right-0 -z-10 bg-grid-pattern w-1/2 h-full opacity-35 pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5 space-y-6">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-slate-200 dark:border-app-border bg-slate-50 dark:bg-app-bg-secondary text-xs font-bold text-slate-500 dark:text-app-text-secondary tracking-widest font-mono uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-[#71eb44] animate-ping" />
              {'// DISPATCH TELEMETRY'}
            </span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-app-text-primary leading-[0.9] uppercase pt-2">
              Micro-second logistics <span className="text-[#71eb44]">tracking</span>.
            </h2>
            <p className="text-xs text-app-text-secondary leading-relaxed">
              Watch coordinate signals propagate across our active nodes. Our logistics engine
              couples order invoices directly to live delivery coordinates.
            </p>
            <div className="space-y-2.5 pt-2">
              <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-app-text-secondary font-mono">
                <CheckCircle2 className="w-4 h-4 text-[#71eb44]" />
                <span>Encrypted verification handshakes</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-app-text-secondary font-mono">
                <CheckCircle2 className="w-4 h-4 text-[#71eb44]" />
                <span>Websocket location stream broadcasts</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-app-text-secondary font-mono">
                <CheckCircle2 className="w-4 h-4 text-[#71eb44]" />
                <span>Asynchronous dispatch queues</span>
              </div>
            </div>
          </div>

          {/* Simulated dashboard box */}
          <div className="lg:col-span-7 bg-slate-50 dark:bg-transparent border border-slate-200 dark:border-app-border rounded-2xl p-6 font-mono text-xs shadow-sm dark:shadow-none space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-app-border pb-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#71eb44] animate-ping" />
                <span className="font-semibold text-app-text-primary">CORE_ROUTING_FEED</span>
              </div>
              <span className="text-[9px] text-slate-500 dark:text-app-text-secondary">
                SYSTEM: ACTIVE
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div className="p-3 bg-white dark:bg-transparent rounded-xl border border-slate-200 dark:border-app-border">
                <div className="text-[9px] text-slate-500 dark:text-app-text-secondary uppercase">
                  Couriers
                </div>
                <div className="text-base font-bold text-app-text-primary mt-1">14 / 16</div>
              </div>
              <div className="p-3 bg-white dark:bg-transparent rounded-xl border border-slate-200 dark:border-app-border">
                <div className="text-[9px] text-slate-500 dark:text-app-text-secondary uppercase">
                  Load Vol
                </div>
                <div className="text-base font-bold text-app-text-primary mt-1">1,248</div>
              </div>
              <div className="p-3 bg-white dark:bg-transparent rounded-xl border border-slate-200 dark:border-app-border">
                <div className="text-[9px] text-slate-500 dark:text-app-text-secondary uppercase">
                  Socket RTT
                </div>
                <div className="text-base font-bold text-[#71eb44] mt-1">2.4 ms</div>
              </div>
              <div className="p-3 bg-white dark:bg-transparent rounded-xl border border-slate-200 dark:border-app-border">
                <div className="text-[9px] text-slate-500 dark:text-app-text-secondary uppercase">
                  Efficiency
                </div>
                <div className="text-base font-bold text-app-text-primary mt-1">98.4%</div>
              </div>
            </div>

            {/* Live Terminal outputs - styled as a dark code island in light theme */}
            <div className="bg-[#0c0c0e] border border-slate-900 rounded-xl p-4 space-y-1.5 text-[9px] text-slate-400 overflow-x-auto max-h-[120px] scrollbar-thin font-mono shadow-inner">
              <div className="flex items-center justify-between text-[#71eb44]">
                <span>[12:35:10] SYS_CONNECTIVITY: WEBSOCKET ACTIVE</span>
                <span>STATE_OK</span>
              </div>
              <div className="flex items-center justify-between">
                <span>[12:35:14] GEO_MATCH: ORDER_4999 BIND AGENT_CRUISE_03</span>
                <span className="font-semibold text-white">DISPATCHED</span>
              </div>
              <div className="flex items-center justify-between">
                <span>[12:35:22] STREAM_UPDATE: GPS LAT_40.7128 LON_-74.0060</span>
                <span className="text-[#71eb44] font-semibold">COORD_LOCK</span>
              </div>
              <div className="flex items-center justify-between text-amber-400">
                <span>[12:35:36] ETA_UPDATE: 12 MINUTES UNTIL TARGET DESTINATION</span>
                <span>TRAFFIC_NORMAL</span>
              </div>
            </div>

            {/* Visual Vector Route */}
            <div className="relative w-full h-24 bg-white dark:bg-transparent rounded-xl border border-slate-200 dark:border-app-border overflow-hidden flex items-center justify-center shadow-sm">
              <div className="absolute inset-0 bg-dot-pattern opacity-40 pointer-events-none" />
              <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
                {/* Main routing coordinates lines */}
                <path
                  d="M-10,50 L200,50 L250,20 L400,20 L500,80 L800,80"
                  fill="none"
                  stroke="var(--border)"
                  strokeWidth="4"
                />
                <path
                  d="M100,-10 L100,120 M300,-10 L300,120 M600,-10 L600,120"
                  fill="none"
                  stroke="var(--border)"
                  strokeWidth="1.5"
                  strokeDasharray="3 3"
                />
                {/* Active packet flow stream */}
                <path
                  d="M-10,50 L200,50 L250,20 L400,20 L500,80 L800,80"
                  fill="none"
                  stroke="#71eb44"
                  strokeWidth="2.5"
                  className="animate-flow-dash opacity-90"
                />
              </svg>

              {/* Hub */}
              <div className="absolute left-[92px] top-[42px] flex flex-col items-center">
                <div className="w-4 h-4 bg-white dark:bg-app-bg-primary border-2 border-zinc-950 dark:border-app-text-primary rounded-full flex items-center justify-center shadow-sm">
                  <div className="w-1.5 h-1.5 bg-zinc-950 dark:bg-app-text-primary rounded-full" />
                </div>
                <span className="text-[7px] bg-white dark:bg-app-bg-secondary border border-slate-200 dark:border-app-border px-1 rounded mt-0.5 font-mono">
                  HUB_A
                </span>
              </div>

              {/* Courier */}
              <div className="absolute left-[292px] top-[12px] flex flex-col items-center">
                <div className="relative">
                  <span className="absolute inset-0 rounded-full bg-[#71eb44]/40 animate-ping" />
                  <Truck className="w-4 h-4 text-zinc-950 bg-[#71eb44] p-0.5 rounded-full border border-[#71eb44] relative z-10 shadow-sm" />
                </div>
                <span className="text-[7px] bg-[#71eb44] text-zinc-950 px-1.5 py-0.5 rounded mt-0.5 font-mono font-bold uppercase shadow-sm">
                  CRUISE_3
                </span>
              </div>

              {/* Customer */}
              <div className="absolute left-[592px] top-[72px] flex flex-col items-center">
                <div className="relative">
                  <span className="absolute inset-0 rounded-full bg-[#71eb44]/30 animate-ping" />
                  <MapPin className="w-4 h-4 text-zinc-950 bg-[#71eb44] p-0.5 rounded-full border border-[#71eb44] relative z-10 shadow-sm" />
                </div>
                <span className="text-[7px] bg-white dark:bg-app-bg-secondary border border-slate-200 dark:border-app-border px-1 rounded mt-0.5 font-mono font-semibold">
                  DEST_NODE
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
