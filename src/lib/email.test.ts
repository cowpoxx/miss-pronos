import { describe, expect, it } from 'vitest'
import { escapeHtml } from './email'

describe('escapeHtml', () => {
  it('escapes HTML metacharacters before user text is inserted into an email', () => {
    expect(escapeHtml(`<script>"x" & 'y'</script>`)).toBe(
      '&lt;script&gt;&quot;x&quot; &amp; &#39;y&#39;&lt;/script&gt;',
    )
  })
})
