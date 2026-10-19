import { IsInt, IsNotEmpty, IsString, Max, MaxLength, Min } from 'class-validator';

// NUEVO (Bloque 1): DTO que valida el body de POST /api/books antes de llegar al
// servicio. El pipe esta configurado con whitelist y forbidNonWhitelisted, asi que
// cualquier propiedad extra (por ejemplo "status") devuelve 400.
export class CreateBookDto {
  // Obligatorio, texto no vacio y maximo 80 (igual que la columna de la entidad).
  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  title!: string;

  // Entero entre 0 y 20. Ojo: @IsInt rechaza "2" (texto) porque el pipe no usa
  // enableImplicitConversion; no convertir los numeros del body a mano.
  @IsInt()
  @Min(0)
  @Max(20)
  availableCopies!: number;

  // Entero >= 1. Que la categoria exista lo valida BooksService.create() (404).
  @IsInt()
  @Min(1)
  categoryId!: number;
}