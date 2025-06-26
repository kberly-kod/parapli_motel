// Utilitaires de cryptage et masquage des données clients
export class DataProtection {
  // Clé de cryptage simple (en production, utiliser une clé plus sécurisée)
  private static readonly ENCRYPTION_KEY = 'parapli_room_2024_secure_key';
  
  // PIN de sécurité pour révéler les données
  private static readonly SECURITY_PIN = '070528';

  // Crypter une chaîne de caractères
  static encrypt(text: string): string {
    if (!text) return '';
    
    // Simple XOR encryption pour la démonstration
    let encrypted = '';
    for (let i = 0; i < text.length; i++) {
      const keyChar = this.ENCRYPTION_KEY.charCodeAt(i % this.ENCRYPTION_KEY.length);
      const textChar = text.charCodeAt(i);
      encrypted += String.fromCharCode(textChar ^ keyChar);
    }
    
    // Encoder en base64 pour le stockage
    return btoa(encrypted);
  }

  // Décrypter une chaîne de caractères
  static decrypt(encryptedText: string): string {
    if (!encryptedText) return '';
    
    try {
      // Décoder depuis base64
      const encrypted = atob(encryptedText);
      
      // Décryptage XOR
      let decrypted = '';
      for (let i = 0; i < encrypted.length; i++) {
        const keyChar = this.ENCRYPTION_KEY.charCodeAt(i % this.ENCRYPTION_KEY.length);
        const encryptedChar = encrypted.charCodeAt(i);
        decrypted += String.fromCharCode(encryptedChar ^ keyChar);
      }
      
      return decrypted;
    } catch (error) {
      console.error('Erreur de décryptage:', error);
      return '';
    }
  }

  // Vérifier le PIN de sécurité
  static verifySecurityPin(inputPin: string): boolean {
    return inputPin === this.SECURITY_PIN;
  }

  // Demander le PIN de sécurité avec interface personnalisée
  static async requestSecurityPin(): Promise<boolean> {
    return new Promise((resolve) => {
      // Créer une modal personnalisée pour le PIN
      const modal = document.createElement('div');
      modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
      modal.innerHTML = `
        <div class="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md">
          <div class="text-center mb-6">
            <div class="bg-red-100 p-4 rounded-full inline-block mb-4">
              <svg class="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
              </svg>
            </div>
            <h2 class="text-2xl font-bold text-gray-900 mb-2">🔐 Accès Sécurisé</h2>
            <p class="text-gray-600">Entrez le PIN de sécurité pour révéler les données clients</p>
          </div>
          
          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-2">PIN de Sécurité (6 chiffres)</label>
            <input 
              type="password" 
              id="securityPin" 
              maxlength="6" 
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-center text-2xl font-mono tracking-widest"
              placeholder="••••••"
              autocomplete="off"
            />
            <div id="pinError" class="text-red-600 text-sm mt-2 hidden">PIN incorrect. Veuillez réessayer.</div>
          </div>

          <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div class="flex items-start space-x-3">
              <svg class="h-5 w-5 text-yellow-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z"></path>
              </svg>
              <div class="text-sm text-yellow-800">
                <p class="font-medium mb-1">⚠️ Accès aux Données Sensibles</p>
                <p>Ce PIN protège les informations personnelles des clients. Utilisez cette fonction uniquement si nécessaire.</p>
              </div>
            </div>
          </div>
          
          <div class="flex space-x-4">
            <button 
              id="confirmPin" 
              class="flex-1 bg-red-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-red-600 transition-colors duration-200"
            >
              🔓 Révéler
            </button>
            <button 
              id="cancelPin" 
              class="flex-1 bg-gray-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-600 transition-colors duration-200"
            >
              Annuler
            </button>
          </div>
        </div>
      `;

      document.body.appendChild(modal);

      const pinInput = modal.querySelector('#securityPin') as HTMLInputElement;
      const confirmBtn = modal.querySelector('#confirmPin') as HTMLButtonElement;
      const cancelBtn = modal.querySelector('#cancelPin') as HTMLButtonElement;
      const errorDiv = modal.querySelector('#pinError') as HTMLDivElement;

      // Focus sur l'input
      setTimeout(() => pinInput.focus(), 100);

      // Fonction de validation
      const validatePin = () => {
        const pin = pinInput.value.trim();
        if (this.verifySecurityPin(pin)) {
          document.body.removeChild(modal);
          resolve(true);
        } else {
          errorDiv.classList.remove('hidden');
          pinInput.value = '';
          pinInput.focus();
          // Vibration si supportée
          if (navigator.vibrate) {
            navigator.vibrate([100, 50, 100]);
          }
        }
      };

      // Event listeners
      confirmBtn.addEventListener('click', validatePin);
      cancelBtn.addEventListener('click', () => {
        document.body.removeChild(modal);
        resolve(false);
      });

      // Validation sur Enter
      pinInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          validatePin();
        }
      });

      // Masquer l'erreur quand l'utilisateur tape
      pinInput.addEventListener('input', () => {
        errorDiv.classList.add('hidden');
      });

      // Fermer sur Escape
      modal.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          document.body.removeChild(modal);
          resolve(false);
        }
      });
    });
  }

  // Masquer les données pour l'affichage (comme dans l'image)
  static maskData(text: string, showLength: boolean = true): string {
    if (!text) return '';
    
    if (showLength) {
      // Garder la même longueur avec des 'x'
      return 'x'.repeat(Math.max(text.length, 6));
    } else {
      // Longueur fixe de 6 'x'
      return 'xxxxxx';
    }
  }

  // Masquer partiellement (garder les premiers et derniers caractères)
  static maskPartial(text: string): string {
    if (!text) return '';
    if (text.length <= 4) return 'xxxx';
    
    const start = text.substring(0, 2);
    const end = text.substring(text.length - 2);
    const middle = 'x'.repeat(Math.max(text.length - 4, 2));
    
    return start + middle + end;
  }

  // Crypter les données d'une personne
  static encryptPersonData(person: any) {
    return {
      fullName: this.encrypt(person.fullName),
      idNumber: this.encrypt(person.idNumber),
      address: this.encrypt(person.address),
      phone: person.phone ? this.encrypt(person.phone) : '',
      age: person.age // L'âge n'est pas crypté car il n'est pas sensible
    };
  }

  // Décrypter les données d'une personne
  static decryptPersonData(encryptedPerson: any) {
    return {
      fullName: this.decrypt(encryptedPerson.fullName),
      idNumber: this.decrypt(encryptedPerson.idNumber),
      address: this.decrypt(encryptedPerson.address),
      phone: encryptedPerson.phone ? this.decrypt(encryptedPerson.phone) : '',
      age: encryptedPerson.age
    };
  }

  // Masquer les données d'une personne pour l'affichage
  static maskPersonDataForDisplay(encryptedPerson: any) {
    const decrypted = this.decryptPersonData(encryptedPerson);
    return {
      fullName: this.maskData(decrypted.fullName),
      idNumber: this.maskData(decrypted.idNumber),
      address: this.maskData(decrypted.address),
      phone: decrypted.phone ? this.maskData(decrypted.phone) : '',
      age: decrypted.age // L'âge reste visible
    };
  }

  // Vérifier si les données sont cryptées
  static isEncrypted(text: string): boolean {
    try {
      // Tenter de décoder base64
      atob(text);
      return true;
    } catch {
      return false;
    }
  }
}