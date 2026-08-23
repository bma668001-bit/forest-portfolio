const targets = [...document.querySelectorAll<HTMLElement>('[data-reveal]')];

if (targets.length) {
  document.documentElement.classList.add('reveal-ready');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reduced || !('IntersectionObserver' in window)) {
    targets.forEach((target) => { target.dataset.revealState = 'visible'; });
  } else {
    targets.forEach((target) => { target.dataset.revealState = 'pending'; });
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const target = entry.target as HTMLElement;
        target.dataset.revealState = 'visible';
        observer.unobserve(target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });
    targets.forEach((target) => observer.observe(target));
  }
}
