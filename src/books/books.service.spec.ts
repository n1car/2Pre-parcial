import { ConflictException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CategoryEntity } from '../categories/entities/category.entity';
import { BookEntity } from './entities/book.entity';
import { BookRulesService } from './book-rules.service';
import { BooksService } from './books.service';

// NUEVO (Bloque 3, pruebas 2 y 3): pruebas unitarias aisladas.
// No se conectan a PostgreSQL: repositorios y BookRulesService se reemplazan por
// mocks de Jest. Asi podemos verificar tanto el caso exitoso como que, cuando la
// regla falla, save() NUNCA se ejecuta.
describe('BooksService', () => {
  let service: BooksService;
  let booksRepositoryMock: {
    findOne: jest.Mock;
    find: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
    merge: jest.Mock;
    remove: jest.Mock;
  };
  let categoriesRepositoryMock: { findOneBy: jest.Mock };
  let bookRulesServiceMock: { ensureCanBorrow: jest.Mock };

  beforeEach(async () => {
    // Fresh mocks keep one test's behavior from affecting another test.
    booksRepositoryMock = {
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      merge: jest.fn(),
      remove: jest.fn(),
    };
    categoriesRepositoryMock = { findOneBy: jest.fn() };
    bookRulesServiceMock = { ensureCanBorrow: jest.fn() };

    const moduleRef = await Test.createTestingModule({
      providers: [
        BooksService,
        { provide: getRepositoryToken(BookEntity), useValue: booksRepositoryMock },
        { provide: getRepositoryToken(CategoryEntity), useValue: categoriesRepositoryMock },
        { provide: BookRulesService, useValue: bookRulesServiceMock },
      ],
    }).compile();
    service = moduleRef.get(BooksService);
  });

  // Prueba 2: prestamo exitoso. Con 3 copias debe guardar 2 y devolver lo que
  // retorna save(), ademas de haber llamado a la regla antes de guardar.
  it('borrows one copy and returns the saved book', async () => {
    const book = {
      id: 7,
      title: 'Clean Code',
      availableCopies: 3,
      category: { id: 1, name: 'Technology' },
    } as BookEntity;
    const savedBook = { ...book, availableCopies: 2 } as BookEntity;

    // Arrange: findOne() del repositorio devuelve el libro y save() lo guardado.
    booksRepositoryMock.findOne.mockResolvedValue(book);
    booksRepositoryMock.save.mockResolvedValue(savedBook);

    // Act
    const result = await service.borrow(7);

    // Assert: se llamo a la regla con el libro y se guardo con una copia menos.
    expect(bookRulesServiceMock.ensureCanBorrow).toHaveBeenCalledWith(book);
    expect(booksRepositoryMock.save).toHaveBeenCalledWith(
      expect.objectContaining({ id: 7, availableCopies: 2 }),
    );
    expect(result).toEqual(savedBook);
  });

  // Prueba 3: si la regla rechaza, borrow() debe fallar sin modificar ni guardar.
  // Esta es la prueba que detecta que se guarda aunque la regla diga que no.
  it('does not change or save a book when the rule rejects borrowing', async () => {
    const book = {
      id: 9,
      title: 'The Little Prince',
      availableCopies: 0,
      category: { id: 2, name: 'Literature' },
    } as BookEntity;

    // Arrange: findOne() devuelve el libro y la regla simulada lanza la excepcion.
    booksRepositoryMock.findOne.mockResolvedValue(book);
    bookRulesServiceMock.ensureCanBorrow.mockImplementation(() => {
      throw new ConflictException('No available copies');
    });

    // Act + Assert: la promesa se rechaza con ConflictException.
    await expect(service.borrow(9)).rejects.toThrow(ConflictException);

    // Las copias siguen intactas y NUNCA se llamo a save().
    expect(book.availableCopies).toBe(0);
    expect(booksRepositoryMock.save).not.toHaveBeenCalled();
  });
});