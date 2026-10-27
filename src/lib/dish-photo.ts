import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';

/** Side of an uploaded dish photo, in pixels: sharp on a tablet, quick to upload. */
const PHOTO_SIZE = 1200;

/**
 * Crops a photo to a centered square (the app shows dish photos square), shrinks it,
 * and saves it as a JPEG. Returns the new image's local URI. The dish-photos bucket
 * only takes JPEG, PNG, or WebP up to 5 MB, and iPhones save HEIC photos at 12 MP+.
 */
export async function toDishPhoto(uri: string): Promise<string> {
  // Rendered once first, since pickers don't always report the size.
  const original = await ImageManipulator.manipulate(uri).renderAsync();
  const side = Math.min(original.width, original.height);
  const context = ImageManipulator.manipulate(original).crop({
    originX: Math.floor((original.width - side) / 2),
    originY: Math.floor((original.height - side) / 2),
    width: side,
    height: side,
  });
  if (side > PHOTO_SIZE) context.resize({ width: PHOTO_SIZE, height: PHOTO_SIZE });
  const image = await context.renderAsync();
  const saved = await image.saveAsync({ format: SaveFormat.JPEG, compress: 0.8 });
  return saved.uri;
}

/**
 * Storage path for a dish's photo, e.g. "twice-cooked-pork-1a2b3c4d.jpg" for
 * "回锅肉 Twice-cooked pork". The random part keeps a replaced photo from being
 * served from an old cache.
 */
export function dishPhotoPath(dishName: string) {
  const slug =
    dishName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'dish';
  const suffix = Math.floor(Math.random() * 0x100000000)
    .toString(16)
    .padStart(8, '0');
  return `${slug}-${suffix}.jpg`;
}
