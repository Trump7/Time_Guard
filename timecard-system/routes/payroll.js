const express = require('express');
const fs = require('fs');
const path = require('path');
const ExcelJS = require('exceljs');
const router = express.Router();
const User = require('../models/User');
const TimeAdd = require('../models/TimeAdd');
const PHistory = require('../models/PHistory');
const { verifyToken, checkAdmin, verifyDeviceToken } = require('../middleware/authMiddleware');

const payrollFileDir = path.join(__dirname, '..', 'Payroll-Files');

router.get('/download-excel', verifyToken, checkAdmin, (req, res) => {
    const filePath = req.query.path;
    const fileName = path.basename(filePath);

    res.download(filePath, fileName, (err) => {
        if (err) {
            res.status(500).send({ message: 'Error downloading file.' });
        }
    });
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

//For Arduino
router.post('/copy-template', verifyDeviceToken , async (req, res) => {
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

//For Arduino
router.post('/initial-fill', verifyDeviceToken , async (req, res) => {
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

        //go through each user and update their row on excel
        users.forEach(user => {
            const row = worksheet.getRow(user.row); //getting users row number
            row.getCell(3).value = roundUp(user.totalHours); //fill total hours to hours cell
            grandTotal += roundUp(user.totalHours);
            row.commit();
        });

        //update total (this value may change if more employees are added)
        worksheet.getRow(24).getCell(3).value = roundUp(grandTotal);

        await workbook.xlsx.writeFile(currentPath);
        console.log('Initial hours transfered');
        res.status(200).send({message: 'Initial hours transfered successfuly'});
    }
    catch(error){
        console.error('Error during filling:', error);
        res.status(500).send({message: 'Initial hours failed to transfer'});
    }
});

//need to add new confirmation for the timecard device to check if its been finalized
router.get('/is-finalized', verifyDeviceToken, async (req, res) => {
    try {
        const payroll = await PHistory.find({isFinal: false}).sort({ periodEndDate: -1 });
        console.log('Payroll has not been finalized...');
        res.status(500).send();
    } catch (error) {
        console.error('Payroll has been finalized, no current payroll exists: ', error);
        res.status(200).send();
    }
});

//If it has not been finalized, the arduino needs to finalize it
router.post('/finalize-auto', verifyDeviceToken, async (req, res) => {
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


router.get('/get-payroll-data', verifyToken, checkAdmin, async (req, res) => {
    const currentPath = path.join(payrollFileDir, 'Current-Payroll.xlsx');
    const workbook = new ExcelJS.Workbook();

    //const roundUp = (num) => Math.ceil(num * 100) / 100;

    try {
        //load new payroll file
        await workbook.xlsx.readFile(currentPath);
        const worksheet = workbook.getWorksheet(1);
        
        const employees = await User.find().sort({ row: 1 }); // Assuming `row` field is in the User model and sorted ascending

        let payrollData = [];
        let totals = { salary: 0, regHours: 0, otHours: 0, vacaHours: 0, misc: 0, rmbExp: 0, bonus: 0 };

        employees.forEach(user => {
            const row = worksheet.getRow(user.row);
            const userPayroll = {
                name: user.name,
                row: user.row,
                salary: row.getCell(2).value > 0 ? row.getCell(2).value : '',
                regHours: row.getCell(3).value > 0 ? row.getCell(3).value : '',
                otHours: row.getCell(4).value > 0 ? row.getCell(4).value : '',
                vacaHours: row.getCell(5).value > 0 ? row.getCell(5).value : '',
                misc: row.getCell(6).value > 0 ? row.getCell(6).value : '',
                rmbExp: row.getCell(7).value > 0 ? row.getCell(7).value : '',
                bonus: row.getCell(8).value > 0 ? row.getCell(8).value : '',
            };

            // Add to totals
            totals.salary += parseFloat(row.getCell(2).value) || 0;
            totals.regHours += parseFloat(row.getCell(3).value) || 0;
            totals.otHours += parseFloat(row.getCell(4).value) || 0;
            totals.vacaHours += parseFloat(row.getCell(5).value) || 0;
            totals.misc += parseFloat(row.getCell(6).value) || 0;
            totals.rmbExp += parseFloat(row.getCell(7).value) || 0;
            totals.bonus += parseFloat(row.getCell(8).value) || 0;


            payrollData.push(userPayroll);
        });

        // Add totals at the end
        payrollData.push({
            name: 'Totals',
            row: 24,
            salary: totals.salary > 0 ? totals.salary : '',
            regHours: totals.regHours > 0 ? totals.regHours : '',
            otHours: totals.otHours > 0 ? totals.otHours : '',
            vacaHours: totals.vacaHours > 0 ? totals.vacaHours : '',
            misc: totals.misc > 0 ? totals.misc : '',
            rmbExp: totals.rmbExp > 0 ? totals.rmbExp : '',
            bonus: totals.bonus > 0 ? totals.bonus : ''
        });

        res.status(200).json(payrollData);
    }
    catch(error){
        console.error('Error fetching payroll data: ', error);
        res.status(500).send({message: 'Error fetching payroll data'});
    }
});

router.put('/update-payroll', verifyToken, checkAdmin, async (req, res) => {
    const { payrollData } = req.body;
    const currentPath = path.join(payrollFileDir, 'Current-Payroll.xlsx');
    const workbook = new ExcelJS.Workbook();

    try {
        // Load the payroll file
        await workbook.xlsx.readFile(currentPath);
        const worksheet = workbook.getWorksheet(1);

        payrollData.forEach((rowData) => {
            // Log each row data for debugging
            //console.log('Processing rowData:', rowData);
            //console.error('Row Num', rowData.row);

            // Ensure row and data fields are defined
            if (rowData.row && rowData.salary !== undefined && rowData.regHours !== undefined) {
                const row = worksheet.getRow(rowData.row); // Use the specific row from payrollData

                // Update the cell values in the Excel sheet
                row.getCell(2).value = rowData.salary > 0 ? rowData.salary : '';
                row.getCell(3).value = rowData.regHours > 0 ? rowData.regHours : '';
                row.getCell(4).value = rowData.otHours > 0 ? rowData.otHours : '';
                row.getCell(5).value = rowData.vacaHours > 0 ? rowData.vacaHours : '';
                row.getCell(6).value = rowData.misc > 0 ? rowData.misc : '';
                row.getCell(7).value = rowData.rmbExp > 0 ? rowData.rmbExp : '';
                row.getCell(8).value = rowData.bonus > 0 ? rowData.bonus : '';

                row.commit();  // Commit the row to save changes
            } else {
                //console.error('Row Num', rowData.row);
                console.error('Invalid row data:', rowData);
            }
        });

        // Save the updated Excel file
        await workbook.xlsx.writeFile(currentPath);

        console.log('Payroll updated successfully.');
        res.status(200).send({ message: 'Payroll updated successfully.' });
    } catch (error) {
        console.error('Error updating payroll:', error);
        res.status(500).send({ message: 'Error updating payroll.' });
    }
});


  
router.post('/finalize-payroll', verifyToken, checkAdmin, async (req, res) => {
    console.log("Got to finalize route");
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

router.get('/current-payroll', verifyToken, checkAdmin, async (req, res) => {
    try {
        const payroll = await PHistory.find({isFinal: false}).sort({ periodEndDate: -1 });
        res.status(200).json(payroll);
    } catch (error) {
        console.error('Error fetching current payroll:', error);
        res.status(500).send({ message: 'Error retrieving current payroll.' });
    }
});

//need to add new confirmation for the timecard device to check if its been finalized

router.get('/payroll-history', verifyToken, checkAdmin, async (req, res) => {
    try {
        const payrollRecords = await PHistory.find({isFinal: true}).sort({ periodEndDate: -1 }).exec();
        res.status(200).json(payrollRecords);
    } catch (error) {
        res.status(500).send({ message: 'Error retrieving payroll history.' });
    }
});

router.post('/add-hours', verifyToken, checkAdmin, async(req, res) => {
    const {employeeId, hours, message, date} = req.body;
    console.log('Received add-hours request:', {employeeId, hours, message, date});
    const user = await User.findById(employeeId);
    const parsedTime = Number(hours);
    if(user){
        if(!isNaN(parsedTime)){
            user.totalHours += parsedTime;
            await user.save();
        }
        else{
            console.error('Invalid hours:', parsedTime);
            throw new Error('Hours value is not a valid number');
        }
        //Adding the new hours to the user if they exist
        await user.save();

        //Adding the entry to the recent updates with the custom message
        const timeadd = new TimeAdd({
            userId: user._id,
            hoursAdded: hours,
            date: date,
            message: message,
            status: 'Completed',
        });
        await timeadd.save();
        res.send(timeadd);
        console.log(`User ${user.name} has ${hours} hours added to total.`);
    }
    else{
        res.status(404).send('User not found');
    }
});

module.exports = router;