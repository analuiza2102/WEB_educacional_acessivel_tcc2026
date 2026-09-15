import { type FormEvent, useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router';
import { authService } from '../services/authService';

export function GestorLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [alreadyAuthorized, setAlreadyAuthorized] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let active = true;

    async function checkExistingSession() {
      try {
        const session = await authService.getCurrentSession();
        if (!session) return;

        if (await authService.isGestorOrAdmin()) {
          if (active) setAlreadyAuthorized(true);
          return;
        }

        await authService.signOut();
        if (active) {
          setErrorMessage('Acesso negado. Esta conta não possui perfil de gestor ou administrador.');
        }
      } catch (error) {
        if (active) {
          setErrorMessage(error instanceof Error ? error.message : 'Não foi possível verificar a sessão.');
        }
      } finally {
        if (active) setCheckingSession(false);
      }
    }

    checkExistingSession();
    return () => {
      active = false;
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setErrorMessage('');

    try {
      await authService.signIn(email.trim(), password);
      const authorized = await authService.isGestorOrAdmin();

      if (!authorized) {
        await authService.signOut();
        setPassword('');
        setErrorMessage('Acesso negado. Esta conta não possui perfil de gestor ou administrador.');
        return;
      }

      navigate('/gestor', { replace: true });
    } catch (error) {
      setPassword('');
      setErrorMessage(error instanceof Error ? error.message : 'Não foi possível entrar.');
    } finally {
      setLoading(false);
    }
  }

  if (alreadyAuthorized) return <Navigate to="/gestor" replace />;

  return (
    <div className="min-h-[70vh] bg-gray-50 px-4 py-12 sm:px-6">
      <div className="mx-auto max-w-md rounded-lg border-2 border-gray-200 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="mb-2 text-3xl font-bold text-gray-900">Acesso do gestor</h1>
        <p className="mb-6 text-gray-700">
          Entre com a conta cadastrada no Supabase e autorizada como gestor ou administrador.
        </p>

        {errorMessage && (
          <div
            className="mb-6 rounded-lg border-2 border-red-300 bg-red-50 p-4 text-red-900"
            role="alert"
          >
            {errorMessage}
          </div>
        )}

        {checkingSession ? (
          <p className="text-gray-700" role="status">Verificando sessão...</p>
        ) : (
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="gestor-email" className="mb-2 block font-medium text-gray-900">
                Email
              </label>
              <input
                id="gestor-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-3 text-gray-900 focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-200"
              />
            </div>

            <div>
              <label htmlFor="gestor-password" className="mb-2 block font-medium text-gray-900">
                Senha
              </label>
              <input
                id="gestor-password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-3 text-gray-900 focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-200"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-blue-700 px-5 py-3 font-bold text-white transition-colors hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
