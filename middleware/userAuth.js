
const User = require('../model/userModel')

const isLogin = async (req, res, next) => {
    try {

        if (req.session.user_id) {     

            next()
        }

        else {

          res.redirect('/')
        }

    } catch (error) {
        console.log(error.message);
    }
}



const isLogout = async (req, res, next) => {
    try {

        if (req.session.user_id) {
            res.redirect('/')

        } else {
            next()
        }


    } catch (error) {
        console.log(error.message);
    }
}

const isBlocked = async (req, res, next) => {
    try {
        const userData = await User.findOne({ _id: req.session.user_id })
        if (userData) {
            next()
        } else {
            console.log('user id is blocked ', userData.is_blocked);

            if(userData.is_blocked){
                req.session.user_id=null
                res.redirect('/')
            }
        }

    } catch (error) {

    }
}


module.exports = {
    isLogin,
    isLogout,
    isBlocked

}