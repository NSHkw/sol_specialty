import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findByEmail(email: string, selectPassword = false): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email },
      select: selectPassword ? ['id', 'email', 'password'] : undefined,
    });
  }

  async findById(id: number, selectPassword = false): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id },
      select: selectPassword ? ['id', 'password'] : undefined,
    });
  }

  async findByNickname(nickname: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { nickname } });
  }

  async findOne(id: number): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id },
    });
  }

  async findOneWithRelations(id: number, relations: string[]): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id },
      relations: relations,
    });
  }

  async create(userData: Partial<User>): Promise<User> {
    const user = this.userRepository.create(userData);
    return this.userRepository.save(user);
  }

  async update(id: number, userData: Partial<User>): Promise<void> {
    await this.userRepository.update(id, userData);
  }

  async delete(id: number): Promise<void> {
    await this.userRepository.delete(id);
  }
}
