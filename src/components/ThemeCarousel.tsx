import * as React from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function ThemesCarousel({ themes }: { themes: { title: string; summary: string }[]}) {
const [current, setCurrent] = React.useState(0);
const total = themes.length;
const prevIndex = (current - 1 + total) % total;
const nextIndex = (current + 1) % total;
const stageRef = React.useRef<HTMLDivElement | null>(null);
const [stageWidth, setStageWidth] = React.useState(0);

const touchStartX = React.useRef<number | null>(null);
const touchEndX = React.useRef<number | null>(null);
const wheelLockRef = React.useRef(0);

const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
};
const onTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
};
const onTouchEnd = () => {
    if (touchStartX.current == null || touchEndX.current == null) return;
    const dx = touchStartX.current - touchEndX.current;
    const threshold = 40;
    if (dx > threshold) {
    setCurrent((c) => (c + 1) % total);
    } else if (dx < -threshold) {
    setCurrent((c) => (c - 1 + total) % total);
    }
    touchStartX.current = null;
    touchEndX.current = null;
};

const onWheel = (e: React.WheelEvent) => {
    if (total <= 1) return;
    const now = Date.now();
    if (now - wheelLockRef.current < 300) return;
    const dominant = Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
    if (Math.abs(dominant) < 8) return;
    e.preventDefault();
    wheelLockRef.current = now;
    if (dominant > 0) {
    setCurrent((c) => (c + 1) % total);
    } else {
    setCurrent((c) => (c - 1 + total) % total);
    }
};

React.useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
    const rect = entries[0]?.contentRect;
    if (rect) setStageWidth(rect.width);
    });
    ro.observe(el);
    setStageWidth(el.clientWidth);
    return () => ro.disconnect();
}, []);

// Keyboard nav when focused
const containerRef = React.useRef<HTMLDivElement | null>(null);
React.useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handler = (e: KeyboardEvent) => {
    if (e.key === "ArrowLeft") setCurrent((c) => (c - 1 + total) % total);
    if (e.key === "ArrowRight") setCurrent((c) => (c + 1) % total);
    };
    el.addEventListener("keydown", handler);
    return () => el.removeEventListener("keydown", handler);
}, [total]);

return (
    <div
    ref={containerRef}
    tabIndex={0}
    onTouchStart={onTouchStart}
    onTouchMove={onTouchMove}
    onTouchEnd={onTouchEnd}
    onWheel={onWheel}
    className="relative max-w-5xl md:max-w-6xl mx-auto flex items-center justify-center py-16 md:py-24 min-h-[260px] md:min-h-[320px]"
    style={{ perspective: 1000 }}
    aria-roledescription="carousel"
    aria-label="Theme carousel"
    >
    {/* <button
        aria-label="Previous theme"
        onClick={() => setCurrent((c) => (c - 1 + total) % total)}
        className="z-20 p-2 rounded-md hover:bg-background/60 focus:outline-none focus:ring"
    >
        <ArrowLeft className="h-5 w-5" />
    </button> */}

    <div ref={stageRef} className="relative mx-4 w-full max-w-2xl h-[250px] md:h-[360px]">
        {themes.map((t, i) => {
        if (![prevIndex, current, nextIndex].includes(i)) return null;

        let translateX = 0;
        let rotateY = 0;
        let scale = 1;
        let zIndex = 10;
        let opacity = 1;
        const offset = Math.max(160, Math.min(280, Math.round(stageWidth * 0.28)));

        if (i === prevIndex) {
            translateX = -offset;
            rotateY = 18;
            scale = 0.6;
            zIndex = 5;
            opacity = 0.45;
        } else if (i === nextIndex) {
            translateX = offset;
            rotateY = -18;
            scale = 0.6;
            zIndex = 5;
            opacity = 0.45;
        } else if (i === current) {
            translateX = 0;
            rotateY = 0;
            scale = 1;
            zIndex = 500;
            opacity = 1;
        }

        const transformStyle: React.CSSProperties = {
            transform: `translateX(-50%) translateX(${translateX}px) rotateY(${rotateY}deg) scale(${scale})`,
            transition: "transform 1000ms cubic-bezier(.2,.9,.2,1), opacity 600ms",
            zIndex,
            opacity,
            willChange: "transform, opacity",
            width: Math.max(260, Math.min(520, Math.round(stageWidth * 0.78))),
        };

        return (

            <Card
            key={t.title}
            className="absolute top-8 left-1/2 cursor-pointer"
            style={transformStyle}
            onClick={() => {
                if (i !== current) setCurrent(i);
            }}
            >
            <CardContent className="min-h-[80px] md:min-h-[140px] p-4">
                <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                    <h4 className="text-sm font-semibold text-foreground">{t.title}</h4>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-3">{t.summary}</p>
                </div>
                </div>
            </CardContent>
            </Card>


        );
        })}
        
        {/* <span className="absolute bottom-2 flex space-x-2 justify-center w-full text-center">
            {current}
            {current+1}
            {current}
        </span> */}
    </div>


    {/* Right arrow */}
    {/* <button
        aria-label="Next theme"
        onClick={() => setCurrent((c) => (c + 1) % total)}
        className="z-20 p-2 rounded-md hover:bg-background/60 focus:outline-none focus:ring"
    >
        <ArrowRight className="h-5 w-5" />
    </button> */}
    </div>
);
}
