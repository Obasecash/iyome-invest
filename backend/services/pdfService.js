import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import QRCode from "qrcode";

export async function generateReceiptPDF({
  type,
  investorId,
  name,
  amount,
  currency = "XAF",
  externalId,
  financialId,
}) {
  const doc = new PDFDocument({ margin: 50 });
  const filename = `receipt_${type}_${investorId}_${Date.now()}.pdf`;
  const folder = path.join("./receipts");
  const filePath = path.join(folder, filename);

  if (!fs.existsSync(folder)) fs.mkdirSync(folder);

  const stream = fs.createWriteStream(filePath);
  doc.pipe(stream);

  // ===== HEADER =====
  doc.rect(0, 0, 612, 80).fill("#0b1f3a"); // Iyome blue

  // Logo
  const logoPath = path.join("./assets/logo-iyome.png");
  if (fs.existsSync(logoPath)) {
    doc.image(logoPath, 50, 15, { width: 50 });
  }

  // Title
  doc
    .fillColor("#FFD700")
    .fontSize(24)
    .font("Helvetica-Bold")
    .text("IYOME GROUP", 110, 25, { align: "left" });
  doc
    .fontSize(11)
    .fillColor("#E5E7EB")
    .text("Legit Investment Platform — Obasecash Infrastructure", 110, 50);

  // ===== RECEIPT BODY =====
  doc.moveDown(4);
  doc
    .fontSize(20)
    .fillColor("#0b1f3a")
    .text(`${type.toUpperCase()} RECEIPT`, { align: "center" });

  doc.moveDown(1);
  doc.moveTo(50, doc.y).lineTo(562, doc.y).stroke("#FFD700");
  doc.moveDown(1.5);

  const info = [
    ["Investor Name", name || "Investor"],
    ["Investor ID", investorId],
    ["Transaction Type", type.toUpperCase()],
    ["Amount", `${Number(amount).toLocaleString()} ${currency}`],
    ["Reference", externalId],
    ["MTN Transaction ID", financialId || "-"],
    ["Date", new Date().toLocaleString()],
  ];

  doc.font("Helvetica").fontSize(13);
  info.forEach(([label, value]) => {
    doc
      .fillColor("#0b1f3a")
      .text(`${label}:`, 60, doc.y + 4, { continued: true })
      .fillColor("#111827")
      .text(` ${value}`);
  });

  // ===== QR CODE SECTION =====
  const verifyUrl = `https://iyome-invest-platform.onrender.com/verify/${externalId}`;
  const qrData = await QRCode.toDataURL(verifyUrl);

  const img = qrData.replace(/^data:image\/png;base64,/, "");
  const qrPath = path.join(folder, `qr_${externalId}.png`);
  fs.writeFileSync(qrPath, img, "base64");

  doc.moveDown(2);
  doc.image(qrPath, 250, doc.y, { width: 100, align: "center" });
  doc
    .fontSize(10)
    .fillColor("#555")
    .text("Scan to verify receipt authenticity", { align: "center" });

  // ===== FOOTER =====
  doc.rect(0, 740, 612, 52).fill("#0b1f3a");
  doc
    .fillColor("#FFD700")
    .fontSize(10)
    .text("www.iyomegroup.com   •   support@iyomegroup.com", 0, 760, {
      align: "center",
      width: 612,
    });

  doc.end();

  return new Promise((resolve, reject) => {
    stream.on("finish", () => resolve(filePath));
    stream.on("error", reject);
  });
}
