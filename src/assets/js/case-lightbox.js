(function () {
  "use strict";

  var lightbox = document.querySelector("[data-image-lightbox]");
  if (!lightbox) return;

  var img = lightbox.querySelector("[data-image-lightbox-img]");
  var prevBtn = lightbox.querySelector("[data-image-lightbox-prev]");
  var nextBtn = lightbox.querySelector("[data-image-lightbox-next]");
  var triggers = Array.prototype.slice.call(document.querySelectorAll("[data-lightbox-trigger]"));
  var lastTrigger = null;
  var currentIndex = -1;

  var showAt = function (index) {
    currentIndex = (index + triggers.length) % triggers.length;
    var trigger = triggers[currentIndex];
    var src = trigger.getAttribute("data-lightbox-src");
    var alt = trigger.querySelector("img") ? trigger.querySelector("img").getAttribute("alt") : "";
    img.setAttribute("src", src);
    img.setAttribute("alt", alt || "");
  };

  var open = function (index, trigger) {
    lastTrigger = trigger || null;
    showAt(index);
    lightbox.hidden = false;
    var showNav = triggers.length > 1;
    if (prevBtn) prevBtn.hidden = !showNav;
    if (nextBtn) nextBtn.hidden = !showNav;
    lightbox.querySelector("[data-image-lightbox-close]").focus();
  };

  var close = function () {
    lightbox.hidden = true;
    img.removeAttribute("src");
    if (lastTrigger) lastTrigger.focus();
  };

  triggers.forEach(function (trigger, index) {
    trigger.addEventListener("click", function () {
      open(index, trigger);
    });
  });

  lightbox.querySelectorAll("[data-image-lightbox-close]").forEach(function (btn) {
    btn.addEventListener("click", close);
  });

  if (prevBtn) prevBtn.addEventListener("click", function () { showAt(currentIndex - 1); });
  if (nextBtn) nextBtn.addEventListener("click", function () { showAt(currentIndex + 1); });

  document.addEventListener("keydown", function (e) {
    if (lightbox.hidden) return;
    if (e.key === "Escape") close();
    if (e.key === "ArrowLeft") showAt(currentIndex - 1);
    if (e.key === "ArrowRight") showAt(currentIndex + 1);
  });
})();
