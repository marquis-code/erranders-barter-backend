import { IsNotEmpty, IsNumber, IsString, IsOptional } from 'class-validator';

export class CreateOfferDto {
  @IsNotEmpty()
  @IsString()
  receiverId: string;

  @IsNotEmpty()
  @IsString()
  targetItemId: string;

  @IsNotEmpty()
  @IsString()
  offeredItemId: string;

  @IsOptional()
  @IsNumber()
  cashTopUp?: number;

  @IsOptional()
  @IsString()
  parentOfferId?: string;
}
