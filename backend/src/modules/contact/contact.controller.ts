import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ContactService } from './contact.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';

@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  // Public — anyone can submit
  @Post()
  create(@Body() body: { name: string; email: string; phone?: string; subject: string; message: string }) {
    return this.contactService.create(body);
  }

  // Admin only
  @Get()
  @UseGuards(JwtAuthGuard, AdminGuard)
  findAll() {
    return this.contactService.findAll();
  }

  @Patch(':id/read')
  @UseGuards(JwtAuthGuard, AdminGuard)
  markRead(@Param('id') id: string) {
    return this.contactService.markRead(id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  delete(@Param('id') id: string) {
    return this.contactService.delete(id);
  }
}
