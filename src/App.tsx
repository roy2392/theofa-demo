import { Routes, Route } from 'react-router-dom';
import { ScenarioSelector } from './pages/ScenarioSelector';
import { ChatPage } from './pages/ChatPage';
import { Header } from './components/Header';

function App() {
  return (
    <div className="whatsapp-background min-h-screen">
      <Header />
      <div className="container mx-auto px-4 py-6">
        <Routes>
          <Route path="/" element={<ScenarioSelector />} />
          <Route path="/chat/:scenario" element={<ChatPage />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;