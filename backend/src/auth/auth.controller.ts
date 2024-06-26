import { BadRequestException, Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  
  @Post('/login')
  async login(@Body('login') login:string, @Body('senha') senha:string ){
      return await this.authService.login(login, senha);
  }
}
