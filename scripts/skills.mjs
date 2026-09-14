import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import process from "node:process";

const repoRoot = path.resolve(
  path.dirname(new URL(import.meta.url).pathname),
  "..",
);
const skillsRoot = path.join(repoRoot, "skills");
const args = process.argv.slice(2);
const command = args[0] ?? "list";

function flag(name, fallback = null) {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? (args[i + 1] ?? true) : fallback;
}
function has(name) {
  return args.includes(`--${name}`);
}

const manifest = JSON.parse(
  await fs.readFile(path.join(skillsRoot, "manifest.json"), "utf8"),
);

if (command === "list") {
  for (const s of manifest.skills)
    console.log(`${s.name}\t${s.status ?? "active"}\t${s.category}\t${s.description}`);
  await new Promise((resolve) => setTimeout(resolve, 10));
  process.exit(0);
}

if (command === "validate") {
  const errors = [];
  const allowedFrontmatter = new Set([
    "name",
    "description",
    "license",
    "compatibility",
    "metadata",
    "allowed-tools",
  ]);
  for (const s of manifest.skills) {
    const dir = path.join(skillsRoot, s.name);
    const file = path.join(dir, "SKILL.md");
    let text;
    try {
      text = await fs.readFile(file, "utf8");
    } catch {
      errors.push(`${s.name}: missing SKILL.md`);
      continue;
    }
    if (!text.startsWith("---\n")) {
      errors.push(`${s.name}: missing YAML frontmatter`);
      continue;
    }
    const end = text.indexOf("\n---\n", 4);
    if (end < 0) {
      errors.push(`${s.name}: unterminated YAML frontmatter`);
      continue;
    }
    const lines = text.slice(4, end).split("\n");
    const top = [];
    let declaredName = null;
    let description = null;
    for (const line of lines) {
      const m = line.match(/^([a-zA-Z0-9-]+):(?:\s*(.*))?$/);
      if (!m) continue;
      const [, key, val = ""] = m;
      top.push(key);
      if (key === "name") declaredName = val.trim().replace(/^['"]|['"]$/g, "");
      if (key === "description")
        description = val.trim().replace(/^['"]|['"]$/g, "");
    }
    for (const key of top)
      if (!allowedFrontmatter.has(key))
        errors.push(`${s.name}: unsupported frontmatter key ${key}`);
    if (declaredName !== s.name)
      errors.push(`${s.name}: frontmatter name must match directory`);
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(s.name) || s.name.length > 64)
      errors.push(`${s.name}: invalid Agent Skills name`);
    if (!description || description.length > 1024)
      errors.push(`${s.name}: invalid description`);
    if (text.split("\n").length > 500)
      errors.push(`${s.name}: SKILL.md exceeds recommended 500 lines`);
    for (const tool of s.tools ?? []) {
      const server = await fs.readFile(
        path.join(repoRoot, "src/mcp/create-server.js"),
        "utf8",
      );
      // Prettier and project style may use either quote character around
      // registered tool names. Match the literal name independently of that
      // formatting choice.
      if (!server.includes(tool)) {
        errors.push(`${s.name}: references unknown MCP tool ${tool}`);
      }
    }
  }
  if (errors.length) {
    console.error(`Skill validation failed (${errors.length}):`);
    for (const e of errors) console.error(`- ${e}`);
    process.exit(1);
  }
  console.log(`Validated ${manifest.skills.length} skills successfully.`);
  await new Promise((resolve) => setTimeout(resolve, 10));
  process.exit(0);
}

if (command === "install") {
  const target = String(flag("target", "hermes"));
  const force = has("force");
  const home = os.homedir();
  const targets = {
    hermes: path.join(
      process.env.HERMES_HOME || path.join(home, ".hermes"),
      "skills",
    ),
    claude: path.join(home, ".claude", "skills"),
    codex: path.join(home, ".agents", "skills"),
    cursor: path.join(home, ".cursor", "skills"),
  };
  if (!targets[target])
    throw new Error(
      `Unsupported target: ${target}. Use hermes, claude, codex, or cursor.`,
    );
  await fs.mkdir(targets[target], { recursive: true });
  let installed = 0,
    skipped = 0;
  for (const s of manifest.skills) {
    if ((s.status ?? "active") !== "active") {
      skipped++;
      console.log(`skip ${s.name} (status=${s.status})`);
      continue;
    }
    const src = path.join(skillsRoot, s.name);
    const dst = path.join(targets[target], s.name);
    try {
      await fs.access(dst);
      if (!force) {
        console.log(`skip ${s.name} (exists; use --force)`);
        skipped++;
        continue;
      }
      await fs.rm(dst, { recursive: true, force: true });
    } catch {}
    await fs.cp(src, dst, { recursive: true });
    installed++;
    console.log(`installed ${s.name} -> ${dst}`);
  }
  console.log(
    `Done. installed=${installed} skipped=${skipped} target=${target}`,
  );
  await new Promise((resolve) => setTimeout(resolve, 10));
  process.exit(0);
}

console.error(
  "Usage: node scripts/skills.mjs list|validate|install [--target hermes|claude|codex|cursor] [--force]",
);
process.exit(2);
