import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDuration(ms: number): string {
  const minutes = Math.floor(ms / 60000);
  const seconds = ((ms % 60000) / 1000).toFixed(0);
  return `${minutes}:${Number(seconds) < 10 ? '0' : ''}${seconds}`;
}

export const generateRandomColor = () => {
  const colors = [
    'bg-red-500', 'bg-orange-500', 'bg-amber-500', 
    'bg-green-500', 'bg-emerald-500', 'bg-teal-500',
    'bg-cyan-500', 'bg-blue-500', 'bg-indigo-500', 
    'bg-violet-500', 'bg-purple-500', 'bg-fuchsia-500', 
    'bg-pink-500', 'bg-rose-500'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

// Simple obfuscation/encryption for local storage
// Note: In a purely client-side app, 'true' encryption requires a user password every session.
// This provides obfuscation to prevent plain-text reading from local storage.
const SALT = "MELODY_FLOW_SECURE_SALT_v1_";

export const encryptData = (text: string): string => {
  if (!text) return "";
  try {
    // Double Base64 encoding with salt injection
    const firstPass = btoa(text);
    return btoa(SALT + firstPass);
  } catch (e) {
    console.error("Encryption failed", e);
    return text;
  }
};

export const decryptData = (encrypted: string): string => {
  if (!encrypted) return "";
  try {
    const firstPass = atob(encrypted);
    if (firstPass.startsWith(SALT)) {
      return atob(firstPass.replace(SALT, ""));
    }
    return atob(firstPass); // Fallback for legacy
  } catch (e) {
    return encrypted; // Return raw if decryption fails (backward compatibility)
  }
};