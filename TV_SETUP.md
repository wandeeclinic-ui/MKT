# การตั้งค่าฟีเจอร์ "จอทีวี" (TV Connect)

ฟีเจอร์นี้ทำให้เปิดเว็บนี้บนทีวี (Smart TV / Android TV / Chromecast with Google TV / คอมที่ต่อทีวี) แล้ว
จับคู่ผ่านรหัส 6 หลัก จากนั้นควบคุมเนื้อหาที่แสดง (รูป/วิดีโอ/ข้อความโปรโมชั่น) จากแท็บ **"จอทีวี"** ใน
เว็บแอปเดิมได้ทันที คล้ายกับ signmate.co

การ sync ระหว่างทีวีกับแอดมินใช้ **Firebase Firestore** (ฟรี, ไม่ต้องมี server ของตัวเอง)

## ขั้นตอนตั้งค่า (ทำครั้งเดียว)

1. ไปที่ https://console.firebase.google.com/ → สร้างโปรเจกต์ใหม่ (ใช้แพ็กเกจฟรี Spark ได้)
2. ในเมนู **Build → Firestore Database** → กด "Create database" → เลือก location ใกล้ไทย เช่น `asia-southeast1`
3. ไปที่ **Project settings** (ไอคอนเฟือง) → แท็บ **General** → เลื่อนลงมาที่ "Your apps" → กด
   ไอคอนเว็บ `</>` → ตั้งชื่อแอป → จะได้ object `firebaseConfig` แบบนี้:

   ```js
   {
     apiKey: "AIza...",
     authDomain: "xxx.firebaseapp.com",
     projectId: "xxx",
     storageBucket: "xxx.appspot.com",
     messagingSenderId: "...",
     appId: "1:...:web:...",
   }
   ```

4. เปิดไฟล์ `index.html` ค้นหาตัวแปร `FIREBASE_CONFIG` (ใกล้ต้นไฟล์) แล้วแทนที่ค่า `"YOUR_..."`
   ด้วยค่าจริงจากข้อ 3

5. ไปที่ **Firestore Database → Rules** แล้ววางกฎนี้ (กด Publish):

   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /tv_screens/{code} {
         allow read: if true;
         allow create: if request.resource.data.status == "pending"
                       && request.resource.data.code == code;
         allow update, delete: if true;
       }
     }
   }
   ```

   > กฎนี้เปิดกว้างโดยตั้งใจ เพราะจอทีวี/แอดมินไม่ได้ล็อกอิน — ใครก็ตามที่รู้รหัส 6 หลักของจอนั้น
   > จะอ่าน/เขียนได้ เหมาะกับใช้งานภายในคลินิกเดียว ไม่เหมาะกับระบบสาธารณะหลายผู้เช่า
   > ถ้าต้องการความปลอดภัยมากขึ้นในอนาคต ให้เพิ่ม Firebase Authentication แล้วผูกกฎ `request.auth != null`

## วิธีใช้งาน

1. เปิดเบราว์เซอร์บนทีวี ไปที่ `<ที่อยู่เว็บนี้>/index.html?screen=1` → จะขึ้นรหัสจับคู่ 6 หลักตัวใหญ่
2. บนคอมพิวเตอร์/มือถือ เปิดเว็บแอปตามปกติ → แท็บ **"จอทีวี"** → กรอกรหัสจากข้อ 1 → กด "จับคู่"
3. กด "จัดการสไลด์" ที่จอนั้น → เพิ่มสไลด์ (รูปภาพ/วิดีโอจากลิงก์ URL หรือข้อความโปรโมชั่น) → ตั้งเวลาแสดงต่อสไลด์ → บันทึก
4. ทีวีจะรับเนื้อหาและวนแสดงสไลด์โชว์แบบเรียลไทม์โดยอัตโนมัติ ไม่ต้องรีเฟรชหน้า

หมายเหตุ: รูปภาพ/วิดีโอต้องเป็นลิงก์ที่เข้าถึงได้จากอินเทอร์เน็ต (เช่น ลิงก์ตรงจาก Google Drive แบบเปิดสาธารณะ,
Cloudinary, หรือโฮสต์รูปอื่น ๆ) เพราะจอทีวีเป็นอุปกรณ์คนละเครื่องกับที่เก็บไฟล์ในเบราว์เซอร์ของแอดมิน
