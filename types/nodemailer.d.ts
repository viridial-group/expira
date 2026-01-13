declare module 'nodemailer' {
  import { Transporter } from 'nodemailer/lib/smtp-transport'
  
  export interface TransportOptions {
    host?: string
    port?: number
    secure?: boolean
    auth?: {
      user: string
      pass: string
    }
  }
  
  export function createTransport(options: TransportOptions): Transporter
  
  export default {
    createTransport,
  }
}

