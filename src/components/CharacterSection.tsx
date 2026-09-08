import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { Character, CharacterType, CharacterRole, CharacterGender } from '../lib/types'
import { MAX_CHARACTERS } from '../lib/types'

const CHARACTER_TYPE_KEYS: CharacterType[] = ['human', 'animal', 'creature', 'other']
const CHARACTER_ROLE_KEYS: CharacterRole[] = ['main', 'friend', 'sibling', 'parent', 'grandparent', 'companion', 'rival', 'supporting', 'other']
const PERSONALITY_KEYS = ['brave', 'curious', 'funny', 'kind', 'shy', 'calm', 'mischievous', 'adventurous']

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

// ── Character editor ──────────────────────────────────────────────────────────

interface EditorProps {
  initial: Character
  isOnly: boolean
  onSave: (c: Character) => void
  onCancel: () => void
}

function CharacterEditor({ initial, isOnly, onSave, onCancel }: EditorProps) {
  const { t } = useTranslation()
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
        <label className="label">{t('character.name')} *</label>
        <input
          type="text"
          className="input"
          placeholder={t('character.namePlaceholder_human')}
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
          <label className="label">{t('character.type')}</label>
          <div className="grid grid-cols-2 gap-1.5">
            {CHARACTER_TYPE_KEYS.map(key => (
              <button key={key} type="button"
                onClick={() => set('type', key)}
                className={`rounded-xl border py-2 text-xs font-semibold transition-all ${
                  draft.type === key
                    ? 'border-kidoria-rose bg-kidoria-rose/10 text-kidoria-text'
                    : 'border-gray-200 text-kidoria-muted hover:border-kidoria-rose/40'
                }`}>
                {t(`character.type_${key}`)}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="label">{t('character.role')}</label>
          <select className="input text-sm" value={draft.role}
            onChange={e => set('role', e.target.value as CharacterRole)}>
            {CHARACTER_ROLE_KEYS.map(key => (
              <option key={key} value={key}>{t(`character.role_${key}`)}</option>
            ))}
          </select>
          {draft.role === 'main' && !isOnly && (
            <p className="text-[11px] text-kidoria-rose mt-1">
              {t('character.mainWillUpdate')}
            </p>
          )}
        </div>
      </div>

      {/* Age + Gender */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">
            {t('character.age')} <span className="text-kidoria-muted font-normal">{t('character.ageOptional')}</span>
          </label>
          <input
            type="text"
            className="input"
            placeholder={draft.type === 'human' ? t('character.agePlaceholder_human') : t('character.agePlaceholder_other')}
            value={draft.age ?? ''}
            onChange={e => set('age', e.target.value || undefined)}
            maxLength={20}
          />
        </div>

        <div>
          <label className="label">
            {t('character.gender')} <span className="text-kidoria-muted font-normal">{t('character.genderOptional')}</span>
          </label>
          <select className="input text-sm"
            value={draft.gender ?? 'unspecified'}
            onChange={e => set('gender', e.target.value as CharacterGender)}>
            <option value="unspecified">{t('character.gender_unspecified')}</option>
            <option value="female">{t('character.gender_female')}</option>
            <option value="male">{t('character.gender_male')}</option>
          </select>
        </div>
      </div>

      {/* Appearance */}
      <div>
        <label className="label">
          {t('character.appearance')} <span className="text-kidoria-muted font-normal">{t('character.appearanceOptional')}</span>
        </label>
        <textarea
          className="input resize-none text-sm leading-relaxed"
          rows={2}
          placeholder={draft.type === 'human' ? t('character.appearancePlaceholder_human') : t('character.appearancePlaceholder_other')}
          value={draft.appearance ?? ''}
          onChange={e => set('appearance', e.target.value.slice(0, 300) || undefined)}
          maxLength={300}
        />
        <p className="text-right text-[11px] text-kidoria-muted mt-1">{(draft.appearance ?? '').length}/300</p>
      </div>

      {/* Personality presets */}
      <div>
        <label className="label">{t('character.personality')}</label>
        <div className="flex flex-wrap gap-2 mb-3">
          {PERSONALITY_KEYS.map(key => (
            <button key={key} type="button"
              onClick={() => togglePersonality(key)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold border transition-all ${
                draft.personality.includes(key)
                  ? 'bg-kidoria-rose/10 border-kidoria-rose text-kidoria-text'
                  : 'border-gray-200 text-kidoria-muted hover:border-kidoria-rose/40'
              }`}>
              {t(`character.personality_${key}`)}
            </button>
          ))}
        </div>
        <input
          type="text"
          className="input text-sm"
          placeholder={t('character.personalityCustomPlaceholder')}
          value={draft.personalityCustom ?? ''}
          onChange={e => set('personalityCustom', e.target.value.slice(0, 200) || undefined)}
          maxLength={200}
        />
        {draft.personalityCustom && (
          <p className="text-right text-[11px] text-kidoria-muted mt-1">{draft.personalityCustom.length}/200</p>
        )}
      </div>

      {/* Clothing */}
      <div>
        <label className="label">
          {t('character.clothing')} <span className="text-kidoria-muted font-normal">{t('character.clothingOptional')}</span>
        </label>
        <input
          type="text"
          className="input text-sm"
          placeholder={t('character.clothingPlaceholder')}
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
          {t('character.cancel')}
        </button>
        <button type="button" onClick={() => canSave && onSave(draft)} disabled={!canSave}
          className="flex-1 btn-primary py-2.5 text-sm disabled:opacity-50 disabled:cursor-not-allowed">
          {t('character.save')}
        </button>
      </div>
    </div>
  )
}

// ── Character card ─────────────────────────────────────────────────────────────

interface CardProps {
  character: Character
  onEdit: () => void
  onRemove: () => void
}

function CharacterCard({ character, onEdit, onRemove }: CardProps) {
  const { t } = useTranslation()

  const subtitle = [
    t(`character.type_${character.type}`),
    character.age,
  ].filter(Boolean).join(' · ')

  const traits = [
    ...character.personality.map(k => t(`character.personality_${k}`)),
    character.personalityCustom?.trim(),
  ].filter(Boolean).join(', ')

  return (
    <div className="flex items-start gap-3 rounded-2xl border-2 border-gray-100 bg-white p-4">
      <div className="mt-0.5 shrink-0 w-6 text-center">
        {character.role === 'main' && (
          <span className="text-kidoria-rose text-base leading-none">★</span>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 flex-wrap">
          <span className="font-bold text-sm truncate">{character.name || '—'}</span>
          <span className="text-xs text-kidoria-muted">{t(`character.role_${character.role}`)}</span>
        </div>
        {subtitle && <p className="text-xs text-kidoria-muted mt-0.5">{subtitle}</p>}
        {traits && <p className="text-xs text-kidoria-muted/80 italic mt-0.5 line-clamp-1">{traits}</p>}
      </div>

      <div className="flex gap-1.5 shrink-0">
        <button type="button" onClick={onEdit}
          className="text-xs border border-gray-200 rounded-lg px-2.5 py-1 text-kidoria-muted hover:border-kidoria-rose/40 hover:text-kidoria-text transition-colors">
          {t('character.edit')}
        </button>
        <button type="button" onClick={onRemove}
          className="text-xs border border-gray-200 rounded-lg px-2.5 py-1 text-kidoria-muted hover:border-red-300 hover:text-red-500 transition-colors">
          {t('character.remove')}
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
  const { t } = useTranslation()
  const [editing, setEditing] = useState<string | null>(characters.length === 0 ? 'new' : null)

  const editingCharacter: Character | null =
    editing === 'new'
      ? blankCharacter(characters.length === 0)
      : (characters.find(c => c.id === editing) ?? null)

  const handleSave = (saved: Character) => {
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
    if (updated.length > 0 && !updated.some(c => c.role === 'main')) {
      updated[0] = { ...updated[0], role: 'main' }
    }
    onChange(updated)
    if (editing === id) setEditing(null)
  }

  const atMax = characters.length >= MAX_CHARACTERS

  return (
    <div className="space-y-4">

      {characters.length > 0 && editing !== 'new' && (
        <div className="space-y-2">
          {characters.map(c => (
            editing === c.id
              ? (
                <div key={c.id} className="rounded-2xl border-2 border-kidoria-rose/30 bg-kidoria-rose/5 p-5">
                  <p className="text-xs font-semibold text-kidoria-rose mb-4 uppercase tracking-wide">{t('character.editCharacter')}</p>
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

      {editing === 'new' && editingCharacter && (
        <div className="rounded-2xl border-2 border-kidoria-rose/30 bg-kidoria-rose/5 p-5">
          <p className="text-xs font-semibold text-kidoria-rose mb-4 uppercase tracking-wide">
            {characters.length === 0 ? t('character.firstCharacter') : t('character.newCharacter')}
          </p>
          <CharacterEditor
            initial={editingCharacter}
            isOnly={characters.length === 0}
            onSave={handleSave}
            onCancel={() => characters.length > 0 ? setEditing(null) : undefined}
          />
        </div>
      )}

      {editing === null && (
        atMax ? (
          <p className="text-xs text-kidoria-muted text-center py-2">
            {t('character.maxReached', { max: MAX_CHARACTERS })}
          </p>
        ) : (
          <button type="button" onClick={() => setEditing('new')}
            className="w-full rounded-2xl border-2 border-dashed border-kidoria-sky hover:border-kidoria-rose/40 py-3.5 text-sm font-semibold text-kidoria-muted hover:text-kidoria-text transition-all">
            {t('character.addCharacter')}
          </button>
        )
      )}
    </div>
  )
}
