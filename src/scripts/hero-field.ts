type Dot = { x: number; y: number; vx: number; vy: number; size: number; tone: string };

document.querySelectorAll<HTMLElement>('[data-hero-field]').forEach((field) => {
  const canvas = field.querySelector<HTMLCanvasElement>('canvas');
  const context = canvas?.getContext('2d');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!canvas || !context || reduced) {
    field.dataset.motion = 'reduced';
    return;
  }

  field.dataset.motion = 'active';
  let width = 0;
  let height = 0;
  let frame = 0;
  let visible = true;
  let pointerX = -1000;
  let pointerY = -1000;
  let dots: Dot[] = [];

  const reset = () => {
    const rect = field.getBoundingClientRect();
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    width = rect.width;
    height = rect.height;
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    const count = width < 720 ? 18 : 42;
    dots = Array.from({ length: count }, (_, index) => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.22,
      vy: (Math.random() - 0.5) * 0.22,
      size: 1.5 + Math.random() * 3,
      tone: index % 4 === 0 ? '#a85f3b' : '#c6a36a',
    }));
  };

  const draw = () => {
    if (!visible) return;
    context.clearRect(0, 0, width, height);
    dots.forEach((dot, index) => {
      const dx = dot.x - pointerX;
      const dy = dot.y - pointerY;
      const pointerDistance = Math.hypot(dx, dy);
      if (pointerDistance < 180 && pointerDistance > 0) {
        dot.vx += (dx / pointerDistance) * 0.008;
        dot.vy += (dy / pointerDistance) * 0.008;
      }
      dot.vx = Math.max(-0.3, Math.min(0.3, dot.vx));
      dot.vy = Math.max(-0.3, Math.min(0.3, dot.vy));
      dot.x += dot.vx;
      dot.y += dot.vy;
      if (dot.x < 0 || dot.x > width) dot.vx *= -1;
      if (dot.y < 0 || dot.y > height) dot.vy *= -1;
      context.beginPath();
      context.fillStyle = dot.tone;
      context.arc(dot.x, dot.y, dot.size, 0, Math.PI * 2);
      context.fill();
      for (let next = index + 1; next < dots.length; next += 1) {
        const other = dots[next];
        const distance = Math.hypot(dot.x - other.x, dot.y - other.y);
        if (distance < 135) {
          context.beginPath();
          context.strokeStyle = `rgba(90,64,50,${(1 - distance / 135) * 0.22})`;
          context.moveTo(dot.x, dot.y);
          context.lineTo(other.x, other.y);
          context.stroke();
        }
      }
    });
    frame = window.requestAnimationFrame(draw);
  };

  const observer = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible && !frame) draw();
    if (!visible && frame) { cancelAnimationFrame(frame); frame = 0; }
  });
  field.addEventListener('pointermove', (event) => {
    const rect = field.getBoundingClientRect();
    pointerX = event.clientX - rect.left;
    pointerY = event.clientY - rect.top;
  });
  field.addEventListener('pointerleave', () => { pointerX = -1000; pointerY = -1000; });
  window.addEventListener('resize', reset, { passive: true });
  reset();
  observer.observe(field);
  draw();
});
