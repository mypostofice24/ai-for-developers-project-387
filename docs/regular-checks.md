# Регулярные проверки

В репозитории настроен workflow `scheduled-lighthouse`.

## Когда запускается

- По расписанию: каждый день в 03:00 UTC.
- Вручную: GitHub Actions -> `scheduled-lighthouse` -> `Run workflow`.

## Что проверяется

Workflow собирает production Docker image, запускает приложение локально в
GitHub Actions и выполняет Lighthouse CLI для главной страницы.

## Где смотреть отчет

После завершения workflow:

1. Открыть run в GitHub Actions.
2. Скачать artifact `lighthouse-report`.
3. Открыть `home.html` для детального отчета.
4. Посмотреть `summary.md` или GitHub Step Summary для кратких оценок.

## Как фиксировать правки

Если одна из категорий Lighthouse ниже 90:

- создать GitHub issue;
- приложить ссылку на workflow run;
- указать категорию, score и краткую гипотезу причины;
- попросить агента выполнить triage или подготовить PR.
