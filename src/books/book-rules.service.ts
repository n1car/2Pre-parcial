import { ConflictException, Injectable } from '@nestjs/common';
import { BookEntity } from './entities/book.entity';
 
// NUEVO (Bloque 2): regla de negocio aislada. No conoce repositorios ni HTTP,
// solo decide si un libro se puede prestar. Asi BooksService queda enfocado en
// persistencia y la regla se puede probar sola (ver book-rules.service.spec.ts).
@Injectable()
export class BookRulesService {
  ensureCanBorrow(book: BookEntity): void {
    // Sin copias -> ConflictException, que Nest traduce a HTTP 409.
    if (book.availableCopies <= 0) {
      throw new ConflictException(`Book "${book.title}" has no available copies`);
    }
  }
}
 