<script lang="ts">
import Table from './Table.svelte';
import TestColumnName from './TestColumnName.svelte';
import TestColumnAge from './TestColumnAge.svelte';
import { Column, Row } from './table';

let table: Table;
let selectedItemsNumber: number;

type Person = {
  name: string;
  age: number;
};

const people: Person[] = [
  { name: 'John', age: 57 },
  { name: 'Henry', age: 27 },
  { name: 'Charlie', age: 43 },
];

const nameCol: Column<Person> = new Column('Name', {
  width: '3fr',
  renderer: TestColumnName,
  comparator: (a, b) => a.name.localeCompare(b.name),
});

const ageCol: Column<Person> = new Column('Age', {
  align: 'right',
  renderer: TestColumnAge,
  comparator: (a, b) => a.age - b.age,
});

const columns: Column<Person>[] = [nameCol, ageCol];

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
  row="{row}">
</Table>
