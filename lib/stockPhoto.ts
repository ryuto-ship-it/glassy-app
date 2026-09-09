// Real stock photography (Lorem Picsum) used where the demo has no actual
// source photo — community post images, the review-composer's image picker.
// Seeded so a given id always resolves to the same photo across renders.
export function stockPhotoUrl(seed: string, width = 600, height = 440): string {
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/${width}/${height}`;
}
