import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private mailerService: MailerService,
    private configService: ConfigService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    const passwordValid = await bcrypt.compare(dto.password, user.password);
    if (!passwordValid) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    const payload = { sub: user.id, email: user.email, role: user.role };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        nom: user.nom,
        email: user.email,
        role: user.role,
      },
    };
  }

  async forgotPassword(dto: ForgotPasswordDto): Promise<{ message: string }> {
  const user = await this.usersService.findByEmail(dto.email);

  const genericMessage = { message: 'Si cet email existe, un lien de réinitialisation a été envoyé.' };

  if (!user) {
    console.log('❌ Aucun utilisateur trouvé avec cet email:', dto.email);
    return genericMessage;
  }

  console.log('✅ Utilisateur trouvé:', user.email);

  const token = crypto.randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + 3600000);

  await this.usersService.setResetToken(user.id, token, expires);

  const resetUrl = `${this.configService.get('FRONTEND_URL')}/reset-password?token=${token}`;

  try {
    const result = await this.mailerService.sendMail({
      to: user.email,
      subject: 'Réinitialisation de votre mot de passe',
      html: `
        <p>Bonjour ${user.nom},</p>
        <p>Vous avez demandé la réinitialisation de votre mot de passe.</p>
        <p><a href="${resetUrl}">Cliquez ici pour réinitialiser votre mot de passe</a></p>
        <p>Ce lien expire dans 1 heure. Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.</p>
      `,
    });
    console.log('✅ Email envoyé avec succès:', result);
  } catch (error) {
    console.error('❌ ERREUR lors de l\'envoi de l\'email:', error);
  }

  return genericMessage;
}

  async resetPassword(dto: ResetPasswordDto): Promise<{ message: string }> {
    const user = await this.usersService.findByResetToken(dto.token);

    if (!user || !user.resetPasswordExpires || user.resetPasswordExpires < new Date()) {
      throw new BadRequestException('Le lien de réinitialisation est invalide ou a expiré');
    }

    const hashedPassword = await bcrypt.hash(dto.newPassword, 10);
    await this.usersService.resetPassword(user.id, hashedPassword);

    return { message: 'Mot de passe réinitialisé avec succès' };
  }
}