// Scroll Reveal Animation

const reveals = document.querySelectorAll(
    ".reveal, .reveal-left, .reveal-right, .reveal-up"
);

const observer = new IntersectionObserver((entries)=>{

    entries.forEach(entry=>{

        if(entry.isIntersecting){

            entry.target.classList.add("active");

        }

    });

},{
    threshold:0.15
});

reveals.forEach(item=>{

    observer.observe(item);

});