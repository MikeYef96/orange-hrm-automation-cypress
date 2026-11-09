export enum OrangeHrmRole {
  Admin = 'Admin',
  ESS = 'ESS',
}

export enum OrangeHrmStatus {
  Enabled = 'Enabled',
  Disabled = 'Disabled',
}

export interface InvalidPasswordCase {
  id: string;
  username: string | null;
  password: string;
  expectedAlert: string;
}

export interface SystemUserRecord {
  username: string;
  password: string;
  role: OrangeHrmRole;
  status: OrangeHrmStatus;
  employeeName: string;
}

export interface CreatedEmployee {
  empNumber: number;
  employeeId: string;
  firstName: string;
  lastName: string;
  displayName: string;
}

export interface AttachmentFile {
  fileName: string;
  mimeType: string;
  description: string;
  contents: string;
}

export interface OrangeHrmListResponse<T> {
  data: T[];
  meta?: {
    total?: number;
  };
}

export interface OrangeHrmUser {
  id: number;
  userName: string;
  empNumber?: number;
  employee?: {
    empNumber: number;
    firstName: string;
    lastName: string;
  };
}

export interface OrangeHrmEmployee {
  empNumber: number;
  firstName: string;
  lastName: string;
  employeeId?: string;
}

export interface OrangeHrmVacancy {
  id: number;
  name: string;
  status: boolean;
  jobTitle?: {
    id: number;
    title: string;
    isDeleted?: boolean;
  };
  hiringManager?: {
    id: number;
    firstName: string;
    lastName: string;
  };
}

export interface OrangeHrmJobTitle {
  id: number;
  title: string;
}

export interface OrangeHrmHiringManager {
  empNumber: number;
  firstName: string;
  lastName: string;
}

export interface OrangeHrmAttachment {
  id: number;
  filename: string;
  description: string;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      loginAsAdmin(): Chainable<'created' | 'restored' | 'recreated'>;
      login(username: string, password: string): Chainable<void>;
    }
  }
}
