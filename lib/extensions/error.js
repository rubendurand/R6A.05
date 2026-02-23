'use strict';

module.exports = {
    name: 'app-error',
    register: (server, options) => {
        server.ext('onPreResponse', (request, h) => {
            const response = request.response;

            if (response.isBoom) {
                const payload = response.output.payload;

                // If it's a validation error (400), include details
                if (response.data && response.data.details) {
                    payload.details = response.data.details;
                }

                console.error('Error Response:', response.message, response.data || '');
            }

            return h.continue;
        });
    }
};
