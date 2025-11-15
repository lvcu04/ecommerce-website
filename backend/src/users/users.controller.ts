import { Controller, Get, Param, UseGuards, Request, Put, Body } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(Role.Admin)
  @Get()
  getAllUsers() {
    return this.usersService.findAll(); 
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@Request() req) {
    return this.usersService.findById(req.user.userId);
  }
  // dùng cho user thay đổi thông tin
  @UseGuards(JwtAuthGuard)
  @Put('me')
  async updateProfile(@Request() req, @Body() body: { name: string }) {
    return this.usersService.updateProfile(req.user.userId, body);
  }
  
}
