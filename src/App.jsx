import { Routes, Route } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout.jsx';
import AnalysesPage from './pages/AnalysesPage.jsx';
import AuditsPage from './pages/AuditsPage.jsx';
import DataPage from './pages/DataPage.jsx';
import FavoritesPage from './pages/FavoritesPage.jsx';
import HomePage from './pages/HomePage.jsx';
import LeadCapturePage from './pages/LeadCapturePage.jsx';
import LivePage from './pages/LivePage.jsx';
import MarketDetailPage from './pages/MarketDetailPage.jsx';
import MarketsPage from './pages/MarketsPage.jsx';
import MatchDetailPage from './pages/MatchDetailPage.jsx';
import MatchesPage from './pages/MatchesPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';

function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/lista-vip" element={<LeadCapturePage />} />
        <Route path="/jogos" element={<MatchesPage />} />
        <Route path="/jogos/:matchId" element={<MatchDetailPage />} />
        <Route path="/mercados" element={<MarketsPage />} />
        <Route path="/mercados/:marketId" element={<MarketDetailPage />} />
        <Route path="/auditorias" element={<AuditsPage />} />
        <Route path="/ao-vivo" element={<LivePage />} />
        <Route path="/dados" element={<DataPage />} />
        <Route path="/perfil" element={<ProfilePage />} />
        <Route path="/favoritos" element={<FavoritesPage />} />
        <Route path="/analises" element={<AnalysesPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export default App;
