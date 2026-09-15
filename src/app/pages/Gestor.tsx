import { type FormEvent, useCallback, useEffect, useRef, useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router';
import { authService, type Profile } from '../services/authService';
import {
  gestorService,
  type CursoGestor,
  type CursoStatus,
  type CursoUpdateInput
} from '../services/api/gestorService';

const statusOptions: { value: CursoStatus; label: string }[] = [
  { value: 'pending_review', label: 'Pendentes' },
  { value: 'published', label: 'Publicados' },
  { value: 'rejected', label: 'Rejeitados' },
  { value: 'archived', label: 'Arquivados' }
];

const statusLabels: Record<CursoStatus, string> = {
  pending_review: 'Pendente',
  published: 'Publicado',
  rejected: 'Rejeitado',
  archived: 'Arquivado'
};

type AccessState = 'checking' | 'allowed' | 'denied' | 'error';

function formatDate(value: string | null): string {
  if (!value) return 'Não informado';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Data inválida';
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(date);
}

export function Gestor() {
  const navigate = useNavigate();
  const [access, setAccess] = useState<AccessState>('checking');
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userEmail, setUserEmail] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<CursoStatus>('pending_review');
  const [cursos, setCursos] = useState<CursoGestor[]>([]);
  const [loadingCursos, setLoadingCursos] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [rejectingCurso, setRejectingCurso] = useState<CursoGestor | null>(null);
  const [editingCurso, setEditingCurso] = useState<CursoGestor | null>(null);

  useEffect(() => {
    let active = true;

    async function checkAccess() {
      try {
        const session = await authService.getCurrentSession();
        if (!session) {
          navigate('/gestor/login', { replace: true });
          return;
        }

        const currentProfile = await authService.getCurrentProfile();
        if (!active) return;

        setUserEmail(session.user.email ?? '');
        setProfile(currentProfile);
        setAccess(
          currentProfile?.role === 'gestor' || currentProfile?.role === 'admin'
            ? 'allowed'
            : 'denied'
        );
      } catch (error) {
        if (!active) return;
        setAccess('error');
        setMessage({
          type: 'error',
          text: error instanceof Error ? error.message : 'Não foi possível verificar o acesso.'
        });
      }
    }

    checkAccess();
    return () => {
      active = false;
    };
  }, [navigate]);

  const loadCursos = useCallback(async () => {
    setLoadingCursos(true);
    setMessage(null);
    const response = selectedStatus === 'pending_review'
      ? await gestorService.getPendingCursos()
      : await gestorService.getCursosByStatus(selectedStatus);

    if (response.error) {
      setCursos([]);
      setMessage({ type: 'error', text: response.error });
    } else {
      setCursos(response.data);
    }
    setLoadingCursos(false);
  }, [selectedStatus]);

  useEffect(() => {
    if (access === 'allowed') loadCursos();
  }, [access, loadCursos]);

  async function handleSignOut() {
    try {
      await authService.signOut();
      navigate('/gestor/login', { replace: true });
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Não foi possível sair.'
      });
    }
  }

  async function runAction(
    curso: CursoGestor,
    action: () => ReturnType<typeof gestorService.approveCurso>,
    successMessage: string
  ) {
    setBusyId(curso.id);
    setMessage(null);
    const response = await action();

    if (response.error) {
      setMessage({ type: 'error', text: response.error });
    } else {
      await loadCursos();
      setMessage({ type: 'success', text: successMessage });
    }
    setBusyId(null);
  }

  function handleArchive(curso: CursoGestor) {
    if (!window.confirm(`Arquivar o curso “${curso.nome}”?`)) return;
    runAction(curso, () => gestorService.archiveCurso(curso.id), 'Curso arquivado com sucesso.');
  }

  async function handleReject(reviewNotes: string) {
    if (!rejectingCurso) return;
    const curso = rejectingCurso;
    setRejectingCurso(null);
    await runAction(
      curso,
      () => gestorService.rejectCurso(curso.id, reviewNotes),
      'Curso rejeitado com sucesso.'
    );
  }

  async function handleEdit(updates: CursoUpdateInput) {
    if (!editingCurso) return;
    const curso = editingCurso;
    setEditingCurso(null);
    setBusyId(curso.id);
    setMessage(null);
    const response = await gestorService.updateCurso(curso.id, updates);

    if (response.error) {
      setMessage({ type: 'error', text: response.error });
    } else {
      await loadCursos();
      setMessage({ type: 'success', text: 'Curso atualizado com sucesso.' });
    }
    setBusyId(null);
  }

  if (access === 'checking') {
    return <div className="min-h-[60vh] bg-gray-50 p-8 text-center text-lg" role="status">Verificando acesso...</div>;
  }

  if (access === 'denied') {
    return (
      <div className="min-h-[60vh] bg-gray-50 px-4 py-12">
        <div className="mx-auto max-w-2xl rounded-lg border-2 border-red-300 bg-white p-8">
          <h1 className="mb-4 text-3xl font-bold text-gray-900">Acesso negado</h1>
          <p className="mb-6 text-lg text-gray-700">
            Sua conta está autenticada, mas não possui o perfil gestor ou admin necessário para acessar este painel.
          </p>
          <button
            type="button"
            onClick={handleSignOut}
            className="rounded-lg bg-gray-800 px-5 py-3 font-medium text-white hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-400"
          >
            Sair desta conta
          </button>
        </div>
      </div>
    );
  }

  if (access === 'error') {
    return (
      <div className="min-h-[60vh] bg-gray-50 px-4 py-12">
        <div className="mx-auto max-w-2xl rounded-lg border-2 border-red-300 bg-red-50 p-8" role="alert">
          <h1 className="mb-4 text-3xl font-bold text-gray-900">Não foi possível abrir o painel</h1>
          <p className="text-red-900">{message?.text}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-blue-800 py-10 text-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <div>
            <h1 className="text-3xl font-bold sm:text-4xl">Painel Gestor</h1>
            <p className="mt-2 text-blue-100">
              {profile?.nome || userEmail} · perfil {profile?.role}
            </p>
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            className="self-start rounded-lg border-2 border-white bg-white px-5 py-3 font-bold text-blue-900 hover:bg-blue-50 focus:outline-none focus:ring-4 focus:ring-blue-200 md:self-auto"
          >
            Sair
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section aria-labelledby="course-filter-heading" className="mb-8 rounded-lg border-2 border-gray-200 bg-white p-5">
          <h2 id="course-filter-heading" className="mb-4 text-xl font-bold text-gray-900">Filtrar cursos por status</h2>
          <div className="flex flex-wrap gap-3" role="group" aria-label="Status do curso">
            {statusOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setSelectedStatus(option.value)}
                aria-pressed={selectedStatus === option.value}
                className={`rounded-lg px-5 py-3 font-medium focus:outline-none focus:ring-4 focus:ring-blue-300 ${
                  selectedStatus === option.value
                    ? 'bg-blue-700 text-white'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </section>

        <div aria-live="polite" aria-atomic="true">
          {message && (
            <div
              className={`mb-6 rounded-lg border-2 p-4 ${
                message.type === 'success'
                  ? 'border-green-300 bg-green-50 text-green-900'
                  : 'border-red-300 bg-red-50 text-red-900'
              }`}
              role={message.type === 'error' ? 'alert' : 'status'}
            >
              {message.text}
            </div>
          )}
        </div>

        {loadingCursos ? (
          <div className="rounded-lg border-2 border-gray-200 bg-white p-10 text-center text-lg text-gray-700" role="status">
            Carregando cursos...
          </div>
        ) : cursos.length === 0 ? (
          <div className="rounded-lg border-2 border-gray-200 bg-white p-10 text-center text-lg text-gray-700">
            Nenhum curso encontrado neste status.
          </div>
        ) : (
          <section aria-label="Cursos para revisão" className="space-y-6">
            <p className="text-gray-700">
              <strong>{cursos.length}</strong> {cursos.length === 1 ? 'curso encontrado' : 'cursos encontrados'}
            </p>
            {cursos.map((curso) => {
              const isBusy = busyId === curso.id;
              return (
                <article key={curso.id} className="rounded-lg border-2 border-gray-200 bg-white p-5 shadow-sm sm:p-6">
                  <div className="flex flex-col gap-3 border-b border-gray-200 pb-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{curso.nome || 'Curso sem nome'}</h2>
                      <p className="mt-1 font-medium text-gray-700">{curso.plataforma || 'Plataforma não informada'}</p>
                    </div>
                    <span className="self-start rounded-full bg-blue-100 px-3 py-1 text-sm font-bold text-blue-900">
                      {statusLabels[curso.status as CursoStatus] ?? curso.status}
                    </span>
                  </div>

                  <dl className="mt-5 grid grid-cols-1 gap-4 text-gray-700 sm:grid-cols-2 lg:grid-cols-4">
                    <div><dt className="font-bold text-gray-900">Área</dt><dd>{curso.area || 'Não informada'}</dd></div>
                    <div><dt className="font-bold text-gray-900">Duração</dt><dd>{curso.duracao || 'Não informada'}</dd></div>
                    <div><dt className="font-bold text-gray-900">Nível</dt><dd>{curso.nivel || 'Não informado'}</dd></div>
                    <div><dt className="font-bold text-gray-900">Fonte</dt><dd>{curso.fonte || 'Não informada'}</dd></div>
                    <div className="sm:col-span-2 lg:col-span-4">
                      <dt className="font-bold text-gray-900">Última coleta</dt>
                      <dd>{formatDate(curso.last_scraped_at)}</dd>
                    </div>
                    <div className="sm:col-span-2 lg:col-span-4">
                      <dt className="font-bold text-gray-900">Descrição</dt>
                      <dd className="whitespace-pre-wrap">{curso.descricao || 'Não informada'}</dd>
                    </div>
                    <div className="sm:col-span-2 lg:col-span-4">
                      <dt className="font-bold text-gray-900">Observações da revisão</dt>
                      <dd className="whitespace-pre-wrap">{curso.review_notes || 'Nenhuma observação.'}</dd>
                    </div>
                  </dl>

                  <div className="mt-6 flex flex-wrap gap-3 border-t border-gray-200 pt-5">
                    {curso.link ? (
                      <a
                        href={curso.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-lg border-2 border-blue-700 px-4 py-2 font-medium text-blue-800 hover:bg-blue-50 focus:outline-none focus:ring-4 focus:ring-blue-300"
                      >
                        Abrir link oficial
                        <ExternalLink className="h-5 w-5" aria-hidden="true" />
                      </a>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => setEditingCurso(curso)}
                      disabled={isBusy}
                      className="rounded-lg bg-gray-700 px-4 py-2 font-medium text-white hover:bg-gray-800 focus:outline-none focus:ring-4 focus:ring-gray-300 disabled:opacity-60"
                    >
                      Editar
                    </button>
                    {curso.status !== 'published' && (
                      <button
                        type="button"
                        onClick={() => runAction(curso, () => gestorService.approveCurso(curso.id), 'Curso aprovado e publicado com sucesso.')}
                        disabled={isBusy}
                        className="rounded-lg bg-green-700 px-4 py-2 font-medium text-white hover:bg-green-800 focus:outline-none focus:ring-4 focus:ring-green-300 disabled:opacity-60"
                      >
                        {isBusy ? 'Processando...' : 'Aprovar'}
                      </button>
                    )}
                    {curso.status !== 'rejected' && (
                      <button
                        type="button"
                        onClick={() => setRejectingCurso(curso)}
                        disabled={isBusy}
                        className="rounded-lg bg-red-700 px-4 py-2 font-medium text-white hover:bg-red-800 focus:outline-none focus:ring-4 focus:ring-red-300 disabled:opacity-60"
                      >
                        Rejeitar
                      </button>
                    )}
                    {curso.status !== 'archived' && (
                      <button
                        type="button"
                        onClick={() => handleArchive(curso)}
                        disabled={isBusy}
                        className="rounded-lg bg-amber-700 px-4 py-2 font-medium text-white hover:bg-amber-800 focus:outline-none focus:ring-4 focus:ring-amber-300 disabled:opacity-60"
                      >
                        Arquivar
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </section>
        )}
      </div>

      {rejectingCurso && (
        <RejectDialog
          curso={rejectingCurso}
          onCancel={() => setRejectingCurso(null)}
          onConfirm={handleReject}
        />
      )}
      {editingCurso && (
        <EditDialog
          curso={editingCurso}
          onCancel={() => setEditingCurso(null)}
          onSave={handleEdit}
        />
      )}
    </div>
  );
}

function RejectDialog({
  curso,
  onCancel,
  onConfirm
}: {
  curso: CursoGestor;
  onCancel: () => void;
  onConfirm: (notes: string) => void;
}) {
  const [notes, setNotes] = useState(curso.review_notes);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    textareaRef.current?.focus();
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') onCancel();
    }
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onCancel]);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4" role="presentation">
      <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl" role="dialog" aria-modal="true" aria-labelledby="reject-title">
        <h2 id="reject-title" className="mb-2 text-2xl font-bold text-gray-900">Rejeitar curso</h2>
        <p className="mb-5 text-gray-700">Informe o motivo da rejeição de “{curso.nome}”.</p>
        <label htmlFor="reject-notes" className="mb-2 block font-medium text-gray-900">Motivo da rejeição</label>
        <textarea
          ref={textareaRef}
          id="reject-notes"
          rows={5}
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          className="w-full rounded-lg border-2 border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-200"
        />
        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <button type="button" onClick={onCancel} className="rounded-lg bg-gray-200 px-4 py-2 text-gray-900 hover:bg-gray-300 focus:outline-none focus:ring-4 focus:ring-gray-300">Cancelar</button>
          <button type="button" onClick={() => onConfirm(notes)} className="rounded-lg bg-red-700 px-4 py-2 text-white hover:bg-red-800 focus:outline-none focus:ring-4 focus:ring-red-300">Confirmar rejeição</button>
        </div>
      </div>
    </div>
  );
}

function EditDialog({
  curso,
  onCancel,
  onSave
}: {
  curso: CursoGestor;
  onCancel: () => void;
  onSave: (updates: CursoUpdateInput) => void;
}) {
  const [form, setForm] = useState<Required<CursoUpdateInput>>({
    nome: curso.nome,
    plataforma: curso.plataforma,
    area: curso.area,
    duracao: curso.duracao,
    nivel: curso.nivel,
    descricao: curso.descricao,
    link: curso.link,
    review_notes: curso.review_notes
  });
  const firstInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    firstInputRef.current?.focus();
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') onCancel();
    }
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onCancel]);

  function updateField(field: keyof CursoUpdateInput, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSave(form);
  }

  const fields: { key: keyof CursoUpdateInput; label: string; required?: boolean; type?: string }[] = [
    { key: 'nome', label: 'Nome', required: true },
    { key: 'plataforma', label: 'Plataforma', required: true },
    { key: 'area', label: 'Área', required: true },
    { key: 'duracao', label: 'Duração' },
    { key: 'nivel', label: 'Nível' },
    { key: 'link', label: 'Link oficial', required: true, type: 'url' }
  ];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4" role="presentation">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-6 shadow-xl" role="dialog" aria-modal="true" aria-labelledby="edit-title">
        <h2 id="edit-title" className="mb-5 text-2xl font-bold text-gray-900">Editar curso</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {fields.map((field, index) => (
            <div key={field.key}>
              <label htmlFor={`edit-${field.key}`} className="mb-1 block font-medium text-gray-900">{field.label}</label>
              <input
                ref={index === 0 ? firstInputRef : undefined}
                id={`edit-${field.key}`}
                type={field.type ?? 'text'}
                required={field.required}
                value={form[field.key]}
                onChange={(event) => updateField(field.key, event.target.value)}
                className="w-full rounded-lg border-2 border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-200"
              />
            </div>
          ))}
          <div>
            <label htmlFor="edit-descricao" className="mb-1 block font-medium text-gray-900">Descrição</label>
            <textarea id="edit-descricao" rows={5} value={form.descricao} onChange={(event) => updateField('descricao', event.target.value)} className="w-full rounded-lg border-2 border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-200" />
          </div>
          <div>
            <label htmlFor="edit-review_notes" className="mb-1 block font-medium text-gray-900">Observações da revisão</label>
            <textarea id="edit-review_notes" rows={3} value={form.review_notes} onChange={(event) => updateField('review_notes', event.target.value)} className="w-full rounded-lg border-2 border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-200" />
          </div>
          <div className="flex flex-wrap justify-end gap-3 pt-3">
            <button type="button" onClick={onCancel} className="rounded-lg bg-gray-200 px-4 py-2 text-gray-900 hover:bg-gray-300 focus:outline-none focus:ring-4 focus:ring-gray-300">Cancelar</button>
            <button type="submit" className="rounded-lg bg-blue-700 px-4 py-2 text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300">Salvar alterações</button>
          </div>
        </form>
      </div>
    </div>
  );
}
