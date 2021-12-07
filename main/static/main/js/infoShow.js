document.addEventListener("DOMContentLoaded", function(event) {
  const infoSymbols = document.querySelectorAll('.home .container .cform .container-information svg')  

  for (let i=0; i<17; i++) {

    infoSymbols[i].addEventListener('click', () => {

      let position = infoSymbols[i].getBoundingClientRect();
      let infoElement = document.querySelector(`.home .container .cform .container-information ul li:nth-child(${i+1})`) 

      // Style
      infoElement.style.position = "fixed"
      infoElement.style.top = `${position.top}px`
      infoElement.style.left = `${position.left + 30}px`

      let styleElement = infoElement.currentStyle ? infoElement.currentStyle.display : getComputedStyle(infoElement, null).display;

      if (styleElement === 'block')
      {
        infoElement.style.display = "none"
      } 
      else if (styleElement === 'none') 
      {
        infoElement.style.display = "block"
      }
    })
  }
})
