import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "@studio-freight/lenis";

gsap.registerPlugin(ScrollTrigger);

document.addEventListener("DOMContentLoaded", () => {

    // ─── LENIS ────────────────────────────────────────────────
    const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smooth: true
    });

    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
    lenis.on("scroll", ScrollTrigger.update);

    // ─── DOM REFS ─────────────────────────────────────────────
    const windowContainer = document.querySelector(".window-container");
    const skyContainer    = document.querySelector(".sky-container");
    const heroHeader      = document.querySelector(".hero-header");
    const heroCopy        = document.querySelector(".hero-copy");

    const panelIntro      = document.getElementById("panel-intro");
    const panelEducation  = document.getElementById("panel-education");
    const panelResume     = document.getElementById("panel-resume");

    const skyContainerHeight = skyContainer.offsetHeight;
    const viewportHeight     = window.innerHeight;
    const skyMoveDistance    = skyContainerHeight - viewportHeight;

    // ─── INITIAL STATES ───────────────────────────────────────
    gsap.set(heroCopy,        { yPercent: 100, opacity: 0 });
    gsap.set(windowContainer, { scale: 1 });
    gsap.set([panelIntro, panelEducation, panelResume], {
        opacity: 0,
        y: 60,
        pointerEvents: "none"
    });

    // ─── HELPERS ──────────────────────────────────────────────
    const clamp01 = (v) => Math.min(1, Math.max(0, v));
    const norm    = (v, min, max) => clamp01((v - min) / (max - min));
    const easeOut = (t) => 1 - Math.pow(1 - t, 3);
    const easeIn  = (t) => t * t;

    // inStart→inEnd   : fades + rises in   (interactive once opacity > 0.05)
    // inEnd→outStart  : fully visible
    // outStart→outEnd : fades + rises out
    function drivePanel(el, p, inStart, inEnd, outStart, outEnd) {
        let opacity, y;

        if (p < inStart) {
            opacity = 0;  y = 60;
        } else if (p < inEnd) {
            const t = easeOut(norm(p, inStart, inEnd));
            opacity = t;  y = 60 * (1 - t);
        } else if (p < outStart) {
            opacity = 1;  y = 0;
        } else if (p < outEnd) {
            const t = easeIn(norm(p, outStart, outEnd));
            opacity = 1 - t;  y = -40 * t;
        } else {
            opacity = 0;  y = -40;
        }

        gsap.set(el, {
            opacity,
            y,
            pointerEvents: opacity > 0.05 ? "auto" : "none"
        });
    }

    // ─── SCROLL TRIGGER ───────────────────────────────────────
    // Extended to 7× viewport to fit 3 panels between window-out and hero-copy.
    //
    // PROGRESS MAP  (0 → 1  over  7 × viewport height)
    // ──────────────────────────────────────────────────
    // 0.00 → 0.17   window zooms in  1→12
    // 0.17 → 0.21   window holds at 12×
    // 0.21 → 0.28   window fades out, clouds fully visible
    // 0.28 → 0.44   Panel 1 · Intro
    // 0.44 → 0.60   Panel 2 · Education
    // 0.60 → 0.76   Panel 3 · Resume
    // 0.76 → 1.00   hero-copy rises in

    ScrollTrigger.create({
        trigger: ".hero",
        start: "top top",
        end: `+=${window.innerHeight * 5.5}px`,
        pin: true,
        pinSpacing: true,
        scrub: 1.5,
        onUpdate: (self) => {
            const progress = self.progress;

            // ── Window scaling + fading ───────────────────────────
            let windowScale, windowOpacity;

            if (progress < 0.17) {
                windowScale   = gsap.utils.mapRange(0, 0.17, 1, 12, progress);
                windowOpacity = 1;
            } else if (progress < 0.21) {
                windowScale   = 12;
                windowOpacity = 1;
            } else {
                windowScale   = 12;
                windowOpacity = gsap.utils.mapRange(0.21, 0.28, 1, 0, progress);
            }

            gsap.set(windowContainer, {
                scale:   windowScale,
                opacity: windowOpacity
            });

            // ── Hero header ───────────────────────────────────────
            let headerOpacity;
            if (progress < 0.21) {
                headerOpacity = 1;
            } else {
                headerOpacity = gsap.utils.mapRange(0.21, 0.28, 1, 0, progress);
            }

            gsap.set(heroHeader, {
                scale:   windowScale,
                z:       progress * 500,
                opacity: headerOpacity
            });

            // ── Sky movement (original 1.3 multiplier kept) ───────
            gsap.set(skyContainer, {
                y: -skyMoveDistance * progress * 1.3
            });

            // ── Panels over clouds ────────────────────────────────
            // Intro starts at 0.24 — just as the window finishes fading
            drivePanel(panelIntro,     progress, 0.24, 0.31, 0.35, 0.40);
            drivePanel(panelEducation, progress, 0.40, 0.47, 0.52, 0.57);
            drivePanel(panelResume,    progress, 0.57, 0.64, 0.68, 0.73);

            // ── Hero copy — final stretch ─────────────────────────
            let heroCopyY, heroCopyOpacity;

            if (progress < 0.73) {
                heroCopyY       = 100;
                heroCopyOpacity = 0;
            } else if (progress >= 1) {
                heroCopyY       = 0;
                heroCopyOpacity = 1;
            } else {
                const t   = (progress - 0.73) / 0.27;
                heroCopyY       = 100 * (1 - t);
                heroCopyOpacity = t;
            }

            gsap.set(heroCopy, {
                yPercent: heroCopyY,
                opacity:  heroCopyOpacity
            });
            const heroOutro = document.querySelector(".hero-outro");

            let outroOpacity = 0;

            if (progress > 0.76) {
            outroOpacity = gsap.utils.mapRange(0.76, 0.90, 0, 1, progress);
            }

            gsap.set(heroOutro, {
            opacity: outroOpacity
            });
        },
    });
    
});

// ─── GITHUB SECTION SCROLL-IN ─────────────────────────────
// Each direct child of .github-inner fades up when it enters the viewport
const githubChildren = document.querySelectorAll(".github-inner > *");
if (githubChildren.length) {
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    // Stagger based on sibling index
                    const index = [...githubChildren].indexOf(entry.target);
                    setTimeout(() => {
                        entry.target.classList.add("is-visible");
                    }, index * 120);
                    observer.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.1 }
    );
    githubChildren.forEach((el) => observer.observe(el));
}
// ─── KILL WHITE GAP FROM GSAP PIN SPACER ───────────────────
// GSAP injects a pin-spacer div after .hero — make it transparent
// so it doesn't flash as a white block between hero and github section
ScrollTrigger.addEventListener("refresh", () => {
    const spacer = document.querySelector(".pin-spacer");
    if (spacer) {
        spacer.style.background = "var(--dark)";
    }
});
// Also run immediately in case it already exists
document.querySelectorAll(".pin-spacer").forEach(el => {
    el.style.background = "transparent";
});

// import gsap from "gsap";
// import { ScrollTrigger } from "gsap/ScrollTrigger";
// import Lenis from "@studio-freight/lenis";

// gsap.registerPlugin(ScrollTrigger);

// document.addEventListener("DOMContentLoaded", () => {

//     // ─── LENIS ────────────────────────────────────────────────
//     const lenis = new Lenis({
//         duration: 1.2,
//         easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
//         smooth: true
//     });

//     function raf(time) {
//         lenis.raf(time);
//         requestAnimationFrame(raf);
//     }
//     requestAnimationFrame(raf);
//     lenis.on("scroll", ScrollTrigger.update);

//     // ─── DOM REFS ─────────────────────────────────────────────
//     const windowContainer = document.querySelector(".window-container");
//     const skyContainer    = document.querySelector(".sky-container");
//     const heroHeader      = document.querySelector(".hero-header");
//     const panelIntro      = document.getElementById("panel-intro");
//     const panelEducation  = document.getElementById("panel-education");
//     const panelResume     = document.getElementById("panel-resume");

//     const skyContainerHeight = skyContainer.offsetHeight;
//     const viewportHeight     = window.innerHeight;
//     const skyMoveDistance    = skyContainerHeight - viewportHeight;

//     // ─── INITIAL STATES ───────────────────────────────────────
//     gsap.set(windowContainer, { scale: 1 });
//     gsap.set([panelIntro, panelEducation, panelResume], {
//         opacity: 0,
//         y: 60,
//         pointerEvents: "none"
//     });

//     // ─── HELPERS ──────────────────────────────────────────────
//     const clamp01 = (v) => Math.min(1, Math.max(0, v));
//     const norm    = (v, min, max) => clamp01((v - min) / (max - min));
//     const easeOut = (t) => 1 - Math.pow(1 - t, 3);
//     const easeIn  = (t) => t * t;

//     // inStart→inEnd   : fades + rises in   (interactive once opacity > 0.05)
//     // inEnd→outStart  : fully visible
//     // outStart→outEnd : fades + rises out
//     function drivePanel(el, p, inStart, inEnd, outStart, outEnd) {
//         let opacity, y;

//         if (p < inStart) {
//             opacity = 0;  y = 60;
//         } else if (p < inEnd) {
//             const t = easeOut(norm(p, inStart, inEnd));
//             opacity = t;  y = 60 * (1 - t);
//         } else if (p < outStart) {
//             opacity = 1;  y = 0;
//         } else if (p < outEnd) {
//             const t = easeIn(norm(p, outStart, outEnd));
//             opacity = 1 - t;  y = -40 * t;
//         } else {
//             opacity = 0;  y = -40;
//         }

//         gsap.set(el, {
//             opacity,
//             y,
//             pointerEvents: opacity > 0.05 ? "auto" : "none"
//         });
//     }

//     // ─── SCROLL TRIGGER ───────────────────────────────────────
//     // Extended to 5.5× viewport — window zoom + 3 content panels.
//     //
//     // PROGRESS MAP  (0 → 1  over  7 × viewport height)
//     // ──────────────────────────────────────────────────
//     // 0.00 → 0.17   window zooms in  1→12
//     // 0.17 → 0.21   window holds at 12×
//     // 0.21 → 0.28   window fades out, clouds fully visible
//     // 0.28 → 0.50   Panel 1 · Intro
//     // 0.50 → 0.70   Panel 2 · Education
//     // 0.70 → 1.00   Panel 3 · Resume (holds till end)

//     ScrollTrigger.create({
//         trigger: ".hero",
//         start: "top top",
//         end: `+=${window.innerHeight * 5.5}px`,
//         pin: true,
//         pinSpacing: true,
//         scrub: 1.5,
//         onUpdate: (self) => {
//             const progress = self.progress;

//             // ── Window scaling + fading ───────────────────────────
//             let windowScale, windowOpacity;

//             if (progress < 0.17) {
//                 windowScale   = gsap.utils.mapRange(0, 0.17, 1, 12, progress);
//                 windowOpacity = 1;
//             } else if (progress < 0.21) {
//                 windowScale   = 12;
//                 windowOpacity = 1;
//             } else {
//                 windowScale   = 12;
//                 windowOpacity = gsap.utils.mapRange(0.21, 0.28, 1, 0, progress);
//             }

//             gsap.set(windowContainer, {
//                 scale:   windowScale,
//                 opacity: windowOpacity
//             });

//             // ── Hero header ───────────────────────────────────────
//             let headerOpacity;
//             if (progress < 0.21) {
//                 headerOpacity = 1;
//             } else {
//                 headerOpacity = gsap.utils.mapRange(0.21, 0.28, 1, 0, progress);
//             }

//             gsap.set(heroHeader, {
//                 scale:   windowScale,
//                 z:       progress * 500,
//                 opacity: headerOpacity
//             });

//             // ── Sky movement (original 1.3 multiplier kept) ───────
//             gsap.set(skyContainer, {
//                 y: -skyMoveDistance * progress * 1.3
//             });

//             // ── Panels over clouds ────────────────────────────────
//             // Intro starts at 0.24 — just as the window finishes fading
//             drivePanel(panelIntro,     progress, 0.24, 0.33, 0.42, 0.50);
//             drivePanel(panelEducation, progress, 0.50, 0.59, 0.63, 0.70);
//             drivePanel(panelResume,    progress, 0.70, 0.79, 0.92, 1.01); // holds to end

//         },
//     });
// });

// // ─── GITHUB SECTION SCROLL-IN ─────────────────────────────
// // Each direct child of .github-inner fades up when it enters the viewport
// const githubChildren = document.querySelectorAll(".github-inner > *");
// if (githubChildren.length) {
//     const observer = new IntersectionObserver(
//         (entries) => {
//             entries.forEach((entry) => {
//                 if (entry.isIntersecting) {
//                     // Stagger based on sibling index
//                     const index = [...githubChildren].indexOf(entry.target);
//                     setTimeout(() => {
//                         entry.target.classList.add("is-visible");
//                     }, index * 120);
//                     observer.unobserve(entry.target);
//                 }
//             });
//         },
//         { threshold: 0.1 }
//     );
//     githubChildren.forEach((el) => observer.observe(el));
// }

// // ─── KILL WHITE GAP FROM GSAP PIN SPACER ───────────────────
// // GSAP injects a pin-spacer div after .hero — make it transparent
// // so it doesn't flash as a white block between hero and github section
// ScrollTrigger.addEventListener("refresh", () => {
//     const spacer = document.querySelector(".pin-spacer");
//     if (spacer) {
//         spacer.style.background = "var(--dark)";
//     }
// });
// // Also run immediately in case it already exists
// document.querySelectorAll(".pin-spacer").forEach(el => {
//     el.style.background = "transparent";
// });