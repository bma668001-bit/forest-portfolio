import { joinBase } from './url';

const QR_PATH = '/images/contact/forest-wechat-qr.png';
const WIDTHS = [640, 1024, 1600] as const;

export interface ResponsiveImageSources {
  src: string;
  srcset: string;
}

export function responsiveImageSources(src: string, base: string): ResponsiveImageSources | null {
  if (src === QR_PATH || !src.startsWith('/images/')) return null;

  const relative = src.slice('/images/'.length).replace(/\.(?:png|jpe?g|webp)$/i, '');
  const urls = WIDTHS.map((width) => joinBase(base, `images/optimized/${relative}-${width}.webp`));

  return {
    src: urls[1],
    srcset: urls.map((url, index) => `${url} ${WIDTHS[index]}w`).join(', '),
  };
}

