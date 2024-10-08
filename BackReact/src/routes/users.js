import {v4 as uuidv4} from 'uuid';
import {
	getUserById,
	getUsers,
	loginUser,
	registerUser,
	sendVerificationEmail
} from "../controllers/users.js";
import User from "../models/users.js";
import { where } from 'sequelize';
export function usersRoutes(app, blacklistedTokens ) {
	app.post("/login", async (request, reply) => {
		reply.send(await loginUser(request.body, app));
	}).post(
		"/logout",
		{ preHandler: [app.authenticate] },
		async (request, reply) => {
			const token = request.headers["authorization"].split(" ")[1]; // Récupérer le token depuis l'en-tête Authorization

			// Ajouter le token à la liste noire
			blacklistedTokens.push(token);

			reply.send({ logout: true });
		}
	);
	//inscription d'un utilisateur
	app.post("/register", async (request, reply) => {
		try {
			const{firstname, lastname, username, email, password} = request.body;
			if (!firstname || !lastname || !username || !email || !password) {
				return reply.send({ error: "Tous les champs sont obligatoires" });
			}
			const user = await registerUser(request.body, app.bcrypt);
			const verificationToken = uuidv4();

			user.verificationToken = verificationToken;
			await user.save();
			const verifLink = `http://localhost:3000/verify?token=${verificationToken}`;
			await sendVerificationEmail(user.email, verifLink);
			reply.send(user)

		} catch (error) {
			reply.send({ error: "Une erreur est survenue lors de l'inscription." });
			console.error("An error occurred:", error);
		}
	});
	
	app.get("/verify", async (request, reply) => {
		const { token } = request.query;
		try{
			const user = await User.findOne({where: {verificationToken: token}});
			if (!user) {
				return reply.send({ error: "Token invalide" });
			}
			user.verified = true;
			user.verificationToken = null;
			await user.save();
			reply.type('text/html').send(`
				<!DOCTYPE html>
				<html lang="fr">
					<head>
						<meta charset="UTF-8" />
						<title>Email vérifié</title>
					</head>
					<body>
						<h1>Email vérifié avec succès !</h1>
						<p>Vous allez être redirigé vers la page de connexion...</p>
						<script>
							setTimeout(function() {
								window.location.href = 'http://localhost:5173/login';
							}, 3000); // Redirige après 3 secondes
						</script>
					</body>
				</html>
			`);
		} catch {
			reply.send("Une erreur est survenue lors de la vérification de l'email." );
		}
	});

	//récupération de la liste des utilisateurs
	app.get("/users", async (request, reply) => {
		reply.send(await getUsers());
	});
	//récupération d'un utilisateur par son id
	app.get("/users/:id", async (request, reply) => {
		reply.send(await getUserById(request.params.id));
	});


}
