import React, { useState, useEffect, useRef } from 'react';
import { QrCode, Download, Share2, Smartphone, Wifi, RefreshCw, Copy, Check, Eye, X } from 'lucide-react';
import QRCodeLib from 'qrcode';

interface QRCodeGeneratorProps {
  url: string;
  onClose?: () => void;
}

const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({ url, onClose }) => {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    generateQRCode();
  }, [url]);

  const generateQRCode = async () => {
    setIsLoading(true);
    try {
      // Configuration du QR code avec design personnalisé
      const options = {
        errorCorrectionLevel: 'M' as const,
        type: 'image/png' as const,
        quality: 0.92,
        margin: 2,
        color: {
          dark: '#1f2937', // Couleur sombre élégante
          light: '#ffffff' // Fond blanc
        },
        width: 300
      };

      const qrDataUrl = await QRCodeLib.toDataURL(url, options);
      setQrCodeDataUrl(qrDataUrl);
    } catch (error) {
      console.error('Erreur lors de la génération du QR code:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const downloadQRCode = () => {
    if (qrCodeDataUrl) {
      const link = document.createElement('a');
      link.download = 'parapli-room-qr-code.png';
      link.href = qrCodeDataUrl;
      link.click();
    }
  };

  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Erreur lors de la copie:', error);
    }
  };

  const shareQRCode = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Parapli ROOM - Disponibilité des Chambres',
          text: 'Consultez la disponibilité des chambres en temps réel',
          url: url
        });
      } catch (error) {
        console.error('Erreur lors du partage:', error);
      }
    } else {
      // Fallback: copier l'URL
      copyUrl();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-screen overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 p-6 rounded-t-2xl">
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center space-x-3">
              <div className="bg-white bg-opacity-20 p-3 rounded-xl">
                <QrCode className="h-8 w-8" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">QR Code - Disponibilité</h2>
                <p className="text-white text-opacity-90">Accès public en temps réel</p>
              </div>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="bg-white bg-opacity-20 hover:bg-opacity-30 p-2 rounded-lg transition-colors duration-200"
              >
                <X className="h-6 w-6" />
              </button>
            )}
          </div>
        </div>

        <div className="p-8">
          {/* QR Code Display */}
          <div className="text-center mb-8">
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-8 rounded-2xl shadow-inner mb-6">
              {isLoading ? (
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-64 h-64 bg-gray-200 rounded-xl animate-pulse flex items-center justify-center">
                    <RefreshCw className="h-12 w-12 text-gray-400 animate-spin" />
                  </div>
                  <p className="text-gray-600">Génération du QR code...</p>
                </div>
              ) : (
                <div className="flex flex-col items-center space-y-4">
                  <div className="relative group">
                    <img
                      src={qrCodeDataUrl}
                      alt="QR Code Parapli ROOM"
                      className="w-64 h-64 rounded-xl shadow-lg transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 rounded-xl transition-all duration-300 flex items-center justify-center">
                      <button
                        onClick={() => setShowPreview(true)}
                        className="opacity-0 group-hover:opacity-100 bg-white text-gray-800 px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center space-x-2"
                      >
                        <Eye className="h-4 w-4" />
                        <span>Aperçu</span>
                      </button>
                    </div>
                  </div>
                  
                  {/* QR Code Info */}
                  <div className="bg-white p-4 rounded-xl border border-gray-200 max-w-sm">
                    <div className="flex items-center space-x-3 mb-2">
                      <Smartphone className="h-5 w-5 text-blue-600" />
                      <span className="font-medium text-gray-900">Instructions</span>
                    </div>
                    <p className="text-sm text-gray-600 text-left">
                      1. Ouvrez l'appareil photo de votre téléphone<br />
                      2. Pointez vers le QR code<br />
                      3. Appuyez sur le lien qui apparaît<br />
                      4. Consultez la disponibilité en temps réel
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <button
                onClick={downloadQRCode}
                disabled={isLoading}
                className="flex items-center justify-center space-x-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-6 py-3 rounded-xl font-medium transition-colors duration-200"
              >
                <Download className="h-5 w-5" />
                <span>Télécharger</span>
              </button>

              <button
                onClick={shareQRCode}
                disabled={isLoading}
                className="flex items-center justify-center space-x-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-6 py-3 rounded-xl font-medium transition-colors duration-200"
              >
                <Share2 className="h-5 w-5" />
                <span>Partager</span>
              </button>

              <button
                onClick={copyUrl}
                disabled={isLoading}
                className="flex items-center justify-center space-x-2 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-400 text-white px-6 py-3 rounded-xl font-medium transition-colors duration-200"
              >
                {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                <span>{copied ? 'Copié !' : 'Copier URL'}</span>
              </button>
            </div>

            {/* URL Display */}
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
              <div className="flex items-center space-x-3 mb-2">
                <Wifi className="h-5 w-5 text-orange-600" />
                <span className="font-medium text-gray-900">URL d'accès direct</span>
              </div>
              <div className="bg-white p-3 rounded-lg border border-gray-200 font-mono text-sm text-gray-700 break-all">
                {url}
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
              <div className="flex items-center space-x-3 mb-3">
                <div className="bg-blue-500 p-2 rounded-lg">
                  <RefreshCw className="h-5 w-5 text-white" />
                </div>
                <h3 className="font-bold text-gray-900">Temps Réel</h3>
              </div>
              <p className="text-sm text-gray-700">
                Les modifications sont instantanément visibles. Mise à jour automatique toutes les 30 secondes.
              </p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
              <div className="flex items-center space-x-3 mb-3">
                <div className="bg-green-500 p-2 rounded-lg">
                  <Smartphone className="h-5 w-5 text-white" />
                </div>
                <h3 className="font-bold text-gray-900">Mobile Optimisé</h3>
              </div>
              <p className="text-sm text-gray-700">
                Interface parfaitement adaptée aux smartphones et tablettes pour une expérience optimale.
              </p>
            </div>
          </div>

          {/* Usage Tips */}
          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-xl p-6">
            <h3 className="font-bold text-gray-900 mb-3 flex items-center">
              <QrCode className="h-5 w-5 mr-2 text-yellow-600" />
              Conseils d'utilisation
            </h3>
            <ul className="text-sm text-gray-700 space-y-2">
              <li>• <strong>Imprimez le QR code</strong> et placez-le à l'accueil ou dans les espaces communs</li>
              <li>• <strong>Partagez l'URL</strong> sur vos réseaux sociaux ou site web</li>
              <li>• <strong>Envoyez par WhatsApp</strong> aux clients pour un accès rapide</li>
              <li>• <strong>Affichez sur un écran</strong> dans votre établissement</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-60 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Aperçu Mobile</h3>
              <button
                onClick={() => setShowPreview(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="bg-gray-100 p-4 rounded-xl">
              <div className="bg-white rounded-lg p-4 shadow-lg">
                <div className="text-center">
                  <div className="bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 p-3 rounded-lg inline-block mb-3">
                    <QrCode className="h-6 w-6 text-white" />
                  </div>
                  <h4 className="font-bold text-gray-900 mb-2">Parapli ROOM</h4>
                  <p className="text-sm text-gray-600 mb-3">Disponibilité en temps réel</p>
                  <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium inline-block">
                    🟢 Accès instantané
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QRCodeGenerator;