const Orders = require('../model/orderModel')
const User = require('../model/orderModel')
const excel = require('exceljs');
const PDFDocument = require('pdfkit');
const moment = require('moment')

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
                    totalAmount: { $sum: "$orderAmount" }
                }
            }
        ]);

        console.log('dailyReport', dailyReport);

        res.render('reports', { report: dailyReport })

    } catch (error) {
        console.log('error loading daily sales report', error);
    }
}



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
                    totalAmount: { $sum: "$orderAmount" }
                }
            }
        ]);

        console.log('weeklyReport', weeklyReport);

        res.render('reports', { report: weeklyReport })
    } catch (error) {
        console.error('Error generating weekly report:', error);
        throw error;
    }
};const generateMonthlyReport = async (req, res) => {
    try {
        const monthlyReport = await Orders.aggregate([
            {
                $group: {
                    _id: { $month: "$createdAt" }, 
                    totalOrders: { $sum: 1 }, 
                    totalAmount: { $sum: "$orderAmount" } 
                }
            }
        ]);

     
        const formattedReport = monthlyReport.map(report => ({
            _id: moment().month(report._id - 1).format('MMMM'), 
            totalOrders: report.totalOrders,
            totalAmount: report.totalAmount
        }));

        console.log('monthlyReport', formattedReport);
        res.render('reports', { report: formattedReport });
    } catch (error) {
        console.error('Error generating monthly report:', error);
        throw error;
    }
};


const generateYearlyReport = async (req, res) => {
    try {
        const yearlyReport = await Orders.aggregate([
            {
                $group: {
                    _id: { $year: "$createdAt" }, // Grouping by year
                    totalOrders: { $sum: 1 },
                    totalAmount: { $sum: "$orderAmount" } 
                }
            }
        ]);

        console.log('yearlyReport', yearlyReport);

        res.render('reports', { report: yearlyReport });
    } catch (error) {
        console.error('Error generating yearly report:', error);
        throw error;
    }
};

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
            totalAmount: totalAmount.toFixed(2), // Convert totalAmount to fixed decimal format
            totalOrders: totalOrders
        });
    } catch (error) {
        console.error('Error generating custom date report:', error);
        res.status(500).send('Error generating custom date report');
    }
};



const downloadAsExcel = (req, res) => {
    try {
        const { startDate, endDate, totalOrders, totalAmount } = req.query;

        // Create Excel workbook and worksheet
        const workbook = new excel.Workbook();
        const worksheet = workbook.addWorksheet('Report');

        // Populate worksheet with data
        worksheet.addRow(['Start Date', 'End Date', 'Total Orders', 'Total Amount']);
        worksheet.addRow([startDate, endDate, totalOrders, totalAmount]);

        // Set response headers for Excel file
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




module.exports = {
    loadSalesReport,
    dailySalesReport,
    generateWeeklyReport,
    generateMonthlyReport,
    generateYearlyReport,
    generateCustomDateReport,
    downloadAsExcel,
     downloadAsPDF

}

