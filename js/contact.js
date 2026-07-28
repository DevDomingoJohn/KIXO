const contactForm = document.getElementById("contactForm");
const formMessage = document.getElementById("formMessage");

if (contactForm) {

    contactForm.addEventListener("submit", function (e) {

        e.preventDefault();

        if (!contactForm.checkValidity()) {

            contactForm.reportValidity();
            return;

        }

        formMessage.classList.remove("d-none");

        contactForm.reset();

        setTimeout(() => {

            formMessage.classList.add("d-none");

        }, 5000);

    });

}