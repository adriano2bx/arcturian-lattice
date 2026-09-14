import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

test("workflow registry is generated and preserves the hierarchy contract", async () => {
  const registry = JSON.parse(await fs.readFile(path.join(root, "skills", "workflows.json"), "utf8"));
  assert.equal(registry.schemaVersion, 1);
  assert.equal(registry.server, "arcturian-lattice");
  assert.equal(registry.workflows.length, 130);
  assert.equal(registry.workflows.filter((workflow) => workflow.routable).length, 63);
  assert.equal(registry.workflows.filter((workflow) => workflow.status === "blocked").length, 9);
  for (const workflow of registry.workflows) {
    assert.match(workflow.id, /^\d{2}\.\d{2}-[a-z0-9-]+$/);
    assert.ok(["active", "blocked", "next", "planned"].includes(workflow.status));
    assert.equal(workflow.routable, workflow.status === "active");
  }
});
