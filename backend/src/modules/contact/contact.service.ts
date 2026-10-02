import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';

@Injectable()
export class ContactService {
  constructor(private databaseService: DatabaseService) {}

  async create(data: { name: string; email: string; phone?: string; subject: string; message: string }) {
    const record = {
      id: this.databaseService.generateId(),
      name: data.name,
      email: data.email,
      phone: data.phone || null,
      subject: data.subject,
      message: data.message,
      status: 'UNREAD',
      created_at: this.databaseService.formatDate(new Date()),
    };
    await this.databaseService.insert('contact_queries', record);
    return { success: true, message: "Message received! We'll get back to you soon." };
  }

  async findAll() {
    return this.databaseService.select('contact_queries', '*', 'order=created_at.desc&limit=100');
  }

  async markRead(id: string) {
    await this.databaseService.update('contact_queries', { status: 'READ' }, `id=eq.${id}`);
    return { success: true };
  }

  async delete(id: string) {
    await this.databaseService.delete('contact_queries', `id=eq.${id}`);
    return { success: true };
  }
}
