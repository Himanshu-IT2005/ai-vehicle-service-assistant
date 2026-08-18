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

        // Resend free-tier sandbox only allows sending from onboarding@resend.dev unless a custom domain is verified.
        // We override the 'from' configuration to prevent 403 restriction failures during sandbox testing.
        let fromAddress = mailOptions.from || process.env.SMTP_FROM || '"DriveSync AI" <onboarding@resend.dev>';
        const isVerifiedBypass = process.env.RESEND_CUSTOM_DOMAIN_VERIFIED === 'true';
        if (!isVerifiedBypass && (fromAddress.includes('@gmail.com') || fromAddress.includes('@yahoo.com') || fromAddress.includes('@outlook.com') || !fromAddress.includes('resend.dev'))) {
            console.log(`[Resend Mailer] Unverified sender detected (${fromAddress}). Forcing 'onboarding@resend.dev' default sender to bypass Resend restriction.`);
            fromAddress = '"DriveSync AI" <onboarding@resend.dev>';
        }

        const postData = JSON.stringify({
            from: fromAddress,
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
                    let errObj;
                    try { errObj = JSON.parse(data); } catch (e) { }
                    const isSandboxRestriction = res.statusCode === 403 && errObj && errObj.message && errObj.message.includes('only send testing emails');

                    if (isSandboxRestriction) {
                        console.warn(`\n[Resend Sandbox Notice] Target address (${mailOptions.to}) is restricted under Resend Free Sandbox mode. Resend only permits sending to your registered owner address. To send emails to all users, verify a domain at resend.com/domains.`);
                    } else {
                        console.error(`[Resend Mailer Error] API response code ${res.statusCode}: ${data}`);
                    }

                    const error = new Error(`Resend HTTPS dispatch failed: Status ${res.statusCode} - ${data}`);
                    error.isSandboxRestriction = isSandboxRestriction;
                    error.statusCode = res.statusCode;
                    reject(error);
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

// Dispatch email via Brevo's HTTPS REST API (allows sending up to 300 free emails/day to ANY recipient worldwide without domain restrictions)
const sendEmailViaBrevo = (mailOptions) => {
    return new Promise((resolve, reject) => {
        console.log(`[Brevo Mailer] Dispatching email via HTTPS API to ${mailOptions.to}...`);

        const senderEmail = process.env.BREVO_SENDER_EMAIL || 'chauhanhimanshu0608@gmail.com';
        const senderName = 'DriveSync AI';

        const postData = JSON.stringify({
            sender: { name: senderName, email: senderEmail },
            to: [{ email: mailOptions.to }],
            subject: mailOptions.subject,
            htmlContent: mailOptions.html
        });

        const options = {
            hostname: 'api.brevo.com',
            port: 443,
            path: '/v3/smtp/email',
            method: 'POST',
            headers: {
                'api-key': getBrevoKey(),
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            }
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', chunk => { data += chunk; });
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    try {
                        const parsed = JSON.parse(data);
                        console.log(`[Brevo Mailer] Email sent successfully to ${mailOptions.to}! Message ID: ${parsed.messageId}`);
                        resolve({ messageId: parsed.messageId });
                    } catch (e) {
                        resolve({ messageId: null });
                    }
                } else {
                    console.error(`[Brevo Mailer Error] API status ${res.statusCode}: ${data}`);
                    reject(new Error(`Brevo HTTPS dispatch failed: Status ${res.statusCode} - ${data}`));
                }
            });
        });

        req.on('error', (err) => {
            console.error(`[Brevo Mailer Error] Request error: ${err.message}`);
            reject(err);
        });

        req.write(postData);
        req.end();
    });
};

const sendViaSMTP = async (mailOptions) => {
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
            console.warn(`[SMTP Mailer Notice] Direct SMTP ports (${primaryPort}/${fallbackPort}) are blocked or timed out on this hosting network: ${fallbackErr.message}`);
            const error = new Error(`SMTP ports blocked or timed out: ${fallbackErr.message}`);
            error.isConnectionTimeout = true;
            throw error;
        }
    }
};

const getBrevoKey = () => process.env.BREVO_API_KEY || process.env.BREVO_KEY || process.env.SENDINBLUE_API_KEY;

const transporter = {
    sendMail: async (mailOptions) => {
        const brevoKey = getBrevoKey();
        if (brevoKey) {
            return await sendEmailViaBrevo(mailOptions);
        }

        if (process.env.RESEND_API_KEY) {
            try {
                return await sendEmailViaResend(mailOptions);
            } catch (resendErr) {
                // If Resend failed due to sandbox recipient restriction (403), skip direct SMTP fallback to prevent 10-second cloud port timeouts
                if (resendErr.isSandboxRestriction) {
                    throw resendErr;
                }

                const hasSMTP = process.env.SMTP_USER && process.env.SMTP_USER !== 'your_email@gmail.com' && process.env.SMTP_PASS;
                if (hasSMTP) {
                    console.log(`[Resend Fallback] Resend dispatch failed (${resendErr.message}). Attempting fallback to configured SMTP server...`);
                    try {
                        return await sendViaSMTP(mailOptions);
                    } catch (smtpErr) {
                        console.warn(`[SMTP Fallback Notice] SMTP fallback also failed: ${smtpErr.message}`);
                    }
                }
                throw resendErr;
            }
        }

        console.warn(`[SMTP Mailer Notice] BREVO_API_KEY & RESEND_API_KEY are not set. Attempting direct SMTP connection...`);
        return await sendViaSMTP(mailOptions);
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
            from: process.env.SMTP_FROM || `"DriveSync AI" <${process.env.BREVO_SENDER_EMAIL || process.env.SMTP_USER || 'chauhanhimanshu0608@gmail.com'}>`,
            to: toEmail,
            subject: 'Welcome to DriveSync AI! 🎉',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <style>
                        @media only screen and (max-width: 600px) {
                            .email-container { width: 100% !important; padding: 15px !important; }
                            .header-box { padding: 20px 15px !important; }
                            .cta-button { width: 100% !important; box-sizing: border-box !important; }
                        }
                    </style>
                </head>
                <body style="margin: 0; padding: 0; background-color: #030712; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #030712; padding: 20px 10px;">
                        <tr>
                            <td align="center">
                                <div class="email-container" style="max-width: 560px; width: 100%; margin: 0 auto; padding: 24px; border: 1px solid #1e293b; border-radius: 16px; background-color: #0b0f19; color: #f1f5f9; text-align: left; box-sizing: border-box;">
                                    <!-- Sleek Gradient Header -->
                                    <div class="header-box" style="background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%); padding: 24px 20px; border-radius: 12px; text-align: center; margin-bottom: 24px; box-shadow: 0 4px 15px rgba(37, 99, 235, 0.25);">
                                        <span style="font-size: 22px; font-weight: 800; color: #ffffff; letter-spacing: 2px; text-transform: uppercase; display: block;">
                                            DriveSync AI
                                        </span>
                                        <h1 style="margin: 8px 0 0 0; font-size: 16px; font-weight: 600; color: #e2e8f0; opacity: 0.95;">
                                            Welcome to the Garage! 🚀
                                        </h1>
                                    </div>
                                    
                                    <!-- Welcome Details -->
                                    <h2 style="color: #60a5fa; font-size: 19px; font-weight: 700; margin: 0 0 12px 0;">
                                        Salutations, ${userName}!
                                    </h2>
                                    <p style="font-size: 14px; line-height: 1.6; color: #cbd5e1; margin: 0 0 20px 0;">
                                        Your account is ready. Log maintenance events, budget vehicle expenses, and diagnose trouble symptoms with AI instantly.
                                    </p>

                                    <!-- Feature Cards -->
                                    <h3 style="color: #a78bfa; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; margin: 24px 0 12px 0;">
                                        App Highlights
                                    </h3>
                                    
                                    <div style="background-color: #1e293b; border: 1px solid #334155; padding: 14px 16px; border-radius: 10px; margin-bottom: 10px;">
                                        <strong style="color: #60a5fa; font-size: 14px; display: block; margin-bottom: 4px;">🛠️ AI Problem Analysis</strong>
                                        <span style="font-size: 13px; color: #94a3b8; line-height: 1.4;">Describe vehicle issues to receive cause & severity advice.</span>
                                    </div>

                                    <div style="background-color: #1e293b; border: 1px solid #334155; padding: 14px 16px; border-radius: 10px; margin-bottom: 10px;">
                                        <strong style="color: #34d399; font-size: 14px; display: block; margin-bottom: 4px;">📊 Service & Expense Timeline</strong>
                                        <span style="font-size: 13px; color: #94a3b8; line-height: 1.4;">Track maintenance, receipts, odometer readings & total budgets.</span>
                                    </div>

                                    <div style="background-color: #1e293b; border: 1px solid #334155; padding: 14px 16px; border-radius: 10px; margin-bottom: 10px;">
                                        <strong style="color: #fbbf24; font-size: 14px; display: block; margin-bottom: 4px;">🔔 Maintenance Alarms</strong>
                                        <span style="font-size: 13px; color: #94a3b8; line-height: 1.4;">Set upcoming interval dates and mileage alert targets.</span>
                                    </div>

                                    <!-- CTA Button -->
                                    <div style="margin: 28px 0 20px 0; text-align: center;">
                                        <a href="${process.env.CLIENT_URL || 'https://ai-vehicle-service-assistant.vercel.app'}" class="cta-button" style="background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%); color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 15px; display: inline-block; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.35);">
                                            Launch Live Dashboard
                                        </a>
                                    </div>

                                    <!-- Disclaimer -->
                                    <div style="border-top: 1px solid #1e293b; padding-top: 16px; margin-top: 24px;">
                                        <p style="font-size: 11px; color: #64748b; line-height: 1.5; margin: 0;">
                                            <strong>Safety Note:</strong> AI diagnostic suggestions are preliminary informational guidance and do not replace professional mechanic inspections.
                                        </p>
                                    </div>
                                    
                                    <!-- Footer -->
                                    <div style="margin-top: 20px; padding-top: 12px; border-top: 1px solid #1e293b; text-align: center; font-size: 11px; color: #475569;">
                                        © 2026 DriveSync AI Platform. All rights reserved.
                                    </div>
                                </div>
                            </td>
                        </tr>
                    </table>
                </body>
                </html>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`[SMTP Mailer] Welcome email sent to ${toEmail}. MessageId: ${info.messageId}`);
        return true;
    } catch (error) {
        if (error.isSandboxRestriction) {
            console.log(`[Resend Sandbox Notice] Welcome email skipped for ${toEmail} (unverified recipient in Resend Sandbox mode). Registration completed instantly!`);
            return true;
        }
        console.error('[SMTP Mailer Error] Failed to send registration email:', error.message);
        return false;
    }
};

const sendResetPasswordEmail = async (toEmail, userName, tempPassword) => {
    try {
        const isPlaceholder = (!process.env.SMTP_USER ||
            process.env.SMTP_USER === 'your_email@gmail.com' ||
            !process.env.SMTP_PASS ||
            process.env.SMTP_PASS === 'your_app_password') && !process.env.RESEND_API_KEY && !getBrevoKey();

        if (isPlaceholder) {
            console.log('\n=======================================================');
            console.log('[DEVELOPER MAIL LOG] SMTP is not configured. Logging Password Reset Email:');
            console.log(`To: ${toEmail}`);
            console.log(`Subject: Password Reset Request - DriveSync AI`);
            console.log(`Body: Hi ${userName}, your new temporary password is: ${tempPassword}. Please log in and change it in Profile settings.`);
            console.log('=======================================================\n');
            return true;
        }

        const mailOptions = {
            from: process.env.SMTP_FROM || `"DriveSync AI" <${process.env.BREVO_SENDER_EMAIL || process.env.SMTP_USER || 'chauhanhimanshu0608@gmail.com'}>`,
            to: toEmail,
            subject: 'Password Reset Request - DriveSync AI 🔑',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <style>
                        @media only screen and (max-width: 600px) {
                            .email-container { width: 100% !important; padding: 15px !important; }
                            .cta-button { width: 100% !important; box-sizing: border-box !important; }
                        }
                    </style>
                </head>
                <body style="margin: 0; padding: 0; background-color: #030712; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #030712; padding: 20px 10px;">
                        <tr>
                            <td align="center">
                                <div class="email-container" style="max-width: 560px; width: 100%; margin: 0 auto; padding: 24px; border: 1px solid #1e293b; border-radius: 16px; background-color: #0b0f19; color: #f1f5f9; text-align: left; box-sizing: border-box;">
                                    <div style="background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%); padding: 24px 20px; border-radius: 12px; text-align: center; margin-bottom: 24px; box-shadow: 0 4px 15px rgba(37, 99, 235, 0.25);">
                                        <span style="font-size: 22px; font-weight: 800; color: #ffffff; letter-spacing: 2px; text-transform: uppercase; display: block;">
                                            DriveSync AI
                                        </span>
                                        <h1 style="margin: 8px 0 0 0; font-size: 16px; font-weight: 600; color: #e2e8f0; opacity: 0.95;">
                                            Password Reset Requested 🔑
                                        </h1>
                                    </div>
                                    <div style="padding: 0 5px;">
                                        <h2 style="color: #60a5fa; font-size: 19px; font-weight: 700; margin: 0 0 12px 0;">
                                            Hello, ${userName}!
                                        </h2>
                                        <p style="font-size: 14px; line-height: 1.6; color: #cbd5e1; margin: 0 0 20px 0;">
                                            You requested security access assistance reset for your vehicle logs account. Here is your temporary password:
                                        </p>
                                        <div style="background-color: #1e293b; border: 1px solid #334155; padding: 18px; border-radius: 10px; text-align: center; margin-bottom: 22px;">
                                            <span style="font-family: monospace; font-size: 24px; font-weight: bold; color: #fbbf24; letter-spacing: 2px;">
                                                ${tempPassword}
                                            </span>
                                        </div>
                                        <p style="font-size: 13px; line-height: 1.5; color: #94a3b8; margin: 0 0 24px 0;">
                                            Please log in using this code and update your password in <strong>Profile Settings</strong> immediately.
                                        </p>
                                        <div style="margin: 24px 0; text-align: center;">
                                            <a href="${process.env.CLIENT_URL || 'https://ai-vehicle-service-assistant.vercel.app'}/login" class="cta-button" style="background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%); color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 15px; display: inline-block; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.35);">
                                                Log In Now
                                            </a>
                                        </div>
                                    </div>
                                    <div style="margin-top: 24px; padding-top: 12px; border-top: 1px solid #1e293b; text-align: center; font-size: 11px; color: #475569;">
                                        © 2026 DriveSync AI Platform. Secure Account Recovery.
                                    </div>
                                </div>
                            </td>
                        </tr>
                    </table>
                </body>
                </html>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`[SMTP Mailer] Password reset email sent to ${toEmail}. MessageId: ${info.messageId}`);
        return true;
    } catch (error) {
        console.error('\n=======================================================');
        console.log('[DEVELOPER MAIL FALLBACK] Send mail failed. Temporary Password:');
        console.log(`To: ${toEmail}`);
        console.log(`Temp Password: ${tempPassword}`);
        if (error.isSandboxRestriction) {
            console.log('Note: Resend Sandbox mode restricted email delivery (unverified recipient).');
        }
        console.log('=======================================================\n');
        return true;
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
            from: process.env.SMTP_FROM || `"DriveSync AI" <${process.env.BREVO_SENDER_EMAIL || process.env.SMTP_USER || 'chauhanhimanshu0608@gmail.com'}>`,
            to: toEmail,
            subject: 'Account Permanently Deleted - DriveSync AI 🚗',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <style>
                        @media only screen and (max-width: 600px) {
                            .email-container { width: 100% !important; padding: 15px !important; }
                        }
                    </style>
                </head>
                <body style="margin: 0; padding: 0; background-color: #030712; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #030712; padding: 20px 10px;">
                        <tr>
                            <td align="center">
                                <div class="email-container" style="max-width: 560px; width: 100%; margin: 0 auto; padding: 24px; border: 1px solid #1e293b; border-radius: 16px; background-color: #0b0f19; color: #f1f5f9; text-align: left; box-sizing: border-box;">
                                    <div style="background: linear-gradient(135deg, #ef4444 0%, #991b1b 100%); padding: 24px 20px; border-radius: 12px; text-align: center; margin-bottom: 24px; box-shadow: 0 4px 15px rgba(239, 68, 68, 0.25);">
                                        <span style="font-size: 22px; font-weight: 800; color: #ffffff; letter-spacing: 2px; text-transform: uppercase; display: block;">
                                            DriveSync AI
                                        </span>
                                        <h1 style="margin: 8px 0 0 0; font-size: 16px; font-weight: 600; color: #fecaca; opacity: 0.95;">
                                            Account Permanently Deleted ⚠️
                                        </h1>
                                    </div>
                                    <div style="padding: 0 5px;">
                                        <h2 style="color: #ef4444; font-size: 19px; font-weight: 700; margin: 0 0 12px 0;">
                                            Goodbye, ${userName}!
                                        </h2>
                                        <p style="font-size: 14px; line-height: 1.6; color: #cbd5e1; margin: 0 0 20px 0;">
                                            This email confirms that your DriveSync AI account associated with <strong>${toEmail}</strong> and all associated vehicle history logs have been permanently deleted as requested.
                                        </p>
                                    </div>
                                    <div style="margin-top: 24px; padding-top: 12px; border-top: 1px solid #1e293b; text-align: center; font-size: 11px; color: #475569;">
                                        © 2026 DriveSync AI Platform. Data Privacy & Account Deletion Complete.
                                    </div>
                                </div>
                            </td>
                        </tr>
                    </table>
                </body>
                </html>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`[SMTP Mailer] Account deletion confirmation sent to ${toEmail}. MessageId: ${info.messageId}`);
        return true;
    } catch (error) {
        if (error.isSandboxRestriction) {
            console.log(`[SMTP Mailer Notice] Account deletion email skipped for ${toEmail} due to Resend Sandbox mode. Deletion complete!`);
            return true;
        }
        console.error('[SMTP Mailer Error] Failed to send account deletion email:', error.message);
        return false;
    }
};

module.exports = {
    sendWelcomeEmail,
    sendResetPasswordEmail,
    sendAccountDeletedEmail
};
