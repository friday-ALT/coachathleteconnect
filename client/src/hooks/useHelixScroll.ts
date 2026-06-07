import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger);

/** Smooth scroll + Helix-style section reveals (landing only). */
export function useHelixScroll(enabled = true) {
  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    const onTick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(onTick);
    gsap.ticker.lagSmoothing(0);

    lenis.on("scroll", ScrollTrigger.update);

    const ctx = gsap.context(() => {
      gsap.from(".helix-hero__line", {
        y: 72,
        opacity: 0,
        duration: 1.1,
        stagger: 0.1,
        ease: "power3.out",
        delay: 0.15,
      });

      gsap.from(".helix-hero__orb", {
        scale: 0.6,
        opacity: 0,
        duration: 1.4,
        stagger: 0.2,
        ease: "power2.out",
        delay: 0.3,
      });

      gsap.utils.toArray<HTMLElement>(".helix-reveal").forEach((el) => {
        gsap.from(el, {
          scrollTrigger: {
            trigger: el,
            start: "top 88%",
            toggleActions: "play none none reverse",
          },
          y: 40,
          opacity: 0,
          duration: 0.85,
          ease: "power3.out",
        });
      });

      gsap.utils.toArray<HTMLElement>(".helix-stagger").forEach((container) => {
        const items = container.querySelectorAll(".helix-stagger__item");
        gsap.from(items, {
          scrollTrigger: {
            trigger: container,
            start: "top 82%",
          },
          y: 32,
          opacity: 0,
          duration: 0.65,
          stagger: 0.09,
          ease: "power2.out",
        });
      });

      const pinPanel = document.querySelector(".helix-pin-panel");
      const pinSticky = document.querySelector(".helix-pin-panel__sticky");
      if (pinPanel && pinSticky) {
        ScrollTrigger.create({
          trigger: pinPanel,
          start: "top top",
          end: "+=70%",
          pin: pinSticky,
          pinSpacing: true,
          anticipatePin: 1,
        });
      }

      gsap.to(".helix-orb--1", {
        scrollTrigger: { trigger: ".helix-hero", start: "top top", end: "bottom top", scrub: 1.2 },
        y: 140,
        x: 30,
      });
      gsap.to(".helix-orb--2", {
        scrollTrigger: { trigger: ".helix-hero", start: "top top", end: "bottom top", scrub: 1.2 },
        y: -100,
        x: -20,
      });

      gsap.utils.toArray<HTMLElement>(".helix-stat__value[data-helix-counter]").forEach((el) => {
        const end = parseFloat(el.dataset.helixCounter ?? "0");
        const suffix = el.dataset.suffix ?? "";
        const suffixEl = el.querySelector("span");
        const obj = { val: 0 };
        gsap.to(obj, {
          scrollTrigger: { trigger: el, start: "top 90%" },
          val: end,
          duration: 1.4,
          ease: "power2.out",
          onUpdate: () => {
            const display = Number.isInteger(end)
              ? Math.round(obj.val).toString()
              : obj.val.toFixed(1);
            for (const node of Array.from(el.childNodes)) {
              if (node.nodeType === Node.TEXT_NODE) {
                node.textContent = display;
                break;
              }
            }
            if (suffixEl) suffixEl.textContent = suffix;
          },
        });
      });
    });

    ScrollTrigger.create({
      start: 60,
      onUpdate: (self) => {
        document.querySelector(".helix-nav")?.classList.toggle("helix-nav--scrolled", self.scroll() > 60);
      },
    });

    return () => {
      ctx.revert();
      lenis.destroy();
      gsap.ticker.remove(onTick);
    };
  }, [enabled]);
}
