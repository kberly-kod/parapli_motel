import React, { useState, useEffect } from 'react';
import { Bed, Lock, Eye, ArrowLeft, Shield, AlertTriangle, Timer } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SecurityManager } from '../utils/security';

interface LoginProps {
  onSwitchToPublic?: () => void;
}

const Login: React.FC<LoginProps> = ({ onSwitchToPublic }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutTime, setLockoutTime] = useState(0);
  const [bruteForceDetected, setBruteForceDetected] = useState(false);
  const { dispatch } = useApp();

  // Vérifier le statut de verrouillage au chargement
  useEffect(() => {
    checkLockoutStatus();
    const interval = setInterval(checkLockoutStatus, 1000);
    return () => clearInterval(interval);
  }, []);

  const checkLockoutStatus = () => {
    const locked = SecurityManager.isAccountLocked();
    const timeRemaining = SecurityManager.getLockoutTimeRemaining();
    const bruteForce = SecurityManager.detectBruteForce();
    
    setIsLocked(locked);
    setLockoutTime(timeRemaining);
    setBruteForceDetected(bruteForce);
    
    if (locked) {
      setError(`Compte verrouillé. Temps restant: ${SecurityManager.formatLockoutTime(timeRemaining)}`);
    } else if (timeRemaining === 0 && error.includes('verrouillé')) {
      setError('');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLocked) {
      setError(`Compte verrouillé. Attendez ${SecurityManager.formatLockoutTime(lockoutTime)}`);
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      // Délai artificiel pour éviter les attaques de timing
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
      
      const isValid = await SecurityManager.verifyPassword(password);
      
      if (isValid) {
        // Générer un token de session
        const sessionToken = SecurityManager.generateSessionToken();
        sessionStorage.setItem('parapli_session', sessionToken);
        
        dispatch({ type: 'SET_AUTH', payload: true });
        setPassword(''); // Nettoyer le champ
      } else {
        setPassword(''); // Nettoyer le champ même en cas d'erreur
        setError('Mot de passe incorrect');
        
        // Vérifier si on doit afficher un avertissement de brute force
        if (SecurityManager.detectBruteForce()) {
          setBruteForceDetected(true);
        }
      }
    } catch (error: any) {
      if (error.message === 'ACCOUNT_LOCKED') {
        checkLockoutStatus();
      } else {
        setError('Erreur de connexion. Veuillez réessayer.');
      }
      setPassword('');
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrengthInfo = () => {
    if (password.length === 0) return null;
    
    const strength = SecurityManager.validatePasswordStrength(password);
    return (
      <div className={`text-xs mt-1 ${strength.isStrong ? 'text-green-600' : 'text-orange-600'}`}>
        Force: {strength.score}/8 {strength.isStrong ? '✅' : '⚠️'}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md">
        <div className="text-center mb-8">
          <div className="bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 p-4 rounded-full inline-block mb-4">
            <Bed className="h-12 w-12 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Parapli ROOM</h1>
          <p className="text-gray-600">Connexion Administrateur</p>
          <div className="mt-2 px-3 py-1 bg-red-100 text-red-800 text-xs rounded-full inline-block">
            🔒 Accès Sécurisé
          </div>
        </div>

        {/* Alerte de sécurité */}
        {bruteForceDetected && !isLocked && (
          <div className="mb-6 p-4 bg-orange-100 border border-orange-400 rounded-lg">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
              <div className="text-sm text-orange-800">
                <p className="font-medium">⚠️ Tentatives de connexion détectées</p>
                <p>Attention: Plusieurs tentatives échouées. Le compte sera verrouillé après 3 tentatives.</p>
              </div>
            </div>
          </div>
        )}

        {/* Alerte de verrouillage */}
        {isLocked && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 rounded-lg">
            <div className="flex items-start space-x-3">
              <Shield className="h-5 w-5 text-red-600 mt-0.5" />
              <div className="text-sm text-red-800">
                <p className="font-medium">🚫 Compte Verrouillé</p>
                <p>Trop de tentatives échouées. Verrouillage de sécurité activé.</p>
                <div className="flex items-center space-x-2 mt-2">
                  <Timer className="h-4 w-4" />
                  <span className="font-mono font-bold">
                    {SecurityManager.formatLockoutTime(lockoutTime)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Mot de passe administrateur
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Entrez votre mot de passe"
                required
                disabled={isLocked || isLoading}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                disabled={isLocked || isLoading}
              >
                <Eye className="h-5 w-5" />
              </button>
            </div>
            {getPasswordStrengthInfo()}
          </div>

          {error && (
            <div className={`border rounded-lg px-4 py-3 ${
              error.includes('verrouillé') 
                ? 'bg-red-100 border-red-400 text-red-700'
                : 'bg-orange-100 border-orange-400 text-orange-700'
            }`}>
              <div className="flex items-center space-x-2">
                {error.includes('verrouillé') ? (
                  <Shield className="h-4 w-4" />
                ) : (
                  <AlertTriangle className="h-4 w-4" />
                )}
                <span>{error}</span>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLocked || isLoading}
            className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 shadow-lg ${
              isLocked || isLoading
                ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                : 'bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 text-white hover:from-yellow-500 hover:via-orange-500 hover:to-red-500'
            }`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Vérification...</span>
              </div>
            ) : isLocked ? (
              'Compte Verrouillé'
            ) : (
              'Se connecter'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          {onSwitchToPublic && (
            <div className="border-t pt-4">
              <button
                onClick={onSwitchToPublic}
                className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-600 transition-colors duration-200 flex items-center justify-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Retour à la Vue Publique</span>
              </button>
            </div>
          )}
        </div>

        {/* Informations de sécurité */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-900 mb-2">🔐 Sécurité Renforcée</h4>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>• Mot de passe crypté avec SHA-256</li>
            <li>• Protection anti-brute force</li>
            <li>• Verrouillage automatique (3 tentatives)</li>
            <li>• Session sécurisée avec token</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Login;