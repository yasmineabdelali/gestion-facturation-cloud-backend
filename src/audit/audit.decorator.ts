import { SetMetadata } from '@nestjs/common';

export const AUDIT_KEY = 'audit_metadata';

export interface AuditMetadata {
  action: string;
  entite: string;
}

export const Audit = (action: string, entite: string) => SetMetadata(AUDIT_KEY, { action, entite });