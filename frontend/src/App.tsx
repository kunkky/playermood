import { Route, Routes } from "react-router-dom";
import CoachView from "./pages/CoachView";
import TrainingSessions from "./pages/TrainingSessions";
import ParticularTraining from "./pages/ParticularTraining";
import NotFound from "./components/NotFound";

const App = () => {
  return (
    <Routes>
      <Route path="/coach" element={<CoachView />} />
      <Route path="/" element={<TrainingSessions />} />
      <Route path="/:id" element={<ParticularTraining />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default App;
