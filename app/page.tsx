"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
} from "framer-motion";
import {
  Calendar,
  Clock,
  MapPin,
  Navigation,
  Volume2,
  VolumeX,
  Heart,
  CheckCircle,
  CalendarPlus,
  Send,
} from "lucide-react";

/* =========================================================================
   ✅ SIRF YAHAN SE SAB KUCH CHANGE KARO
   - Date ISO format mein: "YYYY-MM-DDTHH:mm:ss+05:00" (+05:00 = Pakistan time)
   - Mehman ka naam link se: /card?to=Ahmed
   ========================================================================= */
const CARD = {
  groomName: "Ali",
  groomParents: "Son of Mr. & Mrs. Ahmed",
  brideName: "Ayesha",
  brideParents: "Daughter of Mr. & Mrs. Hassan",

  eventTitle: "Walima",
  start: "2026-12-29T19:00:00+05:00",
  venue: "Royal Palm Golf & Country Club",
  address: "Bab-e-Azam Grand Marquee, Canal Bank Road, Lahore",
  mapsLink: "https://maps.google.com",

  whatsapp: "923001234567", // country code ke sath, + ke baghair
  musicSrc: "/sajna.mp3",

  // 💌 Pyare pyare paighamat (apni marzi se badal sakte ho)
  message: [
    "Jaise ek chhota sa ghar eint eint jod kar banta hai, waise hi hamari kahani bhi pyaare lamhon se banti gayi. Aaj hum us ghar ki pehli roshni jalane ja rahe hain, aur chahte hain ke us roshni mein aap sab ki muskurahat bhi shamil ho.",
    "Aap ke qadam hamari khushi mein chaar chaand laga denge, aur aap ki dua hamari nayi zindagi ki sab se mazboot buniyaad banegi. Aaiye, mil kar ek haseen shaam sajate hain.",
  ],

  program: [
    { time: "06:30 PM", label: "Mehmanon ka istiqbal", icon: "🌸" },
    { time: "07:00 PM", label: "Dulha dulhan ki aamad", icon: "💍" },
    { time: "07:30 PM", label: "Dua aur dawat", icon: "🤲" },
    { time: "09:30 PM", label: "Rukhsati", icon: "🏡" },
  ],

  // Libaas ke rang (mehman in rangon mein aayein to bohat pyara lagega)
  colors: [
    { name: "Blush Pink", hex: "#F6B6C4" },
    { name: "Mint", hex: "#7FD1BE" },
    { name: "Lavender", hex: "#B9A6E8" },
    { name: "Peach", hex: "#FFC9A8" },
  ],
};

/* ============================ HELPERS ============================ */
const PK = "Asia/Karachi";
const fmtDate = (iso: string) =>
  new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: PK,
  }).format(new Date(iso));
const fmtTime = (iso: string) =>
  new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: PK,
  }).format(new Date(iso));
const dateParts = (iso: string) => {
  const f = new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: PK,
  }).formatToParts(new Date(iso));
  const g = (t: string) => f.find((p) => p.type === t)?.value ?? "";
  return {
    weekday: g("weekday"),
    day: g("day"),
    month: g("month"),
    year: g("year"),
  };
};

const gcalLink = () => {
  const s = new Date(CARD.start);
  const e = new Date(s.getTime() + 4 * 3600 * 1000);
  const f = (d: Date) => d.toISOString().replace(/[-:]|\.\d{3}/g, "");
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
    `${CARD.eventTitle} - ${CARD.groomName} & ${CARD.brideName}`,
  )}&dates=${f(s)}/${f(e)}&location=${encodeURIComponent(`${CARD.venue}, ${CARD.address}`)}`;
};

const rnd = (i: number, k: number) => {
  const x = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453;
  return x - Math.floor(x);
};

function strandPoints(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  sag: number,
  n: number,
): [number, number][] {
  const cx = (x1 + x2) / 2;
  const cy = (y1 + y2) / 2 + sag * 2;
  const pts: [number, number][] = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    pts.push([
      (1 - t) * (1 - t) * x1 + 2 * (1 - t) * t * cx + t * t * x2,
      (1 - t) * (1 - t) * y1 + 2 * (1 - t) * t * cy + t * t * y2,
    ]);
  }
  return pts;
}

const FLAGS = ["#F0647A", "#FFD27A", "#7FD1BE", "#B9A6E8", "#F6B6C4"];
const ARCH = "M168 300 V238 A32 32 0 0 1 232 238 V300 Z";

/* ============================ HAVELI (SVG) ============================ */
function Haveli({ open, ping }: { open: boolean; ping?: boolean }) {
  const garland = strandPoints(148, 214, 252, 214, 12, 11);
  const flagsA = strandPoints(0, 22, 400, 22, 16, 20);
  const flagsB = strandPoints(0, 60, 400, 60, 22, 18);

  const win = (x: number, y: number, d: number, w = 12, h = 22) => (
    <g key={`${x}-${y}`}>
      <path
        d={`M${x} ${y + h} v-${h - w / 2} a${w / 2} ${w / 2} 0 0 1 ${w} 0 v${h - w / 2} z`}
        fill="#8B4A62"
        opacity=".25"
      />
      <path
        className="win"
        style={{ animationDelay: `${d}s` }}
        d={`M${x + 1.5} ${y + h} v-${h - w / 2 - 1} a${w / 2 - 1.5} ${w / 2 - 1.5} 0 0 1 ${w - 3} 0 v${h - w / 2 - 1} z`}
        fill="#FFD27A"
      />
    </g>
  );

  return (
    <svg
      viewBox="0 0 400 330"
      className={"hall" + (open ? " open" : "")}
      role="img"
      aria-label="Haveli"
    >
      <defs>
        <linearGradient id="wallA" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFE3D3" />
          <stop offset="1" stopColor="#F8B8C4" />
        </linearGradient>
        <linearGradient id="wallB" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFF3E4" />
          <stop offset="1" stopColor="#FFD3C2" />
        </linearGradient>
        <linearGradient id="domeM" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#A8EBD9" />
          <stop offset="1" stopColor="#4FB8A3" />
        </linearGradient>
        <linearGradient id="domeL" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#D6C9F7" />
          <stop offset="1" stopColor="#9C86DC" />
        </linearGradient>
        <radialGradient id="warm2" cx="50%" cy="75%" r="70%">
          <stop offset="0" stopColor="#FFF6D8" />
          <stop offset="1" stopColor="#FFB86B" />
        </radialGradient>
        <clipPath id="archClip2">
          <path d={ARCH} />
        </clipPath>
      </defs>

      {/* Suraj */}
      <g className="sun">
        <g className="rays">
          {Array.from({ length: 12 }).map((_, i) => (
            <rect
              key={i}
              x="54"
              y="14"
              width="4"
              height="12"
              rx="2"
              fill="#FFD27A"
              transform={`rotate(${i * 30} 56 58)`}
            />
          ))}
        </g>
        <circle cx="56" cy="58" r="17" fill="#FFE08A" />
      </g>

      {/* Mazaarein / towers */}
      {[118, 260].map((x) => (
        <g key={x}>
          <rect x={x} y="112" width="22" height="190" fill="url(#wallA)" />
          <rect x={x - 3} y="150" width="28" height="5" fill="#E8B04A" />
          <rect x={x - 3} y="236" width="28" height="5" fill="#E8B04A" />
          <path
            d={`M${x - 4} 112 Q${x + 11} 76 ${x + 26} 112Z`}
            fill="url(#domeL)"
          />
          <line
            x1={x + 11}
            y1="84"
            x2={x + 11}
            y2="72"
            stroke="#E8B04A"
            strokeWidth="2"
          />
          <circle cx={x + 11} cy="70" r="3" fill="#E8B04A" />
          {win(x + 5, 166, x * 0.01, 12, 24)}
          {win(x + 5, 202, x * 0.013 + 0.5, 12, 24)}
        </g>
      ))}

      {/* Wings */}
      <rect x="30" y="214" width="88" height="88" fill="url(#wallB)" />
      <rect x="282" y="214" width="88" height="88" fill="url(#wallB)" />
      {[0, 1, 2, 3].map((i) => (
        <React.Fragment key={i}>
          <path
            d={`M${32 + i * 21} 214 a10 10 0 0 1 20 0Z`}
            fill="url(#domeM)"
          />
          <path
            d={`M${284 + i * 21} 214 a10 10 0 0 1 20 0Z`}
            fill="url(#domeM)"
          />
        </React.Fragment>
      ))}
      {win(46, 244, 0.2)}
      {win(70, 244, 0.9)}
      {win(94, 244, 1.5)}
      {win(294, 244, 0.5)}
      {win(318, 244, 1.2)}
      {win(342, 244, 1.8)}

      {/* Beech ki imarat */}
      <rect x="140" y="150" width="120" height="152" fill="url(#wallB)" />
      <rect x="136" y="146" width="128" height="7" fill="#E8B04A" rx="2" />
      <path d="M146 146 Q200 36 254 146Z" fill="url(#domeM)" />
      <path
        d="M170 140 Q200 82 230 140"
        fill="none"
        stroke="#fff"
        strokeWidth="2"
        opacity=".35"
      />
      <line
        x1="200"
        y1="62"
        x2="200"
        y2="44"
        stroke="#E8B04A"
        strokeWidth="2.5"
      />
      <circle cx="200" cy="42" r="4" fill="#E8B04A" />
      {win(150, 164, 0.1)}
      {win(238, 164, 0.7)}

      {/* Jharoka (balcony) */}
      <path
        d="M186 196 v-20 a14 14 0 0 1 28 0 v20z"
        fill="#8B4A62"
        opacity=".25"
      />
      <path
        className="win"
        d="M188 196 v-20 a12 12 0 0 1 24 0 v20z"
        fill="#FFD27A"
      />
      <rect x="178" y="196" width="44" height="6" rx="2" fill="#E8B04A" />
      {[182, 190, 198, 206, 214].map((x) => (
        <rect key={x} x={x} y="202" width="2" height="8" fill="#E8B04A" />
      ))}

      {/* Darwaza */}
      <path d={ARCH} fill="#9B4F62" />
      <g clipPath="url(#archClip2)">
        <rect
          x="168"
          y="206"
          width="64"
          height="94"
          fill="url(#warm2)"
          className="doorglow"
        />
        <rect
          x="168"
          y="206"
          width="32"
          height="94"
          fill="#C25A72"
          stroke="#E8B04A"
          strokeWidth="1.5"
          className="dl"
        />
        <rect
          x="200"
          y="206"
          width="32"
          height="94"
          fill="#C25A72"
          stroke="#E8B04A"
          strokeWidth="1.5"
          className="dr"
        />
      </g>
      <path d={ARCH} fill="none" stroke="#E8B04A" strokeWidth="3.5" />

      {/* Ribbon */}
      <g className="rb-l">
        <rect x="160" y="262" width="40" height="10" fill="#F0647A" />
        <path d="M160 262 l-8 5 l8 5z" fill="#F0647A" />
      </g>
      <g className="rb-r">
        <rect x="200" y="262" width="40" height="10" fill="#F0647A" />
        <path d="M240 262 l8 5 l-8 5z" fill="#F0647A" />
      </g>
      <g className="bow">
        <ellipse cx="190" cy="267" rx="10" ry="6" fill="#D94862" />
        <ellipse cx="210" cy="267" rx="10" ry="6" fill="#D94862" />
        <path d="M200 270 l-7 20 l7 -5 l7 5z" fill="#C93A55" />
        <circle cx="200" cy="267" r="5" fill="#F0647A" />
      </g>

      {/* Seedhiyan */}
      <rect x="156" y="300" width="88" height="7" fill="#F2C8B8" />
      <rect x="146" y="307" width="108" height="7" fill="#E9B4A3" />

      {/* Zameen */}
      <rect x="0" y="302" width="400" height="28" fill="#CDEBC8" />
      <path d="M0 312 Q100 300 200 314 T400 308 V330 H0Z" fill="#B9E0B2" />
      {[18, 60, 96, 300, 340, 384].map((x, i) => (
        <g key={x}>
          <circle
            cx={x}
            cy={318 + (i % 2) * 5}
            r="3"
            fill={FLAGS[i % FLAGS.length]}
          />
          <circle cx={x} cy={318 + (i % 2) * 5} r="1.2" fill="#FFF3E4" />
        </g>
      ))}

      {/* Jhaadiyan */}
      {[14, 386].map((x, i) => (
        <g key={x} className="sway" style={{ animationDelay: `${i * 0.8}s` }}>
          <rect x={x - 2} y="276" width="4" height="30" fill="#8B5E3C" />
          <circle cx={x} cy="266" r="20" fill="#7CC98B" />
          <circle cx={x - 10} cy="276" r="13" fill="#68BA7C" />
          <circle cx={x + 10} cy="276" r="13" fill="#68BA7C" />
          <circle cx={x - 6} cy="262" r="3" fill="#F6B6C4" />
          <circle cx={x + 8} cy="270" r="3" fill="#FFD27A" />
        </g>
      ))}

      {/* Genda (marigold) garland */}
      <path
        d="M148 214 Q200 238 252 214"
        fill="none"
        stroke="#7CC98B"
        strokeWidth="1.2"
      />
      {garland.map(([x, y], i) => (
        <circle
          key={i}
          className="gend"
          style={{ animationDelay: `${i * 0.12}s` }}
          cx={x}
          cy={y + 1}
          r="4.5"
          fill={i % 2 ? "#FFB547" : "#FF8A3D"}
        />
      ))}

      {/* Jhandiyan (bunting) */}
      {[flagsA, flagsB].map((pts, s) => (
        <g key={s}>
          <path
            d={`M0 ${s ? 60 : 22} Q200 ${(s ? 60 : 22) + (s ? 44 : 32)} 400 ${s ? 60 : 22}`}
            fill="none"
            stroke="#C98EA0"
            strokeWidth=".9"
          />
          {pts.map(([x, y], i) => (
            <path
              key={i}
              className="flag"
              style={{
                animationDelay: `${(i * 0.13 + s * 0.4) % 2}s`,
                transformOrigin: `${x}px ${y}px`,
              }}
              d={`M${x - 6} ${y} L${x + 6} ${y} L${x} ${y + 13}Z`}
              fill={FLAGS[(i + s) % FLAGS.length]}
            />
          ))}
        </g>
      ))}

      {ping && !open && (
        <circle
          cx="200"
          cy="267"
          r="18"
          fill="none"
          stroke="#F0647A"
          strokeWidth="2.5"
          className="ping"
        />
      )}
    </svg>
  );
}

/* ============================ CONFETTI ============================ */
type Piece = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  vr: number;
  s: number;
  c: string;
  heart: boolean;
};

function Confetti({ trigger }: { trigger: number }) {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const pieces = useRef<Piece[]>([]);

  const pop = useCallback(() => {
    const cv = ref.current;
    if (!cv) return;
    const colors = [
      "#F0647A",
      "#FFD27A",
      "#7FD1BE",
      "#B9A6E8",
      "#F6B6C4",
      "#FFB547",
    ];
    for (let i = 0; i < 110; i++) {
      const a = -Math.PI / 2 + (Math.random() - 0.5) * 1.5;
      const sp = 7 + Math.random() * 9;
      pieces.current.push({
        x: cv.width / 2 + (Math.random() - 0.5) * 120,
        y: cv.height * 0.8,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp,
        r: Math.random() * 6,
        vr: (Math.random() - 0.5) * 0.4,
        s: 6 + Math.random() * 8,
        c: colors[Math.floor(Math.random() * colors.length)],
        heart: Math.random() < 0.25,
      });
    }
  }, []);

  useEffect(() => {
    const cv = ref.current;
    const ctx = cv?.getContext("2d");
    if (!cv || !ctx) return;
    const resize = () => {
      cv.width = window.innerWidth;
      cv.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);
    let raf = 0;
    const loop = () => {
      ctx.clearRect(0, 0, cv.width, cv.height);
      pieces.current = pieces.current.filter((p) => p.y < cv.height + 30);
      for (const p of pieces.current) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.28;
        p.vx *= 0.985;
        p.r += p.vr;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.r);
        ctx.fillStyle = p.c;
        if (p.heart) {
          ctx.font = `${p.s * 2}px serif`;
          ctx.textAlign = "center";
          ctx.fillText("♥", 0, 0);
        } else {
          ctx.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2);
        }
        ctx.restore();
      }
      raf = requestAnimationFrame(loop);
    };
    loop();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  useEffect(() => {
    if (trigger > 0) {
      pop();
      setTimeout(pop, 280);
    }
  }, [trigger, pop]);

  return <canvas ref={ref} className="confetti" />;
}

/* ============================ SMALL PIECES ============================ */
function Reveal({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.div
      className="rv"
      initial={{ opacity: 0, y: 46, scale: 0.96 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

function Digit({ v }: { v: string }) {
  return (
    <span className="dg">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={v}
          initial={{ y: -16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 16, opacity: 0 }}
          transition={{ duration: 0.25 }}
          style={{ display: "inline-block" }}
        >
          {v}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

const NOTE_COLORS = ["#FFE3EA", "#E3F5EE", "#EDE7FF", "#FFF0CC"];

/* ============================ MAIN ============================ */
export default function HaveliCard() {
  const [stage, setStage] = useState<"intro" | "opening" | "content">("intro");
  const [mounted, setMounted] = useState(false);
  const [now, setNow] = useState<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const [guest, setGuest] = useState("");
  const [popKey, setPopKey] = useState(0);
  const [ameen, setAmeen] = useState(0);
  const [flip, setFlip] = useState(false);

  // RSVP
  const [name, setName] = useState("");
  const [count, setCount] = useState("1");
  const [attending, setAttending] = useState<"yes" | "no">("yes");
  const [note, setNote] = useState("");
  const [sent, setSent] = useState(false);

  // Wishes wall
  const [wishes, setWishes] = useState<{ n: string; t: string }[]>([]);
  const [wName, setWName] = useState("");
  const [wText, setWText] = useState("");

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { scrollYProgress, scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 600], [0, -50]);

  useEffect(() => {
    setMounted(true);
    const to = new URLSearchParams(window.location.search).get("to");
    if (to) {
      setGuest(to);
      setName(to);
      setWName(to);
    }
    try {
      const saved = localStorage.getItem("wishes_v1");
      if (saved) setWishes(JSON.parse(saved));
    } catch {}
  }, []);

  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const target = Date.parse(CARD.start);
  const done = now !== null && now >= target;
  const diff = now === null ? 0 : Math.max(0, target - now);
  const units: [string, number][] = [
    ["Din", Math.floor(diff / 86400000)],
    ["Ghante", Math.floor(diff / 3600000) % 24],
    ["Minute", Math.floor(diff / 60000) % 60],
    ["Second", Math.floor(diff / 1000) % 60],
  ];
  const dp = dateParts(CARD.start);

  const enter = () => {
    if (stage !== "intro") return;
    setStage("opening");
    setTimeout(() => setPopKey((k) => k + 1), 600);
    audioRef.current
      ?.play()
      .then(() => setPlaying(true))
      .catch(() => {});
    setTimeout(() => {
      setStage("content");
      setPopKey((k) => k + 1);
    }, 2600);
  };

  const toggleMusic = () => {
    const a = audioRef.current;
    if (!a) return;
    if (playing) {
      a.pause();
      setPlaying(false);
    } else {
      a.play()
        .then(() => setPlaying(true))
        .catch(() => {});
    }
  };

  const addWish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!wText.trim()) return;
    const next = [
      { n: wName.trim() || "Mehman", t: wText.trim() },
      ...wishes,
    ].slice(0, 30);
    setWishes(next);
    setWText("");
    setPopKey((k) => k + 1);
    try {
      localStorage.setItem("wishes_v1", JSON.stringify(next));
    } catch {}
  };

  const submitRSVP = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const msg =
      `Assalam o Alaikum! ${name.trim()} ` +
      (attending === "yes"
        ? `inshaAllah ${CARD.eventTitle} mein shamil hoon ga/gi (${count} mehman).`
        : "afsos, shamil nahi ho sakoon ga/gi.") +
      (note.trim() ? ` ${note.trim()}` : "");
    setSent(true);
    setPopKey((k) => k + 1);
    window.open(
      `https://wa.me/${CARD.whatsapp}?text=${encodeURIComponent(msg)}`,
      "_blank",
    );
  };

  return (
    <div className="root">
      <audio ref={audioRef} src={CARD.musicSrc} loop preload="auto" />
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Dancing+Script:wght@600;700&family=Nunito:wght@400;600;700;800&family=Amiri:wght@700&display=swap"
      />
      <style>{CSS}</style>

      <div className="sky" />

      {mounted && (
        <>
          {/* Badal */}
          <div className="layer">
            {[0, 1, 2, 3].map((i) => (
              <span
                key={i}
                className="cloud"
                style={{
                  top: `${6 + i * 15}%`,
                  animationDuration: `${60 + i * 22}s`,
                  animationDelay: `${-i * 18}s`,
                  transform: `scale(${0.7 + i * 0.25})`,
                }}
              />
            ))}
          </div>

          {/* Parindey */}
          <div className="layer">
            {[0, 1, 2].map((i) => (
              <svg
                key={i}
                className="bird"
                viewBox="0 0 30 14"
                width={26 + i * 6}
                style={{
                  top: `${12 + i * 11}%`,
                  animationDuration: `${24 + i * 7}s`,
                  animationDelay: `${-i * 9}s`,
                }}
              >
                <path
                  className="wing"
                  style={{ animationDelay: `${i * 0.2}s` }}
                  d="M2 8 Q8 0 15 8 Q22 0 28 8"
                  fill="none"
                  stroke="#7B5A8A"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            ))}
          </div>

          {/* Ghubare (balloons) */}
          <div className="layer">
            {Array.from({ length: 10 }).map((_, i) => {
              const c = FLAGS[i % FLAGS.length];
              return (
                <span
                  key={i}
                  className="balloon"
                  style={{
                    left: `${4 + rnd(i, 3) * 90}%`,
                    background: c,
                    animationDuration: `${18 + rnd(i, 4) * 14}s`,
                    animationDelay: `${-rnd(i, 5) * 28}s`,
                  }}
                />
              );
            })}
          </div>

          {/* Phool ki pattiyan */}
          <div className="layer">
            {Array.from({ length: 16 }).map((_, i) => (
              <i
                key={i}
                className="petal"
                style={{
                  left: `${rnd(i, 6) * 100}%`,
                  animationDuration: `${9 + rnd(i, 7) * 9}s`,
                  animationDelay: `${-rnd(i, 8) * 14}s`,
                }}
              />
            ))}
          </div>
        </>
      )}

      <Confetti trigger={popKey} />
      {stage === "content" && (
        <motion.div className="bar" style={{ scaleX: scrollYProgress }} />
      )}
      {stage === "content" && (
        <button className="music" onClick={toggleMusic} aria-label="Music">
          {playing ? <Volume2 size={18} /> : <VolumeX size={18} />}
        </button>
      )}

      {/* ================= INTRO ================= */}
      <AnimatePresence>
        {stage !== "content" && (
          <motion.div
            className="intro"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9 }}
            onClick={enter}
            role="button"
            aria-label="Ribbon kaatein"
          >
            <motion.div
              className="intro-top"
              animate={
                stage === "opening"
                  ? { opacity: 0, y: -30 }
                  : { opacity: 1, y: 0 }
              }
              transition={{ duration: 0.7 }}
            >
              <span className="mini">Walima ka dawat naama</span>
              <span className="script names">
                {CARD.groomName} & {CARD.brideName}
              </span>
            </motion.div>

            <motion.div
              className="scene"
              animate={stage === "opening" ? { scale: 3.4 } : { scale: 1 }}
              style={{ transformOrigin: "50% 80%" }}
              transition={{
                duration: 2.1,
                ease: [0.65, 0, 0.35, 1],
                delay: stage === "opening" ? 0.6 : 0,
              }}
            >
              <Haveli open={stage === "opening"} ping />
            </motion.div>

            <motion.p
              className="hint"
              animate={
                stage === "opening"
                  ? { opacity: 0 }
                  : { opacity: [0.55, 1, 0.55], y: [0, -4, 0] }
              }
              transition={
                stage === "opening"
                  ? { duration: 0.3 }
                  : { duration: 2.2, repeat: Infinity }
              }
            >
              ✂️ Ribbon kaatne ke liye tap karein
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ================= CONTENT ================= */}
      {stage === "content" && (
        <main className="page">
          <motion.div
            style={{ y: heroY }}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.3, ease: [0.16, 1, 0.3, 1] }}
            className="hero-scene"
          >
            <Haveli open />
          </motion.div>

          <motion.div
            className="bismillah"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.9 }}
          >
            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
          </motion.div>

          {guest && (
            <motion.p
              className="dear"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
            >
              Pyare {guest} ✨
            </motion.p>
          )}

          <motion.h1
            className="script names big"
            initial={{ opacity: 0, y: 30, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ delay: 0.8, duration: 1.3, ease: [0.16, 1, 0.3, 1] }}
          >
            {CARD.groomName}
          </motion.h1>
          <motion.p
            className="par"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4 }}
          >
            {CARD.groomParents}
          </motion.p>

          <motion.div
            className="amp"
            initial={{ scale: 0, rotate: -40 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 1.5, type: "spring", stiffness: 160 }}
          >
            <Heart size={26} fill="#F0647A" stroke="none" className="beat" />
          </motion.div>

          <motion.h1
            className="script names big"
            initial={{ opacity: 0, y: 30, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ delay: 1.7, duration: 1.3, ease: [0.16, 1, 0.3, 1] }}
          >
            {CARD.brideName}
          </motion.h1>
          <motion.p
            className="par"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.3 }}
          >
            {CARD.brideParents}
          </motion.p>

          {/* DIL KI BAAT */}
          <Reveal>
            <section className="card msg">
              <h2 className="title script">Dil ki baat 💌</h2>
              {CARD.message.map((m, i) => (
                <p key={i}>{m}</p>
              ))}
            </section>
          </Reveal>

          {/* SAVE THE DATE */}
          <Reveal>
            <section className="sec">
              <h2 className="title script">Save the Date</h2>
              <div
                className="flip"
                onClick={() => setFlip((f) => !f)}
                role="button"
                aria-label="Card palatein"
              >
                <div className={"flip-in" + (flip ? " on" : "")}>
                  <div className="face front">
                    <span className="mini">{dp.month}</span>
                    <strong>{dp.day}</strong>
                    <span className="mini">{dp.year}</span>
                    <small>Palatne ke liye tap karein</small>
                  </div>
                  <div className="face back">
                    <span className="script">{dp.weekday}</span>
                    <b>{fmtTime(CARD.start)}</b>
                    <small>{CARD.eventTitle} ki shaam</small>
                  </div>
                </div>
              </div>
            </section>
          </Reveal>

          {/* COUNTDOWN */}
          <Reveal>
            <section className="sec">
              <h2 className="title script">
                {done
                  ? "Jashan shuru ho chuka 🎉"
                  : `${CARD.eventTitle} mein baqi`}
              </h2>
              {!done && (
                <div className="count">
                  {units.map(([l, v]) => (
                    <div key={l} className="cbox">
                      <strong>
                        {now === null
                          ? "--"
                          : String(v)
                              .padStart(2, "0")
                              .split("")
                              .map((ch, i) => <Digit key={i} v={ch} />)}
                      </strong>
                      <span>{l}</span>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </Reveal>

          {/* VENUE */}
          <Reveal>
            <section className="sec">
              <h2 className="title script">Hamari Haveli</h2>
              <div className="card venue">
                <div className="row">
                  <Calendar size={19} /> <span>{fmtDate(CARD.start)}</span>
                </div>
                <div className="row">
                  <Clock size={19} /> <span>{fmtTime(CARD.start)}</span>
                </div>
                <div className="dash" />
                <div className="row top">
                  <MapPin size={19} />
                  <span>
                    <b>{CARD.venue}</b>
                    <br />
                    <small>{CARD.address}</small>
                  </span>
                </div>
                <div className="btns">
                  <a
                    className="btn"
                    href={CARD.mapsLink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Navigation size={15} /> Raasta dekhein
                  </a>
                  <a
                    className="btn ghost"
                    href={gcalLink()}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <CalendarPlus size={15} /> Calendar mein add
                  </a>
                </div>
              </div>
            </section>
          </Reveal>

          {/* MANZILEIN (PROGRAM) */}
          <Reveal>
            <section className="sec">
              <h2 className="title script">Shaam ki Manzilein</h2>
              <div className="tower">
                <motion.div
                  className="roof"
                  initial={{ y: -60, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ type: "spring", stiffness: 120, damping: 12 }}
                >
                  <svg viewBox="0 0 120 60" width="120">
                    <path d="M10 56 Q60 -18 110 56Z" fill="#7FD1BE" />
                    <line
                      x1="60"
                      y1="8"
                      x2="60"
                      y2="0"
                      stroke="#E8B04A"
                      strokeWidth="2"
                    />
                    <circle cx="60" cy="0" r="3" fill="#E8B04A" />
                    <rect
                      x="4"
                      y="54"
                      width="112"
                      height="6"
                      rx="3"
                      fill="#E8B04A"
                    />
                  </svg>
                </motion.div>
                {CARD.program.map((p, i) => (
                  <motion.div
                    key={p.time}
                    className="floor"
                    initial={{ opacity: 0, y: -26 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-30px" }}
                    transition={{ duration: 0.6, delay: i * 0.15 }}
                  >
                    <span className="fw-l">
                      <i style={{ animationDelay: `${i * 0.3}s` }} />
                      <i style={{ animationDelay: `${i * 0.3 + 0.5}s` }} />
                    </span>
                    <div className="fl-mid">
                      <span className="fl-ic">{p.icon}</span>
                      <b>{p.time}</b>
                      <span>{p.label}</span>
                    </div>
                    <span className="fw-l">
                      <i style={{ animationDelay: `${i * 0.3 + 0.25}s` }} />
                      <i style={{ animationDelay: `${i * 0.3 + 0.75}s` }} />
                    </span>
                  </motion.div>
                ))}
              </div>
            </section>
          </Reveal>

          {/* RANG */}
          <Reveal>
            <section className="sec">
              <h2 className="title script">Aaj ke Rang 🎨</h2>
              <p className="par">
                Aap ka libaas in rangon mein ho to mehfil aur bhi khubsurat
                lagegi.
              </p>
              <div className="colors">
                {CARD.colors.map((c) => (
                  <div
                    key={c.name}
                    className="c-item"
                    style={{ background: c.hex }}
                  >
                    <span>{c.name}</span>
                  </div>
                ))}
              </div>
            </section>
          </Reveal>

          {/* DUA WALL / WISHES */}
          <Reveal>
            <section className="card wishes">
              <h2 className="title script">Duaon ki Deewar 🤲</h2>
              <form onSubmit={addWish} className="form">
                <input
                  type="text"
                  placeholder="Aap ka naam"
                  value={wName}
                  onChange={(e) => setWName(e.target.value)}
                  className="input"
                />
                <textarea
                  placeholder="Dulha dulhan ke liye pyara sa paigham..."
                  value={wText}
                  onChange={(e) => setWText(e.target.value)}
                  className="input textarea"
                  rows={3}
                />
                <button type="submit" className="btn primary">
                  Paigham bhejein <Send size={15} />
                </button>
              </form>

              <div className="notes">
                {wishes.map((w, idx) => (
                  <motion.div
                    key={idx}
                    className="note"
                    style={{
                      background: NOTE_COLORS[idx % NOTE_COLORS.length],
                    }}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4 }}
                  >
                    <p>{w.t}</p>
                    <small>— {w.n}</small>
                  </motion.div>
                ))}
              </div>
            </section>
          </Reveal>

          {/* RSVP */}
          <Reveal>
            <section className="card rsvp">
              <h2 className="title script">Aamad ki Ittela (RSVP) 📝</h2>
              {sent ? (
                <div className="sent-box">
                  <CheckCircle size={40} color="#7FD1BE" />
                  <p>
                    Shukriya! Aap ka paigham WhatsApp par bhej diya gaya hai.
                  </p>
                </div>
              ) : (
                <form onSubmit={submitRSVP} className="form">
                  <input
                    type="text"
                    placeholder="Aap ka naam"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="input"
                  />
                  <div className="radio-group">
                    <label>
                      <input
                        type="radio"
                        name="attending"
                        checked={attending === "yes"}
                        onChange={() => setAttending("yes")}
                      />{" "}
                      Zaroor aaunga/aaungi
                    </label>
                    <label>
                      <input
                        type="radio"
                        name="attending"
                        checked={attending === "no"}
                        onChange={() => setAttending("no")}
                      />{" "}
                      Mazrat khwah hoon
                    </label>
                  </div>
                  {attending === "yes" && (
                    <select
                      value={count}
                      onChange={(e) => setCount(e.target.value)}
                      className="input"
                    >
                      <option value="1">1 Mehman</option>
                      <option value="2">2 Mehman</option>
                      <option value="3">3 Mehman</option>
                      <option value="4">4 Mehman</option>
                    </select>
                  )}
                  <input
                    type="text"
                    placeholder="Koi khaas baat ya dua (optional)"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="input"
                  />
                  <button type="submit" className="btn primary">
                    WhatsApp par RSVP bhejein <Send size={15} />
                  </button>
                </form>
              )}
            </section>
          </Reveal>

          {/* AMIN / BLESSING BUTTON */}
          <Reveal>
            <section className="sec center">
              <h2 className="title script">Bismillah aur Dua 🤲</h2>
              <button
                className="btn amin-btn"
                onClick={() => {
                  setAmeen((a) => a + 1);
                  setPopKey((k) => k + 1);
                }}
              >
                <Heart size={18} fill="#F0647A" stroke="none" /> Ameen kahein (
                {ameen})
              </button>
            </section>
          </Reveal>

          <footer className="footer">
            <p className="script">
              {CARD.groomName} & {CARD.brideName} ki taraf se intezaar rahega ✨
            </p>
          </footer>
        </main>
      )}
    </div>
  );
}

/* ============================ STYLES ============================ */
const CSS = `
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
body { background: #FFF4F0; color: #4A3B44; font-family: 'Nunito', sans-serif; overflow-x: hidden; }
.root { min-height: 100vh; position: relative; display: flex; flex-direction: column; align-items: center; }

/* Sky & layers */
.sky { position: fixed; inset: 0; background: linear-gradient(180deg, #FFE5DC 0%, #FFF3EE 40%, #FFF8F4 100%); z-index: -2; }
.layer { position: fixed; inset: 0; pointer-events: none; z-index: -1; overflow: hidden; }

/* Cloud animation */
.cloud { position: absolute; width: 120px; height: 40px; background: rgba(255,255,255,0.7); border-radius: 50px; filter: blur(2px); animation: floatCloud linear infinite; }
.cloud::before { content: ''; position: absolute; top: -18px; left: 20px; width: 50px; height: 50px; background: rgba(255,255,255,0.7); border-radius: 50%; }
.cloud::after { content: ''; position: absolute; top: -10px; right: 20px; width: 40px; height: 40px; background: rgba(255,255,255,0.7); border-radius: 50%; }
@keyframes floatCloud { from { transform: translateX(-150px) scale(var(--s, 1)); } to { transform: translateX(calc(100vw + 150px)) scale(var(--s, 1)); } }

/* Bird animation */
.bird { position: absolute; animation: flyBird linear infinite; opacity: 0.7; }
.wing { transform-origin: 15px 8px; animation: flapWing 0.6s ease-in-out infinite alternate; }
@keyframes flapWing { from { transform: rotate(-25deg); } to { transform: rotate(25deg); } }
@keyframes flyBird { from { transform: translateX(-50px) translateY(20px); } to { transform: translateX(calc(100vw + 50px)) translateY(-30px); } }

/* Balloons */
.balloon { position: absolute; width: 22px; height: 28px; border-radius: 50% 50% 50% 50% / 40% 40% 60% 60%; animation: floatBalloon linear infinite; }
.balloon::after { content: ''; position: absolute; bottom: -8px; left: 9px; width: 4px; height: 8px; background: inherit; clip-path: polygon(50% 0%, 0% 100%, 100% 100%); }
@keyframes floatBalloon { from { transform: translateY(105vh) rotate(0deg); } to { transform: translateY(-10vh) rotate(15deg); } }

/* Petals */
.petal { position: absolute; width: 10px; height: 14px; background: #F6B6C4; border-radius: 50% 0 50% 50%; animation: fallPetal linear infinite; opacity: 0.8; }
@keyframes fallPetal { from { transform: translateY(-20vh) rotate(0deg) translateX(0); } to { transform: translateY(105vh) rotate(360deg) translateX(50px); } }

/* Confetti */
.confetti { position: fixed; inset: 0; pointer-events: none; z-index: 999; }

/* Scroll bar & music button */
.bar { position: fixed; top: 0; left: 0; right: 0; height: 4px; background: #F0647A; transform-origin: 0%; z-index: 100; }
.music { position: fixed; top: 16px; right: 16px; width: 40px; height: 40px; border-radius: 50%; background: #FFF; border: 1px solid #F0647A; color: #F0647A; display: flex; align-items: center; justify-content: center; cursor: pointer; z-index: 90; box-shadow: 0 4px 12px rgba(0,0,0,0.08); transition: transform 0.2s; }
.music:hover { transform: scale(1.08); }

/* Intro */
.intro { position: fixed; inset: 0; background: linear-gradient(135deg, #FFF4F0 0%, #FFE5DC 100%); display: flex; flex-direction: column; align-items: center; justify-content: center; z-index: 200; cursor: pointer; padding: 20px; text-align: center; }
.intro-top { margin-bottom: 20px; }
.mini { font-size: 0.9rem; text-transform: uppercase; letter-spacing: 2px; color: #8A6B7A; display: block; margin-bottom: 6px; }
.script { font-family: 'Dancing Script', cursive; font-weight: 700; }
.names { font-size: 3rem; color: #C93A55; line-height: 1.1; }
.scene { width: 100%; max-width: 400px; }
.hint { margin-top: 24px; font-size: 1rem; color: #8A6B7A; background: rgba(255,255,255,0.8); padding: 8px 20px; border-radius: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }

/* Haveli SVG animations */
.sun .rays { animation: spin 20s linear infinite; transform-origin: 56px 58px; }
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
.win { animation: glowWin 2s ease-in-out infinite alternate; }
@keyframes glowWin { from { opacity: 0.6; } to { opacity: 1; } }
.sway { transform-origin: bottom center; animation: swayTree 3s ease-in-out infinite alternate; }
@keyframes swayTree { from { transform: rotate(-2deg); } to { transform: rotate(2deg); } }
.gend { animation: bounceGend 1.5s ease-in-out infinite alternate; }
@keyframes bounceGend { from { transform: translateY(0); } to { transform: translateY(-2px); } }
.flag { animation: waveFlag 1s ease-in-out infinite alternate; }
@keyframes waveFlag { from { transform: skewX(-5deg); } to { transform: skewX(5deg); } }
.hall.open .dl { transform: translateX(-24px); transition: transform 1.2s cubic-bezier(0.16,1,0.3,1); }
.hall.open .dr { transform: translateX(24px); transition: transform 1.2s cubic-bezier(0.16,1,0.3,1); }
.hall.open .rb-l { transform: translateX(-40px) rotate(-15deg); opacity: 0; transition: all 0.8s; }
.hall.open .rb-r { transform: translateX(40px) rotate(15deg); opacity: 0; transition: all 0.8s; }
.hall.open .bow { transform: scale(1.5); opacity: 0; transition: all 0.6s; }
.hall.open .doorglow { opacity: 1; transition: opacity 0.5s 0.4s; }
.ping { animation: pingRing 1.5s cubic-bezier(0,0,0.2,1) infinite; }
@keyframes pingRing { 75%, 100% { transform: scale(1.6); opacity: 0; } }

/* Main Page */
.page { width: 100%; max-width: 600px; padding: 40px 20px 80px; display: flex; flex-direction: column; align-items: center; text-align: center; }
.hero-scene { width: 100%; max-width: 340px; margin-bottom: 20px; }
.bismillah { font-family: 'Amiri', serif; font-size: 1.8rem; color: #C93A55; margin-bottom: 12px; }
.dear { font-size: 1.2rem; color: #8A6B7A; margin-bottom: 16px; font-weight: 600; }
.big { font-size: 3.5rem; color: #C93A55; margin: 4px 0; }
.par { font-size: 0.95rem; color: #7A6B74; margin-bottom: 8px; }
.amp { margin: 16px 0; display: inline-flex; padding: 12px; background: #FFE5DC; border-radius: 50%; box-shadow: 0 4px 12px rgba(240,100,122,0.15); }
.beat { animation: beatHeart 1.2s ease-in-out infinite; }
@keyframes beatHeart { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.15); } }

/* Sections & Cards */
.sec { width: 100%; margin: 30px 0; }
.card { width: 100%; background: #FFF; border-radius: 24px; padding: 28px 24px; box-shadow: 0 8px 30px rgba(0,0,0,0.04); margin: 20px 0; border: 1px solid rgba(240,100,122,0.1); }
.title { font-size: 2.2rem; color: #C93A55; margin-bottom: 16px; }
.msg p { font-size: 1.05rem; line-height: 1.7; color: #5A4B54; margin-bottom: 14px; }
.msg p:last-child { margin-bottom: 0; }

/* Flip card */
.flip { width: 100%; height: 160px; perspective: 1000px; cursor: pointer; }
.flip-in { width: 100%; height: 100%; position: relative; transform-style: preserve-3d; transition: transform 0.6s; }
.flip-in.on { transform: rotateY(180deg); }
.face { position: absolute; inset: 0; backface-visibility: hidden; background: #FFF; border-radius: 20px; border: 1px solid rgba(240,100,122,0.15); display: flex; flex-direction: column; align-items: center; justify-content: center; box-shadow: 0 6px 20px rgba(0,0,0,0.03); padding: 16px; }
.face.back { transform: rotateY(180deg); background: #FFF8F6; }
.face strong { font-size: 2.2rem; color: #C93A55; line-height: 1; margin: 4px 0; }
.face small { font-size: 0.8rem; color: #8A6B7A; margin-top: 6px; }

/* Countdown */
.count { display: flex; gap: 12px; justify-content: center; }
.cbox { background: #FFF; padding: 14px 18px; border-radius: 16px; border: 1px solid rgba(240,100,122,0.15); min-width: 70px; box-shadow: 0 4px 15px rgba(0,0,0,0.03); }
.cbox strong { display: block; font-size: 1.8rem; color: #C93A55; }
.cbox span { font-size: 0.75rem; color: #8A6B7A; text-transform: uppercase; letter-spacing: 1px; }
.dg { display: inline-block; overflow: hidden; height: 1.2em; vertical-align: bottom; }

/* Venue */
.venue .row { display: flex; align-items: center; gap: 12px; margin: 12px 0; color: #5A4B54; text-align: left; font-size: 1rem; }
.venue .row.top { align-items: flex-start; }
.venue .dash { height: 1px; background: #F6B6C4; margin: 16px 0; opacity: 0.4; }
.btns { display: flex; gap: 12px; margin-top: 20px; }
.btn { flex: 1; padding: 12px 16px; background: #F0647A; color: #FFF; border-radius: 12px; text-decoration: none; font-weight: 700; font-size: 0.95rem; display: flex; align-items: center; justify-content: center; gap: 8px; box-shadow: 0 4px 15px rgba(240,100,122,0.3); transition: transform 0.2s, background 0.2s; border: none; cursor: pointer; }
.btn:hover { transform: translateY(-2px); background: #D94862; }
.btn.ghost { background: #FFF; color: #F0647A; border: 1px solid #F0647A; box-shadow: none; }
.btn.ghost:hover { background: #FFF5F7; }

/* Program Tower */
.tower { width: 100%; max-width: 380px; margin: 0 auto; display: flex; flex-direction: column; align-items: center; }
.roof { margin-bottom: -2px; }
.floor { width: 100%; background: #FFF; border: 1.5px solid #E8B04A; border-top: none; padding: 14px 20px; display: flex; align-items: center; justify-content: space-between; box-shadow: 0 4px 15px rgba(0,0,0,0.02); margin-bottom: 2px; border-radius: 0 0 8px 8px; }
.fl-mid { display: flex; flex-direction: column; align-items: center; gap: 2px; }
.fl-ic { font-size: 1.3rem; }
.floor b { font-size: 1rem; color: #C93A55; }
.floor span { font-size: 0.85rem; color: #7A6B74; }
.fw-l { display: flex; flex-direction: column; gap: 4px; }
.fw-l i { width: 6px; height: 6px; background: #E8B04A; border-radius: 50%; display: block; animation: glowWin 1s infinite alternate; }

/* Colors */
.colors { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; margin-top: 16px; }
.c-item { width: 70px; height: 70px; border-radius: 50%; display: flex; align-items: center; justify-content: center; text-align: center; padding: 4px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); border: 2px solid #FFF; }
.c-item span { font-size: 0.65rem; font-weight: 700; color: #4A3B44; background: rgba(255,255,255,0.85); padding: 2px 4px; border-radius: 6px; }

/* Wishes & RSVP Form */
.form { display: flex; flex-direction: column; gap: 14px; margin-top: 16px; }
.input { width: 100%; padding: 12px 16px; border-radius: 12px; border: 1px solid #E8D5D8; background: #FFFBFB; font-family: 'Nunito', sans-serif; font-size: 0.95rem; color: #4A3B44; outline: none; transition: border-color 0.2s; }
.input:focus { border-color: #F0647A; }
.textarea { resize: vertical; }
.radio-group { display: flex; gap: 20px; justify-content: center; font-size: 0.95rem; color: #5A4B54; font-weight: 600; margin: 4px 0; }
.radio-group label { display: flex; align-items: center; gap: 6px; cursor: pointer; }
.sent-box { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 20px; color: #5A4B54; font-weight: 600; }

.notes { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 14px; margin-top: 20px; text-align: left; }
.note { padding: 16px; border-radius: 16px; box-shadow: 0 4px 15px rgba(0,0,0,0.03); display: flex; flex-direction: column; justify-content: space-between; gap: 10px; border: 1px solid rgba(0,0,0,0.04); }
.note p { font-size: 0.9rem; color: #4A3B44; line-height: 1.5; }
.note small { font-size: 0.75rem; color: #7A6B74; font-weight: 700; text-align: right; }

.center { display: flex; flex-direction: column; align-items: center; }
.amin-btn { max-width: 220px; margin: 0 auto; }

.footer { margin-top: 40px; padding: 20px; color: #8A6B7A; font-size: 1.2rem; }
`;
