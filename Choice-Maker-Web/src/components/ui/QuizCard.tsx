import type { Question } from "../../questions/decisionQuestions";

type Props = {
	data: Question;
	onAnswer: (score: number) => void;
};

export default function QuestionCard({ data, onAnswer }: Props) {
	return (
		<div className="backdrop-blur-xl bg-white/10 border border-white/20 p-8 rounded-3xl shadow-2xl animate-slideUp">

			<h2 className="text-2xl font-semibold text-white mb-8 text-center">
				{data.question}
			</h2>

			<div className="flex flex-col gap-4">
				{data.options.map((opt, i) => (
					<button
						key={i}
						onClick={() => onAnswer(opt.score)}
						className="w-full py-4 rounded-xl bg-white/20 text-white border border-white/30 hover:bg-white hover:text-black transition duration-300"
					>
						{opt.label}
					</button>
				))}
			</div>
		</div>
	);
}