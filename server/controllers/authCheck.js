/* 
    AUTHORIZATION CHECK
    This function checks the user_id received from the verifyToken middleware,
    and compares it with the request parameter: user_id
    If not equal -> the user is asking info about another user -> not allowed!
*/ 

function authCheck(req, res, next){

    //Small console printout to check both parameters to see if we still get the right types and values
    //console.log({auth: req.user_id, param: +req.params.user_id});

    if(req.user_id !== +req.params.user_id){
        return res.send({success: 0, status: 401, message:'Unauthorized: not allowed to get, update or delete info of other users!'});
    }

    next();

}

module.exports = authCheck;