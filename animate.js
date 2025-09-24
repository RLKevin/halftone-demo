document.addEventListener('DOMContentLoaded', (event) => {
	gsap.registerPlugin(
        ScrollTrigger,
		ScrollSmoother
	);

	// gsap scrollsmoother
	ScrollSmoother.create({
		wrapper: '#smooth-wrapper',
		content: '#smooth-content',
		smooth: 1,
		effects: true,
	});

    // gsap scrolltrigger
    // .portal element is a tiny portal with an image inside that scales up as you scroll, it needs to be pinned and then animated
    gsap.fromTo('.portal', 
        { 
            scale: 1,
            maskSize: '100% 30%'
        }, 
        { 
            scale: 1, 
            maskSize: '200vmax 200vmax',
            ease: 'none',
            scrollTrigger: {
                trigger: '.portal',
                start: 'top middle',
                end: '+=1000',
                scrub: 1,
                pin: true,
            }
        }
    );
    gsap.fromTo('.portal img', 
        { 
            scale: 1.1,
        }, 
        { 
            scale: 1,
            ease: 'none',
            scrollTrigger: {
                trigger: '.portal',
                start: 'top middle',
                end: '+=1000',
                scrub: true,
                // pin: true,
            }
        }
    );
    gsap.fromTo('.portal .text-container', 
        { 
            y: '500',
        }, 
        { 
            y: '0',
            ease: 'none',
            scrollTrigger: {
                trigger: '.portal',
                start: 'top middle',
                end: '+=1000',
                scrub: true,
                // pin: true,
            }
        }
    );

    // intersection observer to check if the current section is in view and give the body a class based on data-theme
    const sections = document.querySelectorAll('section');
    const options = {
        root: null,
        rootMargin: '0px',
        threshold: 0.5
    };
    const callback = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                document.body.setAttribute('data-theme', entry.target.getAttribute('data-theme'));
            }
        });
    };
    const observer = new IntersectionObserver(callback, options);
    sections.forEach(section => {
        observer.observe(section);
    });
});
