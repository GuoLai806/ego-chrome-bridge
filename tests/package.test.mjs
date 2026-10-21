import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync,lstatSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
test('repository command prints help without opening a browser',()=>{
 const r=spawnSync(process.execPath,[root+'bin/ego-browser','--help'],{encoding:'utf8'});
 assert.equal(r.status,0);assert.match(r.stdout,/Daily Chrome only/);
});
test('daily transport and latest SDK are included, not Pi',()=>{
 const base=root+'vendor/ego-lite/package/ego-browser/';
 assert.ok(existsSync(base+'src/linux/daily-chrome.ts'));
 assert.match(readFileSync(base+'skill-body/SKILL.md','utf8'),/version: "2\.1\.0"/);
 for(const f of ['agent','auth.json','models.json','launch.mjs','pi','Pi-EgoLite.command'])assert.equal(existsSync(root+f),false);
});
test('wrapper cannot silently fall back to an isolated browser',()=>{
 const s=readFileSync(root+'bin/ego-browser','utf8');
 assert.match(s,/EGO_DAILY_CHROME:'1'/);assert.doesNotMatch(s,/EGO_DAILY_CHROME:'0'/);
 assert.match(s,/lstatSync\(shortState\)/);
});
test('dependency source is vendored, not a symlink to the original machine',()=>{
 assert.ok(lstatSync(root+'vendor/ego-lite/package/ego-browser').isDirectory());
 assert.equal(lstatSync(root+'vendor/ego-lite/package/ego-browser').isSymbolicLink(),false);
 assert.ok(existsSync(root+'vendor/ego-lite/package/ego-browser/package-lock.json'));
});
test('skill describes actual shared daily mode, not the old isolated host preface',()=>{
 const r=spawnSync(process.execPath,[root+'bin/ego-browser','skill'],{encoding:'utf8'});
 assert.equal(r.status,0);assert.match(r.stdout,/Daily Chrome wrapper/);
 assert.match(r.stdout,/Login\/cookies\/storage are shared/);
 assert.doesNotMatch(r.stdout,/personal browser logins are not inherited/);
 assert.match(r.stdout,/\[ego-browser:skill\] end of guide v2\.1\.0/);
});
test('documented inline code is delivered to original SDK stdin',()=>{
 const r=spawnSync(process.execPath,[root+'bin/ego-browser','nodejs','-e','console.log("inline-packaging-only")'],{encoding:'utf8',timeout:10000});
 assert.equal(r.status,0,r.stderr);assert.match(r.stdout,/inline-packaging-only/);
});
test('script file form is only stdin transport, not a second driver',()=>{
 const r=spawnSync(process.execPath,[root+'bin/ego-browser','nodejs',root+'tests/fixtures/log-only.mjs'],{encoding:'utf8',timeout:10000});
 assert.equal(r.status,0,r.stderr);assert.match(r.stdout,/file-packaging-only/);
});
