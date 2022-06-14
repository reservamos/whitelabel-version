/*
 * getJson makes an http request and retrieves a json
 */
var getJSON = function (url, callback) {
  var xhr = new XMLHttpRequest();
  xhr.open("GET", url, true);
  xhr.responseType = "json";
  xhr.onload = function () {
    var status = xhr.status;
    if (status === 200) {
      callback(null, xhr.response);
    } else {
      callback(status, xhr.response);
    }
  };
  xhr.send();
};

/*
 * Generates an html Table tag with data
 */
function loadToTable(id, tableData) {
  if (tableData.length <= 1) return;
  const table = document.createElement("table");
  const tableBody = document.createElement("tbody");

  tableData.forEach(function (rowData, index) {
    const row = document.createElement("tr");

    rowData.forEach(function (cellData) {
      let cell = document.createElement("td");
      if (index === 0) {
        cell = document.createElement("th");
      }
      if (cellData === "active") {
        div = cell.appendChild(document.createElement("div"));
        div.className = "active";
      } else {
        cell.appendChild(document.createTextNode(cellData));
      }
      row.appendChild(cell);
    });

    tableBody.appendChild(row);
  });

  table.appendChild(tableBody);
  container = document.createElement("div");
  container.id = id;
  container.className = "app";
  container.innerHTML = `<h1>${id}</h1><h2>Apps versions</h2>`;
  container.appendChild(table);
  document.body.appendChild(container);
}

/*
 * This function prepares data into an array readable to convert as a Table
 */
const prepareData = (data, versions) => {
  let newData = [];
  const header = ["APP", ...versions.sort()];
  newData.unshift(header);

  data.forEach(({ name, version }) => {
    const versionIndex = versions.sort().findIndex((v) => {
      return v === version;
    });

    newData.push([
      name,
      ...Array(versionIndex).fill(""),
      "active",
      ...Array(versions.length - versionIndex - 1).fill(""),
    ]);
  });

  return newData;
};

const requestVersion = async () => {
  apps.forEach(async ({ name, urls }) => {
    let versions = [];
    let data = [];

    await Promise.all(
      urls.map(async (url) => {
        /*
         * Prepares data and version
         */
        const processVersion = ({ status, body }) => {
          const { name, version } = body;
          if (!versions.find((v) => v === version)) versions.push(version);
          data.push({ name, version });
        };

        return fetch(url)
          .then((res) => res.json())
          .then(processVersion)
          .catch((error) => console.error("Fallo", error));
      })
    );
    loadToTable(name, prepareData(data, versions));
  });
};
