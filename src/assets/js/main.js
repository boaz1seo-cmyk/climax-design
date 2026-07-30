(function () {
  "use strict";

  document.documentElement.classList.remove("no-js");

  /* ---------------------------------------------------------
     Preserve query string (e.g. ?category=...) when switching
     language, so filters/state survive the language toggle.
     --------------------------------------------------------- */
  var langSwitch = document.querySelector(".lang-switch");
  if (langSwitch && window.location.search) {
    langSwitch.href = langSwitch.getAttribute("href") + window.location.search;
  }

  /* ---------------------------------------------------------
     Video lightbox gallery (ai-video page)
     --------------------------------------------------------- */
  var lightbox = document.querySelector("[data-video-lightbox]");
  if (lightbox) {
    var lightboxPlayer = lightbox.querySelector("[data-video-lightbox-player]");
    var lastTrigger = null;

    var openLightbox = function (src, title, trigger) {
      lastTrigger = trigger || null;
      lightboxPlayer.setAttribute("src", src);
      if (title) lightboxPlayer.setAttribute("aria-label", title);
      lightbox.hidden = false;
      lightboxPlayer.play().catch(function () {});
      lightbox.querySelector("[data-video-lightbox-close]").focus();
    };

    var closeLightbox = function () {
      lightboxPlayer.pause();
      lightboxPlayer.removeAttribute("src");
      lightboxPlayer.load();
      lightbox.hidden = true;
      if (lastTrigger) lastTrigger.focus();
    };

    document.querySelectorAll("[data-video-trigger]").forEach(function (trigger) {
      trigger.addEventListener("click", function () {
        openLightbox(trigger.getAttribute("data-video-src"), trigger.getAttribute("data-video-title"), trigger);
      });
    });

    lightbox.querySelectorAll("[data-video-lightbox-close]").forEach(function (btn) {
      btn.addEventListener("click", closeLightbox);
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !lightbox.hidden) closeLightbox();
    });
  }

  /* ---------------------------------------------------------
     Hero video: some mobile browsers (iOS Low Power Mode, the
     Safari "Auto-Play Videos" setting) ignore the autoplay
     attribute and show a native tap-to-play control instead.
     Retry play() on load and again on the first user gesture so
     it starts as soon as possible rather than sitting on that
     control.
     --------------------------------------------------------- */
  var heroVideo = document.querySelector(".hero__media video");
  if (heroVideo) {
    var tryPlayHeroVideo = function () {
      heroVideo.play().catch(function () {});
    };
    tryPlayHeroVideo();
    ["touchstart", "click", "scroll"].forEach(function (evt) {
      document.addEventListener(evt, tryPlayHeroVideo, { once: true, passive: true });
    });

    /* On slow/constrained connections (cellular data), don't let the
       video download linger indefinitely — the poster image is
       already a full static replacement, so on a timeout we stop
       fetching to free bandwidth for the rest of the page rather
       than have the request keep competing for it in the background. */
    var heroVideoTimeout = window.setTimeout(function () {
      if (heroVideo.readyState < 3) {
        heroVideo.setAttribute("preload", "none");
        heroVideo.querySelectorAll("source").forEach(function (s) {
          s.removeAttribute("src");
        });
        heroVideo.load();
      }
    }, 3500);
    heroVideo.addEventListener(
      "canplay",
      function () {
        window.clearTimeout(heroVideoTimeout);
      },
      { once: true }
    );
  }

  /* ---------------------------------------------------------
     Hero headline: crossfade loop between two lines. Line 1
     stays static under prefers-reduced-motion (no JS timer).
     --------------------------------------------------------- */
  var headlineLines = document.querySelectorAll("[data-headline-line]");
  if (headlineLines.length >= 2 && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    var activeHeadlineIndex = 0;
    window.setInterval(function () {
      headlineLines[activeHeadlineIndex].classList.remove("is-active");
      activeHeadlineIndex = (activeHeadlineIndex + 1) % headlineLines.length;
      headlineLines[activeHeadlineIndex].classList.add("is-active");
    }, 3800);
  }

  /* ---------------------------------------------------------
     Mobile navigation
     --------------------------------------------------------- */
  var toggle = document.querySelector("[data-menu-toggle]");
  var mobileNav = document.querySelector("[data-mobile-nav]");

  if (toggle && mobileNav) {
    var closeMenu = function () {
      toggle.setAttribute("aria-expanded", "false");
      mobileNav.classList.remove("is-open");
      document.body.style.overflow = "";
    };
    var openMenu = function () {
      toggle.setAttribute("aria-expanded", "true");
      mobileNav.classList.add("is-open");
      document.body.style.overflow = "hidden";
      var firstLink = mobileNav.querySelector("a");
      if (firstLink) firstLink.focus();
    };

    toggle.addEventListener("click", function () {
      var isOpen = toggle.getAttribute("aria-expanded") === "true";
      if (isOpen) closeMenu();
      else openMenu();
    });

    mobileNav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", closeMenu);
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && mobileNav.classList.contains("is-open")) {
        closeMenu();
        toggle.focus();
      }
    });
  }

  /* ---------------------------------------------------------
     Sticky header:
     - transparent over the hero, solid white once scrolled
     - always visible — never hides, regardless of scroll direction
     --------------------------------------------------------- */
  var header = document.querySelector("[data-site-header]");
  if (header) {
    var scrolledThreshold = 8;
    var ticking = false;

    var updateHeader = function () {
      var y = window.scrollY;
      header.classList.toggle("is-scrolled", y > scrolledThreshold);
      ticking = false;
    };

    updateHeader();
    document.addEventListener(
      "scroll",
      function () {
        if (!ticking) {
          window.requestAnimationFrame(updateHeader);
          ticking = true;
        }
      },
      { passive: true }
    );
  }

  /* ---------------------------------------------------------
     Work grid category filter
     --------------------------------------------------------- */
  var filterBar = document.querySelector("[data-filter-bar]");
  var workGrid = document.querySelector("[data-work-grid]");
  if (filterBar && workGrid) {
    var cards = workGrid.querySelectorAll("[data-category]");

    var applyFilter = function (category) {
      cards.forEach(function (card) {
        var match = category === "all" || card.getAttribute("data-category") === category;
        card.style.display = match ? "" : "none";
      });
      filterBar.querySelectorAll("[data-filter-bar] button, .filter-btn").forEach(function (btn) {
        btn.setAttribute("aria-pressed", btn.getAttribute("data-category") === category ? "true" : "false");
      });
    };

    filterBar.addEventListener("click", function (e) {
      var btn = e.target.closest(".filter-btn");
      if (!btn) return;
      var category = btn.getAttribute("data-category");
      applyFilter(category);
      var url = new URL(window.location.href);
      if (category === "all") url.searchParams.delete("category");
      else url.searchParams.set("category", category);
      window.history.replaceState({}, "", url);
    });

    var params = new URLSearchParams(window.location.search);
    var initialCategory = params.get("category") || "all";
    applyFilter(initialCategory);
  }

  /* ---------------------------------------------------------
     Testimonial carousel (simple dot-based, accessible)
     --------------------------------------------------------- */
  var quoteWrap = document.querySelector("[data-quote-carousel]");
  if (quoteWrap) {
    var slides = quoteWrap.querySelectorAll("[data-quote-slide]");
    var dotsWrap = quoteWrap.querySelector("[data-quote-dots]");
    var prevBtn = quoteWrap.querySelector("[data-quote-prev]");
    var nextBtn = quoteWrap.querySelector("[data-quote-next]");
    var current = 0;

    var showSlide = function (index) {
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      if (dotsWrap) {
        dotsWrap.querySelectorAll("button").forEach(function (dot, i) {
          dot.setAttribute("aria-current", i === index ? "true" : "false");
        });
      }
      current = index;
    };

    if (slides.length > 1) {
      if (dotsWrap) {
        slides.forEach(function (_, i) {
          var dot = document.createElement("button");
          dot.type = "button";
          dot.setAttribute("aria-label", (i + 1) + " / " + slides.length);
          dot.addEventListener("click", function () {
            showSlide(i);
          });
          dotsWrap.appendChild(dot);
        });
      }
      if (prevBtn) {
        prevBtn.addEventListener("click", function () {
          showSlide((current - 1 + slides.length) % slides.length);
        });
      }
      if (nextBtn) {
        nextBtn.addEventListener("click", function () {
          showSlide((current + 1) % slides.length);
        });
      }
      showSlide(0);
    }
  }

  /* ---------------------------------------------------------
     Forms: client-side validation + Web3Forms submit.
     Applies to the full contact form AND every lead-strip form
     on the page — each scoped to its own status box so multiple
     forms can coexist without interfering with each other.
     --------------------------------------------------------- */
  var forms = document.querySelectorAll("[data-contact-form], [data-lead-form]");
  forms.forEach(function (form) {
    var statusBox = form.closest("section")
      ? form.closest("section").querySelector("[data-form-status]")
      : null;
    var lang = document.documentElement.lang || "he";

    var messages =
      lang === "he"
        ? {
            required: "שדה חובה",
            invalidEmail: "כתובת אימייל לא תקינה",
            invalidPhone: "מספר טלפון לא תקין",
            successTitle: "תודה!",
            successBody: "נחזור אליך בהקדם 🙏",
            errorTitle: "משהו השתבש",
            errorBody: "נסה שוב או התקשר ישירות.",
            submitting: "שולח…",
          }
        : {
            required: "This field is required",
            invalidEmail: "Please enter a valid email address",
            invalidPhone: "Please enter a valid phone number",
            successTitle: "Thank you!",
            successBody: "We'll get back to you shortly 🙏",
            errorTitle: "Something went wrong",
            errorBody: "Please try again or call us directly.",
            submitting: "Sending…",
          };

    var phonePattern = /^[0-9+\-\s()]{7,}$/;
    var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    var setFieldError = function (field, message) {
      var wrapper = field.closest(".form-field");
      if (!wrapper) return;
      var errorEl = wrapper.querySelector(".form-error");
      wrapper.classList.toggle("has-error", !!message);
      if (errorEl) errorEl.textContent = message || "";
      field.setAttribute("aria-invalid", message ? "true" : "false");
    };

    var validateField = function (field) {
      var value = field.value.trim();
      if (field.hasAttribute("required") && !value) {
        setFieldError(field, messages.required);
        return false;
      }
      if (field.type === "email" && value && !emailPattern.test(value)) {
        setFieldError(field, messages.invalidEmail);
        return false;
      }
      if (field.type === "tel" && value && !phonePattern.test(value)) {
        setFieldError(field, messages.invalidPhone);
        return false;
      }
      setFieldError(field, null);
      return true;
    };

    form.querySelectorAll("input, select, textarea").forEach(function (field) {
      field.addEventListener("blur", function () {
        validateField(field);
      });
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      var fields = form.querySelectorAll("input, select, textarea");
      var isValid = true;
      fields.forEach(function (field) {
        if (!validateField(field)) isValid = false;
      });

      if (!isValid) {
        var firstError = form.querySelector(".has-error input, .has-error select, .has-error textarea");
        if (firstError) firstError.focus();
        return;
      }

      var submitBtn = form.querySelector('[type="submit"]');
      var originalLabel = submitBtn ? submitBtn.textContent : "";
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = messages.submitting;
      }

      var formData = new FormData(form);

      fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { Accept: "application/json" },
        body: formData,
      })
        .then(function (response) {
          return response.json();
        })
        .then(function (data) {
          if (data.success) {
            form.reset();
            window.location.href = lang === "he" ? "/thank-you/" : "/en/thank-you/";
            return;
          }
          if (statusBox) {
            statusBox.classList.remove("form-status--success");
            statusBox.classList.add("form-status--error", "is-visible");
            statusBox.innerHTML =
              "<strong>" + messages.errorTitle + "</strong><p>" + messages.errorBody + "</p>";
            statusBox.setAttribute("tabindex", "-1");
            statusBox.focus();
          }
        })
        .catch(function () {
          if (statusBox) {
            statusBox.classList.remove("form-status--success");
            statusBox.classList.add("form-status--error", "is-visible");
            statusBox.innerHTML =
              "<strong>" + messages.errorTitle + "</strong><p>" + messages.errorBody + "</p>";
            statusBox.setAttribute("tabindex", "-1");
            statusBox.focus();
          }
        })
        .finally(function () {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = originalLabel;
          }
        });
    });
  });
})();
