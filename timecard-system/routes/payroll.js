const express = require('express');
const fs = require('fs');
const path = require('path');
const ExcelJS = require('exceljs');
const router = express.Router();
const User = require('../models/User');
const Account = require('../models/Account');
const Timecard = require('../models/Timecard');
const PHistory = require('../models/PHistory');

const payrollFileDir = path.join(__dirname, '..', 'Payroll-Files');

router.get('/download-excel', (req, res) => {
    const filePath = req.query.path;
    const fileName = path.basename(filePath);

    res.download(filePath, fileName, (err) => {
        if (err) {
            res.status(500).send({ message: 'Error downloading file.' });
        }
    });
});

router.post('/copy-template', async (req, res) => {
    const templatePath = path.join(payrollFileDir, 'Template.xlsx');
    const destinationPath = path.join(payrollFileDir, 'Current-Payroll.xlsx');

    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0]; //Format date as 'YYYY-MM-DD'

    fs.copyFile(templatePath, destinationPath, async (err) => {
        if(err){
            console.error('Error copying template file:', err);
            return res.status(500).send({message: 'Error copying template file'});
        }
        console.log('Template file copied successfully!');

        try{
            const newPayroll = new PHistory({
                fileName: 'Current-Payroll.xlsx',
                periodEndDate: formattedDate, //fill out now
                filePath: destinationPath,
                isFinal: false
            });

            await newPayroll.save();
            console.log('New Payroll entry created');
            res.status(200).send({ message: 'Payroll entry created'});
        }
        catch(error){
            console.error('Error updating database: ', error);
            return res.status(500).send({message: 'Error updating database'});
        }
    });
});

router.post('/initial-fill', async (req, res) => {
    const currentPath = path.join(payrollFileDir, 'Current-Payroll.xlsx');
    const workbook = new ExcelJS.Workbook();

    try {
        //load new payroll file
        await workbook.xlsx.readFile(currentPath);
        const worksheet = workbook.getWorksheet(1);

        //Update date information in format MM/DD/YYYY
        const periodEndDate = new Date();
        const payDate = new Date(periodEndDate);
        payDate.setDate(periodEndDate.getDate() + 3);
        const runDate = new Date(periodEndDate);
        runDate.setDate(periodEndDate.getDate() + 1);

        const formatDate = date => date.toLocaleDateString('en-US');

        worksheet.getRow(1).getCell(11).value = formatDate(periodEndDate); //PeriodEndDate (always tuesday)
        worksheet.getRow(2).getCell(11).value = formatDate(payDate); //Pay (that friday)
        worksheet.getRow(3).getCell(11).value = formatDate(runDate); //Run (that wednesday)

        //get all user info
        const users = await User.find();
        let grandTotal = 0;
        const roundUp = (num) => Math.ceil(num * 100) / 100;

        //go through each user and update their row
        users.forEach(user => {
            const row = worksheet.getRow(user.row); //getting users row number
            row.getCell(3).value = roundUp(user.totalHours); //fill total hours to hours cell
            grandTotal += roundUp(user.totalHours);
            row.commit();
        });

        //update total (this value may change if more employees are added)
        worksheet.getRow(25).getCell(3).value = roundUp(grandTotal);

        await workbook.xlsx.writeFile(currentPath);
        console.log('Initial hours transfered');
        res.status(200).send({message: 'Initial hours transfered successfuly'});
    }
    catch(error){
        console.error('Error during filling:', error);
        res.status(500).send({message: 'Initial hours failed to transfer'});
    }
});
  
//router.get('/download-pdf/:fileName', async (req, res) => {
//    const fileName = req.params.fileName;
//    const filePath = path.join(__dirname, 'payroll-files', fileName);

//    res.download(pdfFilePath, pdfFileName, (err) => {
//        if (err) {
//            res.status(500).send({ message: 'Error downloading PDF file.' });
//        }
//    });
//});

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
    const currentFilePath = path.join(payrollFileDir, 'Current-Payroll.xlsx');
    
    //Get the current date
    try{
        const payrollEntry = await PHistory.findOne({ fileName: 'Current-Payroll.xlsx', isFinal: false});
        if(!payrollEntry){
            return res.status(404).send({ message: 'No active payroll found to finalize.' });
        }

        const newFileName = new Date(payrollEntry.periodEndDate).toISOString().split('T')[0];
        const newFilePath = path.join(payrollFileDir, `${newFileName}.xlsx`);

        //Rename the file
        fs.rename(currentFilePath, newFilePath, async (err) => {
            if (err) {
                console.error('Error finalizing payroll:', err);
                return res.status(500).send({ message: 'Error finalizing payroll.' });
            }

            payrollEntry.fileName = `${newFileName}.xlsx`;
            payrollEntry.filePath = newFilePath;
            payrollEntry.isFinal = true;
            await payrollEntry.save();

            console.log(`Payroll finalized and renamed to ${newFileName}.xlsx`);
            res.status(200).send({ message: `Payroll finalized and renamed to ${newFileName}.xlsx` });
        });
    }
    catch(error){
        console.error('Error during finalization:', error);
        res.status(500).send({message: 'Failed to finalize data'});
    } 
});

router.get('/current-payroll', async (req, res) => {
    try {
        const payroll = await PHistory.find({isFinal: false}).sort({ periodEndDate: -1 });
        res.status(200).json(payroll);
    } catch (error) {
        console.error('Error fetching current payroll:', error);
        res.status(500).send({ message: 'Error retrieving current payroll.' });
    }
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