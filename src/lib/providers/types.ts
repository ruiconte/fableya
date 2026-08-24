export interface ExternalStyleReference {
  provider: 'met'
  externalId: string
  title: string
  creator: string
  thumbnailUrl: string
  imageUrl: string
  sourceUrl: string
  medium: string
  period: string
  tags: string[]
  attribution: string
  generatedPrompt: string
}

export interface StyleProfile {
  references: ExternalStyleReference[]  // 1–10 selected images
  generatedPrompt: string               // blended prompt sent to generation
}

export interface ProviderSearchResult {
  items: ExternalStyleReference[]
  total: number
}
