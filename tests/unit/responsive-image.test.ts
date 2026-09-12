import { describe, expect, it } from 'vitest';
import { responsiveImageSources } from '../../src/lib/responsive-image';

describe('responsiveImageSources', () => {
  it('creates base-aware mobile, tablet, and desktop WebP candidates', () => {
    expect(responsiveImageSources('/images/visuals/commercial/cm-02.jpg', '/forest-portfolio/')).toEqual({
      src: '/forest-portfolio/images/optimized/visuals/commercial/cm-02-1024.webp',
      srcset: '/forest-portfolio/images/optimized/visuals/commercial/cm-02-640.webp 640w, /forest-portfolio/images/optimized/visuals/commercial/cm-02-1024.webp 1024w, /forest-portfolio/images/optimized/visuals/commercial/cm-02-1600.webp 1600w',
    });
  });

  it('does not optimize the QR code', () => {
    expect(responsiveImageSources('/images/contact/forest-wechat-qr.png', '/')).toBeNull();
  });
});

