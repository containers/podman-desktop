<script lang="ts">
import Table from './Table.svelte';
import { Column, Row } from './table';
import SimpleColumn from './SimpleColumn.svelte';

let table: Table;
let selectedItemsNumber: number;

type Person = {
  id: number;
  name: string;
  age: number;
};

const people: Person[] = [
  { id: 1, name: 'John', age: 57 },
  { id: 2, name: 'Henry', age: 27 },
  { id: 3, name: 'Charlie', age: 43 },
];

const idCol: Column<Person, string> = new Column('Id', {
  align: 'right',
  renderMapping: obj => obj.id.toString(),
  renderer: SimpleColumn,
  comparator: (a, b) => a.id - b.id,
});

const nameCol: Column<Person, string> = new Column('Name', {
  width: '3fr',
  renderMapping: obj => obj.name,
  renderer: SimpleColumn,
  comparator: (a, b) => a.name.localeCompare(b.name),
});

const ageCol: Column<Person, string> = new Column('Age', {
  align: 'right',
  renderMapping: obj => obj.age.toString(),
  renderer: SimpleColumn,
  comparator: (a, b) => a.age - b.age,
  initialOrder: 'descending',
});

const columns: Column<Person, string>[] = [idCol, nameCol, ageCol];

const row = new Row<Person>({
  selectable: person => person.age < 50,
  disabledText: 'People over 50 cannot be deleted',
});
</script>

<Table
  kind="people"
  bind:this="{table}"
  bind:selectedItemsNumber="{selectedItemsNumber}"
  data="{people}"
  columns="{columns}"
  row="{row}"
  defaultSortColumn="Id">
</Table>
