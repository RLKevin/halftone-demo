document.addEventListener('DOMContentLoaded', (event) => {
	gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

	// gsap scrollsmoother
	ScrollSmoother.create({
		wrapper: '#smooth-wrapper',
		content: '#smooth-content',
		smooth: 1,
		smoothTouch: 0.1,
		effects: true,
	});

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
	const scrollVideoContainer = document.querySelector(
		'.scroll-video-container'
	);
	const scrollVideo = document.querySelector('.scroll-video');
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
});
