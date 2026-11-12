// data/readingList.js
// Static reading list for the Learn page (handoff 1.6). No database.
//
// DRAFT — summaries and "why it helps" lines were drafted on 2026-11-12 and
// have NOT been reviewed by the team. Check each one against its source,
// then delete this note. Links were checked as loading on 2026-11-12.
//
// Rules: free, legal sources only; link to the official page, never copy text
// or host PDFs. Philippine sources first.

export const READING_LIST = [
  {
    id: 'pdic-usapang-pera',
    title: 'Usapang Pera: Mga Dapat Alamin',
    author: 'Efren Ll. Cruz and PDIC',
    source: 'Philippine Deposit Insurance Corporation (PDIC)',
    summary:
      'A free, easy-to-read guidebook on money basics: why saving matters, how bank accounts and other financial products work, careful investing, and how your deposits are insured.',
    whyItHelps:
      'A Filipino-made starting point for opening and using your first bank account wisely.',
    url: 'https://www.pdic.gov.ph/files/book/usapang-pera-new.pdf',
    linkLabel: 'Open the PDF on pdic.gov.ph',
  },
  {
    id: 'bsp-fined-campaigns',
    title: 'Financial Education and Consumer Protection',
    author: 'Bangko Sentral ng Pilipinas (BSP)',
    source: 'Bangko Sentral ng Pilipinas',
    summary:
      'The central bank’s public materials on your rights as a financial consumer, spotting fraud and scams, safe e-payments like InstaPay and PESONet, and what to check before you invest. Many come in Filipino too.',
    whyItHelps:
      'Helps you protect your allowance and e-wallet from scams that target students.',
    url: 'https://www.bsp.gov.ph/Pages/InclusiveFinance/FinEdConsumerProtectionCampaigns.aspx',
    linkLabel: 'Visit bsp.gov.ph',
  },
  {
    id: 'etesda-financial-literacy',
    title: 'Financial Literacy Course',
    author: 'BSP, TESDA and BDO Foundation',
    source: 'TESDA Online Program (e-TESDA)',
    summary:
      'Free online modules with lessons, videos and short activities on financial planning, budgeting and saving, and handling debt. Needs a free e-TESDA account.',
    whyItHelps:
      'Walks you through making a budget step by step, at your own pace.',
    url: 'https://e-tesda.gov.ph/',
    linkLabel: 'Visit e-tesda.gov.ph',
  },
  {
    id: 'khan-personal-finance',
    title: 'Personal Finance',
    author: 'Khan Academy',
    source: 'Khan Academy',
    summary:
      'A free course of short videos and articles on saving and budgeting, interest and debt, and other everyday money topics.',
    whyItHelps:
      'Bite-sized lessons you can watch between classes.',
    url: 'https://www.khanacademy.org/college-careers-more/personal-finance',
    linkLabel: 'Visit khanacademy.org',
  },
  {
    id: 'fdic-money-smart-young-adults',
    title: 'Money Smart for Young Adults',
    author: 'Federal Deposit Insurance Corporation (FDIC), USA',
    source: 'FDIC',
    summary:
      'Free downloadable guides on setting money goals, making a spending and saving plan, saving for the future, and using credit carefully. Written for the US, but the basics apply anywhere.',
    whyItHelps:
      'Its spending-plan module matches what you do in TipidTech: plan, track, adjust.',
    url: 'https://www.fdic.gov/consumer-resource-center/money-smart-young-adults',
    linkLabel: 'Visit fdic.gov',
  },
  {
    id: 'mymoney-gov',
    title: 'MyMoney.gov',
    author: 'Financial Literacy and Education Commission, USA',
    source: 'U.S. government',
    summary:
      'A US government hub of free money lessons, with a section for young people and topics like saving and avoiding scams.',
    whyItHelps:
      'A trustworthy place to look up a money topic when you want a plain explanation.',
    url: 'https://www.mymoney.gov/',
    linkLabel: 'Visit mymoney.gov',
  },
];
