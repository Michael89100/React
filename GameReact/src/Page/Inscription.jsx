import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { Link } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const SignupSchema = Yup.object().shape({
  firstName: Yup.string().required('Prénom requis'),
  lastName: Yup.string().required('Nom requis'),
  username: Yup.string().required('Nom d\'utilisateur requis'),
  email: Yup.string().email('Email invalide').required('Email requis'),
  password: Yup.string().min(6, 'Le mot de passe doit comporter au moins 6 caractères').required('Mot de passe requis'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Les mots de passe doivent correspondre')
    .required('Confirmation du mot de passe requise'),
});

const SignupForm = ({ setIsAuthenticated }) => {
  const registerUser = async (values) => {
    try {
      const response = await fetch('http://localhost:3000/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstname: values.firstName,
          lastname: values.lastName,
          email: values.email,
          password: values.password,
          username: values.username, // Le champ username est maintenant envoyé
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Inscription réussie ! Vous êtes maintenant connecté.');
        setIsAuthenticated(true); // Set authentication status if registration is successful.
      } else {
        toast.error(`Erreur: ${data.error}`);
      }
    } catch (error) {
      toast.error('Une erreur est survenue lors de l\'inscription.');
      console.error('An error occurred:', error);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-r from-blue-500 to-indigo-600">
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-sm">
        <ToastContainer /> {/* This is the toast container */}
        <h2 className="text-2xl font-bold text-center mb-4 text-gray-800">Inscription</h2>
        <Formik
          initialValues={{ firstName: '', lastName: '', username: '', email: '', password: '', confirmPassword: '' }}
          validationSchema={SignupSchema}
          onSubmit={(values) => {
            registerUser(values);
          }}
        >
          {() => (
            <Form>
              {/* Champ Prénom */}
              <div className="mb-3">
                <label htmlFor="firstName" className="block text-md font-medium text-gray-700 mb-1">Prénom</label>
                <Field
                  type="text"
                  name="firstName"
                  placeholder="Prénom"
                  className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition duration-300 ease-in-out"
                />
                <ErrorMessage name="firstName" component="div" className="text-red-500 text-sm mt-1" />
              </div>

              {/* Champ Nom */}
              <div className="mb-3">
                <label htmlFor="lastName" className="block text-md font-medium text-gray-700 mb-1">Nom</label>
                <Field
                  type="text"
                  name="lastName"
                  placeholder="Nom"
                  className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition duration-300 ease-in-out"
                />
                <ErrorMessage name="lastName" component="div" className="text-red-500 text-sm mt-1" />
              </div>

              {/* Champ Nom d'utilisateur */}
              <div className="mb-3">
                <label htmlFor="username" className="block text-md font-medium text-gray-700 mb-1">Nom d'utilisateur</label>
                <Field
                  type="text"
                  name="username"
                  placeholder="Nom d'utilisateur"
                  className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition duration-300 ease-in-out"
                />
                <ErrorMessage name="username" component="div" className="text-red-500 text-sm mt-1" />
              </div>

              {/* Champ Email */}
              <div className="mb-3">
                <label htmlFor="email" className="block text-md font-medium text-gray-700 mb-1">Adresse e-mail</label>
                <Field
                  type="email"
                  name="email"
                  placeholder="Email"
                  className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition duration-300 ease-in-out"
                />
                <ErrorMessage name="email" component="div" className="text-red-500 text-sm mt-1" />
              </div>

              {/* Champ Mot de passe */}
              <div className="mb-3">
                <label htmlFor="password" className="block text-md font-medium text-gray-700 mb-1">Mot de passe</label>
                <Field
                  type="password"
                  name="password"
                  placeholder="Mot de passe"
                  className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition duration-300 ease-in-out"
                />
                <ErrorMessage name="password" component="div" className="text-red-500 text-sm mt-1" />
              </div>

              {/* Champ Confirmer mot de passe */}
              <div className="mb-3">
                <label htmlFor="confirmPassword" className="block text-md font-medium text-gray-700 mb-1">Confirmer le mot de passe</label>
                <Field
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirmez le mot de passe"
                  className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition duration-300 ease-in-out"
                />
                <ErrorMessage name="confirmPassword" component="div" className="text-red-500 text-sm mt-1" />
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 text-white py-2 rounded-md text-lg font-medium hover:bg-indigo-700 transition duration-300"
              >
                S'inscrire
              </button>

              <div className="mt-3 text-center">
                <Link to="/login" className="text-indigo-600 hover:text-indigo-800 font-medium transition">
                  Déjà un compte ? Se connecter
                </Link>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default SignupForm;
