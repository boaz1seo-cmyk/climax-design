const { DateTime } = (() => {
  try {
    return require("luxon");
  } catch (e) {
    return { DateTime: null };
  }
})();

const fs = require("fs");
const path = require("path");
const iconCache = {};
const buildId = Date.now().toString(36);

module.exports = function (eleventyConfig) {
  eleventyConfig.addGlobalData("buildId", buildId);
  eleventyConfig.addShortcode("icon", function (name, size) {
    const key = name + ":" + (size || 24);
    if (iconCache[key]) return iconCache[key];
    const filePath = path.join(
      __dirname,
      "node_modules/lucide-static/icons",
      name + ".svg"
    );
    let svg;
    try {
      svg = fs.readFileSync(filePath, "utf8");
    } catch (e) {
      throw new Error(`icon shortcode: unknown Lucide icon "${name}"`);
    }
    svg = svg.replace(/<!--[\s\S]*?-->\s*/, "");
    const s = size || 24;
    svg = svg
      .replace(/width="24"/, `width="${s}"`)
      .replace(/height="24"/, `height="${s}"`)
      .replace(/stroke-width="2"/, 'stroke-width="1.5"')
      .replace("<svg", '<svg aria-hidden="true" focusable="false"');
    iconCache[key] = svg;
    return svg;
  });
  // static passthrough — site's own built assets
  eleventyConfig.addPassthroughCopy({ "src/assets/css": "assets/css" });
  eleventyConfig.addPassthroughCopy({ "src/assets/js": "assets/js" });
  eleventyConfig.addPassthroughCopy({ "src/assets/fonts": "assets/fonts" });
  eleventyConfig.addPassthroughCopy({ "src/assets/img": "assets/img" });
  eleventyConfig.addPassthroughCopy({ "src/assets/video": "assets/video" });

  // user-managed content media (client uploads real files here later)
  eleventyConfig.addPassthroughCopy({ "assets/works": "assets/works" });
  eleventyConfig.addPassthroughCopy({ "assets/dan": "assets/dan" });
  eleventyConfig.addPassthroughCopy({ "assets/videos": "assets/videos" });

  // standalone static prototypes embedded via iframe on a project page —
  // served as-is, never processed as Nunjucks templates
  eleventyConfig.ignores.add("src/works/dgen-fren/**");
  eleventyConfig.addPassthroughCopy({ "src/works/dgen-fren": "works/dgen-fren" });

  // vendor: gsap (self-hosted, no CDN dependency)
  eleventyConfig.addPassthroughCopy({
    "node_modules/gsap/dist/gsap.min.js": "assets/js/vendor/gsap.min.js",
  });
  eleventyConfig.addPassthroughCopy({
    "node_modules/gsap/dist/ScrollTrigger.min.js":
      "assets/js/vendor/ScrollTrigger.min.js",
  });
  eleventyConfig.addPassthroughCopy({
    "node_modules/lenis/dist/lenis.min.js": "assets/js/vendor/lenis.min.js",
  });

  eleventyConfig.addPassthroughCopy({ "src/robots.txt": "robots.txt" });
  eleventyConfig.addPassthroughCopy({ "src/favicon.svg": "favicon.svg" });

  eleventyConfig.addFilter("altUrl", function (url, targetLang) {
    // toggles between "/" (he) <-> "/en/" (en) root prefixes for hreflang + language switch
    if (!url) return targetLang === "en" ? "/en/" : "/";
    if (targetLang === "en") {
      return url.startsWith("/en/") ? url : "/en" + url;
    }
    return url.startsWith("/en/") ? url.replace(/^\/en/, "") || "/" : url;
  });

  eleventyConfig.addFilter("stripTrailingSlash", (url) =>
    url && url !== "/" ? url.replace(/\/$/, "") : url
  );

  eleventyConfig.addShortcode("year", () => new Date().getFullYear());

  eleventyConfig.addShortcode("instagramIcon", function (size) {
    const s = size || 24;
    return `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>`;
  });

  eleventyConfig.addShortcode("whatsappIcon", function (size) {
    const s = size || 24;
    return `<svg width="${s}" height="${s}" viewBox="0 0 32 32" fill="currentColor" aria-hidden="true" focusable="false"><path d="M16.004 3C9.377 3 4 8.373 4 15c0 2.36.687 4.56 1.872 6.41L4 29l7.78-1.83A11.93 11.93 0 0 0 16.004 27C22.63 27 28 21.627 28 15S22.63 3 16.004 3Zm0 21.75c-1.94 0-3.75-.53-5.3-1.45l-.38-.22-4.62 1.09 1.11-4.5-.25-.39A9.7 9.7 0 0 1 5.25 15c0-5.93 4.82-10.75 10.754-10.75S26.75 9.07 26.75 15 21.94 24.75 16.004 24.75Zm5.93-8.02c-.32-.16-1.9-.94-2.2-1.05-.3-.11-.51-.16-.73.16-.21.32-.84 1.05-1.03 1.26-.19.21-.38.24-.7.08-.32-.16-1.36-.5-2.6-1.6-.96-.86-1.61-1.92-1.8-2.24-.19-.32-.02-.5.14-.66.14-.14.32-.38.48-.56.16-.19.21-.32.32-.53.11-.21.05-.4-.03-.56-.08-.16-.73-1.76-1-2.42-.26-.63-.53-.54-.73-.55h-.62c-.21 0-.56.08-.85.4-.29.32-1.12 1.09-1.12 2.66s1.15 3.08 1.31 3.3c.16.21 2.26 3.45 5.48 4.84.77.33 1.36.53 1.83.68.77.24 1.47.21 2.02.13.62-.09 1.9-.78 2.17-1.53.27-.75.27-1.39.19-1.53-.08-.13-.29-.21-.61-.37Z"/></svg>`;
  });

  eleventyConfig.addShortcode("facebookIcon", function (size) {
    const s = size || 24;
    return `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M14.5 8.5h-1.75A1.75 1.75 0 0 0 11 10.25V12H9v2.5h2V21h2.5v-6.5h2l.5-2.5h-2.5v-1.25c0-.41.34-.75.75-.75H16V8.5Z"/></svg>`;
  });

  eleventyConfig.addShortcode("navigationIcon", function (size) {
    const s = size || 14;
    return `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>`;
  });

  eleventyConfig.addShortcode("tiktokIcon", function (size) {
    const s = size || 24;
    return `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false"><path d="M16.5 2h-3v13.5a2.75 2.75 0 1 1-2.14-2.68v-3.07a5.83 5.83 0 1 0 5.14 5.79V8.9a7.6 7.6 0 0 0 4.5 1.46V7.36A4.6 4.6 0 0 1 16.5 2Z"/></svg>`;
  });

  eleventyConfig.addFilter("jsonify", (obj) => JSON.stringify(obj));

  eleventyConfig.setLibrary(
    "njk",
    require("nunjucks").configure([
      "src/_includes",
      "src/_includes/layouts",
      "src/_includes/partials",
      "src/_includes/macros",
    ])
  );

  return {
    dir: {
      input: "src",
      includes: "_includes",
      data: "_data",
      output: "_site",
    },
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
  };
};
