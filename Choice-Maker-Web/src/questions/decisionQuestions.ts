export type Question = {
	id: string;
	question: string;
	options: { label: string; score: number }[];
};

export const questions: Question[] = [
	{
		id: "need",
		question: "Apakah ini kebutuhan atau keinginan?",
		options: [
			{ label: "Kebutuhan penting", score: 2 },
			{ label: "Setengah kebutuhan", score: 1 },
			{ label: "Keinginan", score: -1 },
			{ label: "Impuls doang", score: -2 },
		],
	},
	{
		id: "frequency",
		question: "Seberapa sering akan dipakai?",
		options: [
			{ label: "Setiap hari", score: 2 },
			{ label: "Kadang-kadang", score: 1 },
			{ label: "Jarang", score: 0 },
			{ label: "Hampir tidak pernah", score: -1 },
		],
	},
	{
		id: "budget",
		question: "Apakah budget kamu aman?",
		options: [
			{ label: "Sangat aman", score: 2 },
			{ label: "Aman", score: 1 },
			{ label: "Pas-pasan", score: 0 },
			{ label: "Tidak aman", score: -2 },
		],
	},
	{
		id: "emotion",
		question: "Apakah kamu sedang emosional saat ini?",
		options: [
			{ label: "Tidak sama sekali", score: 2 },
			{ label: "Sedikit", score: 1 },
			{ label: "Netral", score: 0 },
			{ label: "Cukup emosional", score: -1 },
			{ label: "Sangat emosional", score: -2 },
		],
	},
	{
		id: "alternative",
		question: "Apakah ada alternatif yang sudah kamu miliki?",
		options: [
			{ label: "Tidak ada alternatif", score: 2 },
			{ label: "Ada tapi kurang memadai", score: 1 },
			{ label: "Ada alternatif cukup baik", score: -1 },
			{ label: "Alternatif lebih baik sudah ada", score: -2 },
		],
	},
	{
		id: "urgency",
		question: "Seberapa mendesak kebutuhan ini?",
		options: [
			{ label: "Sangat mendesak", score: 2 },
			{ label: "Cukup penting", score: 1 },
			{ label: "Bisa ditunda", score: 0 },
			{ label: "Tidak mendesak", score: -1 },
		],
	},
	{
		id: "longterm",
		question: "Apakah barang ini memberi manfaat jangka panjang?",
		options: [
			{ label: "Ya, sangat bermanfaat", score: 2 },
			{ label: "Cukup bermanfaat", score: 1 },
			{ label: "Tidak yakin", score: 0 },
			{ label: "Hanya sesaat", score: -1 },
		],
	},
	{
		id: "social",
		question: "Apakah kamu membeli karena pengaruh orang lain?",
		options: [
			{ label: "Tidak sama sekali", score: 2 },
			{ label: "Sedikit terpengaruh", score: 0 },
			{ label: "Ya, karena tekanan sosial", score: -2 },
		],
	},
	{
		id: "compare",
		question: "Sudahkah kamu membandingkan harga atau opsi lain?",
		options: [
			{ label: "Sudah dan ini terbaik", score: 2 },
			{ label: "Sudah tapi belum yakin", score: 1 },
			{ label: "Belum sempat", score: 0 },
			{ label: "Tidak peduli", score: -1 },
		],
	},
	{
		id: "wait",
		question: "Sudahkah kamu menunggu minimal 24 jam sebelum membeli?",
		options: [
			{ label: "Ya, lebih dari 24 jam", score: 2 },
			{ label: "Baru sebentar", score: 0 },
			{ label: "Belum sama sekali", score: -2 },
		],
	},
];