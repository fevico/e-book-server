import nodemailer from 'nodemailer'
interface VerificationMailsOption{
    to: string,
    link: string,
}

const transport = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: process.env.MAILTRAP_TEST_USER,
      pass: process.env.MAILTRAP_TEST_PASS
    }
  });

const mail = {
    sendVerificationMail: async (options: VerificationMailsOption) => {
        await transport.sendMail({
            to: options.to,
            from: 'no-reply@yourapp.com',
            subject: 'Auth Verification',
            html: `
            <div>
                <p>Please click on <a href="${options.link}">this link</a> to verify your account.</p>
            </div>
            `
          })
    }
}

export default mail