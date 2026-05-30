/* ============================================================
   LOADRYX — Product Catalog + Categories
   Single source of truth for the entire store.
   Each page imports this and renders accordingly.
   ============================================================ */

(function (global) {
  "use strict";

  /* -- categories ------------------------------------------------ */
  const CATEGORIES = [
    {
      slug: "ps5",
      name: "PS5 AI",
      tagline: "باكجات تصويب ذكاء اصطناعي لأشهر ألعاب الـ PS5",
      desc: "نظام تصويب ذكي يعتمد على AI لتحليل الصورة مباشرة من كرت الكابتشر، مع إعداد كامل واحترافي لكل لعبة.",
    },
    {
      slug: "setting",
      name: "Setting AI",
      tagline: "ضبط إعدادات اللعبة والـ Aim بشكل كامل",
      desc: "خدمات إعداد احترافي للحساسية والـ Aim مع متابعة بعد التركيب.",
    },
    {
      slug: "script",
      name: "Script Xim Matrix",
      tagline: "سكربتات احترافية متوافقة مع أجهزة Xim Matrix",
      desc: "سكربتات مصممة لأفضل ثبات وسرعة استجابة داخل اللعبة.",
    },
    {
      slug: "accessories",
      name: "الملحقات",
      tagline: "أجهزة ومحولات لتجربة لعب احترافية",
      desc: "ملحقات احترافية مختارة بعناية لتكمل تجربتك التنافسية.",
    },
    {
      slug: "games",
      name: "الألعاب",
      tagline: "قسم الألعاب — قريباً",
      desc: "نعمل على إضافة منتجات هذا القسم. تابعنا لآخر التحديثات.",
    },
  ];

  /* -- shared template blocks ------------------------------------ */
  const AI_FEATURES = [
    "تحسين دقة التصويب بشكل ملحوظ",
    "تتبّع الأعداء بثبات أعلى",
    "رد فعل أسرع أثناء الاشتباكات",
    "تقليل الاهتزاز أثناء التصويب",
    "إعدادات مخصصة تناسب أسلوب لعبك",
  ];

  const AI_INCLUDES = [
    "الاشتراك في برنامج AI AIM",
    "تثبيت جميع البرامج المطلوبة",
    "ضبط إعدادات اللعبة بالكامل",
    "إعداد احترافي من البداية للنهاية",
    "دعم فني ومتابعة بعد الإعداد",
  ];

  const AI_REQ = {
    pc: [
      "نظام Windows 10 أو Windows 11",
      "معالج Intel حديث (الجيل الثامن أو أعلى)",
      "كرت شاشة Nvidia حديث (يُفضّل RTX 2080 أو أعلى)",
    ],
    capture: [
      "Elgato 4K X",
      "Elgato 4K Pro",
      "Elgato HD60 X / HD60 Pro",
      "Avermedia Live Gamer HD 2 / Ultra",
    ],
  };

  const AI_SAFETY = [
    "النظام يعمل عبر الـ PC فقط باستخدام تحليل الصورة بالذكاء الاصطناعي",
    "لا يتم تثبيت أي ملفات على الكونسول",
    "لا يتم تعديل ملفات اللعبة",
    "لا يوجد أي تدخل مباشر في نظام اللعبة",
  ];

  const aiSessions = [
    {
      title: "الجلسة الأولى — الإعداد الكامل",
      duration: "2 – 3 ساعات",
      bullets: [
        "تثبيت البرامج",
        "ربط الأجهزة عبر Capture Card",
        "ضبط إعدادات اللعبة",
        "اختبار الأداء وتحسينه",
      ],
    },
    {
      title: "الجلسة الثانية — مراجعة الأداء",
      duration: "بعد يوم من اللعب",
      bullets: [
        "تحليل الأداء داخل اللعبة",
        "تعديل الإعدادات حسب أسلوبك",
        "تحسين سرعة ودقة التصويب",
      ],
    },
  ];

  /* helper: build a standard PS5 AI single-game product */
  function ps5Game(opts) {
    return {
      id: opts.id,
      cat: "ps5",
      name: opts.name,
      title: `${opts.upper} — AI AIM PROGRAM`,
      art: { kind: opts.kind || "game", lines: opts.lines },
      price: opts.price,
      badge: opts.badge,
      image: opts.image || null,
      short: `نظام تصويب ذكي يعتمد على الذكاء الاصطناعي لتحليل الصورة وتحسين الـ Aim بشكل احترافي أثناء اللعب — مصمم خصيصاً لـ ${opts.upper} على PS5.`,
      intro: `هل تريد التفوق في ${opts.upper} وتحقيق دقة تصويب أعلى في المواجهات؟ مع AI AIM PROGRAM ستحصل على نظام تصويب ذكي يعتمد على الذكاء الاصطناعي لتحليل الصورة وتحسين الـ Aim بشكل احترافي أثناء اللعب. البرنامج يعمل مع الكونسول PS5 عبر الـ PC باستخدام تحليل الصورة المباشر، مما يساعدك على تحسين سرعة التصويب والثبات في الاشتباكات.`,
      sections: [
        { heading: `مميزات AI في ${opts.upper}`, items: AI_FEATURES },
        { heading: "الخدمة تشمل", items: AI_INCLUDES.map((s) => s.replace("اللعبة", opts.upper)) },
        { heading: "مراحل الإعداد", sessions: aiSessions },
        { heading: "متطلبات التشغيل", req: AI_REQ },
        { heading: "الأمان", items: AI_SAFETY },
      ],
    };
  }

  /* -- products -------------------------------------------------- */
  const PRODUCTS = [
    /* ----- PS5 AI ---------------------------------------------- */
    {
      id: "ps5-ai-ultimate",
      cat: "ps5",
      featured: true,
      name: "PS5 AI AIM Package — Ultimate Edition",
      title: "PS5 AI AIM PACKAGE — ULTIMATE EDITION",
      art: { kind: "ultimate", lines: ["PS5 AI", "ULTIMATE EDITION"] },
      price: 10500,
      image: "ps5-ai-ultimate.png",
      badge: { text: "الباكج الكامل", kind: "featured" },
      short: "7 ألعاب كاملة، إعداد احترافي، ودعم متواصل. أعلى تجربة AI Aim للـ PS5.",
      intro: "هل تريد السيطرة في ألعاب الشوتر على PS5 وتحقيق Aim احترافي بمساعدة الذكاء الاصطناعي؟ مع باكج PS5 AI AIM ستحصل على نظام تصويب ذكي يعتمد على AI لتحليل الصورة المباشر وتحسين الأداء داخل اللعبة بشكل احترافي، مع إعدادات مخصصة لكل لعبة لتحقيق أفضل ثبات وسرعة استجابة أثناء اللعب.",
      sections: [
        {
          heading: "الألعاب المتوفرة داخل البكج",
          items: [
            "PS5 AI Apex Legends",
            "PS5 AI Call of Duty",
            "PS5 AI Valorant",
            "PS5 AI ARC Raiders",
            "PS5 AI Overwatch",
            "PS5 AI Fortnite",
            "PS5 AI Marvel Rivals",
          ],
        },
        {
          heading: "مميزات البكج",
          items: [
            "تحسين دقة التصويب بشكل ملحوظ",
            "تتبّع أكثر ثباتاً للأعداء",
            "تقليل الاهتزاز أثناء التصويب",
            "سرعة استجابة أعلى أثناء الاشتباكات",
            "إعدادات مخصصة لكل لعبة",
            "تحسين الأداء التنافسي بشكل احترافي",
            "دعم مستمر وتحديثات للإعدادات",
          ],
        },
        {
          heading: "البكج يشمل",
          items: [
            "اشتراك AI AIM كامل",
            "تثبيت جميع البرامج المطلوبة",
            "إعداد الألعاب بالكامل",
            "ضبط الحساسية والإعدادات الاحترافية",
            "ربط الأجهزة وضبط الأداء",
            "دعم فني ومتابعة بعد التركيب",
          ],
        },
        { heading: "مراحل الإعداد", sessions: aiSessions },
        { heading: "متطلبات التشغيل", req: AI_REQ },
        {
          heading: "السعر",
          note: "سعر اللعبة الواحدة 1,500 ريال · إجمالي البكج الكامل 10,500 ريال",
        },
        { heading: "الأمان", items: AI_SAFETY },
      ],
    },
    ps5Game({ id: "ps5-ai-apex",     name: "PS5 AI — Apex Legends",   upper: "APEX LEGENDS",  lines: ["APEX", "LEGENDS"],   price: 1426, image: "ps5-ai-apex.png" }),
    ps5Game({ id: "ps5-ai-cod",      name: "PS5 AI — Call of Duty",   upper: "CALL of DUTY",  lines: ["CALL", "OF DUTY"],   price: 1426, image: "ps5-ai-cod.png" }),
    ps5Game({ id: "ps5-ai-valorant", name: "PS5 AI — Valorant",       upper: "VALORANT",      lines: ["VALORANT"],          price: 1426, image: "ps5-ai-valorant.png" }),
    ps5Game({ id: "ps5-ai-overwatch",name: "PS5 AI — Overwatch",      upper: "OVERWATCH",     lines: ["OVER", "WATCH"],     price: 1426, image: "ps5-ai-overwatch.png" }),
    ps5Game({ id: "ps5-ai-fortnite", name: "PS5 AI — Fortnite",       upper: "FORTNITE",      lines: ["FORT", "NITE"],      price: 1500, image: "ps5-ai-fortnite.png" }),
    ps5Game({ id: "ps5-ai-arc",      name: "PS5 AI — ARC Raiders",    upper: "ARC RAIDERS",   lines: ["ARC", "RAIDERS"],    price: 1426, image: "ps5-ai-arc.png" }),

    /* ----- Setting AI ------------------------------------------ */
    {
      id: "setting-ai",
      cat: "setting",
      name: "Setting AI — ضبط كامل للعبة",
      title: "SETTING AI — FULL GAME SETUP",
      art: { kind: "setting", lines: ["SETTING", "AI"] },
      price: 563,
      short: "إعداد كامل من البداية للنهاية وضبط الإعدادات الاحترافية للحساسية والـ Aim.",
      intro: "خدمة Setting AI لضبط إعدادات اللعبة بالكامل — حساسية، أزرار، Aim Assist، Field of View، وكل التفاصيل التي تصنع الفرق داخل المباراة.",
      sections: [
        {
          heading: "ماذا تشمل الخدمة",
          items: [
            "ضبط إعدادات اللعبة بالكامل",
            "إعداد كامل من البداية للنهاية",
            "ضبط حساسية احترافية",
            "اختبار الأداء وتعديله",
          ],
        },
        {
          heading: "الجلسات",
          sessions: [
            {
              title: "الجلسة الأولى — الإعداد الكامل",
              duration: "1 – 2 ساعة",
              bullets: ["ضبط الإعدادات الأساسية", "ضبط الحساسية والـ Aim", "اختبار الأداء"],
            },
          ],
        },
      ],
    },
    {
      id: "setting-ai-support",
      cat: "setting",
      name: "دعم فني — جلسة متابعة",
      title: "TECHNICAL SUPPORT SESSION",
      art: { kind: "setting", lines: ["دعم", "فني"] },
      price: 534,
      short: "جلسة دعم فني مخصصة لمراجعة الأداء وتعديل الإعدادات حسب أسلوب لعبك.",
      intro: "جلسة دعم فني واحدة مع فريقنا — لمراجعة الأداء، حل أي مشاكل تواجهك، أو تعديل الإعدادات بعد تجربتك في اللعب.",
      sections: [
        {
          heading: "تشمل الجلسة",
          items: [
            "مراجعة الأداء بعد التجربة",
            "تعديل الإعدادات حسب أسلوب اللعب",
            "تحسين سرعة ودقة التصويب",
            "حل أي مشكلة تقنية",
          ],
        },
      ],
    },

    /* ----- Script Xim Matrix ----------------------------------- */
    {
      id: "script-warzone",
      cat: "script",
      name: "سكربت Warzone الاحترافي",
      title: "WARZONE PRO SCRIPT",
      art: { kind: "script", lines: ["SCRIPT", "WARZONE"] },
      price: 200,
      image: "warzone_script.png",
      images: ["warzone_script.png"],
      short: "Aim Assist متطور، ثبات عالٍ، إعدادات احترافية متوافقة مع جميع المنصات.",
      intro: "سكربت احترافي مصمم خصيصاً ليمنحك أفضل أداء وثبات في التصويب داخل لعبة Warzone. متوافق مع جميع المنصات: PC، PS5، PS4، Xbox — ويعمل بسلاسة لأفضل تجربة لعب ممكنة.",
      sections: [
        {
          heading: "مميزات السكربت",
          items: [
            "AIM ASSIST متطور",
            "تتبع ذكي ودقيق للأعداء",
            "يعمل أثناء الزوم وبدون زوم",
            "حركة Aim ناعمة وثابتة لزيادة دقة التصويب",
            "ثبات عالٍ في المواجهات",
            "تحسين التحكم بالتصويب",
            "تقليل اهتزاز السلاح",
            "أفضلية واضحة في القتال القريب والبعيد",
          ],
        },
        {
          heading: "إعدادات احترافية",
          items: [
            "إعدادات جاهزة للاستخدام",
            "متوافق مع أجهزة السكربت مثل XIM MATRIX",
            "مناسب للاعبين التنافسيين",
          ],
        },
      ],
    },
    {
      id: "script-bo7-dma",
      cat: "script",
      name: "سكربت Black Ops 7 — DMA",
      title: "BLACK OPS 7 DMA SCRIPT",
      art: { kind: "script", lines: ["BLACK OPS 7", "DMA"] },
      price: 150,
      image: "script-bo7-dma.png",
      images: ["script-bo7-dma.png"],
      short: "قراءة بيانات لعبة متقدمة عبر الـ DMA لتجربة احترافية متكاملة.",
      intro: "سكربت Black Ops 7 الاحترافي — نوع من الأدوات والإعدادات المتقدمة المستخدمة مع الأجهزة الخارجية لتحسين قراءة بيانات اللعبة بشكل مباشر عبر الـ PC، يستخدمه اللاعبون التنافسيون للحصول على معلومات إضافية أثناء اللعب.",
      sections: [
        {
          heading: "المميزات",
          items: [
            "قراءة بيانات DMA متقدمة",
            "متوافق مع XIM MATRIX",
            "إعدادات احترافية جاهزة",
            "تحديثات مستمرة",
          ],
        },
      ],
      sections: [],
    },

    /* ----- Accessories ----------------------------------------- */
    {
      id: "titan-two",
      cat: "accessories",
      name: "جهاز Titan Two — حجز مسبق",
      title: "TITAN TWO PRE-ORDER",
      art: { kind: "accessory", lines: ["TITAN", "TWO"] },
      price: 850,
      badge: { text: "حجز مسبق", kind: "reserve" },
      short: "جهاز Titan Two — أحد أفضل أجهزة التحكم لاستخدام السكربتات والملفات الاحترافية.",
      intro: "Titan Two — جهاز متعدد الاستخدامات لربط أنواع مختلفة من أجهزة التحكم وتشغيل السكربتات والإعدادات الاحترافية على عدة منصات.",
      sections: [
        {
          heading: "المميزات",
          items: [
            "تشغيل السكربتات والإعدادات",
            "متوافق مع PS5 / PS4 / Xbox / PC",
            "دعم تخصيص كامل",
            "أداء ثابت ومستقر",
          ],
        },
        {
          heading: "ملاحظة",
          note: "هذا المنتج متاح للحجز المسبق فقط — يتم التواصل معك عند توفّر الكمية.",
        },
      ],
      image: "titan-two.png",
      images: ["titan-two.png"],
      short: "يأتي Titan Two كجهاز Adapter متقدم يدعم البرمجة والـ Mods، ومخصص للاعبين الذين يحتاجون تحكماً أوسع على أجهزة الكونسول والكمبيوتر.",
      intro: "يأتي Titan Two كجهاز Adapter متقدم يدعم البرمجة والـ Mods، ومخصص للاعبين الذين يحتاجون تحكماً أوسع على أجهزة الكونسول والكمبيوتر.",
      sections: [
        {
          heading: "إمكانية الاستخدام",
          items: [
            "يد التحكم المفضلة لديك",
            "الكيبورد والماوس",
            "الجويستك",
            "Arcade Stick",
            "Flight Stick",
            "ومعظم وحدات التحكم المختلفة",
          ],
        },
        {
          heading: "التوافق",
          note: "يعمل على أجهزة الكونسول والكمبيوتر بسلاسة.",
        },
        {
          heading: "تخصيص كامل",
          items: [
            "يمكنك تعديل توزيع الأزرار",
            "حساسية وتحركات الأنالوج",
            "وإعدادات التحكم بالكامل بما يناسب أسلوب لعبك.",
          ],
        },
        {
          heading: "خصائص التحكم",
          items: ["يدعم Titan Two مجموعة من أدوات التحكم المتقدمة، مثل:", "Mods", "Macros", "Rapid Fire", "Anti-Recoil", "Aim Assist"],
        },
        {
          heading: "دعم XIM APEX",
          note: "يدعم Titan Two جهاز XIM APEX Mouse & Keyboard Adapter.",
        },
        {
          heading: "ملاحظة",
          note: "هذا المنتج متاح للحجز المسبق فقط - يتم التواصل معك عند توفر الكمية.",
        },
      ],
    },
    {
      id: "brook-wingman-fgc2",
      cat: "accessories",
      name: "محول Brook Wingman FGC2",
      title: "BROOK WINGMAN FGC2",
      art: { kind: "accessory", lines: ["BROOK", "WINGMAN FGC2"] },
      price: 290.5,
      short: "محول عصا تحكم Arcade لدعم PS5 والكمبيوتر الشخصي.",
      intro: "محول Brook Wingman FGC2 — يدعم ربط عصي التحكم العربية والـ Fightstick بـ PS5 والكمبيوتر، بزمن استجابة منخفض جداً مناسب للألعاب التنافسية.",
      sections: [
        {
          heading: "المميزات",
          items: [
            "زمن استجابة منخفض جداً",
            "متوافق مع PS5 و PC",
            "دعم Fightsticks وعصي التحكم",
            "تحديثات Firmware مستمرة",
          ],
        },
      ],
      image: "brook-wingman-fgc2.png",
      images: [
        "brook-wingman-fgc2.png",
        "brook-wingman-fgc2.2.png",
        "brook-wingman-fgc2.3.png",
        "brook-wingman-fgc2.4.png",
        "brook-wingman-fgc2.5.png",
      ],
      short: "محول عصا التحكم Arcade لدعم PS5 والكمبيوتر الشخصي.",
      intro: "محول Brook Wingman FGC2 - محول عصا التحكم Arcade لدعم PS5 والكمبيوتر الشخصي.",
      sections: [],
    },
    {
      id: "p5-general",
      cat: "accessories",
      name: "P5 General",
      title: "P5 GENERAL",
      art: { kind: "accessory", lines: ["P5", "GENERAL"] },
      price: 157.53,
      short: "إكسسوار لاستخدامات متعددة مع PS5.",
      intro: "ملحق متعدد الاستخدامات متوافق مع الـ PS5 لتوسيع إمكانياتك في الاتصال والتشغيل.",
      sections: [
        {
          heading: "المميزات",
          items: ["متوافق مع PS5", "تركيب بسيط", "أداء مستقر"],
        },
      ],
      name: "p5 general",
      title: "P5 GENERAL",
      image: "p5-general.png",
      images: ["p5-general.png", "p5-general.2.png", "p5-general.3.png", "p5-general.4.png"],
      short: "منشط ألعاب PS5 من الجيل الثاني بتردد 1000 هرتز ثنائي الاتجاه.",
      intro: "منشط ألعاب PS5 من الجيل الثاني بتردد 1000 هرتز ثنائي الاتجاه<br>يدعم HITBOX لـ Raspberry Pi COLOR MATRIX Reasnow وطرفين خارجيين آخرين<br><br>(قد تختلف الكلمات المطبوعة على المنتج حسب الدفعة، ولكن ذلك لا يؤثر على الاستخدام)<br>اللون أسود<br>المادة بلاستيك<br><br>محتويات العبوة<br>منفذ USB لجهاز P5General لتفعيل ألعاب PS5<br><br>فقط محتوى الحزمة أعلاه، لا يتم تضمين المنتجات الأخرى.<br><br>ملاحظة: قد يؤدي انعكاس الضوء واختلاف شاشات العرض إلى اختلاف بسيط في لون العنصر الظاهر في الصورة مقارنة باللون الفعلي. هامش الخطأ المسموح به في القياسات هو +- 1-3 سم.",
      sections: [],
    },
  ];

  /* -- helpers --------------------------------------------------- */
  function getCategory(slug) {
    return CATEGORIES.find((c) => c.slug === slug) || null;
  }
  function productsByCategory(slug) {
    return PRODUCTS.filter((p) => p.cat === slug);
  }
  function getProduct(id) {
    return PRODUCTS.find((p) => p.id === id) || null;
  }
  function categoryCount(slug) {
    return productsByCategory(slug).length;
  }

  function formatPrice(n) {
    return Number(n).toLocaleString("en-US", {
      minimumFractionDigits: Number.isInteger(n) ? 0 : 2,
      maximumFractionDigits: 2,
    });
  }

  global.LR_DATA = {
    CATEGORIES,
    PRODUCTS,
    getCategory,
    productsByCategory,
    getProduct,
    categoryCount,
    formatPrice,
  };
})(window);
