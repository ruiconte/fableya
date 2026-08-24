import { useState } from 'react'
import type { Character, CharacterType, CharacterRole, CharacterGender } from '../lib/types'
import { MAX_CHARACTERS } from '../lib/types'

// ── Static data ────────────────────────────────────────────────────────────────

const CHARACTER_TYPES: { key: CharacterType; label: string }[] = [
  { key: 'human',    label: 'Humain' },
  { key: 'animal',   label: 'Animal' },
  { key: 'creature', label: 'Créature' },
  { key: 'other',    label: 'Autre' },
]

const CHARACTER_ROLES: { key: CharacterRole; label: string }[] = [
  { key: 'main',       label: 'Personnage principal' },
  { key: 'friend',     label: 'Ami·e' },
  { key: 'sibling',    label: 'Frère / Sœur' },
  { key: 'parent',     label: 'Parent' },
  { key: 'grandparent',label: 'Grand-parent' },
  { key: 'companion',  label: 'Compagnon' },
  { key: 'rival',      label: 'Rival·e' },
  { key: 'supporting', label: 'Secondaire' },
  { key: 'other',      label: 'Autre' },
]

const PERSONALITY_PRESETS: { key: string; label: string }[] = [
  { key: 'brave',       label: 'Courageux' },
  { key: 'curious',     label: 'Curieux' },
  { key: 'funny',       label: 'Drôle' },
  { key: 'kind',        label: 'Gentil' },
  { key: 'shy',         label: 'Timide' },
  { key: 'calm',        label: 'Calme' },
  { key: 'mischievous', label: 'Espiègle' },
  { key: 'adventurous', label: 'Aventurier' },
]

const ROLE_LABELS: Record<CharacterRole, string> = Object.fromEntries(
  CHARACTER_ROLES.map(r => [r.key, r.label])
) as Record<CharacterRole, string>

const TYPE_LABELS: Record<CharacterType, string> = Object.fromEntries(
  CHARACTER_TYPES.map(t => [t.key, t.label])
) as Record<CharacterType, string>

// ── Helpers ────────────────────────────────────────────────────────────────────

function uid(): string {
  return Math.random().toString(36).slice(2, 10)
}

function blankCharacter(isFirst: boolean): Character {
  return {
    id: uid(),
    name: '',
    type: 'human',
    role: isFirst ? 'main' : 'friend',
    personality: [],
  }
}

function personalityLabel(keys: string[], custom?: string): string {
  const presets = keys
    .map(k => PERSONALITY_PRESETS.find(p => p.key === k)?.label)
    .filter(Boolean) as string[]
  const parts = [...presets]
  if (custom?.trim()) parts.push(custom.trim())
  return parts.join(', ')
}

// ── Character editor (inline form) ────────────────────────────────────────────

interface EditorProps {
  initial: Character
  isOnly: boolean
  onSave: (c: Character) => void
  onCancel: () => void
}

function CharacterEditor({ initial, isOnly, onSave, onCancel }: EditorProps) {
  const [draft, setDraft] = useState<Character>({ ...initial })

  const set = <K extends keyof Character>(key: K, value: Character[K]) =>
    setDraft(prev => ({ ...prev, [key]: value }))

  const togglePersonality = (key: string) =>
    setDraft(prev => ({
      ...prev,
      personality: prev.personality.includes(key)
        ? prev.personality.filter(k => k !== key)
        : [...prev.personality, key],
    }))

  const canSave = draft.name.trim().length > 0

  return (
    <div className="space-y-5">

      {/* Name */}
      <div>
        <label className="label">Nom *</label>
        <input
          type="text"
          className="input"
          placeholder="Ex : Emma, Milo, Le Renard…"
          value={draft.name}
          onChange={e => set('name', e.target.value.slice(0, 50))}
          maxLength={50}
          autoFocus
        />
        <p className="text-right text-[11px] text-kidoria-muted mt-1">{draft.name.length}/50</p>
      </div>

      {/* Type + Role */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Type</label>
          <div className="grid grid-cols-2 gap-1.5">
            {CHARACTER_TYPES.map(t => (
              <button key={t.key} type="button"
                onClick={() => set('type', t.key)}
                className={`rounded-xl border py-2 text-xs font-semibold transition-all ${
                  draft.type === t.key
                    ? 'border-kidoria-rose bg-kidoria-rose/10 text-kidoria-text'
                    : 'border-gray-200 text-kidoria-muted hover:border-kidoria-rose/40'
                }`}>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="label">Rôle</label>
          <select className="input text-sm" value={draft.role}
            onChange={e => set('role', e.target.value as CharacterRole)}>
            {CHARACTER_ROLES.map(r => (
              <option key={r.key} value={r.key}>{r.label}</option>
            ))}
          </select>
          {draft.role === 'main' && !isOnly && (
            <p className="text-[11px] text-kidoria-rose mt-1">
              Le précédent personnage principal sera mis à jour.
            </p>
          )}
        </div>
      </div>

      {/* Age + Gender */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">
            Âge <span className="text-kidoria-muted font-normal">(optionnel)</span>
          </label>
          <input
            type="text"
            className="input"
            placeholder={draft.type === 'human' ? 'Ex : 7 ans, bébé…' : 'Ex : 3 ans, adulte…'}
            value={draft.age ?? ''}
            onChange={e => set('age', e.target.value || undefined)}
            maxLength={20}
          />
        </div>

        <div>
          <label className="label">
            Genre <span className="text-kidoria-muted font-normal">(optionnel)</span>
          </label>
          <select className="input text-sm"
            value={draft.gender ?? 'unspecified'}
            onChange={e => set('gender', e.target.value as CharacterGender)}>
            <option value="unspecified">Non précisé</option>
            <option value="female">Féminin</option>
            <option value="male">Masculin</option>
          </select>
        </div>
      </div>

      {/* Appearance */}
      <div>
        <label className="label">
          Apparence <span className="text-kidoria-muted font-normal">(optionnel)</span>
        </label>
        <textarea
          className="input resize-none text-sm leading-relaxed"
          rows={2}
          placeholder={
            draft.type === 'human'
              ? 'Ex : Cheveux bouclés châtains, yeux verts, taches de rousseur.'
              : 'Ex : Petit renard roux avec une poitrine blanche et de grandes oreilles.'
          }
          value={draft.appearance ?? ''}
          onChange={e => set('appearance', e.target.value.slice(0, 300) || undefined)}
          maxLength={300}
        />
        <p className="text-right text-[11px] text-kidoria-muted mt-1">{(draft.appearance ?? '').length}/300</p>
      </div>

      {/* Personality presets */}
      <div>
        <label className="label">Personnalité</label>
        <div className="flex flex-wrap gap-2 mb-3">
          {PERSONALITY_PRESETS.map(p => (
            <button key={p.key} type="button"
              onClick={() => togglePersonality(p.key)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold border transition-all ${
                draft.personality.includes(p.key)
                  ? 'bg-kidoria-rose/10 border-kidoria-rose text-kidoria-text'
                  : 'border-gray-200 text-kidoria-muted hover:border-kidoria-rose/40'
              }`}>
              {p.label}
            </button>
          ))}
        </div>
        <input
          type="text"
          className="input text-sm"
          placeholder="Autre trait de personnalité (optionnel)…"
          value={draft.personalityCustom ?? ''}
          onChange={e => set('personalityCustom', e.target.value.slice(0, 200) || undefined)}
          maxLength={200}
        />
        {draft.personalityCustom && (
          <p className="text-right text-[11px] text-kidoria-muted mt-1">{draft.personalityCustom.length}/200</p>
        )}
      </div>

      {/* Clothing / distinctive elements */}
      <div>
        <label className="label">
          Vêtements / éléments distinctifs <span className="text-kidoria-muted font-normal">(optionnel)</span>
        </label>
        <input
          type="text"
          className="input text-sm"
          placeholder='Ex : Imperméable jaune et bottes rouges. Porte toujours un petit sac à dos bleu.'
          value={draft.clothing ?? ''}
          onChange={e => set('clothing', e.target.value.slice(0, 200) || undefined)}
          maxLength={200}
        />
        {draft.clothing && (
          <p className="text-right text-[11px] text-kidoria-muted mt-1">{draft.clothing.length}/200</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onCancel}
          className="flex-1 rounded-xl border-2 border-gray-200 py-2.5 text-sm font-semibold text-kidoria-muted hover:border-kidoria-muted/40 transition-colors">
          Annuler
        </button>
        <button type="button" onClick={() => canSave && onSave(draft)} disabled={!canSave}
          className="flex-1 btn-primary py-2.5 text-sm disabled:opacity-50 disabled:cursor-not-allowed">
          Enregistrer
        </button>
      </div>
    </div>
  )
}

// ── Character card (list item) ─────────────────────────────────────────────────

interface CardProps {
  character: Character
  onEdit: () => void
  onRemove: () => void
}

function CharacterCard({ character, onEdit, onRemove }: CardProps) {
  const subtitle = [
    TYPE_LABELS[character.type],
    character.age,
  ].filter(Boolean).join(' · ')

  const traits = personalityLabel(character.personality, character.personalityCustom)

  return (
    <div className="flex items-start gap-3 rounded-2xl border-2 border-gray-100 bg-white p-4">
      {/* Star for main */}
      <div className="mt-0.5 shrink-0 w-6 text-center">
        {character.role === 'main' && (
          <span className="text-kidoria-rose text-base leading-none" title="Personnage principal">★</span>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 flex-wrap">
          <span className="font-bold text-sm truncate">{character.name || '—'}</span>
          <span className="text-xs text-kidoria-muted">{ROLE_LABELS[character.role]}</span>
        </div>
        {subtitle && <p className="text-xs text-kidoria-muted mt-0.5">{subtitle}</p>}
        {traits && <p className="text-xs text-kidoria-muted/80 italic mt-0.5 line-clamp-1">{traits}</p>}
      </div>

      <div className="flex gap-1.5 shrink-0">
        <button type="button" onClick={onEdit}
          className="text-xs border border-gray-200 rounded-lg px-2.5 py-1 text-kidoria-muted hover:border-kidoria-rose/40 hover:text-kidoria-text transition-colors">
          Modifier
        </button>
        <button type="button" onClick={onRemove}
          className="text-xs border border-gray-200 rounded-lg px-2.5 py-1 text-kidoria-muted hover:border-red-300 hover:text-red-500 transition-colors">
          Retirer
        </button>
      </div>
    </div>
  )
}

// ── Main section ───────────────────────────────────────────────────────────────

interface Props {
  characters: Character[]
  onChange: (characters: Character[]) => void
}

export function CharacterSection({ characters, onChange }: Props) {
  // editing: null = list view, 'new' = adding, string id = editing existing
  const [editing, setEditing] = useState<string | null>(characters.length === 0 ? 'new' : null)

  const editingCharacter: Character | null =
    editing === 'new'
      ? blankCharacter(characters.length === 0)
      : (characters.find(c => c.id === editing) ?? null)

  const handleSave = (saved: Character) => {
    // If role is set to 'main', demote any previous main
    let updated = characters.map(c =>
      c.role === 'main' && saved.role === 'main' && c.id !== saved.id
        ? { ...c, role: 'friend' as CharacterRole }
        : c
    )

    if (editing === 'new') {
      updated = [...updated, saved]
    } else {
      updated = updated.map(c => c.id === saved.id ? saved : c)
    }

    onChange(updated)
    setEditing(null)
  }

  const handleRemove = (id: string) => {
    const updated = characters.filter(c => c.id !== id)
    // If removed was main, promote first remaining to main
    if (updated.length > 0 && !updated.some(c => c.role === 'main')) {
      updated[0] = { ...updated[0], role: 'main' }
    }
    onChange(updated)
    if (editing === id) setEditing(null)
  }

  const atMax = characters.length >= MAX_CHARACTERS

  return (
    <div className="space-y-4">

      {/* Character list */}
      {characters.length > 0 && editing !== 'new' && (
        <div className="space-y-2">
          {characters.map(c => (
            editing === c.id
              ? (
                <div key={c.id} className="rounded-2xl border-2 border-kidoria-rose/30 bg-kidoria-rose/5 p-5">
                  <p className="text-xs font-semibold text-kidoria-rose mb-4 uppercase tracking-wide">Modifier le personnage</p>
                  <CharacterEditor
                    initial={c}
                    isOnly={characters.length === 1}
                    onSave={handleSave}
                    onCancel={() => setEditing(null)}
                  />
                </div>
              )
              : (
                <CharacterCard
                  key={c.id}
                  character={c}
                  onEdit={() => setEditing(c.id)}
                  onRemove={() => handleRemove(c.id)}
                />
              )
          ))}
        </div>
      )}

      {/* Add form */}
      {editing === 'new' && editingCharacter && (
        <div className="rounded-2xl border-2 border-kidoria-rose/30 bg-kidoria-rose/5 p-5">
          <p className="text-xs font-semibold text-kidoria-rose mb-4 uppercase tracking-wide">
            {characters.length === 0 ? 'Premier personnage' : 'Nouveau personnage'}
          </p>
          <CharacterEditor
            initial={editingCharacter}
            isOnly={characters.length === 0}
            onSave={handleSave}
            onCancel={() => characters.length > 0 ? setEditing(null) : undefined}
          />
        </div>
      )}

      {/* Add button / limit message */}
      {editing === null && (
        atMax ? (
          <p className="text-xs text-kidoria-muted text-center py-2">
            Maximum {MAX_CHARACTERS} personnages par livre.
          </p>
        ) : (
          <button type="button" onClick={() => setEditing('new')}
            className="w-full rounded-2xl border-2 border-dashed border-kidoria-sky hover:border-kidoria-rose/40 py-3.5 text-sm font-semibold text-kidoria-muted hover:text-kidoria-text transition-all">
            + Ajouter un personnage
          </button>
        )
      )}
    </div>
  )
}
