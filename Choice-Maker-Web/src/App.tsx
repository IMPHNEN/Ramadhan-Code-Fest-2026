import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./components/layout/HomePage";
import QuizPage from "./components/layout/QuizPage";
import ResultPage from "./components/layout/ResultPage";
import { DecisionProvider } from "./hooks/useDecision";

function App() {
  return (
    <DecisionProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/quiz/:step" element={<QuizPage />} />
          <Route path="/result" element={<ResultPage />} />
        </Routes>
      </BrowserRouter>
    </DecisionProvider>
  );
}

export default App;