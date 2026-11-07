import { faker } from '@faker-js/faker';
import {
  OrangeHrmRole,
  OrangeHrmStatus,
  type AttachmentFile,
  type CreatedEmployee,
  type SystemUserRecord,
} from '../support/types';

const uniqueSuffix = (): string =>
  `${Date.now()}${faker.string.alphanumeric({ length: 8, casing: 'lower' })}`;

export function createUniqueUsername(): string {
  return `auto_${faker.string.alphanumeric({ length: 8, casing: 'lower' })}`.slice(0, 40);
}

export function createVacancyName(): string {
  return `Automation ${faker.string.alphanumeric({ length: 12, casing: 'mixed' })}`;
}

export function createStrongPassword(): string {
  return `Cy!${faker.string.alpha({ length: 5, casing: 'upper' })}${faker.string.alpha({
    length: 5,
    casing: 'lower',
  })}${faker.number.int({ min: 10, max: 99 })}`;
}

export function createEmployeePayload(): Omit<CreatedEmployee, 'empNumber' | 'displayName'> {
  const firstName = faker.person.firstName().replace(/[^A-Za-z]/g, '') || 'Auto';
  const lastName = faker.person.lastName().replace(/[^A-Za-z]/g, '') || 'Tester';

  return {
    firstName: firstName.slice(0, 30),
    lastName: lastName.slice(0, 30),
    employeeId: `A${faker.string.alphanumeric({ length: 9, casing: 'upper' })}`,
  };
}

export function createSystemUserData(employeeName: string): SystemUserRecord {
  return {
    username: createUniqueUsername(),
    password: createStrongPassword(),
    role: OrangeHrmRole.ESS,
    status: OrangeHrmStatus.Enabled,
    employeeName,
  };
}

export function createAttachmentFile(): AttachmentFile {
  const fileName = `ohrm-attachment-${uniqueSuffix()}.txt`;
  const contents = `OrangeHRM attachment fixture\nGenerated at ${new Date().toISOString()}\n${faker.lorem.paragraph()}`;
  const description = faker.lorem.sentence({ min: 6, max: 12 }).slice(0, 200);

  return {
    fileName,
    mimeType: 'text/plain',
    description,
    contents,
  };
}
