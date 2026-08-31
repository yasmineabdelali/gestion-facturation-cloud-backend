import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
   UseGuards, 
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';      // ← LIGNE AJOUTÉE
import { RolesGuard } from '../auth/guards/roles.guard';           // ← LIGNE AJOUTÉE
import { Roles } from '../auth/decorators/roles.decorator';        // ← LIGNE AJOUTÉE
import { UserRole } from './entities/user.entity';                 // ← LIGNE AJOUTÉE

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

    @UseGuards(JwtAuthGuard, RolesGuard)    // ← LIGNE AJOUTÉE
  @Roles(UserRole.ADMIN)                  // ← LIGNE AJOUTÉE
  @Get()
  findAll() {
    return this.usersService.findAll();
  }


   @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateUserDto) {
    return this.usersService.update(id, dto);
  }

    @UseGuards(JwtAuthGuard, RolesGuard)    // ← LIGNE AJOUTÉE
  @Roles(UserRole.ADMIN)                  // ← LIGNE AJOUTÉE
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.remove(id);
  }
}