// src/components/UsuarioForm.tsx - Adicionado controle manual de modoAcesso para alunos (radio buttons)
import { useForm, SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Form, Button, Spinner } from "react-bootstrap";
import { useState, useEffect } from "react";
import { Person, Shield, PeopleFill } from "react-bootstrap-icons";
import { GraduationCap } from "lucide-react";

export interface Turma {
  id: string;
  nome: string;
}

export interface AlunoOption {
  id: string;
  nome: string;
  turmaId?: string;
}

type TipoUsuario = 'professores' | 'alunos' | 'responsaveis' | 'administradores';

export interface FormValues {
  tipoUsuario: TipoUsuario;
  nome: string;
  email: string;
  senha: string;
  turmaId?: string;
  turmas: string[];
  filhos: string[];
  modoAcesso: 'aluno' | 'responsavel';
}

interface UsuarioFormProps {
  turmas?: Turma[];
  alunosExistentes?: AlunoOption[];
  defaultValues?: Partial<FormValues>;
  formMode: 'add' | 'edit';
  onSubmit: SubmitHandler<FormValues>;
  onCancel?: () => void;
}

const schema = yup.object({
  tipoUsuario: yup
    .mixed<FormValues['tipoUsuario']>()
    .oneOf(["professores", "alunos", "responsaveis", "administradores"])
    .required('Tipo de usuário é obrigatório'),

  nome: yup.string().required('Nome é obrigatório').min(3, 'Mínimo 3 caracteres'),
  email: yup.string().required('E-mail é obrigatório').email('E-mail inválido'),

  senha: yup.string().when('$formMode', {
    is: 'add',
    then: s => s.required('Senha é obrigatória').min(6, 'Mínimo 6 caracteres'),
    otherwise: s => s.optional()
  }),

  turmaId: yup.string().when('tipoUsuario', {
    is: 'alunos',
    then: s => s.required('Turma obrigatória'),
    otherwise: s => s.strip()
  }),

  turmas: yup.array(yup.string().defined()).when('tipoUsuario', {
    is: 'professores',
    then: a => a.min(1, 'Selecione ao menos 1 turma'),
    otherwise: a => a.strip()
  }),

  filhos: yup.array(yup.string().defined()).when('tipoUsuario', {
    is: 'responsaveis',
    then: a => a.optional(),
    otherwise: a => a.strip()
  }),

  modoAcesso: yup.string().oneOf(['aluno', 'responsavel']).optional(),
}).required();

export default function UsuarioForm({
  turmas = [],
  alunosExistentes = [],
  defaultValues = {},
  formMode,
  onSubmit,
  onCancel,
}: UsuarioFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: yupResolver(schema),
    context: { formMode },
    defaultValues: {
      tipoUsuario: defaultValues.tipoUsuario ?? 'professores',
      nome: defaultValues.nome ?? '',
      email: defaultValues.email ?? '',
      senha: '',
      turmaId: defaultValues.turmaId,
      turmas: defaultValues.turmas ?? [],
      filhos: defaultValues.filhos ?? [],
      modoAcesso: defaultValues.modoAcesso ?? 'aluno',
    },
  });

  const tipo = watch('tipoUsuario');
  const [status, setStatus] = useState<'Ativo' | 'Inativo'>('Ativo');
  const [buscaAluno, setBuscaAluno] = useState('');

  // Inicializar status quando defaultValues mudar
  useEffect(() => {
    // Se o usuário tem status no defaultValues, usar esse valor, senão assumir "Ativo"
    const initialStatus = (defaultValues as any)?.status || 'Ativo';
    setStatus(initialStatus);
  }, [defaultValues]);

  const alunosFiltrados = alunosExistentes.filter(a =>
    a.nome.toLowerCase().includes(buscaAluno.toLowerCase())
  );

  // Wrapper para incluir o status no submit
  const handleFormSubmit = (data: any) => {
    // Adicionar o status ao objeto de dados
    const dataWithStatus = { ...data, status };
    onSubmit(dataWithStatus);
  };

  return (
    <Form noValidate onSubmit={handleSubmit(handleFormSubmit)}>
      {/* ...existing code... */}

      <Form.Group controlId="usuario-nome" className="mb-3">
        <Form.Label style={{ fontWeight: 'bold' }}>Nome</Form.Label>
        <Form.Control type="text" placeholder="Digite o nome" isInvalid={!!errors.nome} {...register('nome')} />
        <Form.Control.Feedback type="invalid">
          {errors.nome?.message}
        </Form.Control.Feedback>
      </Form.Group>


      <Form.Group controlId="usuario-email" className="mb-3">
        <Form.Label style={{ fontWeight: 'bold' }}>E‑mail</Form.Label>
        <Form.Control type="email" placeholder="Digite o e‑mail" isInvalid={!!errors.email} {...register('email')} />
        <Form.Control.Feedback type="invalid">
          {errors.email?.message}
        </Form.Control.Feedback>
      </Form.Group>

      <Form.Group controlId="usuario-tipo" className="mb-3">
        <Form.Label style={{ fontWeight: 'bold' }}>Tipo de Usuário</Form.Label>
        <div className="row g-2">
          <div className="col-12 col-md-6">
            <label
              htmlFor="tipo-professores"
              className={`w-100 p-3 border rounded-3 d-flex flex-column cursor-pointer ${tipo === 'professores' ? 'border-primary bg-primary bg-opacity-10' : 'border-light-subtle'}`}
              style={{ cursor: 'pointer', height: '100px' }}
            >
              <input
                type="radio"
                id="tipo-professores"
                value="professores"
                {...register('tipoUsuario')}
                className="d-none"
              />
              <div className="d-flex align-items-center mb-2">
                <GraduationCap size={20} className="me-2" />
                <strong>Professor</strong>
              </div>
              <small className="text-muted">Ensina disciplinas e gerencia turmas</small>
            </label>
          </div>
          <div className="col-12 col-md-6">
            <label
              htmlFor="tipo-alunos"
              className={`w-100 p-3 border rounded-3 d-flex flex-column cursor-pointer ${tipo === 'alunos' ? 'border-primary bg-primary bg-opacity-10' : 'border-light-subtle'}`}
              style={{ cursor: 'pointer', height: '100px' }}
            >
              <input
                type="radio"
                id="tipo-alunos"
                value="alunos"
                {...register('tipoUsuario')}
                className="d-none"
              />
              <div className="d-flex align-items-center mb-2">
                <Person size={20} className="me-2" />
                <strong>Aluno</strong>
              </div>
              <small className="text-muted">Frequenta aulas e atividades</small>
            </label>
          </div>
          <div className="col-12 col-md-6">
            <label
              htmlFor="tipo-administradores"
              className={`w-100 p-3 border rounded-3 d-flex flex-column cursor-pointer ${tipo === 'administradores' ? 'border-primary bg-primary bg-opacity-10' : 'border-light-subtle'}`}
              style={{ cursor: 'pointer', height: '100px' }}
            >
              <input
                type="radio"
                id="tipo-administradores"
                value="administradores"
                {...register('tipoUsuario')}
                className="d-none"
              />
              <div className="d-flex align-items-center mb-2">
                <Shield size={20} className="me-2" />
                <strong>Administrativo</strong>
              </div>
              <small className="text-muted">Gerencia o sistema e usuários</small>
            </label>
          </div>
          <div className="col-12 col-md-6">
            <label
              htmlFor="tipo-responsaveis"
              className={`w-100 p-3 border rounded-3 d-flex flex-column cursor-pointer ${tipo === 'responsaveis' ? 'border-primary bg-primary bg-opacity-10' : 'border-light-subtle'}`}
              style={{ cursor: 'pointer', height: '100px' }}
            >
              <input
                type="radio"
                id="tipo-responsaveis"
                value="responsaveis"
                {...register('tipoUsuario')}
                className="d-none"
              />
              <div className="d-flex align-items-center mb-2">
                <PeopleFill size={20} className="me-2" />
                <strong>Responsável</strong>
              </div>
              <small className="text-muted">Acompanha o desenvolvimento dos alunos</small>
            </label>
          </div>
        </div>
        {errors.tipoUsuario && (
          <div className="invalid-feedback d-block">
            {errors.tipoUsuario?.message}
          </div>
        )}
      </Form.Group>

      <Form.Group controlId="usuario-status" className="mb-3">
        {/* Status - Switch Button */}
        <div className="d-flex align-items-center mb-3 p-3 border rounded">
          <span className="me-2" style={{ fontWeight: 'bold' }}>Status:</span>
          <Form.Check
            type="switch"
            id="status-switch"
            checked={status === 'Ativo'}
            onChange={(e) => {
              const newStatus = e.target.checked ? 'Ativo' : 'Inativo';
              setStatus(newStatus);
            }}
            className="mx-2"
            style={{ transform: 'scale(1.4)' }}
          />
          <span className={status === 'Ativo' ? 'text-success fw-bold' : 'text-danger fw-bold'}>
            {status}
          </span>
        </div>
      </Form.Group>

      {tipo === 'alunos' && (
        <>
          <Form.Group controlId="usuario-turma" className="mb-3">
            <Form.Label htmlFor="usuario-turma" style={{ fontWeight: 'bold' }}>Turma</Form.Label>
            <Form.Select isInvalid={!!errors.turmaId} {...register('turmaId')}>
              <option value="">Selecione uma turma</option>
              {[...turmas].sort((a, b) => a.nome.localeCompare(b.nome)).map(t => (
                <option key={t.id} value={t.id}>{t.nome}</option>
              ))}
            </Form.Select>
            <Form.Control.Feedback type="invalid">
              {errors.turmaId?.message}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group controlId="modo-acesso" className="mb-3">
            <Form.Label style={{ fontWeight: 'bold' }}>Forma de acesso</Form.Label>
            <div>
              <Form.Check
                type="radio"
                id="acesso-aluno"
                label="O aluno terá acesso direto ao sistema"
                value="aluno"
                {...register('modoAcesso')}
                defaultChecked
              />
              <Form.Check
                type="radio"
                id="acesso-responsavel"
                label="Acesso será feito apenas pelo responsável"
                value="responsavel"
                {...register('modoAcesso')}
              />
            </div>
          </Form.Group>
        </>
      )}

      {tipo === 'professores' && (
        <Form.Group controlId="usuario-turmas" className="mb-3">
          <Form.Label style={{ fontWeight: 'bold' }}>Turmas</Form.Label>
          <div className="p-1"
            style={{
              border: '1px solid #d1d5db',
              borderRadius: 12,
            }}
          >
            <div
              className="usuarioform-turmas-checkbox"
              style={{
                padding: 12,
                maxHeight: 220,
                overflowY: 'auto',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 8,
                margin: '0 auto',
                boxSizing: 'border-box',
              }}
            >
              {[...turmas].sort((a, b) => a.nome.localeCompare(b.nome)).map(t => (
                <Form.Check
                  key={t.id}
                  type="checkbox"
                  id={`turma-${t.id}`}
                  label={t.nome}
                  value={t.id}
                  {...register('turmas')}
                />
              ))}
            </div>
          </div>
          <Form.Control.Feedback type="invalid">
            {errors.turmas?.message as string}
          </Form.Control.Feedback>
        </Form.Group>
      )}

      {tipo === 'responsaveis' && (
        <>
          <Form.Group className="mb-2">
            <Form.Label style={{ fontWeight: 'bold' }}>Buscar aluno por nome</Form.Label>
            <Form.Control
              type="text"
              placeholder="Digite o nome do aluno"
              value={buscaAluno}
              onChange={e => setBuscaAluno(e.target.value)}
            />
          </Form.Group>

          <Form.Group controlId="usuario-filhos" className="mb-3">
            <Form.Label style={{ fontWeight: 'bold' }}>Selecione os alunos (opcional)</Form.Label>
            <div style={{ maxHeight: 200, overflowY: 'auto', border: '1px solid #ccc', padding: '10px' }}>
              {alunosFiltrados.map(aluno => (
                <Form.Check
                  key={aluno.id}
                  type="checkbox"
                  label={aluno.nome}
                  value={aluno.id}
                  {...register('filhos')}
                />
              ))}
            </div>
            <Form.Control.Feedback type="invalid">
              {errors.filhos?.message as string}
            </Form.Control.Feedback>
          </Form.Group>
        </>
      )}

      <div className="d-flex justify-content-end">
        {onCancel && (
          <Button variant="secondary" className="me-2" onClick={onCancel} disabled={isSubmitting}>
            Cancelar
          </Button>
        )}
        <Button variant="primary" type="submit" disabled={isSubmitting}>
          {isSubmitting ? <Spinner size="sm" animation="border" /> : 'Salvar'}
        </Button>
      </div>
    </Form>
  );
}
















