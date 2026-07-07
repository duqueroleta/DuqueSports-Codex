import DevFailurePanel from '../components/profile/DevFailurePanel.jsx';
import ResetPreferencesPanel from '../components/profile/ResetPreferencesPanel.jsx';
import SecondaryPageShell from '../components/secondary/SecondaryPageShell.jsx';

const profileMetrics = [
  { label: 'Perfil', value: 'Pro', description: 'Conta preparada para recursos premium e filtros avançados.' },
  { label: 'Precisão pessoal', value: '81%', description: 'Desempenho consolidado nas análises salvas.' },
  { label: 'Mercado favorito', value: 'Over', description: 'Maior frequência de sinais acompanhados.' },
  { label: 'Alertas ativos', value: '12', description: 'Notificações configuradas para jogos e mercados.' },
];

function ProfilePage() {
  return (
    <SecondaryPageShell
      eyebrow="Conta do analista"
      title="Perfil operacional"
      description="Preferências, nível de acesso e indicadores pessoais do analista dentro do DUQUE Sports AI."
      summary={{ label: 'Nível atual', value: 'PRO', description: 'experiência premium habilitada' }}
      metrics={profileMetrics}
    >
      <DevFailurePanel />
      <ResetPreferencesPanel />
    </SecondaryPageShell>
  );
}

export default ProfilePage;
