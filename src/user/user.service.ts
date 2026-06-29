import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './create-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async register(createUserDto: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const fullName = `${createUserDto.name} ${createUserDto.surname}`;

    return this.prisma.user.create({
      data: {
        ...createUserDto,
        password: hashedPassword,
        fullName,
      },
    });
  }
  async findOneByUsername(username: string) {
    return this.prisma.user.findUnique({
      where: { username },
    });
  }
}
