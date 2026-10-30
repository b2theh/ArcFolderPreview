// ==UserScript==
// @name           Arc Folder Preview
// @version        1.0.1
// @description    Show only native relative time in folder preview subtitles.
// @include        chrome://browser/content/browser.xhtml
// ==/UserScript==

(() => {
  "use strict";
  if (location.href !== "chrome://browser/content/browser.xhtml") return;
  window.arcFolderPreview?.destroy();
  const popup = document.getElementById("zen-folder-tabs-popup");
  if (!popup) return;

  // Zen populates the list synchronously before opening this panel.
  // Keep its native timestamps, localization, tab order and event handlers.
  const originals = new Map();
  function decorate(event) {
    if (event.target !== popup) return;
    originals.clear();
    for (const label of popup.querySelectorAll(".tab-list-item-secondary-label")) {
      const original = label.textContent;
      const separator = original.indexOf(" • ");
      if (separator < 0) continue;
      const shortened = original.slice(0, separator);
      originals.set(label, { original, shortened });
      label.textContent = shortened;
    }
  }

  function restore() {
    for (const [label, { original, shortened }] of originals) {
      if (label.textContent === shortened) label.textContent = original;
    }
    originals.clear();
  }

  const controller = {
    destroy() {
      popup.removeEventListener("popupshowing", decorate);
      popup.removeEventListener("popuphidden", onHidden);
      window.removeEventListener("unload", controller.destroy);
      restore();
      if (window.arcFolderPreview === controller) delete window.arcFolderPreview;
    },
  };
  function onHidden(event) {
    if (event.target === popup) restore();
  }
  window.arcFolderPreview = controller;
  popup.addEventListener("popupshowing", decorate);
  popup.addEventListener("popuphidden", onHidden);
  window.addEventListener("unload", controller.destroy, { once: true });
  if (typeof window.addUnloadListener === "function") window.addUnloadListener(controller.destroy);
})();
