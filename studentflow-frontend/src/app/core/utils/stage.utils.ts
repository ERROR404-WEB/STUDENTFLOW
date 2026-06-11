export interface StageInfo {
  name: string;
  role: string;
  roleName: string;
}

export const STAGE_MAPPING: Record<string, StageInfo> = {
  'NEW_APP': {
    name: 'New Application',
    role: 'QA_OFFICER',
    roleName: 'QA Officer'
  },
  'QA_REVIEW': {
    name: 'QA Review',
    role: 'QA_OFFICER',
    roleName: 'QA Officer'
  },
  'APP_REVIEW': {
    name: 'Application Review',
    role: 'ADMISSION_OFFICER',
    roleName: 'Admission Officer'
  },
  'DECISION': {
    name: 'Decision Made',
    role: 'ADMISSION_OFFICER',
    roleName: 'Admission Officer'
  },
  'DEPOSIT': {
    name: 'Deposit Paid',
    role: 'VISA_OFFICER',
    roleName: 'Visa Officer'
  },
  'CAS_REVIEW': {
    name: 'CAS Review',
    role: 'VISA_OFFICER',
    roleName: 'Visa Officer'
  },
  'ENROLMENT': {
    name: 'Enrolment',
    role: 'ENROLMENT_OFFICER',
    roleName: 'Enrolment Officer'
  },
  'APP_REJECTED': {
    name: 'Application Rejected',
    role: '',
    roleName: 'None'
  },
  'CLOSED_LOST': {
    name: 'Closed/Lost',
    role: '',
    roleName: 'None'
  },
  'COMPLETED': {
    name: 'Completed',
    role: '',
    roleName: 'None'
  }
};

export function getStageName(stage: string): string {
  const normalized = (stage || '').toUpperCase();
  return STAGE_MAPPING[normalized]?.name || stage || '';
}

export function getStageRoleName(stage: string): string {
  const normalized = (stage || '').toUpperCase();
  return STAGE_MAPPING[normalized]?.roleName || 'None';
}

export function getStageFullDisplay(stage: string): string {
  const normalized = (stage || '').toUpperCase();
  const info = STAGE_MAPPING[normalized];
  if (!info) return stage || '';
  if (!info.role || info.roleName === 'None') return info.name;
  return `${info.name} (${info.roleName})`;
}
