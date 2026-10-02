import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private databaseService: DatabaseService) {}

  async create(createUserDto: CreateUserDto) {
    const data = {
      id: this.databaseService.generateId(),
      ...createUserDto,
      // Store null instead of empty string to avoid unique constraint conflicts on phone
      phone: createUserDto.phone?.trim() || null,
      role: 'USER',
      created_at: this.databaseService.formatDate(new Date()),
      updated_at: this.databaseService.formatDate(new Date())
    };

    return this.databaseService.insert('users', data);
  }

  async findAll(page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    
    const [users, total] = await Promise.all([
      this.databaseService.select('users', '*', `order=created_at.desc&limit=${limit}&offset=${offset}`),
      this.databaseService.count('users'),
    ]);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const users = await this.databaseService.select('users', '*', `id=eq.${id}`);
    return users.length > 0 ? users[0] : null;
  }

  async findByEmail(email: string) {
    const users = await this.databaseService.select('users', '*', `email=eq.${email}`);
    return users.length > 0 ? users[0] : null;
  }

  async findByPhone(phone: string) {
    const users = await this.databaseService.select('users', '*', `phone=eq.${phone}`);
    return users.length > 0 ? users[0] : null;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const updatedData = {
      ...updateUserDto,
      updated_at: this.databaseService.formatDate(new Date())
    };

    return this.databaseService.update('users', updatedData, `id=eq.${id}`);
  }

  async remove(id: string) {
    return this.databaseService.delete('users', `id=eq.${id}`);
  }
}