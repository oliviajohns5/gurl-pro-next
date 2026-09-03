import { isReservedSlug } from './reserved'

export function normalizeDestination(input: string) {
  const url = new URL(input)
  if (!['http:', 'https:'].includes(url.protocol)) throw new Error('Only http/https URLs are allowed')
  const host = url.hostname.toLowerCase()
  if (host === 'localhost' || host.endsWith('.local')) throw new Error('Local destinations are not allowed')
  if (/^(127\.|10\.|192\.168\.|169\.254\.)/.test(host)) throw new Error('Private IP destinations are not allowed')
  if (/^172\.(1[6-9]|2\d|3[0-1])\./.test(host)) throw new Error('Private IP destinations are not allowed')
  url.hash = ''
  return url.toString()
}

export function normalizeSlug(input: string) {
  const slug = input.trim().replace(/^\/+|\/+$/g, '')
  if (!slug) return ''
  if (!/^[a-zA-Z0-9_-]{2,64}$/.test(slug)) throw new Error('Custom slug can contain letters, numbers, _ or -, 2-64 chars')
  if (isReservedSlug(slug)) throw new Error('This slug is reserved')
  return slug
}
