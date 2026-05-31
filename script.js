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
    return !parent ||
      ['SCRIPT', 'STYLE', 'NOSCRIPT', 'OPTION'].includes(parent.tagName) ||
      Boolean(parent.closest('[data-no-translate]'));
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

  const initDealettChat = () => {
    if (document.querySelector('#dealettChat')) return;

    const copy = {
      sv: {
        open: 'Öppna Dealett assistant',
        close: 'Stäng chatten',
        title: 'Dealett assistant',
        status: 'AI-rådgivare',
        greeting: 'Hej! Jag kan hjälpa dig jämföra abonnemang, bredband, täckning, presentkort och din varukorg.',
        placeholder: 'Skriv din fråga...',
        send: 'Skicka',
        typing: 'Dealett assistant skriver...',
        error: 'Jag kunde inte svara just nu. Kontrollera att AI-tjänsten är konfigurerad och försök igen.',
        suggestions: ['Hjälp mig välja mobilabonnemang', 'Vilket bredband passar mig?', 'Förklara presentkort', 'Vad finns i min varukorg?'],
      },
      en: {
        open: 'Open Dealett assistant',
        close: 'Close chat',
        title: 'Dealett assistant',
        status: 'AI advisor',
        greeting: 'Hi! I can help you compare mobile plans, broadband, coverage, gift cards, and your cart.',
        placeholder: 'Write your question...',
        send: 'Send',
        typing: 'Dealett assistant is typing...',
        error: 'I could not answer right now. Check that the AI service is configured and try again.',
        suggestions: ['Help me choose a mobile plan', 'Which broadband fits me?', 'Explain gift cards', 'What is in my cart?'],
      },
    };

    const getChatLanguage = () => (window.DEALETT_I18N?.getLanguage?.() === 'en' ? 'en' : 'sv');
    let chatLanguage = getChatLanguage();
    let text = copy[chatLanguage];
    const messages = [];
    const qualificationKey = 'dealettChatQualification';
    const offerCalculationKey = 'dealettChatOfferCalculation';
    let isSending = false;

    const root = document.createElement('section');
    root.id = 'dealettChat';
    root.className = 'dealett-chat';
    root.dataset.noTranslate = 'true';
    root.innerHTML = [
      `<button class="dealett-chat-toggle" type="button" aria-label="${text.open}" aria-expanded="false">`,
      '  <i class="fa-solid fa-comments"></i>',
      '  <span>AI</span>',
      '</button>',
      '<div class="dealett-chat-panel" role="dialog" aria-modal="false" aria-labelledby="dealettChatTitle" hidden>',
      '  <header class="dealett-chat-header">',
      '    <div>',
      `      <strong id="dealettChatTitle">${text.title}</strong>`,
      `      <span data-chat-status>${text.status}</span>`,
      '    </div>',
      '    <button class="dealett-chat-reset" type="button" aria-label="Starta om chatten"><i class="fa-solid fa-rotate-left"></i></button>',
      `    <button class="dealett-chat-close" type="button" aria-label="${text.close}"><i class="fa-solid fa-xmark"></i></button>`,
      '  </header>',
      '  <div class="dealett-chat-messages" role="log" aria-live="polite"></div>',
      '  <div class="dealett-chat-suggestions"></div>',
      '  <form class="dealett-chat-form">',
      `    <input class="dealett-chat-input" type="text" autocomplete="off" placeholder="${text.placeholder}" />`,
      `    <button class="dealett-chat-send" type="submit" aria-label="${text.send}"><i class="fa-solid fa-paper-plane"></i></button>`,
      '  </form>',
      '</div>',
    ].join('');

    document.body.append(root);

    const toggle = root.querySelector('.dealett-chat-toggle');
    const panel = root.querySelector('.dealett-chat-panel');
    const resetButton = root.querySelector('.dealett-chat-reset');
    const closeButton = root.querySelector('.dealett-chat-close');
    const messageList = root.querySelector('.dealett-chat-messages');
    const suggestionArea = root.querySelector('.dealett-chat-suggestions');
    const form = root.querySelector('.dealett-chat-form');
    const input = root.querySelector('.dealett-chat-input');
    const status = root.querySelector('[data-chat-status]');

    const escapeChatText = (value) => String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');

    const readCartContext = () => {
      try {
        return (window.DealettCart?.readCart?.() || JSON.parse(localStorage.getItem('dealettCart') || '[]'))
          .slice(0, 4)
          .map((item) => ({
            operator: item.operator,
            title: item.title,
            data: item.data,
            price: item.price,
            persons: item.persons,
            productType: item.productType,
            rewardTotal: item.rewardTotal,
          }));
      } catch {
        return [];
      }
    };

    const createEmptyQualification = () => ({
      peopleCount: null,
      operators: [],
      bindingEnds: [],
      mobileUsage: null,
      priceRange: null,
      exactMonthlyPrice: null,
      exactMonthlyPrices: [],
      readyForOffer: false,
      missingFields: ['peopleCount', 'operators', 'bindingEnds', 'mobileUsage', 'priceRange'],
    });

    const readQualification = () => {
      try {
        const raw = sessionStorage.getItem(qualificationKey);
        return raw ? { ...createEmptyQualification(), ...JSON.parse(raw) } : createEmptyQualification();
      } catch {
        return createEmptyQualification();
      }
    };

    const writeQualification = (qualification) => {
      if (!qualification || typeof qualification !== 'object') return;

      try {
        sessionStorage.setItem(qualificationKey, JSON.stringify({
          ...createEmptyQualification(),
          ...qualification,
        }));
      } catch {
        // Keep chat usable if session storage is unavailable.
      }
    };

    const writeOfferCalculation = (offerCalculation) => {
      if (!offerCalculation || typeof offerCalculation !== 'object') return;

      try {
        sessionStorage.setItem(offerCalculationKey, JSON.stringify(offerCalculation));
      } catch {
        // Keep chat usable if session storage is unavailable.
      }
    };

    const mergeQualification = (patch) => {
      if (!patch || typeof patch !== 'object') return;
      writeQualification({
        ...readQualification(),
        ...patch,
      });
    };

    const inferSuggestion = (suggestion) => {
      const getActionFromLabel = (label, action) => {
        if (action) return action;
        if (/skriv adress|ange adress|sök adress|enter address|search address/i.test(label)) return 'openBroadbandAddress';
        if (/öppna täckningskarta|coverage map/i.test(label)) return 'openCoverageMap';
        if (/öppna 5g|5g-bredband|broadband/i.test(label)) return 'openBroadbandPage';
        if (/öppna varukorg|open cart|my cart|min varukorg/i.test(label)) return 'openCart';
        if (/mina sidor|konto|account/i.test(label)) return 'openAccount';
        if (/kontakt|support|kundservice|contact/i.test(label)) return 'openContact';
        return null;
      };

      if (suggestion && typeof suggestion === 'object') {
        const label = String(suggestion.label || '').trim();
        return {
          ...suggestion,
          label,
          action: getActionFromLabel(label, suggestion.action),
        };
      }

      const label = String(suggestion || '').trim();
      const normalized = label.toLowerCase();
      const patchMap = [
        { test: /^1$/, patch: { peopleCount: 1 } },
        { test: /^2$/, patch: { peopleCount: 2 } },
        { test: /^3$/, patch: { peopleCount: 3 } },
        { test: /^4$/, patch: { peopleCount: 4 } },
        { test: /5\+/, patch: { peopleCount: 5 } },
        { test: /lite surf|wifi|social/i, patch: { mobileUsage: 'low' } },
        { test: /streaming|video/i, patch: { mobileUsage: 'medium' } },
        { test: /max surf|obegränsad|unlimited/i, patch: { mobileUsage: 'high' } },
        { test: /under 300/i, patch: { priceRange: 'under300' } },
        { test: /300.?400/i, patch: { priceRange: '300-400' } },
        { test: /400.?500/i, patch: { priceRange: '400-500' } },
      ];
      const operator = ['Telia', 'Tele2', 'Telenor', 'Tre', 'Halebop']
        .find((item) => item.toLowerCase() === normalized);

      if (operator) {
        return {
          label,
          qualificationPatch: {
            operators: [...readQualification().operators, operator],
          },
        };
      }

      const mapped = patchMap.find((item) => item.test.test(label));
      if (mapped) return { label, qualificationPatch: mapped.patch };
      if (/ingen bindningstid/i.test(label)) {
        return {
          label,
          qualificationPatch: {
            bindingEnds: [...readQualification().bindingEnds, 'Ingen bindningstid'],
          },
        };
      }
      if (/vet inte/i.test(label)) {
        return {
          label,
          qualificationPatch: {
            bindingEnds: [...readQualification().bindingEnds, 'Vet inte'],
          },
        };
      }
      if (/öppna täckningskarta|coverage map/i.test(label)) {
        return { label, action: 'openCoverageMap' };
      }
      if (/öppna 5g|broadband/i.test(label)) {
        return { label, action: 'openBroadbandPage' };
      }

      return { label };
    };

    const syncLanguage = () => {
      chatLanguage = getChatLanguage();
      text = copy[chatLanguage];
      status.textContent = text.status;
      input.placeholder = text.placeholder;
      toggle.setAttribute('aria-label', text.open);
      closeButton.setAttribute('aria-label', text.close);
      root.querySelector('.dealett-chat-send')?.setAttribute('aria-label', text.send);
    };

    const scrollMessages = () => {
      messageList.scrollTop = messageList.scrollHeight;
    };

    const addMessage = (role, content) => {
      const item = document.createElement('article');
      item.className = `dealett-chat-message dealett-chat-message--${role}`;
      item.innerHTML = `<p>${escapeChatText(content)}</p>`;
      messageList.append(item);
      messages.push({ role, content });
      if (messages.length > 10) messages.splice(0, messages.length - 10);
      scrollMessages();
    };

    const renderSuggestions = (suggestions) => {
      suggestionArea.replaceChildren();
      suggestions.slice(0, 5).map(inferSuggestion).forEach((suggestion) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'dealett-chat-chip';
        button.textContent = suggestion.label;
        button.addEventListener('click', () => {
          if (suggestion.qualificationPatch) {
            mergeQualification(suggestion.qualificationPatch);
          }

          if (suggestion.action === 'openCoverageMap') {
            if (window.location.pathname.endsWith('/5g-bredband.html')) {
              document.querySelector('#openCoverageModal')?.click();
            } else {
              window.location.href = '5g-bredband.html';
            }
            return;
          }

          if (suggestion.action === 'openBroadbandPage') {
            window.location.href = '5g-bredband.html#offersSection';
            return;
          }

          if (suggestion.action === 'openBroadbandAddress') {
            if (window.location.pathname.endsWith('/5g-bredband.html')) {
              window.DealettBroadband?.focusAddressSearch?.();
              document.querySelector('#addressSearchForm')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
              document.querySelector('#addressInput')?.focus();
            } else {
              try {
                sessionStorage.setItem('dealettFocusBroadbandAddress', 'true');
              } catch {
                // Keep navigation usable if session storage is unavailable.
              }
              window.location.href = '5g-bredband.html#addressSearchForm';
            }
            return;
          }

          if (suggestion.action === 'openCart') {
            const cart = window.DealettCart?.readCart?.() || [];
            if (window.DealettCart?.openDrawer) {
              window.DealettCart.openDrawer(cart);
            } else {
              window.location.href = 'varukorg.html';
            }
            return;
          }

          if (suggestion.action === 'openAccount') {
            window.location.href = 'account.html';
            return;
          }

          if (suggestion.action === 'openContact') {
            window.location.href = 'kontakt.html';
            return;
          }

          sendMessage(suggestion.label);
        });
        suggestionArea.append(button);
      });
    };

    const getProviderClass = (operator) => String(operator || '')
      .toLowerCase()
      .replace('å', 'a')
      .replace('ä', 'a')
      .replace('ö', 'o')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    const addCalculatedOfferToCart = async (planId) => {
      const response = await window.DealettNetwork.fetchJson('/api/offers/cart-item', {
        label: 'Dealett erbjudande till varukorg',
        method: 'POST',
        timeoutMs: 10000,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId,
          qualification: readQualification(),
        }),
      });
      const cart = window.DealettCart.appendItem(response.cartItem, {
        state: response.state,
      });
      window.DealettCart.openDrawer(cart);
      addMessage(
        'assistant',
        `${response.cartItem.operator} ${response.cartItem.title} är lagt i varukorgen. Fortsätt i varukorgen för nummerflytt, startdatum, kontaktuppgifter och signering.`
      );
      renderSuggestions([{ label: 'Öppna varukorg', action: 'openCart' }]);
      return response;
    };

    const renderOfferCards = (offerCalculation) => {
      if (!offerCalculation?.readyForOffer || !offerCalculation.options?.length) return;

      const wrap = document.createElement('div');
      wrap.className = 'dealett-chat-offers';
      offerCalculation.options.forEach((option, index) => {
        const providerClass = getProviderClass(option.operator);
        const article = document.createElement('article');
        article.className = [
          'offer-card',
          'dealett-chat-offer-card',
          index === 0 ? 'offer-card--top' : '',
          providerClass ? `provider-card--${providerClass}` : '',
        ].filter(Boolean).join(' ');
        article.innerHTML = [
          '<div class="offer-card__accent"></div>',
          '<div class="offer-card__inner">',
          `  <span class="offer-card__label">${index === 0 ? 'Bäst match' : `Alternativ ${index + 1}`}</span>`,
          `  <h4 class="dealett-chat-offer-title">${escapeChatText(option.operator)} ${escapeChatText(option.title)}</h4>`,
          '  <div class="offer-card__stats">',
          `    <div class="offer-card__stat"><span class="offer-card__stat-icon"><i class="fa-solid fa-tag"></i></span><div><p class="offer-card__stat-label">Pris</p><p class="offer-card__stat-value">${option.monthlyPrice.toLocaleString('sv-SE')} kr/mån</p></div></div>`,
          `    <div class="offer-card__stat"><span class="offer-card__stat-icon"><i class="fa-solid fa-user-group"></i></span><div><p class="offer-card__stat-label">Per person</p><p class="offer-card__stat-value">${option.pricePerPerson.toLocaleString('sv-SE')} kr</p></div></div>`,
          `    <div class="offer-card__stat"><span class="offer-card__stat-icon"><i class="fa-solid fa-gift"></i></span><div><p class="offer-card__stat-label">Presentkort</p><p class="offer-card__stat-value">${option.rewardTotal.toLocaleString('sv-SE')} kr</p></div></div>`,
          `    <div class="offer-card__stat"><span class="offer-card__stat-icon"><i class="fa-solid fa-calculator"></i></span><div><p class="offer-card__stat-label">Est. vinst</p><p class="offer-card__stat-value">${option.savingsVsStaying.toLocaleString('sv-SE')} kr</p></div></div>`,
          '  </div>',
          option.currentMonthlyPriceIsEstimate ? '  <p class="dealett-chat-offer-note">Uppskattat från prisintervall. För exakt beräkning behövs exakt nuvarande pris och bindningsdatum.</p>' : '',
          `  <button class="offer-card__cta dealett-chat-offer-cta" type="button" data-chat-add-plan="${escapeChatText(option.planId)}">Lägg i varukorg <i class="fa-solid fa-cart-shopping"></i></button>`,
          '</div>',
        ].join('');
        wrap.append(article);
      });

      wrap.addEventListener('click', (event) => {
        const button = event.target.closest('[data-chat-add-plan]');
        if (!button) return;
        button.disabled = true;
        const previousLabel = button.innerHTML;
        button.innerHTML = 'Lägger till... <i class="fa-solid fa-spinner fa-spin"></i>';
        addCalculatedOfferToCart(button.dataset.chatAddPlan).then(() => {
          button.innerHTML = 'Tillagd i varukorg <i class="fa-solid fa-check"></i>';
        }).catch(() => {
          button.disabled = false;
          button.innerHTML = previousLabel;
          addMessage('assistant', text.error);
        });
      });

      messageList.append(wrap);
      scrollMessages();
    };

    const setSending = (nextValue) => {
      isSending = nextValue;
      input.disabled = nextValue;
      root.querySelector('.dealett-chat-send').disabled = nextValue;
      status.textContent = nextValue ? text.typing : text.status;
    };

    const sendMessage = async (rawMessage) => {
      const message = String(rawMessage || '').trim();
      if (!message || isSending) return;

      addMessage('user', message);
      input.value = '';
      setSending(true);

      try {
        const response = await window.DealettNetwork.fetchJson('/api/chat', {
          label: 'Dealett assistant',
          method: 'POST',
          timeoutMs: 20000,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message,
            language: chatLanguage,
            messages: messages.slice(0, -1),
            qualification: readQualification(),
            cart: readCartContext(),
            page: {
              title: document.title,
              path: window.location.pathname.split('/').pop() || 'index.html',
            },
          }),
        });

        addMessage('assistant', response.reply);
        writeQualification(response.qualification);
        writeOfferCalculation(response.offerCalculation);
        renderOfferCards(response.offerCalculation);
        renderSuggestions(response.suggestions || text.suggestions);
      } catch {
        addMessage('assistant', text.error);
        renderSuggestions(text.suggestions);
      } finally {
        setSending(false);
        input.focus();
      }
    };

    const openPanel = () => {
      syncLanguage();
      panel.hidden = false;
      root.classList.add('is-open');
      toggle.setAttribute('aria-expanded', 'true');
      if (!messages.length) {
        addMessage('assistant', text.greeting);
        renderSuggestions(text.suggestions);
      }
      window.setTimeout(() => input.focus(), 50);
    };

    const closePanel = () => {
      panel.hidden = true;
      root.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.focus();
    };

    toggle.addEventListener('click', () => {
      if (panel.hidden) openPanel();
      else closePanel();
    });

    closeButton.addEventListener('click', closePanel);

    resetButton.addEventListener('click', () => {
      sessionStorage.removeItem(qualificationKey);
      sessionStorage.removeItem(offerCalculationKey);
      messages.splice(0, messages.length);
      messageList.replaceChildren();
      addMessage('assistant', text.greeting);
      renderSuggestions(text.suggestions);
      input.focus();
    });

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      sendMessage(input.value);
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && !panel.hidden) {
        closePanel();
      }
    });
  };

  const initGlobalBehaviors = () => {
    setHeaderActiveState();
    updateCartCount();
    initDropdowns();
    initHeaderMotion();
    initCoveragePreview();
    initDealettChat();
    initTranslations();
  };

  window.addEventListener('storage', (event) => {
    if (event.key === 'dealettCart') {
      updateCartCount();
    }
  });

  window.addEventListener('dealett:cart-updated', updateCartCount);

  window.DEALETT_includesReady = includePartials().finally(initGlobalBehaviors);
})();
