import { createContext, useContext, useState } from "react";

type DecisionContextType = {
	answers: number[];
	itemName: string;
	addAnswer: (score: number) => void;
	setItemName: (name: string) => void;
	resetAnswers: () => void;
	totalScore: number;
	getDecision: () => string;
	getReasons: () => string[];
	confidence: number;
};

const DecisionContext = createContext<DecisionContextType | undefined>(undefined);

export function DecisionProvider({ children }: { children: React.ReactNode }) {
	const [answers, setAnswers] = useState<number[]>([]);
	const [itemName, setItemName] = useState("");

	const addAnswer = (score: number) => {
		setAnswers((prev) => [...prev, score]);
	};

	const resetAnswers = () => {
		setAnswers([]);
	};

	const totalScore = answers.reduce((a, b) => a + b, 0);
	const maxScore = answers.length * 2;
	const percentage = maxScore === 0 ? 0 : (totalScore / maxScore) * 100;

	const getDecision = () => {
		if (percentage >= 70) return "✅ Beli sekarang";
		if (percentage >= 40) return "🤔 Pertimbangkan lagi";
		if (percentage >= 0) return "⏳ Tunda 3 hari dulu";
		return "❌ Sebaiknya jangan beli";
	};

	const getReasons = () => {
		const reasons: string[] = [];

		answers.forEach((score, index) => {
			if (score <= -1) {
				switch (index) {
					case 0:
						reasons.push("Pembelian ini lebih condong ke keinginan.");
						break;
					case 1:
						reasons.push("Frekuensi penggunaan tergolong rendah.");
						break;
					case 2:
						reasons.push("Kondisi keuangan belum sepenuhnya aman.");
						break;
					case 3:
						reasons.push("Keputusan dipengaruhi kondisi emosional.");
						break;
					case 4:
						reasons.push("Masih ada alternatif yang bisa digunakan.");
						break;
					case 5:
						reasons.push("Kebutuhan ini tidak mendesak.");
						break;
					case 6:
						reasons.push("Nilai jangka panjang kurang kuat.");
						break;
					case 7:
						reasons.push("Ada pengaruh sosial dalam keputusan.");
						break;
					case 8:
						reasons.push("Belum membandingkan opsi secara optimal.");
						break;
					case 9:
						reasons.push("Belum memberi waktu jeda sebelum membeli.");
						break;
				}
			}
		});

		if (reasons.length === 0) {
			reasons.push("Mayoritas indikator menunjukkan keputusan yang rasional.");
		}

		return reasons.slice(0, 4);
	};

	const confidence =
		answers.length === 0
			? 0
			: Math.min(
					(answers.reduce((s, v) => s + Math.abs(v), 0) / maxScore) * 100,
					100
			  );

	return (
		<DecisionContext.Provider
			value={{
				answers,
				itemName,
				addAnswer,
				setItemName,
				resetAnswers,
				totalScore,
				getDecision,
				getReasons,
				confidence,
			}}
		>
			{children}
		</DecisionContext.Provider>
	);
}

export function useDecision() {
	const context = useContext(DecisionContext);
	if (!context) {
		throw new Error("useDecision must be used inside DecisionProvider");
	}
	return context;
}