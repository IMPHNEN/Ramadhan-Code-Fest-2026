import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBrain } from '@fortawesome/free-solid-svg-icons';
import { AMAL_TYPE } from '../utils/amalHeuristics';

export default function InputSection({ description, onDescriptionChange, onAddAmal }) {
  return (
    <div className="space-y-4 mb-6">
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1.5 flex items-center gap-2">
          <FontAwesomeIcon icon={faBrain} className="text-gray-400" />
          Deskripsi Kegiatan
        </label>
        <input 
          type="text" 
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder="Masukkan kegiatan Anda..." 
          className="w-full bg-white text-gray-800 text-sm border border-gray-300 rounded-md p-2.5 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 transition-colors"
        />
      </div>
      <div className="grid grid-cols-2 gap-3 pt-1">
        <button 
          onClick={() => onAddAmal(AMAL_TYPE.PAHALA)}
          className="py-2 rounded-md bg-white border border-emerald-600 text-emerald-700 font-medium text-sm hover:bg-emerald-50 transition-colors"
        >
          Catat Pahala
        </button>
        <button 
          onClick={() => onAddAmal(AMAL_TYPE.DOSA)}
          className="py-2 rounded-md bg-white border border-rose-600 text-rose-700 font-medium text-sm hover:bg-rose-50 transition-colors"
        >
          Catat Dosa
        </button>
      </div>
    </div>
  );
}