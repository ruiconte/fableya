export const MAX_CHARACTERS = 5

export type BookStatus = 'pending' | 'pending_payment' | 'queued' | 'paid' | 'preview_generating' | 'preview_ready' | 'generating' | 'completed' | 'failed'

export type CharacterType = 'human' | 'animal' | 'creature' | 'other'
export type CharacterRole = 'main' | 'friend' | 'sibling' | 'parent' | 'grandparent' | 'companion' | 'rival' | 'supporting' | 'other'
export type CharacterGender = 'male' | 'female' | 'unspecified'

export interface Character {
  id: string
  name: string             // required, max 50
  type: CharacterType
  role: CharacterRole
  age?: string             // optional free text — "7 ans", "bébé", irrelevant for animals
  gender?: CharacterGender
  appearance?: string      // max 300
  personality: string[]    // preset keys
  personalityCustom?: string // max 200
  clothing?: string        // max 200
}

export type VisualStyle = 'aquarelle' | 'cartoon' | 'conte' | 'pastel' | 'album' | 'custom'

export type BookLanguage = 'fr' | 'en' | 'ja' | 'es' | 'de' | 'it' | 'pt'

export type CreationMode = 'quick' | 'advanced'

export interface BookFormData {
  // ── Legacy fields — kept for quick mode + n8n backward compat ──
  child_name: string
  child_age: number
  // ── New multi-character list (advanced mode) ──
  characters?: Character[]
  // ── Rest unchanged ──
  genre: string
  favorite_character: string
  moral_value: string
  visual_style: VisualStyle
  language: BookLanguage
  custom_story_idea: string
  creation_mode: CreationMode
  style_profile?: import('./providers/types').StyleProfile
}

export interface Book {
  id: string
  user_id: string
  title: string
  status: BookStatus
  form_data: BookFormData
  cover_url: string | null
  pdf_url: string | null
  stripe_session_id: string | null
  created_at: string
  updated_at: string
}

export interface BookPage {
  id: string
  book_id: string
  page_number: number
  image_url: string | null
  text: string
  created_at: string
}

export interface Profile {
  id: string
  email: string
  display_name: string | null
  avatar_url: string | null
  created_at: string
}
