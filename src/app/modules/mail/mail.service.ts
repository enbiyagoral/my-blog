import { Injectable } from '@nestjs/common'
import * as nodemailer from 'nodemailer'
import * as Mailgen from 'mailgen'
import { User } from 'src/app/modules/users/schemas/user.model'

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter
  private mailGenerator: Mailgen

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: {
        user: 'brenna.hoeger@ethereal.email',
        pass: 'mNUS8wUUeTJhrVHcbF',
      },
    })

    this.mailGenerator = new Mailgen({
      theme: 'default',
      product: {
        name: 'Mailgen',
        link: 'https://mailgen.js/',
      },
    })
  }

  async registerMail(username: string, userEmail: string, otpCode: string, subject: string): Promise<boolean> {
    try {
      const email = {
        body: {
          name: username,
          intro: `Your OTP code is: ${otpCode}. Welcome to MEG Families! We're very excited to have you on board.`,
          outro: "Need help, or have questions? Just reply to this email, we'd love to help.",
        },
      }

      const emailBody = await this.mailGenerator.generate(email)

      const message = {
        from: 'brenna.hoeger@ethereal.email',
        to: userEmail,
        subject: subject || 'Signup Successful',
        html: emailBody,
      }

      this.transporter.sendMail(message, (err, info) => {
        if (err) {
          console.log('Error occurred. ' + err.message)
          return false
        }

        console.log('Message sent: %s', info.messageId)
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info))
      })
      return true
    } catch (error) {
      console.log(error, 'in sending email')
      return false
    }
  }

  async subscribeBlogs(userEmails: string, blogLink: string) {
    try {
      console.log(userEmails)

      const email = {
        body: {
          intro: `It's new Blog. Now MEG blog. Welcome to MEG Families! We're very excited to have you on board.`,
          outro: "Need help, or have questions? Just reply to this email, we'd love to help.",
        },
      }

      const emailBody = await this.mailGenerator.generate(email)

      const message = {
        from: 'brenna.hoeger@ethereal.email',
        to: userEmails.toString(),
        subject: 'A New Blog',
        html: emailBody,
      }

      this.transporter.sendMail(message, (err, info) => {
        if (err) {
          console.log('Error occurred. ' + err.message)
          return false
        }

        console.log('Message sent: %s', info.messageId)
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info))
      })
      return true
    } catch (error) {
      console.log(error, 'in sending email')
      return false
    }
  }
}
