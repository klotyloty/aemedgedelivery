async function createTableHeader(table, columns) {
  let tr = document.createElement("tr");
  columns.forEach(col => {
    let th = document.createElement("th");
    th.appendChild(document.createTextNode(col));
    tr.appendChild(th);
  });
  table.appendChild(tr);
}

async function createTableRow(table, row, columns) {
  let tr = document.createElement("tr");
  columns.forEach(col => {
    let td = document.createElement("td");
    td.appendChild(document.createTextNode(row[col] || ""));
    tr.appendChild(td);
  });
  table.appendChild(tr);
}

async function createTable(jsonURL, filterValue = null, filterColumn = null) {
  const resp = await fetch(jsonURL);
  const json = await resp.json();
  console.log("=====JSON=====>", json);

  if (!json.data || json.data.length === 0) {
    return document.createTextNode("Keine Daten verfügbar");
  }

  const table = document.createElement('table');
  const columns = Object.keys(json.data[0]);

  createTableHeader(table, columns);
  json.data.forEach((row, i) => {
    if (!filterValue || (filterColumn && row[filterColumn] === filterValue)) {
      createTableRow(table, row, columns);
    }
  });

  return table;
}

async function createFilterDropdown(data, column) {
  const uniqueValues = [...new Set(data.map(row => row[column]))];
  uniqueValues.sort(); // Optional: Werte sortieren

  const select = document.createElement('select');
  select.id = `${column}-select`;
  select.name = column;

  const allOption = document.createElement('option');
  allOption.textContent = "Alle";
  allOption.value = "all";
  select.appendChild(allOption);

  uniqueValues.forEach(value => {
    const option = document.createElement('option');
    option.textContent = value;
    option.value = value;
    select.appendChild(option);
  });

  return select;
}

export default async function decorate(block) {
  const dataLink = block.querySelector('a[href$=".json"]');
  const parentDiv = document.createElement('div');
  parentDiv.classList.add('data-block');

  if (dataLink) {
    const resp = await fetch(dataLink.href);
    const json = await resp.json();

    if (json.data && json.data.length > 0) {
      const columns = Object.keys(json.data[0]);
      const filterDropdown = await createFilterDropdown(json.data, columns[2]); // Beispiel: Filter basierend auf der dritten Spalte
      parentDiv.appendChild(filterDropdown);

      let table = await createTable(dataLink.href);
      parentDiv.appendChild(table);
      dataLink.replaceWith(parentDiv);

      filterDropdown.addEventListener('change', async () => {
        const selectedValue = filterDropdown.value;
        const filterValue = selectedValue !== "all" ? selectedValue : null;
        table = await createTable(dataLink.href, filterValue, columns[2]);
        const oldTable = parentDiv.querySelector('table');
        oldTable.replaceWith(table);
      });
    } else {
      parentDiv.appendChild(document.createTextNode("Keine Daten verfügbar"));
      dataLink.replaceWith(parentDiv);
    }
  }
}
