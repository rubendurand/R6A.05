'use strict';

const { Service } = require('@hapipal/schmervice');
const Nodemailer = require('nodemailer');

module.exports = class MailService extends Service {

    constructor(...args) {
        super(...args);

        this.transporter = null;
    }

    async getTransporter() {
        if (this.transporter) {
            return this.transporter;
        }

        let auth = {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASS
        };

        if (!auth.user || !auth.pass) {
            console.log('No mail credentials found, creating Ethereal test account...');
            const testAccount = await Nodemailer.createTestAccount();
            auth = {
                user: testAccount.user,
                pass: testAccount.pass
            };
        }

        this.transporter = Nodemailer.createTransport({
            host: process.env.MAIL_HOST || 'smtp.ethereal.email',
            port: process.env.MAIL_PORT || 587,
            secure: false,
            auth
        });

        return this.transporter;
    }

    async sendWelcomeEmail(user) {
        try {
            const transporter = await this.getTransporter();
            const info = await transporter.sendMail({
                from: '"Movie Library" <no-reply@movielib.com>',
                to: user.email,
                subject: 'Welcome to Movie Library!',
                text: `Hello ${user.firstName},\n\nWelcome to our movie library. We are glad to have you.\n\nBest,\nThe Team`,
                html: `<p>Hello <b>${user.firstName}</b>,</p><p>Welcome to our movie library. We are glad to have you.</p>`
            });

            console.log('-----------------------------------------');
            console.log('📧 ENVOI DE MAIL : BIENVENUE');
            console.log('Destinataire:', user.email);
            console.log('Preview URL:', Nodemailer.getTestMessageUrl(info));
            console.log('-----------------------------------------');
        } catch (error) {
            console.error('Failed to send welcome email:', error.message);
        }
    }

    async sendNewMovieNotification(user, movie) {
        try {
            const transporter = await this.getTransporter();
            const info = await transporter.sendMail({
                from: '"Movie Library" <no-reply@movielib.com>',
                to: user.email,
                subject: 'New Movie Added!',
                text: `Hello ${user.firstName},\n\nA new movie "${movie.title}" has been added to our library.\n\nEnjoy!`,
                html: `<p>Hello <b>${user.firstName}</b>,</p><p>A new movie "<b>${movie.title}</b>" has been added to our library.</p>`
            });
            console.log('-----------------------------------------');
            console.log('📧 ENVOI DE MAIL : NOUVEAU FILM');
            console.log('Destinataire:', user.email);
            console.log('Preview URL:', Nodemailer.getTestMessageUrl(info));
            console.log('-----------------------------------------');
        } catch (error) {
            console.error('Failed to send new movie notification:', error.message);
        }
    }

    async sendMovieUpdateNotification(user, movie) {
        try {
            const transporter = await this.getTransporter();
            const info = await transporter.sendMail({
                from: '"Movie Library" <no-reply@movielib.com>',
                to: user.email,
                subject: 'Movie Updated',
                text: `Hello ${user.firstName},\n\nThe movie "${movie.title}" in your favorites has been updated.\n\nCheck it out!`,
                html: `<p>Hello <b>${user.firstName}</b>,</p><p>The movie "<b>${movie.title}</b>" in your favorites has been updated.</p>`
            });
            console.log('-----------------------------------------');
            console.log('📧 ENVOI DE MAIL : MISE À JOUR FILM');
            console.log('Destinataire:', user.email);
            console.log('Preview URL:', Nodemailer.getTestMessageUrl(info));
            console.log('-----------------------------------------');
        } catch (error) {
            console.error('Failed to send movie update notification:', error.message);
        }
        // The following lines were duplicates in the original code and are removed for correctness.
        // console.log('Update Notification sent: %s', info.messageId);
        // console.log('Preview URL: %s', Nodemailer.getTestMessageUrl(info));
    }

    async sendExportEmail(email, csvBuffer) {
        try {
            const transporter = await this.getTransporter();
            const info = await transporter.sendMail({
                from: '"Movie Library" <no-reply@movielib.com>',
                to: email,
                subject: 'Movies Export',
                text: 'Here is the CSV export of the movie library you requested.',
                html: '<p>Here is the <b>CSV export</b> of the movie library you requested.</p>',
                attachments: [
                    {
                        filename: 'movies_export.csv',
                        content: csvBuffer
                    }
                ]
            });
            console.log('-----------------------------------------');
            console.log('📧 ENVOI DE MAIL : EXPORT CSV');
            console.log('Destinataire:', email);
            console.log('Preview URL:', Nodemailer.getTestMessageUrl(info));
            console.log('-----------------------------------------');
        } catch (error) {
            console.error('Failed to send export email:', error.message);
        }
    }
};
