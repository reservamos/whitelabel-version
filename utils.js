const GITHUB_TOKEN =
  "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";
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
function loadToTable({ id, tableData }) {
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
        let el = document.createTextNode(cellData);
        if (typeof cellData === "object") {
          el = document.createElement("a");
          el.href = cellData.repoUrl;
          el.setAttribute("target", "_blank");
          el.appendChild(document.createTextNode(cellData.label));
        }
        cell.appendChild(el);
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
const prepareData = (data, versions, repoUrl) => {
  let newData = [];
  const formattedVersions = versions.sort().map((v) => {
    if (!repoUrl) return v;
    return {
      label: v,
      repoUrl: `${repoUrl}/releases/tag/v${v}`,
    };
  });
  const header = ["APP", ...formattedVersions];
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

const loadChangelog = async ({ appName, versions, repoUrl }) => {
  if (!repoUrl) return;
  const changelog = document.createElement("div");
  changelog.id = `${appName}-changelog`;
  changelog.className = "changelog";
  changelog.innerHTML = `<h1>${appName} changelog</h1>`;
  for (const v of versions.sort().reverse()) {
    const version = document.createElement("div");
    version.className = "version";
    version.innerHTML = `<h2>${v}</h2>`;
    const content = document.createElement("div");
    content.className = "content";
    const url = `https://api.github.com/repos/reservamos/${appName}/releases/tags/v${v}`;

    try {
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
        },
        method: "GET",
      });
      if (response?.ok) {
        const { body } = await response.json();
        content.innerHTML = body;
      }
      const goToUrl = document.createElement("a");
      goToUrl.setAttribute("target", "_blank");
      goToUrl.href = `${repoUrl}/releases/tag/v${v}`;
      goToUrl.innerHTML = "Go to release";
      content.appendChild(goToUrl);
      changelog.appendChild(version);
      changelog.appendChild(content);
    } catch (error) {
      console.error("Error", error);
    }
  }
  document.body.appendChild(changelog);
};

const requestVersion = async () => {
  for (const { name, urls, repoUrl, appName } of apps) {
    let versions = [];
    let data = [];

    await Promise.all(
      urls.map(async (url) => {
        /*
         * Prepares data and version
         */
        const processVersion = ({ body }) => {
          const { name, version } = body;
          if (!versions.find((v) => v === version)) versions.push(version);
          data.push({ name, version });
        };

        return fetch(url)
          .then((res) => res.json())
          .then(processVersion)
          .catch((error) => console.error("Error", error));
      })
    );
    const tableData = prepareData(data, versions, repoUrl);
    await loadChangelog({ appName, versions, repoUrl });
    loadToTable({ id: name, tableData });
  }
};
