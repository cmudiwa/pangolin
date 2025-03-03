export * from "@server/emails/sendEmail";

import nodemailer from "nodemailer";
import config from "@server/lib/config";
import logger from "@server/logger";
import SMTPTransport from "nodemailer/lib/smtp-transport";

function createEmailClient() {
    const emailConfig = config.getRawConfig().email;
    if (!emailConfig) {
        logger.warn(
            "Email SMTP configuration is missing. Emails will not be sent."
        );
        return;
    }

    const settings = {
        host: emailConfig.smtp_host,
        port: emailConfig.smtp_port,
        secure: emailConfig.smtp_secure || false,
        auth: {
            user: emailConfig.smtp_user,
            pass: emailConfig.smtp_pass
        }
    } as SMTPTransport.Options;

    if (emailConfig.smtp_tls_reject_unathorized !== undefined) {
        settings.tls = {
            rejectUnauthorized: emailConfig.smtp_tls_reject_unathorized
        };
    }

    return nodemailer.createTransport(settings);
}

export const emailClient = createEmailClient();

export default emailClient;
