/* Numeroloģijas aprēķinu dzinējs – pārcelts no Google Apps Script uz tīru JavaScript */

function calculateNumerology(payload) {
  payload = payload || {};

  const firstName = normalizeNameInput_(String(payload.firstName || '').trim());
  const lastName = normalizeNameInput_(String(payload.lastName || '').trim());
  const fatherName = normalizeNameInput_(String(payload.fatherName || '').trim());

  const birthDateRaw = String(payload.birthDate || '').trim();
  const analysisDateRaw = String(payload.analysisDate || '').trim();

  if (!firstName) throw new Error('Ievadi vārdu.');
  if (!lastName) throw new Error('Ievadi uzvārdu.');
  if (!birthDateRaw) throw new Error('Ievadi dzimšanas datumu.');
  if (!analysisDateRaw) throw new Error('Ievadi izpētes datumu.');

  const birth = parseFlexibleDate_(birthDateRaw, 'Dzimšanas datums');
  const analysis = parseFlexibleDate_(analysisDateRaw, 'Izpētes datums');

  const birthIso = formatDateIso_(birth);
  const analysisIso = formatDateIso_(analysis);
  const birthDisplay = formatDateLv_(birth);
  const analysisDisplay = formatDateLv_(analysis);

  const alphabet = detectAlphabet_(firstName + lastName + fatherName);

  const nameData = calculateNameGroup_(firstName, alphabet);
  const surnameData = calculateNameGroup_(lastName, alphabet);
  const fatherData = fatherName ? calculateNameGroup_(fatherName, alphabet) : emptyNameGroup_();

  const matrix = buildPsychomatrix_(birthIso);

  const lifePath = reduceTo1to9_(sumDigitsOfString_(birthIso.replace(/\D/g, '')));
  const destiny = reduceTo1to9_(nameData.total + surnameData.total + fatherData.total);
  const maturity = reduceTo1to9_(lifePath + destiny);

  const externalNumbers = buildExternalNumbers_({
    nameData,
    surnameData,
    fatherData,
    lifePath,
    maturity
  });

  const outerMatrix = buildOuterMatrix_(externalNumbers.sequence);

  const personalYear = calcPersonalYear_(birth, analysis);
  const personalMonth = calcPersonalMonth_(personalYear, analysis);
  const personalDay = calcPersonalDay_(personalMonth, analysis);

  const explanations = buildExplanations_(matrix);

  return {
    ok: true,
    alphabet: alphabet,
    fullName: [firstName, lastName].filter(Boolean).join(' '),
    fatherName: fatherName || '',
    birthDate: birthIso,
    birthDateDisplay: birthDisplay,
    analysisDate: analysisIso,
    analysisDateDisplay: analysisDisplay,
    personalYear: personalYear,
    personalMonth: personalMonth,
    personalDay: personalDay,
    lifePath: lifePath,
    destiny: destiny,
    maturity: maturity,
    matrix: matrix,
    outer: {
      numbers: externalNumbers,
      matrix: outerMatrix
    },
    explanations: explanations
  };
}


function buildPsychomatrix_(birthDateIso) {
  const [yyyy, mm, dd] = birthDateIso.split('-').map(Number);

  if (!yyyy || !mm || !dd) {
    throw new Error('Nederīgs dzimšanas datums.');
  }

  const dayStr = String(dd).padStart(2, '0');
  const monthStr = String(mm).padStart(2, '0');
  const yearStr = String(yyyy);

  const birthDigits = (dayStr + monthStr + yearStr).split('').map(Number);

  const s1 = birthDigits.reduce((a, b) => a + b, 0);
  const s2 = digitSum_(s1);
  const s3 = s1 - 2 * Number(dayStr[0]);
  const s4 = digitSum_(Math.abs(s3));

  const allDigits = []
    .concat(birthDigits)
    .concat(String(s1).split('').map(Number))
    .concat(String(s2).split('').map(Number))
    .concat(String(Math.abs(s3)).split('').map(Number))
    .concat(String(s4).split('').map(Number));

  const counts = {1:0,2:0,3:0,4:0,5:0,6:0,7:0,8:0,9:0};

  allDigits.forEach(function(n) {
    if (n >= 1 && n <= 9) counts[n]++;
  });

  const cells = {
    c1: repeatDigit_(1, counts[1]),
    c2: repeatDigit_(4, counts[4]),
    c3: repeatDigit_(7, counts[7]),
    c4: repeatDigit_(2, counts[2]),
    c5: repeatDigit_(5, counts[5]),
    c6: repeatDigit_(8, counts[8]),
    c7: repeatDigit_(3, counts[3]),
    c8: repeatDigit_(6, counts[6]),
    c9: repeatDigit_(9, counts[9])
  };

  const lines = {
    purpose: counts[1] + counts[4] + counts[7],
    family: counts[2] + counts[5] + counts[8],
    habits: counts[3] + counts[6] + counts[9],
    selfEsteem: counts[1] + counts[2] + counts[3],
    work: counts[4] + counts[5] + counts[6],
    talent: counts[7] + counts[8] + counts[9],
    spirit: counts[1] + counts[5] + counts[9],
    temperament: counts[3] + counts[5] + counts[7]
  };

  return {
    counts: counts,
    cells: cells,
    lines: lines,
    aux: { s1: s1, s2: s2, s3: s3, s4: s4 }
  };
}

function buildExternalNumbers_(ctx) {
  const I = ctx.nameData.vowelReduced;
  const II = ctx.nameData.consonantReduced;
  const III = reduceTo1to9_(I + II);
  const IV = ctx.surnameData.vowelReduced;
  const V = ctx.surnameData.consonantReduced;
  const VI = reduceTo1to9_(IV + V);
  const XII = ctx.fatherData.vowelReduced;
  const XIII = ctx.fatherData.consonantReduced;
  const XIV = reduceTo1to9_(XII + XIII);
  const VII = reduceTo1to9_(I + IV + XII);
  const VIII = reduceTo1to9_(II + V + XIII);
  const IX = reduceTo1to9_(VII + VIII);
  const X = ctx.lifePath;
  const XI = ctx.maturity;

  const sequence = { I, II, III, IV, V, VI, VII, VIII, IX, X, XI, XII, XIII, XIV };

  return {
    sequence: sequence,
    name: ctx.nameData,
    surname: ctx.surnameData,
    father: ctx.fatherData
  };
}

function buildOuterMatrix_(sequence) {
  const counts = {1:0,2:0,3:0,4:0,5:0,6:0,7:0,8:0,9:0};
  Object.keys(sequence).forEach(function(key) {
    const n = Number(sequence[key]) || 0;
    if (n >= 1 && n <= 9) counts[n]++;
  });

  return {
    counts: counts,
    cells: {
      c1: repeatDigit_(1, counts[1]),
      c2: repeatDigit_(4, counts[4]),
      c3: repeatDigit_(7, counts[7]),
      c4: repeatDigit_(2, counts[2]),
      c5: repeatDigit_(5, counts[5]),
      c6: repeatDigit_(8, counts[8]),
      c7: repeatDigit_(3, counts[3]),
      c8: repeatDigit_(6, counts[6]),
      c9: repeatDigit_(9, counts[9])
    }
  };
}

function calculateNameGroup_(text, alphabet) {
  const chars = Array.from(text || '')
    .map(function(ch) { return normalizeChar_(ch, alphabet); })
    .filter(Boolean);

  let total = 0, vowelSum = 0, consonantSum = 0;

  chars.forEach(function(ch) {
    const entry = getAlphabetMap_(alphabet)[ch];
    if (!entry) return;
    total += entry.value;
    if (entry.vowel) vowelSum += entry.value;
    else consonantSum += entry.value;
  });

  return {
    text: text,
    total: total,
    vowelSum: vowelSum,
    consonantSum: consonantSum,
    totalReduced: reduceTo1to9_(total),
    vowelReduced: reduceTo1to9_(vowelSum),
    consonantReduced: reduceTo1to9_(consonantSum)
  };
}

function buildExplanations_(matrix) {
  const cellMeta = [
    { key: 'character', title: '1 – Raksturs', raw: matrix.cells.c1, count: matrix.counts[1] },
    { key: 'energy', title: '2 – Enerģija', raw: matrix.cells.c4, count: matrix.counts[2] },
    { key: 'interests', title: '3 – Intereses', raw: matrix.cells.c7, count: matrix.counts[3] },
    { key: 'health', title: '4 – Veselība', raw: matrix.cells.c2, count: matrix.counts[4] },
    { key: 'logic', title: '5 – Loģika', raw: matrix.cells.c5, count: matrix.counts[5] },
    { key: 'labor', title: '6 – Darbs', raw: matrix.cells.c8, count: matrix.counts[6] },
    { key: 'luck', title: '7 – Veiksme', raw: matrix.cells.c3, count: matrix.counts[7] },
    { key: 'duty', title: '8 – Pienākums', raw: matrix.cells.c6, count: matrix.counts[8] },
    { key: 'memory', title: '9 – Atmiņa', raw: matrix.cells.c9, count: matrix.counts[9] }
  ];

  const lineMeta = [
    { key: 'purpose', title: 'Mērķis', value: matrix.lines.purpose },
    { key: 'family', title: 'Ģimene', value: matrix.lines.family },
    { key: 'habits', title: 'Ieradumi', value: matrix.lines.habits },
    { key: 'selfEsteem', title: 'Pašvērtējums', value: matrix.lines.selfEsteem },
    { key: 'work', title: 'Darbs', value: matrix.lines.work },
    { key: 'talent', title: 'Talants', value: matrix.lines.talent },
    { key: 'spirit', title: 'Gars', value: matrix.lines.spirit },
    { key: 'temperament', title: 'Temperaments', value: matrix.lines.temperament }
  ];

  return {
    cells: cellMeta.map(function(item) {
      const lvl = getCellLevelKey_(item.count);
      return { title: item.title, value: item.raw, count: item.count, text: EXPLANATIONS_.cells[item.key][lvl] };
    }),
    lines: lineMeta.map(function(item) {
      const lvl = getLineLevelKey_(item.value);
      return { title: item.title, value: item.value, text: EXPLANATIONS_.lines[item.key][lvl] };
    })
  };
}

function getCellLevelKey_(count) {
  if (count <= 0) return 'none';
  if (count === 1) return 'one';
  if (count === 2) return 'two';
  if (count === 3) return 'three';
  return 'fourPlus';
}

function getLineLevelKey_(value) {
  if (value <= 2) return 'zeroToTwo';
  if (value <= 4) return 'threeToFour';
  if (value <= 6) return 'fiveToSix';
  return 'sevenPlus';
}

function emptyNameGroup_() {
  return { text:'', total:0, vowelSum:0, consonantSum:0, totalReduced:0, vowelReduced:0, consonantReduced:0 };
}

function calcPersonalYear_(birthDate, analysisDate) {
  const month = birthDate.getUTCMonth() + 1;
  const day = birthDate.getUTCDate();
  const analysisYear = analysisDate.getUTCFullYear();
  return reduceTo1to9_(sumDigits_(day) + sumDigits_(month) + sumDigits_(analysisYear));
}
function calcPersonalMonth_(personalYear, analysisDate) {
  const month = analysisDate.getUTCMonth() + 1;
  return reduceTo1to9_(personalYear + sumDigits_(month));
}
function calcPersonalDay_(personalMonth, analysisDate) {
  const day = analysisDate.getUTCDate();
  return reduceTo1to9_(personalMonth + sumDigits_(day));
}
function detectAlphabet_(text) { return /[А-Яа-яЁёЪъЫыЬьЭэЮюЯя]/.test(text) ? 'RU' : 'LATIN'; }
function getAlphabetMap_(alphabet) { return alphabet === 'RU' ? RU_MAP_ : LATIN_MAP_; }
function normalizeNameInput_(text) { return String(text || '').replace(/\s+/g, ' ').replace(/^\s+|\s+$/g, ''); }
function normalizeChar_(ch, alphabet) { if (!ch) return ''; const c = String(ch).trim(); if (!c) return ''; return alphabet === 'RU' ? c.toUpperCase() : c.toLowerCase(); }
function sumDigitsOfString_(str) { return String(str || '').replace(/\D/g, '').split('').filter(Boolean).map(Number).reduce(function(a,b){return a+b;},0); }
function reduceTo1to9_(num) { let n = Number(num) || 0; if (!n) return 0; while (n > 9) n = String(Math.abs(n)).split('').map(Number).reduce(function(a,b){return a+b;},0); return n; }
function digitSum_(num) { return String(Math.abs(Number(num) || 0)).split('').map(Number).reduce(function(a,b){return a+b;},0); }
function sumDigits_(num) { return String(Math.abs(Number(num) || 0)).split('').map(Number).reduce(function(a,b){return a+b;},0); }
function repeatDigit_(digit, count) { return count > 0 ? String(digit).repeat(count) : '–'; }

function parseFlexibleDate_(value, label) {
  const v = String(value || '').trim();
  let year, month, day;
  if (/^\d{4}-\d{2}-\d{2}$/.test(v)) {
    const p = v.split('-').map(Number); year = p[0]; month = p[1]; day = p[2];
  } else if (/^\d{2}\.\d{2}\.\d{4}$/.test(v)) {
    const p = v.split('.').map(Number); day = p[0]; month = p[1]; year = p[2];
  } else {
    throw new Error(label + ' jābūt formātā DD.MM.YYYY vai YYYY-MM-DD.');
  }
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() + 1 !== month || date.getUTCDate() !== day) {
    throw new Error(label + ' nav derīgs datums.');
  }
  return date;
}
function formatDateIso_(date) {
  const y = date.getUTCFullYear(), m = String(date.getUTCMonth()+1).padStart(2,'0'), d = String(date.getUTCDate()).padStart(2,'0');
  return y + '-' + m + '-' + d;
}
function formatDateLv_(date) {
  const y = date.getUTCFullYear(), m = String(date.getUTCMonth()+1).padStart(2,'0'), d = String(date.getUTCDate()).padStart(2,'0');
  return d + '.' + m + '.' + y;
}

const EXPLANATIONS_ = {
  cells: {
    character: {
      none: 'Raksturs ir mīkstāks un pielāgošanās parasti ir vieglāka nekā stingra savas pozīcijas aizstāvēšana. Pozitīvi – elastība un diplomātija. Sarežģītāk – grūtāk noturēt robežas un pieņemt stingrus lēmumus spiediena apstākļos.',
      one: 'Raksturs ir samērā mierīgs un līdzsvarots. Cilvēks spēj pastāvēt par sevi, bet parasti necenšas dominēt. Tas dod labu sadarbības potenciālu, ja vien sarežģītās situācijās nepietrūkst stingrības.',
      two: 'Raksturā ir redzams labs mugurkauls. Parasti cilvēks zina, ko grib, spēj aizstāvēt savas intereses un neļauj ar sevi viegli manipulēt. Labs līdzsvars starp rakstura stingrību un cilvēcību.',
      three: 'Raksturs ir spēcīgs, griba izteikta, vēlme noteikt virzienu ir augsta. Tas dod līdera potenciālu un noturību, bet reizēm var parādīties stūrgalvība vai neiecietība pret citu lēnāku tempu.',
      fourPlus: 'Ļoti spēcīga griba un ļoti izteikta iekšējā stingrība. Pozitīvajā variantā – līderība, izturība un spēja nest atbildību. Negatīvajā – kategoriskums, kontroles vajadzība un grūtības pieņemt citu pieeju.'
    },
    health: {
      none: 'Iedzimtais veselības un izturības resurss jāstiprina apzināti. Organisms var būt jutīgāks pret miega trūkumu, pārslodzi un haotisku dzīvesveidu. Palīdz stabils režīms, kustība un savlaicīga atjaunošanās.',
      one: 'Pamata veselības resurss ir labs. Ja dzīvesveids ir sakārtots, cilvēks parasti turas stabili. Tas nav ne īpaši vājš, ne īpaši pārmērīgs resurss – daudz izšķir ikdienas ieradumi.',
      two: 'Fiziskā noturība un atjaunošanās parasti ir virs vidējā. Cilvēks vieglāk panes slodzi un ātrāk atgūst spēkus. Labs pamats aktīvākam ritmam un lielākai darbspējai.',
      three: 'Veselības potenciāls ir ļoti labs. Organisms parasti ir izturīgs un noturīgs arī pie lielākas slodzes. Bīstamā vieta – sākt ignorēt ķermeņa signālus tikai tāpēc, ka tas ilgi tur.',
      fourPlus: 'Ļoti spēcīgs izturības resurss. Tas ir liels balsts visai matricai, taču tas nenozīmē neizsīkstošu rezervi. Gudrākais ceļš – izmantot šo potenciālu disciplinēti, nevis pārtērēt.'
    },
    luck: {
      none: 'Veiksmes faktors nav tas, uz ko droši paļauties. Vairāk rezultātu dos disciplīna, sagatavotība un konsekvents darbs. Tas nozīmē, ka dzīves kvalitāti visvairāk veido paša rīcība.',
      one: 'Ir atsevišķi veiksmes brīži un labvēlīgas sakritības. Veiksme parasti palīdz tad, kad cilvēks pats ir kustībā un dara savu daļu. Tas ir atbalsts, nevis garantija.',
      two: 'Veiksmes resurss ir labs. Sarežģītās situācijās apstākļi biežāk sakārtojas labvēlīgi, un dzīvē ir vairāk “pareizo durvju īstajā laikā”.',
      three: 'Veiksmes zīme ir ļoti spēcīga. Cilvēkam bieži šķiet, ka dzīve noteiktos brīžos viņu nes un palīdz. Svarīgi šo neuztvert kā pašsaprotamu un neaizvietot ar disciplīnas trūkumu.',
      fourPlus: 'Ļoti izteikts veiksmes un labvēlīgu sakritību faktors. Tas var dot spēcīgu atbalstu, bet reizē radīt ilūziju, ka viss atrisināsies pats. Vislabāk tas strādā kopā ar raksturu un darbu.'
    },
    energy: {
      none: 'Enerģijas resurss ir jūtīgs. Vajag vairāk atjaunošanās, klusuma un sakārtota ritma. Pārslodze, haoss un ilgstošs stress var ātri iztukšot spēkus, tāpēc svarīgi enerģiju lietot apzināti.',
      one: 'Pamata enerģija ir pietiekama ikdienas ritmam, bet tā nav bezgalīga. Ļoti daudz nosaka režīms, miegs, vide un motivācija. Ja ir skaidrs mērķis, jauda parasti parādās.',
      two: 'Enerģijas resurss ir labs. Cilvēks parasti var noturēt tempu, aktīvi iesaistīties dzīvē un samērā labi atgūties pēc slodzes. Tas dod dzīvīgumu un lielāku kustības rezervi.',
      three: 'Enerģija ir spēcīga un jūtama. Cilvēks var būt dzinējspēks sev un citiem, ietekmēt vidi un noturēt lielāku intensitāti. Svarīgi, lai šai jaudai būtu skaidrs virziens.',
      fourPlus: 'Enerģijas ir ļoti daudz. Tas ir liels resurss darbam, ietekmei un aktivitātei, bet bez līdzsvara var rasties nervozitāte, pārkaršana vai grūtības apstāties. Vajag gudru slodzes sadali.'
    },
    logic: {
      none: 'Loģika un secīga analīze nav galvenais instruments. Cilvēks biežāk balstās uz sajūtu, pieredzi vai impulsu. Tas nozīmē, ka lēmumus ir vērts apzināti pārbaudīt un nesteigties ar secinājumiem.',
      one: 'Loģiskais pamats ir pietiekams. Cilvēks parasti spēj saprast vienkāršas sakarības un pieņemt kvalitatīvus lēmumus pazīstamās situācijās. Sarežģītākās lietās var noderēt vairāk laika un struktūras.',
      two: 'Labs līdzsvars starp intuīciju un analīzi. Cilvēks bieži ātri saprot būtību un spēj pieņemt labus lēmumus. Tas ir spēcīgs resurss praksē, darbā un komunikācijā.',
      three: 'Loģika ir ļoti spēcīga. Cilvēks redz sakarības, modeļus un sekas, mēdz domāt vairākus soļus uz priekšu. Risks – kļūt pārlieku kritiskam vai neiecietīgam pret mazāk strukturētu domāšanu.',
      fourPlus: 'Ļoti ass prāts un ļoti spēcīga loģiski intuitīva uztvere. Tas ir liels resurss stratēģijai un analīzei, taču svarīgi nepazaudēt elastību un cilvēcisko siltumu.'
    },
    duty: {
      none: 'Pienākuma sajūta nav automātiska un biežāk atkarīga no iekšējās motivācijas nekā no ārēja “vajag”. Tas nozīmē, ka atbildību un saistību noturību jāattīsta apzināti.',
      one: 'Pamata atbildības izjūta ir. Cilvēks saprot pienākumus un robežu starp pareizo un nepareizo, taču ne vienmēr to notur vienlīdz stingri visās situācijās.',
      two: 'Pienākuma sajūta ir laba. Cilvēks cenšas pildīt doto vārdu, rīkoties korekti un uzņemties atbildību. Tas rada uzticamības iespaidu un palīdz noturēt stabilitāti attiecībās un darbā.',
      three: 'Atbildības un taisnīguma izjūta ir ļoti izteikta. Cilvēks bieži kļūst par balstu citiem, uzņemas nopietnus pienākumus un jūtas atbildīgs vairāk nekā vidēji. Risks – pārāk daudz nest uz sevi.',
      fourPlus: 'Ļoti spēcīgs morālais kodols un pienākuma sajūta. Pozitīvi – uzticamība, stingrs iekšējais pamats. Negatīvi – pārāk liela prasība pret sevi un citiem, grūtības atlaist kontroli.'
    },
    interests: {
      none: 'Interešu loks bieži ir šaurāks vai ļoti praktisks. Cilvēks vairāk iesaistās tajā, kam redz tiešu jēgu, nevis izziņas prieka dēļ. Tas dod fokusētu pieeju, bet mazāku spontānu ziņkāri.',
      one: 'Interese par jauno ir, bet tā ir izvēlīga. Cilvēks labprāt iedziļinās tajā, kas viņu tiešām aizrauj, un mierīgi ignorē pārējo. Tas labi strādā, ja atrasta sava joma.',
      two: 'Izziņa ir dzīva un pietiekami plaša. Cilvēks bieži grib saprast, mācīties un pētīt, kas notiek apkārt. Labs resurss mācībām, sarunām un profesionālai attīstībai.',
      three: 'Interese par zināšanām ir ļoti spēcīga. Cilvēks tiecas ne tikai uzzināt, bet arī saprast dziļāk, salīdzināt un analizēt. Risks – izkliede pa pārāk daudzām tēmām vienlaikus.',
      fourPlus: 'Ļoti intensīva izziņas vajadzība. Prāts grib būt kustībā, uzņemt informāciju un meklēt sakarības. Ja ir struktūra, tas dod izcilu potenciālu; ja nav – var rasties pārblīvējums un fokusa zudums.'
    },
    labor: {
      none: 'Darbs rutīnas vai pienākuma formā nav cilvēka dabiskākais režīms. Viņam svarīga jēga, interese un sajūta, ka darāmais nav tukšs. Bez tās disciplīna var kristies.',
      one: 'Darba resurss ir pietiekams, ja ir motivācija un skaidrs uzdevums. Cilvēks var strādāt labi, bet bez iekšējas jēgas vai iesaistes ātri zūd dzinulis.',
      two: 'Darba potenciāls ir labs. Cilvēks spēj noturēt slodzi, izdarīt savu daļu un novest lietas līdz rezultātam. Šis ir praktiskuma un uzticamības resurss.',
      three: 'Darba jauda ir ļoti augsta. Cilvēks var iznest lielu slodzi un ilgi strādāt, ja redz mērķi. Risks – sākt dzīvot tikai pienākuma režīmā un aizmirst par līdzsvaru.',
      fourPlus: 'Ļoti izteikta darba orientācija un liela darba intensitāte. Tas ir resurss lieliem sasniegumiem, bet arī pārstrādāšanās risks. Ļoti svarīgi saglabāt līdzsvaru starp darbu un dzīvi.'
    },
    memory: {
      none: 'Atmiņa un strukturēta uzkrāšana nav stiprākā puse. Informāciju biežāk jāorganizē ar pierakstiem, atkārtojumu un sistēmu. Tas nav trūkums, ja cilvēks atrod sev piemērotu darba stilu.',
      one: 'Pamata atmiņas resurss ir labs. Cilvēks spēj uztvert un paturēt svarīgo, it īpaši tad, ja informācija viņu interesē. Tas ir pietiekams līmenis ikdienai un darbam.',
      two: 'Atmiņa un spēja secināt no pieredzes ir virs vidējā. Cilvēks bieži labi savieno faktus un izmanto uzkrāto saprātīgos lēmumos. Tas palīdz mācīties no savas pieredzes.',
      three: 'Atmiņa un intelekts ir ļoti spēcīgi. Cilvēks spēj pamanīt sakarības, ātri analizēt un veidot precīzus secinājumus. Risks – pārmērīga dzīvošana domās un analīzē.',
      fourPlus: 'Ļoti augsts mentālais resurss. Ja tas ir līdzsvarā ar raksturu un enerģiju, tas dod ievērojamu intelektuālo spēku. Ja nav līdzsvara, prāts var kļūt pārslogots un atrauts no emocionālās realitātes.'
    }
  },
  lines: {
    purpose: {
      zeroToTwo: 'Mērķtiecība ir svārstīga. Vēlmes var būt, bet ne vienmēr pietiek noturības vai iekšējās disciplīnas tās realizēt līdz galam.',
      threeToFour: 'Mērķtiecība ir laba un līdzsvarota. Cilvēks parasti spēj turēt virzienu un neapstāties pie pirmā šķēršļa.',
      fiveToSix: 'Mērķa līnija ir spēcīga. Ir izteikta orientācija uz rezultātu, griba sasniegt iecerēto un noturēt fokusu arī sarežģītākos posmos.',
      sevenPlus: 'Mērķtiecība ir ļoti augsta. Tas var dot lielus sasniegumus, bet svarīgi, lai dzīve nepārvēršas tikai rezultātu un kontroldevu režīmā.'
    },
    family: {
      zeroToTwo: 'Ģimenes un tuvības tēma nav centrālā ass vai arī tai vajag apzinātu attīstīšanu. Attiecības šeit biežāk veidojas caur izvēli, nevis instinktīvu vajadzību.',
      threeToFour: 'Ģimenes līnija ir laba. Cilvēks saprot tuvības, partnerības un saikņu vērtību, un parasti var veidot samērā stabilas attiecības.',
      fiveToSix: 'Ģimenes tēma ir ļoti nozīmīga. Mājas sajūta, savējie un tuvās saites var būt viens no galvenajiem dzīves balstiem.',
      sevenPlus: 'Ļoti spēcīga orientācija uz ģimeni un saiknēm. Pozitīvi – lojalitāte un ieguldījums. Negatīvi – risks pārāk pieķerties vai gribēt kontrolēt attiecības.'
    },
    habits: {
      zeroToTwo: 'Stabilitāte un ieradumi nav ļoti noturīgi. Dzīvē var būt vairāk pārmaiņu, eksperimentu un grūtību turēties pie viena ritma.',
      threeToFour: 'Ir labs līdzsvars starp stabilitāti un elastību. Cilvēks spēj būt pietiekami uzticams, nezaudējot spēju pielāgoties.',
      fiveToSix: 'Ieradumi un stabilitāte ir spēcīgs balsts. Cilvēkam parasti patīk skaidrība, režīms un paredzama vide.',
      sevenPlus: 'Ļoti izteikta vajadzība pēc noteiktības un stabilitātes. Tas dod uzticamību, bet var traucēt pieņemt izmaiņas un jaunas situācijas.'
    },
    selfEsteem: {
      zeroToTwo: 'Pašvērtējums ir jūtīgs vai nevienmērīgs. Cilvēks var sevi novērtēt pārāk zemu vai ļoti atkarīgi no ārēja vērtējuma.',
      threeToFour: 'Pašvērtējums ir labs un samērā vesels. Cilvēks apzinās savu vērtību, neieslīgstot ne pašnoniecināšanā, ne augstprātībā.',
      fiveToSix: 'Pašvērtējuma līnija ir spēcīga. Cilvēks jūt savu vērtību un parasti neļauj sevi viegli ignorēt vai noniecināt.',
      sevenPlus: 'Pašvērtējums ir ļoti augsts. Tas var dot iekšēju stabilitāti, bet jāuzmanās no pārāk lielas pašpaļāvības vai augstprātības.'
    },
    work: {
      zeroToTwo: 'Darba efektivitāte ir nepastāvīga un ļoti atkarīga no veselības, enerģijas un motivācijas. Vajag skaidru ritmu un jēgpilnu slodzi.',
      threeToFour: 'Darba līnija ir laba. Cilvēks spēj organizēt darbu, izdarīt vajadzīgo un noturēt samērā stabilu rezultātu.',
      fiveToSix: 'Darba resurss ir ļoti spēcīgs. Šeit apvienojas praktiskums, izturība un spēja nodrošināt sev un citiem taustāmu rezultātu.',
      sevenPlus: 'Darba jauda ir ļoti augsta. Tas ir liels resurss realizācijai, bet ir svarīgi nepārvērst dzīvi tikai pienākumos un produktivitātē.'
    },
    talent: {
      zeroToTwo: 'Talants nav uzreiz redzams vai izpaužas klusāk. Tas drīzāk jāmeklē un jāattīsta apzināti, nevis jāgaida, ka tas pats atklāsies.',
      threeToFour: 'Talanta potenciāls ir labs. Ja cilvēks iegulda darbu, viņš var sasniegt ļoti pieklājīgu līmeni izvēlētajā jomā.',
      fiveToSix: 'Talanta resurss ir spēcīgs. Šeit jau redzams potenciāls izcelties, ja vien ir disciplīna un konsekventa attīstība.',
      sevenPlus: 'Talanta potenciāls ir ļoti spilgts. Ja tas netiek lietots, var rasties sajūta, ka dzīvē netiek izmantots viss dots apjoms.'
    },
    spirit: {
      zeroToTwo: 'Garīgā ass vēl veidojas vai izpaužas praktiskā, nevis dziļi reflektīvā veidā. Vērtību sistēmai vajag laiku un pieredzi.',
      threeToFour: 'Ir labs iekšējais balsts un jūtama vērtību sistēma. Cilvēks spēj balstīties uz saviem principiem arī pārmaiņu laikā.',
      fiveToSix: 'Garīgā ass ir spēcīga. Cilvēks skaidri jūt, kas viņam ir būtiski, un uz to balsta savus lēmumus un attieksmi pret dzīvi.',
      sevenPlus: 'Ļoti izteikta garīgā ass. Tas dod dziļumu un iekšēju stabilitāti, bet svarīgi nesastingt pārliekā kategoriskumā vai dogmatismā.'
    },
    temperament: {
      zeroToTwo: 'Temperaments ir mierīgāks vai selektīvāks. Fiziskā un intīmā tuvība parasti nav dominējošais dzīves dzinulis, svarīgāka var būt emocionālā drošība.',
      threeToFour: 'Temperaments ir labs un līdzsvarots. Cilvēks parasti spēj savienot jūtas, tuvību un fizisko pievilkmi bez krasām galējībām.',
      fiveToSix: 'Temperaments ir spēcīgs. Intīmā saderība attiecībās kļūst ļoti nozīmīga, un tās trūkums var radīt redzamu spriedzi.',
      sevenPlus: 'Temperaments ir ļoti izteikts. Tas var dot lielu intensitāti attiecībās, bet arī prasīt ļoti labu saderību un emocionālu briedumu.'
    }
  }
};

const LATIN_MAP_ = {'a':{value:1,vowel:true},'ā':{value:2,vowel:true},'b':{value:3,vowel:false},'c':{value:4,vowel:false},'č':{value:5,vowel:false},'d':{value:6,vowel:false},'e':{value:7,vowel:true},'ē':{value:8,vowel:true},'f':{value:9,vowel:false},'g':{value:1,vowel:false},'ģ':{value:2,vowel:false},'h':{value:3,vowel:false},'i':{value:4,vowel:true},'ī':{value:5,vowel:true},'j':{value:6,vowel:false},'k':{value:7,vowel:false},'ķ':{value:8,vowel:false},'l':{value:9,vowel:false},'ļ':{value:1,vowel:false},'m':{value:2,vowel:false},'n':{value:3,vowel:false},'ņ':{value:4,vowel:false},'o':{value:5,vowel:true},'p':{value:6,vowel:false},'r':{value:7,vowel:false},'s':{value:8,vowel:false},'š':{value:9,vowel:false},'t':{value:1,vowel:false},'u':{value:2,vowel:true},'ū':{value:3,vowel:true},'v':{value:4,vowel:false},'z':{value:5,vowel:false},'ž':{value:6,vowel:false},'ą':{value:2,vowel:true},'ę':{value:8,vowel:true},'ė':{value:9,vowel:true},'į':{value:5,vowel:true},'y':{value:6,vowel:true},'ų':{value:1,vowel:true},'q':{value:8,vowel:false},'w':{value:5,vowel:false},'x':{value:6,vowel:false}};
const RU_MAP_ = {'А':{value:1,vowel:true},'Б':{value:2,vowel:false},'В':{value:3,vowel:false},'Г':{value:4,vowel:false},'Д':{value:5,vowel:false},'Е':{value:6,vowel:true},'Ё':{value:7,vowel:true},'Ж':{value:8,vowel:false},'З':{value:9,vowel:false},'И':{value:1,vowel:true},'Й':{value:2,vowel:false},'К':{value:3,vowel:false},'Л':{value:4,vowel:false},'М':{value:5,vowel:false},'Н':{value:6,vowel:false},'О':{value:7,vowel:true},'П':{value:8,vowel:false},'Р':{value:9,vowel:false},'С':{value:1,vowel:false},'Т':{value:2,vowel:false},'У':{value:3,vowel:true},'Ф':{value:4,vowel:false},'Х':{value:5,vowel:false},'Ц':{value:6,vowel:false},'Ч':{value:7,vowel:false},'Ш':{value:8,vowel:false},'Щ':{value:9,vowel:false},'Ъ':{value:1,vowel:false},'Ы':{value:2,vowel:true},'Ь':{value:3,vowel:false},'Э':{value:4,vowel:true},'Ю':{value:5,vowel:true},'Я':{value:6,vowel:true}};

window.calculateNumerology = calculateNumerology;
