import { useDecision } from "../../hooks/useDecision";
import { useNavigate } from "react-router-dom";

export default function ResultPage() {
	const {
		getDecision,
		getReasons,
		confidence,
		resetAnswers,
		itemName,
	} = useDecision();

	const navigate = useNavigate();

	return (
		<main className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 px-6">
			<div className="relative z-10 w-full max-w-xl backdrop-blur-xl bg-white/10 border border-white/20 p-10 rounded-3xl shadow-2xl text-white">

				<h1 className="text-3xl font-bold mb-6 text-center">
					Hasil Analisis
				</h1>

				<p className="mb-2">
					Barang: <span className="font-semibold">{itemName}</span>
				</p>

				<p className="text-xl font-semibold mb-6">
					{getDecision()}
				</p>

				<div className="mb-6">
					<p className="mb-2 text-sm text-gray-300">
						Confidence Level
					</p>

					<div className="w-full bg-white/20 h-3 rounded-full overflow-hidden">
						<div
							className="bg-white h-3 rounded-full transition-all duration-700"
							style={{ width: `${confidence}%` }}
						/>
					</div>
				</div>

				<div className="mb-8">
					<h2 className="font-semibold mb-4">
						Alasan Analisis
					</h2>

					<div className="flex flex-col gap-3 text-sm">
						{getReasons().map((reason, i) => (
							<div key={i} className="bg-white/10 px-4 py-3 rounded-lg">
								• {reason}
							</div>
						))}
					</div>
				</div>

				<button
					onClick={() => {
						resetAnswers();
						navigate("/");
					}}
					className="w-full py-4 rounded-xl bg-white text-black font-semibold hover:opacity-90 transition"
				>
					Selesai
				</button>
			</div>
		</main>
	);
}