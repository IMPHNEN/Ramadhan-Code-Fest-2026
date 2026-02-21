import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCloudSun, faFire } from '@fortawesome/free-solid-svg-icons';

export default function StatsBar({ surgaPercentage, nerakaPercentage }) {
  return (
    <div className="mb-6">
      <div className="flex justify-between text-xs font-semibold mb-2 text-gray-700">
        <span className="flex items-center gap-2">
          <FontAwesomeIcon icon={faCloudSun} className="text-emerald-600" />
          Surga: {surgaPercentage}%
        </span>
        <span className="flex items-center gap-2">
          Neraka: {nerakaPercentage}%
          <FontAwesomeIcon icon={faFire} className="text-rose-600" />
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-md h-2.5 overflow-hidden flex">
        <div 
          className="bg-emerald-500 h-full transition-all duration-500 ease-out" 
          style={{ width: `${surgaPercentage}%` }}
        ></div>
      </div>
    </div>
  );
}