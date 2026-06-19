# Этап 24 — AI-контент-завод

Документация этапа AI-генерации черновиков SEO-контента для stroistroy.ru без автопубликации.

## 1. Что сделано на Этапе 24

- Типы AI request/output/validation/brief/teaser
- Режимы генерации (11 modes)
- Prompt templates и safety rules
- AI provider abstraction (OpenAI при `OPENAI_API_KEY`, иначе mock dev mode)
- Сервис генерации с validation и audit log
- CMS integration: сохранение только как `ai-generated`, `indexable: false`
- Dashboard: `/dashboard/content/generate`, `/dashboard/content/ai-history`
- API: `/api/dashboard/ai-content/*`
- Analytics events для AI workflow

## 2. Связь с Этапами 18–23

| Этап | Связь |
| ---- | ----- |
| 18 | Programmatic SEO — режим `programmatic-page-draft` |
| 19 | Таксономия — поля region/objectType/material/size в input |
| 20 | Шаблоны programmatic pages — структура blocks в output |
| 21 | Technical articles — режим `technical-article-draft` |
| 22 | Editorial — `editorial-content-draft`, news/digest с source |
| 23 | CMS statuses, workflow, quality — target `ai-generated`, review queue |

## 3. Почему AI-завод нельзя без CMS

AI создаёт черновики; CMS владеет статусами, indexing, quality blockers и human review. Прямой publish обходит fact-check, ethics и sitemap rules.

## 4. Главная схема AI workflow

```text
CMS idea / planned content
  → AI brief (optional)
  → AI draft
  → validation + quality score
  → status ai-generated
  → review (human)
  → approved
  → scheduled
  → published (manual)
```

## 5. Режимы генерации

См. `src/data/ai-content-generation-modes.ts`.

## 6–9. Модели

- Request: `src/types/ai-content-factory.ts` → `AIContentGenerationRequest`
- Output: `AIContentGenerationOutput`
- Brief: `AIContentBrief`
- Teaser: `AIContentTeaser`

## 10. Prompt templates

`src/data/ai-content-prompt-templates.ts` — отдельные system/user prompts per mode.

## 11. Safety rules

`src/data/ai-content-safety-rules.ts` — 15 правил, forbidden phrases.

## 12. AI provider

`src/lib/ai-content-factory/ai-provider.ts`:

- `OPENAI_API_KEY` → OpenAI SDK (dynamic import)
- Иначе mock provider с пометкой в UI

## 13. Validation

`src/lib/ai-content-factory/ai-output-validator.ts` — blockers, flags, `canApprove: false`, `canPublish: false`.

## 14. CMS integration

`src/lib/ai-content-factory/ai-cms-integration.ts`:

- `status: ai-generated`
- `source.origin: ai`
- `indexing.indexable: false`, `sitemap: false`
- `quality.requiresHumanReview: true`

## 15. Status rules

AI output **никогда** не получает: published, approved, indexable true.

## 16. Teaser generation

`src/lib/ai-content-factory/ai-teaser-generator.ts` — 9 платформ, UTM, без автопубликации.

## 17. Dashboard generate

`/dashboard/content/generate` — mode selector, form, preview, validation, actions (save/review/discard/copy).

## 18. AI history

`/dashboard/content/ai-history` — in-memory audit log (dev); production → DB.

## 19. Analytics events

`src/lib/ai-content-factory/ai-content-analytics.ts`

## 20–21. Что можно / нельзя

**Можно:** brief, drafts, FAQ, CTA, metadata, related links, teasers, validation, save ai-generated.

**Нельзя:** auto-publish, fake cases/reviews/sources, news без source, exact prices, dangerous instructions.

## 22. Почему auto-publish запрещён

E-E-A-T, юридические риски, thin content в индексе, репутация бренда.

## 23–25. Source / fact-check / expert review

- News/digest: blocker `needs-source` без URL/notes
- Fact-check: flag `needs-fact-check` в requiredActions
- Expert: `needs-expert-review` для technical/regulation

## 26. Этап 24.5 — AI Trend Radar (TODO)

- [ ] Источники трендов (новости, SERP, конкуренты)
- [ ] Сезонные и локальные темы Иркутска/области
- [ ] Trend → content idea в CMS
- [ ] Source capture + fact-check status
- [ ] Запуск AI brief из trend idea
- [ ] Запрет auto-publish

## 27. Этап 25 — дистрибуция teaser (TODO)

- [ ] Platform adapters (Telegram, VK, Dzen, VC, TenChat, OK, email, RSS)
- [ ] Publication statuses, schedule, manual export
- [ ] UTM tracking, lead attribution

---

## Таблица 1 — Generation modes

| Generation mode | Что создаёт | Status после сохранения | Нужна проверка |
| --------------- | ----------- | ----------------------- | -------------- |
| content-brief | Brief | — (не сохраняется отдельно) | Редактор |
| programmatic-page-draft | SEO page draft | ai-generated | Да |
| technical-article-draft | How-to draft | ai-generated | Expert optional |
| editorial-content-draft | Story draft | ai-generated | Да |
| news-draft | News draft | ai-generated | Source + fact-check |
| digest-draft | Digest draft | ai-generated | Source |
| faq-only | FAQ block | ai-generated / partial | Да |
| metadata-only | SEO meta | ai-generated / partial | Да |
| cta-only | CTA | partial | Да |
| related-links-only | Links | partial | Да |
| teaser-package | 9 teasers | attached to CMS item | Да |

## Таблица 2 — Content kind blockers

| Content kind | Blockers | Кто проверяет |
| ------------ | -------- | ------------- |
| programmatic-page | no CTA, exact price | SEO-редактор |
| technical-article | dangerous instruction, no disclaimer | Эксперт |
| editorial | fake review, no fiction notice | Редактор |
| news/digest | needs-source | Редактор + fact-check |
| teaser | no UTM, clickbait | Маркетинг |

## Таблица 3 — Safety rules

| Safety rule | Почему | Что блокирует |
| ----------- | ------ | ------------- |
| no-auto-publish | Индекс без review | publish |
| no-fake-cases | Доверие | save/review |
| no-exact-prices | Смета индивидуальна | blocker |
| news-needs-source | Дезинформация | needs-source |
| always-review | Quality gate | canPublish |

## Таблица 4 — Teaser platforms

| Platform | Формат | Генерируем | Не делаем |
| -------- | ------ | ---------- | --------- |
| telegram | hook + open loop | teaser + UTM | autopost |
| vk | короткий пост | teaser + UTM | autopost |
| dzen | заголовок + интрига | teaser | publish |
| email | subject + preview | teaser | send |
| rss | title + description | excerpt | live feed |

## Таблица 5 — Workflow steps

| Step | Что происходит | Кто отвечает |
| ---- | -------------- | ------------ |
| Generate | AI draft + validation | Система |
| Save | CMS ai-generated, noindex | Редактор |
| Review | status → review | Редактор |
| Approve | human only | Владелец |
| Publish | manual | Владелец |

## Таблица 6 — Analytics events

| Event | Где | Payload | Зачем |
| ----- | --- | ------- | ----- |
| ai_content_generate_opened | generate page | page | Воронка |
| ai_content_generation_started | API generate | mode, topic | Мониторинг |
| ai_content_generation_completed | service | validationLevel | KPI |
| ai_content_saved_to_cms | save action | savedContentId | Attribution |
| ai_content_sent_to_review | review action | generationId | Workflow |
| ai_generation_history_opened | history page | page | Usage |

---

## Проверки (build)

```bash
npm run build   # ✓ успешно (2026-06-18)
npm run lint    # 2 pre-existing errors (counter.tsx, motion-safe.ts), не связаны с Этапом 24
```

Этап 24: TypeScript OK, 362 static pages, новые routes:
- `/dashboard/content/generate`, `/dashboard/content/ai-history`
- `/api/dashboard/ai-content/*`

## Файловая структура

```
src/types/ai-content-factory.ts
src/types/ai-generation.ts
src/types/ai-content-validation.ts
src/data/ai-content-*.ts
src/lib/ai-content-factory/*
src/components/ai-content-factory/*
src/app/dashboard/(admin)/content/generate/
src/app/dashboard/(admin)/content/ai-history/
src/app/api/dashboard/ai-content/
```
