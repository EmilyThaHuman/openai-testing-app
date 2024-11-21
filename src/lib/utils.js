import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const fadeInAnimation = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: 'easeOut' }
}

export const floatAnimation = {
  initial: { y: 0 },
  animate: {
    y: [-10, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: 'easeInOut'
    }
  }
}

export function formatDate(input) {
  const date = new Date(input);
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function getMediaTypeFromDataURL(dataURL) {
  const matches = dataURL.match(/^data:([A-Za-z-+/]+);base64/);
  return matches ? matches[1] : null;
}

export function getBase64FromDataURL(dataURL) {
  const matches = dataURL.match(/^data:[A-Za-z-+/]+;base64,(.*)$/);
  return matches ? matches[1] : null;
}
