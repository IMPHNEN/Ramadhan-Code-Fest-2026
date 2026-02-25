import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBookOpen, faXmark } from '@fortawesome/free-solid-svg-icons';

export default function HadistModal({ isOpen, onClose, hadist }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden border border-gray-100 transform transition-all">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/80">
          <h4 className="font-bold text-sm flex items-center gap-2 text-emerald-700">
            <FontAwesomeIcon icon={faBookOpen} />
            Pengingat Kebaikan
          </h4>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-700 transition-colors p-1"
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>
        <div className="p-6 text-center">
          <p className="text-sm text-gray-700 leading-relaxed font-medium italic">
            "{hadist}"
          </p>
        </div>
        <div className="p-4 bg-gray-50/80 flex justify-end border-t border-gray-100">
          <button 
            onClick={onClose} 
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-md transition-colors shadow-sm"
          >
            Astaghfirullah
          </button>
        </div>
      </div>
    </div>
  );
}