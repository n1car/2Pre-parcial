import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryEntity } from '../categories/entities/category.entity';
import { BookEntity } from './entities/book.entity';
import { BookRulesService } from './book-rules.service';
import { BooksController } from './books.controller';
import { BooksService } from './books.service';
import { LibrarySeedService } from './library-seed.service';
 
@Module({
  imports: [TypeOrmModule.forFeature([BookEntity, CategoryEntity])],
  controllers: [BooksController],
  // NUEVO (Bloque 2): registrar BookRulesService como provider para que Nest
  // pueda inyectarlo en BooksService (no se debe instanciar con `new`).
  providers: [BooksService, BookRulesService, LibrarySeedService],
})
export class BooksModule {}
 