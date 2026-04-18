function sendEmail() {
    const templateParams = {
        name: document.querySelector('#name').value,
        email: document.querySelector('#email').value,
        message: document.querySelector('#message').value,
    };
    
    emailjs.send("service_vv4nmzn", "template_dairvfk", templateParams).then(
  (response) => {
    console.log('SUCCESS!', response.status, response.text);
  },
  (error) => {
    console.log('FAILED...', error);
  },
);
}