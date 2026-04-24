import Link from 'next/link';

export const metadata = {
  title: 'นโยบายความเป็นส่วนตัว | CESRU',
  description: 'Privacy Policy — PDPA Compliance for CESRU Researcher Profile System',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <Link href="/" className="text-sm text-blue-600 hover:underline">← กลับหน้าหลัก</Link>

      <h1 className="text-3xl font-bold text-gray-800 mt-4 mb-2">นโยบายความเป็นส่วนตัว (Privacy Policy)</h1>
      <p className="text-sm text-gray-500 mb-6">
        เวอร์ชัน 1.0 · มีผลบังคับใช้ 24 เมษายน 2569 · เป็นไปตาม พ.ร.บ.คุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562 (PDPA)
      </p>

      <div className="prose prose-slate max-w-none text-gray-700 leading-relaxed space-y-6">
        <section>
          <h2 className="text-xl font-semibold text-gray-800">1. ข้อมูลที่เราเก็บ</h2>
          <p>เมื่อท่านลงทะเบียนผ่าน Google Sign-In เราจะเก็บข้อมูลเพียง:</p>
          <ul className="list-disc list-inside ml-4">
            <li><strong>Email address</strong> — สำหรับยืนยันตัวตนและการเข้าสู่ระบบ</li>
            <li><strong>ชื่อที่แสดง (Display name)</strong> — ที่ท่านกรอกเอง เพื่อแสดงกับความคิดเห็น</li>
            <li><strong>ประเภทผู้ใช้</strong> (นักศึกษา/นักวิจัย/บุคคลทั่วไป) — ที่ท่านเลือกเอง (ไม่บังคับ)</li>
            <li><strong>สถาบัน</strong> — (ไม่บังคับ)</li>
            <li><strong>วันเวลาการยินยอม</strong> — สำหรับการตรวจสอบย้อนหลัง</li>
          </ul>
          <p className="mt-2 text-sm text-emerald-700 bg-emerald-50 border-l-4 border-emerald-500 p-3 rounded">
            ✅ <strong>เราไม่เก็บ</strong>: รูปโปรไฟล์, IP address แบบดิบ, ตำแหน่งที่ตั้ง, ข้อมูลทางการเงิน, ข้อมูลสุขภาพ, ข้อมูลอ่อนไหวอื่น ๆ ตามมาตรา 26 PDPA
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800">2. วัตถุประสงค์การเก็บข้อมูล</h2>
          <ul className="list-disc list-inside ml-4">
            <li>เพื่อให้ท่านสามารถแสดงความคิดเห็นบนข่าวสารและผลงานวิจัย</li>
            <li>เพื่อป้องกันการสแปมและการใช้งานในทางที่ผิด</li>
            <li>เพื่อวิเคราะห์การใช้งานเว็บไซต์แบบรวม (aggregate) เพื่อปรับปรุงคุณภาพบริการ</li>
            <li>เพื่อติดต่อท่านในกรณีที่ท่านยินยอมรับข่าวสาร (ต้อง opt-in)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800">3. การใช้ข้อมูลแบบไม่ระบุตัวตน (Anonymous Analytics)</h2>
          <p>
            เราเก็บสถิติการใช้งานเว็บไซต์แบบ <strong>ไม่ระบุตัวตน</strong> เช่น จำนวนผู้เข้าชมรายวัน
            เวลาที่มีผู้ใช้งานสูงสุด หน้าที่ได้รับความนิยม โดยไม่เชื่อมโยงกับตัวบุคคล
          </p>
          <ul className="list-disc list-inside ml-4 mt-2">
            <li>Session Hash (ไม่สามารถย้อนกลับหาตัวบุคคลได้)</li>
            <li>Browser type (desktop/mobile — ไม่เก็บ user agent เต็ม)</li>
            <li>Referrer domain (เฉพาะชื่อโดเมน เช่น google.com)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800">4. สิทธิของท่านตาม PDPA</h2>
          <p>ท่านมีสิทธิต่อไปนี้ตามพระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="font-semibold text-blue-800 mb-1">📋 สิทธิเข้าถึง (Right to Access)</div>
              <p className="text-sm text-blue-700">ดาวน์โหลดข้อมูลที่เราเก็บเกี่ยวกับท่านได้ทุกเวลา</p>
            </div>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
              <div className="font-semibold text-orange-800 mb-1">✏️ สิทธิแก้ไข (Right to Rectification)</div>
              <p className="text-sm text-orange-700">แก้ไขชื่อที่แสดงหรือข้อมูลของท่านได้เอง</p>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="font-semibold text-red-800 mb-1">🗑️ สิทธิลบ (Right to Erasure)</div>
              <p className="text-sm text-red-700">ลบบัญชีและข้อมูลทั้งหมดได้ทันทีจากหน้าโปรไฟล์</p>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
              <div className="font-semibold text-purple-800 mb-1">🚫 สิทธิคัดค้าน (Right to Object)</div>
              <p className="text-sm text-purple-700">ถอนการยินยอมในแต่ละเรื่องได้ทุกเมื่อ</p>
            </div>
          </div>
          <p className="mt-3 text-sm">
            วิธีใช้สิทธิ: เข้าหน้า <Link href="/account" className="text-blue-600 underline">บัญชีของฉัน</Link>
            {' '}หรือส่งคำขอที่ <a href="mailto:cesru@rmutl.ac.th" className="text-blue-600 underline">cesru@rmutl.ac.th</a>
            {' '}(ดำเนินการภายใน 30 วัน)
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800">5. การเก็บรักษาข้อมูล (Data Retention)</h2>
          <ul className="list-disc list-inside ml-4">
            <li><strong>บัญชีที่ใช้งาน:</strong> เก็บตราบที่บัญชียังคง active</li>
            <li><strong>บัญชีที่ไม่มีกิจกรรม:</strong> ลบอัตโนมัติหลัง 2 ปี ที่ไม่มี activity</li>
            <li><strong>ข้อมูลสถิติ (anonymous):</strong> เก็บ 1 ปี</li>
            <li><strong>Audit log การยินยอม:</strong> เก็บ 5 ปี ตามข้อกำหนดกฎหมาย</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800">6. ความปลอดภัย</h2>
          <p>ข้อมูลของท่านถูกเก็บบน Supabase (ISO 27001, SOC 2 certified) พร้อม:</p>
          <ul className="list-disc list-inside ml-4">
            <li>การเข้ารหัส TLS 1.3 ระหว่างการส่งข้อมูล</li>
            <li>การเข้ารหัสฐานข้อมูล (AES-256) ระหว่างพักข้อมูล</li>
            <li>Row-Level Security (RLS) — ผู้ใช้แต่ละคนเห็นได้เฉพาะข้อมูลของตัวเอง</li>
            <li>ไม่มีการส่งข้อมูลของท่านไปยังบุคคลที่สามเพื่อวัตถุประสงค์ทางการตลาด</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800">7. การแบ่งปันข้อมูลกับบุคคลที่สาม</h2>
          <p>เราใช้บริการของบุคคลที่สามเพื่อดำเนินงานตามวัตถุประสงค์ข้างต้น:</p>
          <ul className="list-disc list-inside ml-4">
            <li><strong>Google OAuth</strong> — สำหรับยืนยันตัวตน (เห็นแค่ email + ชื่อ)</li>
            <li><strong>Supabase (หรือผู้ให้บริการ hosting)</strong> — สำหรับเก็บข้อมูล</li>
            <li><strong>Google Analytics 4</strong> — สำหรับสถิติการใช้งานเว็บไซต์แบบไม่ระบุตัวตน</li>
          </ul>
          <p className="mt-2">เราไม่ขายหรือให้เช่าข้อมูลของท่านกับบุคคลที่สามใด ๆ ทั้งสิ้น</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800">8. ติดต่อเรา</h2>
          <div className="bg-slate-50 border rounded-lg p-4 text-sm">
            <p><strong>ผู้ควบคุมข้อมูล:</strong> หน่วยวิจัยระบบพลังงานสะอาด (CESRU)</p>
            <p><strong>ที่อยู่:</strong> คณะวิศวกรรมศาสตร์ มหาวิทยาลัยเทคโนโลยีราชมงคลล้านนา (เชียงใหม่)</p>
            <p><strong>Email:</strong> <a href="mailto:cesru@rmutl.ac.th" className="text-blue-600 underline">cesru@rmutl.ac.th</a></p>
          </div>
        </section>

        <section className="bg-emerald-50 border-2 border-emerald-200 rounded-xl p-5 mt-8">
          <p className="text-sm text-emerald-800">
            <strong>สรุป:</strong> เราเก็บข้อมูลของท่านเท่าที่จำเป็นในการให้บริการ ไม่ใช้เพื่อการตลาดโดยไม่ขอ consent
            ท่านสามารถลบบัญชีได้ทุกเมื่อ และเรามี audit trail ทุกการยินยอมตาม PDPA
          </p>
        </section>
      </div>
    </div>
  );
}
