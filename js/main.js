/* ============================================
   KOGNIV — вся логика сайта
   ============================================ */

/* ---------- КОНФИГ: сюда вставь ссылку Apps Script ---------- */
const CONFIG = {
    // URL веб-приложения Google Apps Script (см. инструкцию).
    // Пока пусто — заявки будут уходить в WhatsApp-фоллбэк.
    endpoint: ''
};

const WHATSAPP_PHONE = '79604792729';

document.addEventListener('DOMContentLoaded', () => {

    /* ---------- 1. Прелоадер ---------- */
    const preloader = document.getElementById('preloader');
    const bar = document.getElementById('preloaderBar');
    const status = document.getElementById('preloaderStatus');

    const messages = ['ЗАГРУЗКА СИСТЕМЫ...', 'ПОДКЛЮЧЕНИЕ К СЕТИ...','ГОТОВО'];
    let progress = 0;
    let msgIndex = 0;

    const loaderInterval = setInterval(() => {
        progress = Math.min(progress + Math.random() * 25 + 10, 100);
        bar.style.width = progress + '%';

        const nextMsg = Math.floor(progress / 26);
        if (nextMsg > msgIndex && nextMsg < messages.length) {
            msgIndex = nextMsg;
            status.textContent = messages[msgIndex];
        }

        if (progress >= 100) {
            clearInterval(loaderInterval);
            setTimeout(() => {
                preloader.classList.add('preloader--hidden');
                startTypewriter();
            }, 400);
        }
    }, 250);

    /* ---------- 2. Эффект печатной машинки ---------- */
    function startTypewriter() {
        const el = document.getElementById('typewriter');
        const text = el.dataset.text;
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

    /* ---------- 3. Анимация чисел в статистике ---------- */
    const statNums = document.querySelectorAll('.stat__num');
    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateStat(entry.target);
                statsObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    statNums.forEach(num => statsObserver.observe(num));

    function animateStat(el) {
        const targetVal = parseInt(el.dataset.target, 10);
        const prefix = el.dataset.prefix || '';
        const suffix = el.dataset.suffix || '';
        let val = 0;
        const step = Math.max(1, Math.round(targetVal / 40));

        const timer = setInterval(() => {
            val = Math.min(val + step, targetVal);
            el.textContent = prefix + val + suffix;
            if (val >= targetVal) clearInterval(timer);
        }, 40);
    }

    /* ---------- 4. Шапка при скролле ---------- */
    const header = document.getElementById('header');
    window.addEventListener('scroll', () => {
        header.classList.toggle('header--scrolled', window.scrollY > 50);
    }, { passive: true });

    /* ---------- 5. Мобильное меню ---------- */
    const burger = document.getElementById('burger');
    const nav = document.getElementById('nav');

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

    /* ---------- 6. Слайдер отзывов ---------- */
    const track = document.getElementById('reviewsTrack');
    const prevBtn = document.getElementById('revPrev');
    const nextBtn = document.getElementById('revNext');
    const dotsWrap = document.getElementById('revDots');
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

    /* ---------- 7. Плавающая кнопка ---------- */
    const floatingCall = document.getElementById('floatingCall');
    const hero = document.getElementById('hero');

    window.addEventListener('scroll', () => {
        const heroBottom = hero.offsetTop + hero.offsetHeight;
        const show = window.scrollY > heroBottom * 0.6;
        floatingCall.style.transform = show ? 'translateY(0)' : 'translateY(120px)';
        floatingCall.style.transition = 'transform .3s ease';
    }, { passive: true });

    /* ---------- 8. ФОРМА ЗАПИСИ ---------- */
    const form = document.getElementById('bookingForm');
    const statusBox = document.getElementById('bookingStatus');
    const submitBtn = document.getElementById('bookingSubmit');

    function showStatus(text, type) {
        statusBox.hidden = false;
        statusBox.textContent = text;
        statusBox.className = 'booking__status booking__status--' + type;
    }

    function validate(data) {
        let ok = true;
        form.querySelectorAll('.input--error').forEach(el => el.classList.remove('input--error'));

        if (data.name.trim().length < 2) {
            document.getElementById('fName').classList.add('input--error');
            ok = false;
        }
        // Простая проверка телефона: минимум 10 цифр
        if (data.phone.replace(/\D/g, '').length < 10) {
            document.getElementById('fPhone').classList.add('input--error');
            ok = false;
        }
        if (data.problem.trim().length < 5) {
            document.getElementById('fProblem').classList.add('input--error');
            ok = false;
        }
        return ok;
    }

    function whatsappFallback(data) {
        const text = `Заявка с сайта Kogniv%0A` +
            `Имя: ${encodeURIComponent(data.name)}%0A` +
            `Телефон: ${encodeURIComponent(data.phone)}%0A` +
            `Кому помощь: ${encodeURIComponent(data.who)}%0A` +
            `Район: ${encodeURIComponent(data.district)}%0A` +
            `Проблема: ${encodeURIComponent(data.problem)}%0A` +
            `Время: ${encodeURIComponent(data.time || 'любое')}`;
        window.open(`https://wa.me/${WHATSAPP_PHONE}?text=${text}`, '_blank');
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const data = {
            name: document.getElementById('fName').value,
            phone: document.getElementById('fPhone').value,
            who: document.getElementById('fWho').value,
            district: document.getElementById('fDistrict').value,
            problem: document.getElementById('fProblem').value,
            time: document.getElementById('fTime').value
        };

        if (!validate(data)) {
            showStatus('Проверьте выделенные поля — они заполнены неверно.', 'err');
            return;
        }

        // Если endpoint не настроен — сразу отправляем через WhatsApp
        if (!CONFIG.endpoint) {
            showStatus('Заявка почти готова! Сейчас откроется WhatsApp — просто нажмите «отправить».', 'ok');
            whatsappFallback(data);
            form.reset();
            return;
        }

        submitBtn.disabled = true;
        showStatus('Отправляем...', 'ok');

        try {
            // no-cors — обязательный режим для Apps Script без CORS-настройки
            await fetch(CONFIG.endpoint, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({ ...data, source: 'сайт kogniv' }).toString()
            });
            showStatus('✓ Заявка принята! Перезвоним вам в течение 15 минут.', 'ok');
            form.reset();
        } catch (err) {
            showStatus('Не получилось отправить. Откроем WhatsApp — отправьте заявку там.', 'err');
            whatsappFallback(data);
        } finally {
            submitBtn.disabled = false;
        }
    });

});