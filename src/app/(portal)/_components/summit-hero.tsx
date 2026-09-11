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
        className="relative w-full min-h-[82vh] sm:min-h-[88vh] lg:min-h-[92vh] rounded-3xl sm:rounded-[2.5rem] overflow-hidden flex flex-col justify-between p-6 sm:p-10 lg:p-14 text-white shadow-2xl bg-black border border-white/10 select-none"
      >
        {/* 1. Ambient Background Video with Poster Fallback */}
        <video
          ref={videoRef}
          autoPlay
          loop
          muted={isMuted}
          playsInline
          onLoadedData={() => setVideoLoaded(true)}
          poster="https://strvid.nyc3.cdn.digitaloceanspaces.com/motionitems/1784999647383-summit-hero.webp"
          className={cn(
            "absolute inset-0 w-full h-full object-cover object-center scale-105 transition-all duration-1000",
            videoLoaded ? "opacity-100" : "opacity-90"
          )}
        >
          <source
            src="https://strvid.nyc3.cdn.digitaloceanspaces.com/motionsite/summit-hero-1.mp4"
            type="video/mp4"
          />
        </video>

        {/* 2. Deep Atmospheric Contrast Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/45 to-black/30 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/50 to-transparent pointer-events-none" />

        {/* 3. Top Floating Status & Sound Toggle Row */}
        <div className="relative z-10 flex items-center justify-between gap-4 w-full">
          {/* Tag Pill */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/20 shadow-xs transition-all">
            <span className="w-2 h-2 rounded-full bg-[#F4BA3B] animate-pulse" />
            <span className="text-[10px] sm:text-xs font-semibold tracking-[0.2em] uppercase text-white/95">
              {isEn ? "Sanctuary of Learning • Elevate FMS" : "สถาปัตยกรรมแห่งปัญญา • ELEVATE FMS"}
            </span>
          </div>

          {/* Sound Control Toggle */}
          <button
            type="button"
            onClick={toggleMute}
            aria-label={isMuted ? (isEn ? "Unmute background audio" : "เปิดเสียงพื้นหลัง") : (isEn ? "Mute background audio" : "ปิดเสียงพื้นหลัง")}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/20 text-white transition-all hover:scale-105 active:scale-95 text-xs font-medium cursor-pointer"
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
                <Volume2 className="size-3.5 text-[#F4BA3B] animate-pulse" />
                <span className="text-[11px] font-bold tracking-wider uppercase text-[#F4BA3B] hidden sm:inline">
                  {isEn ? "Sound On" : "เปิดเสียง"}
                </span>
              </>
            )}
          </button>
        </div>

        {/* 4. Center-Left Dramatic Headline & CTA Content */}
        <div className="relative z-10 max-w-3xl space-y-6 sm:space-y-8 my-auto py-8">
          {/* Main Huge Display Title */}
          <h1 className="font-sans font-extrabold text-5xl sm:text-7xl md:text-[5.25rem] lg:text-[6.25rem] xl:text-[7rem] tracking-tight text-white leading-[0.98]">
            {isEn ? (
              <>
                Explore.
                <br />
                Dream.
                <br />
                <span className="text-[#F4BA3B] drop-shadow-[0_0_35px_rgba(244,186,59,0.45)]">
                  Discover.
                </span>
              </>
            ) : (
              <>
                เรียนรู้.
                <br />
                มุ่งมั่น.
                <br />
                <span className="text-[#F4BA3B] drop-shadow-[0_0_35px_rgba(244,186,59,0.45)]">
                  สร้างสรรค์.
                </span>
              </>
            )}
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base md:text-lg text-white/85 max-w-xl font-light leading-relaxed">
            {isEn
              ? "We inspire journeys that awaken curiosity, cultivate leadership, and create unforgettable educational experiences."
              : "จุดประกายการเรียนรู้ ปลุกพลังแห่งการค้นพบ และสร้างสรรค์ประสบการณ์การศึกษาสู่มาตรฐานสากล"}
          </p>

          {/* Action Row */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            {/* Primary CTA */}
            <Link
              href="/admissions"
              className="inline-flex items-center gap-2.5 px-8 py-4 rounded-full bg-[#F4BA3B] hover:bg-[#e5ac30] text-slate-950 font-bold text-xs sm:text-sm tracking-wide uppercase shadow-lg shadow-[#F4BA3B]/25 hover:shadow-[#F4BA3B]/40 hover:-translate-y-0.5 active:scale-95 transition-all"
            >
              <span>{isEn ? "Start Your Journey" : "เริ่มต้นการเดินทางสู่อนาคต (TCAS)"}</span>
              <ArrowUpRight className="size-4" />
            </Link>

            {/* Secondary CTA — Watch Video Modal Trigger */}
            <button
              type="button"
              onClick={() => setVideoModalOpen(true)}
              className="inline-flex items-center gap-3 px-6 py-4 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/25 text-white font-medium text-xs sm:text-sm transition-all hover:-translate-y-0.5 active:scale-95 group cursor-pointer"
            >
              <span className="w-6 h-6 rounded-full bg-white/20 group-hover:bg-[#F4BA3B] group-hover:text-slate-950 flex items-center justify-center transition-colors">
                <Play className="size-3 fill-current ml-0.5" />
              </span>
              <span>{isEn ? "Watch Video" : "ชมวิดีโอแนะนำ"}</span>
            </button>
          </div>
        </div>

        {/* 5. Bottom Navigation Bar */}
        <div className="relative z-10 pt-8 border-t border-white/15 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          {/* Scroll Down Action */}
          <a
            href="#portal-services"
            className="group inline-flex items-center gap-3 text-white/70 hover:text-white transition-colors cursor-pointer"
            aria-label={isEn ? "Scroll down to digital services" : "เลื่อนลงไปยังส่วนบริการดิจิทัล"}
          >
            <span className="text-[10px] sm:text-[11px] font-bold tracking-[0.25em] uppercase">
              SCROLL DOWN
            </span>
            <span className="w-7 h-7 rounded-full bg-white/10 group-hover:bg-white/20 border border-white/20 flex items-center justify-center transition-all animate-bounce">
              <ArrowDown className="size-3.5 text-[#F4BA3B]" />
            </span>
          </a>

          {/* Right Highlights & Social Media Row */}
          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            {/* Quick Metrics Badges */}
            <div className="hidden lg:flex items-center gap-2 text-xs font-medium">
              <span className="px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/15 text-white/90">
                45,000 m² Campus
              </span>
              <span className="px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/15 text-white/90">
                98.5% Employment
              </span>
              <span className="px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/15 text-white/90">
                {programsCount}+ Programs
              </span>
            </div>

            {/* Social Icons */}
            <div className="flex items-center gap-2">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-center text-white/80 hover:text-[#F4BA3B] transition-all hover:scale-110"
              >
                <Facebook className="size-3.5" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-center text-white/80 hover:text-[#F4BA3B] transition-all hover:scale-110"
              >
                <Instagram className="size-3.5" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                aria-label="YouTube"
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-center text-white/80 hover:text-[#F4BA3B] transition-all hover:scale-110"
              >
                <Youtube className="size-3.5" />
              </a>
              <a
                href="https://www.google.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Website"
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-center text-white/80 hover:text-[#F4BA3B] transition-all hover:scale-110"
              >
                <Globe className="size-3.5" />
              </a>
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
              className="w-full h-full object-cover"
              src="https://strvid.nyc3.cdn.digitaloceanspaces.com/motionsite/summit-hero-1.mp4"
            />
          </div>
        </div>
      )}
    </>
  );
}
