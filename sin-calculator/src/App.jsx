import { useState } from 'react';
import { AMAL_TYPE, calculateWeight } from './utils/amalHeuristics';
import Header from './components/Header';
import StatsBar from './components/StatsBar';
import InputSection from './components/InputSection';
import FintechSection from './components/FintechSection';
import HistoryLog from './components/HistoryLog';

export default function App() {
  const [surgaPercentage, setSurgaPercentage] = useState(50);
  const [history, setHistory] = useState([]);
  const [description, setDescription] = useState('');

  const handleAddAmal = (type) => {
    if (!description.trim()) {
      alert("Deskripsi kegiatan tidak boleh kosong!");
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
  };

  const nerakaPercentage = 100 - surgaPercentage;

  return (
    <div className="w-full max-w-md bg-white border border-gray-200 rounded-xl p-6 shadow-sm mx-auto">
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
      
      <FintechSection />
      
      <HistoryLog history={history} />
    </div>
  );
}