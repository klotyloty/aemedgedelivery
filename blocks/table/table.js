import { fetchPlaceholders, getMetadata } from '../../scripts/aem.js';
const placeholders = await fetchPlaceholders(getMetadata("locale"));

const { sNo } = placeholders;

async function createTableHeader(table) {
  let tr = document.createElement("tr");
  let sno = document.createElement("th");
  sno.appendChild(document.createTextNode("Datum"));
  let name = document.createElement("th");
  name.appendChild(document.createTextNode("Name"));
  let betrag = document.createElement("th");
  betrag.appendChild(document.createTextNode("Betrag"));
  let lob = document.createElement("th");
  lob.appendChild(document.createTextNode("Lob"));
  let gesamt = document.createElement("th");
  gesamt.appendChild(document.createTextNode("Gesamt"));
  tr.append(sno, name, betrag, lob, gesamt);
  table.append(tr);
}

async function createTableRow(table, row, i) {
  let tr = document.createElement("tr");
  let datum = document.createElement("td");
  datum.appendChild(document.createTextNode(row.Datum));
  let name = document.createElement("td");
  name.appendChild(document.createTextNode(row.Name));
  let betrag = document.createElement("td");
  betrag.appendChild(document.createTextNode(row.Betrag));
  let lob = document.createElement("td");
  lob.appendChild(document.createTextNode(row.Lob));
  let gesamt = document.createElement("td");
  gesamt.appendChild(document.createTextNode(row.Gesamt));
  tr.append(datum, name, betrag, lob, gesamt);
  table.append(tr);
}

async function createNameSelect(data) {
  const uniqueNames = [...new Set(data.map(row => row.Name))];
  uniqueNames.sort(); // Namen alphabetisch sortieren

  const select = document.createElement('select');
  select.id = "name-select";
  select.name = "name";
  const allOption = document.createElement('option');
  allOption.textContent = "Alle";
  allOption.value = "all";
  select.append(allOption);

  uniqueNames.forEach(name => {
    const option = document.createElement('option');
    option.textContent = name;
    option.value = name;
    select.append(option);
  });

  const div = document.createElement('div');
  div.classList.add("name-select");
  div.append(select);
  return div;
}

async function createTable(jsonURL, filterName = "all") {
  const resp = await fetch(jsonURL);
  const json = await resp.json();
  console.log("=====JSON=====>", json);

  const table = document.createElement('table');
  createTableHeader(table);
  json.data.forEach((row, i) => {
    if (filterName === "all" || row.Name === filterName) {
      createTableRow(table, row, i + 1);
    }
  });

  return table;
}

export default async function decorate(block) {
  const dataLink = block.querySelector('a[href$=".json"]');
  const parentDiv = document.createElement('div');
  parentDiv.classList.add('data-block');

  if (dataLink) {
    const resp = await fetch(dataLink.href);
    const json = await resp.json();

    parentDiv.append(await createNameSelect(json.data));
    parentDiv.append(await createTable(dataLink.href));
    dataLink.replaceWith(parentDiv);

    const dropdown = document.getElementById('name-select');
    dropdown.addEventListener('change', async () => {
      const selectedName = dropdown.value;
      const newTable = await createTable(dataLink.href, selectedName);
      const oldTable = parentDiv.querySelector('table');
      oldTable.replaceWith(newTable);
    });
  }
}
