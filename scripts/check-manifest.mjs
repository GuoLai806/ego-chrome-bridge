// Reproducible content manifest of Git-tracked sources; never traverses a profile.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
const root=path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const hash=data=>createHash('sha256').update(data).digest('hex');
const paths=execFileSync('git',['ls-files','-z'],{cwd:root,encoding:'utf8'}).split('\0').filter(p=>p&&p!=='MANIFEST.json').sort();
const entries=paths.map(p=>{
 const file=path.join(root,p),st=fs.lstatSync(file);
 if(st.isSymbolicLink()){
  const target=fs.readlinkSync(file),resolved=path.resolve(path.dirname(file),target);
  if(!resolved.startsWith(root+path.sep))throw Error('External symlink: '+p);
  return {path:p,type:'symlink',target,sha256:hash(target)};
 }
 if(!st.isFile())throw Error('Not a regular tracked file: '+p);
 return {path:p,type:'file',sha256:hash(fs.readFileSync(file))};
});
if(process.argv[2]==='--write'){
 fs.writeFileSync(path.join(root,'MANIFEST.json'),JSON.stringify({algorithm:'SHA256; symlinks hash literal link target; manifest excludes itself',entries},null,2)+'\n');
 console.log(JSON.stringify({written:true,entries:entries.length}));
}else{
 const saved=JSON.parse(fs.readFileSync(path.join(root,'MANIFEST.json'),'utf8'));
 if(JSON.stringify(saved.entries)!==JSON.stringify(entries))throw Error('Tracked files or content changed; review before regenerating manifest');
 console.log(JSON.stringify({verified:true,entries:entries.length}));
}
