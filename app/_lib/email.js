import nodemailer from "nodemailer";

export async function sendEmail(email, email_token, subject) {
  const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  console.log(transporter.user)
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: subject,
    text: "사용자 확인 문자 : " + email_token,
  };

  await transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("lib/email.js error: ", error);
      return { message : '전송 실패 이메일을 확인해주세요', status: 400}
    } else {
      console.log("Email Sent : ", info);
      return { message : '이메일 전송 성공 메일을 확인해주세요.', status: 200}
    }
  });
}
