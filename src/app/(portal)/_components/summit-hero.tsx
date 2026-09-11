"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Volume2,
  VolumeX,
  Play,
  X,
  ArrowDown,
  ArrowUpRight,
  Globe,
  Instagram,
  Facebook,
  Youtube,
} from "lucide-react";
import { useLocale } from "@/shared/lib/i18n/client";
import { cn } from "@/shared/lib/utils";

interface SummitHeroProps {
  programsCount?: number;
}

export function SummitHero({ programsCount = 12 }: SummitHeroProps) {
  const locale = useLocale();
  const isEn = locale === "en";

  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);

  // Toggle ambient video audio
  const toggleMute = () => {
    if (videoRef.current) {
      const nextMuted = !videoRef.current.muted;
      videoRef.current.muted = nextMuted;
      setIsMuted(nextMuted);
    }
  };

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setVideoModalOpen(false);
      }
    };
    if (videoModalOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [videoModalOpen]);

  return (
    <>
      <section
        role="region"
        aria-label={isEn ? "Summit Hero Showcase" : "ภาพรวมสถาบันสไตล์ Summit"}
        className="relative w-full min-h-[calc(100vh-4rem)] lg:min-h-[calc(100vh-4rem)] flex flex-col justify-between overflow-hidden text-white bg-slate-950 select-none"
      >
        {/* 1. Ambient Background Video with Poster Fallback */}
        <video
          ref={videoRef}
          autoPlay
          loop
          muted={isMuted}
          playsInline
          onLoadedData={() => setVideoLoaded(true)}
          poster="/videos/hero-poster.webp"
          className={cn(
            "absolute inset-0 w-full h-full object-cover object-center scale-105 transition-all duration-1000",
            videoLoaded ? "opacity-100" : "opacity-90"
          )}
        >
          <source
            src="/videos/hero-drone-10s.mp4"
            type="video/mp4"
          />
        </video>

        {/* 2. Deep Atmospheric Contrast Gradients (Slate & Indigo) */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-slate-950/30 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/50 to-transparent pointer-events-none" />

        {/* Subtle Indigo & Amber ambient radial flares */}
        <div className="absolute -left-20 top-1/4 w-[550px] h-[550px] bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-0 bottom-1/4 w-[450px] h-[450px] bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Smooth Bottom Fade into Page Background */}
        <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-slate-50/90 dark:from-slate-950 to-transparent pointer-events-none z-1" />

        {/* 3. Centered Content Container aligned with site 7xl grid */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex-1 flex flex-col justify-between py-8 sm:py-10 lg:py-12">
          {/* Top Floating Status & Sound Toggle Row */}
          <div className="flex items-center justify-between gap-4 w-full">
            {/* Tag Pill */}
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/20 shadow-xs transition-all">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-[10px] sm:text-xs font-semibold tracking-[0.2em] uppercase text-white/95">
                {isEn ? "Sanctuary of Learning • Elevate FMS" : "สถาปัตยกรรมแห่งปัญญา • ELEVATE FMS"}
              </span>
            </div>

            {/* Sound Control Toggle */}
            <button
              type="button"
              onClick={toggleMute}
              aria-label={isMuted ? (isEn ? "Unmute background audio" : "เปิดเสียงพื้นหลัง") : (isEn ? "Mute background audio" : "ปิดเสียงพื้นหลัง")}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-950/60 hover:bg-slate-950/80 backdrop-blur-md border border-white/20 text-white transition-all hover:scale-105 active:scale-95 text-xs font-medium cursor-pointer"
            >
              {isMuted ? (
                <>
                  <VolumeX className="size-3.5 text-white/70" />
                  <span className="text-[11px] font-semibold tracking-wider uppercase text-white/80 hidden sm:inline">
                    {isEn ? "Sound Off" : "ปิดเสียง"}
                  </span>
                </>
              ) : (
                <>
                  <Volume2 className="size-3.5 text-amber-400 animate-pulse" />
                  <span className="text-[11px] font-bold tracking-wider uppercase text-amber-400 hidden sm:inline">
                    {isEn ? "Sound On" : "เปิดเสียง"}
                  </span>
                </>
              )}
            </button>
          </div>

          {/* Center-Left Dramatic Headline & CTA Content */}
          <div className="max-w-3xl space-y-6 sm:space-y-8 my-auto py-8 sm:py-12">
            {/* Main Huge Display Title */}
            <h1 className="font-sans font-extrabold text-5xl sm:text-7xl md:text-[5.5rem] lg:text-[6.5rem] xl:text-[7.5rem] tracking-tight text-white leading-[0.96]">
              {isEn ? (
                <>
                  Explore.
                  <br />
                  Dream.
                  <br />
                  <span className="bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 bg-clip-text text-transparent drop-shadow-[0_0_40px_rgba(245,158,11,0.45)]">
                    Discover.
                  </span>
                </>
              ) : (
                <>
                  เรียนรู้.
                  <br />
                  มุ่งมั่น.
                  <br />
                  <span className="bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 bg-clip-text text-transparent drop-shadow-[0_0_40px_rgba(245,158,11,0.45)]">
                    สร้างสรรค์.
                  </span>
                </>
              )}
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-base md:text-lg text-slate-200/90 max-w-xl font-light leading-relaxed">
              {isEn
                ? "We inspire journeys that awaken curiosity, cultivate leadership, and create unforgettable educational experiences."
                : "จุดประกายการเรียนรู้ ปลุกพลังแห่งการค้นพบ และสร้างสรรค์ประสบการณ์การศึกษาสู่มาตรฐานสากล"}
            </p>

            {/* Action Row - Lingua Bridge Indigo & Amber Style */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              {/* Primary CTA - Vibrant Indigo */}
              <Link
                href="/admissions"
                className="inline-flex items-center gap-2.5 px-8 py-4 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm tracking-wide uppercase shadow-xl shadow-indigo-600/30 hover:shadow-indigo-600/50 hover:-translate-y-0.5 active:scale-95 transition-all group"
              >
                <span>{isEn ? "Start Your Journey" : "เริ่มต้นการเดินทางสู่อนาคต (TCAS)"}</span>
                <ArrowUpRight className="size-4 text-amber-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Link>

              {/* Secondary CTA — Watch Video Modal Trigger */}
              <button
                type="button"
                onClick={() => setVideoModalOpen(true)}
                className="inline-flex items-center gap-3 px-6 py-4 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/25 text-white font-medium text-xs sm:text-sm transition-all hover:-translate-y-0.5 active:scale-95 group cursor-pointer"
              >
                <span className="w-6 h-6 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center transition-transform group-hover:scale-110">
                  <Play className="size-3 fill-current ml-0.5" />
                </span>
                <span>{isEn ? "Watch Video" : "ชมวิดีโอแนะนำ"}</span>
              </button>
            </div>
          </div>

          {/* Bottom Navigation & Metrics Bar */}
          <div className="pt-8 border-t border-white/15 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            {/* Scroll Down Action */}
            <a
              href="#portal-services"
              className="group inline-flex items-center gap-3 text-white/80 hover:text-white transition-colors cursor-pointer"
              aria-label={isEn ? "Scroll down to digital services" : "เลื่อนลงไปยังส่วนบริการดิจิทัล"}
            >
              <span className="text-[10px] sm:text-[11px] font-bold tracking-[0.25em] uppercase">
                SCROLL DOWN
              </span>
              <span className="w-7 h-7 rounded-full bg-white/10 group-hover:bg-indigo-600 border border-white/20 flex items-center justify-center transition-all animate-bounce">
                <ArrowDown className="size-3.5 text-amber-400 group-hover:text-white" />
              </span>
            </a>

            {/* Right Highlights & Social Media Row */}
            <div className="flex flex-wrap items-center gap-4 sm:gap-6">
              {/* Quick Metrics Badges in Lingua Bridge Theme */}
              <div className="hidden lg:flex items-center gap-2.5 text-xs font-medium">
                <span className="px-4 py-1.5 rounded-full bg-slate-950/60 backdrop-blur-md border border-white/15 text-white/90 shadow-xs">
                  <strong className="text-amber-400 font-bold mr-1">45,000 m²</strong> Campus
                </span>
                <span className="px-4 py-1.5 rounded-full bg-slate-950/60 backdrop-blur-md border border-white/15 text-white/90 shadow-xs">
                  <strong className="text-emerald-400 font-bold mr-1">98.5%</strong> Employment
                </span>
                <span className="px-4 py-1.5 rounded-full bg-slate-950/60 backdrop-blur-md border border-white/15 text-white/90 shadow-xs">
                  <strong className="text-indigo-400 font-bold mr-1">{programsCount}+</strong> Programs
                </span>
              </div>

              {/* Social Icons */}
              <div className="flex items-center gap-2">
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Facebook"
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-indigo-600 border border-white/15 flex items-center justify-center text-white/80 hover:text-white transition-all hover:scale-110"
                >
                  <Facebook className="size-3.5" />
                </a>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Instagram"
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-indigo-600 border border-white/15 flex items-center justify-center text-white/80 hover:text-white transition-all hover:scale-110"
                >
                  <Instagram className="size-3.5" />
                </a>
                <a
                  href="https://youtube.com"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="YouTube"
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-indigo-600 border border-white/15 flex items-center justify-center text-white/80 hover:text-white transition-all hover:scale-110"
                >
                  <Youtube className="size-3.5" />
                </a>
                <a
                  href="https://www.google.com"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Website"
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-indigo-600 border border-white/15 flex items-center justify-center text-white/80 hover:text-white transition-all hover:scale-110"
                >
                  <Globe className="size-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Interactive Video Showreel Modal */}
      {videoModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={isEn ? "Summit Video Showreel Player" : "เครื่องเล่นวิดีโอแนะนำสถาบัน"}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-black/90 backdrop-blur-xl animate-in fade-in duration-200"
          onClick={() => setVideoModalOpen(false)}
        >
          <div
            className="relative w-full max-w-5xl aspect-video rounded-2xl overflow-hidden border border-white/20 shadow-2xl bg-black"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setVideoModalOpen(false)}
              aria-label={isEn ? "Close video player" : "ปิดเครื่องเล่นวิดีโอ"}
              className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/70 hover:bg-black/90 text-white border border-white/20 transition-all hover:scale-110 cursor-pointer"
            >
              <X className="size-5" />
            </button>

            {/* Video Player */}
            <video
              autoPlay
              controls
              playsInline
              poster="/videos/hero-poster.webp"
              className="w-full h-full object-cover"
              src="/videos/hero-drone-10s.mp4"
            />
          </div>
        </div>
      )}
    </>
  );
}
