import { CashDto } from '../dto/cash.dto';
import { ChangeDto } from '../dto/change.dto';
import { DeleteDto } from '../dto/delete.dto';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';
import { UpdateDto } from '../dto/update.dto';
import { User } from '../entities/user.entity';
import { LoginSuccessResponse, UserResponse } from '../types/user.type';

export interface UserInterface {
  register(registerDto: RegisterDto): Promise<UserResponse<Partial<User>>>;

  login(loginDto: LoginDto): Promise<LoginSuccessResponse>;

  changeUserRole(changeDto: ChangeDto): Promise<UserResponse>;

  cash(user: User, cashDto: CashDto): Promise<UserResponse>;

  updateInfo(id: number, updateDto: UpdateDto): Promise<UserResponse<Partial<User>>>;

  deleteInfo(id: number, deleteDto: DeleteDto): Promise<UserResponse>;
}
