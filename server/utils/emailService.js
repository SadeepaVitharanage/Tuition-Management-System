const nodemailer = require('nodemailer');

// Create transporter with better error handling
const createTransporter = () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('⚠️ EMAIL_USER or EMAIL_PASS not set in .env');
    return null;
  }
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

const sendCredentials = async ({
  studentName,
  studentEmail,
  parentName,
  parentEmail,
  admissionNumber,
  studentPassword,
  parentPassword,
}) => {
  const transporter = createTransporter();
  if (!transporter) {
    console.error('Email transporter not configured');
    return;
  }

  try {
    // Email to student
    await transporter.sendMail({
      from: `"XenEdu Institute" <${process.env.EMAIL_USER}>`,
      to: studentEmail,
      subject: 'Welcome to XenEdu — Your Login Credentials',
      html: `
        <div style="font-family: Roboto, sans-serif; max-width: 520px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #1B6B5A, #00B894); padding: 32px; border-radius: 16px 16px 0 0; text-align: center;">
            <h1 style="color: #F5C518; margin: 0; font-size: 32px; font-weight: 800;">XenEdu</h1>
            <p style="color: rgba(255,255,255,0.8); margin: 6px 0 0; font-size: 14px;">A/L Tuition Management System</p>
          </div>
          <div style="background: #f9f9f9; padding: 32px; border-radius: 0 0 16px 16px; border: 1px solid #e0e0e0;">
            <h2 style="color: #1B6B5A; margin: 0 0 8px; font-size: 22px;">Welcome, ${studentName}! 🎓</h2>
            <p style="color: #666; font-size: 14px; margin: 0 0 24px; line-height: 1.6;">
              Your registration has been approved. Here are your personal login credentials:
            </p>
            <div style="background: white; border-radius: 12px; padding: 24px; border: 2px solid #E8F5F0; margin-bottom: 20px;">
              <p style="margin: 0 0 4px; font-size: 12px; font-weight: 700; color: #888; text-transform: uppercase; letter-spacing: 1px;">
                Your Login Details
              </p>
              <table style="width: 100%; margin-top: 12px;">
                <tr>
                  <td style="padding: 8px 0; color: #888; font-size: 14px; width: 140px;">Admission No.</td>
                  <td style="padding: 8px 0; font-weight: 800; color: #1B6B5A; font-size: 16px;">${admissionNumber}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #888; font-size: 14px;">Email</td>
                  <td style="padding: 8px 0; font-weight: 600; color: #2D2D2D; font-size: 14px;">${studentEmail}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #888; font-size: 14px;">Password</td>
                  <td style="padding: 8px 0;">
                    <span style="background: #1B6B5A; color: white; padding: 6px 14px; border-radius: 8px; font-weight: 700; font-size: 16px; letter-spacing: 1px;">
                      ${studentPassword}
                    </span>
                  </td>
                </tr>
              </table>
            </div>
            <div style="background: #FFF9E6; border: 1px solid #F5C518; border-radius: 10px; padding: 14px 16px; margin-bottom: 24px;">
              <p style="margin: 0; font-size: 13px; color: #856404;">
                ⚠️ <strong>Important:</strong> Please change your password after your first login for security.
              </p>
            </div>
            <a href="${process.env.CLIENT_URL}/login"
              style="display: block; background: linear-gradient(135deg, #1B6B5A, #00B894); color: white;
              padding: 14px; border-radius: 12px; text-decoration: none; font-weight: 700;
              font-size: 15px; text-align: center; box-shadow: 0 4px 15px rgba(27,107,90,0.3);">
              Login to XenEdu Portal
            </a>
            <div style="margin-top: 24px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center;">
              <p style="color: #aaa; font-size: 12px; margin: 0;">
                XenEdu Mirigama | xenedu@gmail.com | 033-2242-2589
              </p>
            </div>
          </div>
        </div>
      `,
    });
    console.log(`✅ Credentials email sent to student: ${studentEmail}`);
  } catch (err) {
    console.error(`❌ Failed to send student email to ${studentEmail}:`, err.message);
  }

  // Email to parent
  if (parentPassword && parentEmail) {
    try {
      await transporter.sendMail({
        from: `"XenEdu Institute" <${process.env.EMAIL_USER}>`,
        to: parentEmail,
        subject: 'XenEdu — Parent Portal Access',
        html: `
          <div style="font-family: Roboto, sans-serif; max-width: 520px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #1B6B5A, #00B894); padding: 32px; border-radius: 16px 16px 0 0; text-align: center;">
              <h1 style="color: #F5C518; margin: 0; font-size: 32px; font-weight: 800;">XenEdu</h1>
              <p style="color: rgba(255,255,255,0.8); margin: 6px 0 0; font-size: 14px;">A/L Tuition Management System</p>
            </div>
            <div style="background: #f9f9f9; padding: 32px; border-radius: 0 0 16px 16px; border: 1px solid #e0e0e0;">
              <h2 style="color: #1B6B5A; margin: 0 0 8px; font-size: 22px;">Hello, ${parentName}! 👋</h2>
              <p style="color: #666; font-size: 14px; margin: 0 0 24px; line-height: 1.6;">
                Your child <strong style="color: #1B6B5A;">${studentName}</strong> has been
                registered at XenEdu (Admission: <strong>${admissionNumber}</strong>).
                Here are your parent portal credentials:
              </p>
              <div style="background: white; border-radius: 12px; padding: 24px; border: 2px solid #E8F5F0; margin-bottom: 20px;">
                <p style="margin: 0 0 4px; font-size: 12px; font-weight: 700; color: #888; text-transform: uppercase; letter-spacing: 1px;">
                  Your Login Details
                </p>
                <table style="width: 100%; margin-top: 12px;">
                  <tr>
                    <td style="padding: 8px 0; color: #888; font-size: 14px; width: 100px;">Email</td>
                    <td style="padding: 8px 0; font-weight: 600; color: #2D2D2D; font-size: 14px;">${parentEmail}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #888; font-size: 14px;">Password</td>
                    <td style="padding: 8px 0;">
                      <span style="background: #1B6B5A; color: white; padding: 6px 14px; border-radius: 8px; font-weight: 700; font-size: 16px; letter-spacing: 1px;">
                        ${parentPassword}
                      </span>
                    </td>
                  </tr>
                </table>
              </div>
              <div style="margin-bottom: 24px;">
                <p style="color: #666; font-size: 14px; line-height: 1.6; margin: 0 0 12px;">
                  Through the parent portal you can monitor:
                </p>
                <div style="display: flex; flex-direction: column; gap: 8px;">
                  ${['📊 Attendance percentage', '💳 Fee payment history', '📚 Enrolled classes', '⚠️ Attendance alerts'].map(item => `
                    <div style="background: #F0FBF7; border-radius: 8px; padding: 10px 14px; font-size: 13px; color: #1B6B5A; font-weight: 500;">
                      ${item}
                    </div>
                  `).join('')}
                </div>
              </div>
              <a href="${process.env.CLIENT_URL}/login"
                style="display: block; background: linear-gradient(135deg, #1B6B5A, #00B894); color: white;
                padding: 14px; border-radius: 12px; text-decoration: none; font-weight: 700;
                font-size: 15px; text-align: center; box-shadow: 0 4px 15px rgba(27,107,90,0.3);">
                Login to Parent Portal
              </a>
              <div style="margin-top: 24px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center;">
                <p style="color: #aaa; font-size: 12px; margin: 0;">
                  XenEdu Mirigama | xenedu@gmail.com | 033-2242-2589
                </p>
              </div>
            </div>
          </div>
        `,
      });
      console.log(`✅ Credentials email sent to parent: ${parentEmail}`);
    } catch (err) {
      console.error(`❌ Failed to send parent email to ${parentEmail}:`, err.message);
    }
  }
};

const sendAttendanceAlert = async ({
  parentName, parentEmail, studentName, className, percentage,
}) => {
  const transporter = createTransporter();
  if (!transporter) return;

  try {
    await transporter.sendMail({
      from: `"XenEdu Institute" <${process.env.EMAIL_USER}>`,
      to: parentEmail,
      subject: `Attendance Alert — ${studentName}`,
      html: `
        <div style="font-family: Roboto, sans-serif; max-width: 520px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #1B6B5A, #00B894); padding: 32px; border-radius: 16px 16px 0 0; text-align: center;">
            <h1 style="color: #F5C518; margin: 0; font-size: 32px; font-weight: 800;">XenEdu</h1>
          </div>
          <div style="background: #f9f9f9; padding: 32px; border-radius: 0 0 16px 16px; border: 1px solid #e0e0e0;">
            <h2 style="color: #DC2626; margin: 0 0 16px;">⚠️ Attendance Alert</h2>
            <p style="color: #666; font-size: 14px; line-height: 1.6;">
              Dear ${parentName}, your child <strong>${studentName}</strong>'s
              attendance in <strong>${className}</strong> has dropped below 80%.
            </p>
            <div style="background: #FEF2F2; border: 2px solid #FECACA; border-radius: 12px; padding: 20px; margin: 20px 0; text-align: center;">
              <p style="margin: 0; font-size: 32px; font-weight: 800; color: #DC2626;">${percentage}%</p>
              <p style="margin: 6px 0 0; font-size: 13px; color: #888;">Current attendance (minimum 80% required)</p>
            </div>
            <a href="${process.env.CLIENT_URL}/login"
              style="display: block; background: linear-gradient(135deg, #1B6B5A, #00B894); color: white;
              padding: 14px; border-radius: 12px; text-decoration: none; font-weight: 700;
              font-size: 15px; text-align: center;">
              View Parent Portal
            </a>
          </div>
        </div>
      `,
    });
    console.log(`✅ Attendance alert sent to ${parentEmail}`);
  } catch (err) {
    console.error(`❌ Failed to send attendance alert:`, err.message);
  }
};

const sendPasswordResetEmail = async ({ name, email, resetUrl, role }) => {
  const transporter = createTransporter();
  if (!transporter) return;

  try {
    await transporter.sendMail({
      from: `"XenEdu Institute" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'XenEdu — Reset Your Password',
      html: `
        <div style="font-family: Roboto, sans-serif; max-width: 520px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #1B6B5A, #00B894); padding: 32px; border-radius: 16px 16px 0 0; text-align: center;">
            <h1 style="color: #F5C518; margin: 0; font-size: 32px; font-weight: 800;">XenEdu</h1>
            <p style="color: rgba(255,255,255,0.8); margin: 6px 0 0; font-size: 14px;">A/L Tuition Management System</p>
          </div>
          <div style="background: #f9f9f9; padding: 32px; border-radius: 0 0 16px 16px; border: 1px solid #e0e0e0;">
            <div style="text-align: center; margin-bottom: 24px;">
              <div style="width: 64px; height: 64px; background: #E8F5F0; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 28px;">
                🔐
              </div>
            </div>
            <h2 style="color: #1a1a1a; margin: 0 0 8px; font-size: 22px; text-align: center;">
              Reset Your Password
            </h2>
            <p style="color: #666; font-size: 14px; text-align: center; margin: 0 0 24px; line-height: 1.6;">
              Hi <strong>${name}</strong>! We received a request to reset your XenEdu password.
              Click the button below to create a new password.
            </p>
            <a href="${resetUrl}"
              style="display: block; background: linear-gradient(135deg, #1B6B5A, #00B894);
              color: white; padding: 16px 32px; border-radius: 12px;
              text-decoration: none; font-weight: 700; font-size: 16px;
              text-align: center; margin: 0 0 24px;
              box-shadow: 0 4px 15px rgba(27,107,90,0.3);">
              Reset My Password
            </a>
            <div style="background: white; border-radius: 10px; padding: 16px; border: 1px solid #e0e0e0; margin-bottom: 20px;">
              <p style="margin: 0; font-size: 13px; color: #666;">Or copy this link:</p>
              <p style="margin: 6px 0 0; font-size: 12px; color: #1B6B5A; word-break: break-all;">
                ${resetUrl}
              </p>
            </div>
            <div style="background: #FFF9E6; border: 1px solid #F5C518; border-radius: 10px; padding: 14px 16px; margin-bottom: 20px;">
              <p style="margin: 0; font-size: 13px; color: #856404;">
                ⚠️ <strong>This link expires in 1 hour.</strong>
                If you didn't request this, ignore this email.
              </p>
            </div>
            <div style="text-align: center; padding-top: 16px; border-top: 1px solid #e0e0e0;">
              <p style="color: #aaa; font-size: 12px; margin: 0;">
                XenEdu Mirigama | xenedu@gmail.com | 033-2242-2589
              </p>
            </div>
          </div>
        </div>
      `,
    });
    console.log(`✅ Password reset email sent to ${email}`);
  } catch (err) {
    console.error(`❌ Failed to send reset email to ${email}:`, err.message);
  }
};

module.exports = { sendCredentials, sendAttendanceAlert, sendPasswordResetEmail };