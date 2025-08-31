const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// Generates PDF invoice buffer from packageHistory record, returns Promise<Buffer>
function generateInvoicePDF(user, packageHistoryEntry, packageDetails) {
  return new Promise((resolve, reject) => {
    try {
       const doc = new PDFDocument({ size: 'A4', margin: 50 });

       let buffers = [];
       doc.on('data', buffers.push.bind(buffers));
       doc.on('end', () => {
          const pdfData = Buffer.concat(buffers);
          resolve(pdfData);
       });

       // Document Title
       doc.fontSize(20).text('Package Purchase Invoice', { align: 'center' });
       doc.moveDown();

       // User Info
       doc.fontSize(12).text(`User: ${user.name} (${user.email})`);
       doc.text(`Invoice Date: ${new Date().toLocaleDateString()}`);
       doc.moveDown();

       // Package Info
       doc.fontSize(14).text(`Package: ${packageDetails.name}`);
       doc.fontSize(12).text(`Price: ₹${packageDetails.price}`);
       doc.text(`Duration: ${packageDetails.durationDays} days`);
       doc.text(`Assigned On: ${new Date(packageHistoryEntry.assignedAt).toLocaleDateString()}`);
       doc.text(`Valid Till: ${new Date(packageHistoryEntry.validTill).toLocaleDateString()}`);
       doc.moveDown();

       // Payment info
       doc.fontSize(12).text(`Amount Paid: ₹${packageHistoryEntry.price}`);
       doc.text(`Status: ${packageHistoryEntry.status}`);
       doc.moveDown();

       // Footer / Thank you note
       doc.fontSize(10).text('Thank you for your purchase!', { align: 'center' });

       doc.end();
    } catch (error) {
       reject(error);
    }
  });
}

module.exports = { generateInvoicePDF };
