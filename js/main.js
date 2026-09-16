/* ============================================
   KOGNIV — вся логика сайта
   Каждый блок защищён: ошибка в одном
   не ломает остальные функции
   ============================================ */

/* ---------- КОНФИГ ---------- */
const CONFIG = {
    // URL веб-приложения Google Apps Script.
    // Если оставить заглушку — форма отправит через WhatsApp.
    endpoint: 'https://script.google.com/macros/s/AKfycbwvLs2lD4QHb3WmHGadxmg-U5QdcJq_rLqOnOJAOd23g3aUsd1T45psKasMA7rfPwA/exec'
};

const WHATSAPP_PHONE = '79991234567';

document.addEventListener('DOMContentLoaded', () => {

    /* Вспомогалка: безопасный запуск блока кода */
    function safe(name, fn) {
        try {
            fn();
        } catch (err) {
            console.error('[Kogniv] Ошибка в блоке "' + name + '":', err);
        }
    }

    /* ============================================
       1. Прелоадер (+ аварийное скрытие через 3.5 сек)
       ============================================ */
    safe('preloader', () => {
        const preloader = document.getElementById('preloader');
        const bar = document.getElementById('preloaderBar');
        const status = document.getElementById('preloaderStatus');

        if (!preloader) return;

        let preloaderDone = false;

        function hidePreloader() {
            if (preloaderDone) return;
            preloaderDone = true;
            preloader.classList.add('preloader--hidden');
            startTypewriter();
        }

        const messages = ['ЗАГРУЗКА СИСТЕМЫ...', 'ПОДКЛЮЧЕНИЕ К СЕТИ...', 'ПОИСК МАСТЕРА...', 'ГОТОВО ✓'];
        let progress = 0;
        let msgIndex = 0;

        const loaderInterval = setInterval(() => {
            progress = Math.min(progress + Math.random() * 25 + 10, 100);
            if (bar) bar.style.width = progress + '%';

            const nextMsg = Math.floor(progress / 26);
            if (status && nextMsg > msgIndex && nextMsg < messages.length) {
                msgIndex = nextMsg;
                status.textContent = messages[msgIndex];
            }

            if (progress >= 100) {
                clearInterval(loaderInterval);
                setTimeout(hidePreloader, 400);
            }
        }, 250);

        // Страховка: даже если что-то пойдёт не так — прелоадер скроется
        setTimeout(hidePreloader, 3500);
    });

    /* ============================================
       2. Печатная машинка
       ============================================ */
    function startTypewriter() {
        const el = document.getElementById('typewriter');
        if (!el) return;
        const text = el.dataset.text || '';
        let i = 0;
        el.textContent = '';

        (function type() {
            if (i < text.length) {
                el.textContent += text[i];
                i++;
                setTimeout(type, 45);
            }
        })();
    }

    /* ============================================
       3. Анимация статистики
       ============================================ */
    safe('stats', () => {
        const statNums = document.querySelectorAll('.stat__num');

        function animateStat(el) {
            const targetVal = parseInt(el.dataset.target, 10);
            const prefix = el.dataset.prefix || '';
            const suffix = el.dataset.suffix || '';
            let v = 0;
            const step = Math.max(1, Math.round(targetVal / 40));

            const timer = setInterval(() => {
                v = Math.min(v + step, targetVal);
                el.textContent = prefix + v + suffix;
                if (v >= targetVal) clearInterval(timer);
            }, 40);
        }

        const obs = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateStat(entry.target);
                    obs.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        statNums.forEach(num => obs.observe(num));
    });

    /* ============================================
       4. Шапка при скролле
       ============================================ */
    safe('header', () => {
        const header = document.getElementById('header');
        if (!header) return;
        window.addEventListener('scroll', () => {
            header.classList.toggle('header--scrolled', window.scrollY > 50);
        }, { passive: true });
    });

    /* ============================================
       5. Мобильное меню
       ============================================ */
    safe('menu', () => {
        const burger = document.getElementById('burger');
        const nav = document.getElementById('nav');
        if (!burger || !nav) return;

        burger.addEventListener('click', () => {
            burger.classList.toggle('burger--open');
            nav.classList.toggle('nav--open');
        });

        nav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                burger.classList.remove('burger--open');
                nav.classList.remove('nav--open');
            });
        });
    });

    /* ============================================
       6. Слайдер отзывов
       ============================================ */
    safe('slider', () => {
        const track = document.getElementById('reviewsTrack');
        const prevBtn = document.getElementById('revPrev');
        const nextBtn = document.getElementById('revNext');
        const dotsWrap = document.getElementById('revDots');
        if (!track || !prevBtn || !nextBtn || !dotsWrap) return;

        const reviews = track.children;
        let slideIndex = 0;

        function visibleCount() {
            if (window.innerWidth <= 680) return 1;
            if (window.innerWidth <= 960) return 2;
            return 3;
        }

        function maxIndex() {
            return Math.max(0, reviews.length - visibleCount());
        }

        function buildDots() {
            dotsWrap.innerHTML = '';
            for (let i = 0; i <= maxIndex(); i++) {
                const dot = document.createElement('button');
                dot.className = 'reviews__dot' + (i === slideIndex ? ' reviews__dot--active' : '');
                dot.setAttribute('aria-label', 'Отзыв ' + (i + 1));
                dot.addEventListener('click', () => goTo(i));
                dotsWrap.appendChild(dot);
            }
        }

        function updateSlider() {
            slideIndex = Math.min(slideIndex, maxIndex());
            const cardWidth = reviews[0].offsetWidth + 25;
            track.style.transform = `translateX(-${slideIndex * cardWidth}px)`;
            dotsWrap.querySelectorAll('.reviews__dot').forEach((d, i) => {
                d.classList.toggle('reviews__dot--active', i === slideIndex);
            });
        }

        function goTo(i) {
            slideIndex = i;
            updateSlider();
        }

        prevBtn.addEventListener('click', () => {
            slideIndex = slideIndex > 0 ? slideIndex - 1 : maxIndex();
            updateSlider();
        });

        nextBtn.addEventListener('click', () => {
            slideIndex = slideIndex < maxIndex() ? slideIndex + 1 : 0;
            updateSlider();
        });

        window.addEventListener('resize', () => {
            buildDots();
            updateSlider();
        });

        buildDots();
    });

    /* ============================================
       7. Плавающая кнопка
       ============================================ */
    safe('floating', () => {
        const floatingCall = document.getElementById('floatingCall');
        const hero = document.getElementById('hero');
        if (!floatingCall || !hero) return;

        window.addEventListener('scroll', () => {
            const heroBottom = hero.offsetTop + hero.offsetHeight;
            const show = window.scrollY > heroBottom * 0.6;
            floatingCall.style.transform = show ? 'translateY(0)' : 'translateY(120px)';
            floatingCall.style.transition = 'transform .3s ease';
        }, { passive: true });
    });

    /* ============================================
       8. ВЫБОР ТАРИФА (делегирование на document —
          работает при любых условиях)
       ============================================ */
    safe('plan-select', () => {
        let selectedPlan = '';

        const pricingError = document.getElementById('pricingError');
        const planBox = document.getElementById('bookingPlan');
        const planValue = document.getElementById('bookingPlanValue');
        const bookingSection = document.getElementById('booking');

        // Сохраняем в глобал, чтобы форма могла прочитать тариф
        window.__kognivGetPlan = () => selectedPlan;
        window.__kognivResetPlanError = () => {
            if (pricingError) pricingError.hidden = true;
        };

        // Один слушатель на весь документ — ловит клики по карточкам
        // независимо от порядка загрузки и перерисовок
        document.addEventListener('click', (e) => {
            const card = e.target.closest('.price-card--selectable');
            if (!card) return;

            // Снимаем выделение со всех
            document.querySelectorAll('.price-card--selected').forEach(c => {
                c.classList.remove('price-card--selected');
            });

            // Выделяем выбранную
            card.classList.add('price-card--selected');
            selectedPlan = card.dataset.plan || 'Тариф';

            if (pricingError) pricingError.hidden = true;

            if (planBox && planValue) {
                planValue.textContent = selectedPlan;
                planBox.hidden = false;
            }

            // Плавный скролл к форме
            if (bookingSection) {
                setTimeout(() => {
                    bookingSection.scrollIntoView({ behavior: 'smooth' });
                }, 350);
            }
        });
    });

    /* ============================================
       9. ФОРМА ЗАПИСИ
       ============================================ */
    safe('form', () => {
        const form = document.getElementById('bookingForm');
        const statusBox = document.getElementById('bookingStatus');
        const submitBtn = document.getElementById('bookingSubmit');
        if (!form) return;

        const pricingError = document.getElementById('pricingError');
        const pricingSection = document.getElementById('pricing');

        function val(id) {
            const el = document.getElementById(id);
            return el ? el.value.trim() : '';
        }

        function showStatus(text, type) {
            if (!statusBox) return;
            statusBox.hidden = false;
            statusBox.textContent = text;
            statusBox.className = 'booking__status booking__status--' + type;
            statusBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }

        function validate(data) {
            let ok = true;
            form.querySelectorAll('.input--error').forEach(el => el.classList.remove('input--error'));

            const nameEl = document.getElementById('fName');
            const phoneEl = document.getElementById('fPhone');
            const problemEl = document.getElementById('fProblem');

            if (data.name.length < 2 && nameEl) {
                nameEl.classList.add('input--error');
                ok = false;
            }
            if (data.phone.replace(/\D/g, '').length < 10 && phoneEl) {
                phoneEl.classList.add('input--error');
                ok = false;
            }
            if (data.problem.length < 5 && problemEl) {
                problemEl.classList.add('input--error');
                ok = false;
            }
            return ok;
        }

        function whatsappFallback(data) {
            const text = 'Заявка с сайта Kogniv%0A' +
                'Тариф: ' + encodeURIComponent(data.plan) + '%0A' +
                'Имя: ' + encodeURIComponent(data.name) + '%0A' +
                'Телефон: ' + encodeURIComponent(data.phone) + '%0A' +
                'Кому помощь: ' + encodeURIComponent(data.who) + '%0A' +
                'Район: ' + encodeURIComponent(data.district) + '%0A' +
                'Проблема: ' + encodeURIComponent(data.problem) + '%0A' +
                'Время: ' + encodeURIComponent(data.time || 'любое');
            window.open('https://wa.me/' + WHATSAPP_PHONE + '?text=' + text, '_blank');
        }

        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            /* --- ПРОВЕРКА: тариф выбран? --- */
            const selectedPlan = window.__kognivGetPlan ? window.__kognivGetPlan() : '';

            if (!selectedPlan) {
                if (pricingError) {
                    pricingError.hidden = false;
                    // Перезапуск анимации дрожания
                    pricingError.style.animation = 'none';
                    void pricingError.offsetWidth;
                    pricingError.style.animation = '';
                }
                if (pricingSection) {
                    pricingSection.scrollIntoView({ behavior: 'smooth' });
                }
                return;
            }

            const data = {
                plan: selectedPlan,
                name: val('fName'),
                phone: val('fPhone'),
                who: val('fWho') || 'Не указано',
                district: val('fDistrict') || 'Лабинск',
                problem: val('fProblem'),
                time: val('fTime')
            };

            if (!validate(data)) {
                showStatus('Проверьте выделенные поля — они заполнены неверно.', 'err');
                return;
            }

            // Нет настроенного скрипта — отправляем через WhatsApp
            if (!CONFIG.endpoint || CONFIG.endpoint.includes('ТВОЙ_URL')) {
                showStatus('Заявка почти готова! Сейчас откроется WhatsApp — просто нажмите «отправить».', 'ok');
                whatsappFallback(data);
                form.reset();
                return;
            }

            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = 'ОТПРАВЛЯЕМ...';
            }
            showStatus('Отправляем...', 'ok');

            try {
                await fetch(CONFIG.endpoint, {
                    method: 'POST',
                    mode: 'no-cors',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: new URLSearchParams({
                        plan: data.plan,
                        name: data.name,
                        phone: data.phone,
                        who: data.who,
                        district: data.district,
                        problem: data.problem,
                        time: data.time,
                        source: 'сайт kogniv'
                    }).toString()
                });
                showStatus('✓ Заявка принята! Тариф: ' + data.plan + '. Перезвоним вам в течение 15 минут.', 'ok');
                form.reset();
            } catch (err) {
                console.error('[Kogniv] Ошибка отправки:', err);
                showStatus('Не получилось отправить автоматически. Сейчас откроется WhatsApp — отправьте заявку там.', 'err');
                whatsappFallback(data);
            } finally {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = 'ОТПРАВИТЬ ЗАЯВКУ <span class="btn__icon">▶</span>';
                }
            }
        });
    });

});
