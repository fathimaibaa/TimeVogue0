const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: 'fathimaibaa@gmail.com', 
    pass: 'gvqi vfnp ltcd dmcd'
  }
});
module.exports = transporter;
