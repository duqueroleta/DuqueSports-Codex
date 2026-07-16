import { Link } from 'react-router-dom';
import '../styles/page-not-found.css';

function NotFoundPage() {
  return (
    <main className="not-found-page">
      <section className="not-found-content" aria-labelledby="not-found-title">
        <div className="not-found-code" aria-hidden="true">404</div>
        <span>Rota indisponível</span>
        <h1 id="not-found-title">Esta página saiu do radar</h1>
        <p>
          O endereço acessado não corresponde a uma área ativa do Duque Score.
          Retorne ao início ou continue pelas partidas monitoradas.
        </p>
        <nav className="not-found-actions" aria-label="Navegação da página não encontrada">
          <Link to="/">Ir para Home</Link>
          <Link to="/jogos">Ver Jogos</Link>
        </nav>
      </section>
    </main>
  );
}

export default NotFoundPage;
