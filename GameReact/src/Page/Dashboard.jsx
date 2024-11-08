// Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../Page/SocketContext';  
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Dashboard = () => {
  const [gameId, setGameId] = useState(''); 
  const [createdGameId, setCreatedGameId] = useState(''); 
  const [gamesList, setGamesList] = useState([]); 
  const navigate = useNavigate();
  const socket = useSocket();  

  useEffect(() => {
    socket.on('updateGamesList', (games) => {
      setGamesList(Object.keys(games));
    });

    return () => {
      socket.off('updateGamesList');
    };
  }, [socket]);

  const createGame = () => {
    socket.emit('createGame');
    socket.on('gameCreated', (gameId) => {
      setCreatedGameId(gameId);
      toast.success(`Partie créée avec l'ID : ${gameId}`);
    });
  };

  const joinGame = () => {
    if (gameId) {
      socket.emit('joinGame', gameId);
      socket.on('gameStarted', () => {
        navigate(`/game/${gameId}`);
      });
      socket.on('error', (errorMessage) => {
        toast.error(errorMessage);
      });
    } else {
      toast.error('Veuillez entrer un ID de partie pour rejoindre.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white transition duration-300">
      <h1 className="text-4xl font-bold mb-8 text-primary dark:text-primary-dark">
        Bienvenue au Jeu d'Échecs en Ligne
      </h1>

      <div className="flex space-x-8">
        <div className="flex flex-col items-center space-y-6 p-8 bg-white dark:bg-gray-800 shadow-lg rounded-lg">
          <button
            onClick={createGame}
            className="w-full px-6 py-3 bg-blue-600 text-white dark:bg-blue-500 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-400 font-semibold text-lg transition duration-200"
          >
            Créer une Partie
          </button>

          {createdGameId && (
            <div className="mt-4 text-center">
              <p className="text-lg font-semibold text-gray-800 dark:text-gray-200">ID de la Partie Créée :</p>
              <p className="text-md text-blue-600 dark:text-blue-400 font-mono">{createdGameId}</p>
            </div>
          )}

          <input
            type="text"
            value={gameId}
            onChange={(e) => setGameId(e.target.value)}
            placeholder="Entrez l'ID de la partie"
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white transition duration-200"
          />

          <button
            onClick={joinGame}
            className="w-full px-6 py-3 bg-green-600 text-white dark:bg-green-500 rounded-lg hover:bg-green-700 dark:hover:bg-green-400 font-semibold text-lg transition duration-200"
          >
            Rejoindre une Partie
          </button>
        </div>

        <div className="flex flex-col items-center space-y-4 p-8 bg-white dark:bg-gray-800 shadow-lg rounded-lg">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Parties disponibles</h2>
          <ul className="w-full list-none">
            {gamesList.length === 0 ? (
              <li className="text-gray-600 dark:text-gray-400">Aucune partie disponible.</li>
            ) : (
              gamesList.map((game, index) => (
                <li key={index} className="px-4 py-2 bg-gray-100 dark:bg-gray-700 mb-2 rounded-lg">
                  Partie ID: {game}
                </li>
              ))
            )}
          </ul>
        </div>
      </div>

      <ToastContainer position="top-center" autoClose={2000} />
    </div>
  );
};

export default Dashboard;
