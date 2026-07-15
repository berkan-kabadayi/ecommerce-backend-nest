import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { Prisma } from 'generated/prisma/browser';

interface UserUpdatePayload extends Prisma.UserUpdateInput {
  password?: string;
  fullName?: string;
}

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async register(createUserDto: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const fullName = `${createUserDto.name} ${createUserDto.surname}`;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...rest } = createUserDto;

    return this.prisma.user.create({
      data: {
        ...rest,
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

  async findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        name: true,
        surname: true,
        fullName: true,
        username: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        surname: true,
        fullName: true,
        username: true,
        email: true,
        role: true,
        refreshToken: true, // <-- HATA VERDİREN YER BURASIYDI, EKLENDİ.
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Kullanıcı bulunamadı.');
    }
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const currentUser = await this.prisma.user.findUnique({ where: { id } });
    if (!currentUser) {
      throw new NotFoundException('Kullanıcı bulunamadı.');
    }

    const dataToUpdate: UserUpdatePayload = { ...updateUserDto };

    if (updateUserDto.password) {
      dataToUpdate.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    if (updateUserDto.name || updateUserDto.surname) {
      const newName = updateUserDto.name || currentUser.name;
      const newSurname = updateUserDto.surname || currentUser.surname;
      dataToUpdate.fullName = `${newName} ${newSurname}`;
    }

    return this.prisma.user.update({
      where: { id },
      data: dataToUpdate,
      select: {
        id: true,
        name: true,
        surname: true,
        fullName: true,
        username: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async updateRefreshToken(userId: string, refreshToken: string | null) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken },
    });
  }
}
