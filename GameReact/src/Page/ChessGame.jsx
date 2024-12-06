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
  const [score, setScore] = useState({ white: 0, black: 0 });
  const [showColorSelection, setShowColorSelection] = useState(true);
  const navigate = useNavigate();
  const socket = useSocket();

  const pieceValues = {
    p: 1, // Pawn
    n: 3, // Knight
    b: 3, // Bishop
    r: 5, // Rook
    q: 9  // Queen
  };

  useEffect(() => {
    if (!showColorSelection) {
      socket.emit('joinGame', gameId);

      const handleAssignColor = (color) => {
        setPlayerColor(color);
      };

      const handleGameStarted = () => {
        setIsGameStarted(true);
      };

      const handleUpdateBoard = (move) => {
        updateScores(move);
        game.move(move);
        setFen(game.fen());
      };

      const handleScoreUpdate = (updatedScore) => {
        setScore(updatedScore);
      };

      // Register event listeners
      socket.on('assignColor', handleAssignColor);
      socket.on('gameStarted', handleGameStarted);
      socket.on('updateBoard', handleUpdateBoard);
      socket.on('scoreUpdate', handleScoreUpdate);

      // Cleanup event listeners on unmount
      return () => {
        socket.off('assignColor', handleAssignColor);
        socket.off('gameStarted', handleGameStarted);
        socket.off('updateBoard', handleUpdateBoard);
        socket.off('scoreUpdate', handleScoreUpdate);
      };
    }
  }, [gameId, game, socket, showColorSelection]);

  const updateScores = (move) => {
    if (move.captured) {
      const pieceValue = pieceValues[move.captured.toLowerCase()] || 0;
      const newScore = { ...score };
      if (move.color === 'w') {
        newScore.black += pieceValue;
      } else {
        newScore.white += pieceValue;
      }
      setScore(newScore);
      socket.emit('scoreUpdate', newScore);
    }
  };

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

    updateScores(move);
    setFen(game.fen());
    socket.emit('movePiece', { gameId, move });
    return true;
  };

  const handleColorSelection = (color) => {
    setPlayerColor(color);
    setShowColorSelection(false);
    socket.emit('selectColor', { gameId, color });
  };

  const stopGame = () => {
    toast.info('Vous avez quitté la partie.');
    setTimeout(() => {
      navigate('/dashboard');
    }, 2000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white p-6">
      {showColorSelection ? (
        <div className="flex flex-col items-center bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-4">Choisissez votre couleur</h2>
          <div className="flex space-x-4">
            <button
              onClick={() => handleColorSelection('w')}
              className="px-4 py-2 bg-white text-black rounded-lg shadow hover:bg-gray-200 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
            >
              Blancs
            </button>
            <button
              onClick={() => handleColorSelection('b')}
              className="px-4 py-2 bg-black text-white rounded-lg shadow hover:bg-gray-700"
            >
              Noirs
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-row gap-4 items-start">
          <div className="flex flex-col items-center justify-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
            <Chessboard
              position={fen}
              onPieceDrop={onDrop}
              animationDuration={200}
              boardOrientation={playerColor === 'b' ? 'black' : 'white'}
              boardWidth={600}
            />
            <button
              onClick={stopGame}
              className="mt-6 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-200"
            >
              Arrêter la partie
            </button>
          </div>
          <div className="flex flex-col p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg w-64">
            <h2 className="text-2xl font-bold mb-4 text-center">Score</h2>
            <div className="text-lg mb-2">Blancs : <span className="font-semibold">{score.white}</span></div>
            <div className="text-lg">Noirs : <span className="font-semibold">{score.black}</span></div>
          </div>
        </div>
      )}
      <ToastContainer position="top-center" autoClose={2000} />
    </div>
  );
};

export default ChessGame;
