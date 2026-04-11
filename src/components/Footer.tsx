export default function Footer() {
  return (
    <footer className="bg-gray-800 text-gray-300 py-8 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-white font-semibold mb-3">CESRU - Clean Energy System Research Unit</h3>
            <p className="text-sm">หน่วยวิจัยระบบพลังงานสะอาด</p>
            <p className="text-sm">คณะวิศวกรรมศาสตร์ มหาวิทยาลัยเทคโนโลยีราชมงคลล้านนา</p>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-3">สาขาวิจัย</h3>
            <ul className="text-sm space-y-1">
              <li>Solar Energy & Solar Rooftop</li>
              <li>Battery Energy Storage Systems</li>
              <li>Electric Vehicles & Charging</li>
              <li>Wireless Power Transfer</li>
              <li>Microgrid & Community Energy</li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-3">ที่อยู่</h3>
            <p className="text-sm">
              Faculty of Engineering<br />
              Rajamangala University of Technology Lanna<br />
              128 ถ.ห้วยแก้ว ต.ช้างเผือก<br />
              อ.เมือง จ.เชียงใหม่ 50300
            </p>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-4 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} CESRU - RMUTL. All rights reserved.</p>
          <p className="text-gray-500 text-xs mt-1">แสดงเฉพาะผลงานที่ผ่านการยืนยันจากฐานข้อมูลวิชาการ</p>
        </div>
      </div>
    </footer>
  );
}
