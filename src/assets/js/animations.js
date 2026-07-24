(function () {
  "use strict";

  var revealAllStatic = function () {
    document.querySelectorAll("[data-animate], [data-animate-item]").forEach(function (el) {
      el.style.opacity = "1";
      el.style.transform = "none";
    });
    document.querySelectorAll(".icon-draw__line").forEach(function (line) {
      line.style.strokeDasharray = "none";
      line.style.strokeDashoffset = "0";
    });
    document.querySelectorAll(".icon-draw__accent, .icon-draw__accent-line").forEach(function (accent) {
      accent.style.opacity = "1";
    });
  };

  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (typeof window.gsap === "undefined" || reducedMotion) {
    revealAllStatic();
    return;
  }

  var gsap = window.gsap;
  gsap.registerPlugin(window.ScrollTrigger);

  var isRTL = document.documentElement.dir === "rtl";

  /* ---------------------------------------------------------
     Hero headline: word-by-word reveal from center, on load
     --------------------------------------------------------- */
  document.querySelectorAll("[data-animate-hero]").forEach(function (el) {
    var text = el.textContent;
    var words = text.split(/\s+/).filter(Boolean);
    el.setAttribute("aria-label", text);
    el.innerHTML = words
      .map(function (w) {
        return '<span class="word" style="display:inline-block; opacity:0;">' + w + "</span>";
      })
      .join(" ");

    gsap.fromTo(
      el.querySelectorAll(".word"),
      { opacity: 0, y: 24 },
      {
        opacity: 1,
        y: 0,
        duration: 0.9,
        ease: "power3.out",
        stagger: { each: 0.08, from: "center" },
        delay: 0.2,
      }
    );
  });

  /* ---------------------------------------------------------
     Generic scroll reveal for [data-animate] elements now lives
     in reveal.js (clip-reveal headings, blur-to-sharp text,
     staggered by section) — kept independent of GSAP so it
     still runs if GSAP fails to load for any reason.
     --------------------------------------------------------- */

  /* ---------------------------------------------------------
     Staggered groups (feature grids, work cards, client logos)
     --------------------------------------------------------- */
  gsap.utils.toArray("[data-animate-group]").forEach(function (group) {
    var items = group.querySelectorAll("[data-animate-item]");
    if (!items.length) return;
    gsap.fromTo(
      items,
      { autoAlpha: 0, y: 28, scale: 0.98 },
      {
        autoAlpha: 1,
        y: 0,
        scale: 1,
        duration: 0.7,
        ease: "power2.out",
        stagger: { each: 0.1, from: "center", grid: "auto" },
        scrollTrigger: {
          trigger: group,
          start: "top 82%",
          once: true,
        },
      }
    );
  });

  /* ---------------------------------------------------------
     Custom icons: the line draws itself in on scroll, then the
     red accent detail scales/fades in last.
     --------------------------------------------------------- */
  document.querySelectorAll(".icon-draw").forEach(function (icon) {
    var lines = icon.querySelectorAll(".icon-draw__line");
    var accentLines = icon.querySelectorAll(".icon-draw__accent-line");
    var accentFills = icon.querySelectorAll(".icon-draw__accent");
    if (!lines.length && !accentLines.length && !accentFills.length) return;

    var drawDuration = parseFloat(icon.getAttribute("data-draw-duration")) || 0.8;

    var staggerDelay = 0;
    var group = icon.closest("[data-animate-group]");
    if (group) {
      var groupIcons = Array.prototype.slice.call(group.querySelectorAll(".icon-draw"));
      staggerDelay = groupIcons.indexOf(icon) * 0.2;
    }

    var prepStroke = function (line) {
      var length = line.getTotalLength();
      line.style.strokeDasharray = length;
      line.style.strokeDashoffset = length;
    };
    lines.forEach(prepStroke);
    accentLines.forEach(prepStroke);
    gsap.set(accentFills, { opacity: 0, scale: 0.5, transformOrigin: "50% 50%" });

    var tl = gsap.timeline({
      delay: staggerDelay,
      scrollTrigger: {
        trigger: icon,
        start: "top 88%",
        once: true,
      },
    });
    if (lines.length) {
      tl.to(lines, {
        strokeDashoffset: 0,
        duration: drawDuration,
        ease: "power2.inOut",
        stagger: drawDuration * 0.18,
      });
    }
    if (accentLines.length) {
      tl.to(accentLines, {
        strokeDashoffset: 0,
        duration: drawDuration * 0.45,
        ease: "power2.out",
        stagger: drawDuration * 0.08,
      }, "-=0.05");
    }
    if (accentFills.length) {
      tl.to(accentFills, { opacity: 1, scale: 1, duration: 0.4, ease: "back.out(2.5)" }, "-=0.05");
    }
  });

  window.addEventListener("resize", function () {
    window.ScrollTrigger.refresh();
  });

  /* ---------------------------------------------------------
     Safety net: above-the-fold content must never stay stuck
     invisible if a tween fails to fire (slow device, stalled
     rAF ticker, script conflict, etc.) — force-reveal shortly
     after load regardless of animation state.
     --------------------------------------------------------- */
  window.setTimeout(function () {
    document.querySelectorAll(".hero [data-animate], .hero .word").forEach(function (el) {
      el.style.opacity = "1";
      el.style.transform = "none";
    });
  }, 2500);
})();
