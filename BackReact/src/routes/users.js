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
					<meta charset="UTF-8">
					<meta name="viewport" content="width=device-width, initial-scale=1.0">
					<meta http-equiv="X-UA-Compatible" content="IE=edge">
					<title>Email Vérifié</title>
					<style>
						body {
							font-family: Arial, sans-serif;
							background-color: #e0f7fa; /* Fond bleu clair */
							color: #01579b; /* Texte bleu */
							margin: 0;
							padding: 0;
							display: flex;
							justify-content: center;
							align-items: center;
							height: 100vh;
						}
						.container {
							text-align: center;
							background-color: #ffffff;
							padding: 30px;
							border-radius: 10px;
							box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
						}
						h1 {
							color: #01579b; /* Texte bleu */
							font-size: 24px;
							margin-bottom: 10px;
						}
						p {
							font-size: 18px;
							margin: 10px 0 20px;
						}
						.loader {
							border: 4px solid #f3f3f3;
							border-radius: 50%;
							border-top: 4px solid #01579b; /* Couleur du loader bleu */
							width: 40px;
							height: 40px;
							animation: spin 1s linear infinite;
							margin: 0 auto 20px;
						}
						@keyframes spin {
							0% { transform: rotate(0deg); }
							100% { transform: rotate(360deg); }
						}
						.redirect {
							font-size: 14px;
							color: #0288d1; /* Texte de redirection en bleu clair */
						}
					</style>
				</head>
				<body>
					<div class="container">
						<div class="loader"></div>
						<h1>Email vérifié avec succès !</h1>
						<p>Vous allez être redirigé vers la page de connexion...</p>
						<p class="redirect">Redirection dans <span id="countdown">3</span> secondes...</p>
					</div>

					<script>
						let countdownElement = document.getElementById('countdown');
						let countdown = 3;
						const interval = setInterval(() => {
							countdown--;
							countdownElement.textContent = countdown;
							if (countdown === 0) {
								clearInterval(interval);
								window.location.href = 'http://localhost:5173/login';
							}
						}, 1000);
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
