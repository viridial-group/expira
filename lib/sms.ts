// SMS Notification Service using Twilio (Free tier available)
// Alternative: You can also use other free services like:
// - Vonage (Nexmo) - Free tier available
// - AWS SNS - Free tier available
// - MessageBird - Free tier available

interface SMSConfig {
  enabled: boolean
  provider: 'twilio' | 'vonage' | 'custom'
  apiKey?: string
  apiSecret?: string
  fromNumber?: string
}

// Twilio SMS Service (Free tier: $15.50 credit)
export async function sendSMSNotification(
  to: string,
  message: string
): Promise<boolean> {
  try {
    // Check if SMS is enabled
    if (process.env.SMS_ENABLED !== 'true') {
      console.log('SMS notifications are disabled')
      return false
    }

    const provider = (process.env.SMS_PROVIDER || 'twilio').toLowerCase()

    if (provider === 'twilio') {
      return await sendViaTwilio(to, message)
    } else if (provider === 'vonage') {
      return await sendViaVonage(to, message)
    } else {
      console.error('Unknown SMS provider:', provider)
      return false
    }
  } catch (error) {
    console.error('Error sending SMS:', error)
    return false
  }
}

// Twilio SMS Implementation
async function sendViaTwilio(to: string, message: string): Promise<boolean> {
  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID
    const authToken = process.env.TWILIO_AUTH_TOKEN
    const fromNumber = process.env.TWILIO_PHONE_NUMBER

    if (!accountSid || !authToken || !fromNumber) {
      console.error('Twilio credentials not configured')
      return false
    }

    // Format phone number (ensure it starts with +)
    const formattedPhone = formatPhoneNumber(to)

    // Use Twilio REST API directly (no need for SDK in serverless)
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`,
        },
        body: new URLSearchParams({
          From: fromNumber,
          To: formattedPhone,
          Body: message,
        }),
      }
    )

    if (!response.ok) {
      const error = await response.text()
      console.error('Twilio API error:', error)
      return false
    }

    const data = await response.json()
    console.log('SMS sent successfully:', data.sid)
    return true
  } catch (error) {
    console.error('Error sending SMS via Twilio:', error)
    return false
  }
}

// Vonage (Nexmo) SMS Implementation (Alternative free option)
async function sendViaVonage(to: string, message: string): Promise<boolean> {
  try {
    const apiKey = process.env.VONAGE_API_KEY
    const apiSecret = process.env.VONAGE_API_SECRET
    const fromNumber = process.env.VONAGE_FROM_NUMBER || 'expira'

    if (!apiKey || !apiSecret) {
      console.error('Vonage credentials not configured')
      return false
    }

    const formattedPhone = formatPhoneNumber(to)

    const response = await fetch('https://rest.nexmo.com/sms/json', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        api_key: apiKey,
        api_secret: apiSecret,
        to: formattedPhone,
        from: fromNumber,
        text: message,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('Vonage API error:', error)
      return false
    }

    const data = await response.json()
    if (data.messages && data.messages[0].status === '0') {
      console.log('SMS sent successfully via Vonage')
      return true
    } else {
      console.error('Vonage SMS error:', data.messages?.[0])
      return false
    }
  } catch (error) {
    console.error('Error sending SMS via Vonage:', error)
    return false
  }
}

// Format phone number to E.164 format
function formatPhoneNumber(phone: string): string {
  // Remove all non-digit characters except +
  let cleaned = phone.replace(/[^\d+]/g, '')

  // If it doesn't start with +, add it (assuming US number)
  if (!cleaned.startsWith('+')) {
    // If it starts with 1, add +
    if (cleaned.startsWith('1') && cleaned.length === 11) {
      cleaned = '+' + cleaned
    } else if (cleaned.length === 10) {
      // US number without country code
      cleaned = '+1' + cleaned
    } else {
      // Assume it needs country code
      cleaned = '+' + cleaned
    }
  }

  return cleaned
}

// Verify phone number format
export function isValidPhoneNumber(phone: string): boolean {
  // E.164 format: +[country code][number]
  const e164Regex = /^\+[1-9]\d{1,14}$/
  return e164Regex.test(phone)
}

