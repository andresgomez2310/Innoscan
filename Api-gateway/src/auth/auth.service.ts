import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { createClient } from '@supabase/supabase-js';
import { AuthDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  private supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

  async signUp(dto: AuthDto) {
    const { data, error } = await this.supabase.auth.signUp({
      email: dto.email,
      password: dto.password,
    });

    if (error) throw new BadRequestException(error.message);
    return { message: 'Usuario registrado. Revisa tu correo.', user: data.user };
  }

  async signIn(dto: AuthDto) {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email: dto.email,
      password: dto.password,
    });

    if (error) throw new UnauthorizedException('Credenciales inválidas');
    
    return {
      access_token: data.session.access_token,
      user_id: data.user.id,
      email: data.user.email
    };
  }
}