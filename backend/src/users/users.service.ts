import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { User } from './entities/user.entity';
import { Rol } from '../roles/rol.entity'; // 🔥 CAMBIO CLAVE
import { VerificationCode } from './entities/verification-code.entity';

import { RegisterUserDto } from './dto/register-user.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';

import { MailService } from '../mail/mail.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,

    @InjectRepository(Rol) // 🔥 CAMBIO CLAVE
    private rolRepository: Repository<Rol>,

    @InjectRepository(VerificationCode)
    private verificationCodeRepository: Repository<VerificationCode>,

    private mailService: MailService,
    private configService: ConfigService,
  ) {}

  async register(
    registerUserDto: RegisterUserDto,
    ip?: string,
    userAgent?: string,
  ): Promise<any> {
    // Verificar si ya existe
    const existingUser = await this.userRepository.findOne({
      where: { email: registerUserDto.email },
    });

    if (existingUser) {
      return this.handleExistingUser(existingUser);
    }

    const hashedPassword = await bcrypt.hash(registerUserDto.password, 10);

    // 🔥 USAR Rol (NO Role)
    const usuarioRole = await this.rolRepository.findOne({
      where: { nombre: 'usuario' },
    });

    if (!usuarioRole) {
      throw new BadRequestException('Rol usuario no existe');
    }

    const user = this.userRepository.create({
      nombre: registerUserDto.nombre,
      email: registerUserDto.email,
      password: hashedPassword,
      telefono: registerUserDto.telefono,
      codigoInvitacion: registerUserDto.codigoInvitacion,
      emailVerificado: false,
      activo: true,
      ipRegistro: ip,
      userAgent: userAgent,
      roles: [usuarioRole], // 🔥 Rol[]
    });

    const savedUser = await this.userRepository.save(user); // 🔥 NO ARRAY

    const verificationCode = await this.generateVerificationCode(savedUser);

    await this.mailService.sendVerificationEmail(
      savedUser.email,
      savedUser.nombre,
      verificationCode.code,
    );

    return {
      message: 'Usuario registrado correctamente',
      requiresVerification: true,
      userId: savedUser.id,
      email: savedUser.email,
      reenviosRestantes: 3,
    };
  }

  private async handleExistingUser(existingUser: User) {
    return {
      message: 'El usuario ya existe',
      email: existingUser.email,
    };
  }

  async verifyEmail(dto: VerifyEmailDto) {
    const user = await this.userRepository.findOne({
      where: { email: dto.email },
    });

    if (!user) throw new NotFoundException('Usuario no encontrado');

    const verificationCode = await this.verificationCodeRepository.findOne({
      where: {
        userId: user.id,
        code: dto.code,
        usado: false,
      },
    });

    if (!verificationCode) {
      throw new BadRequestException('Código inválido');
    }

    if (new Date() > new Date(verificationCode.expiresAt)) {
      throw new BadRequestException('Código expirado');
    }

    verificationCode.usado = true;
    await this.verificationCodeRepository.save(verificationCode);

    user.emailVerificado = true;
    await this.userRepository.save(user);

    return { message: 'Email verificado correctamente' };
  }

  private async generateVerificationCode(
    user: User,
  ): Promise<VerificationCode> {
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    const expirationMs = parseInt(
      this.configService.get<string>('VERIFICATION_CODE_EXPIRATION') ||
        '600000',
      10,
    );

    const expiresAt = new Date(Date.now() + expirationMs);

    const verificationCode = this.verificationCodeRepository.create({
      userId: user.id,
      code,
      email: user.email,
      type: 'registro',
      usado: false,
      expiresAt,
    });

    return await this.verificationCodeRepository.save(verificationCode);
  }

  async findByEmail(email: string) {
    return this.userRepository.findOne({
      where: { email },
      relations: ['roles'],
    });
  }

  async findById(id: string) {
    return this.userRepository.findOne({
      where: { id },
      relations: ['roles'],
    });
  }

  async incrementFailedAttempts(userId: string) {
    const user = await this.findById(userId);
    if (user) {
      user.intentosLoginFallidos = (user.intentosLoginFallidos || 0) + 1;
      if (user.intentosLoginFallidos >= 5) {
        user.bloqueadoHasta = new Date(Date.now() + 15 * 60 * 1000); // block for 15 mins
      }
      await this.userRepository.save(user);
    }
  }

  async updateLoginSuccess(userId: string, ip?: string, userAgent?: string) {
    const user = await this.findById(userId);
    if (user) {
      user.intentosLoginFallidos = 0;
      user.bloqueadoHasta = null;
      user.ultimoLogin = new Date();
      if (ip) user.ipRegistro = ip;
      if (userAgent) user.userAgent = userAgent;
      await this.userRepository.save(user);
    }
  }

  async resendVerificationCode(email: string) {
    const user = await this.findByEmail(email);
    if (!user) throw new NotFoundException('Usuario no encontrado');

    const verificationCode = await this.generateVerificationCode(user);
    await this.mailService.sendVerificationEmail(
      user.email,
      user.nombre,
      verificationCode.code,
    );

    return { message: 'Código de verificación reenviado correctamente' };
  }
}
