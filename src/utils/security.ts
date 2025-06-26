// Utilitaires de sécurité avancés pour l'authentification
export class SecurityManager {
  // Hash sécurisé du mot de passe (SHA-256 avec salt)
  private static readonly PASSWORD_HASH = 'a8f5f167f44f4964e6c998dee827110c';
  private static readonly SALT = 'parapli_room_secure_salt_2024';
  
  // Compteur de tentatives de connexion
  private static loginAttempts: number = 0;
  private static lastAttemptTime: number = 0;
  private static readonly MAX_ATTEMPTS = 3;
  private static readonly LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes
  
  // Générer un hash sécurisé
  private static async generateHash(password: string): Promise<string> {
    const saltedPassword = password + this.SALT;
    const encoder = new TextEncoder();
    const data = encoder.encode(saltedPassword);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
  
  // Vérifier si le compte est verrouillé
  static isAccountLocked(): boolean {
    if (this.loginAttempts >= this.MAX_ATTEMPTS) {
      const timeSinceLastAttempt = Date.now() - this.lastAttemptTime;
      if (timeSinceLastAttempt < this.LOCKOUT_DURATION) {
        return true;
      } else {
        // Réinitialiser après la période de verrouillage
        this.loginAttempts = 0;
        return false;
      }
    }
    return false;
  }
  
  // Obtenir le temps restant de verrouillage
  static getLockoutTimeRemaining(): number {
    if (this.isAccountLocked()) {
      const timeSinceLastAttempt = Date.now() - this.lastAttemptTime;
      return Math.max(0, this.LOCKOUT_DURATION - timeSinceLastAttempt);
    }
    return 0;
  }
  
  // Formater le temps de verrouillage
  static formatLockoutTime(milliseconds: number): string {
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
  
  // Vérifier le mot de passe de manière sécurisée
  static async verifyPassword(inputPassword: string): Promise<boolean> {
    // Vérifier si le compte est verrouillé
    if (this.isAccountLocked()) {
      throw new Error('ACCOUNT_LOCKED');
    }
    
    try {
      // Générer le hash du mot de passe saisi
      const inputHash = await this.generateHash(inputPassword);
      
      // Comparer avec le hash stocké
      const isValid = inputHash === this.PASSWORD_HASH;
      
      if (isValid) {
        // Réinitialiser les tentatives en cas de succès
        this.loginAttempts = 0;
        this.lastAttemptTime = 0;
        return true;
      } else {
        // Incrémenter les tentatives échouées
        this.loginAttempts++;
        this.lastAttemptTime = Date.now();
        
        // Enregistrer dans le localStorage pour persistance
        localStorage.setItem('parapli_login_attempts', this.loginAttempts.toString());
        localStorage.setItem('parapli_last_attempt', this.lastAttemptTime.toString());
        
        return false;
      }
    } catch (error) {
      console.error('Erreur de vérification du mot de passe:', error);
      return false;
    }
  }
  
  // Charger les tentatives depuis le localStorage
  static loadAttempts(): void {
    const savedAttempts = localStorage.getItem('parapli_login_attempts');
    const savedLastAttempt = localStorage.getItem('parapli_last_attempt');
    
    if (savedAttempts && savedLastAttempt) {
      this.loginAttempts = parseInt(savedAttempts, 10) || 0;
      this.lastAttemptTime = parseInt(savedLastAttempt, 10) || 0;
    }
  }
  
  // Nettoyer les données de tentatives
  static clearAttempts(): void {
    this.loginAttempts = 0;
    this.lastAttemptTime = 0;
    localStorage.removeItem('parapli_login_attempts');
    localStorage.removeItem('parapli_last_attempt');
  }
  
  // Détecter les tentatives de brute force
  static detectBruteForce(): boolean {
    return this.loginAttempts >= 2; // Alerte dès 2 tentatives
  }
  
  // Générer un token de session sécurisé
  static generateSessionToken(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }
  
  // Valider la force du mot de passe (pour référence)
  static validatePasswordStrength(password: string): {
    isStrong: boolean;
    score: number;
    feedback: string[];
  } {
    const feedback: string[] = [];
    let score = 0;
    
    // Longueur
    if (password.length >= 8) score += 2;
    else feedback.push('Au moins 8 caractères requis');
    
    // Majuscules
    if (/[A-Z]/.test(password)) score += 1;
    else feedback.push('Au moins une majuscule requise');
    
    // Minuscules
    if (/[a-z]/.test(password)) score += 1;
    else feedback.push('Au moins une minuscule requise');
    
    // Chiffres
    if (/\d/.test(password)) score += 1;
    else feedback.push('Au moins un chiffre requis');
    
    // Caractères spéciaux
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score += 2;
    else feedback.push('Au moins un caractère spécial requis');
    
    // Complexité supplémentaire
    if (password.length >= 12) score += 1;
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?].*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score += 1;
    
    return {
      isStrong: score >= 6,
      score,
      feedback: feedback.length === 0 ? ['Mot de passe fort !'] : feedback
    };
  }
}

// Initialiser les tentatives au chargement
SecurityManager.loadAttempts();