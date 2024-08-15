const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Account = require('../models/Account');
const Timecard = require('../models/Timecard');
const PHistory = require('../models/PHistory');

router.get('/download-excel', (req, res) => {
    const filePath = req.query.path;
    res.download(filePath, (err) => {
        if (err) {
            res.status(500).send({ message: 'Error downloading file.' });
        }
    });
});
  
  
router.get('/download-pdf/:fileName', async (req, res) => {
    const fileName = req.params.fileName;
    const filePath = path.join(__dirname, 'payroll-files', fileName);

    res.download(pdfFilePath, pdfFileName, (err) => {
        if (err) {
            res.status(500).send({ message: 'Error downloading PDF file.' });
        }
    });
});

router.post('/update-payroll', async (req, res) => {
    const { updates } = req.body;
    const filePath = path.join(__dirname, 'payroll-files', 'current-payroll.xlsx');
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);
    const sheet = workbook.getWorksheet(1);
    
    updates.forEach(update => {
        const row = sheet.getRow(update.row);
        row.getCell('Salary').value = update.salary;
        row.getCell('RegHours').value = update.regHours;
        row.commit();
    });
    
    await workbook.xlsx.writeFile(filePath);
    res.status(200).send({ message: 'Payroll updated successfully.' });
});
  
router.post('/finalize-payroll', async (req, res) => {
    const { fileName } = req.body;
    const currentFilePath = path.join(__dirname, 'payroll-files', fileName);
    const archiveFilePath = path.join(__dirname, 'payroll-files', 'archive', fileName);
    
    fs.rename(currentFilePath, archiveFilePath, (err) => {
        if (err) {
            return res.status(500).send({ message: 'Error finalizing payroll.' });
        }
        res.status(200).send({ message: 'Payroll finalized and archived successfully.' });
    });
});

router.get('/payroll-history', async (req, res) => {
    try {
        const payrollRecords = await PHistory.find().sort({ periodEndDate: -1 }).exec();
        res.status(200).json(payrollRecords);
    } catch (error) {
        res.status(500).send({ message: 'Error retrieving payroll history.' });
    }
});
  
  

module.exports = router;