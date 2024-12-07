<script lang="ts">
import SimpleColumn from './SimpleColumn.svelte';
import { Column, Row } from './table';
import Table from './Table.svelte';

let personTable: Table;
let bookTable: Table;

type Person = {
  name: string;
};

type Book = {
  title: string;
  name?: string;
};

const persons: Person[] = [{ name: 'James' }, { name: 'John' }, { name: 'Robert' }];

const books: Book[] = [
  { title: 'Twenty Thousand Leagues Under the Seas' },
  { title: 'From the Earth to the Moon' },
  { title: 'Around the World in Eighty Days' },
  { title: 'From the Earth to the Moon' },
];

export const nameColPerson: Column<Person, string> = new Column('Name', {
  width: '3fr',
  renderMapping: obj => obj.name,
  renderer: SimpleColumn,
  comparator: (a, b) => a.name.localeCompare(b.name),
});

const columnsPerson = [nameColPerson];
const rowPerson = new Row<Person>({});

export const titleColBook: Column<Book, string> = new Column('Title', {
  width: '2fr',
  renderMapping: obj => obj.title,
  renderer: SimpleColumn,
  comparator: (a, b) => a.title.localeCompare(b.title),
});

const columnsBook = [titleColBook];
const rowBook = new Row<Book>({});
</script>

<Table
  kind="person"
  bind:this={personTable}
  data={persons}
  columns={columnsPerson}
  row={rowPerson}
  defaultSortColumn="Name">
</Table>

<Table
  kind="book"
  bind:this={bookTable}
  data={books}
  columns={columnsBook}
  row={rowBook}
  defaultSortColumn="Title">
</Table>
