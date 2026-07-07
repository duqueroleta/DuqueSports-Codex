import LatestAudits from '../components/audits/LatestAudits.jsx';
import HeroSection from '../components/hero/HeroSection.jsx';
import StrongMarkets from '../components/markets/StrongMarkets.jsx';
import MobileMatchCarousel from '../components/matches/MobileMatchCarousel.jsx';
import TodayMatches from '../components/matches/TodayMatches.jsx';
import DuquePro from '../components/pro/DuquePro.jsx';
import PreviewSections from '../components/sections/PreviewSections.jsx';
import GlobalStats from '../components/stats/GlobalStats.jsx';
import SystemStatus from '../components/system/SystemStatus.jsx';
import '../styles/page-home.css';

function HomePage() {
  return (
    <main className="home-page">
      <MobileMatchCarousel />
      <HeroSection />
      <TodayMatches />
      <StrongMarkets />
      <LatestAudits />
      <GlobalStats />
      <SystemStatus />
      <DuquePro />
      <PreviewSections />
    </main>
  );
}

export default HomePage;
