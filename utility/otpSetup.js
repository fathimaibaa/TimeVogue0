const transporter = require('../config/emailSender');


function generateNumericOTP() {
  const min = 1000;
  const max = 9999;
  const otp = Math.floor(Math.random() * (max - min + 1)) + min;
  return otp;
}

function sendOtp(email, otp, name) {
  if (otp.length < 5) {
  }

  const message = `

    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>OTP Verification</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                background-color: #f4f4f4;
            }
            .container {
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #ffffff;
                border-radius: 5px;
                box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
            }
            .header {
                text-align: center;
                background-color: #000000;
                color: #ffffff;
                padding: 10px;
                border-radius: 5px 5px 0 0;
            }
            .content {
                padding: 20px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>OTP Verification</h1>
            </div>
            <div class="content">
                <p>Dear ${name},</p>
                <p>Your OTP for verifying your email is:</p>
                <h2 style="text-align: center; background-color: #000000; color: #ffffff; padding: 10px; border-radius: 5px;">
                    ${otp}<!-- Replace this with your actual OTP -->
                </h2>
                <p>Please enter this OTP to complete the verification process.</p>
            </div>
        </div>
    </body>
    </html>
    
    
    `;
  const mailOptions = {
    from: `fathimaibaa@gmail.com`,
    to: email,
    subject: "Your OTP verification code",
    html: message,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending OTP:", error);
    } else {
     
    }
  });
}


function sendToken(email,token, name) {
  
  const message = `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Forgot Password</title>
        <style>
            body {
                font-family: 'Arial', sans-serif;
                background-color: #000000;
                margin: 0;
                padding: 0;
            }
            .container {
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #ffffff;
                box-shadow: 0 0 10px rgba(0,0,0,0.1);
                border-radius: 5px;
                margin-top: 50px;
            }
            h2 {
                color: #000000;
            }
            p {
                color: #000000;
            }
            .reset-link {
                background-color: #000000;
                color: #ffffff;
                padding: 10px 15px;
                text-decoration: none;
                display: inline-block;
                border-radius: 3px;
                margin-top: 20px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h2>Forgot Your Password?</h2>
            <p>Hello ${name},</p>
            <p>We received a request to reset your password. If you did not make this request, please ignore this email.</p>
            <p>To reset your password, click the following link:</p>
            <form action="http://localhost:4000/resetPassword/${token}" method="post">
            <button type="submit" class="reset-link">Change Password</button>
            </form>
            <p>This link will expire in [30 seconds].</p>
            <p>Thank you,</p>
            <p>TimeVgue</p>
        </div>
    </body>
    </html>;`

  const mailOptions = {
    from: `fathimaibaa@gmail.com`,
    to: email,
    subject: "Your OTP verification code",
    html: message,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending OTP:", error);
    } else {
      
    }
  });
}

module.exports = { sendOtp, sendToken, generateNumericOTP };