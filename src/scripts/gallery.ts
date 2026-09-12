const gallery = document.querySelector<HTMLElement>('[data-gallery]');

if (gallery) {
  const filters = [...document.querySelectorAll<HTMLButtonElement>('button[data-filter-group][data-filter-value]')];
  const items = [...gallery.querySelectorAll<HTMLElement>('[data-visual]')];
  const lightboxTriggers = [...document.querySelectorAll<HTMLButtonElement>('[data-lightbox-trigger]')];
  const empty = document.querySelector<HTMLElement>('[data-gallery-empty]');
  const dialog = document.querySelector<HTMLDialogElement>('[data-lightbox]');
  const dialogImage = dialog?.querySelector<HTMLImageElement>('[data-lightbox-image]');
  const title = dialog?.querySelector<HTMLElement>('[data-lightbox-title]');
  const description = dialog?.querySelector<HTMLElement>('[data-lightbox-description]');
  const era = dialog?.querySelector<HTMLElement>('[data-lightbox-era]');
  const tools = dialog?.querySelector<HTMLElement>('[data-lightbox-tools]');
  const stage = dialog?.querySelector<HTMLElement>('[data-lightbox-stage]');
  const count = document.querySelector<HTMLElement>('[data-gallery-count]');
  const more = document.querySelector<HTMLButtonElement>('[data-gallery-more]');
  const batchSize = 8;
  let activeCategory = '全部';
  let visibleLimit = batchSize;
  const eraLabels: Record<string, string> = {
    'pre-ai': 'AI 前',
    'ai-assisted': 'AI 辅助',
    hybrid: '混合制作',
  };
  let lastTrigger: HTMLButtonElement | null = null;
  let activeIndex = 0;
  let activeGroup = 'ai-archive';
  let swipeStart: { pointerId: number; x: number; y: number } | null = null;

  const matchingItems = () => items.filter((item) => (
    activeCategory === '全部' || item.dataset.category === activeCategory
  ));

  const render = () => {
    const matches = matchingItems();
    const shown = Math.min(visibleLimit, matches.length);
    const visibleItems = new Set(matches.slice(0, shown));
    items.forEach((item) => { item.hidden = !visibleItems.has(item); });
    if (count) count.textContent = `已展示 ${shown} / ${matches.length}`;
    if (more) more.hidden = shown >= matches.length;
    if (empty) empty.hidden = matches.length > 0;
  };

  filters.forEach((button) => button.addEventListener('click', () => {
    if (button.dataset.filterGroup !== 'category') return;
    activeCategory = button.dataset.filterValue ?? '全部';
    visibleLimit = batchSize;
    filters
      .forEach((candidate) => candidate.setAttribute('aria-pressed', String(candidate === button)));
    render();
  }));

  more?.addEventListener('click', () => {
    visibleLimit += batchSize;
    render();
  });

  const visibleTriggers = () => lightboxTriggers.filter((trigger) => (
    trigger.dataset.lightboxGroup === activeGroup && !trigger.closest<HTMLElement>('[hidden]')
  ));

  const show = (trigger: HTMLButtonElement) => {
    if (!dialog || !dialogImage || !title || !description || !era || !tools) return;
    activeGroup = trigger.dataset.lightboxGroup ?? 'ai-archive';
    const triggers = visibleTriggers();
    activeIndex = Math.max(0, triggers.indexOf(trigger));
    if (!dialog.open) lastTrigger = trigger;
    dialogImage.src = trigger.dataset.src ?? '';
    dialogImage.alt = trigger.dataset.alt ?? '';
    dialogImage.width = Number(trigger.dataset.width) || 1600;
    dialogImage.height = Number(trigger.dataset.height) || 1000;
    const preserveNaturalSize = trigger.dataset.originalLimit === 'true';
    dialogImage.style.maxWidth = preserveNaturalSize ? `${dialogImage.width}px` : '';
    dialogImage.style.maxHeight = preserveNaturalSize ? `${dialogImage.height}px` : '';
    title.textContent = trigger.dataset.title ?? '';
    description.textContent = trigger.dataset.description ?? '';
    era.textContent = eraLabels[trigger.dataset.era ?? ''] ?? trigger.dataset.era ?? '';
    tools.textContent = trigger.dataset.tools || '未记录';
    if (!dialog.open) dialog.showModal();
  };

  const move = (offset: number) => {
    const triggers = visibleTriggers();
    if (!triggers.length) return;
    activeIndex = (activeIndex + offset + triggers.length) % triggers.length;
    show(triggers[activeIndex]);
  };

  lightboxTriggers.forEach((trigger) => trigger.addEventListener('click', (event) => show(event.currentTarget as HTMLButtonElement)));
  dialog?.querySelector('[data-lightbox-close]')?.addEventListener('click', () => dialog.close());
  dialog?.querySelector('[data-lightbox-previous]')?.addEventListener('click', () => move(-1));
  dialog?.querySelector('[data-lightbox-next]')?.addEventListener('click', () => move(1));
  dialog?.addEventListener('click', (event) => { if (event.target === dialog) dialog.close(); });
  dialog?.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      move(-1);
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      move(1);
    }
  });
  dialog?.addEventListener('close', () => window.requestAnimationFrame(() => lastTrigger?.focus()));
  stage?.addEventListener('pointerdown', (event) => {
    if (!event.isPrimary) return;
    swipeStart = { pointerId: event.pointerId, x: event.clientX, y: event.clientY };
  });
  stage?.addEventListener('pointerup', (event) => {
    if (!swipeStart || event.pointerId !== swipeStart.pointerId) return;
    const deltaX = event.clientX - swipeStart.x;
    const deltaY = event.clientY - swipeStart.y;
    swipeStart = null;
    if (Math.abs(deltaX) >= 56 && Math.abs(deltaY) < 48) move(deltaX < 0 ? 1 : -1);
  });
  stage?.addEventListener('pointercancel', () => { swipeStart = null; });
  render();
}
