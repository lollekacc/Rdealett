(() => {
  const partials = {
    header: 'partials/header.html',
    footer: 'partials/footer.html',
  };

  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  const supportedLanguages = ['sv', 'en', 'ar', 'so', 'fa'];
  const rtlLanguages = new Set(['ar', 'fa']);
  const textNodeMemory = new WeakMap();
  const attrMemory = new WeakMap();
  let activeLanguage = 'en';
  let translationObserver = null;
  let translationFrame = 0;
  let isApplyingTranslations = false;
  let originalDocumentTitle = '';

  const translations = {
    en: {
      'Bättre deals, helt enkelt.': 'Better deals, made simple.',
      'Språk': 'Language',
      'Snabblänkar': 'Quick links',
      'Privat': 'Personal',
      'Företag': 'Business',
      'Varukorg': 'Cart',
      'Mina sidor': 'My pages',
      'bättre deals, helt enkelt.': 'better deals, made simple.',
      'Hemsida': 'Website',
      'Start': 'Home',
      'Tjänster': 'Services',
      'Mobilabonnemang': 'Mobile plans',
      'Familjabonnemang': 'Family plans',
      '5G-Bredband': '5G broadband',
      'Jämför täckning': 'Compare coverage',
      'Om oss': 'About us',
      'Kontakt': 'Contact',
      'Få Personlig rådgivning': 'Get personal advice',
      'Få rätt prisplan': 'Get the right price plan',
      'Få ett presentkort': 'Get a gift card',
      'Tar mindre än 2 minuter, ingen registrering.': 'Takes less than 2 minutes, no registration.',
      'Se om du kan spara': 'See if you can save',
      'Tillbaka': 'Back',
      'Steg': 'Step',
      'Hur många abonnemang': 'How many subscriptions',
      'vill ni ha?': 'do you want?',
      'Vi använder svaren för att hitta rätt abonnemang för er.': 'We use your answers to find the right plan for you.',
      'Visa fler': 'Show more',
      'Dölj': 'Hide',
      'DÃ¶lj': 'Hide',
      'Vilken operatör har ni?': 'Which operator do you have?',
      'Vilken operatör har du?': 'Which operator do you have?',
      'Vilka operatörer har ni?': 'Which operators do you have?',
      'Vi tar med allt i kalkylen': 'We include everything in the calculation',
      'Fortsätt': 'Continue',
      'Person': 'Person',
      'Andra': 'Other',
      'Datum': 'Date',
      'Ingen bindningstid': 'No contract period',
      'Hur används mobilen?': 'How is the mobile used?',
      'Mest wifi & sociala medier': 'Mostly Wi-Fi and social media',
      'Streaming & video': 'Streaming and video',
      'Max surf': 'Maximum data',
      '100 GB – Obegränsad': '100 GB - Unlimited',
      'Pris per abonnemang idag?': 'Price per subscription today?',
      'Under 300 kr': 'Under 300 SEK',
      '300–400 kr': '300-400 SEK',
      '400–500+ kr': '400-500+ SEK',
      'Bindningstid kvar?': 'Contract period remaining?',
      'Nej': 'No',
      'Ja': 'Yes',
      'Vet inte': "I don't know",
      'Vi hittade dina bästa alternativ': 'We found your best options',
      'Baserat på dina svar har vi matchat de abonnemang som passar ditt hushålls behov och budget bäst.': 'Based on your answers, we matched the plans that best fit your household needs and budget.',
      'Abonnemangspaket': 'Subscription packages',
      '4 abonnemang': '4 subscriptions',
      'Obegränsad surf': 'Unlimited data',
      'Obegränsad': 'Unlimited',
      'Samtal & SMS ingår': 'Calls and SMS included',
      '5G & eSIM': '5G and eSIM',
      'presentkort': 'gift card',
      'Presentkort': 'Gift card',
      'Visa paketet': 'View package',
      'Vår smarta guide hjälper dig hitta rätt snabbare': 'Our smart guide helps you find the right plan faster',
      'Låt Dealett-AI analysera dina behov och guida dig till rätt abonnemang utan onödigt krångel.': 'Let Dealett AI analyze your needs and guide you to the right subscription without unnecessary hassle.',
      'Chatta med Dealett-AI': 'Chat with Dealett AI',
      'Rekommenderas': 'Recommended',
      'Vi ger presentkort på varje köp': 'We give a gift card with every purchase',
      'Välj bland populära varumärken och få ett presentkort när du hittar rätt abonnemang via Dealett.': 'Choose from popular brands and receive a gift card when you find the right subscription through Dealett.',
      'Exempel på presentkort': 'Gift card examples',
      'Täckning & nät': 'Coverage and network',
      'Välj operatör och utforska kartan': 'Choose an operator and explore the map',
      'Se täckning, jämför nät och sök direkt på adress eller stad för att få en tydligare bild av läget där du bor.': 'View coverage, compare networks, and search by address or city to get a clearer picture where you live.',
      'Operatörer': 'Operators',
      'Välj operatör': 'Choose operator',
      'Filter': 'Filter',
      'Nät': 'Network',
      'Täckningsinformationen är en uppskattning och inte ett löfte.': 'Coverage information is an estimate, not a promise.',
      'Läs mer →': 'Read more ->',
      'Sök': 'Search',
      'Sök adress eller plats': 'Search address or place',
      'Ingen täckning': 'No coverage',
      'Begränsad': 'Limited',
      'Grundläggande': 'Basic',
      'Bra': 'Good',
      'Utmärkt täckning': 'Excellent coverage',
      'Nuvarande plats': 'Current location',
      'Helskärm': 'Fullscreen',
      'Zooma ut': 'Zoom out',
      'Zooma in': 'Zoom in',
      'Zoomnivå:': 'Zoom level:',
      'Analyserar svar...': 'Analyzing answers...',
      'Inga träffar just nu': 'No matches right now',
      'Testa att gå tillbaka och justera prisnivå eller surfbehov så visar vi fler relevanta alternativ.': 'Try going back and adjusting price level or data needs so we can show more relevant options.',
      'Bäst match': 'Best match',
      'Surf': 'Data',
      'Pris': 'Price',
      'Till varukorg': 'To cart',
      'Fria samtal och sms': 'Free calls and SMS',
      'Dubbel surf i 24 mån': 'Double data for 24 months',
      'Dubbel surf i 24 mÃ¥n': 'Double data for 24 months',
      'Streaming ingår': 'Streaming included',
      'Streaming ingÃ¥r': 'Streaming included',
      '5G och fria samtal': '5G and free calls',
      'Surfpotten ingår': 'Data pool included',
      'Surfpotten ingÃ¥r': 'Data pool included',
      'Netflix, HBO, Disney+ ingår': 'Netflix, HBO, Disney+ included',
      'Netflix, HBO, Disney+ ingÃ¥r': 'Netflix, HBO, Disney+ included',
      '5G upp till 100 Mbit/s': '5G up to 100 Mbit/s',
      'Säkerhetspaket': 'Security package',
      'SÃ¤kerhetspaket': 'Security package',
      '5G upp till 1000 Mbit/s': '5G up to 1000 Mbit/s',
      'EU-roaming': 'EU roaming',
      '5G ingår': '5G included',
      '5G ingÃ¥r': '5G included',
      'Miniabonnemang': 'Mini subscription',
      'För dig som surfar mycket': 'For heavy data users',
      'FÃ¶r dig som surfar mycket': 'For heavy data users',
      'Tel: 08-123 45 67': 'Phone: 08-123 45 67'
    },
    ar: {
      'Bättre deals, helt enkelt.': 'عروض أفضل، ببساطة.',
      'Språk': 'اللغة',
      'Snabblänkar': 'روابط سريعة',
      'Privat': 'أفراد',
      'Företag': 'شركات',
      'Varukorg': 'السلة',
      'Mina sidor': 'صفحتي',
      'bättre deals, helt enkelt.': 'عروض أفضل، ببساطة.',
      'Hemsida': 'الموقع',
      'Start': 'الرئيسية',
      'Tjänster': 'الخدمات',
      'Mobilabonnemang': 'باقات الجوال',
      'Familjabonnemang': 'باقات العائلة',
      '5G-Bredband': 'إنترنت 5G منزلي',
      'Jämför täckning': 'قارن التغطية',
      'Om oss': 'من نحن',
      'Kontakt': 'اتصل بنا',
      'Få Personlig rådgivning': 'احصل على استشارة شخصية',
      'Få rätt prisplan': 'احصل على خطة السعر المناسبة',
      'Få ett presentkort': 'احصل على بطاقة هدية',
      'Tar mindre än 2 minuter, ingen registrering.': 'يستغرق أقل من دقيقتين، بدون تسجيل.',
      'Se om du kan spara': 'اعرف إن كان بإمكانك التوفير',
      'Tillbaka': 'رجوع',
      'Steg': 'الخطوة',
      'Hur många abonnemang': 'كم عدد الاشتراكات',
      'vill ni ha?': 'التي تريدونها؟',
      'Vi använder svaren för att hitta rätt abonnemang för er.': 'نستخدم إجاباتك للعثور على الاشتراك المناسب لك.',
      'Visa fler': 'عرض المزيد',
      'Dölj': 'إخفاء',
      'DÃ¶lj': 'إخفاء',
      'Vilken operatör har ni?': 'ما شركة الاتصالات لديك؟',
      'Vilken operatör har du?': 'ما شركة الاتصالات لديك؟',
      'Vilka operatörer har ni?': 'ما شركات الاتصالات لديكم؟',
      'Vi tar med allt i kalkylen': 'نحسب كل شيء ضمن التقدير',
      'Fortsätt': 'متابعة',
      'Person': 'الشخص',
      'Andra': 'أخرى',
      'Datum': 'التاريخ',
      'Ingen bindningstid': 'بدون مدة التزام',
      'Hur används mobilen?': 'كيف يُستخدم الجوال؟',
      'Mest wifi & sociala medier': 'غالبا واي فاي وتواصل اجتماعي',
      'Streaming & video': 'بث وفيديو',
      'Max surf': 'أقصى بيانات',
      '100 GB – Obegränsad': '100 GB - غير محدود',
      'Pris per abonnemang idag?': 'السعر الحالي لكل اشتراك؟',
      'Under 300 kr': 'أقل من 300 كرونة',
      '300–400 kr': '300-400 كرونة',
      '400–500+ kr': '400-500+ كرونة',
      'Bindningstid kvar?': 'هل توجد مدة التزام متبقية؟',
      'Nej': 'لا',
      'Ja': 'نعم',
      'Vet inte': 'لا أعرف',
      'Vi hittade dina bästa alternativ': 'وجدنا أفضل الخيارات لك',
      'Baserat på dina svar har vi matchat de abonnemang som passar ditt hushålls behov och budget bäst.': 'بناء على إجاباتك، اخترنا الباقات الأنسب لاحتياجات منزلك وميزانيتك.',
      'Abonnemangspaket': 'حزم الاشتراك',
      '4 abonnemang': '4 اشتراكات',
      'Obegränsad surf': 'بيانات غير محدودة',
      'Obegränsad': 'غير محدود',
      'Samtal & SMS ingår': 'المكالمات والرسائل مشمولة',
      '5G & eSIM': '5G و eSIM',
      'presentkort': 'بطاقة هدية',
      'Presentkort': 'بطاقة هدية',
      'Visa paketet': 'عرض الباقة',
      'Vår smarta guide hjälper dig hitta rätt snabbare': 'دليلنا الذكي يساعدك في العثور على الخيار المناسب أسرع',
      'Låt Dealett-AI analysera dina behov och guida dig till rätt abonnemang utan onödigt krångel.': 'دع Dealett AI يحلل احتياجاتك ويرشدك إلى الاشتراك المناسب بدون تعقيد غير ضروري.',
      'Chatta med Dealett-AI': 'دردش مع Dealett AI',
      'Rekommenderas': 'موصى به',
      'Vi ger presentkort på varje köp': 'نقدم بطاقة هدية مع كل عملية شراء',
      'Välj bland populära varumärken och få ett presentkort när du hittar rätt abonnemang via Dealett.': 'اختر من علامات تجارية مشهورة واحصل على بطاقة هدية عند العثور على الاشتراك المناسب عبر Dealett.',
      'Exempel på presentkort': 'أمثلة على بطاقات الهدايا',
      'Täckning & nät': 'التغطية والشبكة',
      'Välj operatör och utforska kartan': 'اختر شركة اتصالات واستكشف الخريطة',
      'Se täckning, jämför nät och sök direkt på adress eller stad för att få en tydligare bild av läget där du bor.': 'شاهد التغطية، قارن الشبكات، وابحث مباشرة بالعنوان أو المدينة لمعرفة الوضع في مكان سكنك.',
      'Operatörer': 'شركات الاتصالات',
      'Välj operatör': 'اختر شركة اتصالات',
      'Filter': 'تصفية',
      'Nät': 'الشبكة',
      'Täckningsinformationen är en uppskattning och inte ett löfte.': 'معلومات التغطية تقديرية وليست وعدا.',
      'Läs mer →': 'اقرأ المزيد ->',
      'Sök': 'بحث',
      'Sök adress eller plats': 'ابحث عن عنوان أو مكان',
      'Ingen täckning': 'لا توجد تغطية',
      'Begränsad': 'محدودة',
      'Grundläggande': 'أساسية',
      'Bra': 'جيدة',
      'Utmärkt täckning': 'تغطية ممتازة',
      'Nuvarande plats': 'الموقع الحالي',
      'Helskärm': 'ملء الشاشة',
      'Zooma ut': 'تصغير',
      'Zooma in': 'تكبير',
      'Zoomnivå:': 'مستوى التكبير:',
      'Analyserar svar...': 'جار تحليل الإجابات...',
      'Inga träffar just nu': 'لا توجد نتائج حاليا',
      'Testa att gå tillbaka och justera prisnivå eller surfbehov så visar vi fler relevanta alternativ.': 'جرّب الرجوع وتعديل السعر أو حاجة البيانات لنعرض خيارات أكثر ملاءمة.',
      'Bäst match': 'أفضل تطابق',
      'Surf': 'البيانات',
      'Pris': 'السعر',
      'Till varukorg': 'إلى السلة',
      'Fria samtal och sms': 'مكالمات ورسائل مجانية',
      'Dubbel surf i 24 mån': 'ضعف البيانات لمدة 24 شهرا',
      'Dubbel surf i 24 mÃ¥n': 'ضعف البيانات لمدة 24 شهرا',
      'Streaming ingår': 'البث مشمول',
      'Streaming ingÃ¥r': 'البث مشمول',
      '5G och fria samtal': '5G ومكالمات مجانية',
      'Surfpotten ingår': 'رصيد البيانات مشمول',
      'Surfpotten ingÃ¥r': 'رصيد البيانات مشمول',
      'Netflix, HBO, Disney+ ingår': 'Netflix وHBO وDisney+ مشمولة',
      'Netflix, HBO, Disney+ ingÃ¥r': 'Netflix وHBO وDisney+ مشمولة',
      '5G upp till 100 Mbit/s': '5G حتى 100 مbit/s',
      'Säkerhetspaket': 'حزمة أمان',
      'SÃ¤kerhetspaket': 'حزمة أمان',
      '5G upp till 1000 Mbit/s': '5G حتى 1000 مbit/s',
      'EU-roaming': 'تجوال داخل الاتحاد الأوروبي',
      '5G ingår': '5G مشمول',
      '5G ingÃ¥r': '5G مشمول',
      'Miniabonnemang': 'اشتراك صغير',
      'För dig som surfar mycket': 'لمن يستخدم بيانات كثيرة',
      'FÃ¶r dig som surfar mycket': 'لمن يستخدم بيانات كثيرة',
      'Tel: 08-123 45 67': 'الهاتف: 08-123 45 67'
    },
    so: {
      'Bättre deals, helt enkelt.': 'Heshiisyo fiican, si fudud.',
      'Språk': 'Luqad',
      'Snabblänkar': 'Xiriirro degdeg ah',
      'Privat': 'Shakhsi',
      'Företag': 'Ganacsi',
      'Varukorg': 'Gaari',
      'Mina sidor': 'Boggeyga',
      'bättre deals, helt enkelt.': 'heshiisyo fiican, si fudud.',
      'Hemsida': 'Mareeg',
      'Start': 'Bilow',
      'Tjänster': 'Adeegyo',
      'Mobilabonnemang': 'Qorshayaasha mobilka',
      'Familjabonnemang': 'Qorshayaasha qoyska',
      '5G-Bredband': '5G internet guri',
      'Jämför täckning': 'Isbarbar dhig daboolista',
      'Om oss': 'Nagu saabsan',
      'Kontakt': 'Xiriir',
      'Få Personlig rådgivning': 'Hel talo shakhsi ah',
      'Få rätt prisplan': 'Hel qorshaha qiimaha saxda ah',
      'Få ett presentkort': 'Hel kaarka hadiyadda',
      'Tar mindre än 2 minuter, ingen registrering.': 'Waxay qaadaneysaa wax ka yar 2 daqiiqo, diiwaangelin la’aan.',
      'Se om du kan spara': 'Eeg haddii aad kaydin karto',
      'Tillbaka': 'Dib u noqo',
      'Steg': 'Tallaabo',
      'Hur många abonnemang': 'Immisa rukun',
      'vill ni ha?': 'ayaad rabtaan?',
      'Vi använder svaren för att hitta rätt abonnemang för er.': 'Jawaabahaaga ayaan u isticmaalnaa si aan kuugu helno qorshaha kugu habboon.',
      'Visa fler': 'Muuji wax badan',
      'Dölj': 'Qari',
      'DÃ¶lj': 'Qari',
      'Vilken operatör har ni?': 'Shirkaddee ayaad haysataan?',
      'Vilken operatör har du?': 'Shirkaddee ayaad haysataa?',
      'Vilka operatörer har ni?': 'Shirkado kee ayaad haysataan?',
      'Vi tar med allt i kalkylen': 'Wax walba waxaan ku darnaa xisaabta',
      'Fortsätt': 'Sii wad',
      'Person': 'Qof',
      'Andra': 'Kale',
      'Datum': 'Taariikh',
      'Ingen bindningstid': 'Qandaraas la’aan',
      'Hur används mobilen?': 'Sidee mobilka loo isticmaalaa?',
      'Mest wifi & sociala medier': 'Inta badan Wi-Fi iyo baraha bulshada',
      'Streaming & video': 'Daawasho iyo muuqaal',
      'Max surf': 'Xog ugu badan',
      '100 GB – Obegränsad': '100 GB - Aan xadidnayn',
      'Pris per abonnemang idag?': 'Qiimaha rukun kasta maanta?',
      'Under 300 kr': 'Ka yar 300 kr',
      '300–400 kr': '300-400 kr',
      '400–500+ kr': '400-500+ kr',
      'Bindningstid kvar?': 'Qandaraas ma kuu harsan yahay?',
      'Nej': 'Maya',
      'Ja': 'Haa',
      'Vet inte': 'Ma aqaan',
      'Vi hittade dina bästa alternativ': 'Waxaan helnay xulashooyinka kuugu fiican',
      'Baserat på dina svar har vi matchat de abonnemang som passar ditt hushålls behov och budget bäst.': 'Anagoo ku saleyneyna jawaabahaaga, waxaan helnay qorshayaal ku habboon baahida iyo miisaaniyadda qoyskaaga.',
      'Abonnemangspaket': 'Xirmooyinka rukunka',
      '4 abonnemang': '4 rukun',
      'Obegränsad surf': 'Xog aan xadidnayn',
      'Obegränsad': 'Aan xadidnayn',
      'Samtal & SMS ingår': 'Wicitaan iyo SMS way ku jiraan',
      '5G & eSIM': '5G iyo eSIM',
      'presentkort': 'kaarka hadiyadda',
      'Presentkort': 'Kaarka hadiyadda',
      'Visa paketet': 'Eeg xirmada',
      'Vår smarta guide hjälper dig hitta rätt snabbare': 'Hagahayaga caqliga leh wuxuu kaa caawinayaa inaad si dhakhso ah u hesho midka saxda ah',
      'Låt Dealett-AI analysera dina behov och guida dig till rätt abonnemang utan onödigt krångel.': 'U oggolow Dealett AI inuu falanqeeyo baahiyahaaga oo kugu hago rukunka saxda ah si dhib yar.',
      'Chatta med Dealett-AI': 'La sheekayso Dealett AI',
      'Rekommenderas': 'Lagu taliyay',
      'Vi ger presentkort på varje köp': 'Waxaan bixinaa kaar hadiyad iib kasta',
      'Välj bland populära varumärken och få ett presentkort när du hittar rätt abonnemang via Dealett.': 'Ka dooro sumado caan ah oo hel kaar hadiyad markaad Dealett ka hesho rukunka saxda ah.',
      'Exempel på presentkort': 'Tusaalooyinka kaarka hadiyadda',
      'Täckning & nät': 'Daboolis iyo shabakad',
      'Välj operatör och utforska kartan': 'Dooro shirkad oo sahami khariidadda',
      'Se täckning, jämför nät och sök direkt på adress eller stad för att få en tydligare bild av läget där du bor.': 'Eeg daboolista, isbarbar dhig shabakadaha, kana raadi cinwaan ama magaalo si aad u fahanto xaaladda meesha aad degan tahay.',
      'Operatörer': 'Shirkado',
      'Välj operatör': 'Dooro shirkad',
      'Filter': 'Shaandhee',
      'Nät': 'Shabakad',
      'Täckningsinformationen är en uppskattning och inte ett löfte.': 'Macluumaadka daboolistu waa qiyaas, ma aha ballan.',
      'Läs mer →': 'Akhri wax dheeraad ah ->',
      'Sök': 'Raadi',
      'Sök adress eller plats': 'Raadi cinwaan ama meel',
      'Ingen täckning': 'Daboolis ma jirto',
      'Begränsad': 'Xaddidan',
      'Grundläggande': 'Aasaasi',
      'Bra': 'Fiican',
      'Utmärkt täckning': 'Daboolis aad u fiican',
      'Nuvarande plats': 'Goobta hadda',
      'Helskärm': 'Shaashad buuxda',
      'Zooma ut': 'Ka fogee',
      'Zooma in': 'Soo dhowee',
      'Zoomnivå:': 'Heerka zoom:',
      'Analyserar svar...': 'Jawaabaha waa la falanqeynayaa...',
      'Inga träffar just nu': 'Hadda wax natiijo ah ma jiraan',
      'Testa att gå tillbaka och justera prisnivå eller surfbehov så visar vi fler relevanta alternativ.': 'Isku day inaad dib u noqoto oo hagaajiso qiimaha ama baahida xogta si aan kuu tusno xulashooyin habboon.',
      'Bäst match': 'Isku aadka ugu fiican',
      'Surf': 'Xog',
      'Pris': 'Qiime',
      'Till varukorg': 'Gaari u gudub',
      'Fria samtal och sms': 'Wicitaan iyo SMS bilaash ah',
      'Dubbel surf i 24 mån': 'Xog labanlaab ah 24 bilood',
      'Dubbel surf i 24 mÃ¥n': 'Xog labanlaab ah 24 bilood',
      'Streaming ingår': 'Daawasho way ku jirtaa',
      'Streaming ingÃ¥r': 'Daawasho way ku jirtaa',
      '5G och fria samtal': '5G iyo wicitaan bilaash ah',
      'Surfpotten ingår': 'Kaydka xogta wuu ku jiraa',
      'Surfpotten ingÃ¥r': 'Kaydka xogta wuu ku jiraa',
      'Netflix, HBO, Disney+ ingår': 'Netflix, HBO, Disney+ way ku jiraan',
      'Netflix, HBO, Disney+ ingÃ¥r': 'Netflix, HBO, Disney+ way ku jiraan',
      '5G upp till 100 Mbit/s': '5G ilaa 100 Mbit/s',
      'Säkerhetspaket': 'Xirmo amni',
      'SÃ¤kerhetspaket': 'Xirmo amni',
      '5G upp till 1000 Mbit/s': '5G ilaa 1000 Mbit/s',
      'EU-roaming': 'Roaming EU',
      '5G ingår': '5G wuu ku jiraa',
      '5G ingÃ¥r': '5G wuu ku jiraa',
      'Miniabonnemang': 'Rukun yar',
      'För dig som surfar mycket': 'Adiga isticmaal xog badan',
      'FÃ¶r dig som surfar mycket': 'Adiga isticmaal xog badan',
      'Tel: 08-123 45 67': 'Tel: 08-123 45 67'
    },
    fa: {
      'Bättre deals, helt enkelt.': 'پیشنهادهای بهتر، به سادگی.',
      'Språk': 'زبان',
      'Snabblänkar': 'پیوندهای سریع',
      'Privat': 'شخصی',
      'Företag': 'کسب‌وکار',
      'Varukorg': 'سبد خرید',
      'Mina sidor': 'صفحه من',
      'bättre deals, helt enkelt.': 'پیشنهادهای بهتر، به سادگی.',
      'Hemsida': 'وب‌سایت',
      'Start': 'خانه',
      'Tjänster': 'خدمات',
      'Mobilabonnemang': 'اشتراک موبایل',
      'Familjabonnemang': 'اشتراک خانوادگی',
      '5G-Bredband': 'اینترنت خانگی 5G',
      'Jämför täckning': 'مقایسه پوشش',
      'Om oss': 'درباره ما',
      'Kontakt': 'تماس',
      'Få Personlig rådgivning': 'مشاوره شخصی بگیرید',
      'Få rätt prisplan': 'طرح قیمتی مناسب بگیرید',
      'Få ett presentkort': 'کارت هدیه بگیرید',
      'Tar mindre än 2 minuter, ingen registrering.': 'کمتر از ۲ دقیقه زمان می‌برد، بدون ثبت‌نام.',
      'Se om du kan spara': 'ببینید می‌توانید صرفه‌جویی کنید',
      'Tillbaka': 'بازگشت',
      'Steg': 'مرحله',
      'Hur många abonnemang': 'چند اشتراک',
      'vill ni ha?': 'می‌خواهید؟',
      'Vi använder svaren för att hitta rätt abonnemang för er.': 'از پاسخ‌های شما برای پیدا کردن اشتراک مناسب استفاده می‌کنیم.',
      'Visa fler': 'نمایش بیشتر',
      'Dölj': 'پنهان کردن',
      'DÃ¶lj': 'پنهان کردن',
      'Vilken operatör har ni?': 'کدام اپراتور را دارید؟',
      'Vilken operatör har du?': 'کدام اپراتور را دارید؟',
      'Vilka operatörer har ni?': 'کدام اپراتورها را دارید؟',
      'Vi tar med allt i kalkylen': 'همه چیز را در محاسبه لحاظ می‌کنیم',
      'Fortsätt': 'ادامه',
      'Person': 'نفر',
      'Andra': 'سایر',
      'Datum': 'تاریخ',
      'Ingen bindningstid': 'بدون مدت تعهد',
      'Hur används mobilen?': 'موبایل چگونه استفاده می‌شود؟',
      'Mest wifi & sociala medier': 'بیشتر وای‌فای و شبکه‌های اجتماعی',
      'Streaming & video': 'استریم و ویدیو',
      'Max surf': 'بیشترین دیتا',
      '100 GB – Obegränsad': '100 GB - نامحدود',
      'Pris per abonnemang idag?': 'قیمت هر اشتراک امروز؟',
      'Under 300 kr': 'کمتر از 300 کرون',
      '300–400 kr': '300-400 کرون',
      '400–500+ kr': '400-500+ کرون',
      'Bindningstid kvar?': 'مدت تعهد باقی مانده؟',
      'Nej': 'خیر',
      'Ja': 'بله',
      'Vet inte': 'نمی‌دانم',
      'Vi hittade dina bästa alternativ': 'بهترین گزینه‌های شما را پیدا کردیم',
      'Baserat på dina svar har vi matchat de abonnemang som passar ditt hushålls behov och budget bäst.': 'بر اساس پاسخ‌های شما، اشتراک‌هایی را انتخاب کردیم که با نیاز و بودجه خانه شما بهتر هماهنگ هستند.',
      'Abonnemangspaket': 'بسته‌های اشتراک',
      '4 abonnemang': '۴ اشتراک',
      'Obegränsad surf': 'دیتای نامحدود',
      'Obegränsad': 'نامحدود',
      'Samtal & SMS ingår': 'تماس و پیامک شامل است',
      '5G & eSIM': '5G و eSIM',
      'presentkort': 'کارت هدیه',
      'Presentkort': 'کارت هدیه',
      'Visa paketet': 'مشاهده بسته',
      'Vår smarta guide hjälper dig hitta rätt snabbare': 'راهنمای هوشمند ما کمک می‌کند سریع‌تر گزینه مناسب را پیدا کنید',
      'Låt Dealett-AI analysera dina behov och guida dig till rätt abonnemang utan onödigt krångel.': 'اجازه دهید Dealett AI نیازهای شما را تحلیل کند و بدون دردسر اضافی شما را به اشتراک مناسب برساند.',
      'Chatta med Dealett-AI': 'گفتگو با Dealett AI',
      'Rekommenderas': 'پیشنهاد شده',
      'Vi ger presentkort på varje köp': 'با هر خرید کارت هدیه می‌دهیم',
      'Välj bland populära varumärken och få ett presentkort när du hittar rätt abonnemang via Dealett.': 'از میان برندهای محبوب انتخاب کنید و وقتی از طریق Dealett اشتراک مناسب را پیدا کردید، کارت هدیه بگیرید.',
      'Exempel på presentkort': 'نمونه کارت هدیه',
      'Täckning & nät': 'پوشش و شبکه',
      'Välj operatör och utforska kartan': 'اپراتور را انتخاب کنید و نقشه را بررسی کنید',
      'Se täckning, jämför nät och sök direkt på adress eller stad för att få en tydligare bild av läget där du bor.': 'پوشش را ببینید، شبکه‌ها را مقایسه کنید و با آدرس یا شهر جستجو کنید تا وضعیت محل زندگی خود را بهتر ببینید.',
      'Operatörer': 'اپراتورها',
      'Välj operatör': 'انتخاب اپراتور',
      'Filter': 'فیلتر',
      'Nät': 'شبکه',
      'Täckningsinformationen är en uppskattning och inte ett löfte.': 'اطلاعات پوشش تخمینی است و وعده قطعی نیست.',
      'Läs mer →': 'بیشتر بخوانید ->',
      'Sök': 'جستجو',
      'Sök adress eller plats': 'جستجوی آدرس یا مکان',
      'Ingen täckning': 'بدون پوشش',
      'Begränsad': 'محدود',
      'Grundläggande': 'پایه',
      'Bra': 'خوب',
      'Utmärkt täckning': 'پوشش عالی',
      'Nuvarande plats': 'مکان فعلی',
      'Helskärm': 'تمام‌صفحه',
      'Zooma ut': 'کوچک‌نمایی',
      'Zooma in': 'بزرگ‌نمایی',
      'Zoomnivå:': 'سطح زوم:',
      'Analyserar svar...': 'در حال تحلیل پاسخ‌ها...',
      'Inga träffar just nu': 'در حال حاضر نتیجه‌ای نیست',
      'Testa att gå tillbaka och justera prisnivå eller surfbehov så visar vi fler relevanta alternativ.': 'برگردید و سطح قیمت یا نیاز دیتا را تغییر دهید تا گزینه‌های مرتبط‌تری نمایش دهیم.',
      'Bäst match': 'بهترین تطابق',
      'Surf': 'دیتا',
      'Pris': 'قیمت',
      'Till varukorg': 'رفتن به سبد خرید',
      'Fria samtal och sms': 'تماس و پیامک رایگان',
      'Dubbel surf i 24 mån': 'دیتای دوبرابر برای ۲۴ ماه',
      'Dubbel surf i 24 mÃ¥n': 'دیتای دوبرابر برای ۲۴ ماه',
      'Streaming ingår': 'استریم شامل است',
      'Streaming ingÃ¥r': 'استریم شامل است',
      '5G och fria samtal': '5G و تماس رایگان',
      'Surfpotten ingår': 'بسته دیتا شامل است',
      'Surfpotten ingÃ¥r': 'بسته دیتا شامل است',
      'Netflix, HBO, Disney+ ingår': 'Netflix، HBO و Disney+ شامل است',
      'Netflix, HBO, Disney+ ingÃ¥r': 'Netflix، HBO و Disney+ شامل است',
      '5G upp till 100 Mbit/s': '5G تا 100 Mbit/s',
      'Säkerhetspaket': 'بسته امنیتی',
      'SÃ¤kerhetspaket': 'بسته امنیتی',
      '5G upp till 1000 Mbit/s': '5G تا 1000 Mbit/s',
      'EU-roaming': 'رومینگ اتحادیه اروپا',
      '5G ingår': '5G شامل است',
      '5G ingÃ¥r': '5G شامل است',
      'Miniabonnemang': 'اشتراک کوچک',
      'För dig som surfar mycket': 'برای مصرف دیتای زیاد',
      'FÃ¶r dig som surfar mycket': 'برای مصرف دیتای زیاد',
      'Tel: 08-123 45 67': 'تلفن: 08-123 45 67'
    }
  };

  const normalizeTranslationKey = (value) => String(value || '').replace(/\s+/g, ' ').trim();

  const getSavedLanguage = () => {
    const saved = localStorage.getItem('dealettLanguage');
    return supportedLanguages.includes(saved) ? saved : 'sv';
  };

  const applyPatternTranslation = (text, language) => {
    const replacements = {
      en: [
        [/^(\d+) var(?:a|or) i varukorgen$/, '$1 item(s) in the cart'],
        [/^Alternativ (\d+)$/, 'Option $1'],
        [/^(\d+) abonnemang$/, '$1 subscriptions'],
        [/^(\d[\d\s]*) kr\/p$/, '$1 SEK/person'],
        [/^(\d[\d\s]*) kr\/mån$/, '$1 SEK/month'],
        [/^(\d[\d\s]*) kr\/mÃ¥n$/, '$1 SEK/month'],
        [/^(\d[\d\s]*) kr totalt$/, '$1 SEK total'],
        [/^Presentkort ([\d\s]+) kr$/, 'Gift card $1 SEK']
      ],
      ar: [
        [/^(\d+) var(?:a|or) i varukorgen$/, '$1 عنصر في السلة'],
        [/^Alternativ (\d+)$/, 'الخيار $1'],
        [/^(\d+) abonnemang$/, '$1 اشتراكات'],
        [/^(\d[\d\s]*) kr\/p$/, '$1 كرونة/شخص'],
        [/^(\d[\d\s]*) kr\/mån$/, '$1 كرونة/شهر'],
        [/^(\d[\d\s]*) kr\/mÃ¥n$/, '$1 كرونة/شهر'],
        [/^(\d[\d\s]*) kr totalt$/, '$1 كرونة إجمالا'],
        [/^Presentkort ([\d\s]+) kr$/, 'بطاقة هدية $1 كرونة']
      ],
      so: [
        [/^(\d+) var(?:a|or) i varukorgen$/, '$1 shay gaadhiga ku jira'],
        [/^Alternativ (\d+)$/, 'Xulasho $1'],
        [/^(\d+) abonnemang$/, '$1 rukun'],
        [/^(\d[\d\s]*) kr\/p$/, '$1 kr/qof'],
        [/^(\d[\d\s]*) kr\/mån$/, '$1 kr/bil'],
        [/^(\d[\d\s]*) kr\/mÃ¥n$/, '$1 kr/bil'],
        [/^(\d[\d\s]*) kr totalt$/, '$1 kr wadar'],
        [/^Presentkort ([\d\s]+) kr$/, 'Kaar hadiyad $1 kr']
      ],
      fa: [
        [/^(\d+) var(?:a|or) i varukorgen$/, '$1 مورد در سبد خرید'],
        [/^Alternativ (\d+)$/, 'گزینه $1'],
        [/^(\d+) abonnemang$/, '$1 اشتراک'],
        [/^(\d[\d\s]*) kr\/p$/, '$1 کرون/نفر'],
        [/^(\d[\d\s]*) kr\/mån$/, '$1 کرون/ماه'],
        [/^(\d[\d\s]*) kr\/mÃ¥n$/, '$1 کرون/ماه'],
        [/^(\d[\d\s]*) kr totalt$/, '$1 کرون مجموع'],
        [/^Presentkort ([\d\s]+) kr$/, 'کارت هدیه $1 کرون']
      ]
    };

    for (const [pattern, replacement] of replacements[language] || []) {
      if (pattern.test(text)) {
        return text.replace(pattern, replacement);
      }
    }

    return null;
  };

  const translateKey = (key, language = activeLanguage) => {
    if (!key) return key;
    return translations[language]?.[key] || applyPatternTranslation(key, language) || key;
  };

  const withOriginalWhitespace = (source, translated) => {
    const leading = source.match(/^\s*/)?.[0] || '';
    const trailing = source.match(/\s*$/)?.[0] || '';
    return `${leading}${translated}${trailing}`;
  };

  const translateTextNode = (node) => {
    const rawValue = node.nodeValue || '';
    const key = normalizeTranslationKey(rawValue);

    if (!key) {
      return;
    }

    const existing = textNodeMemory.get(node);
    const original = existing && key === existing.lastKey ? existing.original : key;
    const translated = translateKey(original);

    if (translated !== key) {
      const nextValue = withOriginalWhitespace(rawValue, translated);
      node.nodeValue = nextValue;
      textNodeMemory.set(node, {
        original,
        lastKey: normalizeTranslationKey(nextValue)
      });
    } else if (!existing) {
      textNodeMemory.set(node, { original, lastKey: key });
    }
  };

  const shouldSkipNode = (node) => {
    const parent = node.parentElement;
    return !parent || ['SCRIPT', 'STYLE', 'NOSCRIPT', 'OPTION'].includes(parent.tagName);
  };

  const translateAttributes = (root) => {
    const attributeNames = ['aria-label', 'placeholder', 'title'];
    const elements = root.nodeType === Node.ELEMENT_NODE ? [root, ...root.querySelectorAll('*')] : [];

    elements.forEach((element) => {
      if (element.tagName === 'OPTION') return;

      attributeNames.forEach((attributeName) => {
        if (!element.hasAttribute(attributeName)) return;

        const current = element.getAttribute(attributeName);
        const key = normalizeTranslationKey(current);
        if (!key) return;

        const storedForElement = attrMemory.get(element) || {};
        const stored = storedForElement[attributeName];
        const original = stored && key === stored.lastKey ? stored.original : key;
        const translated = translateKey(original);

        if (translated !== key) {
          element.setAttribute(attributeName, translated);
          storedForElement[attributeName] = {
            original,
            lastKey: normalizeTranslationKey(translated)
          };
          attrMemory.set(element, storedForElement);
        }
      });
    });
  };

  const applyTranslations = (root = document.body) => {
    if (!root) return;

    isApplyingTranslations = true;
    document.documentElement.lang = activeLanguage;
    document.documentElement.dir = rtlLanguages.has(activeLanguage) ? 'rtl' : 'ltr';

    if (document.title) {
      originalDocumentTitle ||= normalizeTranslationKey(document.title);
      document.title = translateKey(originalDocumentTitle);
    }

    translateAttributes(root);

    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: (node) => (shouldSkipNode(node) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT)
    });

    let node = walker.nextNode();
    while (node) {
      translateTextNode(node);
      node = walker.nextNode();
    }

    isApplyingTranslations = false;
  };

  const scheduleTranslation = () => {
    if (isApplyingTranslations || translationFrame) return;

    translationFrame = window.requestAnimationFrame(() => {
      translationFrame = 0;
      applyTranslations();
    });
  };

  const setLanguage = (language) => {
    activeLanguage = supportedLanguages.includes(language) ? language : 'en';
    localStorage.setItem('dealettLanguage', activeLanguage);
    document.querySelectorAll('[data-language-switcher]').forEach((select) => {
      select.value = activeLanguage;
    });
    applyTranslations();
  };

  const initTranslations = () => {
    activeLanguage = getSavedLanguage();

    document.querySelectorAll('[data-language-switcher]').forEach((select) => {
      select.value = activeLanguage;
      select.addEventListener('change', () => setLanguage(select.value));
    });

    applyTranslations();

    translationObserver?.disconnect();
    translationObserver = new MutationObserver((mutations) => {
      if (isApplyingTranslations) return;

      if (mutations.some((mutation) => mutation.type === 'childList' || mutation.type === 'characterData')) {
        scheduleTranslation();
      }
    });

    translationObserver.observe(document.body, {
      childList: true,
      characterData: true,
      subtree: true
    });
  };

  window.DEALETT_I18N = {
    setLanguage,
    translate: translateKey,
    getLanguage: () => activeLanguage
  };

  const readCartCount = () => {
    try {
      const cart = JSON.parse(localStorage.getItem('dealettCart') || '[]');
      return Array.isArray(cart) ? cart.length : 0;
    } catch {
      return 0;
    }
  };

  const updateCartCount = () => {
    const count = readCartCount();

    document.querySelectorAll('[data-cart-count]').forEach((badge) => {
      badge.textContent = String(count);
      badge.classList.toggle('is-hidden', count <= 0);
      badge.setAttribute('aria-label', `${count} ${count === 1 ? 'vara' : 'varor'} i varukorgen`);
    });
  };

  window.DEALETT_updateCartCount = updateCartCount;

  const includePartials = async () => {
    const includeTargets = [...document.querySelectorAll('[data-include]')];

    await Promise.all(includeTargets.map(async (target) => {
      const includeName = target.dataset.include;
      const partialPath = partials[includeName];

      if (!partialPath) {
        return;
      }

      try {
        const template = document.createElement('template');
        const html = await window.DealettNetwork.fetchText(partialPath, {
          label: `Partial ${includeName}`,
        });
        template.innerHTML = html.trim();
        target.replaceWith(template.content.cloneNode(true));
      } catch {
        target.hidden = true;
      }
    }));
  };

  const setHeaderActiveState = () => {
    document.querySelectorAll('.nav-item--active').forEach((item) => {
      item.classList.remove('nav-item--active');
    });

    document.querySelectorAll('.nav-menu a[href]').forEach((link) => {
      link.classList.remove('is-active');
      link.removeAttribute('aria-current');

      const targetPage = link.getAttribute('href').split('#')[0].split('/').pop() || 'index.html';

      if (targetPage === currentPage) {
        link.classList.add('is-active');
        link.setAttribute('aria-current', 'page');

        const parentDropdown = link.closest('.nav-item--dropdown');
        const parentItem = parentDropdown || link.closest('.nav-item');

        parentItem?.classList.add('nav-item--active');
      }
    });

    document.querySelectorAll('.header-topbar-link').forEach((link) => {
      const targetPage = link.getAttribute('href').split('#')[0].split('/').pop() || 'index.html';
      const isMainArea = currentPage !== 'foretag.html';
      const isActive = targetPage === currentPage || (targetPage === 'index.html' && isMainArea);

      link.classList.toggle('is-active', isActive);
    });
  };

  const initDropdowns = () => {
    const dropdowns = document.querySelectorAll('.nav-item--dropdown');

    dropdowns.forEach((dropdown) => {
      const toggle = dropdown.querySelector('.nav-dropdown-toggle');

      if (!toggle) {
        return;
      }

      toggle.addEventListener('click', () => {
        dropdowns.forEach((item) => {
          if (item !== dropdown) {
            item.classList.remove('open');
          }
        });

        dropdown.classList.toggle('open');
      });
    });

    document.addEventListener('click', (event) => {
      dropdowns.forEach((dropdown) => {
        if (!dropdown.contains(event.target)) {
          dropdown.classList.remove('open');
        }
      });
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        dropdowns.forEach((dropdown) => dropdown.classList.remove('open'));
      }
    });
  };

  const initHeaderMotion = () => {
    const header = document.querySelector('.site-header');
    const hero = document.querySelector('.hero');

    if (!header && !hero) {
      return;
    }

    let lastScrollY = window.scrollY;
    let ticking = false;

    const updateOnScroll = () => {
      const nextScrollY = window.scrollY;

      if (header) {
        if (nextScrollY <= 0 || nextScrollY < lastScrollY) {
          header.classList.remove('is-hidden');
        } else if (nextScrollY > lastScrollY && nextScrollY > 80) {
          header.classList.add('is-hidden');
        }
      }

      if (hero) {
        const heroHeight = hero.offsetHeight || 1;
        const progress = Math.min(Math.max(nextScrollY / heroHeight, 0), 1);
        const maxShift = window.matchMedia('(max-width: 680px)').matches ? 32 : 90;
        const shift = Math.round(progress * -maxShift);

        hero.style.setProperty('--hero-shift', `${shift}px`);
      }

      lastScrollY = Math.max(nextScrollY, 0);
      ticking = false;
    };

    window.addEventListener(
      'scroll',
      () => {
        if (!ticking) {
          window.requestAnimationFrame(updateOnScroll);
          ticking = true;
        }
      },
      { passive: true }
    );

    updateOnScroll();
  };

  const initCoveragePreview = () => {
    const coverageApp = document.querySelector('#coverageApp');
    const hasDedicatedCoverageController = document.body.classList.contains('jamfor-page');

    if (!coverageApp || hasDedicatedCoverageController) {
      return;
    }

    coverageApp.querySelectorAll('.operator-card').forEach((operatorButton) => {
      operatorButton.addEventListener('click', () => {
        coverageApp.querySelectorAll('.operator-card').forEach((button) => {
          button.classList.remove('is-active');
        });

        operatorButton.classList.add('is-active');
      });
    });

    coverageApp.querySelectorAll('.coverage-filter').forEach((filterButton) => {
      filterButton.addEventListener('click', () => {
        filterButton.classList.toggle('is-active');
      });
    });

    const zoomLabel = coverageApp.querySelector('#visibleZoomLabel');
    let mapZoom = zoomLabel ? Number(zoomLabel.textContent) || 5 : 5;

    const setMapZoom = (nextZoom) => {
      mapZoom = Math.min(Math.max(nextZoom, 1), 12);

      if (zoomLabel) {
        zoomLabel.textContent = mapZoom;
      }
    };

    coverageApp.querySelectorAll('#zoomInBtn, #zoomInBtn2').forEach((button) => {
      button.addEventListener('click', () => setMapZoom(mapZoom + 1));
    });

    coverageApp.querySelectorAll('#zoomOutBtn, #zoomOutBtn2').forEach((button) => {
      button.addEventListener('click', () => setMapZoom(mapZoom - 1));
    });

    const mapSearchInput = coverageApp.querySelector('#mapSearchInput');
    const mapSearchButton = coverageApp.querySelector('#mapSearchBtn');

    if (mapSearchButton && mapSearchInput) {
      mapSearchButton.addEventListener('click', () => {
        mapSearchInput.focus();
      });
    }

    const mapCard = coverageApp.querySelector('.coverage-map-card');
    const fullscreenButton = coverageApp.querySelector('#fullscreenMapBtn');

    if (mapCard && fullscreenButton) {
      fullscreenButton.addEventListener('click', () => {
        mapCard.classList.toggle('is-fullscreen');
      });
    }
  };

  const CHAT_OPEN_KEY = 'dealett_ai_chat_open';
  const CHAT_HISTORY_KEY = 'dealett_ai_chat_history';
  const CHAT_SCRIPT_PATH = 'assets/dealett-chat.js';

  const readBrowserStorage = (storage, key) => {
    try {
      return storage.getItem(key);
    } catch {
      return null;
    }
  };

  const hasStoredChatState = () => (
    readBrowserStorage(sessionStorage, CHAT_OPEN_KEY) === 'true' ||
    readBrowserStorage(localStorage, CHAT_OPEN_KEY) === 'true' ||
    Boolean(readBrowserStorage(sessionStorage, CHAT_HISTORY_KEY)) ||
    Boolean(readBrowserStorage(localStorage, CHAT_HISTORY_KEY))
  );

  const markChatOpen = () => {
    try {
      sessionStorage.setItem(CHAT_OPEN_KEY, 'true');
      localStorage.removeItem(CHAT_OPEN_KEY);
    } catch {
      // Chat still loads if storage is unavailable.
    }
  };

  const ensureChatLauncherStyle = () => {
    if (document.getElementById('dealett-chat-launcher-style')) return;

    const style = document.createElement('style');
    style.id = 'dealett-chat-launcher-style';
    style.textContent = `
      #dealett-chat-launcher {
        position: fixed;
        right: 24px;
        bottom: 24px;
        z-index: 9998;
      }

      #dealett-chat-launcher button {
        display: inline-flex;
        align-items: center;
        gap: 10px;
        min-height: 48px;
        padding: 0 18px;
        border: none;
        border-radius: 999px;
        background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
        color: #fff;
        font: 700 14px/1.2 'Roboto', sans-serif;
        cursor: pointer;
        box-shadow: 0 16px 34px rgba(37, 99, 235, 0.28);
      }

      #dealett-chat-launcher button:disabled {
        cursor: progress;
        opacity: 0.82;
      }

      #dealett-chat-launcher .dealett-chat-launcher-dot {
        width: 9px;
        height: 9px;
        border-radius: 50%;
        background: #22c55e;
        box-shadow: 0 0 0 5px rgba(34, 197, 94, 0.2);
      }

      @media (max-width: 520px) {
        #dealett-chat-launcher {
          right: 16px;
          bottom: 16px;
        }
      }
    `;
    document.head.appendChild(style);
  };

  const removeChatLauncher = () => {
    document.getElementById('dealett-chat-launcher')?.remove();
  };

  const createChatLauncher = () => {
    if (
      document.getElementById('dealett-chat-launcher') ||
      document.querySelector('[data-dealett-ai-chat-root]')
    ) {
      return;
    }

    ensureChatLauncherStyle();

    const launcher = document.createElement('div');
    launcher.id = 'dealett-chat-launcher';

    const button = document.createElement('button');
    button.type = 'button';
    button.setAttribute('aria-label', 'Öppna Dealett-AI');

    const dot = document.createElement('span');
    dot.className = 'dealett-chat-launcher-dot';
    dot.setAttribute('aria-hidden', 'true');

    const label = document.createElement('span');
    label.textContent = 'Dealett-AI';

    button.append(dot, label);
    button.addEventListener('click', () => {
      button.disabled = true;
      button.setAttribute('aria-busy', 'true');
      loadDealettChat({ open: true });
    });

    launcher.appendChild(button);
    document.body.appendChild(launcher);
  };

  const loadDealettChat = ({ open = false } = {}) => {
    if (open) {
      markChatOpen();
    }

    removeChatLauncher();

    if (typeof window.initChat === 'function') {
      window.initChat().catch?.((error) => console.error('Chat init failed:', error));
      return;
    }

    const existingScript = document.querySelector(`script[src="${CHAT_SCRIPT_PATH}"]`);
    if (existingScript) {
      return;
    }

    const chatScript = document.createElement('script');
    chatScript.src = CHAT_SCRIPT_PATH;
    chatScript.defer = true;
    chatScript.dataset.dealettChatScript = 'true';
    chatScript.addEventListener('error', () => {
      console.error('Chat script failed to load.');
      createChatLauncher();
    }, { once: true });
    document.body.appendChild(chatScript);
  };

  const initDealettChat = () => {
    if (hasStoredChatState()) {
      loadDealettChat();
      return;
    }

    createChatLauncher();
  };

  const initGlobalBehaviors = () => {
    setHeaderActiveState();
    updateCartCount();
    initDropdowns();
    initHeaderMotion();
    initCoveragePreview();
    initTranslations();
    initDealettChat();
  };

  window.addEventListener('storage', (event) => {
    if (event.key === 'dealettCart') {
      updateCartCount();
    }
  });

  window.addEventListener('dealett:cart-updated', updateCartCount);

  window.DEALETT_includesReady = includePartials().finally(initGlobalBehaviors);
})();
