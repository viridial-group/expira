// Campaign email tracking utilities

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL || 'https://expira.io'

/**
 * Inject tracking pixel into email HTML
 */
export function injectTrackingPixel(html: string, campaignId: string, email: string): string {
  const trackingPixel = `<img src="${BASE_URL}/api/tracking/campaign/open?c=${encodeURIComponent(campaignId)}&e=${encodeURIComponent(email)}" width="1" height="1" style="display:none;width:1px;height:1px;border:0;" alt="" />`
  
  // Try to inject before closing </body> tag
  if (html.includes('</body>')) {
    return html.replace('</body>', `${trackingPixel}</body>`)
  }
  
  // If no body tag, append at the end
  return html + trackingPixel
}

/**
 * Replace all links in email HTML with tracked links
 */
export function injectClickTracking(html: string, campaignId: string, email: string): string {
  // Match all href attributes in anchor tags
  const linkRegex = /<a\s+([^>]*\s+)?href=["']([^"']+)["']([^>]*)>/gi
  
  return html.replace(linkRegex, (match, before, url, after) => {
    // Skip if already a tracking link or mailto/tel links
    if (url.startsWith('/api/tracking/campaign/click') || 
        url.startsWith('mailto:') || 
        url.startsWith('tel:') ||
        url.startsWith('#')) {
      return match
    }
    
    // Create tracked URL
    const trackedUrl = `${BASE_URL}/api/tracking/campaign/click?c=${encodeURIComponent(campaignId)}&e=${encodeURIComponent(email)}&u=${encodeURIComponent(url)}`
    
    // Replace href with tracked URL
    return `<a ${before || ''}href="${trackedUrl}"${after}>`
  })
}

/**
 * Inject both tracking pixel and click tracking into email HTML
 */
export function injectCampaignTracking(
  html: string,
  campaignId: string,
  email: string
): string {
  let trackedHtml = html
  
  // First inject click tracking
  trackedHtml = injectClickTracking(trackedHtml, campaignId, email)
  
  // Then inject tracking pixel
  trackedHtml = injectTrackingPixel(trackedHtml, campaignId, email)
  
  return trackedHtml
}

