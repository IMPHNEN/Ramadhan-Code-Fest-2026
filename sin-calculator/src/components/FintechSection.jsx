import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faWallet, faMoneyBillTransfer, faSkull, 
  faTimes, faCircleExclamation, faTerminal 
} from '@fortawesome/free-solid-svg-icons';

export default function FintechSection() {
  const [popup, setPopup] = useState({ isOpen: false, title: '', message: '', type: '' });

  const handleConvertPahala = () => {
    setPopup({
      isOpen: true,
      title: 'SYSTEM ERROR',
      message: 'Server Lauhul Mahfudz sedang maintenance tarawih. Silakan coba lagi setelah Lebaran!',
      type: 'error'
    });
  };

  const handleConvertDosa = () => {
    setPopup({
      isOpen: true,
      title: 'Runtime Exception',
      message: '> Hello World!',
      type: 'terminal'
    });
  };

  const closePopup = () => {
    setPopup({ ...popup, isOpen: false });
  };

  return (
    <div className="space-y-3">
      <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide flex items-center gap-2">
        <FontAwesomeIcon icon={faWallet} />
        Layanan Finansial
      </h3>
      <div className="grid gap-2">
        <button 
          onClick={handleConvertPahala} 
          className="w-full py-2.5 px-4 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm transition-colors flex items-center justify-center gap-2"
        >
          <FontAwesomeIcon icon={faMoneyBillTransfer} /> Konversi Pahala ke Saldo
        </button>
        <button 
          onClick={handleConvertDosa} 
          className="w-full py-2.5 px-4 rounded-md bg-gray-800 hover:bg-gray-900 text-white font-medium text-sm transition-colors flex items-center justify-center gap-2"
        >
          <FontAwesomeIcon icon={faSkull} /> Konversi Dosa ke Saldo
        </button>
      </div>

      {popup.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm transition-all">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden transform scale-100">
            <div className={`p-4 text-white flex justify-between items-center ${popup.type === 'error' ? 'bg-rose-600' : 'bg-gray-900'}`}>
              <h4 className="font-bold text-sm flex items-center gap-2">
                <FontAwesomeIcon icon={popup.type === 'error' ? faCircleExclamation : faTerminal} />
                {popup.title}
              </h4>
              <button onClick={closePopup} className="text-white/70 hover:text-white transition-colors">
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            <div className="p-6 text-center">
              <p className={`text-sm ${popup.type === 'terminal' ? 'font-mono text-gray-800 font-semibold text-lg' : 'text-gray-600'}`}>
                {popup.message}
              </p>
              <button
                onClick={closePopup}
                className="mt-6 w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-md transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}