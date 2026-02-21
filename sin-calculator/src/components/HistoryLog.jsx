import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowUp, faArrowDown } from '@fortawesome/free-solid-svg-icons';
import { AMAL_TYPE } from '../utils/amalHeuristics';

export default function HistoryLog({ history }) {
  return (
    <div className="bg-gray-50 rounded-md p-3 border border-gray-200 h-40 overflow-y-auto">
      <h3 className="text-xs font-bold text-gray-500 mb-2 sticky top-0 bg-gray-50 py-1">Riwayat Kegiatan</h3>
      {history.length === 0 ? (
        <p className="text-xs text-gray-400 text-center mt-6">Belum ada data tercatat.</p>
      ) : (
        <ul className="space-y-2 text-sm">
          {history.map((item) => (
            <li key={item.id} className="flex justify-between items-center p-2 bg-white rounded border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3">
                <FontAwesomeIcon 
                  icon={item.type === AMAL_TYPE.PAHALA ? faArrowUp : faArrowDown} 
                  className={item.type === AMAL_TYPE.PAHALA ? "text-emerald-500" : "text-rose-500"} 
                />
                <span className="text-gray-700">{item.description}</span>
              </div>
              <div className="flex flex-col items-end">
                <span className={item.type === AMAL_TYPE.PAHALA ? 'text-emerald-600 font-semibold' : 'text-rose-600 font-semibold'}>
                  {item.type === AMAL_TYPE.PAHALA ? '+' : '-'}{item.amount}%
                </span>
                <span className="text-[10px] text-gray-400">{item.time}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}