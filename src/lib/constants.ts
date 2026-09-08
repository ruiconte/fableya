// pipeline: 'klein' = Klein 4B + PuLID (character consistency, painted styles)
//           'chroma' = Chroma1-HD (style fidelity, flat/graphic styles)
// loraToken: trigger word for the fbyaflat LoRA (added once trained)
export const VISUAL_STYLES = [
  {
    value: 'aquarelle',
    emoji: '🎨',
    pipeline: 'klein' as const,
    prompt: 'soft watercolor illustration, fluid transparent color washes, visible paper texture, delicate color bleeding at edges, loose expressive brushwork, luminous pastel tones, painted in watercolor',
  },
  {
    value: 'cartoon',
    emoji: '🌈',
    pipeline: 'klein' as const,
    loraToken: 'fbyaflat',
    prompt: 'fbyaflat style illustration, bright flat color cartoon, bold clean black outlines, cel-shaded style, vibrant saturated colors, smooth vector-like shapes, playful cartoon art, clean graphic style',
  },
  {
    value: 'conte',
    emoji: '🏡',
    pipeline: 'klein' as const,
    prompt: 'classic golden age fairy tale illustration, Arthur Rackham style, detailed pen and ink drawing with soft color wash, vintage storybook engraving, intricate linework, ornate decorative style',
  },
  {
    value: 'pastel',
    emoji: '✨',
    pipeline: 'klein' as const,
    prompt: 'soft chalky pastel illustration, matte blended texture, dreamy hazy atmosphere, muted romantic color palette, gentle soft gradients, impressionistic softness, pastel crayon art',
  },
  {
    value: 'album',
    emoji: '📖',
    pipeline: 'klein' as const,
    loraToken: 'fbyaflat',
    prompt: 'fbyaflat style illustration, modern picture book, clean bold geometric shapes, flat graphic design, primary color palette, Scandinavian minimalist style, contemporary children book art, crisp shapes',
  },
  {
    value: 'manga',
    emoji: '⛩️',
    pipeline: 'klein' as const,
    prompt: 'manga illustration, bold black ink outlines, cel-shaded, vibrant colors, Japanese comic book style, dynamic pose, children\'s book style',
  },
  {
    value: 'papercut',
    emoji: '✂️',
    pipeline: 'klein' as const,
    prompt: 'paper cutout collage illustration, layered flat colored paper shapes, simple drop shadows, craft paper texture, children\'s book style',
  },
  {
    value: 'vintage',
    emoji: '🕰️',
    pipeline: 'klein' as const,
    prompt: 'vintage engraving illustration, fine crosshatch linework, sepia and muted colors, classic 19th century storybook style, detailed',
  },
  {
    value: 'custom',
    emoji: '🖼️',
    pipeline: 'chroma' as const,
    prompt: '',
  },
] as const

export const MORAL_VALUES = [
  { value: 'courage', emoji: '🦁' },
  { value: 'amitie', emoji: '🤝' },
  { value: 'confiance', emoji: '⭐' },
  { value: 'partage', emoji: '🎁' },
  { value: 'bonte', emoji: '💛' },
  { value: 'perseverance', emoji: '🌱' },
  { value: 'respect', emoji: '🌸' },
  { value: 'curiosite', emoji: '🔭' },
] as const

export const GENRES = [
  { value: 'aventure', emoji: '🗺️' },
  { value: 'magie', emoji: '🧚' },
  { value: 'nature', emoji: '🌿' },
  { value: 'espace', emoji: '🚀' },
  { value: 'ocean', emoji: '🌊' },
  { value: 'quotidien', emoji: '🏠' },
] as const

// Languages available for the book content (7 languages)
export const BOOK_LANGUAGES = [
  { value: 'fr', flag: '🇫🇷' },
  { value: 'en', flag: '🇬🇧' },
  { value: 'ja', flag: '🇯🇵' },
  { value: 'es', flag: '🇪🇸' },
  { value: 'de', flag: '🇩🇪' },
  { value: 'it', flag: '🇮🇹' },
  { value: 'pt', flag: '🇵🇹' },
] as const

export const BOOK_PRICE_EUR = 5
