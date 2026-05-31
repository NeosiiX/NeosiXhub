#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const GIT_ROOT = process.env.GIT_ROOT || "/git-repos";

if (!fs.existsSync(GIT_ROOT)) {
  fs.mkdirSync(GIT_ROOT, { recursive: true });
  console.log(`✅ Répertoire Git créé : ${GIT_ROOT}`);
} else {
  console.log(`ℹ️  Répertoire Git déjà existant : ${GIT_ROOT}`);
}
