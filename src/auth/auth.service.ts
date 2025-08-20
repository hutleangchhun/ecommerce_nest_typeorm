import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';

import { User } from '../common/entities/user.entity';
import { Customer } from '../common/entities/customer.entity';
import { Role } from '../common/enums/role.enum';
import { RedisService } from '../redis/redis.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  private readonly TOKEN_PREFIX = 'auth_token:';
  private readonly USER_TOKENS_PREFIX = 'user_tokens:';
  private readonly TOKEN_TTL = 8 * 60 * 60; // 8 hours in seconds

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
    private jwtService: JwtService,
    private redisService: RedisService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userRepository.findOne({
      where: { email },
      relations: ['customer'],
    });

    if (user && user.isActive && await bcrypt.compare(password, user.password)) {
      // Update last login time
      user.lastLoginAt = new Date();
      await this.userRepository.save(user);
      
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async register(registerDto: RegisterDto) {
    const existingUser = await this.userRepository.findOne({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new UnauthorizedException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    
    // Create user with role (default to customer)
    const user = this.userRepository.create({
      name: registerDto.name,
      email: registerDto.email,
      password: hashedPassword,
      phone: registerDto.phone,
      role: registerDto.role || Role.CUSTOMER,
    });

    const savedUser = await this.userRepository.save(user);

    // Create customer profile if role is customer
    if (savedUser.role === Role.CUSTOMER) {
      const customer = this.customerRepository.create({
        userId: savedUser.id,
        address: registerDto.address,
        city: registerDto.city,
        state: registerDto.state,
        zipCode: registerDto.zipCode,
        country: registerDto.country || 'USA',
      });
      await this.customerRepository.save(customer);
    }
    
    const { password, ...result } = savedUser;
    return result;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id, role: user.role };
    const token = this.jwtService.sign(payload);
    
    await this.storeTokenInRedis(token, user.id);
    
    return {
      access_token: token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }

  async logout(token: string, userId: number) {
    await this.removeTokenFromRedis(token, userId);
    return { message: 'Logged out successfully' };
  }

  async logoutAll(userId: number) {
    const userTokensKey = `${this.USER_TOKENS_PREFIX}${userId}`;
    const tokens = await this.redisService.keys(`${this.TOKEN_PREFIX}*`);
    
    for (const tokenKey of tokens) {
      const storedUserId = await this.redisService.get(tokenKey);
      if (storedUserId === userId.toString()) {
        await this.redisService.del(tokenKey);
      }
    }
    
    await this.redisService.del(userTokensKey);
    return { message: 'Logged out from all devices successfully' };
  }

  async validateToken(token: string, userId: number): Promise<boolean> {
    const tokenKey = `${this.TOKEN_PREFIX}${token}`;
    const storedUserId = await this.redisService.get(tokenKey);
    
    return storedUserId === userId.toString();
  }

  async updateTokenExpiry(token: string, userId: number) {
    const tokenKey = `${this.TOKEN_PREFIX}${token}`;
    await this.redisService.expire(tokenKey, this.TOKEN_TTL);
  }

  async findUserById(id: number): Promise<User | null> {
    const user = await this.userRepository.findOne({ 
      where: { id },
      relations: ['customer']
    });
    return user;
  }

  private async storeTokenInRedis(token: string, userId: number) {
    const tokenKey = `${this.TOKEN_PREFIX}${token}`;
    const userTokensKey = `${this.USER_TOKENS_PREFIX}${userId}`;
    
    await this.redisService.set(tokenKey, userId.toString(), this.TOKEN_TTL);
    
    const existingTokens = await this.redisService.get(userTokensKey);
    const tokens = existingTokens ? JSON.parse(existingTokens) : [];
    tokens.push(token);
    
    await this.redisService.set(userTokensKey, JSON.stringify(tokens), this.TOKEN_TTL);
  }

  private async removeTokenFromRedis(token: string, userId: number) {
    const tokenKey = `${this.TOKEN_PREFIX}${token}`;
    const userTokensKey = `${this.USER_TOKENS_PREFIX}${userId}`;
    
    await this.redisService.del(tokenKey);
    
    const existingTokens = await this.redisService.get(userTokensKey);
    if (existingTokens) {
      const tokens = JSON.parse(existingTokens);
      const updatedTokens = tokens.filter((t: string) => t !== token);
      
      if (updatedTokens.length > 0) {
        await this.redisService.set(userTokensKey, JSON.stringify(updatedTokens), this.TOKEN_TTL);
      } else {
        await this.redisService.del(userTokensKey);
      }
    }
  }
}