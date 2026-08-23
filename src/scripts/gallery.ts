const gallery = document.querySelector<HTMLElement>('[data-gallery]');

if (gallery) {
  const filters = [...document.querySelectorAll<HTMLButtonElement>('button[data-filter-group][data-filter-value]')];
  const items = [...gallery.querySelectorAll<HTMLElement>('[data-visual]')];
  const empty = document.querySelector<HTMLElement>('[data-gallery-empty]');
  const dialog = document.querySelector<HTMLDialogElement>('[data-lightbox]');
  const dialogImage = dialog?.querySelector<HTMLImageElement>('[data-lightbox-image]');
  const title = dialog?.querySelector<HTMLElement>('[data-lightbox-title]');
  const description = dialog?.querySelector<HTMLElement>('[data-lightbox-description]');
  const era = dialog?.querySelector<HTMLElement>('[data-lightbox-era]');
  const tools = dialog?.querySelector<HTMLElement>('[data-lightbox-tools]');
  const stage = dialog?.querySelector<HTMLElement>('[data-lightbox-stage]');
  const activeFilters = { category: '全部', era: '全部' };
  const eraLabels: Record<string, string> = {
    'pre-ai': 'AI 前',
    'ai-assisted': 'AI 辅助',
    hybrid: '混合制作',
  };
  let lastTrigger: HTMLButtonElement | null = null;
  let activeIndex = 0;
  let swipeStart: { pointerId: number; x: number; y: number } | null = null;

  const applyFilters = () => {
    let visibleCount = 0;
    items.forEach((item) => {
      const matchesCategory = activeFilters.category === '全部' || item.dataset.category === activeFilters.category;
      const matchesEra = activeFilters.era === '全部' || item.dataset.era === activeFilters.era;
      const showItem = matchesCategory && matchesEra;
      item.hidden = !showItem;
      if (showItem) visibleCount += 1;
    });
    if (empty) empty.hidden = visibleCount > 0;
  };

  filters.forEach((button) => button.addEventListener('click', () => {
    const group = button.dataset.filterGroup;
    if (group !== 'category' && group !== 'era') return;
    activeFilters[group] = button.dataset.filterValue ?? '全部';
    filters
      .filter((candidate) => candidate.dataset.filterGroup === group)
      .forEach((candidate) => candidate.setAttribute('aria-pressed', String(candidate === button)));
    applyFilters();
  }));

  const visibleTriggers = () => items
    .filter((item) => !item.hidden)
    .map((item) => item.querySelector<HTMLButtonElement>('[data-lightbox-trigger]'))
    .filter((trigger): trigger is HTMLButtonElement => Boolean(trigger));

  const show = (trigger: HTMLButtonElement) => {
    if (!dialog || !dialogImage || !title || !description || !era || !tools) return;
    const triggers = visibleTriggers();
    activeIndex = Math.max(0, triggers.indexOf(trigger));
    lastTrigger = trigger;
    dialogImage.src = trigger.dataset.src ?? '';
    dialogImage.alt = trigger.dataset.alt ?? '';
    dialogImage.width = Number(trigger.dataset.width) || 1600;
    dialogImage.height = Number(trigger.dataset.height) || 1000;
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

  items.forEach((item) => item.querySelector<HTMLButtonElement>('[data-lightbox-trigger]')?.addEventListener('click', (event) => show(event.currentTarget as HTMLButtonElement)));
  dialog?.querySelector('[data-lightbox-close]')?.addEventListener('click', () => dialog.close());
  dialog?.querySelector('[data-lightbox-previous]')?.addEventListener('click', () => move(-1));
  dialog?.querySelector('[data-lightbox-next]')?.addEventListener('click', () => move(1));
  dialog?.addEventListener('click', (event) => { if (event.target === dialog) dialog.close(); });
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
}
