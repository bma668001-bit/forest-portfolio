const gallery = document.querySelector<HTMLElement>('[data-gallery]');

if (gallery) {
  const filters = [...document.querySelectorAll<HTMLButtonElement>('[data-filter]')];
  const items = [...gallery.querySelectorAll<HTMLElement>('[data-visual]')];
  const empty = document.querySelector<HTMLElement>('[data-gallery-empty]');
  const dialog = document.querySelector<HTMLDialogElement>('[data-lightbox]');
  const dialogImage = dialog?.querySelector<HTMLImageElement>('[data-lightbox-image]');
  const caption = dialog?.querySelector<HTMLElement>('[data-lightbox-caption]');
  let lastTrigger: HTMLButtonElement | null = null;
  let activeIndex = 0;

  filters.forEach((button) => button.addEventListener('click', () => {
    const selected = button.dataset.filter ?? '全部';
    filters.forEach((candidate) => candidate.setAttribute('aria-pressed', String(candidate === button)));
    let visibleCount = 0;
    items.forEach((item) => {
      const showItem = selected === '全部' || item.dataset.category === selected;
      item.hidden = !showItem;
      if (showItem) visibleCount += 1;
    });
    if (empty) empty.hidden = visibleCount > 0;
  }));

  const visibleTriggers = () => items
    .filter((item) => !item.hidden)
    .map((item) => item.querySelector<HTMLButtonElement>('[data-lightbox-trigger]'))
    .filter((trigger): trigger is HTMLButtonElement => Boolean(trigger));

  const show = (trigger: HTMLButtonElement) => {
    if (!dialog || !dialogImage || !caption) return;
    const triggers = visibleTriggers();
    activeIndex = Math.max(0, triggers.indexOf(trigger));
    lastTrigger = trigger;
    dialogImage.src = trigger.dataset.src ?? '';
    dialogImage.alt = trigger.dataset.alt ?? '';
    dialogImage.width = Number(trigger.dataset.width) || 1600;
    dialogImage.height = Number(trigger.dataset.height) || 1000;
    caption.textContent = trigger.dataset.caption ?? '';
    if (!dialog.open) dialog.showModal();
  };

  const move = (offset: number) => {
    const triggers = visibleTriggers();
    if (!triggers.length) return;
    activeIndex = (activeIndex + offset + triggers.length) % triggers.length;
    show(triggers[activeIndex]);
  };

  items.forEach((item) => item.querySelector<HTMLButtonElement>('[data-lightbox-trigger]')?.addEventListener('click', (event) => show(event.currentTarget as HTMLButtonElement)));
  dialog?.querySelector('[data-lightbox-close]')?.addEventListener('click', () => dialog.close());
  dialog?.querySelector('[data-lightbox-previous]')?.addEventListener('click', () => move(-1));
  dialog?.querySelector('[data-lightbox-next]')?.addEventListener('click', () => move(1));
  dialog?.addEventListener('click', (event) => { if (event.target === dialog) dialog.close(); });
  dialog?.addEventListener('close', () => window.requestAnimationFrame(() => lastTrigger?.focus()));
}
