-- ============================================================
-- เพิ่มผลงานตีพิมพ์จาก RMUTL Engineering Journal 2016
-- ============================================================

-- [PUB-R1] มทร.ล้านนากับมูลนิธิโครงการหลวง: วิศวกรรมเพื่อการเกษตร
INSERT INTO publications (id, title, title_th, pub_type, status, journal_name, volume, issue, pages, year, doi, authors_raw, keywords)
VALUES (
  'b0000001-0000-0000-0000-000000000201',
  'Rajamangala University of Technology Lanna and the Royal Project Foundation: Case Study of Engineering in Agricultural Systems',
  'มหาวิทยาลัยเทคโนโลยีราชมงคลล้านนากับมูลนิธิโครงการหลวง กรณีศึกษา: งานวิศวกรรมเพื่อการเกษตร',
  'journal_national', 'published',
  'RMUTL Engineering Journal', '1', '2', 'pp. 1-7', 2016,
  '10.14456/rmutlengj.2016.11',
  'W. Wannoprom, W. Kittiworachate, S. Salee, N. Saikaew, W. Muangjai, T. Somsak, J. Thongpron, K. Kirtikara',
  ARRAY['royal project foundation', 'agricultural engineering', 'TPM', 'management engineering', 'preventive maintenance']
);

-- เชื่อมโยงผู้แต่ง: วรจักร์ (author 5), ธีระศักดิ์ (author 6), จัตตุฤทธิ์ (author 7)
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order, is_corresponding) VALUES
('b0000001-0000-0000-0000-000000000201', 'a0000001-0000-0000-0000-000000000009', 'co_author', 5, false),
('b0000001-0000-0000-0000-000000000201', 'a0000001-0000-0000-0000-000000000002', 'co_author', 6, false),
('b0000001-0000-0000-0000-000000000201', 'a0000001-0000-0000-0000-000000000001', 'co_author', 7, false);

-- [PUB-R2] การพัฒนาวิธีประมาณค่าพลังงานแสงอาทิตย์ที่ทิศและมุมต่างกัน
INSERT INTO publications (id, title, title_th, pub_type, status, journal_name, volume, issue, pages, year, doi, authors_raw, keywords)
VALUES (
  'b0000001-0000-0000-0000-000000000202',
  'Development of Solar Energy Evaluation at Various Direction and Tilt with Correlation Method with Fractal Dimension Technique: Clear Sky Condition',
  'การพัฒนาวิธีประมาณค่าพลังงานแสงอาทิตย์ที่ทิศและมุมต่างกันด้วยวิธีสหสัมพันธ์และใช้เทคนิคการจำแนกลักษณะท้องฟ้าแบบมิติสาทิสรูป: กรณีท้องฟ้าแจ่มใส',
  'journal_national', 'published',
  'RMUTL Engineering Journal', '1', '2', 'pp. 29-34', 2016,
  '10.14456/rmutlengj.2016.15',
  'S. Jumpa-Im, J. Thongpron, J. Saerour, R. Songprakorp, T. Somsak',
  ARRAY['solar energy', 'correlation', 'fractal dimension', 'solar radiation', 'photovoltaic rooftop']
);

-- เชื่อมโยงผู้แต่ง: จัตตุฤทธิ์ (author 2), ธีระศักดิ์ (author 5, corresponding)
INSERT INTO publication_authors (publication_id, researcher_id, author_role, author_order, is_corresponding) VALUES
('b0000001-0000-0000-0000-000000000202', 'a0000001-0000-0000-0000-000000000001', 'co_author', 2, false),
('b0000001-0000-0000-0000-000000000202', 'a0000001-0000-0000-0000-000000000002', 'last_author', 5, true);
