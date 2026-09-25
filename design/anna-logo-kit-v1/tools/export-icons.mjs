import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import {
  copyFile,
  mkdir,
  readFile,
  readdir,
  rm,
  stat,
  writeFile,
} from 'node:fs/promises';
import { basename, dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const kitRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const kitParent = dirname(kitRoot);
const kitName = basename(kitRoot);
const releaseZip = resolve(kitParent, `${kitName}.zip`);

const rasterSizes = [
  16, 20, 24, 32, 36, 40, 48, 64, 72, 80, 96, 120, 128, 144, 150,
  180, 192, 256, 384, 512, 1024,
];
const avatarSizes = [32, 48, 64, 96, 128, 192, 256, 400, 512, 1024];
const variants = {
  'color-transparent': 'anna-color-transparent.svg',
  'color-navy-rounded': 'anna-color-navy-rounded.svg',
  'color-black-rounded': 'anna-color-black-rounded.svg',
  'mono-dark': 'anna-mono-dark.svg',
  'mono-light': 'anna-mono-light.svg',
};

const sourcePath = (name) => resolve(kitRoot, 'sources', name);
const outputPath = (...parts) => resolve(kitRoot, ...parts);

async function renderPng(source, destination, size) {
  await mkdir(dirname(destination), { recursive: true });
  const density = Math.max(72, Math.ceil((size / 512) * 72));
  await sharp(source, { density })
    .resize(size, size, { fit: 'fill' })
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toFile(destination);
}

async function writeJson(destination, value) {
  await mkdir(dirname(destination), { recursive: true });
  await writeFile(destination, `${JSON.stringify(value, null, 2)}\n`);
}

async function listFiles(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const fullPath = join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await listFiles(fullPath)));
    } else if (entry.isFile()) {
      files.push(fullPath);
    }
  }
  return files;
}

async function svgDataUri(name) {
  const source = await readFile(sourcePath(name));
  return `data:image/svg+xml;base64,${source.toString('base64')}`;
}

async function buildRasterLadders() {
  for (const [variant, source] of Object.entries(variants)) {
    for (const size of rasterSizes) {
      await renderPng(
        sourcePath(source),
        outputPath(
          'png',
          variant,
          `anna-${variant}-${size}x${size}.png`,
        ),
        size,
      );
    }
  }
}

async function buildTeamsAssets() {
  const teamsDirectory = outputPath('platforms', 'teams');
  await mkdir(teamsDirectory, { recursive: true });
  await renderPng(
    sourcePath('anna-color-navy-square.svg'),
    join(teamsDirectory, 'color.png'),
    192,
  );
  await renderPng(
    sourcePath('anna-mono-light-tight.svg'),
    join(teamsDirectory, 'outline.png'),
    32,
  );
  await renderPng(
    sourcePath('anna-color-transparent-tight.svg'),
    join(teamsDirectory, 'color32x32.png'),
    32,
  );
  await copyFile(
    join(teamsDirectory, 'color32x32.png'),
    join(teamsDirectory, 'focused.png'),
  );

  await writeJson(join(teamsDirectory, 'manifest-icons.snippet.json'), {
    icons: {
      color: 'color.png',
      outline: 'outline.png',
      color32x32: 'color32x32.png',
    },
    accentColor: '#2C548C',
  });
  await writeJson(join(teamsDirectory, 'manifest-icons.v1.17.snippet.json'), {
    icons: {
      color: 'color.png',
      outline: 'outline.png',
    },
    accentColor: '#2C548C',
  });
  await writeFile(
    join(teamsDirectory, 'README.md'),
    `# Microsoft Teams icon assets

Use \`color.png\` and \`outline.png\` in every Teams app package. Both files meet the current Microsoft dimensions: 192 × 192 full-color and 32 × 32 white-on-transparent respectively.

The current \`anna-assistant\` manifests use schema 1.17, so copy the two required properties from \`manifest-icons.v1.17.snippet.json\`. Use \`manifest-icons.snippet.json\` only after moving to a schema that supports the optional \`color32x32\` property.

\`focused.png\` is supplied for host surfaces that accept a separate pressed-state icon. It is identical to the transparent full-color 32-pixel asset.

Do not round \`color.png\`: Teams applies its own corner mask. The Anna mark is confined to the 120 × 120 central safe area.
`,
  );

  const teamsZip = join(teamsDirectory, 'anna-teams-icon-assets.zip');
  execFileSync(
    'zip',
    [
      '-X',
      '-q',
      '-j',
      teamsZip,
      join(teamsDirectory, 'color.png'),
      join(teamsDirectory, 'outline.png'),
      join(teamsDirectory, 'color32x32.png'),
      join(teamsDirectory, 'focused.png'),
      join(teamsDirectory, 'manifest-icons.snippet.json'),
      join(teamsDirectory, 'manifest-icons.v1.17.snippet.json'),
      join(teamsDirectory, 'README.md'),
    ],
    { stdio: 'ignore' },
  );
}

async function buildWebAssets() {
  const webDirectory = outputPath('platforms', 'web');
  await mkdir(webDirectory, { recursive: true });

  await copyFile(
    sourcePath('anna-color-black-rounded.svg'),
    join(webDirectory, 'favicon.svg'),
  );
  await copyFile(
    sourcePath('anna-mono-black-tight.svg'),
    join(webDirectory, 'safari-pinned-tab.svg'),
  );

  for (const size of [16, 32, 48]) {
    await renderPng(
      sourcePath('anna-color-black-rounded.svg'),
      join(webDirectory, `favicon-${size}x${size}.png`),
      size,
    );
  }
  await renderPng(
    sourcePath('anna-color-navy-square.svg'),
    join(webDirectory, 'apple-touch-icon.png'),
    180,
  );
  for (const size of [192, 512]) {
    await renderPng(
      sourcePath('anna-color-navy-square.svg'),
      join(webDirectory, `android-chrome-${size}x${size}.png`),
      size,
    );
    await renderPng(
      sourcePath('anna-color-navy-square.svg'),
      join(webDirectory, `maskable-icon-${size}x${size}.png`),
      size,
    );
  }
  await renderPng(
    sourcePath('anna-color-navy-square.svg'),
    join(webDirectory, 'mstile-150x150.png'),
    150,
  );

  execFileSync(
    'convert',
    [
      join(webDirectory, 'favicon-16x16.png'),
      join(webDirectory, 'favicon-32x32.png'),
      join(webDirectory, 'favicon-48x48.png'),
      join(webDirectory, 'favicon.ico'),
    ],
    { stdio: 'ignore' },
  );

  await writeJson(join(webDirectory, 'site.webmanifest'), {
    name: 'Anna',
    short_name: 'Anna',
    icons: [
      {
        src: 'android-chrome-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: 'android-chrome-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: 'maskable-icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: 'maskable-icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    theme_color: '#08152E',
    background_color: '#08152E',
    display: 'standalone',
  });
  await writeFile(
    join(webDirectory, 'browserconfig.xml'),
    `<?xml version="1.0" encoding="utf-8"?>
<browserconfig>
  <msapplication>
    <tile>
      <square150x150logo src="mstile-150x150.png"/>
      <TileColor>#08152E</TileColor>
    </tile>
  </msapplication>
</browserconfig>
`,
  );
  await writeFile(
    join(webDirectory, 'head-snippet.html'),
    `<link rel="icon" href="/favicon.ico" sizes="any">
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="mask-icon" href="/safari-pinned-tab.svg" color="#08152E">
<link rel="manifest" href="/site.webmanifest">
<meta name="msapplication-TileColor" content="#08152E">
<meta name="theme-color" content="#08152E">
`,
  );
  await writeFile(
    join(webDirectory, 'README.md'),
    `# Web and PWA icon assets

Copy the required files to the public root of the web application and adapt the paths in \`head-snippet.html\` if the app is hosted below a subpath.

The Apple Touch, Android, maskable and Microsoft tile icons use a full-bleed Anna navy background. Browser favicons use the rounded black treatment for maximum contrast at very small sizes.
`,
  );
}

async function buildAvatarAssets() {
  const avatarDirectory = outputPath('platforms', 'avatar');
  await mkdir(avatarDirectory, { recursive: true });
  for (const size of avatarSizes) {
    await renderPng(
      sourcePath('anna-color-navy-rounded.svg'),
      join(avatarDirectory, `anna-avatar-${size}x${size}.png`),
      size,
    );
  }
  await writeFile(
    join(avatarDirectory, 'README.md'),
    `# Avatar assets

Use the rounded Anna navy avatar wherever the host accepts a finished profile image. Choose the smallest supplied file that is at least as large as the rendered size; do not upscale a raster export.

For platforms that apply their own mask, start from \`../../sources/anna-color-navy-square.svg\` or use the dedicated platform folder instead.
`,
  );
}

async function buildContactSheet() {
  const previewDirectory = outputPath('previews');
  await mkdir(previewDirectory, { recursive: true });

  const [
    transparent,
    navy,
    black,
    monoDark,
    monoLight,
    teamsSquare,
    teamsOutline,
  ] =
    await Promise.all([
      svgDataUri('anna-color-transparent.svg'),
      svgDataUri('anna-color-navy-rounded.svg'),
      svgDataUri('anna-color-black-rounded.svg'),
      svgDataUri('anna-mono-dark.svg'),
      svgDataUri('anna-mono-light.svg'),
      svgDataUri('anna-color-navy-square.svg'),
      svgDataUri('anna-mono-light-tight.svg'),
    ]);
  const sheet = `<svg xmlns="http://www.w3.org/2000/svg" width="1800" height="1200" viewBox="0 0 1800 1200">
  <defs>
    <linearGradient id="page" x1="0" y1="0" x2="1800" y2="1200" gradientUnits="userSpaceOnUse"><stop stop-color="#F8F3EC"/><stop offset="1" stop-color="#EEE8DF"/></linearGradient>
    <pattern id="checker" width="20" height="20" patternUnits="userSpaceOnUse"><rect width="20" height="20" fill="#FFF"/><rect width="10" height="10" fill="#E8E5DF"/><rect x="10" y="10" width="10" height="10" fill="#E8E5DF"/></pattern>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="#08152E" flood-opacity=".10"/></filter>
    <style>.eyebrow{font:700 18px Arial,sans-serif;letter-spacing:4px;fill:#3159C7}.title{font:700 58px Arial,sans-serif;letter-spacing:-2px;fill:#08152E}.subtitle{font:400 23px Arial,sans-serif;fill:#526078}.label{font:700 19px Arial,sans-serif;fill:#08152E}.caption{font:400 16px Arial,sans-serif;fill:#667085}.light{fill:#FFF}.muted-light{fill:#AEB9CC}</style>
  </defs>
  <rect width="1800" height="1200" fill="url(#page)"/>
  <text x="88" y="78" class="eyebrow">ANNA RELAY · LOGO KIT 1.0</text>
  <text x="88" y="148" class="title">One master. Every production context.</text>
  <text x="88" y="194" class="subtitle">Approved variants, exact platform exports and repeatable sizing from 16 to 1024 pixels.</text>

  <g filter="url(#shadow)">
    <rect x="80" y="246" width="312" height="416" rx="30" fill="#FFF"/>
    <rect x="412" y="246" width="312" height="416" rx="30" fill="#08152E"/>
    <rect x="744" y="246" width="312" height="416" rx="30" fill="#000"/>
    <rect x="1076" y="246" width="312" height="416" rx="30" fill="#FFF"/>
    <rect x="1408" y="246" width="312" height="416" rx="30" fill="#08152E"/>
  </g>
  <rect x="106" y="274" width="260" height="260" rx="20" fill="url(#checker)"/>
  <image href="${transparent}" x="106" y="274" width="260" height="260"/>
  <image href="${navy}" x="438" y="274" width="260" height="260"/>
  <image href="${black}" x="770" y="274" width="260" height="260"/>
  <image href="${monoDark}" x="1102" y="274" width="260" height="260"/>
  <image href="${monoLight}" x="1434" y="274" width="260" height="260"/>
  <text x="106" y="586" class="label">Full color</text><text x="106" y="616" class="caption">Transparent</text>
  <text x="438" y="586" class="label light">Full color</text><text x="438" y="616" class="caption muted-light">Anna navy</text>
  <text x="770" y="586" class="label light">Full color</text><text x="770" y="616" class="caption muted-light">Black</text>
  <text x="1102" y="586" class="label">Mono dark</text><text x="1102" y="616" class="caption">Navy on light</text>
  <text x="1434" y="586" class="label light">Mono light</text><text x="1434" y="616" class="caption muted-light">White on dark</text>

  <rect x="80" y="714" width="780" height="390" rx="32" fill="#FFF" filter="url(#shadow)"/>
  <text x="116" y="764" class="eyebrow">MICROSOFT TEAMS</text>
  <image href="${teamsSquare}" x="116" y="804" width="230" height="230"/>
  <rect x="382" y="804" width="230" height="230" rx="28" fill="#08152E"/>
  <image href="${teamsOutline}" x="398" y="820" width="198" height="198"/>
  <image href="${transparent}" x="650" y="862" width="110" height="110"/>
  <text x="116" y="1070" class="label">192 color</text><text x="382" y="1070" class="label">32 outline</text><text x="650" y="1004" class="label">32 color</text>

  <rect x="900" y="714" width="820" height="390" rx="32" fill="#08152E" filter="url(#shadow)"/>
  <text x="936" y="764" class="eyebrow">SMALL TO LARGE</text>
  <text x="1168" y="764" class="caption muted-light">Choose the smallest raster at least as large as its rendered size.</text>
  <g transform="translate(936 824)">
    <image href="${transparent}" x="0" y="100" width="32" height="32"/><text x="0" y="158" class="caption muted-light">32</text>
    <image href="${transparent}" x="84" y="84" width="64" height="64"/><text x="96" y="174" class="caption muted-light">64</text>
    <image href="${transparent}" x="202" y="52" width="128" height="128"/><text x="246" y="206" class="caption muted-light">128</text>
    <image href="${navy}" x="386" y="0" width="232" height="232"/><text x="480" y="258" class="caption muted-light">512+</text>
  </g>
</svg>`;

  const svgPath = join(previewDirectory, 'anna-logo-kit-contact-sheet.svg');
  await writeFile(svgPath, sheet);
  await sharp(Buffer.from(sheet))
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toFile(join(previewDirectory, 'anna-logo-kit-contact-sheet.png'));
}

async function writeChecksums() {
  const checksumPath = outputPath('CHECKSUMS.sha256');
  const files = (await listFiles(kitRoot))
    .filter((path) => path !== checksumPath)
    .sort((left, right) => left.localeCompare(right));
  const lines = [];
  for (const path of files) {
    const info = await stat(path);
    if (!info.isFile()) continue;
    const digest = createHash('sha256')
      .update(await readFile(path))
      .digest('hex');
    lines.push(`${digest}  ${relative(kitRoot, path).replaceAll('\\', '/')}`);
  }
  await writeFile(checksumPath, `${lines.join('\n')}\n`);
}

async function buildReleaseArchive() {
  await rm(releaseZip, { force: true });
  execFileSync('zip', ['-X', '-q', '-r', releaseZip, kitName], {
    cwd: kitParent,
    stdio: 'ignore',
  });
}

async function main() {
  for (const directory of ['png', 'platforms', 'previews']) {
    await rm(outputPath(directory), { recursive: true, force: true });
  }
  await rm(outputPath('CHECKSUMS.sha256'), { force: true });
  await rm(releaseZip, { force: true });

  await buildRasterLadders();
  await buildTeamsAssets();
  await buildWebAssets();
  await buildAvatarAssets();
  await buildContactSheet();
  await writeChecksums();
  await buildReleaseArchive();

  process.stdout.write(`${releaseZip}\n`);
}

await main();
