import dotenv from 'dotenv';
import nodemailer, {SentMessageInfo} from 'nodemailer';
import fs from 'fs';
import path from "path";
import {Log} from "../helpers/Log";

dotenv.config();

export class Mail {

    getTransporter() {
        return nodemailer.createTransport({
            // @ts-ignore
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
    }

    send(to: string, subject: string, text: string, useHtml: boolean = true): Promise<boolean> {
        try {
            let html = fs.readFileSync(path.join(__dirname, 'mail_template.html')).toString();
            html = html.replace('{{subject}}', subject);
            html = html.replace('{{message}}', text);

            return new Promise<boolean>(resolve => {
                const mailOptions = {
                    from: process.env.SMTP_ADDR,
                    to,
                    subject,
                    html: useHtml ? html : text,
                };

                this.getTransporter().sendMail(mailOptions).then((x: SentMessageInfo) => {
                    resolve(true);
                }).catch(() => {
                    resolve(false);
                })

            });
        } catch (e) {
            Log.error('[MAIL-NOTIFICATION] Es ist eine Fehler beim Senden einer E-Mail aufgetreten:');
            Log.error(e);
        }
    }

}
