import { useDecision } from "../../hooks/useDecision";
import { questions } from "../../questions/decisionQuestions";
import QuestionCard from "../ui/QuizCard";
import { useNavigate, useParams } from "react-router-dom";

export default function QuizPage() {
	const { step } = useParams();
	const navigate = useNavigate();
	const { addAnswer } = useDecision();

	const index = step ? Number(step) : 0;
	const question = questions[index];

	if (!question) return null;

	const handleAnswer = (score: number) => {
		addAnswer(score);

		if (index + 1 < questions.length) {
			navigate(`/quiz/${index + 1}`);
		} else {
			navigate("/result");
		}
	};

	const progress = ((index + 1) / questions.length) * 100;

	return (
		<main className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 px-6">

			<div className="absolute w-[500px] h-[500px] bg-purple-500/20 blur-[120px] rounded-full -top-20 -left-20"></div>

			<div className="relative z-10 w-full max-w-xl">

				{/* Progress */}
				<div className="mb-8">
					<div className="flex justify-between text-sm text-gray-300 mb-2">
						<span>Pertanyaan {index + 1}</span>
						<span>{questions.length}</span>
					</div>

					<div className="w-full bg-white/20 h-2 rounded-full overflow-hidden">
						<div
							className="bg-white h-2 rounded-full transition-all duration-500"
							style={{ width: `${progress}%` }}
						/>
					</div>
				</div>

				<QuestionCard data={question} onAnswer={handleAnswer} />
			</div>
		</main>
	);
}