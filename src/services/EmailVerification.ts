require('dotenv').config(); 
const nodemailer = require('nodemailer');

let transporter = nodemailer.createTransport({
    service: 'Gmail',
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
    },
});

export const verifyEmail = async (username: string, email: string, token: string) => {
    console.log(`Verifying email for username: ${username}, token: ${token}`);
    try {
        const encodedUsername = encodeURIComponent(username);
        const encodedToken = encodeURIComponent(token);

        const verificationLink = `${process.env.BASE_URL}/verify-account/${encodedUsername}/${encodedToken}`;

        const emailHtml = `
  <html>
    <head>
      <style>
        body {
          font-family: Arial, sans-serif;
          padding: 20px;
          background-color: #f4f4f4;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #fff;
          padding: 20px;
          border-radius: 5px;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        h1 {
          color: #333;
        }
        p {
          color: #555;
        }
        a {
          color: #007BFF;
          text-decoration: none;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Hello ${username}!</h1>
        <p>Please verify your email to gain access to Talk Pulse and activate your account by clicking the link below:</p>
        <p><a href="${verificationLink}">${verificationLink}</a></p>
        <p>If you did not request this verification, please ignore this email.</p>
      </div>
    </body>
  </html>
`;


        let info = await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: `Hello ${username} Verify Your Email - Activate Your Talk Pulse Account`,
            html: emailHtml,
        }, (error: any, result: any) => {
            if (error) {
                console.error("Error sending email: ", error);
            } else {
                console.log("Email sent: ", result.response);
            }
        });
    } catch (error) {
        console.log(error);
    }
}

export const passwordResetEmail = async (email: string, token: string) => {
    try {
      const encodedEmail = encodeURIComponent(email);
        const encodedToken = encodeURIComponent(token);
        
        const passwordResetLink = `${process.env.BASE_URL}/reset-password/${encodedEmail}/${encodedToken}`;

        const emailHtml = `
        <html>
          <head>
            <style>
              body {
                font-family: Arial, sans-serif;
                padding: 20px;
                background-color: #f4f4f4;
              }
              .container {
                max-width: 600px;
                margin: 0 auto;
                background-color: #fff;
                padding: 20px;
                border-radius: 5px;
                box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
              }
              h1 {
                color: #333;
              }
              p {
                color: #555;
              }
              a {
                color: #007BFF;
                text-decoration: none;
              }
            </style>
          </head>
          <body>
          <div class="container">
            <h1>TalkPulse Password Reset</h1>
            <p>We received a request to reset your password. To complete the process, please click the link below:</p>
            <p><a href="${passwordResetLink}">${passwordResetLink}</a></p>
            <p>If you did not request a password reset, please ignore this email.</p>
          </div>
        </body>
        </html>
      `;
  
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: `Password reset request from Talk pulse`,
        html: emailHtml,
      });
  
      console.log(`Password reset email sent to: ${email}`);
    } catch (error) {
      console.error('Error sending password reset email:', error);
    }
  };