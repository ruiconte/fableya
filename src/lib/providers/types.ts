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
  reference: ExternalStyleReference
  generatedPrompt: string
}

export interface ProviderSearchResult {
  items: ExternalStyleReference[]
  total: number
}
