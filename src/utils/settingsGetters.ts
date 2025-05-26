export function getLanguageName(code: string): string {
  const languages: Record<string, string> = {
    en: '🇺🇸 English',
    es: '🇪🇸 Spanish',
    ru: '🇷🇺 Russian',
    de: '🇩🇪 German',
  };

  return languages[code] || code;
}

export function getGasPriorityName(priority: string): string {
  const priorities: Record<string, string> = {
    fast: '🐢 Fast',
    standard: '⚡ Standard',
    instant: '🚀 Instant',
  };

  return priorities[priority] || priority;
}

export function getSlippageName(slippage: string): string {
  const slippages: Record<string, string> = {
    '0.5': '0.5%',
    '1': '1%',
    '2': '2%',
    '3': '3%',
  };
  return slippages[slippage] || slippage;
}
