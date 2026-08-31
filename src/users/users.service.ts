import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(dto: CreateUserDto): Promise<User> {
    const existing = await this.usersRepository.findOne({ where: { email: dto.email } });
    if (existing) {
      throw new ConflictException('Un utilisateur avec cet email existe déjà');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = this.usersRepository.create({
      ...dto,
      password: hashedPassword,
    });

    return this.usersRepository.save(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

 async findOne(id: number): Promise<User> {
  const user = await this.usersRepository.findOne({ where: { id } });
  if (!user) {
    throw new NotFoundException(`Utilisateur avec l'id ${id} introuvable`);
  }
  return user;
}
    async update(id: number, dto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id); // lève NotFoundException si absent

    // Si un email est fourni, vérifier qu'il n'est pas déjà pris par un autre utilisateur
    if (dto.email && dto.email !== user.email) {
      const existing = await this.usersRepository.findOne({ where: { email: dto.email } });
      if (existing) {
        throw new ConflictException('Cet email est déjà utilisé par un autre utilisateur');
      }
    }

    // Si un nouveau mot de passe est fourni, le hasher avant de l'enregistrer
    const dataToUpdate: Partial<User> = { ...dto };
    if (dto.password) {
      dataToUpdate.password = await bcrypt.hash(dto.password, 10);
    }

    await this.usersRepository.update(id, dataToUpdate);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const user = await this.findOne(id); // lève NotFoundException si absent
    await this.usersRepository.remove(user);
  }
  async setResetToken(id: number, token: string, expires: Date): Promise<void> {
  await this.usersRepository.update(id, {
    resetPasswordToken: token,
    resetPasswordExpires: expires,
  });
}

async findByResetToken(token: string): Promise<User | null> {
  return this.usersRepository.findOne({ where: { resetPasswordToken: token } });
}

async resetPassword(id: number, hashedPassword: string): Promise<void> {
  await this.usersRepository.update(id, {
    password: hashedPassword,
    resetPasswordToken: null,
    resetPasswordExpires: null,
  });
}

}