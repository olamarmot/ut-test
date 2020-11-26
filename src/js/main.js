const body = document.body,
	html = document.documentElement;

document.addEventListener("DOMContentLoaded", function(event) {
	//Object-fit images polyfill
	const fitImages = document.querySelectorAll('.js-fit');
	objectFitImages(fitImages, {watchMQ: true});

	//Prevent dragging img, links, buttons
	const dragPreventElements = document.querySelectorAll('img, a, button');
	dragPreventElements.forEach(element => {
		element.addEventListener('dragstart', event => {
			event.preventDefault();
		});
	});
	
	//Burger menu toggle
	const header = document.querySelector('.js-header');
	document.querySelector('.js-burger-button').addEventListener('click', function() {
		body.classList.toggle('overflow');
		header.classList.toggle('menu-open');
		this.classList.toggle('open');
	});
	
	//Lazy load
	const lazyElements = document.querySelectorAll('[data-lazy]');
	lazyElements.forEach(lazyLoad);
	
	function lazyLoad(element) {
		element.onload = () => {
			element.setAttribute('data-lazy', 'loaded');
		};
		
		if (element.dataset.srcset) {
			element.srcset = element.dataset.srcset;
			element.removeAttribute('data-srcset');
		}

		element.src = element.dataset.src;
		element.removeAttribute('data-src');
	}
});
