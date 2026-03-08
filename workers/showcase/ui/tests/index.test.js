import assert from "assert";

import { renderStaticPage } from "../src/app/index.js";

const title = "Generator Smoke Test";

const result = renderStaticPage(title);

assert.ok(result.includes(`<h1>${title}</h1>`), "Expected the rendered markup to include the heading");
