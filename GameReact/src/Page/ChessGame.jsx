import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Chessboard } from 'react-chessboard';
import io from 'socket.io-client';
import { Chess } from 'chess.js';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const socket = io('http://localhost:3000');

const ChessGame = () => {
  const { gameId } = useParams();
  const [game, setGame] = useState(new Chess());
  const [fen, setFen] = useState(game.fen());
  const [playerColor, setPlayerColor] = useState(null); // Couleur du joueur
  const [isGameStarted, setIsGameStarted] = useState(false); // Partie démarrée ou non
  const navigate = useNavigate();

  useEffect(() => {
    // Joindre la partie
    socket.emit('joinGame', gameId);

    // Recevoir la couleur attribuée par le serveur (blanc ou noir)
    socket.on('assignColor', (color) => {
      setPlayerColor(color);
      toast.info(`Vous êtes ${color === 'w' ? 'les blancs' : 'les noirs'}.`);
    });

    // Vérifier quand deux joueurs sont connectés
    socket.on('gameStarted', () => {
      setIsGameStarted(true);
    });

    // Recevoir les mouvements et mettre à jour l'échiquier
    socket.on('updateBoard', (move) => {
      game.move(move);
      setFen(game.fen());
    });

  }, [gameId, game]);

  const onDrop = (sourceSquare, targetSquare) => {
    // Vérifier si c'est le tour du joueur
    if ((game.turn() === 'w' && playerColor === 'b') || (game.turn() === 'b' && playerColor === 'w')) {
      toast.error("Ce n'est pas votre tour !");
      return false;
    }

    // Vérifier si le joueur essaie de déplacer ses propres pièces
    const piece = game.get(sourceSquare);
    if (!piece || piece.color !== playerColor) {
      toast.error("Vous ne pouvez pas déplacer les pièces de l'adversaire !");
      return false;
    }

    const move = game.move({
      from: sourceSquare,
      to: targetSquare,
      promotion: 'q', // Promotion automatique en reine
    });

    if (move === null) return false;

    setFen(game.fen());
    socket.emit('movePiece', { gameId, move });
    return true;
  };

  const stopGame = () => {
    toast.info('Vous avez quitté la partie.');
    setTimeout(() => {
      navigate('/dashboard');
    }, 2000); // Attend 2 secondes avant de rediriger vers le dashboard
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white relative">
      <div className="absolute top-4 left-4 text-sm text-gray-600 dark:text-gray-300">
        Partie d'échecs : {gameId}
      </div>

      {!isGameStarted && (
        <div className="mb-4 text-xl text-gray-800 dark:text-gray-300">
          En attente d'un deuxième joueur...
        </div>
      )}

      <div className="flex flex-col items-center">
        <Chessboard
          position={fen}
          onPieceDrop={onDrop}
          animationDuration={200}
          boardWidth={500}  // Taille du plateau
        />
        
        <button
          onClick={stopGame}
          className="mt-6 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-200"
        >
          Arrêter la partie
        </button>
      </div>

      <ToastContainer position="top-center" autoClose={2000} />
    </div>
  );
};

export default ChessGame;
