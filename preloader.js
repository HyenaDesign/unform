(() => {
  'use strict';
  const preloader = document.querySelector('[data-preloader]');
  if (!preloader) return;

  const minimumDuration = 1750;
  const startedAt = performance.now();
  let pageLoaded = document.readyState === 'complete';
  let finished = false;

  document.documentElement.classList.add('has-preloader');
  window.addEventListener('load', () => {
    pageLoaded = true;
  }, { once: true });

  const fallback = window.setTimeout(() => {
    pageLoaded = true;
  }, 8000);

  function finish() {
    if (finished) return;
    finished = true;
    window.clearTimeout(fallback);
    preloader.classList.add('is-leaving');
    window.setTimeout(() => {
      preloader.hidden = true;
      document.documentElement.classList.remove('has-preloader');
    }, 350);
  }

  function updateProgress() {
    const elapsed = performance.now() - startedAt;
    if (pageLoaded && elapsed >= minimumDuration) {
      finish();
      return;
    }
    requestAnimationFrame(updateProgress);
  }

  requestAnimationFrame(updateProgress);
})();