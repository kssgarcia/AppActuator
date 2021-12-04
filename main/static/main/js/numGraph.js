document.addEventListener("DOMContentLoaded", function(event) {
  const selections = document.querySelectorAll('#table-result tbody tr')
  const numberInput = document.getElementById('number-graph')
  const submitBtn = document.getElementById("submitBtn")

  selections.forEach(selection => {
    selection.addEventListener('click', () => {
      let number = selection.querySelector('td:nth-child(1)').textContent
      numberInput.value = number
      submitBtn.click()

    })

  })
})
