const nodemailer = require('nodemailer');
const dns = require('dns');
const https = require('https');
require('dotenv').config();

const primaryPort = parseInt(process.env.SMTP_PORT || '587');
const fallbackPort = primaryPort === 587 ? 465 : 587;

// Dynamically resolve SMTP host to an IPv4 address to force IPv4 connection (avoids Railway's broken IPv6 network stack)
const resolveSMTPHostToIPv4 = async (hostname) => {
    try {
        const addresses = await dns.promises.resolve4(hostname);
        if (addresses && addresses.length > 0) {
            return addresses[0];
        }
    } catch (err) {
        console.warn(`[SMTP Mailer Warning] DNS resolve4 failed for ${hostname}: ${err.message}. Falling back to default hostname.`);
    }
    return hostname;
};

const createMailTransporter = async (port) => {
    const rawHost = process.env.SMTP_HOST || 'smtp.gmail.com';
    let host = rawHost;

    if (rawHost === 'smtp.gmail.com') {
        host = await resolveSMTPHostToIPv4(rawHost);
        console.log(`[SMTP Mailer] Custom routing: resolved ${rawHost} to IPv4: ${host}`);
    }

    return nodemailer.createTransport({
        host: host,
        port: port,
        secure: port === 465,
        auth: {
            user: process.env.SMTP_USER || '',
            pass: process.env.SMTP_PASS || ''
        },
        tls: {
            servername: rawHost // Crucial: sets SNI to match the TLS certificate of smtp.gmail.com
        },
        connectionTimeout: 5000, // 5 second connection timeout
        greetingTimeout: 5000,
        socketTimeout: 5000
    });
};

// Dispatch email via Resend's secure HTTPS REST API (forces port 443, which is never blocked by cloud firewalls)
const sendEmailViaResend = (mailOptions) => {
    return new Promise((resolve, reject) => {
        console.log(`[Resend Mailer] Dispatching email via HTTPS API to ${mailOptions.to}...`);

        const postData = JSON.stringify({
            from: mailOptions.from || process.env.SMTP_FROM || '"DriveSync AI" <onboarding@resend.dev>',
            to: mailOptions.to,
            subject: mailOptions.subject,
            html: mailOptions.html
        });

        const options = {
            hostname: 'api.resend.com',
            port: 443,
            path: '/emails',
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            }
        };

        const req = https.request(options, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    try {
                        const parsed = JSON.parse(data);
                        console.log(`[Resend Mailer] Email sent successfully. ID: ${parsed.id}`);
                        resolve({ messageId: parsed.id });
                    } catch (e) {
                        resolve({ messageId: null });
                    }
                } else {
                    console.error(`[Resend Mailer Error] API response code ${res.statusCode}: ${data}`);
                    reject(new Error(`Resend HTTPS dispatch failed: Status ${res.statusCode} - ${data}`));
                }
            });
        });

        req.on('error', (err) => {
            console.error(`[Resend Mailer Error] Request failed: ${err.message}`);
            reject(err);
        });

        req.write(postData);
        req.end();
    });
};

const transporter = {
    sendMail: async (mailOptions) => {
        // If Resend API key is configured, bypass SMTP blockages completely by sending over HTTPS port 443
        if (process.env.RESEND_API_KEY) {
            return sendEmailViaResend(mailOptions);
        }

        try {
            console.log(`[SMTP Mailer] Attempting connection via port ${primaryPort}...`);
            const tx = await createMailTransporter(primaryPort);
            const info = await tx.sendMail(mailOptions);
            return info;
        } catch (primaryErr) {
            console.warn(`[SMTP Mailer Warning] Connection on port ${primaryPort} timed out or failed: ${primaryErr.message}. Attempting fallback via port ${fallbackPort}...`);
            try {
                const txFallback = await createMailTransporter(fallbackPort);
                const info = await txFallback.sendMail(mailOptions);
                return info;
            } catch (fallbackErr) {
                console.error(`[SMTP Mailer Error] Fallback port ${fallbackPort} also failed: ${fallbackErr.message}`);
                throw new Error(`SMTP Mailer failed on primary port ${primaryPort} and fallback port ${fallbackPort}: ${fallbackErr.message}`);
            }
        }
    }
};

const sendWelcomeEmail = async (toEmail, userName) => {
    try {
        // Safe check: if SMTP configurations and Resend credentials are not set, fallback to console logger
        const isPlaceholder = (!process.env.SMTP_USER ||
            process.env.SMTP_USER === 'your_email@gmail.com' ||
            !process.env.SMTP_PASS ||
            process.env.SMTP_PASS === 'your_app_password') && !process.env.RESEND_API_KEY;

        if (isPlaceholder) {
            console.log('\n=======================================================');
            console.log('[DEVELOPER MAIL LOG] SMTP is not configured. Logging Welcome Email:');
            console.log(`To: ${toEmail}`);
            console.log(`Subject: Welcome to AI Vehicle Service Assistant! 🎉`);
            console.log(`Body: Hi ${userName}, congratulations on registering! Your account is active. Manage your vehicles, track history, and troubleshoot symptoms with AI.`);
            console.log('=======================================================\n');
            return true;
        }

        const mailOptions = {
            from: process.env.SMTP_FROM || `"AI Vehicle Service Assistant" <${process.env.SMTP_USER}>`,
            to: toEmail,
            subject: 'Welcome to AI Vehicle Service Assistant! 🎉',
            html: `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #1e293b; border-radius: 16px; background-color: #0b0f19; color: #f1f5f9;">
                    <!-- Sleek Gradient Header -->
                    <div style="background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%); padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 25px; box-shadow: 0 4px 15px rgba(37, 99, 235, 0.2);">
                        <span style="font-size: 26px; font-weight: 800; color: #ffffff; letter-spacing: 2px; text-transform: uppercase;">
                            AI Service Assistant
                        </span>
                        <h1 style="margin: 10px 0 0 0; font-size: 18px; font-weight: 600; color: #e2e8f0; opacity: 0.95;">
                            Welcome to the Garage! 🚀
                        </h1>
                    </div>
                    
                    <!-- Welcome Details -->
                    <div style="padding: 10px 15px; text-align: left;">
                        <h2 style="color: #60a5fa; font-size: 20px; font-weight: 700; margin-top: 0; margin-bottom: 12px;">
                            Salutations, ${userName}!
                        </h2>
                        <p style="font-size: 15px; line-height: 1.6; color: #cbd5e1; margin-bottom: 20px;">
                            Your account is active. Start logging maintenance events, budgeting spends, and diagnosing vehicle symptoms today.
                        </p>

                        <!-- Feature Blocks -->
                        <h3 style="color: #a78bfa; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; margin-top: 30px; margin-bottom: 15px;">
                            App Key Features
                        </h3>
                        
                        <div style="background-color: #1e293b; border: 1px solid #334155; padding: 15px; border-radius: 10px; margin-bottom: 12px;">
                            <strong style="color: #60a5fa; font-size: 14px; display: block; margin-bottom: 4px;">🛠️ AI Problem Analysis</strong>
                            <span style="font-size: 13px; color: #94a3b8; line-height: 1.5;">Describe vehicle issues to receive potential causes and severity advice.</span>
                        </div>

                        <div style="background-color: #1e293b; border: 1px solid #334155; padding: 15px; border-radius: 10px; margin-bottom: 12px;">
                            <strong style="color: #34d399; font-size: 14px; display: block; margin-bottom: 4px;">📊 Service & Expense Timeline</strong>
                            <span style="font-size: 13px; color: #94a3b8; line-height: 1.5;">Log maintenance categories, invoices, Odometer states, and total budgets.</span>
                        </div>

                        <div style="background-color: #1e293b; border: 1px solid #334155; padding: 15px; border-radius: 10px; margin-bottom: 12px;">
                            <strong style="color: #fbbf24; font-size: 14px; display: block; margin-bottom: 4px;">🔔 Maintenance Alarms</strong>
                            <span style="font-size: 13px; color: #94a3b8; line-height: 1.5;">Configure upcoming interval dates and mileage alert targets.</span>
                        </div>

                        <!-- CTA Button -->
                        <div style="margin: 35px 0 25px 0; text-align: center;">
                            <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}" style="background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%); color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 15px; display: inline-block; box-shadow: 0 4px 10px rgba(37, 99, 235, 0.3);">
                                Launch Live Dashboard
                            </a>
                        </div>

                        <!-- safety note / disclaimer -->
                        <div style="border-top: 1px solid #334155; padding-top: 20px; margin-top: 30px;">
                            <span style="color: #ef4444; font-size: 9px; font-weight: 850; border: 1px solid #991b1b; background-color: #7f1d1d; padding: 2px 6px; border-radius: 4px; display: inline-block; margin-bottom: 8px; letter-spacing: 0.5px;">
                                SAFETY ADVISORY
                            </span>
                            <p style="font-size: 11px; color: #64748b; line-height: 1.6; margin: 0;">
                                AI diagnostic inputs and outputs are informational preliminary recommendations and are not a substitute for certified physical vehicle mechanic inspections.
                            </p>
                        </div>
                    </div>
                    
                    <!-- footer -->
                    <div style="margin-top: 25px; padding-top: 15px; border-top: 1px solid #1e293b; text-align: center; font-size: 11px; color: #475569;">
                        © 2026 AI Vehicle Service Assistant. Secure Owner Console.
                    </div>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`[SMTP Mailer] Welcome email sent to ${toEmail}. MessageId: ${info.messageId}`);
        return true;
    } catch (error) {
        console.error('[SMTP Mailer Error] Failed to send registration email:', error.message);
        // We do not throw error here, so the signup flow remains uninterrupted if SMTP server is down/offline.
        return false;
    }
};

const sendResetPasswordEmail = async (toEmail, userName, tempPassword) => {
    try {
        const isPlaceholder = (!process.env.SMTP_USER ||
            process.env.SMTP_USER === 'your_email@gmail.com' ||
            !process.env.SMTP_PASS ||
            process.env.SMTP_PASS === 'your_app_password') && !process.env.RESEND_API_KEY;

        if (isPlaceholder) {
            console.log('\n=======================================================');
            console.log('[DEVELOPER MAIL LOG] SMTP is not configured. Logging Password Reset Email:');
            console.log(`To: ${toEmail}`);
            console.log(`Subject: Password Reset Request - AI Vehicle Service Assistant`);
            console.log(`Body: Hi ${userName}, you requested to reset your password. Your new temporary password is: ${tempPassword}. Please log in using this temporary password and change it in your Profile settings.`);
            console.log('=======================================================\n');
            return true;
        }

        const mailOptions = {
            from: process.env.SMTP_FROM || `"AI Vehicle Service Assistant" <${process.env.SMTP_USER}>`,
            to: toEmail,
            subject: 'Password Reset Request - AI Vehicle Service Assistant 🔑',
            html: `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #1e293b; border-radius: 16px; background-color: #0b0f19; color: #f1f5f9;">
                    <!-- Sleek Gradient Header -->
                    <div style="background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%); padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 25px; box-shadow: 0 4px 15px rgba(37, 99, 235, 0.2);">
                        <span style="font-size: 26px; font-weight: 800; color: #ffffff; letter-spacing: 2px; text-transform: uppercase;">
                            AI Service Assistant
                        </span>
                        <h1 style="margin: 10px 0 0 0; font-size: 18px; font-weight: 600; color: #e2e8f0; opacity: 0.95;">
                            Password Reset Requested 🔑
                        </h1>
                    </div>
                    
                    <!-- Recovery Details -->
                    <div style="padding: 10px 15px; text-align: left;">
                        <h2 style="color: #60a5fa; font-size: 20px; font-weight: 700; margin-top: 0; margin-bottom: 12px;">
                            Hello, ${userName}!
                        </h2>
                        <p style="font-size: 15px; line-height: 1.6; color: #cbd5e1; margin-bottom: 20px;">
                            You requested security access assistance reset for your vehicle logs account. We have generated a unique temporary password for you:
                        </p>

                        <div style="background-color: #1e293b; border: 1px solid #334155; padding: 20px; border-radius: 10px; text-align: center; margin-bottom: 25px;">
                            <span style="font-family: monospace; font-size: 24px; font-weight: bold; color: #fbbf24; letter-spacing: 1px;">
                                ${tempPassword}
                            </span>
                        </div>

                        <p style="font-size: 14px; line-height: 1.6; color: #94a3b8; margin-bottom: 30px;">
                            Please log in using the email we contacted you on and this temporary password code. Remember to update your security credentials under the <strong>Profile settings</strong> tab immediately after access.
                        </p>

                        <!-- CTA Button -->
                        <div style="margin: 25px 0; text-align: center;">
                            <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/login" style="background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%); color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 15px; display: inline-block; box-shadow: 0 4px 10px rgba(37, 99, 235, 0.3);">
                                Log In Now
                            </a>
                        </div>
                    </div>
                    
                    <!-- footer -->
                    <div style="margin-top: 25px; padding-top: 15px; border-top: 1px solid #1e293b; text-align: center; font-size: 11px; color: #475569;">
                        © 2026 AI Vehicle Service Assistant. Secure Account Recovery.
                    </div>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`[SMTP Mailer] Password reset email sent to ${toEmail}. MessageId: ${info.messageId}`);
        return true;
    } catch (error) {
        console.error('[SMTP Mailer Error] Failed to send password reset email:', error.message);
        throw error;
    }
};

const sendAccountDeletedEmail = async (toEmail, userName) => {
    try {
        const isPlaceholder = (!process.env.SMTP_USER ||
            process.env.SMTP_USER === 'your_email@gmail.com' ||
            !process.env.SMTP_PASS ||
            process.env.SMTP_PASS === 'your_app_password') && !process.env.RESEND_API_KEY;

        if (isPlaceholder) {
            console.log('\n=======================================================');
            console.log('[DEVELOPER MAIL LOG] SMTP is not configured. Logging Account Deletion Email:');
            console.log(`To: ${toEmail}`);
            console.log(`Subject: DriveSync AI Account Permanently Deleted`);
            console.log(`Body: Hi ${userName}, your account and all associated vehicle logs have been permanently deleted as requested.`);
            console.log('=======================================================\n');
            return true;
        }

        const mailOptions = {
            from: process.env.SMTP_FROM || `"DriveSync AI" <${process.env.SMTP_USER}>`,
            to: toEmail,
            subject: 'Account Permanently Deleted - DriveSync AI 🚗',
            html: `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff; color: #1e293b;">
                    <!-- Header -->
                    <div style="background: linear-gradient(135deg, #ef4444 0%, #991b1b 100%); padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 25px;">
                        <span style="font-size: 26px; font-weight: 800; color: #ffffff; letter-spacing: 2px; text-transform: uppercase;">
                            DriveSync AI
                        </span>
                        <h1 style="margin: 10px 0 0 0; font-size: 18px; font-weight: 600; color: #fecaca;">
                            Account Permanently Deleted ⚠️
                        </h1>
                    </div>
                    
                    <!-- Content -->
                    <div style="padding: 10px 15px; text-align: left;">
                        <h2 style="color: #ef4444; font-size: 20px; font-weight: 700; margin-top: 0; margin-bottom: 12px;">
                            Goodbye, ${userName}!
                        </h2>
                        <p style="font-size: 15px; line-height: 1.6; color: #475569; margin-bottom: 20px;">
                            This email confirms that your DriveSync AI account associated with <strong>${toEmail}</strong> has been permanently deleted as requested.
                        </p>
                        <p style="font-size: 15px; line-height: 1.6; color: #475569; margin-bottom: 20px;">
                            All of your garage registered vehicles, AI logs transcripts, upcoming reminders schedule, and invoice histories have been completely removed from our databases.
                        </p>
                        <p style="font-size: 14px; line-height: 1.6; color: #64748b; margin-bottom: 30px;">
                            Thank you for using DriveSync AI to manage your vehicles. If this account deletion was made in error or if you wish to join us again, you can register a new profile at any time.
                        </p>
                    </div>
                    
                    <!-- footer -->
                    <div style="margin-top: 25px; padding-top: 15px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 11px; color: #94a3b8;">
                        © 2026 DriveSync AI Platform. Data Privacy & Deletion Complete.
                    </div>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`[SMTP Mailer] Account deletion confirmation sent to ${toEmail}. MessageId: ${info.messageId}`);
        return true;
    } catch (error) {
        console.error('[SMTP Mailer Error] Failed to send account deletion email:', error.message);
        return false;
    }
};

module.exports = {
    sendWelcomeEmail,
    sendResetPasswordEmail,
    sendAccountDeletedEmail
};
