const tabsBtn = document.querySelectorAll(".ui-results .container-tabs button")  

let i = 0
for (let i=0; i<4; i++) {

  tabsBtn[i].addEventListener('click', () => {

    let disableShow = document.getElementsByClassName("show")
    if (disableShow[0] !== undefined)
    {
      disableShow[0].classList.remove("show")
    }

    let enableWindow = document.querySelector(`.ui-results .window-${i+1}`)
    enableWindow.classList.add("show")
  })
}

