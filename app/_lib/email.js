import nodemailer from "nodemailer";

export async function sendEmail(email, email_token, subject) {
  const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
  console.log("Transporter auth: ", transporter.options.auth);
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: subject,
    text: "사용자 확인 문자 : " + email_token,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email Sent: ", info);
    return { message: '이메일 전송 성공. 메일을 확인해주세요.', status: 200 };
  } catch (error) {
    console.error("lib/email.js error: ", error);
    return { message: '전송 실패. 이메일을 확인해주세요', status: 400 };
  }
}