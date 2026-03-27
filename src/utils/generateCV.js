/**
 * ============================================================
 * CES-RMUTL CV Export Generator
 * สร้าง .docx CV สำหรับนักวิจัย ในรูปแบบ IEEE และ APA
 * ============================================================
 *
 * Usage:
 *   node generateCV.js --format ieee --researcher worajak
 *   node generateCV.js --format apa  --researcher teerasak
 *   node generateCV.js --format both --researcher worajak
 */

const fs = require("fs");
const path = require("path");
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, HeadingLevel, BorderStyle,
  WidthType, ShadingType, PageNumber, PageBreak, LevelFormat,
  TabStopType, TabStopPosition,
} = require("docx");

// ============================================================
// SAMPLE DATA (VERIFIED REAL DATA ONLY)
// ============================================================

const RESEARCHERS = {
  worajak: {
    id: "a0000001-0000-0000-0000-000000000009",
    titleTh: "ผศ.ดร.", firstNameTh: "วรจักร์", lastNameTh: "เมืองใจ",
    titleEn: "Asst.Prof.Dr.", firstNameEn: "Worajak", lastNameEn: "Muangjai",
    position: "Research Unit Member",
    positionTh: "สมาชิกหน่วยวิจัยระบบพลังงานสะอาด",
    department: "Division of Electrical Engineering",
    faculty: "Faculty of Engineering",
    university: "Rajamangala University of Technology Lanna",
    email: "worrajak@gmail.com", // Confirmed from PDF p.47
    expertise: ["Wireless Power Transfer", "EV Charging", "Inductive Energy Transfer"],
    expertiseTh: ["การส่งพลังงานไร้สาย", "EV Charging", "การส่งพลังงานแบบอุปนัยไฟฟ้า"],
  },
  teerasak: {
    id: "a0000001-0000-0000-0000-000000000002",
    titleTh: "ผศ.ดร.", firstNameTh: "ธีระศักดิ์", lastNameTh: "สมศักดิ์",
    titleEn: "Asst.Prof.Dr.", firstNameEn: "Teerasak", lastNameEn: "Somsak",
    position: "Head of Clean Energy System Research Unit",
    positionTh: "หัวหน้าหน่วยวิจัยระบบพลังงานสะอาด",
    department: "Division of Electrical Engineering",
    faculty: "Faculty of Engineering",
    university: "Rajamangala University of Technology Lanna",
    email: null, // Not confirmed
    expertise: ["Renewable Energy Systems", "Solar Energy", "Microgrids", "Rural Electrification", "Energy Management"],
    expertiseTh: ["ระบบพลังงานหนุนเสริม", "พลังงานแสงอาทิตย์", "ไมโครกริด", "การไฟฟ้าชนบท", "การจัดการพลังงาน"],
  },
};

// Publications with role info per researcher (VERIFIED DATA ONLY)
const PUBLICATIONS = [
  {
    id: "pub1",
    title: "A 10 kW Inductive Wireless Power Transfer Prototype for EV Charging in Thailand",
    authorsRaw: "J. Thongpron, W. Tammawan, T. Somsak, W. Tippachon, K. Oranpiroj, E. Chaidee, and A. Namin",
    journal: "ECTI Transactions on Electrical Engineering, Electronics, and Communications", volume: "20", issue: "1", pages: "pp. 83-95",
    year: 2022, doi: "10.37936/ecti-eec.2022201.246108", type: "journal_international",
    scopus: true, wos: false,
    roles: {
      teerasak: { role: "Co-Author", order: 3 },
      worajak: { role: "Co-Author", order: 4 },
    },
  },
  {
    id: "pub2",
    title: "Systematic Optimize and Cost-Effective Design of a 100% Renewable Microgrid Hybrid System for Sustainable Rural Electrification in Khlong Ruea, Thailand",
    authorsRaw: "T. Somsak et al.",
    journal: "Energies", volume: "18", issue: "7", pages: "1628",
    year: 2025, doi: "10.3390/en18071628", type: "journal_international",
    scopus: true, wos: true,
    roles: {
      teerasak: { role: "First & Corresponding Author", order: 1 },
    },
  },
  {
    id: "pub3",
    title: "Construction of Tungsten Halogen, Pulsed LED, and Combined Tungsten Halogen-LED Solar Simulators for Solar Cell I-V Characterization and Electrical Parameters Determination",
    authorsRaw: "A. Namin, C. Jivacate, D. Chenvidhya, K. Kirtikara, and J. Thongpron",
    journal: "International Journal of Photoenergy", volume: "2012", issue: null, pages: "Article ID 527820 (9 pages)",
    year: 2012, doi: "10.1155/2012/527820", type: "journal_international",
    scopus: true, wos: true,
    roles: {
      /* ผู้เขียนรวม แต่ต้องยืนยันบทบาทของ teerasak */
    },
  },
  {
    id: "pub4",
    title: "Varied-Frequency CC-CV Inductive Wireless Power Transfer with Efficiency-Regulated EV Charging for an Electric Golf Cart",
    authorsRaw: "A. Namin et al.",
    journal: "Energies", volume: "16", issue: "21", pages: "7388",
    year: 2023, doi: "10.3390/en16217388", type: "journal_international",
    scopus: true, wos: true,
    roles: {
      /* ต้องยืนยันบทบาทของผู้เขียน */
    },
  },
  {
    id: "pub5",
    title: "Maximum power point tracking using adaptive fuzzy logic control for grid-connected photovoltaic system",
    authorsRaw: "N. Patcharaprakiti, S. Premrudeepreechacharn, and Y. Sriuthaisiriwong",
    journal: "Renewable Energy", volume: "30", issue: "11", pages: "pp. 1771-1788",
    year: 2005, doi: null, type: "journal_international",
    scopus: true, wos: true,
    roles: {
      /* ต้องยืนยันบทบาทของผู้เขียน */
    },
  },
  {
    id: "pub6",
    title: "Modeling of Photovoltaic Grid Connected Inverters Based on Nonlinear System Identification for Power Quality Analysis",
    authorsRaw: "N. Patcharaprakiti, K. Kirtikara, K. Tunlasakun, J. Thongpron, D. Chenvidhya, A. Sangswang, V. Monyakul, and B. Muenpinij",
    journal: "IntechOpen", volume: null, issue: null, pages: null,
    year: 2011, doi: null, type: "book_chapter",
    scopus: false, wos: false,
    roles: {
      /* ผู้เขียนรวม แต่ต้องยืนยันบทบาทของ teerasak */
    },
  },
];

const GRANTS = [
  {
    title: "Study of Demand Side Management with Home Battery Systems in Thailand",
    titleTh: "การศึกษาแนวทางการบริหารจัดการความต้องการการใช้ไฟฟ้าด้วยระบบแบตเตอรี่ในระดับครัวเรือนในประเทศไทย",
    agency: "EGAT", budget: "6,932,792 THB", year: "Mar 2018 - Feb 2019",
    period: "Mar 2018 - Feb 2019",
    contract: "61-K102000-11-IO.SS03K3008333",
    roles: { teerasak: "PI" },
  },
  {
    title: "Community Development Study Ban Huay Tham with Sustainable Participation",
    titleTh: "การศึกษาแนวทางการพัฒนาชุมชนบ้านห้วยต้าแบบมีส่วนร่วมอย่างยั่งยืน",
    agency: "EGAT", budget: null, year: "Oct 2019 - Sep 2020",
    period: "Oct 2019 - Sep 2020",
    contract: null,
    roles: { teerasak: "PI" },
  },
  {
    title: "Reduction of Total Dissolved Solids in Wastewater from Mae Moh Lignite Mine using Solar-Powered Electrocoagulation",
    titleTh: "การลดค่าผลรวมของแข็งละลายน้ำในน้ำทิ้งจากการทำเหมืองแร่ลิกไนต์แม่เมาะด้วยวิธีตกตะกอนทางไฟฟ้าพลังงานแสงอาทิตย์",
    agency: "EGAT", budget: "4,321,714.52 THB", year: "2018-2019",
    period: "15 months",
    contract: null,
    roles: { /* ต้องยืนยันบทบาท */ },
  },
  {
    title: "Development of Wireless Battery Charging Station for Electric Vehicles",
    titleTh: "โครงการพัฒนาสถานีอัดประจุแบตเตอรี่ยานยนต์ไฟฟ้าแบบไร้สาย",
    agency: "Ministry of Energy", budget: "3,800,000 THB", year: null,
    period: null,
    contract: null,
    roles: { /* PI: Anon Namin ต้องยืนยัน */ },
  },
];

// PATENTS: None verified from web search - section removed
const PATENTS = [];

// ============================================================
// IEEE FORMAT CV GENERATOR
// ============================================================

function generateIEEE_CV(researcherKey) {
  const r = RESEARCHERS[researcherKey];
  const myPubs = PUBLICATIONS.filter(p => p.roles[researcherKey]);
  const myGrants = GRANTS.filter(g => g.roles[researcherKey]);
  const myPatents = PATENTS.filter(p => p.inventors.includes(researcherKey));

  // Group publications by role
  const firstAuthorPubs = myPubs.filter(p => p.roles[researcherKey].role.includes("First"));
  const coAuthorPubs = myPubs.filter(p => p.roles[researcherKey].role === "Co-Author");

  const border = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
  const borders = { top: border, bottom: border, left: border, right: border };
  const noBorders = {
    top: { style: BorderStyle.NONE, size: 0 },
    bottom: { style: BorderStyle.NONE, size: 0 },
    left: { style: BorderStyle.NONE, size: 0 },
    right: { style: BorderStyle.NONE, size: 0 },
  };
  const cellMargins = { top: 60, bottom: 60, left: 100, right: 100 };

  return new Document({
    styles: {
      default: { document: { run: { font: "Times New Roman", size: 24 } } },
      paragraphStyles: [
        {
          id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
          run: { size: 28, bold: true, font: "Times New Roman" },
          paragraph: { spacing: { before: 240, after: 120 }, outlineLevel: 0 },
        },
        {
          id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
          run: { size: 26, bold: true, font: "Times New Roman" },
          paragraph: { spacing: { before: 180, after: 80 }, outlineLevel: 1 },
        },
      ],
    },
    numbering: {
      config: [
        {
          reference: "ieee-refs",
          levels: [{
            level: 0, format: LevelFormat.DECIMAL, text: "[%1]",
            alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 720, hanging: 360 } } },
          }],
        },
      ],
    },
    sections: [{
      properties: {
        page: {
          size: { width: 12240, height: 15840 },
          margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
        },
      },
      headers: {
        default: new Header({
          children: [new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [
              new TextRun({ text: "CES-RMUTL Researcher CV", italics: true, size: 18, color: "888888" }),
              new TextRun({ text: "  |  IEEE Format", italics: true, size: 18, color: "888888" }),
            ],
          })],
        }),
      },
      footers: {
        default: new Footer({
          children: [new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: "Page ", size: 18 }),
              new TextRun({ children: [PageNumber.CURRENT], size: 18 }),
            ],
          })],
        }),
      },
      children: [
        // ── HEADER ──
        new Paragraph({
          alignment: AlignmentType.CENTER, spacing: { after: 60 },
          children: [new TextRun({ text: "CURRICULUM VITAE", bold: true, size: 32 })],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER, spacing: { after: 40 },
          children: [new TextRun({ text: "(IEEE Format)", size: 22, color: "666666" })],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER, spacing: { after: 20 },
          children: [new TextRun({
            text: "Clean Energy System Research Unit (CESRU)",
            size: 22, color: "2E75B6",
          })],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER, spacing: { after: 200 },
          children: [new TextRun({
            text: "Rajamangala University of Technology Lanna",
            size: 22, color: "2E75B6",
          })],
        }),

        // ── PERSONAL INFO ──
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("I. Personal Information")] }),
        new Table({
          width: { size: 9360, type: WidthType.DXA },
          columnWidths: [3000, 6360],
          rows: [
            makeInfoRow("Full Name (EN)", `${r.titleEn} ${r.firstNameEn} ${r.lastNameEn}`, noBorders, cellMargins),
            makeInfoRow("Full Name (TH)", `${r.titleTh}${r.firstNameTh} ${r.lastNameTh}`, noBorders, cellMargins),
            makeInfoRow("Position", r.position, noBorders, cellMargins),
            makeInfoRow("Department", r.department, noBorders, cellMargins),
            makeInfoRow("Faculty", r.faculty, noBorders, cellMargins),
            makeInfoRow("University", r.university, noBorders, cellMargins),
            ...(r.email ? [makeInfoRow("Email", r.email, noBorders, cellMargins)] : []),
          ],
        }),

        // ── RESEARCH INTERESTS ──
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("II. Research Interests")] }),
        new Paragraph({
          spacing: { after: 120 },
          children: [new TextRun(r.expertise.join("; "))],
        }),

        // ── PUBLICATIONS (IEEE Style) ──
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("III. Publications")] }),

        // First Author
        ...(firstAuthorPubs.length > 0 ? [
          new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("A. As First/Corresponding Author")] }),
          ...firstAuthorPubs.map((pub, i) => formatIEEEParagraph(pub, i + 1)),
        ] : []),

        // Co-Author
        ...(coAuthorPubs.length > 0 ? [
          new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("B. As Co-Author")] }),
          ...coAuthorPubs.map((pub, i) => formatIEEEParagraph(pub, firstAuthorPubs.length + i + 1)),
        ] : []),

        // ── RESEARCH GRANTS ──
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("IV. Research Grants")] }),
        ...myGrants.map((g, i) => new Paragraph({
          spacing: { after: 120 },
          indent: { left: 360, hanging: 360 },
          children: [
            new TextRun({ text: `${i + 1}. `, bold: true }),
            new TextRun({ text: g.title, italics: true }),
            new TextRun(`, Funded by ${g.agency}, ${g.budget}, ${g.year}. `),
            new TextRun({ text: `Role: ${g.roles[researcherKey]}`, bold: true }),
          ],
        })),

        // ── PATENTS ──
        ...(myPatents.length > 0 ? [
          new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("V. Patents & Innovations")] }),
          ...myPatents.map((p, i) => new Paragraph({
            spacing: { after: 120 },
            indent: { left: 360, hanging: 360 },
            children: [
              new TextRun({ text: `${i + 1}. `, bold: true }),
              new TextRun({ text: p.title, italics: true }),
              new TextRun(` (${p.titleTh}). `),
              new TextRun(`Type: ${p.type}. Status: ${p.status}.`),
            ],
          })),
        ] : []),

        // ── FOOTER NOTES ──
        new Paragraph({ spacing: { before: 400 }, children: [] }),
        new Paragraph({
          spacing: { before: 120, after: 80 },
          children: [new TextRun({
            text: "หมายเหตุ: CV นี้แสดงเฉพาะผลงานที่ผ่านการยืนยันจากฐานข้อมูลวิชาการ ผลงานเพิ่มเติมสามารถเพิ่มได้ผ่านระบบ CES-RMUTL Profile",
            size: 18, italics: true, color: "888888",
          })],
        }),
        new Paragraph({
          alignment: AlignmentType.RIGHT,
          children: [new TextRun({
            text: `Generated: ${new Date().toISOString().split("T")[0]} | CES-RMUTL Profile System v3.0`,
            size: 18, italics: true, color: "999999",
          })],
        }),
      ],
    }],
  });
}

// ============================================================
// APA FORMAT CV GENERATOR
// ============================================================

function generateAPA_CV(researcherKey) {
  const r = RESEARCHERS[researcherKey];
  const myPubs = PUBLICATIONS.filter(p => p.roles[researcherKey]);
  const myGrants = GRANTS.filter(g => g.roles[researcherKey]);
  const myPatents = PATENTS.filter(p => p.inventors.includes(researcherKey));

  const firstAuthorPubs = myPubs.filter(p => p.roles[researcherKey].role.includes("First"));
  const coAuthorPubs = myPubs.filter(p => p.roles[researcherKey].role === "Co-Author");

  const noBorders = {
    top: { style: BorderStyle.NONE, size: 0 },
    bottom: { style: BorderStyle.NONE, size: 0 },
    left: { style: BorderStyle.NONE, size: 0 },
    right: { style: BorderStyle.NONE, size: 0 },
  };
  const cellMargins = { top: 60, bottom: 60, left: 100, right: 100 };

  return new Document({
    styles: {
      default: { document: { run: { font: "Arial", size: 24 } } },
      paragraphStyles: [
        {
          id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
          run: { size: 28, bold: true, font: "Arial", color: "2E4057" },
          paragraph: { spacing: { before: 300, after: 120 }, outlineLevel: 0,
            border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "2E75B6", space: 1 } } },
        },
        {
          id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
          run: { size: 26, bold: true, font: "Arial", color: "2E75B6" },
          paragraph: { spacing: { before: 200, after: 80 }, outlineLevel: 1 },
        },
      ],
    },
    sections: [{
      properties: {
        page: {
          size: { width: 12240, height: 15840 },
          margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
        },
      },
      headers: {
        default: new Header({
          children: [new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [
              new TextRun({ text: "CES-RMUTL Researcher CV", italics: true, size: 18, color: "888888" }),
              new TextRun({ text: "  |  APA Format", italics: true, size: 18, color: "888888" }),
            ],
          })],
        }),
      },
      footers: {
        default: new Footer({
          children: [new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: "Page ", size: 18 }),
              new TextRun({ children: [PageNumber.CURRENT], size: 18 }),
            ],
          })],
        }),
      },
      children: [
        // ── HEADER ──
        new Paragraph({
          alignment: AlignmentType.CENTER, spacing: { after: 60 },
          children: [new TextRun({ text: "CURRICULUM VITAE", bold: true, size: 36, color: "2E4057" })],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER, spacing: { after: 40 },
          children: [new TextRun({ text: "(APA 7th Edition Format)", size: 22, color: "888888" })],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER, spacing: { after: 20 },
          children: [new TextRun({ text: "Clean Energy System Research Unit (CESRU)", size: 22, color: "2E75B6" })],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER, spacing: { after: 200 },
          children: [new TextRun({ text: "Rajamangala University of Technology Lanna", size: 22, color: "2E75B6" })],
        }),

        // ── PERSONAL INFO ──
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("Personal Information")] }),
        new Table({
          width: { size: 9360, type: WidthType.DXA },
          columnWidths: [3000, 6360],
          rows: [
            makeInfoRow("Full Name (EN)", `${r.titleEn} ${r.firstNameEn} ${r.lastNameEn}`, noBorders, cellMargins),
            makeInfoRow("Full Name (TH)", `${r.titleTh}${r.firstNameTh} ${r.lastNameTh}`, noBorders, cellMargins),
            makeInfoRow("Position", r.position, noBorders, cellMargins),
            makeInfoRow("Affiliation", `${r.department}, ${r.faculty}, ${r.university}`, noBorders, cellMargins),
            ...(r.email ? [makeInfoRow("Email", r.email, noBorders, cellMargins)] : []),
          ],
        }),

        // ── RESEARCH INTERESTS ──
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("Research Interests")] }),
        new Paragraph({
          spacing: { after: 120 },
          children: [new TextRun(r.expertise.join("; "))],
        }),

        // ── PUBLICATIONS (APA Style) ──
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("Publications")] }),

        ...(firstAuthorPubs.length > 0 ? [
          new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("As First/Corresponding Author")] }),
          ...firstAuthorPubs.map(pub => formatAPAParagraph(pub)),
        ] : []),

        ...(coAuthorPubs.length > 0 ? [
          new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("As Co-Author")] }),
          ...coAuthorPubs.map(pub => formatAPAParagraph(pub)),
        ] : []),

        // ── GRANTS ──
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("Research Grants")] }),
        ...myGrants.map((g, i) => new Paragraph({
          spacing: { after: 120 },
          indent: { left: 720, hanging: 360 },
          children: [
            new TextRun({ text: `${i + 1}. `, bold: true }),
            new TextRun({ text: g.title, italics: true }),
            new TextRun(`. Funded by ${g.agency}. Budget: ${g.budget}. Period: ${g.year}. `),
            new TextRun({ text: `(Role: ${g.roles[researcherKey]})`, bold: true, color: "2E75B6" }),
          ],
        })),

        // ── PATENTS ──
        ...(myPatents.length > 0 ? [
          new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("Patents & Innovations")] }),
          ...myPatents.map((p, i) => new Paragraph({
            spacing: { after: 120 },
            indent: { left: 720, hanging: 360 },
            children: [
              new TextRun({ text: `${i + 1}. `, bold: true }),
              new TextRun({ text: p.title, italics: true }),
              new TextRun(` [${p.type}]. Status: ${p.status}.`),
            ],
          })),
        ] : []),

        // ── FOOTER NOTES ──
        new Paragraph({ spacing: { before: 400 }, children: [] }),
        new Paragraph({
          spacing: { before: 120, after: 80 },
          children: [new TextRun({
            text: "หมายเหตุ: CV นี้แสดงเฉพาะผลงานที่ผ่านการยืนยันจากฐานข้อมูลวิชาการ ผลงานเพิ่มเติมสามารถเพิ่มได้ผ่านระบบ CES-RMUTL Profile",
            size: 18, italics: true, color: "888888",
          })],
        }),
        new Paragraph({
          alignment: AlignmentType.RIGHT,
          children: [new TextRun({
            text: `Generated: ${new Date().toISOString().split("T")[0]} | CES-RMUTL Profile System v3.0`,
            size: 18, italics: true, color: "999999",
          })],
        }),
      ],
    }],
  });
}

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function makeInfoRow(label, value, borders, margins) {
  return new TableRow({
    children: [
      new TableCell({
        borders, margins,
        width: { size: 3000, type: WidthType.DXA },
        children: [new Paragraph({ children: [new TextRun({ text: label, bold: true })] })],
      }),
      new TableCell({
        borders, margins,
        width: { size: 6360, type: WidthType.DXA },
        children: [new Paragraph({ children: [new TextRun(value || "-")] })],
      }),
    ],
  });
}

/**
 * Format a publication as IEEE paragraph
 */
function formatIEEEParagraph(pub, index) {
  const children = [
    new TextRun({ text: `[${index}] `, bold: true }),
    new TextRun(pub.authorsRaw + ", "),
    new TextRun({ text: `"${pub.title}," `, }),
    new TextRun({ text: pub.journal, italics: true }),
  ];

  if (pub.volume) {
    children.push(new TextRun(`, vol. ${pub.volume}`));
    if (pub.issue) children.push(new TextRun(`, no. ${pub.issue}`));
  }
  if (pub.pages) children.push(new TextRun(`, ${pub.pages}`));
  children.push(new TextRun(`, ${pub.year}.`));

  if (pub.doi) {
    children.push(new TextRun(" doi: "));
    children.push(new TextRun({ text: pub.doi, color: "2E75B6" }));
  }

  if (pub.scopus || pub.wos) {
    children.push(new TextRun(" ["));
    if (pub.scopus) children.push(new TextRun({ text: "Scopus", bold: true, color: "E87722" }));
    if (pub.scopus && pub.wos) children.push(new TextRun(" | "));
    if (pub.wos) children.push(new TextRun({ text: "WoS", bold: true, color: "2E75B6" }));
    children.push(new TextRun("]"));
  }

  return new Paragraph({
    spacing: { after: 160 },
    indent: { left: 720, hanging: 360 },
    children,
  });
}

/**
 * Format a publication as APA paragraph
 */
function formatAPAParagraph(pub) {
  // Convert IEEE authors to APA format
  const authors = pub.authorsRaw
    .replace(/,?\s+and\s+/gi, ", ")
    .split(", ")
    .map(a => {
      const parts = a.trim().split(/\s+/);
      if (parts.length >= 2 && parts[0].endsWith(".")) {
        // "T. Somsak" -> "Somsak, T."
        return `${parts.slice(1).join(" ")}, ${parts[0]}`;
      }
      return a;
    });

  let authorStr;
  if (authors.length <= 2) {
    authorStr = authors.join(" & ");
  } else {
    authorStr = authors.slice(0, -1).join(", ") + ", & " + authors[authors.length - 1];
  }

  const children = [
    new TextRun(authorStr + " "),
    new TextRun(`(${pub.year}). `),
    new TextRun(pub.title + ". "),
    new TextRun({ text: pub.journal, italics: true }),
  ];

  if (pub.volume) {
    children.push(new TextRun({ text: `, ${pub.volume}`, italics: true }));
    if (pub.issue) children.push(new TextRun(`(${pub.issue})`));
  }
  if (pub.pages) children.push(new TextRun(`, ${pub.pages}`));
  children.push(new TextRun("."));

  if (pub.doi) {
    children.push(new TextRun(" "));
    children.push(new TextRun({ text: `https://doi.org/${pub.doi}`, color: "2E75B6" }));
  }

  if (pub.scopus || pub.wos) {
    children.push(new TextRun(" ["));
    if (pub.scopus) children.push(new TextRun({ text: "Scopus", bold: true, color: "E87722" }));
    if (pub.scopus && pub.wos) children.push(new TextRun(" | "));
    if (pub.wos) children.push(new TextRun({ text: "WoS", bold: true, color: "2E75B6" }));
    children.push(new TextRun("]"));
  }

  return new Paragraph({
    spacing: { after: 200 },
    indent: { left: 720, hanging: 720 },  // APA hanging indent
    children,
  });
}

// ============================================================
// MAIN
// ============================================================

async function main() {
  const args = process.argv.slice(2);
  let format = "both";
  let researcherKey = "worajak";

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--format" && args[i + 1]) format = args[i + 1];
    if (args[i] === "--researcher" && args[i + 1]) researcherKey = args[i + 1];
  }

  if (!RESEARCHERS[researcherKey]) {
    console.error(`Researcher "${researcherKey}" not found. Available: ${Object.keys(RESEARCHERS).join(", ")}`);
    process.exit(1);
  }

  const r = RESEARCHERS[researcherKey];
  const outputDir = path.resolve(__dirname, "../../output");
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  const tasks = [];

  if (format === "ieee" || format === "both") {
    const doc = generateIEEE_CV(researcherKey);
    const filename = `CV_${r.lastNameEn}_IEEE.docx`;
    tasks.push(
      Packer.toBuffer(doc).then(buffer => {
        const filepath = path.join(outputDir, filename);
        fs.writeFileSync(filepath, buffer);
        console.log(`IEEE CV generated: ${filepath}`);
      })
    );
  }

  if (format === "apa" || format === "both") {
    const doc = generateAPA_CV(researcherKey);
    const filename = `CV_${r.lastNameEn}_APA.docx`;
    tasks.push(
      Packer.toBuffer(doc).then(buffer => {
        const filepath = path.join(outputDir, filename);
        fs.writeFileSync(filepath, buffer);
        console.log(`APA CV generated: ${filepath}`);
      })
    );
  }

  await Promise.all(tasks);
  console.log("\nDone! CV files generated successfully.");
}

main().catch(console.error);
