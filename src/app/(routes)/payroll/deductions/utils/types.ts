export interface DecductionProps {
  name: string;
  description?: string;
  type: string;
  mode: string;
  value: number | string;
  brackets?: { min: number; max: number; rate: number }[];
  is_tax: boolean;
  applies_to: string;
  is_active: boolean;
  is_editable: boolean;
}
export type Filter = {
  limit: number;
  page: number;
};
