import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../Page/SocketContext';  
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Dashboard = () => {
  const [gameId, setGameId] = useState(''); 
  const [createdGameId, setCreatedGameId] = useState(''); 
  const [gamesList, setGamesList] = useState([]); 
  const [scores, setScores] = useState([]);
  const navigate = useNavigate();
  const socket = useSocket();  

  useEffect(() => {
    // Register event listeners once when the component mounts
    socket.on('updateGamesList', (games) => {
      setGamesList(Object.keys(games));
    });

    socket.on('gameCreated', (gameId) => {
      setCreatedGameId(gameId);
      toast.success(`Partie créée avec l'ID : ${gameId}`);
    });

    socket.on('updateScores', (newScores) => {
      setScores(newScores);
    });

    return () => {
      // Clean up event listeners when the component unmounts
      socket.off('updateGamesList');
      socket.off('gameCreated');
      socket.off('updateScores');
    };
  }, [socket]);

  const createGame = () => {
    socket.emit('createGame');
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-blue-50 to-blue-100 dark:from-gray-800 dark:to-gray-900 text-gray-900 dark:text-white transition duration-300 p-6">
      <h1 className="text-4xl font-extrabold mb-10 text-blue-700 dark:text-blue-300">
        Bienvenue au Jeu d'Échecs en Ligne
      </h1>

      <div className="flex flex-wrap gap-8 justify-center">
        <div className="flex flex-col items-center space-y-6 p-8 bg-white dark:bg-gray-800 shadow-xl rounded-lg transform hover:scale-105 transition duration-300 ease-in-out">
          <button
            onClick={createGame}
            className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-700 text-white dark:from-blue-400 dark:to-blue-600 rounded-lg hover:shadow-lg hover:bg-gradient-to-l transition-transform duration-200 transform hover:-translate-y-1"
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
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white transition duration-200"
          />

          <button
            onClick={joinGame}
            className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-green-700 text-white dark:from-green-400 dark:to-green-600 rounded-lg hover:shadow-lg hover:bg-gradient-to-l transition-transform duration-200 transform hover:-translate-y-1"
          >
            Rejoindre une Partie
          </button>
        </div>

        <div className="flex flex-col items-center space-y-4 p-8 bg-white dark:bg-gray-800 shadow-xl rounded-lg transform hover:scale-105 transition duration-300 ease-in-out">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Parties disponibles</h2>
          <ul className="w-full list-none space-y-2">
            {gamesList.length === 0 ? (
              <li className="text-gray-600 dark:text-gray-400">Aucune partie disponible.</li>
            ) : (
              gamesList.map((game, index) => (
                <li key={index} className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg shadow-sm transform hover:scale-105 transition duration-200">
                  Partie ID: {game}
                </li>
              ))
            )}
          </ul>
        </div>

        <div className="flex flex-col items-center space-y-4 p-8 bg-white dark:bg-gray-800 shadow-xl rounded-lg transform hover:scale-105 transition duration-300 ease-in-out">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Tableau des Scores</h2>
          <ul className="w-full list-none space-y-2">
            {scores.length === 0 ? (
              <li className="text-gray-600 dark:text-gray-400">Aucun score disponible.</li>
            ) : (
              scores.map((score, index) => (
                <li key={index} className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg shadow-sm transform hover:scale-105 transition duration-200">
                  {score.username}: {score.points} points
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
