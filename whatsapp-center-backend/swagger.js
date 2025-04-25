const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'User Management API',
      version: '1.0.0',
      "x-logo": {
        url: 'http://localhost:3881/api-docs/',
        backgroundColor: '#fff',
        altText: 'Click here to refresh'
      }
    },
    servers: [
      {
        url: 'http://localhost:3881',
      },
    ],

    // Tambahkan bagian components untuk mendefinisikan schema
    components: {
      // definisi security schema
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      // definisi schema
      schemas: {
        User: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'ID unik dari user',
            },
            email: {
              type: 'string',
              description: 'Email user',
            },
            role: {
              type: 'string',
              description: 'Peran user (misalnya, admin, agent, dsb.)',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Tanggal dibuatnya user',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Tanggal terakhir user diupdate',
            }
          }
        }
      }
    }
  },
  // Pastikan path berikut mengarah ke file yang berisi anotasi Swagger, misal: userRoutes.js
  apis: [
    './userRoutes.js', 
    '/authRoutes.js',
    './controllers/message_controller.go', // Pastikan path relatif sudah benar
    "./controllers/inbound_controller.go",
    "./controllers/conversation_controller.go", // Pastikan file ini disertakan
    './routes/routes.go',                   // Jika ada anotasi di file routes
  ],
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = { swaggerUi, swaggerSpec };