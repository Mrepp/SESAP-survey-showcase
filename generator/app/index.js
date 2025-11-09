export function renderStaticPage(title = "Survey Showcase") {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>${title}</title>
  </head>
  <body>
    <main>
      <h1>${title}</h1>
    </main>
  </body>
</html>`;
}
