/* =========================================================
   DATA — the agreement, negotiation options, questions,
   career events, codex, achievements
   ========================================================= */
const CO = 'Hereinafter Holdings, LLC';
const CO_SHORT = 'Hereinafter';

/* Each section: n (number), title, text (legalese with [[flag phrases]]), plain (plain English), options.
   Option kinds: legal (General Counsel answers), money/perk (People Ops answers).
   result: accept | counter | reject. Effects are applied to RUN.terms. */
const CONTRACT = [
  {
    id: 's1', n: '1', title: 'Position & Compensation', who: 'dana',
    text: 'The Company employs Employee as Senior Operations Manager at an annual base salary of [[$95,000]], payable in accordance with the Company\'s regular payroll practices.',
    plain: 'Your job and your pay. Asking for more money is normal. It spends the same leverage as everything else.',
    options: [
      { id: 'salary', label: 'Ask for $102,000', sub: 'Market rate for the role.', cost: 3, kind: 'money',
        pitch: 'Based on the market for this role, I was hoping for a base of $102,000.',
        result: 'counter', reply: 'We can do $99,000.', counterFx: { salary: 4000 }, pushFx: { salary: 7000 },
        pushReply: 'Fine. $102,000. Don\'t tell anyone.', pushFail: '$99,000 is the best I can do.',
        ins: 'base salary of $102,000', insCounter: 'base salary of $99,000', del: '$95,000', note: 'Base salary $102,000', noteC: 'Base salary $99,000' },
      { id: 'signing', label: 'Ask for an $8,000 signing bonus', sub: 'One-time cash.', cost: 2, kind: 'money',
        pitch: 'Could we add an $8,000 signing bonus?', result: 'accept',
        reply: 'Done. Usual 12-month clawback if you leave early.', fx: { signing: 8000 },
        ins: 'plus a one-time signing bonus of $8,000' },
    ],
  },
  {
    id: 's2', n: '2', title: 'Duties', who: 'dana',
    text: 'Employee shall devote full business time and best efforts to the Company and shall perform [[such duties as the Company may assign]] from time to time.',
    plain: 'Standard language. "Such duties as the Company may assign" is broad, but that\'s normal for this section.',
    options: [
      { id: 'remote', label: 'Put remote Fridays in writing', sub: 'A little breathing room.', cost: 1, kind: 'perk',
        pitch: 'Could we write in remote Fridays?', result: 'accept', reply: 'Sure, everyone does that anyway.', fx: { remote: true },
        ins: 'Employee may work remotely on Fridays.' },
    ],
  },
  {
    id: 's3', n: '3', title: 'Benefits & PTO', who: 'dana',
    text: 'Employee is eligible for the Company\'s benefit plans and [[fifteen (15) days]] of paid time off per year.',
    plain: 'Benefits and vacation. More time off is a fine thing to ask for.',
    options: [
      { id: 'pto', label: 'Ask for 20 PTO days', sub: 'Five more days a year.', cost: 1, kind: 'perk',
        pitch: 'Could we make it twenty days of PTO?', result: 'accept', reply: 'Twenty it is.', fx: { pto: true },
        ins: 'twenty (20) days', del: 'fifteen (15) days' },
    ],
  },
  {
    id: 's4', n: '4', title: 'At-Will Employment', who: 'dana',
    text: 'Employment is at-will and may be terminated by either party [[at any time, with or without cause or notice]].',
    plain: 'Either side can end the job at any time. Common in the U.S. It\'s also why what survives termination matters: the end can come any day.',
    codex: 'atwill', options: [],
  },
  {
    id: 's5', n: '5', title: 'Company Policies', who: 'dana',
    text: 'Employee shall comply with all Company policies, [[as amended from time to time]].',
    plain: 'Follow the handbook. Normal.', options: [],
  },
  {
    id: 's6', n: '6', title: 'Confidentiality', who: 'vance', key: 'conf',
    text: 'During employment and [[at all times thereafter]], Employee shall hold in strictest confidence, and shall not use or disclose, any Confidential Information. "Confidential Information" means [[all information of any kind relating to the Company\'s business]], whether or not marked confidential, including without limitation methods, vendors, pricing, personnel, and [[know-how]].',
    plain: 'As written, this lasts forever and covers nearly everything, including general know-how you would carry to any job. Indefinite protection makes sense for genuine trade secrets, for as long as they stay secret. For everything else, it\'s a lifetime gag.',
    hidden: { label: 'Missing: whistleblower immunity notice', codex: 'dtsa' },
    codex: 'confidentiality',
    options: [
      { id: 'conf', label: 'Lifetime only for genuine trade secrets', sub: 'Other confidential info: 2 years. Carve out public info and my general skills & know-how.', cost: 2, kind: 'legal', ask: 'conf',
        pitch: 'Protecting genuine trade secrets for as long as they stay secret makes sense. For everything else, can we say two years after I leave, and carve out public information and my general skills and know-how?',
        result: 'accept', reply: 'Trade secrets stay protected as long as they\'re secret. Everything else, two years. Your general skills are yours. Fine.',
        fx: { conf: 'narrow' }, ins: 'Trade secrets: for so long as they remain trade secrets. Other Confidential Information: two (2) years after termination. Excludes public information and Employee\'s general skills, knowledge, and experience.', del: 'at all times thereafter' },
      { id: 'dtsa', label: 'Add the DTSA whistleblower notice', sub: 'Federal law expects it in agreements like this.', cost: 0, kind: 'legal', needsInspect: true,
        pitch: 'This doesn\'t include the Defend Trade Secrets Act whistleblower immunity notice. Can we add it?',
        result: 'accept', reply: '...Good catch. That one\'s on us. Added.', fx: { dtsa: true }, goodwill: 1,
        ins: 'Notice of immunity under 18 U.S.C. § 1833(b) is provided in Exhibit A.' },
      { id: 'confStrike', label: 'Strike confidentiality entirely', sub: 'Delete the whole section.', cost: 3, kind: 'legal', overreach: 2,
        pitch: 'I\'d like to strike Section 6 entirely.', result: 'reject', reply: 'No company on earth signs that. No.' },
    ],
  },
  {
    id: 's7', n: '7', title: 'Non-Competition', who: 'vance', key: 'nc',
    text: 'For [[twenty-four (24) months]] following termination [[for any reason]], Employee shall not, [[anywhere in North America]], engage in, or be employed by, [[any business competitive with the Company]].',
    plain: 'For two years after you leave, even if they let you go, you can\'t work for a competitor anywhere on the continent. Enforceability varies a lot by state, but fighting one costs money either way.',
    codex: 'noncompete',
    options: [
      { id: 'ncNarrow', label: 'Narrow it: 12 months, named competitors', sub: 'Tied to the role I actually hold.', cost: 2, kind: 'legal',
        pitch: 'Can we narrow this to twelve months, a short list of named competitors, and the role I\'m actually taking?',
        result: 'accept', reply: 'Twelve months. Named competitors. Your role. Agreed.', fx: { nc: 'narrow' },
        ins: 'twelve (12) months ... any Named Competitor listed in Exhibit B, in a role substantially similar to Employee\'s', del: 'twenty-four (24) months ... anywhere in North America ... any business competitive with the Company' },
      { id: 'ncPay', label: 'Pay me during any restricted period', sub: 'If you keep me out of work, pay my base salary.', cost: 2, kind: 'legal',
        pitch: 'If the company wants to keep me out of the market, can it pay my base salary while I\'m restricted?',
        result: 'counter', reply: 'Half salary during the restricted period.', counterFx: { ncPay: 0.5 }, pushFx: { ncPay: 1 },
        pushReply: 'Full salary. If we enforce it, we pay for it.', pushFail: 'Half. That\'s final.',
        ins: 'The Company shall pay Employee 100% of base salary during any restricted period.', insCounter: 'The Company shall pay Employee 50% of base salary during any restricted period.', note: 'Paid 100% while restricted', noteC: 'Paid 50% while restricted' },
      { id: 'ncStrike', label: 'Strike the non-compete', sub: 'Delete Section 7.', cost: 3, kind: 'legal', overreach: 1,
        pitch: 'I\'d like to strike the non-compete entirely.', result: 'reject', reply: 'I can\'t strike it. I could have narrowed it.' },
    ],
  },
  {
    id: 's8', n: '8', title: 'Non-Solicitation', who: 'vance', key: 'ns',
    text: 'For [[twenty-four (24) months]] following termination, Employee shall not, directly or indirectly, solicit, [[accept business from, or hire]] [[any customer or employee of the Company]].',
    plain: 'You can\'t pursue the company\'s clients or coworkers for two years. As written, you can\'t even accept a client who calls you, or hire a coworker who answers a public job post.',
    codex: 'nonsolicit',
    options: [
      { id: 'nsNarrow', label: 'People I worked with, 12 months, active solicitation only', sub: 'General job posts and people who reach out on their own don\'t count.', cost: 1, kind: 'legal',
        pitch: 'Can we limit this to people I actually worked with, for twelve months, and only active solicitation? General job postings and people who come to me on their own shouldn\'t count.',
        result: 'accept', reply: 'Reasonable. Agreed.', fx: { ns: 'narrow' },
        ins: 'twelve (12) months ... actively solicit any customer or employee with whom Employee worked in the final 12 months. General advertisements and unsolicited contact are excluded.', del: 'twenty-four (24) months ... accept business from, or hire any customer or employee' },
      { id: 'nsStrike', label: 'Strike non-solicitation', sub: 'Delete Section 8.', cost: 3, kind: 'legal', overreach: 1,
        pitch: 'I\'d like to strike Section 8.', result: 'reject', reply: 'No. We protect our clients and our people.' },
    ],
  },
  {
    id: 's9', n: '9', title: 'Inventions Assignment', who: 'vance', key: 'inv',
    text: 'Employee hereby assigns to the Company all inventions, works of authorship, and ideas conceived or developed during the period of employment, [[whether or not during working hours or with the use of Company resources]].',
    plain: 'Anything you create while employed belongs to them, including a weekend app on your own laptop. Several states limit this, but you would have to fight about it.',
    codex: 'inventions',
    options: [
      { id: 'invCarve', label: 'Carve out my own-time projects', sub: 'Own time, own equipment, unrelated to the business. Plus a prior-inventions list.', cost: 1, kind: 'legal',
        pitch: 'Can we carve out anything I create on my own time, with my own equipment, that\'s unrelated to the company\'s business? I\'ll attach a list of my prior inventions too.',
        result: 'accept', reply: 'Standard carve-out. Agreed.', fx: { inv: 'carve' },
        ins: 'Excludes inventions developed entirely on Employee\'s own time, without Company equipment or information, that do not relate to the Company\'s business. Prior inventions: Exhibit C.', del: 'whether or not during working hours or with the use of Company resources' },
      { id: 'invStrike', label: 'Strike inventions assignment', sub: 'Delete Section 9.', cost: 3, kind: 'legal', overreach: 1,
        pitch: 'I\'d like to strike Section 9.', result: 'reject', reply: 'You\'ll be building things for us on our dime. No.' },
    ],
  },
  {
    id: 's10', n: '10', title: 'Indemnification', who: 'vance', key: 'indem', theirs: true,
    text: 'The Company shall indemnify Employee against third-party claims arising from Employee\'s good-faith performance of duties, [[by reimbursing reasonable losses upon final resolution]] of such claims.',
    plain: 'If someone sues you over your work, they\'ll pay you back, eventually, after the case ends. You front the legal fees until then. This is the company\'s promise to you. Now check whether it survives.',
    hidden: { label: 'Not listed in the survival clause (14.3)', codex: 'survival' },
    codex: 'indemnification',
    options: [
      { id: 'defend', label: 'Add a duty to defend', sub: 'Defend me in third-party lawsuits and advance my legal fees as they come in.', cost: 2, kind: 'legal', ask: 'defend',
        pitch: 'If I\'m sued over my work, I can\'t front the legal fees for years. Can we add a duty to defend in third-party lawsuits, with fees advanced as they come in?',
        result: 'accept', reply: 'Duty to defend, with advancement. Our insurer will grumble. Agreed.', fx: { indem: 'defend' },
        ins: 'The Company shall defend Employee in any third-party claim and advance reasonable legal fees as incurred', del: 'by reimbursing reasonable losses upon final resolution' },
    ],
  },
  {
    id: 's11', n: '11', title: 'Arbitration', who: 'vance', key: 'arb',
    text: 'Any dispute arising out of Employee\'s employment or its termination shall be resolved by final and binding arbitration. [[The parties shall share equally the costs of arbitration.]] [[Notwithstanding the foregoing, the Company may seek injunctive relief in any court.]]',
    plain: 'Your claims go to private arbitration, even years from now. As written, you split the arbitrator\'s bill (many courts and arbitration providers won\'t make employees pay that, but you may have to fight it), and the company keeps a door to court that you don\'t get.',
    codex: 'arbitration',
    options: [
      { id: 'arbMutual', label: 'Make it mutual; Company pays forum costs', sub: 'Same rules for both sides.', cost: 1, kind: 'legal',
        pitch: 'Can we make this mutual, with no court carve-out just for the company, and have the company pay the arbitration forum costs?',
        result: 'accept', reply: 'Mutual, and we\'ll cover the forum costs. Agreed.', fx: { arb: 'mutual' },
        ins: 'The Company shall pay all arbitration forum costs. Any carve-out for injunctive relief applies equally to both parties.', del: 'The parties shall share equally the costs of arbitration. Notwithstanding the foregoing, the Company may seek injunctive relief in any court.' },
      { id: 'arbStrike', label: 'Strike arbitration', sub: 'Delete Section 11.', cost: 3, kind: 'legal', overreach: 1,
        pitch: 'I\'d like to strike arbitration entirely.', result: 'reject', reply: 'Arbitration stays. Company policy.' },
    ],
  },
  {
    id: 's12', n: '12', title: 'Cooperation', who: 'vance', key: 'coop',
    text: '[[Following termination]], Employee shall [[cooperate fully]] with the Company in any investigation, litigation, or proceeding relating to matters within Employee\'s knowledge, as reasonably requested by the Company.',
    plain: 'After you leave, you\'re on call for their lawsuits and investigations: interviews, document reviews, depositions. No end date. No pay.',
    hidden: { label: 'No compensation. No end date.', codex: 'cooperation' },
    codex: 'cooperation',
    options: [
      { id: 'coop', label: 'Pay me for my time, plus attorney fees', sub: 'Reasonable notice, scheduling around my new job, $150/hour, expenses, and separate counsel if I need it.', cost: 2, kind: 'legal', ask: 'coop',
        pitch: 'If I\'m helping after I leave, can we add reasonable notice, scheduling around my new job, $150 an hour for my time, expenses, and attorney fees if I need my own lawyer?',
        result: 'counter', reply: '$125 an hour. The rest is fine.', counterFx: { coop: 'paid', coopRate: 125 }, pushFx: { coop: 'paid', coopRate: 150 },
        pushReply: '$150. Fine.', pushFail: '$125. Final answer.',
        ins: 'with reasonable notice, at times that do not unreasonably interfere with Employee\'s other work; the Company shall pay Employee $150/hour, reimburse expenses, and pay Employee\'s reasonable attorney fees for separate counsel',
        insCounter: 'with reasonable notice, at times that do not unreasonably interfere with Employee\'s other work; the Company shall pay Employee $125/hour, reimburse expenses, and pay Employee\'s reasonable attorney fees for separate counsel', note: 'Paid $150/hr + attorney fees', noteC: 'Paid $125/hr + attorney fees' },
      { id: 'coopStrike', label: 'Strike cooperation', sub: 'Delete Section 12.', cost: 3, kind: 'legal', overreach: 1,
        pitch: 'I\'d like to strike Section 12.', result: 'reject', reply: 'We may need you someday. It stays.' },
    ],
  },
  {
    id: 's13', n: '13', title: 'Entire Agreement', who: 'vance',
    text: 'This Agreement constitutes [[the entire agreement]] between the parties and supersedes all prior discussions and understandings.',
    plain: 'Promises made before you sign that aren\'t written here generally won\'t count. Get your asks in writing.', options: [],
  },
  {
    id: 's14', n: '14', title: 'Miscellaneous', who: 'vance', key: 'surv',
    text: '14.1 Governing Law. This Agreement is governed by the laws of the State in which Employee primarily works. 14.2 Severability. If any provision is held unenforceable, the remainder shall continue in effect. 14.3 Survival. [[Sections 6, 7, 8, 9, 11 and 12 shall survive]] the termination of this Agreement and of Employee\'s employment for any reason.',
    plain: 'Buried in "Miscellaneous": the survival clause. These sections keep binding you after you leave. Cross-check the list against the whole agreement.',
    codex: 'survival', crossref: true,
    options: [
      { id: 'surv10', label: 'Add Section 10 to the survival list', sub: 'If my obligations survive, so should yours.', cost: 1, kind: 'legal', needsCrossref: true, ask: 'surv',
        pitch: 'Every section on the survival list is an obligation of mine. Section 10, your indemnification promise to me, isn\'t on it. If my obligations survive, shouldn\'t yours?',
        result: 'accept', reply: '...That\'s fair. Section 10 survives.', fx: { survivalIndem: true },
        ins: 'Sections 6, 7, 8, 9, 10, 11 and 12 shall survive', del: 'Sections 6, 7, 8, 9, 11 and 12 shall survive' },
    ],
  },
];
const SECTION = Object.fromEntries(CONTRACT.map((s) => [s.id, s]));

const QUESTIONS = [
  { id: 'q1', q: 'Is this the standard agreement?', a: [['dana', 'Totally standard! Everyone signs it as-is.', 'smile'], ['vance', 'Standard means it\'s our first draft.', 'smug']], codex: 'standard' },
  { id: 'q2', q: 'What happens to this agreement if I leave?', a: [['vance', 'Most of it ends when your employment ends. Section 14.3 lists what survives.', 'neutral']], codex: 'survival', hint: 's14' },
  { id: 'q3', q: 'If someone sues me over my work, who pays my lawyer?', a: [['vance', 'Section 10. We reimburse reasonable losses once the claim is finally resolved.', 'neutral'], ['you', 'And until then?', 'worried'], ['vance', 'Until then, it\'s a free country.', 'smug']], codex: 'dutytodefend', hint: 's10' },
  { id: 'q4', q: 'Could I get pulled into lawsuits after I leave?', a: [['vance', 'Section 12. You\'d cooperate fully.', 'neutral'], ['you', 'Paid?', 'neutral'], ['vance', 'It doesn\'t say.', 'smug']], codex: 'cooperation', hint: 's12' },
  { id: 'q5', q: 'Does the confidentiality section ever end?', a: [['vance', '"At all times thereafter." So: no.', 'neutral']], codex: 'confidentiality', hint: 's6' },
  { id: 'q6', q: 'Is everything in here negotiable?', a: [['dana', 'Ha! Well... within reason.', 'smile'], ['vance', 'Ask for what\'s fair and you\'ll usually get it. Ask for a rewrite and you won\'t.', 'neutral']], codex: 'offerstage' },
];

const JO_REVIEW = [
  ['jo', 'Okay, I read it. Three things will matter years from now. In order:', 'neutral'],
  ['jo', 'One. Section 14.3 lists what survives after you leave. Every section on that list is an obligation of yours. Section 10, their promise to indemnify you, isn\'t on it. Add it.', 'frown'],
  ['jo', 'And Section 10 itself only reimburses you after a case ends. Ask for a duty to defend, with legal fees advanced as they come in.', 'neutral'],
  ['jo', 'Two. Section 12 puts you on call for their litigation forever, for free. Get paid for your time, plus attorney fees if you need your own lawyer.', 'neutral'],
  ['jo', 'Three. Section 6. Protecting genuine trade secrets for as long as they stay secret is fine. Gagging you forever about everything you learned there is not.', 'neutral'],
  ['jo', 'Narrow the non-compete in Section 7 too, if you have the leverage. But those three are the ones people miss, and they bite years later.', 'neutral'],
  ['jo', 'Ask respectfully and ask now. You\'ll never have more leverage with them than you do this week.', 'smile'],
];

/* ---------- career events (chapter 2) ---------- */
const CAREER = [
  { id: 'welcome', yr: 'YEAR 1 · WEEK 1', who: 'rex', expr: 'smile', title: 'Welcome aboard',
    text: 'Rex Hollis, your new boss, drops a badge on your desk. "Glad you\'re here. We\'ve got a vendor problem, a client problem, and a people problem. Pick one."',
    choices: [{ label: 'Let\'s go.', fx: {} }] },
  { id: 'vendor', yr: 'YEAR 1 · Q3', who: 'rex', expr: 'frown', title: 'The vendor letter',
    text: '"Palisade Supply blew another delivery. Sign this termination notice and send it today."',
    choices: [
      { label: 'Sign it and send it', sub: 'It\'s your job.', fx: { perf: 1, vendor: 'signed' }, out: 'Palisade is out. Rex is happy. Your name is on the letter.' },
      { label: 'Ask Legal to review it first', sub: 'Then sign it.', fx: { paper: 1, vendor: 'reviewed' }, out: 'Legal tweaks two lines. You sign. Your name is on the letter, and now there\'s a paper trail.' },
    ] },
  { id: 'side', yr: 'YEAR 2 · Q1', who: 'you', expr: 'smile', title: 'The weekend project',
    text: 'You\'ve been sketching BUDGETBUDDY, a little personal-budgeting app. It has nothing to do with logistics.',
    choices: [
      { label: 'Build it on weekends, on my own laptop', fx: { side: 'own' }, out: 'Saturday mornings, coffee, your own laptop. It\'s coming along.' },
      { label: 'Build it on slow afternoons, on the work laptop', fx: { side: 'work' }, out: 'The work laptop is faster anyway. It\'s coming along.' },
      { label: 'Shelve it', fx: { side: 'none' }, out: 'Maybe someday.' },
    ] },
  { id: 'lodestar', yr: 'YEAR 2 · Q2', who: 'rex', expr: 'smug', title: 'Project Lodestar',
    text: '"You\'re in the inner circle now. This is Lodestar, our pricing model. Nobody outside leadership sees it."',
    choices: [
      { label: 'Learn it inside and out', fx: { perf: 1, lodestar: true }, out: 'You now know a genuine trade secret.' },
      { label: 'Need-to-know only', fx: { lodestar: false }, out: 'You keep a polite distance from Lodestar.' },
    ] },
  { id: 'mentor', yr: 'YEAR 2 · Q4', who: 'priya', expr: 'happy', title: 'Your team',
    text: 'Priya and Marco, your two direct reports, ask if you\'d mentor them. "We\'d follow you anywhere."',
    choices: [
      { label: 'Weekly lunches. Invest in them.', fx: { mentees: true, perf: 1 }, out: 'They\'re getting really good. They\'d follow you anywhere.' },
      { label: 'Keep it strictly professional', fx: { mentees: false }, out: 'Cordial. Efficient.' },
    ] },
  { id: 'client', yr: 'YEAR 3 · Q1', who: 'okafor', expr: 'smile', title: 'The big account',
    text: 'Bramblewood Foods, the company\'s biggest client, wants one point of contact. Mr. Okafor asks for you by name.',
    choices: [
      { label: 'Take point on the account', fx: { client: true, perf: 2 }, out: 'Bramblewood renews for three years. Okafor sends you a fruit basket.' },
      { label: 'Hand it to Sales', fx: { client: false }, out: 'Sales takes it from here.' },
    ] },
  { id: 'layoff', yr: 'YEAR 3 · Q4', who: 'rex', expr: 'frown', title: 'The list',
    text: 'Rex slides a list across the desk. "Six names. Tell them today. HR will be on the call."',
    choices: [
      { label: 'Run the meetings as instructed', fx: { layoff: 'ran', perf: 1 }, out: 'A terrible day. On the way out, one of them, R. Dunn, says: "You\'ll be hearing from my lawyer. You, personally."' },
      { label: 'Ask HR and Legal to review the list first', fx: { layoff: 'reviewed', paper: 1 }, out: 'Legal pulls a name that shouldn\'t have been there. Rex grumbles about the delay. The rest goes by the book.' },
    ] },
  { id: 'investigation', yr: 'YEAR 4 · Q2', who: 'vance', expr: 'neutral', title: 'A quick interview',
    text: 'Vance from Legal: "There\'s an internal investigation into a former VP. Walk us through some shipments?"',
    choices: [{ label: 'Answer everything honestly', fx: { interviewed: true }, out: 'An afternoon of emails and spreadsheets. You assume that\'s the end of it.' }] },
  { id: 'exit', yr: 'YEAR 4 · Q4', who: 'you', expr: 'neutral', title: 'What\'s next',
    text: 'Four years in, you\'re ready for something new. Three doors open.',
    choices: [
      { label: 'Director at THERETO LOGISTICS', sub: 'A direct competitor. $125,000.', fx: { exit: 'competitor' }, out: 'Thereto is thrilled. Start date: as soon as possible.' },
      { label: 'Launch your own consultancy', sub: 'Same industry. Your own clients.', fx: { exit: 'consult' }, out: 'You file the LLC paperwork and order business cards.' },
      { label: 'Ops lead at MERIDIAN HEALTH', sub: 'A different industry. $108,000.', fx: { exit: 'other' }, out: 'Hospitals need logistics too. Meridian is thrilled.' },
    ] },
];

/* ---------- codex ---------- */
const CODEX = [
  { id: 'survival', t: 'Survival Clause', b: 'Usually tucked near the end of an agreement, often under "Miscellaneous." It lists which sections stay in force after employment ends. Anything on the list keeps binding you after your last day. Anything left off is open to the argument that it ended the day you left.', tip: 'Read the list against the whole agreement. If your obligations survive, the company\'s obligations to you should survive too, especially indemnification.' },
  { id: 'offerstage', t: 'The Offer Stage', b: 'The best time to balance your agreement is at the offer stage, long before you ever need it. Asking respectfully for balanced, market-standard terms is a normal part of accepting an offer.', tip: 'Ask for time to review. Have an employment lawyer read it before you sign.' },
  { id: 'leverage', t: 'Leverage', b: 'You have the most bargaining power after an offer is made and before you sign. Once you sign, the company has little reason to renegotiate. At exit, severance talks can sometimes reopen restrictions in exchange for a release. After that, you have essentially none. Leverage comes from alternatives: other offers, rare skills, a good current job.', tip: 'Spend it on the terms that matter years later, not only on salary.' },
  { id: 'standard', t: '"Standard" Agreements', b: '"It\'s our standard agreement" usually means it\'s the company\'s first draft, written to protect the company.', tip: 'Standard doesn\'t mean non-negotiable.' },
  { id: 'atwill', t: 'At-Will Employment', b: 'Either side can end employment at any time, for any lawful reason, with or without notice.', tip: 'Because the end can come any day, what survives termination matters.' },
  { id: 'confidentiality', t: 'Confidentiality', b: 'Limits what you can use or disclose. Employer drafts often run forever ("at all times thereafter") and define confidential information as nearly everything about the business.', tip: 'Indefinite protection only for genuine trade secrets, while they stay secret. A fixed period for other confidential information. Carve-outs for public information, your general skills and know-how, and disclosures the law protects.' },
  { id: 'tradesecret', t: 'Trade Secret', b: 'Information that is valuable because it isn\'t generally known, and that the company takes reasonable steps to keep secret: a formula, source code, a pricing model. Trade secret law can protect it for as long as it stays secret, contract or no contract.', tip: 'Protecting real trade secrets is fair. Don\'t take them with you.' },
  { id: 'knowhow', t: 'General Skills & Knowledge', b: 'The experience, skills, and industry knowledge you build at a job generally go with you. Courts tend not to treat them as an employer\'s protectable secrets. Overbroad clauses try to sweep them in anyway, which can chill you from doing your next job.', tip: 'Ask for an express carve-out for general skills, knowledge, and experience.' },
  { id: 'dtsa', t: 'DTSA Immunity Notice', b: 'The federal Defend Trade Secrets Act shields people from trade-secret liability when they share trade secrets in confidence with a government official or an attorney solely to report or investigate a suspected violation of law, or in a sealed court filing. Employers are supposed to give notice of this immunity in agreements that govern confidential information (signed or updated after May 11, 2016). If they don\'t, they can\'t recover exemplary damages or attorney fees under the DTSA from that employee.', tip: 'A missing notice is a quick sign the agreement hasn\'t been updated in a while.' },
  { id: 'noncompete', t: 'Non-Compete', b: 'Bars you from working for a competitor, or competing yourself, for a period after you leave, usually within a geographic area. Enforceability varies widely by state: some ban most non-competes, some cap their length, and courts may trim or refuse overbroad ones. Fighting one still costs money.', tip: 'Shorter, narrower, tied to your actual role and named competitors, and paid if they keep you out of work.' },
  { id: 'gardenleave', t: 'Paid Restricted Period', b: 'Some agreements pay you during a non-compete period, sometimes called garden-leave pay. If a company wants to keep you out of the market, paying you for that time is the balanced version.', tip: 'Ask for base salary for every month you\'re restricted.' },
  { id: 'nonsolicit', t: 'Non-Solicitation', b: 'Bars you from soliciting the company\'s customers or employees after you leave. Courts often view these more favorably than non-competes. Broad versions also bar accepting business that comes to you on its own, or hiring anyone who worked there.', tip: 'Limit it to people you actually worked with, a shorter period, and active solicitation. General job postings and people who reach out on their own shouldn\'t count.' },
  { id: 'inventions', t: 'Inventions Assignment', b: 'Transfers ownership of what you create to the company. Broad versions reach anything conceived while you\'re employed, including weekend projects on your own equipment. Several states limit how far these can reach, but protections vary.', tip: 'Carve out work done on your own time, with your own equipment, unrelated to the company\'s business. Attach a list of prior inventions.' },
  { id: 'arbitration', t: 'Arbitration', b: 'Sends disputes to a private arbitrator instead of a court. It typically survives termination, so a fight over your final bonus years later still goes to arbitration. Watch for one-sided terms: cost-splitting, or a carve-out that lets only the company go to court. Many courts and arbitration providers won\'t make employees pay the arbitrator, but you may have to fight about it.', tip: 'Make it mutual, have the company pay the forum costs, and keep the carve-outs the law requires.' },
  { id: 'efaa', t: 'Harassment & Assault Claims', b: 'Since 2022, federal law lets employees choose to bring sexual harassment and sexual assault claims in court even if they signed a pre-dispute arbitration agreement.', tip: 'An arbitration clause doesn\'t override that choice.' },
  { id: 'cooperation', t: 'Cooperation Clause', b: 'Requires you to help the company with investigations and litigation after you leave: interviews, document reviews, depositions, testimony. Often uncompensated, and often with no end date.', tip: 'Reasonable notice, scheduling around your new job, an hourly rate, reimbursed expenses, and attorney fees if you need your own lawyer. Nothing in it should stop you from testifying truthfully or talking to government agencies.' },
  { id: 'subpoena', t: 'Subpoenas & Depositions', b: 'A subpoena can compel testimony or documents. A deposition is sworn testimony taken before trial, often a full day, plus preparation time.', tip: 'If your interests might differ from the company\'s, you may want your own lawyer, and someone should pay for it.' },
  { id: 'indemnification', t: 'Indemnification', b: 'The company\'s promise to cover losses you face because of things you did in good faith as part of your job, like a lawsuit that names you personally. Lawsuits can arrive years after you leave. If indemnification isn\'t on the survival list, the company may argue it ended on your last day. Some states, like California, require employers to cover certain work-related legal costs anyway, but you may have to fight for it.', tip: 'Indemnification that survives termination and covers claims about anything you did while employed, whenever they\'re filed.' },
  { id: 'dutytodefend', t: 'Duty to Defend', b: 'Requires the company to provide or pay for your defense while the case is happening. Without it, indemnification may only mean reimbursement after the case ends, so you front the legal fees, sometimes for years.', tip: 'A duty to defend in third-party lawsuits, or at minimum advancement of legal fees as they\'re incurred.' },
  { id: 'advancement', t: 'Advancement', b: 'Payment of your legal fees as they come in, usually in exchange for a promise to repay if it\'s later decided you weren\'t entitled to indemnification.', tip: 'Get it in writing, with a deadline for payment.' },
  { id: 'dno', t: 'D&O Insurance', b: 'Directors and officers insurance can cover managers sued over decisions they made for the company, often including defense costs and settlements, subject to the policy\'s terms. Whether it covers a former employee in your role depends on the policy.', tip: 'If your job involves decisions that could get you sued, ask whether you\'re covered during and after your employment.' },
  { id: 'thirdparty', t: 'Third-Party Lawsuits', b: 'Suits brought by someone outside your employment relationship, like a vendor or a customer. Plaintiffs sometimes name individual managers along with the company. Your arbitration agreement with your employer generally doesn\'t bind outsiders like these, though a former coworker\'s own arbitration agreement may send their claims to arbitration.', tip: 'This is exactly what surviving indemnification and a duty to defend are for.' },
  { id: 'individual', t: 'Individual Liability', b: 'Some laws, such as federal wage-and-hour law, can make individual managers personally liable in certain situations. Being named in a lawsuit isn\'t the same as being liable, but defending yourself still costs money.', tip: 'Make sure your indemnification covers you individually.' },
  { id: 'cd', t: 'Cease-and-Desist Letters', b: 'A demand letter from your former employer\'s lawyers claiming you breached your obligations. Even a weak claim costs time and money to answer.', tip: 'Clear, narrow restrictions mean fewer letters.' },
];
const CODEX_BY = Object.fromEntries(CODEX.map((c) => [c.id, c]));

const ACHIEVEMENTS = [
  { id: 'fineprint', t: 'Fine Print', d: 'Read every section of the agreement closely.' },
  { id: 'section10', t: 'Section 10', d: 'Spot the missing indemnification in the survival clause on your own.' },
  { id: 'balanced', t: 'Balanced', d: 'Win all three asks: surviving indemnification with a duty to defend, paid cooperation, and trade-secret-only confidentiality.' },
  { id: 'goblin', t: 'Salary Goblin', d: 'Spend 5 or more leverage on pay and perks.' },
  { id: 'rescinded', t: 'Different Direction', d: 'Push so hard the offer gets pulled.' },
  { id: 'asis', t: 'As Is', d: 'Sign without changing a word.' },
  { id: 'dtsa', t: 'Good Catch', d: 'Notice the missing whistleblower immunity notice.' },
  { id: 'probono', t: 'Pro Bono Witness', d: 'Sit for 5 unpaid depositions.' },
  { id: 'objection', t: 'Objection!', d: 'Have counsel block 15 attacks.' },
  { id: 'dismissed', t: 'Case Dismissed', d: 'Get the lawsuit dismissed before trial.' },
  { id: 'selffunded', t: 'Self-Funded', d: 'Pay $50,000 or more of your own legal fees.' },
  { id: 'skills', t: 'Your Skills Are Yours', d: 'Collect 8 skill orbs without a single cease-and-desist.' },
  { id: 'stillmine', t: 'Still Mine', d: 'Keep your side project.' },
  { id: 'tradesecret', t: 'That\'s Actually a Trade Secret', d: 'Take the Lodestar file.' },
  { id: 'clean', t: 'Clean Exit', d: 'Finish without receiving a single cease-and-desist letter.' },
  { id: 'ghosttown', t: 'Ghost Town', d: 'Face 12 or more NDA phantoms at once.' },
  { id: 'awarded', t: 'Awarded', d: 'Win your bonus in arbitration.' },
  { id: 'srank', t: 'S-Rank', d: 'Earn an S grade.' },
  { id: 'codex', t: 'Annotated', d: 'Unlock every codex entry.' },
];
