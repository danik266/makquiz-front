export const translations = {
  en: {
    nav: { 
      login: "Log In", 
      logout: "Log Out", 
      start: "Get Started Free",
      dashboard: "Dashboard",
      settings: "Settings",
      statistics: "Statistics",
      features: "Features",
      forTeachers: "For Teachers",
      pricing: "Pricing",
      // --- Новые ключи ---
      join: "Join Game",
      joinShort: "Join",
      enterCode: "Enter Code"
    },
    sidebar: {
      home: "Dashboard",
      myDecks: "My Library",
      catalog: "Browse",
      search: "Search",
      stats: "Analytics",
      create: "Create",
      logout: "Sign Out",
      languageToggle: "Language"
    },
    hero: {
      badge: "AI-Powered Learning Platform",
      titleStart: "Stop",
      titleStrike: "memorizing",
      titleEnd: "Start",
      titleHighlight: "understanding",
      subtitle: "Transform any material into interactive flashcards and quizzes in seconds. The smartest way to ace your exams.",
      btnPrimary: "Start Learning Free",
      btnSecondary: "Watch Demo",
      stats: {
        students: "Active Students",
        cards: "Cards Created",
        accuracy: "Avg. Retention"
      }
    },
    comparison: {
      title: "Why students love us",
      subtitle: "See the difference",
      old: {
        title: "Traditional Learning",
        points: [
          "Hours spent creating flashcards manually",
          "Boring, static content that doesn't engage",
          "No way to track what you've actually learned",
          "Generic study materials from random sources"
        ]
      },
      new: {
        title: "Learning with Makquiz",
        points: [
          "AI generates perfect cards in seconds",
          "Gamified experience that keeps you hooked",
          "Smart analytics show your real progress",
          "Personalized content from YOUR materials"
        ]
      }
    },
    workflow: {
      title: "Your learning",
      highlight: "superpower",
      subtitle: "From chaos to clarity in 4 simple steps",
      step1: { title: "Upload", desc: "Drop any PDF, Word doc, or paste your notes. We handle 50+ formats." },
      step2: { title: "AI Magic", desc: "Our AI extracts key concepts and creates perfect study materials." },
      step3: { title: "Study Smart", desc: "Interactive flashcards and quizzes adapt to your pace." },
      step4: { title: "Master It", desc: "Spaced repetition ensures you remember forever." },
      cta: "Start Now"
    },
    features: {
      badge: "Why Makquiz?",
      title: "Everything you need to succeed",
      subtitle: "Powerful tools designed by students, for students",
      analysis: { 
        badge: "Core Technology",
        title: "AI that actually understands", 
        desc: "Not just keywords. Our AI comprehends context, relationships, and importance to create study materials that make sense." 
      },
      mobile: { 
        title: "Study anywhere", 
        desc: "Native mobile apps for iOS and Android. Offline mode included." 
      },
      teachers: { 
        title: "Teacher dashboard", 
        desc: "Create classes, assign decks, track student progress in real-time." 
      },
      files: { 
        title: "Magic file import", 
        desc: "PDF, DOCX, PPTX, images, even handwritten notes. We extract knowledge from anything." 
      },
      spaced: {
        title: "Spaced repetition",
        desc: "Science-backed algorithm optimizes review timing for maximum retention."
      },
      quiz: {
        title: "Quiz mode",
        desc: "Test yourself with auto-generated quizzes. Multiple choice, true/false, and more."
      }
    },
    teachers_section: {
      badge: "For Educators",
      title: "Teach smarter, not harder",
      desc: "Makquiz gives teachers superpowers. Create engaging content in minutes, track student mastery in real-time, and finally have time to focus on what matters — teaching.",
      points: [
        { title: "One-click assignments", desc: "Share decks with a code. Students join instantly." },
        { title: "Live progress tracking", desc: "See who's studying and who's struggling." },
        { title: "AI content generation", desc: "Turn your lesson plans into study materials automatically." }
      ],
      cta: "Start Teaching"
    },
    pricing: {
      badge: "Simple Pricing",
      title: "Choose your path",
      subtitle: "Plans tailored for your needs",
      toggles: {
        students: "For Students",
        teachers: "For Teachers"
      },
      studentPlans: [
        { 
          name: "Free", 
          price: "0₸", 
          period: "/forever",
          cta: "Start", 
          desc: "Perfect for starting",
          features: ["Create 5 materials", "15 cards per deck", "3 generations per day"],
          popular: false
        },
        { 
          name: "Pro", 
          price: "2500₸", 
          period: "/month",
          cta: "Get Pro", 
          desc: "For serious study",
          features: ["Unlimited creation", "Up to 500 cards", "Unlimited generation"],
          popular: true
        }
      ],
      teacherPlans: [
        { 
          name: "Free", 
          price: "0₸", 
          period: "/month", 
          cta: "Start", 
          desc: "For tutors and classes",
          features: ["Up to 15 students per session", "4 sessions per day", "Create 5 materials", "15 cards per deck", "3 generations per day"],
          popular: false
        },
        { 
          name: "Teacher PRO", 
          price: "2500₸", 
          period: "/month", 
          cta: "Get Teacher PRO", 
          desc: "For all educational institutions", 
          features: ["Unlimited students", "Unlimited sessions", "Custom branding", "Unlimited creation", "Up to 500 cards", "Unlimited generation"],
          popular: true
        }
      ]
    },
    testimonials: {
      badge: "Loved by Students",
      title: "Join 50,000+ learners",
      items: [
        { name: "Sarah K.", role: "Medical Student", text: "Makquiz cut my study time in half. I passed my boards on the first try!" },
        { name: "Alex M.", role: "Law Student", text: "The AI-generated cards are incredibly accurate. It's like having a tutor 24/7." },
        { name: "Prof. Chen", role: "University Teacher", text: "My students are more engaged than ever. The analytics help me teach better." }
      ]
    },
    cta: {
      title: "Ready to learn smarter?",
      subtitle: "Join thousands of students who've already transformed their study habits.",
      button: "Start Learning Free",
      note: "No credit card required"
    },
    dashboard: {
      greeting: "Hi",
      ready: "Ready to boost your knowledge today?",
      activeTitle: "Due for Review",
      doneTitle: "Completed",
      createFirst: "Start learning. Create your first deck!",
      dueCount: "cards due",
      mastered: "Mastered",
      doneToday: "Done",
      today: "Today",
      cards: "cards",
      masteryLevel: "Mastery",
      planDone: "Daily plan completed",
      empty: {
        title: "No decks yet",
        subtitle: "Create your first deck with AI or manually",
        action: "Create Deck"
      }
    },
    create: {
      title: "Create Deck with AI",
      subtitle: "Upload materials or paste text, AI will handle the rest",
      modeSelect: { file: "File", text: "Text", topic: "Topic" },
      uploadZone: { title: "Drop file here", subtitle: "or click to select" },
      orDivider: "OR",
      textInput: { label: "Paste text manually", placeholder: "Paste here...", counter: "characters" },
      topicInput: { label: "Topic", placeholder: "e.g. Quantum Physics" },
      cardCount: "Number of cards",
      generateButton: "Generate",
      preview: {
        title: "Review Cards",
        subtitle: "AI created {count} cards",
        deckName: "Deck Name",
        deckDescription: "Description",
        saveButton: "Save Deck",
        addCard: "Add Card"
      }
    },
    study: {
      loading: "Preparing cards...",
      exit: "Exit",
      allDone: "All done!",
      allDoneSubtitle: "No cards left for today.",
      flipHint: "Think of the answer, then flip",
      buttons: { incorrect: "Forgot", notSure: "Vague", correct: "Know" },
      results: {
        title: "Session Complete!",
        subtitle: "You reviewed {count} cards",
        accuracy: "Accuracy",
        actions: { tryAgain: "Study Again", backToDecks: "Dashboard", reset: "Reset Progress" }
      }
    },
    history: {
      title: "Statistics",
      today: "Today",
      week: "Weekly Progress",
      sessionsHistory: "Session History"
    },
    footer: {
      rights: "© 2026 Makquiz Inc. All rights reserved.",
      tagline: "Learn smarter, not harder.",
      product: "Product",
      company: "Company",
      legal: "Legal",
      links: { 
        features: "Features",
        pricing: "Pricing",
        mobile: "Mobile App",
        about: "About Us",
        careers: "Careers",
        blog: "Blog",
        privacy: "Privacy Policy", 
        terms: "Terms of Service", 
        contact: "Contact" 
      }
    },
    general: {
      loading: "Loading...",
      save: "Save",
      delete: "Delete",
      back: "Back",
      confirm: "Are you sure?"
    }
  },
  ru: {
    nav: { 
      login: "Войти", 
      logout: "Выйти", 
      start: "Начать бесплатно",
      dashboard: "Главная",
      settings: "Настройки",
      statistics: "Статистика",
      features: "Возможности",
      forTeachers: "Учителям",
      pricing: "Цены",
      // --- Новые ключи ---
      join: "Присоединиться",
      joinShort: "В игру", // Короткая версия для мобильной шапки
      enterCode: "Ввести код"
    },
    sidebar: {
      home: "Главная",
      myDecks: "Мои наборы",
      catalog: "Каталог",
      search: "Поиск",
      stats: "Статистика",
      create: "Создать",
      logout: "Выйти",
      languageToggle: "Язык"
    },
    hero: {
      badge: "AI-платформа для обучения",
      titleStart: "Хватит",
      titleStrike: "зубрить",
      titleEnd: "Начни",
      titleHighlight: "понимать",
      subtitle: "Превращай любые материалы в интерактивные карточки и тесты за секунды. Самый умный способ сдать экзамены.",
      btnPrimary: "Начать бесплатно",
      btnSecondary: "Смотреть демо",
      stats: {
        students: "Активных студентов",
        cards: "Карточек создано",
        accuracy: "Запоминание"
      }
    },
    comparison: {
      title: "Почему нас любят студенты",
      subtitle: "Почувствуй разницу",
      old: {
        title: "Традиционное обучение",
        points: [
          "Часы на создание карточек вручную",
          "Скучный статичный контент",
          "Невозможно понять, что реально выучил",
          "Чужие материалы из случайных источников"
        ]
      },
      new: {
        title: "Обучение с Makquiz",
        points: [
          "AI создаёт карточки за секунды",
          "Геймификация, которая затягивает",
          "Умная аналитика показывает реальный прогресс",
          "Персональный контент из ТВОИХ материалов"
        ]
      }
    },
    workflow: {
      title: "Твоя учебная",
      highlight: "суперсила",
      subtitle: "От хаоса к знаниям за 4 простых шага",
      step1: { title: "Загрузи", desc: "Кинь PDF, Word или просто вставь заметки. Поддерживаем 50+ форматов." },
      step2: { title: "AI магия", desc: "Наш AI извлекает ключевые концепции и создаёт идеальные материалы." },
      step3: { title: "Учи умно", desc: "Интерактивные карточки и тесты адаптируются под твой темп." },
      step4: { title: "Запомни", desc: "Интервальное повторение гарантирует, что запомнишь навсегда." },
      cta: "Начать"
    },
    features: {
      badge: "Почему Makquiz?",
      title: "Всё для твоего успеха",
      subtitle: "Мощные инструменты от студентов для студентов",
      analysis: { 
        badge: "Ключевая технология",
        title: "AI, который реально понимает", 
        desc: "Не просто ключевые слова. Наш AI понимает контекст, связи и важность, создавая материалы, которые имеют смысл." 
      },
      mobile: { 
        title: "Учись где угодно", 
        desc: "Нативные приложения для iOS и Android. Офлайн режим включён." 
      },
      teachers: { 
        title: "Панель учителя", 
        desc: "Создавай классы, назначай колоды, следи за прогрессом в реальном времени." 
      },
      files: { 
        title: "Магический импорт", 
        desc: "PDF, DOCX, PPTX, фото, даже рукописные заметки. Извлекаем знания из чего угодно." 
      },
      spaced: {
        title: "Интервальное повторение",
        desc: "Научно обоснованный алгоритм оптимизирует время повторений."
      },
      quiz: {
        title: "Режим тестов",
        desc: "Проверяй себя автоматически сгенерированными тестами."
      }
    },
    teachers_section: {
      badge: "Для учителей",
      title: "Учите умнее, а не больше",
      desc: "Makquiz даёт учителям суперсилы. Создавайте контент за минуты, следите за успехами в реальном времени и наконец найдите время на главное — обучение.",
      points: [
        { title: "Назначение в один клик", desc: "Поделитесь колодой по коду. Ученики присоединяются мгновенно." },
        { title: "Живой мониторинг", desc: "Видьте, кто учится, а кто отстаёт." },
        { title: "AI генерация контента", desc: "Превращайте планы уроков в учебные материалы автоматически." }
      ],
      cta: "Начать преподавать"
    },
    pricing: {
      badge: "Простые цены",
      title: "Выберите свой путь",
      subtitle: "Тарифы, подобранные под ваши задачи",
      toggles: {
        students: "Студентам",
        teachers: "Учителям"
      },
      studentPlans: [
        { 
          name: "Бесплатный", 
          price: "0₸", 
          period: "/навсегда",
          cta: "Начать", 
          desc: "Идеально для старта",
          features: ["Создание 5 материалов", "15 карточек в колоде", "3 генерации в день"],
          popular: false
        },
        { 
          name: "Pro", 
          price: "2500₸", 
          period: "/месяц",
          cta: "Купить Pro", 
          desc: "Для серьёзной учёбы",
          features: ["Безлимитное создание", "До 500 карточек", "Неограниченная генерация"],
          popular: true
        }
      ],
      teacherPlans: [
        { 
          name: "Бесплатный", 
          price: "0₸", 
          period: "/месяц", 
          cta: "Начать", 
          desc: "Для репетиторов и классов",
          features: ["До 15 учеников в сессии","4 сессий в день", "Создание 5 материалов", "15 карточек в колоде", "3 генерации в день"],
          popular: false
        },
        { 
          name: "Учитель PRO", 
          price: "2500₸", 
          period: "/месяц", 
          cta: "Купить Учитель PRO", 
          desc: "Для всех учебных заведений", 
          features: ["Безлимитное количество учеников", "Безлимитные сессии", "Свой брендинг","Безлимитное создание", "До 500 карточек", "Неограниченная генерация"],
          popular: true
        }
      ]
    },
    testimonials: {
      badge: "Нас любят студенты",
      title: "Присоединяйся к 50,000+ учеников",
      items: [
        { name: "Сара К.", role: "Студент-медик", text: "Makquiz сократил моё время учёбы вдвое. Сдала экзамены с первого раза!" },
        { name: "Алекс М.", role: "Студент-юрист", text: "AI-карточки невероятно точные. Как будто репетитор 24/7." },
        { name: "Проф. Ким", role: "Преподаватель", text: "Мои студенты вовлечены как никогда. Аналитика помогает учить лучше." }
      ]
    },
    cta: {
      title: "Готов учиться умнее?",
      subtitle: "Присоединяйся к тысячам студентов, которые уже изменили свои привычки учёбы.",
      button: "Начать бесплатно",
      note: "Карта не нужна"
    },
    dashboard: {
      greeting: "Привет",
      ready: "Готов прокачать свои знания сегодня?",
      activeTitle: "К повторению",
      doneTitle: "Выполнено",
      createFirst: "Начните обучение. Создайте свою первую колоду!",
      dueCount: "к изучению",
      mastered: "Мастер",
      doneToday: "Готово",
      today: "Сегодня",
      cards: "карт",
      masteryLevel: "Усвоение",
      planDone: "План на сегодня выполнен",
      empty: {
        title: "Колод пока нет",
        subtitle: "Создайте первую колоду с AI или вручную",
        action: "Создать колоду"
      }
    },
    create: {
      title: "Создать колоду через AI",
      subtitle: "Загрузите материал или вставьте текст, остальное сделает нейросеть",
      modeSelect: { file: "Файл", text: "Текст", topic: "Тема" },
      uploadZone: { title: "Перетащите файл сюда", subtitle: "или нажмите для выбора" },
      orDivider: "ИЛИ",
      textInput: { label: "Вставьте текст вручную", placeholder: "Вставьте текст здесь...", counter: "символов" },
      topicInput: { label: "Тема", placeholder: "Напр: Квантовая физика" },
      cardCount: "Количество карточек",
      generateButton: "Сгенерировать",
      preview: {
        title: "Проверка карточек",
        subtitle: "AI создал {count} карточек",
        deckName: "Название колоды",
        deckDescription: "Описание",
        saveButton: "Сохранить колоду",
        addCard: "Добавить карточку"
      }
    },
    study: {
      loading: "Подбираем карточки...",
      exit: "Выход",
      allDone: "На сегодня всё!",
      allDoneSubtitle: "В этой колоде больше нет карт на сегодня.",
      flipHint: "Подумайте над ответом, затем переверните",
      buttons: { incorrect: "Забыл", notSure: "Смутно", correct: "Знаю" },
      results: {
        title: "Сессия завершена!",
        subtitle: "Вы прошли {count} карточек",
        accuracy: "Точность",
        actions: { tryAgain: "Учить еще", backToDecks: "В дашборд", reset: "Сбросить прогресс" }
      }
    },
    history: {
      title: "Моя статистика",
      today: "Сегодня",
      week: "За неделю",
      sessionsHistory: "История сессий"
    },
    footer: {
      rights: "© 2026 Makquiz Inc. Все права защищены.",
      tagline: "Учись умнее, а не больше.",
      product: "Продукт",
      company: "Компания",
      legal: "Документы",
      links: { 
        features: "Возможности",
        pricing: "Цены",
        mobile: "Приложение",
        about: "О нас",
        careers: "Карьера",
        blog: "Блог",
        privacy: "Политика конфиденциальности", 
        terms: "Условия использования", 
        contact: "Контакты" 
      }
    },
    general: {
      loading: "Загрузка...",
      save: "Сохранить",
      delete: "Удалить",
      back: "Назад",
      confirm: "Вы уверены?"
    }
  }
};