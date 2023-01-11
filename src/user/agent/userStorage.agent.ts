import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../models/user';
import { USER_NOT_FOUND } from '../api/err.messages';

@Injectable()
export class UserStorageAgent {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {
    console.log(this.userRepository.metadata);
  }

  async storeUser(user: User) {
    return await this.userRepository.save(user);
  }

  async findAllUsers(): Promise<User[]> {
    return await this.userRepository.find({});
  }

  async findOneUserById(id: string): Promise<User> {
    const user = await this.userRepository.findOneBy({ id });

    if (!user) {
      throw new NotFoundException(USER_NOT_FOUND);
    }

    return user;
  }

  async findOneUserByName(name: string): Promise<User> {
    const user = await this.userRepository.findOneBy({ name });

    if (!user) {
      throw new NotFoundException(USER_NOT_FOUND);
    }
    return user;
  }

  findAllUsersByValidationStatus(validated: boolean): Promise<User[]> {
    return this.userRepository.findBy({ validated });
  }

  async updateUserNameById(id: string, name: string): Promise<User> {
    const user = await this.userRepository.findOneBy({ id });

    if (!user) {
      throw new NotFoundException(USER_NOT_FOUND);
    }

    user.name = name;

    return this.userRepository.save(user);
  }

  async updateUserValidatedStatusById(
    id: string,
    validated: boolean,
  ): Promise<User> {
    const user = await this.userRepository.findOneBy({ id });

    if (!user) {
      throw new NotFoundException(USER_NOT_FOUND);
    }

    user.validated = validated;

    return await this.userRepository.save(user);
  }

  async updateUserBankStatusById(
    id: string,
    bankStatus: string,
  ): Promise<User> {
    const user = await this.userRepository.findOneBy({ id });

    if (!user) {
      throw new NotFoundException(USER_NOT_FOUND);
    }

    user.bankStatus = bankStatus;

    return await this.userRepository.save(user);
  }

  async updateUserPanStatusById(id: string, panStatus: string): Promise<User> {
    const user = await this.userRepository.findOneBy({ id });

    if (!user) {
      throw new NotFoundException(USER_NOT_FOUND);
    }

    user.panStatus = panStatus;

    return await this.userRepository.save(user);
  }

  deleteUserById(id: string) {
    return this.userRepository.delete({ id: id });
  }
}
