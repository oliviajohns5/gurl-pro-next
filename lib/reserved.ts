export const RESERVED_SLUGS = new Set([
  'admin','api','login','logout','stats','about','terms','privacy','report','contact','shorten',
  'yourls-api.php','yourls-go.php','yourls-infos.php','pages','css','js','images','frontend','user','includes'
])

export function isReservedSlug(slug: string) {
  return RESERVED_SLUGS.has(slug.toLowerCase())
}
