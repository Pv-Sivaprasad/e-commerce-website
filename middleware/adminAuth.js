const Admin=require('../model/adminModel')

const isLogin=async(req,res,next)=>{
      try {
        if(req.session.admin_id){
            next()
        }else{
            res.redirect('/')
        }
      } catch (error) {
        console.log(error);
      }
}

const isLogout=async(req,res,next)=>{
    try {
        if(req.session.admin_id){
            res.redirect('/')
        }else{
            next()
        }
    } catch (error) {
        console.log(error);
    }
}

module.exports={
    isLogin,
    isLogout
}