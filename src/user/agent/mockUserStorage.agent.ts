import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from '../models/user';
import { USER_NOT_FOUND } from '../api/err.messages';

@Injectable()
export class MockUserStorageAgent {
  private usersStore: User[] = [];

  async storeUser(user: User) {
    user.validated = false;
    user.bankStatus = 'Pending validation';
    user.panStatus = 'Pending validation';

    this.usersStore.push(user);

    return Promise.resolve(user);
  }

  async findAllUsers(): Promise<User[]> {
    return this.usersStore;
  }

  async findOneUserById(id: string): Promise<User> {
    const user = this.usersStore.find((user) => user.id === id);

    if (!user) {
      throw new NotFoundException(USER_NOT_FOUND);
    }

    return user;
  }

  async findOneUserByName(name: string): Promise<User> {
    const user = this.usersStore.find((user) => user.name === name);

    if (!user) {
      throw new NotFoundException(USER_NOT_FOUND);
    }

    return user;
  }

  async findAllUsersByValidationStatus(validated: boolean): Promise<User[]> {
    const users = this.usersStore.filter(
      (user) => user.validated === validated,
    );

    const usersFound = await Promise.all(users);

    if (!usersFound) {
      throw new NotFoundException(USER_NOT_FOUND);
    }

    return usersFound;
  }

  async updateUserNameById(id: string, name: string): Promise<User> {
    const userToUpdate = this.usersStore.find((user) => user.id === id);

    if (!userToUpdate) {
      throw new NotFoundException(USER_NOT_FOUND);
    }

    Object.assign(userToUpdate, { ...userToUpdate, name: name }) as User;
    return Promise.resolve(userToUpdate);
  }

  async updateUserValidatedStatusById(
    id: string,
    validated: boolean,
  ): Promise<User> {
    const userToUpdate = this.usersStore.find((user) => user.id === id);

    if (!userToUpdate) {
      throw new NotFoundException(USER_NOT_FOUND);
    }

    Object.assign(userToUpdate, {
      ...userToUpdate,
      validated: validated,
    }) as User;
    return Promise.resolve(userToUpdate);
  }

  async updateUserBankStatusById(
    id: string,
    bankStatus: string,
  ): Promise<User> {
    const userToUpdate = this.usersStore.find((user) => user.id === id);

    if (!userToUpdate) {
      throw new NotFoundException(USER_NOT_FOUND);
    }

    Object.assign(userToUpdate, {
      ...userToUpdate,
      bankStatus: bankStatus,
    }) as User;
    return Promise.resolve(userToUpdate);
  }

  async updateUserPanStatusById(id: string, panStatus: string): Promise<User> {
    const userToUpdate = this.usersStore.find((user) => user.id === id);

    if (!userToUpdate) {
      throw new NotFoundException(USER_NOT_FOUND);
    }

    Object.assign(userToUpdate, {
      ...userToUpdate,
      panStatus: panStatus,
    }) as User;
    return Promise.resolve(userToUpdate);
  }

  deleteUserById(id: string) {
    const userToDeleteIndex = this.usersStore.findIndex(
      (user) => user.id === id,
    );
    this.usersStore.splice(userToDeleteIndex, 1);
  }
}
