class Mobile {
  constructor(){
    this.OnClick();
  }

  OnClick() {
    const button = document.querySelector('.home .container .button')    
    const inputs = document.querySelector('.home .container .cform')
    const exitBtn = document.querySelector('.home .container .exit')
    button.addEventListener('click', () => {
      gsap.to(button, {duration: 0.8, opacity: 0})
      gsap.to(inputs, {left: '0em', duration: 1})
    })
    exitBtn.addEventListener('click', () => {
      gsap.to(button, {duration: 0.8, opacity: 1})
      gsap.to(inputs, {left: '-30em', duration: 1})
    })
    console.log("hola")
  }
}

new Mobile()
