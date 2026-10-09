import {translateText} from '../lib/localization';
const lanRows=[
 ['CAT 5e','เครือข่าย Gigabit สำหรับบ้านและสำนักงาน','ทางเลือกสำหรับการใช้งานทั่วไป เลือกสายและหัวต่อที่ได้มาตรฐาน'],
 ['CAT 6','บ้านและสำนักงานที่ต้องการเผื่อขยายระบบ','รองรับ 10 Gigabit ในระยะสั้น โดยต้องตรวจระยะและสัญญาณรบกวน'],
 ['CAT 6a','เครือข่าย 10 Gigabit ในอาคาร','รองรับ 10 Gigabit ที่ระยะช่องสัญญาณสูงสุด 100 เมตร เมื่อทั้งระบบได้มาตรฐาน'],
 ['CAT 6e','พิจารณาตามข้อมูลของผู้ผลิต','CAT 6e ไม่ใช่ CAT 6a ตรวจมาตรฐานและผลทดสอบก่อนเลือกใช้'],
 ['CAT 7 / 7e','งานที่ระบุข้อกำหนดสายและการป้องกันสัญญาณรบกวน','ตรวจมาตรฐานที่ผู้ผลิตรับรอง รวมถึงหัวต่อและความเข้ากันได้กับอุปกรณ์'],
 ['CAT 8','การเชื่อมต่อความเร็วสูงระยะสั้นในศูนย์ข้อมูล','รองรับ 25/40 Gigabit ที่ระยะช่องสัญญาณสูงสุด 30 เมตร'],
];
const securityRows=[
 ['ระบบแจ้งเตือนเหตุด่วน (Emergency Notification)','แจ้งเหตุฉุกเฉินหรือเหตุที่เป็นอันตรายต่อชีวิต','บ้านที่มีผู้สูงอายุหรือเด็ก รวมถึงพื้นที่ที่ต้องการแจ้งเหตุฉุกเฉิน'],
 ['ระบบตรวจจับการบุกรุก (Intrusion Detection System)','ตรวจจับความเคลื่อนไหวหรือการบุกรุก และแจ้งเตือนเมื่อพบเหตุ','บ้าน สำนักงาน และพื้นที่ที่ต้องการเฝ้าระวังการเข้าโดยไม่ได้รับอนุญาต'],
 ['ระบบแจ้งเหตุเพลิงไหม้ (Fire Alarm System)','ตรวจจับควันหรือความร้อน และส่งสัญญาณเตือน','บ้าน อาคาร และสำนักงานที่ต้องการแจ้งเตือนอัคคีภัย'],
];

export function ServiceComparison({kind,english=false}:{kind:'lan'|'security';english?:boolean}){
 const lan=kind==='lan',id=`${kind}-comparison`;
 const title=translateText(lan?'เปรียบเทียบประเภทสาย LAN':'เปรียบเทียบระบบรักษาความปลอดภัย',english);
 return <div className="service-comparison" id={id}>
  <p className="comparison-eyebrow">{translateText(lan?'TYPE OF LAN CABLE':'SECURITY SYSTEM',english)}</p>
  <h3 id={`${id}-heading`}>{title}</h3>
  <p>{translateText(lan?'เลือกสายให้เหมาะกับความเร็ว ระยะทาง และอุปกรณ์ที่ใช้งาน':'เลือกระบบตามเหตุที่ต้องการตรวจจับและลักษณะพื้นที่ โดยสามารถใช้หลายระบบร่วมกันได้',english)}</p>
  <p className="comparison-scroll-hint" id={`${id}-hint`}>{translateText("เลื่อนตารางซ้าย–ขวาเพื่อดูข้อมูลทั้งหมด",english)}</p>
  <div className="comparison-scroll" role="region" aria-labelledby={`${id}-heading`} aria-describedby={`${id}-hint`} tabIndex={0}>
   <table><caption className="screen-reader-text">{title}</caption><thead><tr>{(lan?['ประเภทสาย','เหมาะกับการใช้งาน','ข้อควรพิจารณา']:['ระบบ','หน้าที่หลัก','เหมาะกับพื้นที่']).map(label=><th scope="col" key={label}>{english&&label==='หน้าที่หลัก'?'Main function':translateText(label,english)}</th>)}</tr></thead>
    <tbody>{(lan?lanRows:securityRows).map(([label,...cells])=><tr key={label}><th scope="row">{translateText(label,english)}</th>{cells.map(cell=><td key={cell}>{translateText(cell,english)}</td>)}</tr>)}</tbody>
   </table>
  </div>
  <p className="comparison-note">{translateText(lan?'ความเร็วจริงขึ้นอยู่กับสาย หัวต่อ อุปกรณ์ ระยะทาง และผลทดสอบของระบบ':'อุปกรณ์ การบันทึกข้อมูล และช่องทางแจ้งเตือนขึ้นอยู่กับรุ่นและการออกแบบระบบ',english)}</p>
  {lan&&<p className="comparison-sources">{translateText("ข้อมูลเพิ่มเติม: ",english)}<a href="https://www.flukenetworks.com/expertise/role/network-engineers" target="_blank" rel="noopener noreferrer">{translateText("มาตรฐานสาย LAN",english)}</a> · <a href="https://www.flukenetworks.com/knowledge-base/applicationstandards-articles-copper/category-6e-its-not-category-6a" target="_blank" rel="noopener noreferrer">{translateText("CAT 6e และ CAT 6a",english)}</a></p>}
 </div>;
}
