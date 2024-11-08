import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Chessboard } from 'react-chessboard';
import { useSocket } from '../Page/SocketContext';
import { Chess } from 'chess.js';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ChessGame = () => {
  const { gameId } = useParams();
  const [game, setGame] = useState(new Chess());
  const [fen, setFen] = useState(game.fen());
  const [playerColor, setPlayerColor] = useState(null); 
  const [isGameStarted, setIsGameStarted] = useState(false); 
  const navigate = useNavigate();
  const socket = useSocket();  

  useEffect(() => {
    socket.emit('joinGame', gameId);

    socket.on('assignColor', (color) => {
      setPlayerColor(color);
      toast.info(`Vous êtes ${color === 'w' ? 'les blancs' : 'les noirs'}.`);
    });

    socket.on('gameStarted', () => {
      setIsGameStarted(true);
    });

    socket.on('updateBoard', (move) => {
      game.move(move);
      setFen(game.fen());
    });
  
    return () => {
      socket.off('assignColor');
      socket.off('gameStarted');
      socket.off('updateBoard');
    };
  }, [gameId, game, socket]);

  const onDrop = (sourceSquare, targetSquare) => {
    if ((game.turn() === 'w' && playerColor === 'b') || (game.turn() === 'b' && playerColor === 'w')) {
      toast.error("Ce n'est pas votre tour !");
      return false;
    }

    const move = game.move({
      from: sourceSquare,
      to: targetSquare,
      promotion: 'q',
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
    }, 2000); 
  };
 console.log("playerColor", playerColor);
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white relative">
      <Chessboard
        position={fen}
        onPieceDrop={onDrop}
        animationDuration={200}
        boardOrientation={playerColor === 'b' ? 'black' : 'white'} 
        boardWidth={500}
      />
      <button
        onClick={stopGame}
        className="mt-6 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-200"
      >
        Arrêter la partie
      </button>
      <ToastContainer position="top-center" autoClose={2000} />
    </div>
  );
};

export default ChessGame;
