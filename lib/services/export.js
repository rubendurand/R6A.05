'use strict';

const { Service } = require('@hapipal/schmervice');
const Amqp = require('amqplib');

module.exports = class ExportService extends Service {

    constructor(...args) {
        super(...args);
        this.connection = null;
        this.channel = null;
        this.queueName = 'export_movies_queue';
    }

    async initialize() {
        try {
            this.connection = await Amqp.connect(process.env.AMQP_URL || 'amqp://localhost');
            this.channel = await this.connection.createChannel();
            await this.channel.assertQueue(this.queueName, { durable: true });

            console.log('RabbitMQ connected and queue asserted');

            // Start Consumer
            this.consume();
        } catch (err) {
            console.error('RabbitMQ connection failed:', err);
            // In production, adding retry logic is good practice
        }
    }

    async publishExportRequest(email) {
        if (!this.channel) {
            throw new Error('RabbitMQ channel not initialized');
        }
        const message = JSON.stringify({ email });
        this.channel.sendToQueue(this.queueName, Buffer.from(message), { persistent: true });
        console.log(`Export request queued for ${email}`);
    }

    async consume() {
        if (!this.channel) return;

        this.channel.consume(this.queueName, async (msg) => {
            if (msg !== null) {
                const content = JSON.parse(msg.content.toString());
                const email = content.email;

                console.log(`Processing export for ${email}`);

                try {
                    await this.processExport(email);
                    this.channel.ack(msg);
                } catch (err) {
                    console.error('Error processing export:', err);
                    // this.channel.nack(msg); // Be careful with loops
                }
            }
        });
    }

    async processExport(email) {
        const { Movie } = this.server.models();
        const { MailService } = this.server.services();

        const movies = await Movie.query();

        // Generate CSV
        const header = 'Id,Title,Description,ReleaseDate,Director\n';
        const rows = movies.map(m => {
            return `"${m.id}","${m.title}","${m.description}","${m.releaseDate}","${m.director}"`;
        }).join('\n');

        const csvContent = header + rows;
        const csvBuffer = Buffer.from(csvContent, 'utf-8');

        // Send Email
        await MailService.sendExportEmail(email, csvBuffer);
    }
};
