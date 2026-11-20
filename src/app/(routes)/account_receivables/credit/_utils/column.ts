import { ColumnDef } from '@tanstack/react-table';
import { IColumnActions } from './types';

export const invoiceColumn = ({
  onDelete = () => {},
  onDetails = () => {},
  onUpdate = () => {},
}: IColumnActions<unknown>): ColumnDef<unknown>[] => [];
