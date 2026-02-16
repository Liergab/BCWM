import nodemailer, { Transporter } from 'nodemailer';
import ejs from 'ejs';
import path from 'path';
import fs from 'fs';
import env from '../util/validate';

interface MailOptions {
    from: {
        name: string;
        address: string;
    };
    to: string;
    subject: string;
    html?: string;
}

const transporter: Transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: env.EMAIL_TEST,
        pass: env.EMAIL_TEST_APP
    }
});

async function sendEmail(subject: string, recipient: string, templateName: string, templateData: any): Promise<any> {
    const templatePath = path.join(__dirname, '..', 'views', 'emails', `${templateName}.ejs`);
    const template = fs.readFileSync(templatePath, 'utf8');
    const htmlBody = ejs.render(template, templateData);

    const mailOptions: MailOptions = {
        from: {
            name: 'Website Name',
            address: env.EMAIL_TEST,
        },
        to: recipient,
        subject: subject,
        html: htmlBody
    };

    const send = await transporter.sendMail(mailOptions);
    return send;
}

export default sendEmail;