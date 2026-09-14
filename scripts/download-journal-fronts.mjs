import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const outDir = path.resolve('public/images/journals');
const UA = 'SEOL-LabSite/1.0 (mailto:jb.seol@postech.ac.kr)';

const files = [
  ['cover-journal-of-materials-science.png', 'https://media.springernature.com/w400/springer-static/cover-hires/journal/10853'],
  ['cover-tiim.png', 'https://media.springernature.com/w400/springer-static/cover-hires/journal/12666'],
  ['cover-applied-microscopy.png', 'https://media.springernature.com/w400/springer-static/cover-hires/journal/42649'],
  ['cover-metalmat.gif', 'https://onlinelibrary.wiley.com/cms/asset/6dc1060c-9a4e-4dce-b114-c370f10f9431/metm.v3.2.cover.gif'],
  ['cover-materials-design.gif', 'https://ars.els-cdn.com/content/image/1-s2.0-S0264127524X0012X-cov200h.gif'],
  ['cover-msea.gif', 'https://ars.els-cdn.com/content/image/1-s2.0-S0921509324X0012X-cov200h.gif'],
];

const extras = [
  ['cover-powder-metallurgy.jpg', 'https://journals.sagepub.com/pb-assets/cmscontent/PMJ/PMJ_cover.jpg'],
  ['cover-powder-metallurgy.jpg', 'https://journals.sagepub.com/sda/1242/cover.gif'],
  ['cover-jpm.jpg', 'https://www.powdermat.org/image/journal_cover.jpg'],
  ['cover-jpm.jpg', 'https://www.powdermat.org/upload/journal_cover.jpg'],
];

await mkdir(outDir, { recursive: true });

const save = async (fileName, url) => {
  const res = await fetch(url, { headers: { 'User-Agent': UA, Accept: 'image/*,*/*' }, redirect: 'follow' });
  const type = res.headers.get('content-type') ?? '';
  if (!res.ok || !type.startsWith('image/')) {
    console.log('FAIL', fileName, res.status, type, url);
    return false;
  }
  const buffer = Buffer.from(await res.arrayBuffer());
  if (buffer.length < 1500) {
    console.log('TINY', fileName, buffer.length, url);
    return false;
  }
  await writeFile(path.join(outDir, fileName), buffer);
  console.log('OK', fileName, buffer.length, type);
  return true;
};

for (const [fileName, url] of files) {
  await save(fileName, url);
}

for (const [fileName, url] of extras) {
  if (await save(fileName, url)) break;
}
