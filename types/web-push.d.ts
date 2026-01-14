declare module 'web-push' {
  interface VapidKeys {
    publicKey: string
    privateKey: string
  }

  interface PushSubscription {
    endpoint: string
    keys: {
      p256dh: string
      auth: string
    }
  }

  interface SendOptions {
    TTL?: number
    urgency?: 'very-low' | 'low' | 'normal' | 'high'
    topic?: string
  }

  function setVapidDetails(
    subject: string,
    publicKey: string,
    privateKey: string
  ): void

  function generateVAPIDKeys(): VapidKeys

  function sendNotification(
    subscription: PushSubscription,
    payload: string | Buffer,
    options?: SendOptions
  ): Promise<void>

  const webpush: {
    setVapidDetails: typeof setVapidDetails
    generateVAPIDKeys: typeof generateVAPIDKeys
    sendNotification: typeof sendNotification
  }

  export = webpush
}

