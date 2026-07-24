(function () {
  "use strict";

  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hasFinePointer = window.matchMedia("(pointer: fine)").matches;

  /* ---------------------------------------------------------
     Lenis smooth scroll — gentle inertia, skipped entirely
     under reduced motion (native scroll behaves normally).
     --------------------------------------------------------- */
  if (!reducedMotion && window.Lenis) {
    var lenis = new window.Lenis({
      duration: 1.1,
      easing: function (t) {
        return Math.min(1, 1.001 - Math.pow(2, -10 * t));
      },
      smoothWheel: true,
    });
    var raf = function (time) {
      lenis.raf(time);
      window.requestAnimationFrame(raf);
    };
    window.requestAnimationFrame(raf);
  }

  /* ---------------------------------------------------------
     Magnetic buttons — CTA buttons drift toward the cursor
     within a 70px radius, spring back on leave.
     --------------------------------------------------------- */
  if (!reducedMotion && hasFinePointer) {
    var radius = 70;
    var maxOffset = 10;
    var magneticButtons = document.querySelectorAll(".btn-primary");
    if (magneticButtons.length) {
      document.addEventListener("mousemove", function (e) {
        magneticButtons.forEach(function (btn) {
          var rect = btn.getBoundingClientRect();
          var relX = e.clientX - (rect.left + rect.width / 2);
          var relY = e.clientY - (rect.top + rect.height / 2);
          var dist = Math.sqrt(relX * relX + relY * relY);
          if (dist < radius) {
            var pull = (1 - dist / radius) * maxOffset;
            var angle = Math.atan2(relY, relX);
            btn.style.transition = "transform 0.12s linear";
            btn.style.transform =
              "translate(" + Math.cos(angle) * pull + "px, " + (Math.sin(angle) * pull - 2) + "px)";
            btn.dataset.magnetActive = "1";
          } else if (btn.dataset.magnetActive) {
            btn.dataset.magnetActive = "";
            btn.style.transition = "transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)";
            btn.style.transform = "translate(0px, 0px)";
          }
        });
      });
    }
  }

  /* ---------------------------------------------------------
     Logo pulse — a single confident beat on load.
     --------------------------------------------------------- */
  if (!reducedMotion) {
    document.querySelectorAll(".logo").forEach(function (logo) {
      logo.classList.add("logo--pulse");
    });
  }

  /* ---------------------------------------------------------
     Logo X wake-up — the red X spins and bounces once every
     8s (handled entirely by the infinite CSS keyframe); JS just
     opts every instance in, skipped under reduced motion.
     --------------------------------------------------------- */
  if (!reducedMotion) {
    document.querySelectorAll(".logo-x-shape").forEach(function (x) {
      x.classList.add("is-awake");
    });
  }

  /* ---------------------------------------------------------
     Icon idle pulse — every icon on the page gets its own
     independent "breath" every 4-6s (randomized per icon so
     they never move in sync), with a random 0-3s start offset.
     Skipped entirely under reduced motion.
     --------------------------------------------------------- */
  if (!reducedMotion) {
    document.querySelectorAll(".icon-draw").forEach(function (icon) {
      var cycle = 4000 + Math.random() * 2000;
      var startDelay = Math.random() * 3000;

      var pulse = function () {
        icon.classList.add("icon-idle-pulse");
        window.setTimeout(function () {
          icon.classList.remove("icon-idle-pulse");
        }, 700);
      };

      window.setTimeout(function () {
        pulse();
        window.setInterval(pulse, cycle);
      }, startDelay);
    });
  }
})();
