import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';

@Injectable()
export class BlogsService {
  constructor(private databaseService: DatabaseService) {}

  async create(createBlogDto: CreateBlogDto) {
    const slug = (createBlogDto.title || '')
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .substring(0, 80) + '-' + Date.now().toString(36)

    const data = {
      id: this.databaseService.generateId(),
      title: createBlogDto.title,
      slug,
      content: createBlogDto.content,
      featured_image: createBlogDto.featuredImage || null,
      meta_description: createBlogDto.metaDescription || null,
      seo_keywords: createBlogDto.seoKeywords || null,
      category: createBlogDto.category || null,
      published: createBlogDto.published ?? false,
      created_at: this.databaseService.formatDate(new Date()),
      updated_at: this.databaseService.formatDate(new Date()),
    };

    return this.databaseService.insert('blogs', data);
  }

  async findAll(page = 1, limit = 10, published = true) {
    const offset = (page - 1) * limit;
    const publishedFilter = published ? 'published=eq.true&' : '';
    
    const [blogs, total] = await Promise.all([
      this.databaseService.select('blogs', '*', `${publishedFilter}order=created_at.desc&limit=${limit}&offset=${offset}`),
      this.databaseService.count('blogs', published ? 'published=eq.true' : ''),
    ]);

    return {
      blogs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const blogs = await this.databaseService.select('blogs', '*', `id=eq.${id}`);

    if (blogs.length === 0) {
      throw new NotFoundException('Blog not found');
    }

    return blogs[0];
  }

  async findBySlug(slug: string) {
    const blogs = await this.databaseService.select('blogs', '*', `slug=eq.${slug}&published=eq.true`);

    if (blogs.length === 0) {
      throw new NotFoundException('Blog not found');
    }

    return blogs[0];
  }

  async update(id: string, updateBlogDto: UpdateBlogDto) {
    const blogs = await this.databaseService.select('blogs', 'id', `id=eq.${id}`);
    
    if (blogs.length === 0) {
      throw new NotFoundException('Blog not found');
    }

    const updatedData: any = {
      updated_at: this.databaseService.formatDate(new Date()),
    };

    if (updateBlogDto.title !== undefined) updatedData.title = updateBlogDto.title;
    if (updateBlogDto.content !== undefined) updatedData.content = updateBlogDto.content;
    if (updateBlogDto.featuredImage !== undefined) updatedData.featured_image = updateBlogDto.featuredImage;
    if (updateBlogDto.metaDescription !== undefined) updatedData.meta_description = updateBlogDto.metaDescription;
    if (updateBlogDto.seoKeywords !== undefined) updatedData.seo_keywords = updateBlogDto.seoKeywords;
    if (updateBlogDto.category !== undefined) updatedData.category = updateBlogDto.category;
    if (updateBlogDto.published !== undefined) updatedData.published = updateBlogDto.published;

    return this.databaseService.update('blogs', updatedData, `id=eq.${id}`);
  }

  async remove(id: string) {
    const blogs = await this.databaseService.select('blogs', 'id', `id=eq.${id}`);
    
    if (blogs.length === 0) {
      throw new NotFoundException('Blog not found');
    }

    return this.databaseService.delete('blogs', `id=eq.${id}`);
  }

  async findFeatured(limit = 3) {
    return this.databaseService.select('blogs', '*', `published=eq.true&order=created_at.desc&limit=${limit}`);
  }

  async findRecent(limit = 5) {
    return this.databaseService.select('blogs', '*', `published=eq.true&order=created_at.desc&limit=${limit}`);
  }
}