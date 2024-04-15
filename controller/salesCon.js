const Orders = require('../model/orderModel')
const User = require('../model/orderModel')
const Product = require('../model/productModel')
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

        res.render('reports', { report: dailyReport, totalOrders, totalAmount, totalCouponAmount });

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

        res.render('reports', { report: weeklyReport, totalOrders, totalAmount, totalCouponAmount });
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
                    totalAmount: { $sum: "$orderAmount" },
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
        res.render('reports', { report: formattedReport, totalOrders, totalAmount, totalCouponAmount });
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
                    totalAmount: { $sum: "$orderAmount" },
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

//to load the graph
const graphData = async (req, res) => {
    try {

        let salesData =
        {
            'labels': [],
            'salesData': [],
            'revenueData': [],
            'productsData': []
        }

        const { filter, time } = req.body

        if (filter === 'monthly') {
            salesData.labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            const contraints = {
                $gte: new Date(`${time}-01-01T00:00:00.000Z`),
                $lte: new Date(`${time}-12-31T00:00:00.000Z`)
            }
            const sales = await Orders.aggregate([
                {
                    $match: {
                        createdAt: contraints
                    }
                },
                {
                    $group: {
                        _id: {
                            $month: '$createdAt'
                        },
                        revenueData: {
                            $sum: "$orderAmount"
                        },
                        salesData: {
                            $sum: 1
                        }
                    }
                },
                {
                    $sort: {
                        '_id': 1
                    }
                }
            ])
          
            const products = await Product.aggregate([
                {
                    $match: {
                        createdAt: contraints
                    }
                },
                {
                    $group: {
                        _id: {
                            $month: "$createdAt"
                        },
                        productsData: {
                            $sum: 1
                        }
                    }
                },
                {
                    $sort: {
                        "_id": 1 // Sort by month in ascending order
                    }
                }
            ])
      
            salesData.salesData = sales.map((item) => item.salesData)
            salesData.revenueData = sales.map((item) => item.revenueData / 1000);
            salesData.productsData = products.map((item) => item.productsData);
        } else {
          
            salesData.labels = [`${time - 10}`, `${time - 9}`, `${time - 8}`, `${time - 7}`, `${time - 6}`, `${time - 5}`, `${time - 4}`, `${time - 3}`, `${time - 2}`, `${time - 1}`, `${time}`];
            const contraints = {
                $gte: new Date(`${time - 10}-01-01T00:00:00.000Z`),
                $lte: new Date(`${time}-12-31T00:00:00.000Z`)
            }

            const sales = await Orders.aggregate([
                {
                    $match: {
                        createdAt: contraints
                    }
                },
                {
                    $group: {
                        _id: {
                            $year: "$createdAt"
                        },
                        revenueData: {
                            $sum: "$orderAmount"
                        },
                        salesData: {
                            $sum: 1
                        }
                    }
                },
                {
                    $sort: {
                        "_id": 1
                    }
                }
            ])
        
            const products = await Product.aggregate([
                {
                    $match: {
                        createdAt: contraints
                    }
                },
                {
                    $group: {
                        _id: {
                            $year: "$createdAt"
                        },
                        productsData: {
                            $sum: 1
                        }
                    }
                },
                {
                    $sort: {
                        "_id": 1
                    }
                }
            ])

          
            for (let key of sales) {
                
                for (let data of salesData.labels) {
                    
                    if (key._id == data) {
                        salesData.salesData.push(key.salesData)
                        salesData.revenueData.push(key.revenueData / 1000)
                    } else {
                        salesData.salesData.push(0)
                        salesData.revenueData.push(0)
                    }
                }
            }

            for (let key of products) {
              
                for(let data of  salesData.labels){
                  

                    if(key._id==data){
                        salesData.productsData.push(key.productsData) 
                    }else{
                        salesData.productsData.push(0)
                    }
                }

            }

        }
        res
        .status(200)
        .json(salesData)


    } catch (error) {
        console.log('error', error)
    }
}
module.exports = {
    loadSalesReport,
    dailySalesReport,
    generateWeeklyReport,
    generateMonthlyReport,
    generateYearlyReport,
    generateCustomDateReport,
    graphData



}

