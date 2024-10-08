import React from 'react';

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-primary flex flex-col items-center justify-center text-white dark:bg-black">
      <div className="card bg-white shadow-2xl p-8 w-full max-w-md text-center">
        <h1 className="text-4xl font-extrabold mb-4 text-transparent bg-clip-text bg-primary">
          Bienvenue sur le tableau de bord
        </h1>
        <p className="text-lg font-semibold">Vous êtes connecté avec succès !</p>
      </div>
    </div>
  );
};

export default Dashboard;
