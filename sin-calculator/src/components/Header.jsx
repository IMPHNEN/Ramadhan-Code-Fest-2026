import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faScaleBalanced } from '@fortawesome/free-solid-svg-icons';

export default function Header() {
  return (
    <div className="text-center mb-6 pb-4 border-b border-gray-200">
      <h1 className="text-xl font-bold text-gray-800 mb-1 flex items-center justify-center gap-2">
        <FontAwesomeIcon icon={faScaleBalanced} className="text-gray-600" />
        Kalkulator Akhirat
      </h1>
      <p className="text-xs text-gray-500">Sistem analisis teks untuk pembobotan amal dan dosa</p>
    </div>
  );
}