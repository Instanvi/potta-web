import axios from 'config/axios.config';
import { 
  SpendProgram, 
  FormQuestion, 
  PreSpendControls, 
  CreateSpendProgramDTO, 
  UpdateSpendProgramDTO,
  BackendFormField 
} from './types';

// GET /spend-programs - List all spend programs
export async function getSpendPrograms(): Promise<SpendProgram[]> {
  const res = await axios.get('/spend-programs');
  return res.data;
}

// GET /spend-programs/{id} - Get spend program details
export async function getSpendProgram(id: string): Promise<SpendProgram> {
  const res = await axios.get(`/spend-programs/${id}`);
  return res.data;
}

// POST /spend-programs - Create a new spend program
export async function createSpendProgram(
  payload: CreateSpendProgramDTO
): Promise<SpendProgram> {
  const res = await axios.post('/spend-programs', payload);
  return res.data;
}

// PUT /spend-programs/{id} - Update a spend program
export async function updateSpendProgram(
  id: string,
  payload: UpdateSpendProgramDTO
): Promise<SpendProgram> {
  const res = await axios.put(`/spend-programs/${id}`, payload);
  return res.data;
}

// PATCH /spend-programs/{id} - Partially update a spend program
export async function patchSpendProgram(
  id: string,
  payload: Partial<UpdateSpendProgramDTO>
): Promise<SpendProgram> {
  const res = await axios.patch(`/spend-programs/${id}`, payload);
  return res.data;
}

// DELETE /spend-programs/{id} - Delete a spend program
export async function deleteSpendProgram(id: string): Promise<void> {
  await axios.delete(`/spend-programs/${id}`);
}

// Helper function to convert frontend form questions to backend format
export function convertFormQuestionsToBackend(questions: FormQuestion[]): BackendFormField[] {
  return questions.map(question => ({
    field: question.id,
    type: question.type
  }));
}

// Helper function to convert backend form fields to frontend format
export function convertBackendToFormQuestions(fields: BackendFormField[]): FormQuestion[] {
  return fields.map(field => ({
    id: field.field,
    type: field.type as any, // You might want to add proper type mapping
    title: field.field,
    required: false,
    description: ''
  }));
}

// Legacy interface for backward compatibility
export interface CreateSpendProgramPayload {
  type: 'procurement' | 'card';
  name: string;
  description: string;
  form: FormQuestion[];
  preSpendControls: PreSpendControls;
}
