import React, { useState } from 'react'; 
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';

const socket = io('http://localhost:3000'); // URL du serveur

const Dashboard = () => {
  const [gameId, setGameId] = useState('');
  const [createdGameId, setCreatedGameId] = useState(''); // Stocke l'ID de la partie créée
  const navigate = useNavigate();

  const createGame = () => {
    socket.emit('createGame');
    socket.on('gameCreated', (gameId) => {
      setCreatedGameId(gameId); // Stocke l'ID de la partie
    });
  };

  const joinGame = () => {
    socket.emit('joinGame', gameId);
    socket.on('gameStarted', () => {
      navigate(`/game/${gameId}`);
    });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-blue-500 to-indigo-600 dark:bg-gray-900 text-gray-900 dark:text-white transition duration-300">
      <h1 className="text-5xl font-extrabold mb-10 text-white dark:text-gray-200">
        Jeu d'Échecs en Ligne
      </h1>
      
      <div className="flex flex-col items-center space-y-6 p-8 bg-white dark:bg-gray-800 shadow-lg rounded-lg">
        <button 
          onClick={createGame} 
          className="w-full px-6 py-3 bg-blue-600 text-white dark:bg-blue-500 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-400 font-semibold text-lg transition duration-200"
        >
          Créer une Partie
        </button>

        {/* Affichage de l'ID de la partie après création */}
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
    </div>
  );
};

export default Dashboard;
