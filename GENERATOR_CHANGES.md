# Modifications requises dans generator.py

## Contexte
Le viewer web (ReadBook.tsx) affiche maintenant l'image en plein écran côté à côté avec le texte.
Pour les nouveaux livres, le texte doit être **intégré directement dans l'image** via PIL sous forme d'une bulle nuage douce.

---

## 1. Nouvelles fonctions à ajouter (après `add_title_to_cover`)

### `_zone_brightness(img_rgba, y_start, y_end)`
Mesure la luminance moyenne d'une bande horizontale de l'image.

```python
def _zone_brightness(img_rgba, y_start, y_end):
    band = img_rgba.crop((0, y_start, img_rgba.width, y_end))
    pixels = list(band.getdata())
    if not pixels:
        return 128
    r_sum = g_sum = b_sum = 0
    for p in pixels:
        r_sum += p[0]; g_sum += p[1]; b_sum += p[2]
    n = len(pixels)
    return 0.299 * r_sum / n + 0.587 * g_sum / n + 0.114 * b_sum / n
```

### `_draw_rounded_rect(draw, xy, radius, fill)`
Rectangle arrondi compatible toutes versions Pillow.

```python
def _draw_rounded_rect(draw, xy, radius, fill):
    x0, y0, x1, y1 = xy
    r = min(radius, (x1 - x0) // 2, (y1 - y0) // 2)
    draw.rectangle([x0 + r, y0, x1 - r, y1], fill=fill)
    draw.rectangle([x0, y0 + r, x1, y1 - r], fill=fill)
    draw.ellipse([x0, y0, x0 + 2*r, y0 + 2*r], fill=fill)
    draw.ellipse([x1 - 2*r, y0, x1, y0 + 2*r], fill=fill)
    draw.ellipse([x0, y1 - 2*r, x0 + 2*r, y1], fill=fill)
    draw.ellipse([x1 - 2*r, y1 - 2*r, x1, y1], fill=fill)
```

### `add_text_to_page(image_bytes, text, visual_style, placement)`
Dessine une bulle nuage crème douce (rectangle arrondi + GaussianBlur) dans le coin bas-gauche de l'image, avec le texte de la scène dedans. La taille de la bulle s'adapte au texte.

```python
def add_text_to_page(image_bytes, text, visual_style="aquarelle", placement="bottom"):
    if not text:
        return image_bytes
    print(f"[PAGE] add_text_to_page: {len(text)} chars, style={visual_style}, placement={placement}", flush=True)
    from PIL import ImageFilter
    img  = Image.open(io.BytesIO(image_bytes)).convert("RGBA")
    w, h = img.size
    draw = ImageDraw.Draw(img)

    max_text_w = int(w * 0.58)
    font_size, lines = 26, [text]
    for fs in range(min(int(h * 0.048), 46), 18, -2):
        font    = _get_font(visual_style, text, fs)
        cpl     = max(10, int(max_text_w / max(1, fs * 0.54)))
        wrapped = textwrap.wrap(text, width=cpl)
        if len(wrapped) <= 3 and all(draw.textlength(l, font=font) <= max_text_w for l in wrapped):
            font_size, lines = fs, wrapped
            break

    font       = _get_font(visual_style, text, font_size)
    line_h     = int(font_size * 1.48)
    max_line_w = max(int(draw.textlength(l, font=font)) for l in lines)
    text_h     = len(lines) * line_h

    pad_x  = int(font_size * 1.3)
    pad_y  = int(font_size * 0.9)
    box_w  = max_line_w + pad_x * 2
    box_h  = text_h + pad_y * 2
    margin = int(w * 0.06)
    box_x  = margin
    box_y  = margin if placement == "top" else h - margin - box_h

    brightness = _zone_brightness(img, box_y, box_y + box_h)
    cloud_rgba = (245, 240, 224, 205) if brightness < 200 else (228, 220, 198, 205)

    cloud_layer = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    cd = ImageDraw.Draw(cloud_layer)
    _draw_rounded_rect(cd, [box_x, box_y, box_x + box_w, box_y + box_h],
                       radius=int(box_h * 0.35), fill=cloud_rgba)
    cloud_layer = cloud_layer.filter(ImageFilter.GaussianBlur(radius=15))

    cloud_inner = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    ci = ImageDraw.Draw(cloud_inner)
    _draw_rounded_rect(ci, [box_x + 5, box_y + 5, box_x + box_w - 5, box_y + box_h - 5],
                       radius=int(box_h * 0.30), fill=cloud_rgba[:3] + (170,))
    cloud_layer = Image.alpha_composite(cloud_layer, cloud_inner)
    img  = Image.alpha_composite(img, cloud_layer)
    draw = ImageDraw.Draw(img)

    for i, line in enumerate(lines):
        x = box_x + pad_x
        y = box_y + pad_y + i * line_h
        draw.text((x + 1, y + 1), line, font=font, fill=(160, 145, 125, 90))
        draw.text((x, y), line, font=font, fill=(22, 14, 8, 255))

    out = io.BytesIO()
    img.convert("RGB").save(out, format="PNG", optimize=True)
    print("[PAGE] Text overlay done.", flush=True)
    return out.getvalue()
```

---

## 2. Mise à jour du prompt Gemini dans `generate_scenes_with_gemini()`

Dans le prompt, remplacer la section ÉTAPE 2 par :

```
ÉTAPE 2 — Histoire : écris les {nb_scenes} scènes. Chaque scène : texte simple et doux pour {child_age} ans (2-3 phrases), image_prompt en anglais détaillé avec descriptions physiques des personnages présents, JAMAIS de texte dans les images.
Structure : introduction → péripétie → moment de doute → résolution → leçon de vie.

COMPOSITION DES ILLUSTRATIONS — règles impératives :
- Variété : alterne plans larges, plans moyens, gros plans, contre-plongées, vues de dos, silhouettes
- JAMAIS le personnage centré souriant face caméra à chaque scène
- Chaque image_prompt doit INCLURE : un angle de prise de vue, une action dynamique, l'ambiance lumineuse
- ZONE DE TEXTE : chaque illustration doit composer l'action dans le tiers supérieur ou central de l'image, laissant le bas-gauche avec une zone calme, claire et peu détaillée (sol, herbe floue, eau, sable, neige, plancher) — cette zone recevra une bulle de texte translucide
- text_placement : "bottom" par défaut ; "top" seulement si l'action est en bas et le ciel clair est en haut
```

Et dans le JSON de réponse, ajouter le champ `text_placement` dans chaque scène :

```json
{
  "scene_number": 1,
  "text": "...",
  "image_prompt": "..., bottom-left area calm and softly lit (floor/grass/sand/water) with little detail for text bubble. No text, no letters, no words",
  "text_placement": "bottom"
}
```

---

## 3. Appeler `add_text_to_page()` dans `process_preview()` et `process_remaining()`

Dans la boucle de génération des pages, après la génération de l'image et avant l'upload, ajouter :

```python
if scene_number == 1 and book_title:
    # couverture — déjà géré par add_title_to_cover()
    image_bytes = add_title_to_cover(image_bytes, book_title, visual_style)
elif scene.get("text"):
    placement = scene.get("text_placement", "bottom")
    log(f"  Ajout texte page {scene_number} ({placement})")
    image_bytes = add_text_to_page(image_bytes, scene["text"], visual_style, placement)
```

Faire de même dans les deux branches de `process_remaining()`.
