// Petit lanceur : bundle un fichier TypeScript avec esbuild (déjà installé avec Vite) puis l'exécute avec node.
import { build } from 'esbuild';
import { spawnSync } from 'node:child_process';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const entry = resolve(process.argv[2]);
const outfile = join(mkdtempSync(join(tmpdir(), 'cashnoir-ts-')), 'out.cjs');
await build({ entryPoints: [entry], bundle: true, platform: 'node', format: 'cjs', outfile, logLevel: 'error' });
process.exit(spawnSync(process.execPath, [outfile], { stdio: 'inherit', cwd: process.cwd() }).status ?? 1);
