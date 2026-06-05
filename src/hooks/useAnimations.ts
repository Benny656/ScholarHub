import { useEffect } from 'react';

export function useScrollReveal() {
  useEffect(() => {
    const revealObserverOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px',
    };

    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          revealObserver.unobserve(entry.target);
        }
      });
    }, revealObserverOptions);

    document.querySelectorAll('.reveal').forEach((el) => {
      revealObserver.observe(el);
    });

    const blurRevealObserverOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px',
    };

    const blurRevealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          blurRevealObserver.unobserve(entry.target);
        }
      });
    }, blurRevealObserverOptions);

    document.querySelectorAll('.blur-reveal').forEach((el) => {
      blurRevealObserver.observe(el);
    });

    return () => {
      revealObserver.disconnect();
      blurRevealObserver.disconnect();
    };
  }, []);
}

export function useCountUp(target: number, duration: number = 2000) {
  useEffect(() => {
    const counters = document.querySelectorAll('.counter');

    const counterObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const counter = entry.target as HTMLElement;
            const dataTarget = parseInt(counter.getAttribute('data-target') || '0');
            let startTimestamp: number | null = null;

            const step = (timestamp: number) => {
              if (!startTimestamp) startTimestamp = timestamp;
              const progress = Math.min((timestamp - startTimestamp) / duration, 1);
              const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);

              counter.textContent = Math.floor(easeProgress * dataTarget).toString();

              if (progress < 1) {
                window.requestAnimationFrame(step);
              } else {
                counter.textContent = dataTarget.toString();
              }
            };

            window.requestAnimationFrame(step);
            counterObserver.unobserve(counter);
          }
        });
      },
      { threshold: 0.5 }
    );

    counters.forEach((counter) => {
      (counter as HTMLElement).textContent = '0';
      counterObserver.observe(counter);
    });

    return () => {
      counterObserver.disconnect();
    };
  }, [target, duration]);
}
