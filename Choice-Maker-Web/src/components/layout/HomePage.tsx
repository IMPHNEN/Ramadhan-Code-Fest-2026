import { useNavigate } from "react-router-dom";
import { useDecision } from "../../hooks/useDecision";
import { useState } from "react";

export default function HomePage() {
	const navigate = useNavigate();
	const { itemName, setItemName, resetAnswers } = useDecision();
	const [showForm, setShowForm] = useState(false);

	const handleStart = () => {
		if (!itemName.trim()) return;
		resetAnswers();
		navigate("/quiz/0");
	};

	return (
		<main className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">

			{/* Glow Background */}
			<div className="absolute w-[600px] h-[600px] bg-blue-500/20 blur-[150px] rounded-full -top-40 -left-40"></div>
			<div className="absolute w-[500px] h-[500px] bg-purple-500/20 blur-[120px] rounded-full bottom-0 right-0"></div>

			<div className="relative z-10 w-full max-w-md px-6">

				{/* INTRO */}
				{!showForm && (
					<div className="text-center text-white animate-fadeIn">
						<h1 className="text-5xl font-bold mb-4 tracking-tight">
							Choice Maker
						</h1>

						<p className="text-lg text-gray-300 mb-10 leading-relaxed">
							Bantu kamu mengambil keputusan dengan lebih rasional.
							Jangan biarkan impuls mengendalikan dompetmu.
						</p>

						<button
							onClick={() => setShowForm(true)}
							className="px-8 py-4 rounded-full bg-white text-black font-semibold shadow-xl hover:scale-105 transition duration-300"
						>
							Mulai Sekarang
						</button>
					</div>
				)}

				{/* FORM CARD */}
				{showForm && (
					<div className="backdrop-blur-xl bg-white/10 border border-white/20 p-8 rounded-3xl shadow-2xl animate-slideUp">

						<h2 className="text-2xl font-semibold text-white mb-6 text-center">
							Apa yang ingin kamu beli?
						</h2>

						<input
							value={itemName}
							onChange={(e) =>
								setItemName(e.target.value)
							}
							placeholder="Contoh: iPhone 15"
							className="w-full px-4 py-3 rounded-xl bg-white/20 text-white placeholder-gray-300 border border-white/30 focus:outline-none focus:ring-2 focus:ring-white transition"
						/>

						<button
							onClick={handleStart}
							disabled={!itemName.trim()}
							className="w-full mt-6 py-3 rounded-xl bg-white text-black font-semibold shadow-lg hover:opacity-90 disabled:opacity-40 transition"
						>
							Analisis Sekarang
						</button>

						<button
							onClick={() => setShowForm(false)}
							className="w-full mt-4 text-sm text-gray-300 hover:text-white transition"
						>
							Kembali
						</button>
					</div>
				)}
			</div>
		</main>
	);
}