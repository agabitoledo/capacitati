const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  //adicionar config do mail
  });

module.exports = transporter;