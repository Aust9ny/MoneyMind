const express = require('express');
const router = express.Router();
const multer = require('multer');
const Tesseract = require('tesseract.js');
const fs = require('fs');
const path = require('path');
const dayjs = require('dayjs');
const customParseFormat = require('dayjs/plugin/customParseFormat');
require('dayjs/locale/th'); // ใช้ภาษาไทย
dayjs.extend(customParseFormat);

router.use(express.json());
router.use(express.urlencoded({ extended: false }));

// 🔥 ตั้งค่าโฟลเดอร์ uploads/ ถ้ายังไม่มีให้สร้าง
const uploadDir = 'uploads/';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// ✅ ตั้งค่า multer ให้จัดการการอัปโหลดรูป
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const timestamp = Date.now();
        const ext = path.extname(file.originalname);
        cb(null, `uploaded_${timestamp}${ext}`);
    }
});
const upload = multer({ storage: storage });

router.post('/', upload.single('image'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: "No image uploaded", success: false });
    }

    const imagePath = path.join(uploadDir, req.file.filename);
    const timestamp = Date.now();
    const rawTextPath = path.join(uploadDir, `ocr_raw_${timestamp}.txt`);
    const cleanedTextPath = path.join(uploadDir, `ocr_cleaned_${timestamp}.txt`);
    const extractedDataPath = path.join(uploadDir, `ocr_data_${timestamp}.json`);

    try {
        console.log(`🔍 Processing OCR for ${imagePath}`);

        // ✅ OCR อ่านภาพโดยตรง
        const { data: { text } } = await Tesseract.recognize(
            imagePath,
            'tha+eng', // รองรับภาษาไทยและอังกฤษ
            { logger: m => console.log(m) }
        );

        console.log('📜 OCR Output (raw):\n', text);

        // ✅ บันทึก Raw OCR Text
        fs.writeFileSync(rawTextPath, text, 'utf8');

        // ✅ ทำความสะอาดข้อความ
        let cleanedText = cleanText(text);
        console.log('📜 OCR Output (cleaned):\n', cleanedText);

        // ✅ บันทึก Cleaned OCR Text
        fs.writeFileSync(cleanedTextPath, cleanedText, 'utf8');

        // ✅ ดึงข้อมูลที่ต้องการ
        const extractedData = extractReceiptData(cleanedText);
        console.log('📊 Extracted Data:', extractedData);

        // ✅ บันทึก Extracted Data เป็น JSON
        fs.writeFileSync(extractedDataPath, JSON.stringify(extractedData, null, 2), 'utf8');

        return res.status(200).json({
            message: "OCR success",
            success: true,
            imagePath,
            extractedData,
            savedFiles: {
                rawTextPath,
                cleanedTextPath,
                extractedDataPath
            }
        });

    } catch (error) {
        console.error('❌ OCR Error:', error);
        return res.status(500).json({ message: "OCR failed", error: error.message, success: false });
    }
});

// 📌 ฟังก์ชันทำความสะอาดข้อความ
function cleanText(text) {
    return text
        .replace(/\s+/g, ' ') // ลบช่องว่างซ้ำกัน
        .replace(/[^\w\dก-ฮ๐-๙.,:/-]/g, '') // ลบอักขระพิเศษ
        .replace(/บท/g, 'บาท') // แก้ OCR อ่านผิดจาก 'บท' เป็น 'บาท'
        .replace(/php/g, '') // ลบอักขระที่ผิดพลาด
        .replace(/ยอดสทธ/g, 'ยอดสุทธิ') // แก้คำผิดที่พบบ่อย
        .replace(/รวม/g, 'รวม') // แก้คำผิดที่พบบ่อย
        .trim();
}

// 📌 ฟังก์ชันดึงข้อมูลจากใบเสร็จทุกประเภท
function extractReceiptData(text) {
    // 🏦 ธนาคาร / ร้านค้า
    const bankOrShopRegex = /(ธนาคาร|Bank|ร้าน|บริษัท|Shop|Store|7-11|Tesco|Lotus|Big C|Makro|True|AIS|DTAC|TOT|การไฟฟ้า|การประปา)\s*([\w\s]+)/;
    const bankOrShop = text.match(bankOrShopRegex)?.[0] || 'ไม่พบข้อมูล';

    // 📅 แปลง "วันที่" ให้อยู่ใน `Date` format
    const dateRegexThai = /(\d{1,2})\s*(ม\.?ค\.?|ก\.?พ\.?|มี\.?ค\.?|เม\.?ย\.?|พ\.?ค\.?|มิ\.?ย\.?|ก\.?ค\.?|ส\.?ค\.?|ก\.?ย\.?|ต\.?ค\.?|พ\.?ย\.?|ธ\.?ค\.?)\s*(\d{2,4})/;
    const dateRegexNumeric = /(?:วัน[ที่ที]\s*[:：]?\s*)?(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/;

    let formattedDate = null;

    // ✅ ตรวจสอบ "DD เดือน YYYY" (ไทย)
    const dateMatchThai = text.match(dateRegexThai);
    if (dateMatchThai) {
        let [_, day, monthThai, year] = dateMatchThai;
        const monthMap = {
            "ม.ค.": "01", "ก.พ.": "02", "มี.ค.": "03", "เม.ย.": "04",
            "พ.ค.": "05", "มิ.ย.": "06", "ก.ค.": "07", "ส.ค.": "08",
            "ก.ย.": "09", "ต.ค.": "10", "พ.ย.": "11", "ธ.ค.": "12"
        };
        let month = monthMap[monthThai] || "01"; // กันกรณี OCR อ่านผิด

        if (parseInt(year) > 2500) {
            year = parseInt(year) - 543; // แปลง พ.ศ. -> ค.ศ.
        }

        formattedDate = dayjs(`${year}-${month}-${day}`, "YYYY-MM-DD").toDate();
    }

    // ✅ ตรวจสอบ "DD/MM/YYYY" (เลขล้วน)
    const dateMatchNumeric = text.match(dateRegexNumeric);
    if (dateMatchNumeric && !formattedDate) { // ใช้เฉพาะถ้ายังไม่ได้ค่า formattedDate
        let [_, day, month, year] = dateMatchNumeric;

        if (parseInt(year) > 2500) {
            year = parseInt(year) - 543;
        }

        formattedDate = dayjs(`${year}-${month}-${day}`, "YYYY-MM-DD").toDate();
    }

    // ⏰ เวลา
    const timeRegex = /(\d{1,2}):(\d{2})(?::(\d{2}))?/;  // ✅ รองรับทั้ง HH:mm และ HH:mm:ss
    const timeMatch = text.match(timeRegex);

    let formattedTime = null;
    if (timeMatch) {
        let hours = timeMatch[1];
        let minutes = timeMatch[2];
        let seconds = timeMatch[3] || "00"; // ถ้าไม่มีวินาทีให้ใช้ "00"

        formattedTime = dayjs(`${hours}:${minutes}:${seconds}`, "HH:mm:ss").toDate();
    }

    // 🔢 หมายเลขอ้างอิง
    const refRegex = /(INV|RECEIPT|TAX|BAYM|SCB|KTB|KBank|TTB|UOB|CIMB|GSB|BBL|TMB|QR|PAYMENT|REF)\d+/;
    const referenceNo = text.match(refRegex)?.[0] || 'ไม่พบข้อมูล';

    // 💰 จำนวนเงิน
    const moneyRegex = /(?:จำนวนเงิน|รวม|ยอดสุทธิ|โอนเงิน)?\s*[:：]?\s*([\d]{1,3}(?:,\d{3})*(?:\.\d{1,2})?)\s*(THB|บาทถ้วน|บาท)?/gi;

    let moneyMatches = [...text.matchAll(moneyRegex)]
        .filter(m => m[1] && (m[2] || /(?:จำนวนเงิน|รวม|ยอดสุทธิ|โอนเงิน)/.test(text.substring(m.index - 15, m.index))))
        .map(m => parseFloat(m[1].replace(/,/g, '')));

    const totalAmount = moneyMatches.length > 0 ? Math.max(...moneyMatches).toFixed(2) : 'ไม่พบข้อมูล';

    console.log(totalAmount);

    // 💲 VAT 7%
    const vatRegex = /ภาษีมูลค่าเพิ่ม\s*([\d,]+(?:\.\d{1,2})?)\s*(THB|บาท)/;
    const vatMatch = text.match(vatRegex);
    const vat = vatMatch ? parseFloat(vatMatch[1].replace(/,/g, '')).toFixed(2) : '0.00';

    return { bankOrShop, date: formattedDate, time: formattedTime, referenceNo, totalAmount, vat };
}

module.exports = router;