import type { MouseEvent } from 'react'

type Downloads = { save: (r: { filename: string; data: Blob }) => Promise<unknown> }
type ClaudeHost = { use?: (name: string) => Promise<Downloads | null> }

// Normal case: the résumé is a regular URL, so the browser just follows the link.
// Embedded case (single-file preview): the href is a data: URI, which browsers block
// from opening directly, so hand the PDF to the host's download capability instead
// (falling back to a blob URL when that capability isn't available).
export function openResume(event: MouseEvent<HTMLAnchorElement>) {
  const href = event.currentTarget.getAttribute('href') || ''
  if (!href.startsWith('data:')) return
  event.preventDefault()
  const bin = atob(href.slice(href.indexOf(',') + 1))
  const bytes = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i += 1) bytes[i] = bin.charCodeAt(i)
  const blob = new Blob([bytes], { type: 'application/pdf' })
  const host = (window as unknown as { claude?: ClaudeHost }).claude
  const viaBlob = () => { try { window.open(URL.createObjectURL(blob), '_blank', 'noopener') } catch { /* ignore */ } }
  if (host?.use) {
    host.use('downloads')
      .then((dl) => (dl ? dl.save({ filename: 'Vasundhara_Pattnayak_Resume.pdf', data: blob }) : viaBlob()))
      .catch((err: { code?: string }) => { if (err?.code !== 'declined') viaBlob() })
  } else {
    viaBlob()
  }
}
