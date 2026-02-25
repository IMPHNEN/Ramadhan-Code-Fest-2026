import { useState, useEffect } from 'react';
import { AMAL_TYPE, calculateWeight, getRandomHadist } from './utils/amalHeuristics';
import Header from './components/Header';
import StatsBar from './components/StatsBar';
import InputSection from './components/InputSection';
import FintechSection from './components/FintechSection';
import HistoryLog from './components/HistoryLog';
import HadistModal from './components/HadistModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleExclamation, faTimes } from '@fortawesome/free-solid-svg-icons';

export default function App() {
  const [surgaPercentage, setSurgaPercentage] = useState(() => {
    const savedPercentage = localStorage.getItem('akhirat_surga');
    return savedPercentage !== null ? parseFloat(savedPercentage) : 50;
  });

  const [history, setHistory] = useState(() => {
    const savedHistory = localStorage.getItem('akhirat_history');
    return savedHistory !== null ? JSON.parse(savedHistory) : [];
  });

  const [description, setDescription] = useState('');
  const [hadistModal, setHadistModal] = useState({ isOpen: false, text: '' });
  const [validationPopup, setValidationPopup] = useState({ isOpen: false, message: '' });

  useEffect(() => {
    localStorage.setItem('akhirat_surga', surgaPercentage);
  }, [surgaPercentage]);

  useEffect(() => {
    localStorage.setItem('akhirat_history', JSON.stringify(history));
  }, [history]);

  const handleAddAmal = (type) => {
    if (!description.trim()) {
      setValidationPopup({
        isOpen: true,
        message: 'Deskripsi kegiatan tidak boleh kosong!'
      });
      return;
    }

    const calculatedAmount = calculateWeight(description, type);

    let newPercentage = type === AMAL_TYPE.PAHALA 
      ? surgaPercentage + calculatedAmount 
      : surgaPercentage - calculatedAmount;
      
    newPercentage = Math.max(0, Math.min(100, newPercentage));

    setSurgaPercentage(newPercentage);

    const newRecord = {
      id: Date.now(),
      type,
      description,
      amount: calculatedAmount,
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    };

    setHistory([newRecord, ...history]);
    setDescription(''); 

    if (type === AMAL_TYPE.DOSA) {
      setHadistModal({
        isOpen: true,
        text: getRandomHadist()
      });
    }
  };

  const nerakaPercentage = 100 - surgaPercentage;

  const closeValidationPopup = () => {
    setValidationPopup({ ...validationPopup, isOpen: false });
  };

  return (
    <div className="w-full max-w-4xl bg-white border border-gray-200 rounded-xl shadow-sm mx-auto grid grid-cols-1 md:grid-cols-2 overflow-hidden relative">
      <div className="p-6 md:p-8 border-b md:border-b-0 md:border-r border-gray-200">
        <Header />
        <StatsBar 
          surgaPercentage={surgaPercentage} 
          nerakaPercentage={nerakaPercentage} 
        />
        <InputSection 
          description={description} 
          onDescriptionChange={setDescription} 
          onAddAmal={handleAddAmal} 
        />
      </div>
      <div className="p-6 md:p-8 bg-gray-50/50 flex flex-col gap-6">
        <FintechSection />
        <HistoryLog history={history} />
      </div>

      <HadistModal 
        isOpen={hadistModal.isOpen} 
        onClose={() => setHadistModal({ ...hadistModal, isOpen: false })} 
        hadist={hadistModal.text} 
      />

      {validationPopup.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm transition-all">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden transform scale-100">
            <div className="p-4 text-white flex justify-between items-center bg-rose-600">
              <h4 className="font-bold text-sm flex items-center gap-2">
                <FontAwesomeIcon icon={faCircleExclamation} />
                Peringatan
              </h4>
              <button onClick={closeValidationPopup} className="text-white/70 hover:text-white transition-colors">
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            <div className="p-6 text-center">
              <p className="text-sm text-gray-600">
                {validationPopup.message}
              </p>
              <button
                onClick={closeValidationPopup}
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