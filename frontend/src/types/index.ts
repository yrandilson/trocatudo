export enum UserRole {
  USER = 'user',
  MODERATOR = 'moderator',
  ADMIN = 'admin'
}

export enum ItemStatus {
  DISPONIVEL = 'disponivel',
  TROCADO = 'trocado'
}

export enum PropostaStatus {
  PENDENTE = 'pendente',
  ACEITA = 'aceita',
  RECUSADA = 'recusada'
}

export interface User {
  id: number
  nome: string
  email: string
  role: UserRole
  createdAt: string
  updatedAt: string
}

export interface Category {
  id: number;
  name: string;
  slug: string;
}

export interface Item {
  id: number
  titulo: string
  descricao: string
  category: Category
  imagens?: string[]
  status: ItemStatus
  userId: number
  user?: User
  createdAt: string
  updatedAt: string
}

export interface Proposta {
  id: number
  proponenteId: number
  proponente?: User
  itemId: number
  item?: Item
  mensagem?: string
  status: PropostaStatus
  createdAt: string
  updatedAt: string
  rating?: Rating; // Adicionado
}

export interface Rating {
    id: number;
    score: number;
    comment?: string;
    ratedByUserId: number;
    ratedByUser: User;
    createdAt: string;
}

export interface LoginCredentials {
  email: string
  senha: string
}

export interface RegisterData {
  nome: string
  email: string
  senha: string
}

export interface PaginationResponse<T> {
  items: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}