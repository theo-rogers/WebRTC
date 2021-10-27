import faker from 'faker';

export const correctEmail = 'test@test.com';
export const correctPassword = 'test';
export const userAEmail = 'testa@test.com';
export const userBEmail = 'testb@test.com';


export const menuWaitTime = 3000;
export const defaultTestTimeout = 60000;

export class User {
    firstName: string
    lastName: string
    email: string
    password: string
    constructor() {
      this.firstName = faker.name.firstName();
      this.lastName = faker.name.lastName();
      this.email = faker.internet.email();
      this.password = faker.internet.password(8, true);
    }
}

export class Meeting {
    title: string
    description: string
    start: Date
    end: Date
    constructor() {
      const date = new Date();
      this.title = faker.company.bs();
      this.description = faker.company.catchPhrase();
      this.start = faker.date.future(0);
      this.end = faker.date.future(0, this.start);
    }
}
