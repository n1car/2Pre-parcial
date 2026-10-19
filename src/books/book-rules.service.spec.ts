import { ConflictException } from '@nestjs/common';
import { BookRulesService } from './book-rules.service';
import { BookEntity } from './entities/book.entity';
 
// NUEVO (Bloque 3, prueba 1): aqui se usa la regla REAL (sin mocks) porque no
// depende de repositorios ni de Nest; solo le pasamos un libro y comprobamos
// que rechace el prestamo con ConflictException cuando availableCopies es 0.
describe('BookRulesService', () => {
  let service: BookRulesService;

  beforeEach(() => {
    service = new BookRulesService();
  });

  it('rejects a book without available copies', () => {
    const book = { id: 3, title: 'The Little Prince', availableCopies: 0 } as BookEntity;

    // expect con funcion: la excepcion se lanza de forma sincrona dentro de ensureCanBorrow.
    expect(() => service.ensureCanBorrow(book)).toThrow(ConflictException);
  });
});
 