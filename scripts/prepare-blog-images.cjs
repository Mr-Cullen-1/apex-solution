/* eslint-disable @typescript-eslint/no-require-imports -- Build optimized local editorial assets. */
const fs = require('node:fs');
const path = require('node:path');
const sharp = require('sharp');
const generated = [
  {
    "name": "laundry",
    "path": "C:\\Users\\User\\.codex\\generated_images\\01a2116b-2ca6-75b2-a01f-7ced6789bd81\\exec-3a1387df-b015-41af-8170-f597b7a4f201.png"
  },
  {
    "name": "dishwasher",
    "path": "C:\\Users\\User\\.codex\\generated_images\\01a2116b-2ca6-75b2-a01f-7ced6789bd81\\exec-0f13cde5-aaeb-4e9f-89e4-6075eeeb1c87.png"
  },
  {
    "name": "commercial-refrigeration",
    "path": "C:\\Users\\User\\.codex\\generated_images\\01a2116b-2ca6-75b2-a01f-7ced6789bd81\\exec-d87097dc-b388-4812-8acb-6ee555b6ce09.png"
  },
  {
    "name": "walk-in",
    "path": "C:\\Users\\User\\.codex\\generated_images\\01a2116b-2ca6-75b2-a01f-7ced6789bd81\\exec-6e23351e-38c0-4d87-9ab7-2926cc1caff0.png"
  },
  {
    "name": "commercial-ice",
    "path": "C:\\Users\\User\\.codex\\generated_images\\01a2116b-2ca6-75b2-a01f-7ced6789bd81\\exec-b842ef85-626b-4fb7-b17b-618d251b9b66.png"
  },
  {
    "name": "commercial-oven",
    "path": "C:\\Users\\User\\.codex\\generated_images\\01a2116b-2ca6-75b2-a01f-7ced6789bd81\\exec-2d0e9610-693e-4cd9-9c21-d9ca61badacd.png"
  }
];
async function main() {
 const out='public/resources/client-articles';const originals='output/blog-assets/originals';fs.mkdirSync(out,{recursive:true});fs.mkdirSync(originals,{recursive:true});
 for(const asset of generated){const local=path.join(originals,asset.name+'.png');if(!fs.existsSync(local))fs.copyFileSync(asset.path,local);await sharp(local).resize(1600,900,{fit:'cover'}).webp({quality:84}).toFile(path.join(out,asset.name+'.webp'));}
 const existing=[['furnace','public/resources/furnace-not-heating-common-problems/residential-gas-furnace-hero.webp'],['refrigerator','public/images/real/appliance-card.jpg'],['oven','public/images/real/appliance-oven-card.jpg'],['ice-maker','public/images/real/ice-maker-replacement-after.jpg']];
 for(const [name,source] of existing) await sharp(source).resize(1600,900,{fit:'cover'}).webp({quality:84}).toFile(path.join(out,name+'.webp'));
 const manifest=await Promise.all([...generated.map(a=>a.name),...existing.map(a=>a[0])].map(async name=>{const p=path.join(out,name+'.webp');const m=await sharp(p).metadata();return {name,path:p,width:m.width,height:m.height,bytes:fs.statSync(p).size};}));fs.writeFileSync('output/blog-assets/manifest.json',JSON.stringify(manifest,null,2));console.log(JSON.stringify(manifest));
}main().catch(e=>{console.error(e);process.exitCode=1;});
