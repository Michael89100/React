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
  await sequelize.authenticate();
  console.log(chalk.grey("Connecté à la base de données MySQL!"));
} catch (error) {
  console.error("Impossible de se connecter, erreur suivante :", error);
}

/**
 * API avec fastify
 */
let blacklistedTokens = [];
const app = fastify();

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
          "API développée pour un exercice avec React, Fastify et Sequelize",
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
  })
  .register(socketioServer, {
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

// Gestion utilisateur
usersRoutes(app, blacklistedTokens);
// Gestion des jeux
gamesRoutes(app);

/**********
 * Intégration de Socket.IO
 **********/

let games = {}; // Stocker les parties créées

app.io.on("connection", (socket) => {
  console.log(`Nouvelle connexion : ${socket.id}`);

  // Gestion de la création d'une nouvelle partie
  socket.on("createGame", () => {
    const gameId = Math.random().toString(36).substr(2, 9); // Génération d'un ID unique
    games[gameId] = { players: new Set([socket.id]), board: null, colors: { [socket.id]: 'w' } }; // Le créateur de la partie est blanc
    socket.join(gameId); // Le joueur rejoint la salle de la partie
    socket.emit("gameCreated", gameId); // Informer le joueur de la création de la partie
    app.io.emit("updateGamesList", games); // Informer tous les clients de la mise à jour des parties
  });

  // Gestion de la connexion à une partie existante
  socket.on("joinGame", (gameId) => {
    if (games[gameId] && games[gameId].players.size === 1) {
      games[gameId].players.add(socket.id); // Ajouter le joueur à la partie
      games[gameId].colors[socket.id] = 'b'; // Assigner la couleur noire au deuxième joueur
      socket.join(gameId); // Le joueur rejoint la salle de la partie

      // Assigner la couleur à chaque joueur
      socket.emit("assignColor", 'b'); // Noir pour le deuxième joueur
      const [whitePlayer] = Array.from(games[gameId].players); // Blanc pour le premier joueur
      app.io.to(whitePlayer).emit("assignColor", 'w'); // Émettre la couleur blanche pour le premier joueur

      app.io.in(gameId).emit("gameStarted"); // Informer que la partie a commencé
      app.io.emit("updateGamesList", games); // Mettre à jour la liste des parties disponibles
    } else {
      socket.emit("error", "Jeu non disponible ou déjà en cours.");
    }
  });

  // Gestion des mouvements de pièces
  socket.on("movePiece", (data) => {
    const { gameId, move } = data;
    if (games[gameId]) {
      app.io.in(gameId).emit("updateBoard", move); // Transmettre le mouvement aux joueurs dans la salle
    }
  });

  // Gestion de la déconnexion d'un joueur
  socket.on("disconnect", () => {
    console.log(`Joueur déconnecté : ${socket.id}`);
    for (const gameId in games) {
      const game = games[gameId];
      if (game.players.has(socket.id)) {
        game.players.delete(socket.id);
        if (game.players.size === 0) {
          delete games[gameId]; // Suppression de la partie si plus de joueurs
        }
      }
    }
    app.io.emit("updateGamesList", games); // Mise à jour de la liste des parties après déconnexion
  });
});

/**********
 * Démarrer le serveur
 **********/
const startServer = async () => {
  try {
    await sequelize
      .sync({ alter: true })
      .then(() => {
        console.log(chalk.green("Base de données synchronisée."));
      })
      .catch((error) => {
        console.error("Erreur de synchronisation de la base de données :", error);
      });

    const server = await app.listen({ port: 3000, host: '0.0.0.0' });
    console.log("Serveur Fastify lancé sur " + chalk.blue("http://localhost:3000"));
    console.log(chalk.bgYellow("Accéder à la documentation sur http://localhost:3000/documentation"));
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
};

// Démarrer le serveur
startServer();
