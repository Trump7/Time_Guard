const express = require('express');
const fs = require('fs');
const path = require('path');
const ExcelJS = require('exceljs');
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

router.post('/copy-template', (req, res) => {
    const templatePath = path.join(__dirname, 'payroll-files', 'Template.xlsx');
    const destinationPath = path.join(__dirname, 'payroll-files', 'Current-Payroll.xlsx');

    fs.copyFile(templatePath, destinationPath, (err) => {
        if(err){
            console.error('Error copying template file:', err);
            return res.status(500).send({message: 'Error copying template file'});
        }
        console.log('Template file copied successfully!');
        res.status(200).send({ message: 'Template file copied successfully'});
    });
});

router.post('/initial-fill', async (req, res) => {
    const currentPath = path.join(__dirname, 'payroll-files', 'Current-Payroll.xlsx');
    const workbook = new ExcelJS.Workbook();

    try {
        //load new payroll file
        await workbook.xlsx.readFile(currentPath);
        const worksheet = workbook.getWorksheet(1);

        //get all user info
        const users = await User.find();

        //go through each user and update their row
        users.forEach(user => {
            const row = worSheet.getRow(user.row); //getting users row number
            row.getCell(3).value = user.totalHours; //fill total hours to hours cell
            row.commit();
        });

        await workbook.xlsx.writeFile(currentPath);
        console.log('Initial hours transfered');
        res.status(200).send({message: 'Initial hours transfered successfuly'});
    }
    catch(error){
        console.error('Error during filling:', error);
        res.status(500).send({message: 'Initial hours failed to transfer'});
    }
});
  
// router.get('/download-pdf/:fileName', async (req, res) => {
//     const fileName = req.params.fileName;
//     const filePath = path.join(__dirname, 'payroll-files', fileName);

//     res.download(pdfFilePath, pdfFileName, (err) => {
//         if (err) {
//             res.status(500).send({ message: 'Error downloading PDF file.' });
//         }
//     });
// });

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
        const payrollRecords = await PHistory.find({isFinal: true}).sort({ periodEndDate: -1 }).exec();
        res.status(200).json(payrollRecords);
    } catch (error) {
        res.status(500).send({ message: 'Error retrieving payroll history.' });
    }
});
  
  

module.exports = router;