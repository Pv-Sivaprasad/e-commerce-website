
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
        console.log('userData',userData)
        
        if(userData.is_blocked){
            req.session.user_id=null
            res.redirect('/')
        }
        
         else {
            next()
           
        }

    } catch (error) {
            console.log('error in isblocked ',error)
    }
}


module.exports = {
    isLogin,
    isLogout,
    isBlocked

}