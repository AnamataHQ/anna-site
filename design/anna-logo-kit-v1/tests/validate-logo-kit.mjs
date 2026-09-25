import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import sharp from 'sharp';

const kitRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const releaseZip = resolve(kitRoot, '..', 'anna-logo-kit-v1.zip');

const rasterVariants = [
  'color-transparent',
  'color-navy-rounded',
  'color-black-rounded',
  'mono-dark',
  'mono-light',
];

const rasterSizes = [
  16, 20, 24, 32, 36, 40, 48, 64, 72, 80, 96, 120, 128, 144, 150,
  180, 192, 256, 384, 512, 1024,
];

const avatarSizes = [32, 48, 64, 96, 128, 192, 256, 400, 512, 1024];

function readJson(path) {
  return JSON.parse(readFileSync(resolve(kitRoot, path), 'utf8'));
}

function readZipEntries(path) {
  const archive = readFileSync(path);
  const entries = [];
  const centralHeader = 0x02014b50;
  for (let offset = 0; offset <= archive.length - 46; offset += 1) {
    if (archive.readUInt32LE(offset) !== centralHeader) continue;
    const fileNameLength = archive.readUInt16LE(offset + 28);
    const extraLength = archive.readUInt16LE(offset + 30);
    const commentLength = archive.readUInt16LE(offset + 32);
    const nameStart = offset + 46;
    entries.push(
      archive.subarray(nameStart, nameStart + fileNameLength).toString('utf8'),
    );
    offset = nameStart + fileNameLength + extraLength + commentLength - 1;
  }
  return entries;
}

async function assertPng(path, width, height = width) {
  const fullPath = resolve(kitRoot, path);
  assert.ok(existsSync(fullPath), `missing ${path}`);
  const metadata = await sharp(fullPath).metadata();
  assert.equal(metadata.format, 'png', `${path} must be PNG`);
  assert.equal(metadata.width, width, `${path} width`);
  assert.equal(metadata.height, height, `${path} height`);
}

test('contains every approved SVG master and platform derivative', () => {
  for (const source of [
    'anna-color-transparent.svg',
    'anna-color-navy-rounded.svg',
    'anna-color-black-rounded.svg',
    'anna-mono-dark.svg',
    'anna-mono-light.svg',
    'anna-color-navy-square.svg',
    'anna-color-black-square.svg',
    'anna-color-transparent-tight.svg',
    'anna-mono-light-tight.svg',
  ]) {
    const path = resolve(kitRoot, 'sources', source);
    assert.ok(existsSync(path), `missing sources/${source}`);
    const svg = readFileSync(path, 'utf8');
    assert.match(svg, /data-master="relay-master-04"/);
    assert.match(svg, /M42 158V62/);
    assert.match(svg, /M158 42V138/);
  }
});

test('exports complete standard-size PNG ladders for all five variants', async () => {
  for (const variant of rasterVariants) {
    for (const size of rasterSizes) {
      await assertPng(
        `png/${variant}/anna-${variant}-${size}x${size}.png`,
        size,
      );
    }
  }
});

test('ships Teams assets at exact dimensions with a safe full-bleed color icon', async () => {
  await assertPng('platforms/teams/color.png', 192);
  await assertPng('platforms/teams/outline.png', 32);
  await assertPng('platforms/teams/color32x32.png', 32);
  await assertPng('platforms/teams/focused.png', 32);

  const { data: color, info } = await sharp(
    resolve(kitRoot, 'platforms/teams/color.png'),
  )
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const navy = [8, 21, 46, 255];
  let minX = info.width;
  let minY = info.height;
  let maxX = -1;
  let maxY = -1;
  for (let y = 0; y < info.height; y += 1) {
    for (let x = 0; x < info.width; x += 1) {
      const offset = (y * info.width + x) * 4;
      const pixel = [...color.subarray(offset, offset + 4)];
      if (pixel.some((channel, index) => channel !== navy[index])) {
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
    }
  }
  assert.ok(minX >= 36 && minY >= 36, 'Teams mark exceeds 120px safe area');
  assert.ok(maxX <= 155 && maxY <= 155, 'Teams mark exceeds 120px safe area');
  for (const [x, y] of [
    [0, 0],
    [191, 0],
    [0, 191],
    [191, 191],
  ]) {
    const offset = (y * info.width + x) * 4;
    assert.deepEqual(
      [...color.subarray(offset, offset + 4)],
      navy,
      'Teams color icon must be square and full bleed',
    );
  }

  const { data: outline, info: outlineInfo } = await sharp(
    resolve(kitRoot, 'platforms/teams/outline.png'),
  )
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  let minOutlineX = outlineInfo.width;
  let minOutlineY = outlineInfo.height;
  let maxOutlineX = -1;
  let maxOutlineY = -1;
  for (let y = 0; y < outlineInfo.height; y += 1) {
    for (let x = 0; x < outlineInfo.width; x += 1) {
      const offset = (y * outlineInfo.width + x) * 4;
      const [red, green, blue, alpha] = outline.subarray(offset, offset + 4);
      if (alpha > 0) {
        assert.equal(red, 255, 'Teams outline must be white');
        assert.equal(green, 255, 'Teams outline must be white');
        assert.equal(blue, 255, 'Teams outline must be white');
        minOutlineX = Math.min(minOutlineX, x);
        minOutlineY = Math.min(minOutlineY, y);
        maxOutlineX = Math.max(maxOutlineX, x);
        maxOutlineY = Math.max(maxOutlineY, y);
      }
    }
  }
  assert.deepEqual(
    [minOutlineX, minOutlineY, maxOutlineX, maxOutlineY],
    [0, 0, 31, 31],
    'Teams outline must not contain extra padding',
  );

  const snippet = readJson('platforms/teams/manifest-icons.snippet.json');
  assert.deepEqual(snippet.icons, {
    color: 'color.png',
    outline: 'outline.png',
    color32x32: 'color32x32.png',
  });
});

test('ships web, PWA, favicon, and avatar packages', async () => {
  for (const [path, size] of [
    ['platforms/web/favicon-16x16.png', 16],
    ['platforms/web/favicon-32x32.png', 32],
    ['platforms/web/favicon-48x48.png', 48],
    ['platforms/web/apple-touch-icon.png', 180],
    ['platforms/web/android-chrome-192x192.png', 192],
    ['platforms/web/android-chrome-512x512.png', 512],
    ['platforms/web/maskable-icon-192x192.png', 192],
    ['platforms/web/maskable-icon-512x512.png', 512],
    ['platforms/web/mstile-150x150.png', 150],
  ]) {
    await assertPng(path, size);
  }
  const ico = readFileSync(resolve(kitRoot, 'platforms/web/favicon.ico'));
  assert.deepEqual([...ico.subarray(0, 4)], [0, 0, 1, 0]);
  assert.equal(ico.readUInt16LE(4), 3, 'favicon.ico must contain three sizes');

  const webManifest = readJson('platforms/web/site.webmanifest');
  assert.equal(webManifest.name, 'Anna');
  assert.ok(webManifest.icons.some((icon) => icon.purpose === 'maskable'));

  for (const size of avatarSizes) {
    await assertPng(
      `platforms/avatar/anna-avatar-${size}x${size}.png`,
      size,
    );
  }
});

test('documents the kit and records reproducible checksums', () => {
  const manifest = readJson('brand-manifest.json');
  assert.equal(manifest.name, 'Anna Relay');
  assert.equal(manifest.version, '1.0.0');
  assert.equal(manifest.master, 'relay-master-04');
  assert.deepEqual(manifest.rasterSizes, rasterSizes);
  assert.deepEqual(manifest.avatarSizes, avatarSizes);

  const readme = readFileSync(resolve(kitRoot, 'README.md'), 'utf8');
  assert.match(readme, /Microsoft Teams/);
  assert.match(readme, /ANNA is a palindrome/);
  assert.match(readme, /Do not redraw/);

  const checksumLines = readFileSync(
    resolve(kitRoot, 'CHECKSUMS.sha256'),
    'utf8',
  )
    .trim()
    .split('\n');
  assert.ok(checksumLines.length > 130, 'checksum inventory is incomplete');
  for (const line of checksumLines) {
    const match = line.match(/^([a-f0-9]{64})  (.+)$/);
    assert.ok(match, `invalid checksum line: ${line}`);
    const [, expected, relativePath] = match;
    const actual = createHash('sha256')
      .update(readFileSync(resolve(kitRoot, relativePath)))
      .digest('hex');
    assert.equal(actual, expected, `checksum mismatch: ${relativePath}`);
  }
});

test('includes preview and portable release archives', async () => {
  await assertPng('previews/anna-logo-kit-contact-sheet.png', 1800, 1200);
  assert.ok(existsSync(releaseZip), 'missing anna-logo-kit-v1.zip');
  const archiveEntries = readZipEntries(releaseZip);
  assert.ok(archiveEntries.length > 130, 'release ZIP inventory is incomplete');
  for (const required of [
    'anna-logo-kit-v1/README.md',
    'anna-logo-kit-v1/sources/anna-color-transparent.svg',
    'anna-logo-kit-v1/platforms/teams/color.png',
    'anna-logo-kit-v1/platforms/teams/outline.png',
    'anna-logo-kit-v1/platforms/web/favicon.ico',
  ]) {
    assert.ok(archiveEntries.includes(required), `release ZIP missing ${required}`);
  }
});
