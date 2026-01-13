// Email Templates for expira
// Professional, responsive email templates for marketing and communication

export interface EmailTemplateData {
  userName?: string
  productName?: string
  daysUntilExpiry?: number
  url?: string
  [key: string]: any
}

// Base HTML template wrapper
function getBaseTemplate(content: string, title?: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title || 'expira'}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f5f5f5;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 30px; text-align: center; background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%); border-radius: 12px 12px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700; letter-spacing: -0.5px;">
                expira
              </h1>
              <p style="margin: 8px 0 0; color: #e0f2fe; font-size: 16px; font-weight: 500;">
                Monitor & Verify Your Online Products
              </p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              ${content}
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #f9fafb; border-radius: 0 0 12px 12px; border-top: 1px solid #e5e7eb;">
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="text-align: center; padding-bottom: 20px;">
                    <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                      <strong style="color: #111827;">expira</strong><br>
                      Automatically monitor websites, SSL certificates, domains, and APIs.
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="text-align: center; padding-bottom: 20px;">
                    <a href="https://expira.io" style="display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px;">
                      Visit expira.io
                    </a>
                  </td>
                </tr>
                <tr>
                  <td style="text-align: center; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                    <p style="margin: 0; color: #9ca3af; font-size: 12px; line-height: 1.5;">
                      © ${new Date().getFullYear()} expira. All rights reserved.<br>
                      <a href="https://expira.io/privacy" style="color: #0ea5e9; text-decoration: none;">Privacy Policy</a> | 
                      <a href="https://expira.io/terms" style="color: #0ea5e9; text-decoration: none;">Terms of Service</a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `
}

// Welcome Email Template
export function getWelcomeEmailTemplate(data: EmailTemplateData = {}): string {
  const userName = data.userName || 'there'
  const content = `
    <h2 style="margin: 0 0 20px; color: #111827; font-size: 28px; font-weight: 700; line-height: 1.2;">
      Welcome to expira! 🎉
    </h2>
    
    <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">
      Hi ${userName},
    </p>
    
    <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">
      We're thrilled to have you join expira! You've taken the first step towards never missing an expiration again.
    </p>
    
    <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border-left: 4px solid #0ea5e9; padding: 20px; border-radius: 8px; margin: 30px 0;">
      <h3 style="margin: 0 0 12px; color: #0c4a6e; font-size: 18px; font-weight: 600;">
        What you can do with expira:
      </h3>
      <ul style="margin: 0; padding-left: 20px; color: #1e40af; font-size: 15px; line-height: 1.8;">
        <li>Monitor website uptime and domain expiration</li>
        <li>Track SSL certificate expiration dates</li>
        <li>Get instant notifications before products expire</li>
        <li>Monitor API endpoints and response times</li>
        <li>Access detailed analytics and reports</li>
      </ul>
    </div>
    
    <div style="text-align: center; margin: 40px 0;">
      <a href="https://expira.io/dashboard" style="display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%); color: #ffffff; text-decoration: none; border-radius: 10px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(14, 165, 233, 0.3);">
        Get Started Now
      </a>
    </div>
    
    <p style="margin: 30px 0 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
      Need help? Check out our <a href="https://expira.io/docs" style="color: #0ea5e9; text-decoration: none; font-weight: 500;">documentation</a> or reply to this email.
    </p>
  `
  
  return getBaseTemplate(content, 'Welcome to expira')
}

// Invitation Email Template
export function getInvitationEmailTemplate(data: EmailTemplateData = {}): string {
  const userName = data.userName || 'Friend'
  const inviterName = data.inviterName || 'A friend'
  const content = `
    <h2 style="margin: 0 0 20px; color: #111827; font-size: 28px; font-weight: 700; line-height: 1.2;">
      You've been invited to expira! 🚀
    </h2>
    
    <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">
      Hi ${userName},
    </p>
    
    <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">
      <strong>${inviterName}</strong> thought you might be interested in expira - the smart way to monitor and verify your online products.
    </p>
    
    <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 24px; margin: 30px 0;">
      <h3 style="margin: 0 0 16px; color: #111827; font-size: 20px; font-weight: 600;">
        Why expira?
      </h3>
      <div style="color: #374151; font-size: 15px; line-height: 1.8;">
        <p style="margin: 0 0 12px;">
          <strong style="color: #0ea5e9;">✨ Never miss an expiration</strong><br>
          Get instant alerts before your domains, SSL certificates, or websites expire.
        </p>
        <p style="margin: 0 0 12px;">
          <strong style="color: #0ea5e9;">🛡️ Protect your online presence</strong><br>
          Avoid security vulnerabilities and maintain customer trust.
        </p>
        <p style="margin: 0 0 12px;">
          <strong style="color: #0ea5e9;">⚡ Save time and money</strong><br>
          Automated monitoring means you can focus on what matters most.
        </p>
        <p style="margin: 0;">
          <strong style="color: #0ea5e9;">📊 Detailed insights</strong><br>
          Track performance, response times, and get comprehensive reports.
        </p>
      </div>
    </div>
    
    <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-left: 4px solid #f59e0b; padding: 20px; border-radius: 8px; margin: 30px 0;">
      <p style="margin: 0; color: #92400e; font-size: 15px; line-height: 1.6;">
        <strong>🎁 Special Offer:</strong> Start with a <strong>14-day free trial</strong> - no credit card required!
      </p>
    </div>
    
    <div style="text-align: center; margin: 40px 0;">
      <a href="https://expira.io/register" style="display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%); color: #ffffff; text-decoration: none; border-radius: 10px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(14, 165, 233, 0.3);">
        Start Your Free Trial
      </a>
    </div>
    
    <p style="margin: 30px 0 0; color: #6b7280; font-size: 14px; line-height: 1.6; text-align: center;">
      Questions? Visit <a href="https://expira.io" style="color: #0ea5e9; text-decoration: none; font-weight: 500;">expira.io</a> or reply to this email.
    </p>
  `
  
  return getBaseTemplate(content, 'You\'ve been invited to expira')
}

// Marketing/Newsletter Email Template
export function getMarketingEmailTemplate(data: EmailTemplateData = {}): string {
  const userName = data.userName || 'there'
  const content = `
    <h2 style="margin: 0 0 20px; color: #111827; font-size: 28px; font-weight: 700; line-height: 1.2;">
      Don't Let Expirations Catch You Off Guard! ⚠️
    </h2>
    
    <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">
      Hi ${userName},
    </p>
    
    <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">
      Did you know that <strong>expired domains, SSL certificates, and unnoticed API downtimes</strong> cost businesses millions every year?
    </p>
    
    <div style="background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%); border-left: 4px solid #ef4444; padding: 20px; border-radius: 8px; margin: 30px 0;">
      <h3 style="margin: 0 0 12px; color: #991b1b; font-size: 18px; font-weight: 600;">
        The Hidden Costs:
      </h3>
      <ul style="margin: 0; padding-left: 20px; color: #dc2626; font-size: 15px; line-height: 1.8;">
        <li>Security vulnerabilities from expired SSL certificates</li>
        <li>Loss of customer trust and brand reputation</li>
        <li>Costly recovery fees and lost sales</li>
        <li>Hours of downtime and revenue impact</li>
      </ul>
    </div>
    
    <div style="background: #ffffff; border: 2px solid #0ea5e9; border-radius: 12px; padding: 30px; margin: 30px 0; text-align: center;">
      <h3 style="margin: 0 0 16px; color: #0c4a6e; font-size: 24px; font-weight: 700;">
        expira Solves This Problem
      </h3>
      <p style="margin: 0 0 24px; color: #374151; font-size: 16px; line-height: 1.6;">
        Automatically monitor all your online products and get instant notifications before they expire.
      </p>
      
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 24px 0; text-align: left;">
        <div>
          <div style="width: 48px; height: 48px; background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%); border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-bottom: 12px;">
            <span style="font-size: 24px;">🌐</span>
          </div>
          <h4 style="margin: 0 0 8px; color: #111827; font-size: 16px; font-weight: 600;">Website & Domain</h4>
          <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 1.5;">Track uptime and expiration dates</p>
        </div>
        <div>
          <div style="width: 48px; height: 48px; background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-bottom: 12px;">
            <span style="font-size: 24px;">🔒</span>
          </div>
          <h4 style="margin: 0 0 8px; color: #111827; font-size: 16px; font-weight: 600;">SSL Certificates</h4>
          <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 1.5;">Never let certificates expire</p>
        </div>
        <div>
          <div style="width: 48px; height: 48px; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-bottom: 12px;">
            <span style="font-size: 24px;">📡</span>
          </div>
          <h4 style="margin: 0 0 8px; color: #111827; font-size: 16px; font-weight: 600;">API Monitoring</h4>
          <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 1.5;">Ensure APIs are always responsive</p>
        </div>
        <div>
          <div style="width: 48px; height: 48px; background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-bottom: 12px;">
            <span style="font-size: 24px;">🔔</span>
          </div>
          <h4 style="margin: 0 0 8px; color: #111827; font-size: 16px; font-weight: 600;">Instant Alerts</h4>
          <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 1.5;">Email, SMS, and push notifications</p>
        </div>
      </div>
    </div>
    
    <div style="background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border-left: 4px solid #22c55e; padding: 20px; border-radius: 8px; margin: 30px 0;">
      <p style="margin: 0; color: #166534; font-size: 15px; line-height: 1.6;">
        <strong>✅ Trusted by 10,000+ businesses worldwide</strong><br>
        Join companies that never miss an expiration with expira's reliable monitoring.
      </p>
    </div>
    
    <div style="text-align: center; margin: 40px 0;">
      <a href="https://expira.io/register" style="display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%); color: #ffffff; text-decoration: none; border-radius: 10px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(14, 165, 233, 0.3);">
        Start Free Trial - No Credit Card Required
      </a>
    </div>
    
    <p style="margin: 30px 0 0; color: #6b7280; font-size: 14px; line-height: 1.6; text-align: center;">
      Questions? Visit <a href="https://expira.io" style="color: #0ea5e9; text-decoration: none; font-weight: 500;">expira.io</a> or contact us at <a href="mailto:support@expira.io" style="color: #0ea5e9; text-decoration: none; font-weight: 500;">support@expira.io</a>
    </p>
  `
  
  return getBaseTemplate(content, 'Protect Your Online Products with expira')
}

// Product Expiration Warning Email Template
export function getExpirationWarningEmailTemplate(data: EmailTemplateData = {}): string {
  const userName = data.userName || 'there'
  const productName = data.productName || 'your product'
  const daysUntilExpiry = data.daysUntilExpiry ?? 0
  const url = data.url || '#'
  
  const isUrgent = daysUntilExpiry <= 7
  const urgencyColor = isUrgent ? '#ef4444' : '#f59e0b'
  const urgencyBg = isUrgent ? '#fef2f2' : '#fffbeb'
  
  const content = `
    <h2 style="margin: 0 0 20px; color: #111827; font-size: 28px; font-weight: 700; line-height: 1.2;">
      ${isUrgent ? '⚠️ URGENT: ' : ''}Product Expiring Soon
    </h2>
    
    <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">
      Hi ${userName},
    </p>
    
    <div style="background: ${urgencyBg}; border-left: 4px solid ${urgencyColor}; padding: 24px; border-radius: 8px; margin: 30px 0;">
      <p style="margin: 0 0 12px; color: ${urgencyColor === '#ef4444' ? '#991b1b' : '#92400e'}; font-size: 18px; font-weight: 600;">
        ${productName}
      </p>
      <p style="margin: 0; color: ${urgencyColor === '#ef4444' ? '#dc2626' : '#d97706'}; font-size: 16px; line-height: 1.6;">
        ${daysUntilExpiry === 0 
          ? '⚠️ This product expires TODAY!' 
          : daysUntilExpiry === 1 
          ? '⚠️ This product expires TOMORROW!'
          : `⚠️ This product expires in ${daysUntilExpiry} days`}
      </p>
      ${url !== '#' ? `<p style="margin: 12px 0 0; color: #6b7280; font-size: 14px;">URL: <a href="${url}" style="color: #0ea5e9; text-decoration: none;">${url}</a></p>` : ''}
    </div>
    
    <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">
      ${isUrgent 
        ? 'Immediate action is required to prevent service interruption. Please renew this product as soon as possible.'
        : 'Please take action to renew this product before it expires to avoid any service interruption.'}
    </p>
    
    <div style="text-align: center; margin: 40px 0;">
      <a href="https://expira.io/dashboard" style="display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, ${urgencyColor} 0%, ${urgencyColor === '#ef4444' ? '#dc2626' : '#d97706'} 100%); color: #ffffff; text-decoration: none; border-radius: 10px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);">
        View Product Details
      </a>
    </div>
    
    <p style="margin: 30px 0 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
      This is an automated notification from expira. You're receiving this because you have monitoring enabled for this product.
    </p>
  `
  
  return getBaseTemplate(content, 'Product Expiration Warning')
}

// Feature Announcement Email Template
export function getFeatureAnnouncementEmailTemplate(data: EmailTemplateData = {}): string {
  const userName = data.userName || 'there'
  const featureName = data.featureName || 'new feature'
  const featureDescription = data.featureDescription || 'We\'ve added an exciting new feature'
  
  const content = `
    <h2 style="margin: 0 0 20px; color: #111827; font-size: 28px; font-weight: 700; line-height: 1.2;">
      🎉 New Feature: ${featureName}
    </h2>
    
    <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">
      Hi ${userName},
    </p>
    
    <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">
      We're excited to announce ${featureDescription}!
    </p>
    
    <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border-radius: 12px; padding: 30px; margin: 30px 0; text-align: center;">
      <div style="font-size: 64px; margin-bottom: 20px;">✨</div>
      <h3 style="margin: 0 0 16px; color: #0c4a6e; font-size: 24px; font-weight: 700;">
        ${featureName}
      </h3>
      <p style="margin: 0; color: #1e40af; font-size: 16px; line-height: 1.6;">
        ${featureDescription}
      </p>
    </div>
    
    <div style="text-align: center; margin: 40px 0;">
      <a href="https://expira.io/dashboard" style="display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%); color: #ffffff; text-decoration: none; border-radius: 10px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(14, 165, 233, 0.3);">
        Try It Now
      </a>
    </div>
    
    <p style="margin: 30px 0 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
      As always, we'd love to hear your feedback. Reply to this email or visit our <a href="https://expira.io/contact" style="color: #0ea5e9; text-decoration: none; font-weight: 500;">contact page</a>.
    </p>
  `
  
  return getBaseTemplate(content, `New Feature: ${featureName}`)
}

// Helper function to send marketing emails
export async function sendMarketingEmail(
  to: string,
  template: 'welcome' | 'invitation' | 'marketing' | 'feature' | 'expiration',
  data: EmailTemplateData = {}
): Promise<void> {
  const { sendEmailNotification } = await import('./notifications')
  
  let subject = ''
  let html = ''
  
  switch (template) {
    case 'welcome':
      subject = 'Welcome to expira! 🎉'
      html = getWelcomeEmailTemplate(data)
      break
    case 'invitation':
      subject = 'You\'ve been invited to expira! 🚀'
      html = getInvitationEmailTemplate(data)
      break
    case 'marketing':
      subject = 'Don\'t Let Expirations Catch You Off Guard! ⚠️'
      html = getMarketingEmailTemplate(data)
      break
    case 'feature':
      subject = `🎉 New Feature: ${data.featureName || 'Check it out!'}`
      html = getFeatureAnnouncementEmailTemplate(data)
      break
    case 'expiration':
      const days = data.daysUntilExpiry ?? 0
      subject = days <= 7 
        ? `⚠️ URGENT: ${data.productName || 'Product'} Expiring Soon`
        : `⚠️ ${data.productName || 'Product'} Expiring in ${days} Days`
      html = getExpirationWarningEmailTemplate(data)
      break
  }
  
  await sendEmailNotification(to, subject, html)
}

// Promotion Email Template - Professional marketing email
export function getPromotionEmailTemplate(): string {
  const { getPromotionEmailHTML } = require('./email-promotion-template')
  return getPromotionEmailHTML()
}

