import DevFailurePanel from '../components/profile/DevFailurePanel.jsx';
import ResetPreferencesPanel from '../components/profile/ResetPreferencesPanel.jsx';
import SecondaryPageShell from '../components/secondary/SecondaryPageShell.jsx';

const profileMetrics = [
  { label: 'Perfil', value: 'VIP', description: 'Acesso gratuito preparado para novas funcionalidades.' },
  { label: 'Precisao pessoal', value: '81%', description: 'Desempenho consolidado nas analises salvas.' },
  { label: 'Mercado favorito', value: 'Over', description: 'Maior frequencia de sinais acompanhados.' },
  { label: 'Alertas ativos', value: '12', description: 'Notificacoes configuradas para jogos e mercados.' },
];

function ProfilePage() {
  return (
    <SecondaryPageShell
      eyebrow="Conta do analista"
      title="Perfil operacional"
      description="Preferencias, acesso gratuito e indicadores pessoais do analista dentro do DUQUE Sports AI."
      summary={{ label: 'Nivel atual', value: 'VIP', description: 'acesso gratuito habilitado' }}
      metrics={profileMetrics}
    >
      <DevFailurePanel />
      <ResetPreferencesPanel />
    </SecondaryPageShell>
  );
}

export default ProfilePage;
