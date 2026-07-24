(function () {
  "use strict";

  /* ---------------------------------------------------------
     Depth-aware text reveal for every [data-animate] element.

     - H1/H2 (display-heading): clip-reveal — the text rises out
       from behind a hidden overflow, like it's climbing into view.
     - Everything else (paragraphs, eyebrows, buttons): blur-to-sharp
       — starts soft and low, settles into focus.
     - Elements sharing a common section animate in sequence,
       0.15s apart, in DOM order (heading -> subtitle -> body -> button).
     - Runs once per element, triggered by native IntersectionObserver.
     - The HTML text itself is never rewritten — only wrapped in a
       presentational span, so search engines see the same markup.
     --------------------------------------------------------- */

  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reducedMotion) return;

  var STAGGER_STEP = 0.15;

  var elements = Array.prototype.slice.call(document.querySelectorAll("[data-animate]"));
  if (!elements.length) return;

  elements.forEach(function (el) {
    var isHeading = el.tagName === "H1" || el.tagName === "H2";
    if (isHeading) {
      el.classList.add("reveal-clip");
      var inner = document.createElement("span");
      inner.className = "reveal-clip__inner";
      while (el.firstChild) inner.appendChild(el.firstChild);
      el.appendChild(inner);
    } else {
      el.classList.add("reveal-blur");
    }
  });

  var groupFor = function (el) {
    return (
      el.closest(".hero__inner") ||
      el.closest(".section-head") ||
      el.closest(".quote") ||
      el.closest("section") ||
      el.parentElement
    );
  };

  var groups = [];
  var groupMap = new Map();
  elements.forEach(function (el) {
    var group = groupFor(el);
    if (!groupMap.has(group)) {
      groupMap.set(group, []);
      groups.push(group);
    }
    groupMap.get(group).push(el);
  });

  var reveal = function (group) {
    var members = groupMap.get(group);
    members.forEach(function (el, i) {
      window.setTimeout(function () {
        el.classList.add("is-visible");
      }, i * STAGGER_STEP * 1000);
    });
  };

  if (!("IntersectionObserver" in window)) {
    groups.forEach(reveal);
    return;
  }

  var observer = new IntersectionObserver(
    function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          reveal(entry.target);
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -10% 0px" }
  );

  groups.forEach(function (group) {
    observer.observe(group);
  });
})();
