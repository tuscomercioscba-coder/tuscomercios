async function loadSpreadsheet() {
  return import("@e965/xlsx");
}

function saveBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export async function readExcelRows(file) {
  const XLSX = await loadSpreadsheet();
  const workbook = XLSX.read(await file.arrayBuffer(), {
    type: "array",
    cellDates: true,
    dense: true,
  });
  const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
  if (!firstSheet) return [];
  return XLSX.utils.sheet_to_json(firstSheet, {
    defval: "",
    raw: false,
  });
}

export async function downloadExcel(filename, sheets) {
  const XLSX = await loadSpreadsheet();
  const workbook = XLSX.utils.book_new();

  sheets.forEach(({ name, rows }) => {
    const safeRows = Array.isArray(rows) ? rows : [];
    const worksheet =
      safeRows.length && Array.isArray(safeRows[0])
        ? XLSX.utils.aoa_to_sheet(safeRows)
        : XLSX.utils.json_to_sheet(safeRows);
    XLSX.utils.book_append_sheet(workbook, worksheet, name.slice(0, 31));
  });

  const buffer = XLSX.write(workbook, {
    bookType: "xlsx",
    type: "array",
    compression: true,
  });
  saveBlob(
    new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }),
    filename,
  );
}
