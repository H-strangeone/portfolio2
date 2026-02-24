// import gsap from "gsap";
// import { ScrollTrigger } from "gsap/ScrollTrigger";
// import Lenis from "@studio-freight/lenis";

// gsap.registerPlugin(ScrollTrigger);

// document.addEventListener("DOMContentLoaded", () => {
//     // Initialize Lenis with proper RAF loop
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

//     const windowContainer = document.querySelector(".window-container");
//     const skyContainer = document.querySelector(".sky-container");
//     const heroHeader = document.querySelector(".hero-header");
//     const heroCopy = document.querySelector(".hero-copy");
//     const skyContainerHeight = skyContainer.offsetHeight;
//     const viewportHeight = window.innerHeight;
//     const skyMoveDistance = skyContainerHeight - viewportHeight;

//     // Initial states
//     gsap.set(heroCopy, { yPercent: 100, opacity: 0 });
//     gsap.set(windowContainer, { scale: 1 });

//     ScrollTrigger.create({
//         trigger: ".hero",
//         start: "top top",
//         end: `+=${window.innerHeight * 3}px`,
//         pin: true,
//         pinSpacing: true,
//         scrub: 1.5,
//         onUpdate: (self) => {
//             const progress = self.progress;
            
//             // Window scaling and fading
//             let windowScale;
//             let windowOpacity;
            
//             if (progress < 0.4) {
//                 // Scale up from 1 to 6
//                 windowScale = gsap.utils.mapRange(0, 0.4, 1, 6, progress);
//                 windowOpacity = 1;
//             } else if (progress < 0.7) {
//                 // Hold at 6x scale
//                 windowScale = 6;
//                 windowOpacity = 1;
//             } else {
//                 // Fade out completely (don't scale down, just fade)
//                 windowScale = 6;
//                 windowOpacity = gsap.utils.mapRange(0.7, 0.9, 1, 0, progress);
//             }
            
//             gsap.set(windowContainer, { 
//                 scale: windowScale, 
//                 opacity: windowOpacity 
//             });

//             // Hero header scaling and fading
//             let headerOpacity;
//             if (progress < 0.6) {
//                 headerOpacity = 1;
//             } else {
//                 headerOpacity = gsap.utils.mapRange(0.6, 0.8, 1, 0, progress);
//             }
            
//             gsap.set(heroHeader, { 
//                 scale: windowScale, 
//                 z: progress * 500,
//                 opacity: headerOpacity
//             });

//             // Sky movement - increase multiplier to ensure full visibility
//             gsap.set(skyContainer, { 
//                 y: -skyMoveDistance * progress * 1.3 
//             });

//             // Hero copy appears in final third
//             let heroCopyY;
//             let heroCopyOpacity;
            
//             if (progress < 0.66) {
//                 heroCopyY = 100;
//                 heroCopyOpacity = 0;
//             } else if (progress >= 1) {
//                 heroCopyY = 0;
//                 heroCopyOpacity = 1;
//             } else {
//                 const copyProgress = (progress - 0.66) / 0.34;
//                 heroCopyY = 100 * (1 - copyProgress);
//                 heroCopyOpacity = copyProgress;
//             }
            
//             gsap.set(heroCopy, { 
//                 yPercent: heroCopyY, 
//                 opacity: heroCopyOpacity 
//             });
//         },
//     });
// });
// import gsap from "gsap";
// import { ScrollTrigger } from "gsap/ScrollTrigger";
// import Lenis from "@studio-freight/lenis";

// gsap.registerPlugin(ScrollTrigger);

// document.addEventListener("DOMContentLoaded", () => {
//     // Initialize Lenis with proper RAF loop
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

//     const windowContainer = document.querySelector(".window-container");
//     const skyContainer = document.querySelector(".sky-container");
//     const heroHeader = document.querySelector(".hero-header");
//     const heroCopy = document.querySelector(".hero-copy");
//     const skyContainerHeight = skyContainer.offsetHeight;
//     const viewportHeight = window.innerHeight;
//     const skyMoveDistance = skyContainerHeight - viewportHeight;

//     // Initial states
//     gsap.set(heroCopy, { yPercent: 100, opacity: 0 });
//     gsap.set(windowContainer, { scale: 1 });

//     ScrollTrigger.create({
//         trigger: ".hero",
//         start: "top top",
//         end: `+=${window.innerHeight * 3}px`,
//         pin: true,
//         pinSpacing: true,
//         scrub: 1.5,
//         onUpdate: (self) => {
//             const progress = self.progress;
            
//             // Window scaling and fading
//             let windowScale;
//             let windowOpacity;
            
//             if (progress < 0.4) {
//                 // Scale up from 1 to 6
//                 windowScale = gsap.utils.mapRange(0, 0.4, 1, 6, progress);
//                 windowOpacity = 1;
//             } else if (progress < 0.5) {
//                 // Hold at 6x scale briefly
//                 windowScale = 6;
//                 windowOpacity = 1;
//             } else {
//                 // Fade out completely as clouds become visible
//                 windowScale = 6;
//                 windowOpacity = gsap.utils.mapRange(0.5, 0.65, 1, 0, progress);
//             }
            
//             gsap.set(windowContainer, { 
//                 scale: windowScale, 
//                 opacity: windowOpacity 
//             });

//             // Hero header scaling and fading
//             let headerOpacity;
//             if (progress < 0.5) {
//                 headerOpacity = 1;
//             } else {
//                 headerOpacity = gsap.utils.mapRange(0.5, 0.65, 1, 0, progress);
//             }
            
//             gsap.set(heroHeader, { 
//                 scale: windowScale, 
//                 z: progress * 500,
//                 opacity: headerOpacity
//             });

//             // Sky movement - increase multiplier to ensure full visibility
//             gsap.set(skyContainer, { 
//                 y: -skyMoveDistance * progress * 1.3 
//             });

//             // Hero copy appears in final third
//             let heroCopyY;
//             let heroCopyOpacity;
            
//             if (progress < 0.66) {
//                 heroCopyY = 100;
//                 heroCopyOpacity = 0;
//             } else if (progress >= 1) {
//                 heroCopyY = 0;
//                 heroCopyOpacity = 1;
//             } else {
//                 const copyProgress = (progress - 0.66) / 0.34;
//                 heroCopyY = 100 * (1 - copyProgress);
//                 heroCopyOpacity = copyProgress;
//             }
            
//             gsap.set(heroCopy, { 
//                 yPercent: heroCopyY, 
//                 opacity: heroCopyOpacity 
//             });
//         },
//     });
// });
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "@studio-freight/lenis";

gsap.registerPlugin(ScrollTrigger);

document.addEventListener("DOMContentLoaded", () => {
    // Initialize Lenis with proper RAF loop
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

    const windowContainer = document.querySelector(".window-container");
    const skyContainer = document.querySelector(".sky-container");
    const heroHeader = document.querySelector(".hero-header");
    const heroCopy = document.querySelector(".hero-copy");
    const skyContainerHeight = skyContainer.offsetHeight;
    const viewportHeight = window.innerHeight;
    const skyMoveDistance = skyContainerHeight - viewportHeight;

    // Initial states
    gsap.set(heroCopy, { yPercent: 100, opacity: 0 });
    gsap.set(windowContainer, { scale: 1 });

    ScrollTrigger.create({
        trigger: ".hero",
        start: "top top",
        end: `+=${window.innerHeight * 3}px`,
        pin: true,
        pinSpacing: true,
        scrub: 1.5,
        onUpdate: (self) => {
            const progress = self.progress;
            
            // Window scaling and fading
            let windowScale;
            let windowOpacity;
            
            if (progress < 0.4) {
                // Scale up from 1 to 12 (large enough to cover entire screen)
                windowScale = gsap.utils.mapRange(0, 0.4, 1, 12, progress);
                windowOpacity = 1;
            } else if (progress < 0.5) {
                // Hold at 12x scale briefly
                windowScale = 12;
                windowOpacity = 1;
            } else {
                // Fade out completely as clouds become visible
                windowScale = 12;
                windowOpacity = gsap.utils.mapRange(0.5, 0.65, 1, 0, progress);
            }
            
            gsap.set(windowContainer, { 
                scale: windowScale, 
                opacity: windowOpacity 
            });

            // Hero header scaling and fading
            let headerOpacity;
            if (progress < 0.5) {
                headerOpacity = 1;
            } else {
                headerOpacity = gsap.utils.mapRange(0.5, 0.65, 1, 0, progress);
            }
            
            gsap.set(heroHeader, { 
                scale: windowScale, 
                z: progress * 500,
                opacity: headerOpacity
            });

            // Sky movement - increase multiplier to ensure full visibility
            gsap.set(skyContainer, { 
                y: -skyMoveDistance * progress * 1.3 
            });

            // Hero copy appears in final third
            let heroCopyY;
            let heroCopyOpacity;
            
            if (progress < 0.66) {
                heroCopyY = 100;
                heroCopyOpacity = 0;
            } else if (progress >= 1) {
                heroCopyY = 0;
                heroCopyOpacity = 1;
            } else {
                const copyProgress = (progress - 0.66) / 0.34;
                heroCopyY = 100 * (1 - copyProgress);
                heroCopyOpacity = copyProgress;
            }
            
            gsap.set(heroCopy, { 
                yPercent: heroCopyY, 
                opacity: heroCopyOpacity 
            });
        },
    });
});