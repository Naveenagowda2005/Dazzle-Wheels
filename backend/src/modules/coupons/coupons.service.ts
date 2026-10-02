import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';

@Injectable()
export class CouponsService {
  constructor(private databaseService: DatabaseService) {}

  async create(createCouponDto: CreateCouponDto) {
    // Check if coupon code already exists
    const existingCoupons = await this.databaseService.select('coupons', 'id', `code=eq.${createCouponDto.code}`);
    
    if (existingCoupons.length > 0) {
      throw new BadRequestException('Coupon code already exists');
    }

    const data = {
      id: this.databaseService.generateId(),
      ...createCouponDto,
      used_count: 0,
      created_at: this.databaseService.formatDate(new Date()),
      updated_at: this.databaseService.formatDate(new Date())
    };

    return this.databaseService.insert('coupons', data);
  }

  async findAll(page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    
    const [coupons, total] = await Promise.all([
      this.databaseService.select('coupons', '*', `order=created_at.desc&limit=${limit}&offset=${offset}`),
      this.databaseService.count('coupons'),
    ]);

    return {
      coupons,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async findActivePublic() {
    const now = new Date().toISOString();
    const today = now.split('T')[0];

    try {
      const result = await this.databaseService.select(
        'coupons',
        '*',
        `active=eq.true&valid_from=lte.${now}&valid_to=gte.${now}&order=created_at.desc&limit=10`
      );
      if (result && result.length > 0) return result;

      const result2 = await this.databaseService.select(
        'coupons',
        '*',
        `active=eq.true&valid_from=lte.${today}&valid_to=gte.${today}&order=created_at.desc&limit=10`
      );
      if (result2 && result2.length > 0) return result2;

      return this.databaseService.select(
        'coupons',
        '*',
        `active=eq.true&order=created_at.desc&limit=10`
      );
    } catch (e) {
      return this.databaseService.select(
        'coupons',
        '*',
        `active=eq.true&order=created_at.desc&limit=10`
      );
    }
  }

  async findOne(id: string) {
    const coupons = await this.databaseService.select('coupons', '*', `id=eq.${id}`);

    if (coupons.length === 0) {
      throw new NotFoundException('Coupon not found');
    }

    return coupons[0];
  }

  async validateCoupon(code: string, amount: number) {
    const coupons = await this.databaseService.select('coupons', '*', `code=eq.${code}`);

    if (coupons.length === 0) {
      throw new NotFoundException('Invalid coupon code');
    }

    const coupon = coupons[0];

    if (!coupon.active) {
      throw new BadRequestException('Coupon is not active');
    }

    const now = new Date();
    const validFrom = new Date(coupon.valid_from);
    const validTo = new Date(coupon.valid_to);
    
    if (now < validFrom || now > validTo) {
      throw new BadRequestException('Coupon has expired or not yet valid');
    }

    if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
      throw new BadRequestException('Coupon usage limit exceeded');
    }

    if (coupon.min_amount && amount < coupon.min_amount) {
      throw new BadRequestException(`Minimum amount required: ₹${coupon.min_amount}`);
    }

    let discount = 0;
    if (coupon.discount_type === 'PERCENTAGE') {
      discount = (amount * coupon.discount) / 100;
      if (coupon.max_discount && discount > coupon.max_discount) {
        discount = coupon.max_discount;
      }
    } else {
      discount = coupon.discount;
    }

    return {
      coupon,
      discount,
      finalAmount: amount - discount,
    };
  }

  async applyCoupon(code: string) {
    const coupons = await this.databaseService.select('coupons', '*', `code=eq.${code}`);

    if (coupons.length === 0) {
      throw new NotFoundException('Coupon not found');
    }

    const coupon = coupons[0];
    const updatedData = {
      used_count: coupon.used_count + 1,
      updated_at: this.databaseService.formatDate(new Date())
    };

    return this.databaseService.update('coupons', updatedData, `id=eq.${coupon.id}`);
  }

  async update(id: string, updateCouponDto: UpdateCouponDto) {
    const coupons = await this.databaseService.select('coupons', 'id', `id=eq.${id}`);
    
    if (coupons.length === 0) {
      throw new NotFoundException('Coupon not found');
    }

    const updatedData = {
      ...updateCouponDto,
      updated_at: this.databaseService.formatDate(new Date())
    };

    return this.databaseService.update('coupons', updatedData, `id=eq.${id}`);
  }

  async remove(id: string) {
    const coupons = await this.databaseService.select('coupons', 'id', `id=eq.${id}`);
    
    if (coupons.length === 0) {
      throw new NotFoundException('Coupon not found');
    }

    return this.databaseService.delete('coupons', `id=eq.${id}`);
  }
}