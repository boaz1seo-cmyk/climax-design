(function () {
  "use strict";

  /* ---------------------------------------------------------
     Typographic rule: never leave a single word alone on the
     last line of a text block. Join the last two words with a
     non-breaking space so they always wrap together — the last
     line will have at least two words, whatever the viewport.
     Only touches the final text node of each element, so nested
     inline elements (nowrap names, arrow icons, links) are left
     untouched.
     --------------------------------------------------------- */

  var SELECTOR =
    "h1, h2, h3, .prose, .feature__body, .eyebrow, .quote__text, .display-heading, .hero__headline-line";

  var NBSP = " ";

  var lastTextNode = function (el) {
    var walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null);
    var last = null;
    var node;
    while ((node = walker.nextNode())) {
      if (node.nodeValue.trim().length) last = node;
    }
    return last;
  };

  document.querySelectorAll(SELECTOR).forEach(function (el) {
    // Skip ancestors of another match (e.g. an h1 wrapping several
    // .hero__headline-line spans) — only the innermost element should
    // own its last text node, or it gets processed twice.
    if (el.querySelector(SELECTOR)) return;

    var node = lastTextNode(el);
    if (!node) return;

    var text = node.nodeValue;
    var trimmedEnd = text.replace(/\s+$/, "");
    var trailingWhitespace = text.slice(trimmedEnd.length);
    var lastSpace = trimmedEnd.lastIndexOf(" ");
    if (lastSpace === -1) return;

    node.nodeValue = trimmedEnd.slice(0, lastSpace) + NBSP + trimmedEnd.slice(lastSpace + 1) + trailingWhitespace;
  });
})();
