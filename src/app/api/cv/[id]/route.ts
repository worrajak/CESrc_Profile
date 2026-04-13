import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import {
  Document, Packer, Paragraph, TextRun, HeadingLevel,
  AlignmentType, TabStopPosition, TabStopType,
  BorderStyle, convertMillimetersToTwip,
  Table, TableRow, TableCell, WidthType, TableBorders
} from 'docx';

interface PubWithRole {
  author_role: string;
  author_order: number;
  is_corresponding: boolean;
  publications: {
    id: string;
    title: string;
    authors_raw: string;
    journal_name: string | null;
    volume: string | null;
    issue: string | null;
    pages: string | null;
    year: number;
    doi: string | null;
    pub_type: string;
    scopus_indexed: boolean;
    wos_indexed: boolean;
  };
}

const FONT = 'TH SarabunPSK';
const FONT_FALLBACK = 'Sarabun';
const FONT_SIZE = 32; // 16pt
const FONT_SIZE_SMALL = 28; // 14pt
const FONT_SIZE_HEADER = 36; // 18pt

function font(text: string, opts: any = {}) {
  return new TextRun({ text, font: FONT, size: FONT_SIZE, ...opts });
}

function fontBold(text: string, opts: any = {}) {
  return new TextRun({ text, font: FONT, size: FONT_SIZE, bold: true, ...opts });
}

function headerParagraph(text: string) {
  return new Paragraph({
    children: [new TextRun({ text, font: FONT, size: FONT_SIZE_HEADER, bold: true })],
    spacing: { before: 200, after: 100 },
  });
}

function labelValue(label: string, value: string) {
  return new Paragraph({
    children: [
      fontBold(label + '\t'),
      font(value),
    ],
    tabStops: [{ type: TabStopType.LEFT, position: convertMillimetersToTwip(45) }],
    spacing: { after: 40 },
  });
}

function bulletItem(text: string, indent = 10) {
  return new Paragraph({
    children: [font(text)],
    indent: { left: convertMillimetersToTwip(indent) },
    spacing: { after: 20 },
  });
}

function tableCell(text: string, bold = false, width?: number) {
  const opts: any = {
    children: [new Paragraph({
      children: [new TextRun({ text, font: FONT, size: FONT_SIZE_SMALL, bold })],
      spacing: { after: 20 },
    })],
    margins: { top: 40, bottom: 40, left: 80, right: 80 },
  };
  if (width) opts.width = { size: width, type: WidthType.DXA };
  return new TableCell(opts);
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const format = request.nextUrl.searchParams.get('format') || 'thai';
  const researcherId = params.id;

  // Fetch all data
  const [researcherRes, pubsRes, grantsRes, patentsRes, servicesRes, instructorCoursesRes] = await Promise.all([
    supabase.from('researchers').select('*').eq('id', researcherId).single(),
    supabase.from('publication_authors')
      .select('author_role, author_order, is_corresponding, publications (*)')
      .eq('researcher_id', researcherId)
      .order('author_order', { ascending: true }),
    supabase.from('grant_members').select('role, grants (*)').eq('researcher_id', researcherId),
    supabase.from('patent_inventors').select('inventor_order, patents (*)').eq('researcher_id', researcherId),
    supabase.from('service_members').select('role, academic_services (*)').eq('researcher_id', researcherId),
    supabase.from('training_courses').select('*, training_sessions (*)').order('created_at', { ascending: false }),
  ]);

  const researcher = researcherRes.data;
  if (!researcher) {
    return NextResponse.json({ error: 'Researcher not found' }, { status: 404 });
  }

  const r = researcher;
  const fullNameTh = `${r.title_th}${r.first_name_th} ${r.last_name_th}`;
  const fullNameEn = r.first_name_en ? `${r.title_en || ''}${r.first_name_en} ${r.last_name_en || ''}`.trim() : '';
  const pubs = (pubsRes.data || []) as unknown as PubWithRole[];
  const grantList = (grantsRes.data || []) as any[];
  const patentList = (patentsRes.data || []) as any[];
  const serviceList = (servicesRes.data || []) as any[];
  // Filter training courses where this researcher is an instructor
  const allCourses = (instructorCoursesRes.data || []) as any[];
  const instructorCourses = allCourses.filter((c: any) => {
    if (c.instructor_id === researcherId) return true;
    if (Array.isArray(c.instructor_ids) && c.instructor_ids.includes(researcherId)) return true;
    return false;
  });

  const children: Paragraph[] = [];

  // ============================================================
  // TITLE
  // ============================================================
  children.push(new Paragraph({
    children: [new TextRun({ text: 'ประวัติบุคลากรในโครงการ', font: FONT, size: 40, bold: true })],
    alignment: AlignmentType.CENTER,
    spacing: { after: 200 },
  }));

  // ============================================================
  // 1. PERSONAL INFO
  // ============================================================
  children.push(labelValue('1. ชื่อ-สกุล', `${fullNameTh}    ${fullNameEn}`));
  if (r.position_th) {
    children.push(labelValue('2. ตำแหน่งทางวิชาการ', r.position_th));
  }
  children.push(labelValue('3. หน่วยงานต้นสังกัด', `สาขาวิชาวิศวกรรมไฟฟ้า คณะวิศวกรรมศาสตร์`));
  children.push(new Paragraph({
    children: [font(`\tศูนย์วิจัยระบบพลังงานสะอาด`)],
    tabStops: [{ type: TabStopType.LEFT, position: convertMillimetersToTwip(45) }],
    spacing: { after: 40 },
  }));
  children.push(new Paragraph({
    children: [font(`\tมหาวิทยาลัยเทคโนโลยีราชมงคลล้านนา`)],
    tabStops: [{ type: TabStopType.LEFT, position: convertMillimetersToTwip(45) }],
    spacing: { after: 40 },
  }));

  if (r.email) {
    children.push(labelValue('E-mail', r.email));
  }
  if (r.phone) {
    children.push(labelValue('หมายเลขโทรศัพท์', r.phone));
  }

  // ============================================================
  // 4. EXPERTISE
  // ============================================================
  if (r.expertise && r.expertise.length > 0) {
    children.push(headerParagraph('4. สาขาวิชาที่มีความชำนาญพิเศษ'));
    r.expertise.forEach((exp: string, i: number) => {
      children.push(bulletItem(`${i + 1}) ${exp}`, 15));
    });
  }

  // ============================================================
  // 5. PUBLICATIONS - งานวิจัย
  // ============================================================
  if (pubs.length > 0) {
    children.push(headerParagraph('5. งานวิจัย'));

    // Group by type
    const journals = pubs.filter(p => p.publications?.pub_type?.includes('journal'));
    const conferences = pubs.filter(p => p.publications?.pub_type?.includes('conference'));
    const others = pubs.filter(p =>
      !p.publications?.pub_type?.includes('journal') &&
      !p.publications?.pub_type?.includes('conference')
    );

    let idx = 1;
    const formatPub = (pa: PubWithRole) => {
      const pub = pa.publications;
      if (!pub) return '';
      let citation = `${pub.authors_raw}, "${pub.title}"`;
      if (pub.journal_name) citation += `, ${pub.journal_name}`;
      if (pub.volume) citation += `, Vol. ${pub.volume}`;
      if (pub.issue) citation += `(${pub.issue})`;
      if (pub.pages) citation += `, ${pub.pages}`;
      citation += `, ${pub.year}`;
      const tags: string[] = [];
      if (pub.scopus_indexed) tags.push('Scopus');
      if (pub.wos_indexed) tags.push('WoS');
      if (tags.length) citation += ` [${tags.join(', ')}]`;
      return citation;
    };

    if (journals.length > 0) {
      children.push(new Paragraph({
        children: [fontBold('ด้าน Journal (วารสารวิชาการ)')],
        spacing: { before: 100, after: 50 },
        indent: { left: convertMillimetersToTwip(5) },
      }));
      journals.forEach(pa => {
        children.push(new Paragraph({
          children: [font(`${idx}. ${formatPub(pa)}`)],
          spacing: { after: 60 },
          indent: { left: convertMillimetersToTwip(10), hanging: convertMillimetersToTwip(8) },
        }));
        idx++;
      });
    }

    if (conferences.length > 0) {
      children.push(new Paragraph({
        children: [fontBold('ด้าน Conference (การประชุมวิชาการ)')],
        spacing: { before: 100, after: 50 },
        indent: { left: convertMillimetersToTwip(5) },
      }));
      conferences.forEach(pa => {
        children.push(new Paragraph({
          children: [font(`${idx}. ${formatPub(pa)}`)],
          spacing: { after: 60 },
          indent: { left: convertMillimetersToTwip(10), hanging: convertMillimetersToTwip(8) },
        }));
        idx++;
      });
    }

    if (others.length > 0) {
      children.push(new Paragraph({
        children: [fontBold('อื่นๆ')],
        spacing: { before: 100, after: 50 },
        indent: { left: convertMillimetersToTwip(5) },
      }));
      others.forEach(pa => {
        children.push(new Paragraph({
          children: [font(`${idx}. ${formatPub(pa)}`)],
          spacing: { after: 60 },
          indent: { left: convertMillimetersToTwip(10), hanging: convertMillimetersToTwip(8) },
        }));
        idx++;
      });
    }
  }

  // ============================================================
  // 6. GRANTS - ทุนวิจัย (Table format)
  // ============================================================
  if (grantList.length > 0) {
    children.push(headerParagraph('6. ทุนวิจัย'));

    // Table header
    const grantRows: TableRow[] = [];
    grantRows.push(new TableRow({
      children: [
        tableCell('พ.ศ.', true, 800),
        tableCell('ชื่องานวิจัย', true, 4500),
        tableCell('รับผิดชอบ', true, 1200),
        tableCell('แหล่งทุน', true, 1200),
        tableCell('งบประมาณ (บาท)', true, 1500),
      ],
      tableHeader: true,
    }));

    const roleMap: Record<string, string> = {
      pi: 'หัวหน้าโครงการ',
      co_pi: 'ผู้ร่วมโครงการ',
      researcher: 'นักวิจัย',
      consultant: 'ที่ปรึกษา',
    };

    grantList.forEach((gm: any) => {
      const g = gm.grants;
      if (!g) return;
      grantRows.push(new TableRow({
        children: [
          tableCell(g.fiscal_year?.toString() || '-'),
          tableCell(g.title_th || '-'),
          tableCell(roleMap[gm.role] || gm.role),
          tableCell(g.funding_agency?.replace(/\s*\(.*?\)\s*/g, '') || '-'),
          tableCell(g.budget ? Number(g.budget).toLocaleString() : '-'),
        ],
      }));
    });

    children.push(new Paragraph({ spacing: { after: 50 } }));
    // Add table as separate element
    const grantTable = new Table({
      rows: grantRows,
      width: { size: 100, type: WidthType.PERCENTAGE },
    });

    // Since we can't mix Paragraph and Table in children array directly,
    // we need to use sections
    // For now, render grants as list format
    grantList.forEach((gm: any, i: number) => {
      const g = gm.grants;
      if (!g) return;
      const budgetStr = g.budget ? ` งบประมาณ ${Number(g.budget).toLocaleString()} บาท` : '';
      const yearStr = g.fiscal_year ? `(พ.ศ. ${g.fiscal_year})` : '';
      children.push(new Paragraph({
        children: [
          fontBold(`${i + 1}. `),
          font(`${g.title_th} ${yearStr}`),
        ],
        spacing: { after: 20 },
        indent: { left: convertMillimetersToTwip(5) },
      }));
      children.push(new Paragraph({
        children: [font(`   แหล่งทุน: ${g.funding_agency} | ${roleMap[gm.role] || gm.role}${budgetStr}`, { size: FONT_SIZE_SMALL, color: '444444' })],
        indent: { left: convertMillimetersToTwip(10) },
        spacing: { after: 80 },
      }));
    });
  }

  // ============================================================
  // 7. PATENTS - สิทธิบัตร/อนุสิทธิบัตร
  // ============================================================
  if (patentList.length > 0) {
    children.push(headerParagraph('7. สิทธิบัตร / อนุสิทธิบัตร'));

    patentList.forEach((pi: any, i: number) => {
      const p = pi.patents;
      if (!p) return;
      const typeLabel = p.patent_type === 'patent' ? 'สิทธิบัตร' :
        p.patent_type === 'petty_patent' ? 'อนุสิทธิบัตร' :
          p.patent_type === 'copyright' ? 'ลิขสิทธิ์' : 'ความลับทางการค้า';
      const statusLabel = p.status === 'granted' ? 'ได้รับแล้ว' :
        p.status === 'pending' ? 'อยู่ในระหว่างการดำเนินการ' :
          p.status === 'filed' ? 'ยื่นคำขอแล้ว' : p.status;
      const appNo = p.application_no ? ` (${p.application_no})` : '';

      children.push(new Paragraph({
        children: [
          fontBold(`${i + 1}. `),
          font(p.title_th),
        ],
        spacing: { after: 20 },
        indent: { left: convertMillimetersToTwip(5) },
      }));
      children.push(new Paragraph({
        children: [font(`   ประเภท: ${typeLabel} | สถานะ: ${statusLabel}${appNo}`, { size: FONT_SIZE_SMALL, color: '444444' })],
        indent: { left: convertMillimetersToTwip(10) },
        spacing: { after: 80 },
      }));
    });
  }

  // ============================================================
  // 8. ACADEMIC SERVICES - งานบริการวิชาการ
  // ============================================================
  if (serviceList.length > 0) {
    children.push(headerParagraph('8. งานบริการวิชาการ'));

    const serviceTypeMap: Record<string, string> = {
      design_install: 'ออกแบบและติดตั้ง',
      consulting: 'ที่ปรึกษา',
      inspection: 'ตรวจสอบ',
      training: 'ฝึกอบรม',
    };

    const serviceRoleMap: Record<string, string> = {
      lead: 'หัวหน้าโครงการ',
      member: 'ผู้ร่วมโครงการ',
      consultant: 'ที่ปรึกษา',
      inspector: 'ผู้ตรวจสอบ',
    };

    // Sort by start_date descending (latest first)
    const sortedServices = [...serviceList].sort((a, b) => {
      const dateA = a.academic_services?.start_date || a.academic_services?.created_at || '';
      const dateB = b.academic_services?.start_date || b.academic_services?.created_at || '';
      return dateB.localeCompare(dateA);
    });

    sortedServices.forEach((sm: any, i: number) => {
      const s = sm.academic_services;
      if (!s) return;

      const typeLabel = serviceTypeMap[s.service_type] || s.service_type;
      const roleLabel = serviceRoleMap[sm.role] || sm.role;

      // Date range
      let dateStr = '';
      if (s.start_date) {
        const start = new Date(s.start_date).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' });
        if (s.end_date && s.end_date !== s.start_date) {
          const end = new Date(s.end_date).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' });
          dateStr = `${start} — ${end}`;
        } else {
          dateStr = start;
        }
      }

      children.push(new Paragraph({
        children: [
          fontBold(`${i + 1}. `),
          font(s.title_th),
        ],
        spacing: { after: 20 },
        indent: { left: convertMillimetersToTwip(5) },
      }));

      const details: string[] = [];
      details.push(`ประเภท: ${typeLabel}`);
      details.push(`บทบาท: ${roleLabel}`);
      if (s.client) details.push(`ผู้รับบริการ: ${s.client}`);
      if (s.location) details.push(`สถานที่: ${s.location}`);
      if (s.capacity) details.push(`ขนาด: ${s.capacity}`);
      if (s.budget) details.push(`งบประมาณ: ${Number(s.budget).toLocaleString()} บาท`);
      if (dateStr) details.push(`วันที่: ${dateStr}`);

      children.push(new Paragraph({
        children: [font(`   ${details.join(' | ')}`, { size: FONT_SIZE_SMALL, color: '444444' })],
        indent: { left: convertMillimetersToTwip(10) },
        spacing: { after: 80 },
      }));
    });
  }

  // ============================================================
  // 9. INSTRUCTOR / SPEAKER — การเป็นวิทยากร
  // ============================================================
  if (instructorCourses.length > 0) {
    children.push(headerParagraph(
      serviceList.length > 0 ? '9. การเป็นวิทยากร' : '8. การเป็นวิทยากร'
    ));

    // Sort by latest session date descending
    const sortedCourses = [...instructorCourses].sort((a, b) => {
      const sessA = (a.training_sessions || []).sort((x: any, y: any) => (y.start_date || '').localeCompare(x.start_date || ''))[0];
      const sessB = (b.training_sessions || []).sort((x: any, y: any) => (y.start_date || '').localeCompare(x.start_date || ''))[0];
      const dateA = sessA?.start_date || a.created_at || '';
      const dateB = sessB?.start_date || b.created_at || '';
      return dateB.localeCompare(dateA);
    });

    sortedCourses.forEach((course: any, i: number) => {
      const sessions = (course.training_sessions || []).sort(
        (a: any, b: any) => (b.start_date || '').localeCompare(a.start_date || '')
      );

      children.push(new Paragraph({
        children: [
          fontBold(`${i + 1}. `),
          font(course.title_th),
          course.title_en ? font(` (${course.title_en})`, { size: FONT_SIZE_SMALL, color: '666666' }) : font(''),
        ],
        spacing: { after: 20 },
        indent: { left: convertMillimetersToTwip(5) },
      }));

      // Course info
      const infoLine: string[] = [];
      if (course.duration_hours) infoLine.push(`${course.duration_hours} ชั่วโมง`);
      if (course.duration_days) infoLine.push(`${course.duration_days} วัน`);
      const levelMap: Record<string, string> = { beginner: 'เริ่มต้น', intermediate: 'กลาง', advanced: 'สูง', professional: 'วิชาชีพ' };
      if (course.level) infoLine.push(`ระดับ: ${levelMap[course.level] || course.level}`);

      if (infoLine.length > 0) {
        children.push(new Paragraph({
          children: [font(`   ${infoLine.join(' | ')}`, { size: FONT_SIZE_SMALL, color: '444444' })],
          indent: { left: convertMillimetersToTwip(10) },
          spacing: { after: 20 },
        }));
      }

      // Sessions (each batch with dates)
      if (sessions.length > 0) {
        sessions.forEach((sess: any) => {
          let sessLine = `รุ่นที่ ${sess.batch_number || '-'}`;
          if (sess.start_date) {
            const start = new Date(sess.start_date).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' });
            if (sess.end_date && sess.end_date !== sess.start_date) {
              const end = new Date(sess.end_date).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' });
              sessLine += ` : ${start} — ${end}`;
            } else {
              sessLine += ` : ${start}`;
            }
          }
          if (sess.location) sessLine += ` | ${sess.location}`;

          const statusMap: Record<string, string> = {
            planned: 'วางแผน', open: 'เปิดรับสมัคร', closed: 'ปิดรับสมัคร',
            in_progress: 'กำลังอบรม', completed: 'เสร็จสิ้น', cancelled: 'ยกเลิก',
          };
          if (sess.status) sessLine += ` [${statusMap[sess.status] || sess.status}]`;

          children.push(new Paragraph({
            children: [font(`   • ${sessLine}`, { size: FONT_SIZE_SMALL, color: '555555' })],
            indent: { left: convertMillimetersToTwip(15) },
            spacing: { after: 20 },
          }));
        });
      }

      children.push(new Paragraph({ spacing: { after: 60 } }));
    });
  }

  // ============================================================
  // FOOTER
  // ============================================================
  children.push(new Paragraph({
    border: { top: { style: BorderStyle.SINGLE, size: 1, color: '999999' } },
    spacing: { before: 400, after: 100 },
  }));
  children.push(new Paragraph({
    children: [font(
      `สร้างจากระบบฐานข้อมูลนักวิจัย CESRU | วันที่ ${new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}`,
      { size: FONT_SIZE_SMALL, italics: true, color: '888888' }
    )],
  }));

  // Create document
  const doc = new Document({
    sections: [{
      properties: {
        page: {
          margin: {
            top: convertMillimetersToTwip(25),
            bottom: convertMillimetersToTwip(25),
            left: convertMillimetersToTwip(25),
            right: convertMillimetersToTwip(25),
          },
        },
      },
      children,
    }],
  });

  const buffer = await Packer.toBuffer(doc);
  const uint8 = new Uint8Array(buffer);
  const safeName = (r.last_name_en || r.last_name_th).replace(/\s+/g, '_');
  const filename = `CV_${safeName}_CESRU.docx`;

  return new NextResponse(uint8, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}
