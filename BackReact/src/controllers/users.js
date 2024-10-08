import User from "../models/users.js";
import { Op } from "sequelize";
import nodemailer from "nodemailer";
import mjml2html from "mjml";

async function generateID(id) {
	const { count } = await findAndCountAllUsersById(id);
	if (count > 0) {
		id = id.substring(0, 5);
		const { count } = await findAndCountAllUsersById(id);
		id = id + (count + 1);
	}
	return id;
}

export async function getUsers() {
	return await User.findAll();
}
export async function getUserById(id) {
	return await User.findByPk(id);
}
export async function findAndCountAllUsersById(id) {
	return await User.findAndCountAll({
		where: {
			id: {
				[Op.like]: `${id}%`,
			},
		},
	});
}
export async function findAndCountAllUsersByEmail(email) {
	return await User.findAndCountAll({
		where: {
			email: {
				[Op.eq]: email,
			},
		},
	});
}
export async function findAndCountAllUsersByUsername(username) {
	return await User.findAndCountAll({
		where: {
			username: {
				[Op.eq]: username,
			},
		},
	});
}
export async function registerUser(userDatas, bcrypt) {
	if (!userDatas) {
		return { error: "Aucune donnée à enregistrer" };
	}
	const { firstname, lastname, username, email, password } = userDatas;
	if (!firstname || !lastname || !username || !email || !password) {
		return { error: "Tous les champs sont obligatoires" };
	}
	//vérification que l'email n'est pas déjà utilisé
	const { count: emailCount } = await findAndCountAllUsersByEmail(email);
	if (emailCount > 0) {
		return { error: "L'adresse email est déjà utilisée." };
	}

	//vérification que le pseudo n'est pas déjà utilisé
	const { count: usernameCount } = await findAndCountAllUsersByUsername(
		username
	);
	if (usernameCount > 0) {
		return { error: "Le nom d'utilisateur est déjà utilisé." };
	}
	//création de l'identifiant
	let id = await generateID(
		(lastname.substring(0, 3) + firstname.substring(0, 3)).toUpperCase()
	);
	//hashage du mot de passe
	const hashedPassword = await bcrypt.hash(password);
	//création de l'utilisateur dans la base de données
	const user = {
		id,
		firstname,
		lastname,
		username,
		email,
		password: hashedPassword,
	};
	return await User.create(user);
}
export async function loginUser(userDatas, app) {
	if (!userDatas) {
		return { error: "Aucune donnée n'a été envoyée" };
	}
	const { email, password } = userDatas;
	if (!email || !password) {
		return { error: "Tous les champs sont obligatoires" };
	}
	//vérification que l'email est utilisé
	const { count, rows } = await findAndCountAllUsersByEmail(email);
	if (count === 0) {
		return {
			error: "Il n'y a pas d'utilisateur associé à cette adresse email.",
		};
	} else if (rows[0].verified === false) {
		return {
			error: "Votre compte n'est pas encore vérifié. Veuillez vérifier votre boîte mail.",
		};
	}
	//récupération de l'utilisateur
	const user = await User.findOne({
		where: {
			email: {
				[Op.eq]: email,
			},
		},
	});
	//comparaison des mots de passe
	const match = await app.bcrypt.compare(password, user.password);
	if (!match) {
		return { error: "Mot de passe incorrect" };
	}
	// Générer le JWT après une authentification réussie
	const token = app.jwt.sign(
		{ id: user.id, username: user.username },
		{ expiresIn: "3h" }
	);
	return { token };
}

export async function sendVerificationEmail (email, verificationLink) {
    const transporter = nodemailer.createTransport({
        service: 'gmail', // Configure ton service email ou un SMTP personnalisé
        auth: {
            user: 'michaelyaromishyan@gmail.com',
            pass: 'qtyn drmf csck jyir',
        },
    });

	const emailTemplate = mjml2html(`
		<mjml>
		  <mj-body background-color="#f4f4f4" font-family="Helvetica, Arial, sans-serif">
			<mj-section background-color="#ffffff" padding="20px" border-radius="8px">
			  <mj-column>
				<mj-text font-size="24px" color="#333333" font-weight="bold">
				  Bienvenue chez GAME JCP ENCORE !
				</mj-text>
				<mj-text font-size="16px" color="#555555" padding-bottom="20px">
				  Nous sommes ravis de vous compter parmi nous. Pour finaliser votre inscription, veuillez vérifier votre adresse email en cliquant sur le bouton ci-dessous.
				</mj-text>
				<mj-button href="${verificationLink}" background-color="#007BFF" color="#ffffff" font-size="16px" padding="15px 30px" border-radius="5px">
				  Vérifier mon email
				</mj-button>
				<mj-text font-size="14px" color="#777777" padding-top="20px">
				  Si vous n'avez pas créé de compte, ignorez simplement cet email.
				</mj-text>
			  </mj-column>
			</mj-section>
			<mj-section>
			  <mj-column>
				<mj-text font-size="12px" color="#999999" align="center" padding-top="30px">
				  &copy; 2024 [Nom de l'Application]. Tous droits réservés.
				</mj-text>
			  </mj-column>
			</mj-section>
		  </mj-body>
		</mjml>
	  `);
	  

    const mailOptions = {
        from: 'ton-email@gmail.com',
        to: email,
        subject: 'Vérification de votre email',
        html: emailTemplate.html,
    };

    await transporter.sendMail(mailOptions);
};
