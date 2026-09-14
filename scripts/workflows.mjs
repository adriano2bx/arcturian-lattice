import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const roadmapPath = path.join(root, "docs", "SKILL-CATALOG-ROADMAP.md");
const manifestPath = path.join(root, "skills", "manifest.json");
const registryPath = path.join(root, "skills", "workflows.json");

const slugify = (value) => value
  .normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
  .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

function parseRoadmap(markdown) {
  let segment = null;
  const workflows = [];
  for (const line of markdown.split("\n")) {
    const heading = line.match(/^## (\d+)\. (.+)$/);
    if (heading) {
      segment = { number: Number(heading[1]), name: heading[2].trim() };
      continue;
    }
    const item = line.match(/^(\d+)\. \*\*\[(ATIVA|BLOQUEADA|PRÓXIMA|PLANEJADA)\]\*\* (.+)$/);
    if (!item || !segment) continue;
    const [, order, statusLabel, rawName] = item;
    const ref = rawName.match(/ \(`([^`]+)`\)$/);
    const name = rawName.replace(/ \(`[^`]+`\)$/, "").trim();
    workflows.push({
      id: `${String(segment.number).padStart(2, "0")}.${String(order).padStart(2, "0")}-${slugify(name)}`,
      segment: segment.name,
      segmentNumber: segment.number,
      order: Number(order),
      name,
      status: { ATIVA: "active", BLOQUEADA: "blocked", "PRÓXIMA": "next", PLANEJADA: "planned" }[statusLabel],
      skillRefs: ref ? [ref[1]] : [],
    });
  }
  return workflows;
}

async function buildRegistry() {
  const [roadmap, manifest] = await Promise.all([
    fs.readFile(roadmapPath, "utf8"),
    fs.readFile(manifestPath, "utf8").then(JSON.parse),
  ]);
  const bySkill = new Map(manifest.skills.map((skill) => [skill.name, skill]));
  const workflows = parseRoadmap(roadmap).map((workflow) => {
    const skills = workflow.skillRefs.map((name) => bySkill.get(name)).filter(Boolean);
    return {
      ...workflow,
      skillRefs: skills.map((skill) => skill.name),
      tools: [...new Set(skills.flatMap((skill) => skill.tools ?? []))].sort(),
      routable: workflow.status === "active" && skills.every((skill) => (skill.status ?? "active") === "active"),
      implementation: workflow.status === "active"
        ? { state: "routable", blockers: [] }
        : workflow.status === "blocked"
          ? { state: "blocked", blockers: skills.filter((skill) => (skill.status ?? "active") === "blocked").map((skill) => `${skill.name}:blocked-dependency`) }
          : { state: "not_started", blockers: ["skill_recipe_not_registered"] },
    };
  });
  return {
    schemaVersion: 1,
    server: manifest.server,
    generatedFrom: "docs/SKILL-CATALOG-ROADMAP.md",
    semantics: {
      workflow: "resultado de negócio ponta a ponta",
      skill: "receita reutilizável carregável por um agente",
      tool: "primitiva MCP de dados ou execução",
      orchestration: "o agente escolhe ordem, parâmetros, frequência e saída",
    },
    workflows,
  };
}

const command = process.argv[2] ?? "validate";
const registry = await buildRegistry();

if (command === "generate") {
  await fs.writeFile(registryPath, `${JSON.stringify(registry, null, 2)}\n`);
  console.log(`Generated ${registry.workflows.length} workflows -> ${registryPath}`);
} else if (command === "list") {
  for (const workflow of registry.workflows)
    console.log(`${workflow.id}\t${workflow.status}\t${workflow.routable ? "routable" : "not-routable"}\t${workflow.name}`);
} else if (command === "validate") {
  const errors = [];
  const manifest = JSON.parse(await fs.readFile(manifestPath, "utf8"));
  const skills = new Map(manifest.skills.map((skill) => [skill.name, skill]));
  if (registry.workflows.length !== 130)
    errors.push(`expected 130 roadmap workflows, found ${registry.workflows.length}`);
  for (const workflow of registry.workflows) {
    for (const name of workflow.skillRefs) {
      if (!skills.has(name)) errors.push(`${workflow.id}: unknown skill ${name}`);
    }
    if (workflow.status === "active" && workflow.skillRefs.length === 0)
      errors.push(`${workflow.id}: active workflow has no skill mapping`);
    if (workflow.status === "active" && !workflow.routable)
      errors.push(`${workflow.id}: active workflow depends on blocked skill`);
    if (!workflow.implementation?.state)
      errors.push(`${workflow.id}: missing implementation state`);
    if (!Array.isArray(workflow.implementation?.blockers))
      errors.push(`${workflow.id}: missing blocker list`);
  }
  if (errors.length) {
    console.error(`Workflow validation failed (${errors.length}):`);
    for (const error of errors) console.error(`- ${error}`);
    process.exit(1);
  }
  const counts = Object.groupBy(registry.workflows, (workflow) => workflow.status);
  console.log(`Validated ${registry.workflows.length} workflows: ${Object.entries(counts).map(([key, value]) => `${key}=${value.length}`).join(", ")}`);
} else {
  console.error("Usage: node scripts/workflows.mjs generate|validate|list");
  process.exit(2);
}
