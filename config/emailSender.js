const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: 'fathimaibaa@gmail.com', 
    pass: 'qiou flul czuv uior'
  }
});
module.exports = transporter;
