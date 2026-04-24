import Link from 'next/link';

export const metadata = {
  title: 'ข้อกำหนดการใช้งาน | CESRU',
  description: 'Terms of Service for CESRU Researcher Profile System',
};

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <Link href="/" className="text-sm text-blue-600 hover:underline">← กลับหน้าหลัก</Link>

      <h1 className="text-3xl font-bold text-gray-800 mt-4 mb-2">ข้อกำหนดการใช้งาน (Terms of Service)</h1>
      <p className="text-sm text-gray-500 mb-6">เวอร์ชัน 1.0 · มีผลบังคับใช้ 24 เมษายน 2569</p>

      <div className="prose prose-slate max-w-none text-gray-700 leading-relaxed space-y-6">
        <section>
          <h2 className="text-xl font-semibold text-gray-800">1. การยอมรับข้อกำหนด</h2>
          <p>
            โดยการใช้งานเว็บไซต์หน่วยวิจัยระบบพลังงานสะอาด (CESRU) — ไม่ว่าจะเป็นการเข้าชม อ่านข้อมูล แสดงความคิดเห็น
            หรือลงทะเบียน — ถือว่าท่านยอมรับข้อกำหนดและเงื่อนไขต่อไปนี้
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800">2. บัญชีผู้ใช้</h2>
          <ul className="list-disc list-inside ml-4">
            <li>ต้องมีอายุอย่างน้อย 13 ปี (ต่ำกว่านี้ต้องได้รับความยินยอมจากผู้ปกครอง)</li>
            <li>ใช้ข้อมูลจริงและถูกต้อง — บัญชีปลอมหรือ bot อาจถูกลบโดยไม่ต้องแจ้งล่วงหน้า</li>
            <li>ผู้ใช้แต่ละคนมีบัญชีเดียว (1 Google account = 1 บัญชี)</li>
            <li>ท่านเป็นผู้รับผิดชอบในการรักษาความปลอดภัยของบัญชี Google ของท่าน</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800">3. เนื้อหาที่แสดงความคิดเห็น</h2>
          <p>เมื่อท่านแสดงความคิดเห็นหรือโพสต์เนื้อหา ท่านรับรองว่า:</p>
          <ul className="list-disc list-inside ml-4">
            <li>เนื้อหาเป็นของท่านเอง หรือท่านมีสิทธิ์เผยแพร่</li>
            <li>ไม่ละเมิดลิขสิทธิ์ เครื่องหมายการค้า หรือสิทธิ์ของผู้อื่น</li>
            <li>ไม่หมิ่นประมาท ไม่ใช้คำหยาบคาย ไม่ข่มขู่หรือคุกคามผู้อื่น</li>
            <li>ไม่เป็นสแปม การโฆษณาที่ไม่เกี่ยวข้อง หรือ phishing</li>
            <li>ไม่มีเนื้อหาที่ผิดกฎหมายไทย เช่น หมิ่นสถาบัน ข้อมูลปลอม</li>
            <li>ไม่เป็นข้อมูลส่วนบุคคลของผู้อื่นโดยไม่ได้รับอนุญาต</li>
          </ul>
          <p className="mt-3 bg-amber-50 border-l-4 border-amber-500 p-3 rounded text-sm">
            ⚠️ <strong>Admin สงวนสิทธิ์ในการลบ comment ที่ไม่เหมาะสมได้ทุกเมื่อ</strong> โดยไม่ต้องแจ้งล่วงหน้า
            ผู้ที่ละเมิดซ้ำอาจถูกระงับบัญชี
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800">4. สิทธิ์ในเนื้อหาของผู้ใช้</h2>
          <p>
            ท่านยังคงเป็นเจ้าของลิขสิทธิ์ในเนื้อหาที่ท่านโพสต์ แต่ท่านอนุญาตให้ CESRU ใช้แสดงบนเว็บไซต์
            โดยไม่เรียกร้องค่าตอบแทน (royalty-free) และสิทธิ์นี้สิ้นสุดเมื่อท่านลบ comment หรือลบบัญชี
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800">5. ทรัพย์สินทางปัญญาของเว็บไซต์</h2>
          <p>
            เนื้อหาของเว็บไซต์ (บทความ ภาพประกอบ ผลงานวิจัย) เป็นของ CESRU หรือผู้สร้างสรรค์ที่ระบุ
            การนำไปใช้ซ้ำต้องอ้างอิงแหล่งที่มาและขออนุญาต (ยกเว้นการใช้งานเพื่อการศึกษา — ภายใต้ fair use)
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800">6. ข้อจำกัดความรับผิด</h2>
          <p>
            ข้อมูลบนเว็บไซต์มีไว้เพื่อการศึกษาและเผยแพร่ผลงานวิจัย — <strong>ไม่ถือเป็นคำปรึกษาอย่างเป็นทางการ</strong>
            ผู้ใช้ควรตรวจสอบความถูกต้องก่อนนำไปใช้อ้างอิง CESRU ไม่รับผิดชอบต่อความเสียหายที่เกิดจากการใช้ข้อมูลผิดวัตถุประสงค์
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800">7. การปรับปรุงข้อกำหนด</h2>
          <p>
            เราอาจปรับปรุงข้อกำหนดนี้เป็นระยะ การเปลี่ยนแปลงสำคัญจะแจ้งล่วงหน้า 30 วัน
            หากท่านไม่ยอมรับข้อกำหนดใหม่ ท่านสามารถลบบัญชีได้ก่อนมีผลบังคับใช้
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800">8. กฎหมายที่บังคับใช้</h2>
          <p>
            ข้อกำหนดนี้อยู่ภายใต้บังคับของกฎหมายไทย หากมีข้อพิพาท ให้ใช้กระบวนการไกล่เกลี่ยของ สคส.
            (สำนักงานคณะกรรมการคุ้มครองข้อมูลส่วนบุคคล) ก่อนเป็นลำดับแรก
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800">9. ติดต่อเรา</h2>
          <p>
            สำหรับคำถามเกี่ยวกับข้อกำหนด: <a href="mailto:cesru@rmutl.ac.th" className="text-blue-600 underline">cesru@rmutl.ac.th</a>
          </p>
        </section>

        <p className="text-sm text-gray-500 mt-8 pt-4 border-t">
          ดูเพิ่มเติม: <Link href="/privacy-policy" className="text-blue-600 underline">นโยบายความเป็นส่วนตัว</Link>
        </p>
      </div>
    </div>
  );
}
