import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWallet, faMoneyBillTransfer, faSkull } from '@fortawesome/free-solid-svg-icons';

export default function FintechSection() {
  const handleConvertPahala = () => {
    alert("SYSTEM ERROR: Server Lauhul Mahfudz sedang maintenance tarawih. Silakan coba lagi setelah Lebaran!");
  };

  const handleConvertDosa = () => {
    alert("Hello World!");
  };

  return (
    <div className="space-y-2 mb-6">
      <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide border-b border-gray-200 pb-2 mb-3 flex items-center gap-2">
        <FontAwesomeIcon icon={faWallet} />
        Layanan Finansial
      </h3>
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
  );
}