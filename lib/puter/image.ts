const PUTER_SCRIPT = 'https://js.puter.com/v2/';

declare global {
  interface Window {
    puter?: {
      ai: {
        txt2img: (
          prompt: string,
          options?: { model?: string; quality?: string }
        ) => Promise<HTMLImageElement>;
      };
    };
  }
}

export function loadPuterScript(): Promise<Window['puter']> {
  if (typeof window === 'undefined') return Promise.resolve(undefined);
  if (window.puter) return Promise.resolve(window.puter);
  return new Promise((resolve) => {
    const existing = document.querySelector(`script[src="${PUTER_SCRIPT}"]`);
    if (existing) {
      const check = () => (window.puter ? resolve(window.puter) : setTimeout(check, 50));
      check();
      return;
    }
    const script = document.createElement('script');
    script.src = PUTER_SCRIPT;
    script.async = true;
    script.onload = () => resolve(window.puter);
    script.onerror = () => resolve(undefined);
    document.head.appendChild(script);
  });
}

function blobUrlToDataUrl(blobUrl: string): Promise<string> {
  return fetch(blobUrl)
    .then((r) => r.blob())
    .then(
      (blob) =>
        new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        })
    );
}

/** Prefer gpt-image-1.5 (latest), fallback gpt-image-1. Quality medium for speed/size. */
const PUTER_MODEL = 'gpt-image-1.5';
const PUTER_QUALITY = 'medium';

/**
 * Generate an image via Puter.js GPT Image and return a storable data URL.
 * Requires Puter script to be loaded (e.g. loadPuterScript()).
 */
export async function generateImageWithPuter(prompt: string): Promise<string | null> {
  const puter = await loadPuterScript();
  if (!puter?.ai?.txt2img) return null;
  try {
    const img = await puter.ai.txt2img(prompt.trim().slice(0, 4000) || 'Educational illustration.', {
      model: PUTER_MODEL,
      quality: PUTER_QUALITY,
    });
    if (!img?.src) return null;
    if (img.src.startsWith('blob:')) return await blobUrlToDataUrl(img.src);
    return img.src;
  } catch (e) {
    console.error('Puter image generation failed:', e);
    return null;
  }
}
