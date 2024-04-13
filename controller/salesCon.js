const Orders = require('../model/orderModel')
const User = require('../model/orderModel')
const excel = require('exceljs');
const PDFDocument = require('pdfkit');
const moment = require('moment')
// const excelJS=require('exceljs')

// to load the sales report page 
const loadSalesReport = async (req, res) => {
    try {
        const orders = await Orders.find({})
            .populate('userId')
            .populate('deliveryAddress')
            .populate({ path: 'orderedItem.productId', model: 'Product' }) // Populate nested field
            .sort({ _id: -1 });
        console.log('orders', orders);

        const formattedOrders = orders.map(order => {
            const date = new Date(order.createdAt)
            const formattedDate = date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0');
            return {
                ...order.toObject(),
                formattedCreatedAt: formattedDate,
            }
        })
        res.render('salesReport', { orderDetails: formattedOrders })
    } catch (error) {
        console.log('error loading sales report page', error);
    }
}

// to load the daily report
const dailySalesReport = async (req, res) => {
    try {
        const startDate = moment().startOf('day');
        const endDate = moment().endOf('day');

        const dailyReport = await Orders.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate.toDate(), $lte: endDate.toDate() }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    totalOrders: { $sum: 1 },
                    totalAmount: { $sum: "$orderAmount" },
                    totalCouponAmount: { $sum: "$coupon" }
                }
            }
        ]);

  
        const totalOrders = dailyReport.reduce((acc, curr) => acc + curr.totalOrders, 0);
        const totalAmount = dailyReport.reduce((acc, curr) => acc + curr.totalAmount, 0);
        const totalCouponAmount = dailyReport.reduce((acc, curr) => acc + curr.totalCouponAmount, 0);

        console.log('dailyReport', dailyReport);

        res.render('reports', { report: dailyReport, totalOrders, totalAmount ,totalCouponAmount });

    } catch (error) {
        console.log('error loading daily sales report', error);
        throw error; 
    }
}

//to load the weekly report  
const generateWeeklyReport = async (req, res) => {
    try {
        const startDate = moment().startOf('week');
        const endDate = moment().endOf('week');

        const weeklyReport = await Orders.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate.toDate(), $lte: endDate.toDate() }
                }
            },
            {
                $group: {
                    _id: { $week: "$createdAt" },
                    totalOrders: { $sum: 1 },
                    totalAmount: { $sum: "$orderAmount" },
                    totalCouponAmount: { $sum: "$coupon" }
                }
            }
        ]);

        // Calculate total orders and total amount and applied coupons  for the entire week
        const totalOrders = weeklyReport.reduce((acc, curr) => acc + curr.totalOrders, 0);
        const totalAmount = weeklyReport.reduce((acc, curr) => acc + curr.totalAmount, 0);
        const totalCouponAmount = weeklyReport.reduce((acc, curr) => acc + curr.totalCouponAmount, 0);

        console.log('weeklyReport', weeklyReport);

        res.render('reports', { report: weeklyReport, totalOrders, totalAmount ,totalCouponAmount});
    } catch (error) {
        console.error('Error generating weekly report:', error);
        throw error;
    }
};

// to load the monthly report
const generateMonthlyReport = async (req, res) => {
    try {
        const monthlyReport = await Orders.aggregate([
            {
                $group: {
                    _id: { $month: "$createdAt" }, 
                    totalOrders: { $sum: 1 }, 
                    totalAmount: { $sum: "$orderAmount" } ,
                    totalCouponAmount: { $sum: "$coupon" }
                }
            }
        ]);

        const formattedReport = monthlyReport.map(report => ({
            _id: moment().month(report._id - 1).format('MMMM'), 
            totalOrders: report.totalOrders,
            totalAmount: report.totalAmount
        }));

        console.log('monthlyReport', formattedReport);

        // Calculate total orders and total amount
        const totalOrders = formattedReport.reduce((acc, curr) => acc + curr.totalOrders, 0);
        const totalAmount = formattedReport.reduce((acc, curr) => acc + curr.totalAmount, 0);
        const totalCouponAmount = monthlyReport.reduce((acc, curr) => acc + curr.totalCouponAmount, 0);

        // Pass report data and totals to the EJS template
        res.render('reports', { report: formattedReport, totalOrders, totalAmount ,totalCouponAmount });
    } catch (error) {
        console.error('Error generating monthly report:', error);
        throw error;
    }
};

// for yearly repory
const generateYearlyReport = async (req, res) => {
    try {
        const yearlyReport = await Orders.aggregate([
            {
                $group: {
                    _id: { $year: "$createdAt" }, 
                    totalOrders: { $sum: 1 },
                    totalAmount: { $sum: "$orderAmount" } ,
                    totalCouponAmount: { $sum: "$coupon" }
                }
            }
        ]);

        
        const totalOrders = yearlyReport.reduce((acc, curr) => acc + curr.totalOrders, 0);
        const totalAmount = yearlyReport.reduce((acc, curr) => acc + curr.totalAmount, 0);
        const totalCouponAmount = yearlyReport.reduce((acc, curr) => acc + curr.totalCouponAmount, 0);

        console.log('yearlyReport', yearlyReport);

        res.render('reports', { report: yearlyReport, totalOrders, totalAmount, totalCouponAmount });
    } catch (error) {
        console.error('Error generating yearly report:', error);
        throw error;
    }
};

// for custom report
const generateCustomDateReport = async (req, res) => {
    try {
        const startDate = moment(req.query.startDate).startOf('day'); 
        const endDate = moment(req.query.endDate).endOf('day'); 

        if (!startDate.isValid() || !endDate.isValid() || startDate.isAfter(endDate)) {
            return res.status(400).send('Invalid date range');
        }

        const customDateReport = await Orders.find({
            createdAt: { $gte: startDate.toDate(), $lte: endDate.toDate() }
        });

        let totalAmount = 0;
        let totalOrders = customDateReport.length;

        if (totalOrders > 0) {
            customDateReport.forEach(order => {
                if (order.orderAmount && !isNaN(order.orderAmount)) {
                    totalAmount += parseFloat(order.orderAmount);
                } else {
                    console.warn('Invalid or missing orderAmount in order:', order);
                }
            });
        } else {
            console.warn('No orders found within the specified date range.');
        }

        console.log('Total Amount:', totalAmount);
        console.log('Total Orders:', totalOrders);

        res.render('customReport', { 
            report: customDateReport, 
            startDate: startDate.format('YYYY-MM-DD'), 
            endDate: endDate.format('YYYY-MM-DD'),
            totalAmount: totalAmount.toFixed(2), 
            totalOrders: totalOrders
        });
    } catch (error) {
        console.error('Error generating custom date report:', error);
        res.status(500).send('Error generating custom date report');
    }
};


const downloadAsExcel = (req, res) => {
    try {
     
   

        const workbook = new excel.Workbook();
        const worksheet = workbook.addWorksheet('Report');

       
        worksheet.addRow(['Start Date', 'End Date', 'Total Orders', 'Total Amount']);
        worksheet.addRow([startDate, endDate, totalOrders, totalAmount]);

    
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=report.xlsx');

        // Send Excel file as response
        return workbook.xlsx.write(res)
            .then(() => {
                res.status(200).end();
            });
    } catch (error) {
        console.error('Error generating Excel report:', error);
        res.status(500).send('Error generating Excel report');
    }
};

const downloadAsPDF = (req, res) => {
    try {  
       
        const { startDate, endDate, totalOrders, totalAmount } = req.query;
        console.log(startDate, endDate, totalOrders, totalAmount );
        // Create PDF document
        const doc = new PDFDocument();

        // Set response headers for PDF file
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=report.pdf');

        // Pipe PDF document to response
        doc.pipe(res);

        // Add content to PDF document
        doc.text(`Start Date: ${startDate}`);
        doc.text(`End Date: ${endDate}`);
        doc.text(`Total Orders: ${totalOrders}`);
        doc.text(`Total Amount: ₹${totalAmount}`);

        // Finalize PDF document
        doc.end();
    } catch (error) {
        console.error('Error generating PDF report:', error);
        res.status(500).send('Error generating PDF report');
    }
};


const downloadReport = async (req, res) => {
    try {
        const { type, data } = req.body;

        console.log(type, data);

        if (type === 'pdf') {
            // Generate PDF
            const doc = new pdfkit();
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'attachment; filename="report.pdf"');
            doc.pipe(res);

            doc.fontSize(16).text('Sales Report', { align: 'center' }).moveDown();
            doc.fontSize(12).text('ID\tDate\tTotal Orders\tTotal Amount', { align: 'center' }).moveDown();

            data.forEach((row) => {
                doc.text(`${row.id}\t${row.date}\t${row.totalOrders}\t₹${row.totalAmount}`, { align: 'center' }).moveDown();
            });

            doc.end();
        } else if (type === 'excel') {
            // Generate Excel
            const workbook = new exceljs.Workbook();
            const worksheet = workbook.addWorksheet('Sales Report');
            worksheet.columns = [
                { header: 'ID', key: 'id' },
                { header: 'Date', key: 'date' },
                { header: 'Total Orders', key: 'totalOrders' },
                { header: 'Total Amount', key: 'totalAmount' }
            ];

            data.forEach((row) => {
                worksheet.addRow(row);
            });

            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', 'attachment; filename="report.xlsx"');
            await workbook.xlsx.write(res);
            res.end();
        }
    } catch (error) {
        console.log('error in downloading:', error);
        res.status(500).send('Error in downloading report');
    }
};


module.exports = {
    loadSalesReport,
    dailySalesReport,
    generateWeeklyReport,
    generateMonthlyReport,
    generateYearlyReport,
    generateCustomDateReport,
    downloadAsExcel,
     downloadAsPDF,downloadReport,

   

}

