import SecondaryPageShell from '../components/secondary/SecondaryPageShell.jsx';

const analysisMetrics = [
  { label: 'Analises geradas', value: '246', description: 'Relatorios estatisticos processados pelo motor DUQUE.' },
  { label: 'Alta confianca', value: '64', description: 'Analises acima do limiar interno de seguranca.' },
  { label: 'Tempo medio', value: '1.8s', description: 'Velocidade media de leitura estatistica.' },
  { label: 'Revisoes', value: '21', description: 'Casos enviados para auditoria interna.' },
];

function AnalysesPage() {
  return (
    <SecondaryPageShell
      eyebrow="Central de inteligencia"
      title="Analises estatisticas"
      description="Area dedicada para relatorios, recomendacoes e leituras preditivas geradas pela IA."
      summary={{ label: 'Precisao media', value: '83%', description: 'em analises de alta confianca' }}
      metrics={analysisMetrics}
    />
  );
}

export default AnalysesPage;
