import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { requestValidationPipe } from '../common/request-validation.pipe';
import { CreateBookDto } from './dto/create-book.dto';
import { FilterBooksQueryDto } from './dto/filter-books-query.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { BooksService } from './books.service';

@Controller('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Get()
  findAll() {
    return this.booksService.findAll();
  }

  // NUEVO (Bloque 1): POST /api/books.
  // El pipe valida el DTO (whitelist + forbidNonWhitelisted) y el controlador
  // solo delega en el servicio; no repite reglas de negocio.
  @Post()
  create(@Body(requestValidationPipe) dto: CreateBookDto) {
    return this.booksService.create(dto);
  }

  // Completed reference endpoint. Keep it BEFORE the dynamic GET ':id' route.
  @Get('search')
  findFiltered(@Query(requestValidationPipe) query: FilterBooksQueryDto) {
    return this.booksService.findFiltered(query);
  }

  // NUEVO (Bloque 2): PATCH /api/books/:id/borrow, sin body.
  // ParseIntPipe convierte "7" a numero y rechaza "abc" con 400.
  // Va antes de @Patch(':id') para que la ruta especifica se resuelva primero.
  @Patch(':id/borrow')
  borrow(@Param('id', ParseIntPipe) id: number) {
    return this.booksService.borrow(id);
  }

  // The existing endpoints below are completed. Do not change them.
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.booksService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body(requestValidationPipe) dto: UpdateBookDto,
  ) {
    return this.booksService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.booksService.remove(id);
  }
}