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

const QUESTION_IMAGE_SUFFIX =
  ' Important: Show only the diagram or figure. Do not include any text, equations, numbers, or labels that state or imply the answer to a question.';

/**
 * Generate an image via Puter.js GPT Image and return a storable data URL.
 * Requires Puter script to be loaded (e.g. loadPuterScript()).
 * @param prompt - Description for the image.
 * @param isQuestionImage - If true, appends an instruction so the image never shows the answer or hints (use for picture_based questions).
 */
export async function generateImageWithPuter(
  prompt: string,
  isQuestionImage = false
): Promise<string | null> {
  const puter = await loadPuterScript();
  if (!puter?.ai?.txt2img) return null;
  const fullPrompt = prompt.trim().slice(0, 4000) || 'Educational illustration.';
  const finalPrompt = isQuestionImage ? fullPrompt + QUESTION_IMAGE_SUFFIX : fullPrompt;
  try {
    const img = await puter.ai.txt2img(finalPrompt, {
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
