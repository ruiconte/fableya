// Tous les styles passent par Seedream 4.5 (cf. generator.py, VISUAL_STYLE_PROMPTS —
// garder les deux listes synchronisees). 'custom' = style deduit d'images de reference.
export const VISUAL_STYLES = [
  { value: 'aquarelle', emoji: '🎨', prompt: 'soft watercolor illustration, fluid transparent color washes, visible paper texture, delicate color bleeding at edges, loose expressive brushwork, luminous pastel tones, painted in watercolor' },
  { value: 'cartoon', emoji: '🌈', prompt: 'bright flat color cartoon illustration, bold clean black outlines, cel-shaded style, vibrant saturated colors, smooth vector-like shapes, playful cartoon art, clean graphic style' },
  { value: 'conte', emoji: '🏡', prompt: 'classic golden age fairy tale illustration, Arthur Rackham style, detailed pen and ink drawing with soft color wash, vintage storybook engraving, intricate linework, ornate decorative style' },
  { value: 'pastel', emoji: '✨', prompt: 'soft chalky pastel illustration, matte blended texture, dreamy hazy atmosphere, muted romantic color palette, gentle soft gradients, impressionistic softness, pastel crayon art' },
  { value: 'album', emoji: '📖', prompt: 'modern picture book illustration, clean bold geometric shapes, flat graphic design, primary color palette, Scandinavian minimalist style, contemporary children book art, crisp shapes' },
  { value: 'manga', emoji: '⛩️', prompt: 'manga illustration, bold black ink outlines, cel-shaded, vibrant colors, Japanese comic book style, dynamic pose, children\'s book style' },
  { value: 'papercut', emoji: '✂️', prompt: 'paper cutout collage illustration, layered flat colored paper shapes, simple drop shadows, craft paper texture, children\'s book style' },
  { value: 'vintage', emoji: '🕰️', prompt: 'vintage engraving illustration, fine crosshatch linework, sepia and muted colors, classic 19th century storybook style, detailed' },
  { value: 'anim3d', emoji: '🎬', prompt: '3D animated feature film style, soft subsurface-scattering skin, big expressive eyes, warm cinematic lighting, polished rounded shapes, family animation movie render, children\'s story' },
  { value: 'clay', emoji: '🧸', prompt: 'claymation stop-motion style, handmade plasticine clay characters and set, visible fingerprints in the clay, miniature diorama, warm studio lighting, tactile textures' },
  { value: 'feutre', emoji: '🧶', prompt: 'needle-felted wool and stitched fabric craft illustration, fuzzy felt characters, embroidered details, handmade textile diorama, cozy soft lighting, tactile fibers' },
  { value: 'crayon', emoji: '🖍️', prompt: 'colored pencil and wax crayon children\'s drawing style, visible pencil hatching, warm paper grain, hand-drawn textured strokes, naive and cheerful' },
  { value: 'peinture', emoji: '🖼️', prompt: 'classic oil painting illustration, rich impasto brushwork, warm glowing light, painterly storybook art, luminous colors' },
  { value: 'anime', emoji: '🌸', prompt: 'hand-painted anime feature film style, lush painted natural backgrounds, soft cinematic light, gentle expressive characters, dreamy atmosphere' },
  { value: 'linogravure', emoji: '🪵', prompt: 'linocut block print illustration, bold carved shapes, limited two or three ink colors, rough print texture on cream paper, folk art storybook' },
  { value: 'custom', emoji: '🖼️', prompt: '' },
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
