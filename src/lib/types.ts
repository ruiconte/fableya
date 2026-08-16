export type BookStatus = 'pending' | 'pending_payment' | 'paid' | 'preview_generating' | 'preview_ready' | 'generating' | 'completed' | 'failed'

export type VisualStyle = 'aquarelle' | 'cartoon' | 'conte' | 'pastel' | 'album'

export type BookLanguage = 'fr' | 'en' | 'ja' | 'es' | 'de' | 'it' | 'pt'

export type CreationMode = 'quick' | 'advanced'

export interface BookFormData {
  child_name: string
  child_age: number
  genre: string
  favorite_character: string
  moral_value: string
  visual_style: VisualStyle
  language: BookLanguage
  custom_story_idea: string
  creation_mode: CreationMode
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
