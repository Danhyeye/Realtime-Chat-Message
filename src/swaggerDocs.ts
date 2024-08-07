const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Realtime Chat API",
      version: "1.0.0",
      description: "API documentation for the Realtime Chat application",
    },
    servers: [
      {
        url: "http://localhost:8080",
      },
    ],
  },
  apis: ["./src/swagger/*.ts"],
};

export default swaggerOptions;
