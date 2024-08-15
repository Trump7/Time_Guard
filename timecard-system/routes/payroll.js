const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Account = require('../models/Account');
const Timecard = require('../models/Timecard');
const { model } = require('mongoose');

app.get('/api/download-excel/:fileName', (req, res) => {
    const fileName = req.params.fileName;
    const filePath = path.join(__dirname, 'payroll-files', fileName);
    res.download(filePath, fileName, (err) => {
        if (err) {
        res.status(500).send({ message: 'Error downloading file.' });
        }
    });
});
  
app.get('/api/download-pdf/:fileName', async (req, res) => {
    const fileName = req.params.fileName;
    const filePath = path.join(__dirname, 'payroll-files', fileName);

    // Logic to convert Excel to PDF
    // For example, use puppeteer to convert an HTML version of the Excel to PDF

    res.download(pdfFilePath, pdfFileName, (err) => {
        if (err) {
        res.status(500).send({ message: 'Error downloading PDF file.' });
        }
    });
});

app.post('/api/update-payroll', async (req, res) => {
    const { updates } = req.body;
    const filePath = path.join(__dirname, 'payroll-files', 'current-payroll.xlsx');
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);
    const sheet = workbook.getWorksheet(1);
    
    updates.forEach(update => {
      const row = sheet.getRow(update.row);
      row.getCell('Salary').value = update.salary;
      row.getCell('RegHours').value = update.regHours;
      // Update other columns as necessary
      row.commit();
    });
    
    await workbook.xlsx.writeFile(filePath);
    res.status(200).send({ message: 'Payroll updated successfully.' });
});
  
app.post('/api/finalize-payroll', async (req, res) => {
    const { fileName } = req.body;
    const currentFilePath = path.join(__dirname, 'payroll-files', fileName);
    const archiveFilePath = path.join(__dirname, 'payroll-files', 'archive', fileName);
    
    // Move the file to the archive folder
    fs.rename(currentFilePath, archiveFilePath, (err) => {
      if (err) {
        return res.status(500).send({ message: 'Error finalizing payroll.' });
      }
      // Generate PDF if needed
      res.status(200).send({ message: 'Payroll finalized and archived successfully.' });
    });
});

app.get('/api/payroll-history', async (req, res) => {
    try {
      const payrollRecords = await PayrollHistory.find().sort({ periodEndDate: -1 }).exec();
      res.status(200).json(payrollRecords);
    } catch (error) {
      res.status(500).send({ message: 'Error retrieving payroll history.' });
    }
});
  
  

model.exports = router;