gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

// gsap scrollsmoother
let smoother = ScrollSmoother.create({
	wrapper: '#smooth-wrapper',
	content: '#smooth-content',
	smooth: 1,
	smoothTouch: 0.1,
	effects: true,
});

// fix for anchor links
gsap.utils.toArray('a[href^="#"]').forEach(function (button, i) {
	button.addEventListener('click', (e) => {
		var id = e.target.getAttribute('href');
		console.log(id);
		smoother.scrollTo(id, true, 'top top');
		e.preventDefault();
	});
});

// fix for loading with anchor links
window.onload = (event) => {
	console.log('page is fully loaded');

	let urlHash = window.location.href.split('#')[1];

	let scrollElem = document.querySelector('#' + urlHash);

	console.log(scrollElem, urlHash);

	if (urlHash && scrollElem) {
		gsap.to(smoother, {
			scrollTop: smoother.offset(scrollElem, 'top top'),
			duration: 1,
			delay: 0.5,
		});
	}
};

// hero timeline
const heroTL = gsap.timeline({ defaults: { duration: 1 } });
heroTL.fromTo(
	'.hero .text-container h1',
	{ y: '100%', stagger: 0.1 },
	{ y: '0%', stagger: 0.1, ease: 'power2.out' }
);
heroTL.fromTo(
	'.hero .text-container p',
	{ y: '100%', opacity: 0 },
	{ y: '0%', opacity: 1, ease: 'power2.out' },
	'-=0.5'
);
heroTL.fromTo(
	'.hero .text-container .btn',
	{ y: '100%', opacity: 0 },
	{ y: '0%', opacity: 1, ease: 'power2.out' },
	'-=0.5'
);
heroTL.from(
	'.hero .icon',
	{
		y: '50%',
		opacity: 0,
		rotation: 0,
		transformOrigin: '50% 50%',
		stagger: 0.25,
	},
	'-=0.5'
);

// gsap.fromTo('.image-grid',
//     {

//     },
//     {
//         scrollTrigger: {
//             trigger: '.image-grid',
//             start: 'middle middle',
//             end: '+=500',
//             scrub: true,
//             pin: true,
//             pinSpacing: true,
//         }
//     }
// );

// gsap scrolltrigger
// .portal element is a tiny portal with an image inside that scales up as you scroll, it needs to be pinned and then animated
gsap.fromTo(
	'.portal',
	{
		scale: 1,
		maskSize: '100% 30%',
	},
	{
		scale: 1,
		maskSize: '200vmax 200vmax',
		ease: 'none',
		scrollTrigger: {
			trigger: '.portal',
			start: 'middle middle',
			end: '+=1000',
			scrub: true,
			pin: true,
			pinSpacing: true,
		},
	}
);
gsap.fromTo(
	'.portal img',
	{
		scale: 1.5,
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
		},
	}
);
gsap.fromTo(
	'.portal .text-container',
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
		},
	}
);

// play the video on scroll
const scrollVideoContainer = document.querySelector('.scroll-video-container');
const scrollVideo = document.querySelector('.scroll-video');
if (scrollVideo) {
	let src = scrollVideo.currentSrc || scrollVideo.src;
	console.log(scrollVideo, src);

	/* Make sure the video is 'activated' on iOS */
	function once(el, event, fn, opts) {
		var onceFn = function (e) {
			el.removeEventListener(event, onceFn);
			fn.apply(this, arguments);
		};
		el.addEventListener(event, onceFn, opts);
		return onceFn;
	}

	once(document.documentElement, 'touchstart', function (e) {
		scrollVideo.play();
		scrollVideo.pause();
	});

	let tl = gsap.timeline({
		defaults: { duration: 1 },
		scrollTrigger: {
			trigger: scrollVideoContainer,
			start: 'top top',
			end: '+=1000',
			scrub: true,
			pin: true,
			pinSpacing: true,
		},
	});

	once(scrollVideo, 'loadedmetadata', () => {
		tl.fromTo(
			scrollVideo,
			{
				currentTime: 0,
			},
			{
				currentTime: scrollVideo.duration || 1,
			}
		);
	});

	setTimeout(function () {
		if (window['fetch']) {
			fetch(src)
				.then((response) => response.blob())
				.then((response) => {
					var blobURL = URL.createObjectURL(response);

					var t = scrollVideo.currentTime;
					once(document.documentElement, 'touchstart', function (e) {
						scrollVideo.play();
						scrollVideo.pause();
					});

					scrollVideo.setAttribute('src', blobURL);
					scrollVideo.currentTime = t + 0.01;
				});
		}
	}, 1000);
}

// intersection observer to check if the current section is in view and give the body a class based on data-theme
const sections = document.querySelectorAll('section');
const options = {
	root: null,
	rootMargin: '0px',
	threshold: 0.5,
};
const callback = (entries, observer) => {
	entries.forEach((entry) => {
		if (entry.isIntersecting) {
			document.body.setAttribute(
				'data-theme',
				entry.target.getAttribute('data-theme')
			);
		}
	});
};
const observer = new IntersectionObserver(callback, options);
sections.forEach((section) => {
	observer.observe(section);
});
