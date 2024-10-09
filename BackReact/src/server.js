import chalk from "chalk";
import fastify from "fastify";
import fastifyBcrypt from "fastify-bcrypt";
import cors from "@fastify/cors";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";
import fastifyJWT from "@fastify/jwt";
import socketioServer from "fastify-socket.io";
import { usersRoutes } from "./routes/users.js";
import { gamesRoutes } from "./routes/games.js";
import { sequelize } from "./bdd.js";

// Test de la connexion
try {
  sequelize.authenticate();
  console.log(chalk.grey("Connecté à la base de données MySQL!"));
} catch (error) {
  console.error("Impossible de se connecter, erreur suivante :", error);
}

/**
 * API
 * avec fastify
 */
let blacklistedTokens = [];
const app = fastify();

// Ajout du plugin fastify-bcrypt pour le hash du mdp
await app
  .register(fastifyBcrypt, {
    saltWorkFactor: 12,
  })
  .register(cors, {
    origin: "*",
  })
  .register(fastifySwagger, {
    openapi: {
      openapi: "3.0.0",
      info: {
        title: "Documentation de l'API JDR LOTR",
        description:
          "API développée pour un exercice avec React avec Fastify et Sequelize",
        version: "0.1.0",
      },
    },
  })
  .register(fastifySwaggerUi, {
    routePrefix: "/documentation",
    theme: {
      title: "Docs - JDR LOTR API",
    },
    uiConfig: {
      docExpansion: "list",
      deepLinking: false,
    },
    uiHooks: {
      onRequest: function (request, reply, next) {
        next();
      },
      preHandler: function (request, reply, next) {
        next();
      },
    },
    staticCSP: true,
    transformStaticCSP: (header) => header,
    transformSpecification: (swaggerObject, request, reply) => {
      return swaggerObject;
    },
    transformSpecificationClone: true,
  })
  .register(fastifyJWT, {
    secret: "unanneaupourlesgouvernertous",
  }).register(socketioServer, {
	cors: {
	  origin: "*",
	},
  });

/**********
 * Routes
 **********/
app.get("/", (request, reply) => {
  reply.send({ documentationURL: "http://localhost:3000/documentation" });
});

// Fonction pour décoder et vérifier le token
app.decorate("authenticate", async (request, reply) => {
  try {
    const token = request.headers["authorization"].split(" ")[1];

    // Vérifier si le token est dans la liste noire
    if (blacklistedTokens.includes(token)) {
      return reply.status(401).send({ error: "Token invalide ou expiré" });
    }
    await request.jwtVerify();
  } catch (err) {
    reply.send(err);
  }
});

// gestion utilisateur
usersRoutes(app, blacklistedTokens);
// gestion des jeux
gamesRoutes(app);

/**********
 * Intégration de Socket.IO
 **********/
const startServer = async () => {
  try {
    await sequelize
      .sync({ alter: true })
      .then(() => {
        console.log(chalk.green("Base de données synchronisée."));
      })
      .catch((error) => {
        console.error(
          "Erreur de synchronisation de la base de données :",
          error
        );
      });

    const server = await app.listen({ port: 3000, host: '0.0.0.0' });
    console.log(
      "Serveur Fastify lancé sur " + chalk.blue("http://localhost:3000")
    );

    // Création de l'instance Socket.IO liée à Fastify
    

    let games = {};

    app.io.on("connection", (socket) => {
      console.log(`Nouvelle connexion : ${socket.id}`);

      // Gestion de la création d'une nouvelle partie
      socket.on("createGame", () => {
        const gameId = Math.random().toString(36).substr(2, 9);
        games[gameId] = { players: [socket.id], board: null };
        socket.join(gameId);
        socket.emit("gameCreated", gameId);
      });

      // Gestion de la connexion à une partie existante
      socket.on("joinGame", (gameId) => {
        if (games[gameId] && games[gameId].players.length === 1) {
          games[gameId].players.push(socket.id);
          socket.join(gameId);
          app.io.in(gameId).emit("gameStarted");
        } else {
          socket.emit("error", "Jeu non disponible ou déjà en cours.");
        }
      });

      socket.on("movePiece", (data) => {
        const { gameId, move } = data;
        app.io.in(gameId).emit("updateBoard", move);
      });

      socket.on("disconnect", () => {
        console.log(`Joueur déconnecté : ${socket.id}`);
      });
    });

    console.log(
      chalk.bgYellow(
        "Accéder à la documentation sur http://localhost:3000/documentation"
      )
    );
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
};

// Démarrer le serveur
startServer();
