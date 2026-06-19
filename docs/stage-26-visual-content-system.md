# Этап 26 — Visual Content System

Управляемая визуальная система для SEO-монстра: единый стиль, бренд-персонаж, шаблоны обложек, prompt builder, validation, registry и dashboard — без массовой генерации изображений.

## 1. Что сделано на Этапе 26

- Типы visual assets, image generation, visual templates
- Visual style guide и brand character «СтройСтрой Мастер»
- Реестр из 10 visual templates
- Image prompt builder + negative prompt
- Image validation с blockers/warnings
- Image asset service + in-memory repository
- Format adapter (архитектура resize/crop — TODO)
- Text overlay preview layer (production canvas — TODO)
- Alt и metadata builders
- CMS integration (cover, OG, inline, completeness)
- Distribution integration (platform formats, image package)
- Image generation provider abstraction (mock dev + OpenAI stub)
- Dashboard `/dashboard/content/visuals/*`
- Analytics events (15)
- Документация и подготовка к Этапам 27 и 30

## 2. Связь с Этапами 18–25

| Этап | Связь |
|------|-------|
| 18–20 | Программируемые страницы → `programmatic-page-cover` |
| 21 | Technical articles → `blog-cover-technical`, `diagram-explainer` |
| 22 | Editorial → `blog-cover-editorial`, brand character |
| 23 | CMS content items → visual requirements, attach cover/OG |
| 24 | AI content factory → generation workspace, prompts |
| 25 | Teaser publications → platform image package, 1:1 / 16:9 |

```text
CMS content item
→ visual brief
→ image prompt
→ generated / uploaded / selected image
→ visual validation
→ image asset registry
→ site cover / OG / social teaser
→ dashboard preview
→ publication package
```

## 3. Зачем SEO-монстру визуальная система

Изображения — часть SEO/CRO: alt, OG, teaser CTR, единый бренд, защита от misleading AI-контента.

## 4. Типы visual assets

См. `src/types/visual-content.ts`, `src/data/visual-content-types.ts`.

## 5. Реальные фото vs AI-иллюстрации

| Тип | Когда | Маркировка |
|-----|-------|------------|
| `real-photo` | Только подтверждённые загрузки | source + rights |
| `ai-illustration` | Статьи, teaser, обложки | «Иллюстрация, не фотография построенного объекта» |
| `diagram` | How-to, explainers | Не заменяет инженерный расчёт |

## 6. Визуальный стиль

`src/data/visual-style-guide.ts` — палитра graphite/orange/off-white/concrete, принципы чистой композиции, запреты неона и AI-текста.

## 7. Brand character

`src/data/brand-character.ts` — **СтройСтрой Мастер**, редакционный персонаж, не реальный сотрудник.

## 8. Visual template registry

`src/data/visual-template-registry.ts` — 10 шаблонов (blog, programmatic, social, OG, diagram, lead-magnet, favicon).

## 9. Форматы изображений

`src/data/visual-formats.ts` + `image-format-adapter.ts`.

## 10. Image prompt builder

`src/lib/visual-content/image-prompt-builder.ts` — mode-specific prompts, стиль, палитра, запрет AI-текста.

## 11. Negative prompt

`buildNegativePrompt()` — no readable text, no fake documents, no misleading construction photo, и др.

## 12. Image validation

`src/lib/visual-content/image-validation.ts` — blockers: нет alt, нет прав, fake client, misleading без маркировки.

## 13. Image asset service

`src/lib/visual-content/image-asset-service.ts` — brief, generation request, approve/reject, attach, validate.

## 14. Text overlay rules

`visual-template-renderer.ts` — текст программно, safe area, max length. Production render — TODO (@vercel/og / sharp).

## 15. Alt text rules

`image-alt-builder.ts` — не «фото» для AI, не выдавать иллюстрацию за реальный дом.

## 16. CMS integration

`image-cms-integration.ts` — attach cover/OG/inline, `checkContentVisualCompleteness`.

## 17. Distribution integration

`image-distribution-integration.ts` — platform formats, `buildPlatformImagePackage`, warnings без image.

## 18. Image generation provider

`image-generation-provider.ts` — mock dev provider; OpenAI — stub до production keys.

## 19. Dashboard visuals

| Route | Назначение |
|-------|------------|
| `/dashboard/content/visuals` | KPI, фильтры, таблица |
| `/dashboard/content/visuals/[imageId]` | Деталь, approve, alt, formats |
| `/dashboard/content/visuals/templates` | Registry + preview |
| `/dashboard/content/visuals/generate` | Prompt workspace |

## 20. Generation workspace

Поля: mode, topic, format, brand character, overlay text. Показ prompt, safety, save to review. **Нет auto-publish.**

## 21. Visual templates dashboard

Список шаблонов с rules, forbidden, preview overlay.

## 22. SEO safety

- Alt обязателен
- AI ≠ «фото построенного дома»
- OG соответствует материалу
- Draft/noindex — не в публичных списках (через CMS gates)

## 23. Analytics events

`src/lib/visual-content/visual-content-analytics.ts`

## 24. Что можно генерировать

Концептуальные иллюстрации, схемы, editorial scenes, brand character, обложки с programmatic text.

## 25. Что нельзя генерировать

Фейковые кейсы, клиенты, документы, сертификаты, AI-текст на изображении, photoreal «наш объект».

## 26. Что требует ручной проверки

High misleading risk, real-photo rights, AI похожий на кейс, publication attach.

## 27. Что требует реальных фото от заказчика

Построенные дома, бригада, этапы стройки, офис, документы с разрешением.

## 28. Переход в Этап 27 (контент-календарь)

TODO:

- Показывать cover / social package readiness в календаре
- Блокировать schedule без обязательного visual asset
- Visual status на карточке материала
- Какие форматы готовы (16:9, 1:1, …)

## 29. Переход в Этап 30 (аналитика)

TODO:

- CTR по visual templates
- Performance по форматам
- Teaser CTR с/без image
- A/B обложек
- Leads из публикаций по visual type

---

## Таблица 1 — Visual kind

| Visual kind | Где используется | Можно AI | Риск |
| ----------- | ---------------- | -------- | ---- |
| real-photo | Кейсы, каталог | Нет | medium–high |
| ai-illustration | Блог, teaser | Да | medium |
| diagram | How-to | Да (упрощённо) | low |
| cover | Site, blog | Да | low |
| social-teaser-image | Telegram, VK, OK | Да | low |
| og-image | OG preview | Да | low |
| brand-character | FAQ, stories | Да | low |

## Таблица 2 — Format

| Format | Размер/ratio | Где использовать | Особенности |
| ------ | ------------ | ------------------ | ----------- |
| 16:9 | 1920×1080 | Site, blog, OG | Основной |
| 1:1 | 1080×1080 | Telegram, VK, OK | Square teaser |
| 4:5 | 1080×1350 | Social feed | Portrait |
| 9:16 | 1080×1920 | Stories/reels | Future |
| favicon | 32–512 | Favicon, PWA | Без текста |

## Таблица 3 — Template

| Template | Usage | Aspect ratio | Text overlay |
| -------- | ----- | ------------ | ------------ |
| blog-cover-technical | site-cover | 16:9 | yes |
| blog-cover-editorial | site-cover | 16:9 | yes |
| programmatic-page-cover | site-cover | 16:9 | yes |
| social-teaser-square | social-teaser | 1:1 | yes |
| social-teaser-vertical | social-teaser | 9:16 | yes |
| social-teaser-portrait | social-teaser | 4:5 | yes |
| og-image | og | 16:9 | yes |
| diagram-explainer | diagram | 16:9 | no |
| lead-magnet-cover | lead-magnet | 4:5 | yes |
| favicon | favicon | favicon | no |

## Таблица 4 — Safety risk

| Safety risk | Почему опасно | Как предотвращаем |
| ----------- | ------------- | ----------------- |
| Fake case | AI-дом как «наш объект» | illustration notice, validation blocker |
| Fake client | Доверие, E-E-A-T | Запрет AI client photos |
| Fake document | Юридические риски | Запрет в negative prompt + kind rules |
| No alt | SEO, a11y | Blocker до approve |
| AI text in image | Нечитаемо | Текст только programmatic overlay |

## Таблица 5 — Analytics events

| Event | Где срабатывает | Payload | Зачем нужен |
| ----- | --------------- | ------- | ----------- |
| visual_dashboard_viewed | /visuals | page | Воронка |
| visual_asset_created | save asset | imageId, kind | Объём |
| visual_prompt_generated | generate | templateId | Prompt usage |
| visual_generation_started | provider call | aspectRatio | Pipeline |
| visual_asset_approved | approve | status | Quality gate |
| visual_asset_attached_to_content | CMS link | contentItemId | Coverage |

---

## Проверки (при релизе Этапа 26)

Команды:

```bash
npm run build
npm run lint   # если есть
npm run typecheck   # если есть
```

**Результат (2026-06-05):**

- `npm run build` — **успешно** (377 страниц, включая `/dashboard/content/visuals/*` и API `/api/dashboard/visual-content/*`)
- Исправлено при сборке: тип `Key` в `ImageUsagePanel`, partial safety в `visual-template-renderer`

## API routes

- `GET /api/dashboard/visual-content/metrics`
- `GET|POST /api/dashboard/visual-content/assets`
- `GET|PATCH /api/dashboard/visual-content/assets/[imageId]`
- `POST .../approve`, `.../reject`
- `GET|POST /api/dashboard/visual-content/generate`

Middleware: `/api/dashboard/visual-content/*` защищён как dashboard API.
