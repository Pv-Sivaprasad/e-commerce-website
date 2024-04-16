
const refferal=async(req,res)=>{
    try {
        const refferalId=req.query.refferalId.trim()
        console.log('refferalId',refferalId)

        req.session.refferalId=refferalId

         res.redirect('/newUser')
    } catch (error) {
        console.log('error in creating refferal code', error)
    }
}

module.exports={
    refferal
}