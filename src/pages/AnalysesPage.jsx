import SecondaryPageShell from '../components/secondary/SecondaryPageShell.jsx';

const analysisMetrics = [
  { label: 'Análises geradas', value: '246', description: 'Relatórios estatísticos processados pelo motor DUQUE.' },
  { label: 'Alta confiança', value: '64', description: 'Análises acima do limiar premium de segurança.' },
  { label: 'Tempo médio', value: '1.8s', description: 'Velocidade média de leitura estatística.' },
  { label: 'Revisões', value: '21', description: 'Casos enviados para auditoria interna.' },
];

function AnalysesPage() {
  return (
    <SecondaryPageShell
      eyebrow="Central de inteligência"
      title="Análises estatísticas"
      description="Área dedicada para relatórios, recomendações e leituras preditivas geradas pela IA."
      summary={{ label: 'Precisão média', value: '83%', description: 'em análises de alta confiança' }}
      metrics={analysisMetrics}
    />
  );
}

export default AnalysesPage;
