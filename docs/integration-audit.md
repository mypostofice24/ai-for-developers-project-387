# Финальная проверка интеграции

## Workflow triggers

- `opencode` запускается только на комментарии к issue/PR review lines, если в
  тексте есть `/oc` или `/opencode`.
- Комментарии GitHub bot-пользователей игнорируются через
  `github.event.comment.user.type != 'Bot'`.
- `scheduled-lighthouse` запускается только по расписанию и вручную через
  `workflow_dispatch`.
- `e2e` запускается на `push` и `pull_request`.

## Permissions

- `opencode`:
  - `id-token: write` нужен OpenCode GitHub App для token exchange;
  - `contents: write` нужен для веток и коммитов при `/oc fix`;
  - `issues: write` нужен для ответов в issue;
  - `pull-requests: write` нужен для создания и обновления PR.
- `scheduled-lighthouse` использует только `contents: read`.
- `hexlet-check` оставлен автогенерированным и не редактировался.

## Cost control

- OpenCode workflow использует модель `opencode/deepseek-v4-flash`.
- Бесплатная модель подошла для базового explain, но для PR-задач потребовалась
  более надежная модель.
- Lighthouse запускается один раз в день в `03:00 UTC` и вручную по требованию.
- Runs смотреть в GitHub Actions:
  - `opencode`;
  - `scheduled-lighthouse`;
  - `e2e`;
  - `hexlet-check`.

## Verified scenarios

- Issue command: `/oc explain this issue` сработала и агент ответил в issue.
- Triage: vague issue `#2` разобрано агентом до технической постановки.
- PR flow: `/oc fix` создал PR `#3`, review comments были учтены, PR обновлен.
- Scheduled check: `scheduled-lighthouse` был запущен вручную и завершился
  успешно, artifact `lighthouse-report` доступен в run.

## Self assessment

С первого прохода сработали:

- установка GitHub App;
- секрет `OPENCODE_API_KEY`;
- базовый issue explain;
- triage после уточняющего prompt;
- создание PR через `/oc fix`;
- scheduled Lighthouse run.

Потребовали итераций:

- выбор модели: некоторые модели OpenCode Zen были disabled;
- защита от самозапуска: workflow был усилен фильтром bot-комментариев;
- PR review loop: агенту понадобились review comments, чтобы исправить e2e
  checks.

Вывод: основные сценарии GitHub-агента работают. Лучше всего агент помогает,
когда задача сформулирована через issue, а review содержит конкретные симптомы,
логи и ожидаемый результат.
