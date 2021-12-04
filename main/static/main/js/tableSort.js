document.addEventListener("DOMContentLoaded", function(event) {

  function tableSortByColumn(table, column, asc = true) 
  {
    const dirModifier = asc ? 1 : -1
    const tBody = table.tBodies[0]

    const rows = Array.from(tBody.querySelectorAll("tr"))

    const sortedRows = rows.sort((a, b) => {
      const aColText = a.querySelector(`td:nth-child(${ column + 1 })`).textContent.trim()
      const bColText = b.querySelector(`td:nth-child(${ column + 1 })`).textContent.trim()

      return aColText > bColText ? (1 * dirModifier) : (-1 * dirModifier)
    }) 

    while (tBody.firstChild) 
    {
      tBody.removeChild(tBody.firstChild)
    }

    tBody.append(...sortedRows)

    // Remember how de column is sorted 
    table.querySelectorAll("thead th").forEach(th => {th.classList.remove("th-sort-asc", "th-sort-desc")})
    table.querySelector(`thead th:nth-child(${column + 1})`).classList.toggle("th-srt-asc", asc)
    table.querySelector(`thead th:nth-child(${column + 1})`).classList.toggle("th-srt-desc", !asc)
  }

  document.querySelectorAll("#table-result thead th").forEach(headerCell => {
    headerCell.addEventListener("click", () => {
      const tableElement = headerCell.parentElement.parentElement.parentElement
      const headerIndex = Array.prototype.indexOf.call(headerCell.parentElement.children, headerCell)
      const currentIsAscending = headerCell.classList.contains("th-srt-asc")

      tableSortByColumn(tableElement, headerIndex, !currentIsAscending)
    })
  })


})
