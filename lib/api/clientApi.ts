import type { Note } from "@/types/note";
import type { User } from "@/types/user";

import api from "./api";

interface FetchNotesParams {
  page: number;
  perPage: number;
  search?: string;
  tag?: string;
}

interface FetchNotesResponse {
  notes: Note[];
  totalPages: number;
}

interface CreateNoteParams {
  title: string;
  content: string;
  tag: Note["tag"];
}

interface RegisterRequest {
  email: string;
  password: string;
}

interface LoginRequest {
  email: string;
  password: string;
}

interface CheckSessionResponse {
  success: boolean;
}

interface UpdateUserRequest {
  username: string;
}

export async function updateMe(data: UpdateUserRequest): Promise<User> {
  const response = await api.patch<User>("/users/me", data);

  return response.data;
}

export async function fetchNotes({
  page,
  perPage,
  search,
  tag,
}: FetchNotesParams): Promise<FetchNotesResponse> {
  const response = await api.get<FetchNotesResponse>("/notes", {
    params: {
      page,
      perPage,
      search,
      tag,
    },
  });

  return response.data;
}

export async function createNote(note: CreateNoteParams): Promise<Note> {
  const response = await api.post<Note>("/notes", note);

  return response.data;
}

export async function deleteNote(id: string): Promise<Note> {
  const response = await api.delete<Note>(`/notes/${id}`);

  return response.data;
}

export async function fetchNoteById(id: string): Promise<Note> {
  const response = await api.get<Note>(`/notes/${id}`);

  return response.data;
}

export async function register(data: RegisterRequest): Promise<User> {
  const response = await api.post<User>("/auth/register", data);

  return response.data;
}

export async function login(data: LoginRequest): Promise<User> {
  const response = await api.post<User>("/auth/login", data);

  return response.data;
}

export async function checkSession(): Promise<boolean> {
  const response = await api.get<CheckSessionResponse>("/auth/session");

  return response.data.success;
}

export async function getMe(): Promise<User> {
  const response = await api.get<User>("/users/me");

  return response.data;
}

export async function logout(): Promise<void> {
  await api.post("/auth/logout");
}
