import { Link } from 'react-router-dom';
import '../styles/page-not-found.css';

function NotFoundPage() {
  return (
    <main className="not-found-page">
      <section className="not-found-content" aria-labelledby="not-found-title">
        <div className="not-found-code" aria-hidden="true">404</div>
        <span>Rota indisponivel</span>
        <h1 id="not-found-title">Esta pagina saiu do radar</h1>
        <p>
          O endereco acessado nao corresponde a uma area ativa do Duque Score.
          Retorne ao inicio ou continue pelas partidas monitoradas.
        </p>
        <nav className="not-found-actions" aria-label="Navegacao da pagina nao encontrada">
          <Link to="/">Ir para Home</Link>
          <Link to="/jogos">Ver Jogos</Link>
        </nav>
      </section>
    </main>
  );
}

export default NotFoundPage;
