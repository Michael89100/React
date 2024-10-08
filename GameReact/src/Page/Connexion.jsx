import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useNavigate, Link } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import logo from '../ressources/logo.webp';

const LoginSchema = Yup.object().shape({
  email: Yup.string()
    .email('Adresse e-mail invalide')
    .required('L\'adresse e-mail est requise'),
  password: Yup.string()
    .min(6, 'Le mot de passe doit contenir au moins 6 caractères')
    .required('Le mot de passe est requis'),
});

const LoginForm = ({ onLogin }) => {
  const navigate = useNavigate();

  const loginUser = async (values) => {
    try {
      const response = await fetch('http://localhost:3000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: values.email,
          password: values.password,
        }),
      });

      const data = await response.json();
      if (response.ok & data.error === undefined) {
        toast.success('Connexion réussie !');
        onLogin(data.token); 
        navigate('/dashboard'); 
      } else {
        toast.error(`Erreur: ${data.error}`);
      }
    } catch (error) {
      toast.error('Une erreur est survenue lors de la connexion.');
      console.error('An error occurred:', error);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-r from-blue-500 to-indigo-600">
      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md">
        <ToastContainer /> {/* This is the toast container for popups */}
        <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">Connexion</h2>

        <div className="flex justify-center mb-6">
          <img 
            src={logo} 
            alt="Logo"
            className="w-24 h-24"  
          />
        </div>

        <Formik
          initialValues={{ email: '', password: '' }}
          validationSchema={LoginSchema}
          onSubmit={loginUser}
        >
          {() => (
            <Form>
              <div className="mb-5">
                <label htmlFor="email" className="block text-lg font-medium text-gray-700 mb-2">Adresse e-mail</label>
                <Field
                  type="email"
                  name="email"
                  id="email"
                  placeholder="Entrez votre adresse e-mail"
                  className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition duration-300 ease-in-out"
                />
                <ErrorMessage name="email" component="div" className="text-red-500 text-sm mt-1" />
              </div>

              <div className="mb-6">
                <label htmlFor="password" className="block text-lg font-medium text-gray-700 mb-2">Mot de passe</label>
                <Field
                  type="password"
                  name="password"
                  id="password"
                  placeholder="Entrez votre mot de passe"
                  className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition duration-300 ease-in-out"
                />
                <ErrorMessage name="password" component="div" className="text-red-500 text-sm mt-1" />
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 text-white py-3 rounded-lg text-lg font-medium hover:bg-indigo-700 transition duration-300"
              >
                Connexion
              </button>

              <div className="mt-4 text-center">
                <p className="text-gray-600">Vous n'avez pas de compte ? <Link to="/signup" className="text-indigo-600 hover:text-indigo-800 font-medium">Inscrivez-vous</Link></p>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default LoginForm;
