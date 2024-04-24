
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import bcrypt from "bcryptjs"
import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";


export async function POST(request : Request){


    await dbConnect()

    try{

        const {username, email, password } = await request.json()

        const existuserverifiedusername= await UserModel.findOne({
            username,
            isVerified : true
        })
        if(existuserverifiedusername){
            return Response.json({
                success : true,
                message: "username is alredy taken"
            },
            {status :400}
        
        )
        }

        const existeduserbyemail = await UserModel.findOne({
            email,
        })
        const verifyCode = Math.floor(10000 + Math.random()*900000).toString()
       if(existeduserbyemail){

        if(existeduserbyemail.isVerified){
            return Response.json({
                success :  false,
                message : "user alredy exist with this email"
            },{status:400})
        }
        else{

            const hashedPassword = await bcrypt.hash(password , 10)
            existeduserbyemail.password = hashedPassword
            existeduserbyemail.verifyCode = verifyCode
            existeduserbyemail.verifyCodeExpiry = new Date(Date.now()+3600000)
             await existeduserbyemail.save()
        }


       }
       else{
        const hashedPassword = await bcrypt.hash(password , 10)
        const expiryDate = new Date()
        expiryDate.setHours(expiryDate.getHours()+1)
       

      const newUser = new UserModel({
        username,
        email,
        password: hashedPassword,
        verifyCode,
        verifyCodeExpiry : expiryDate,
        isVerified: false,
        isAcceptingMessage : true,
        messages : []
       })

       await newUser.save()

    }

    const emailResponse = await sendVerificationEmail(
        email,username,verifyCode
    )
    if(!emailResponse.success){
        return Response.json({
            success :  false,
            message : emailResponse.message
        },{status:500})
    }
    return Response.json({
        success :  true,
        message : "user registred succesfully please verify your email"
    },{status:201})
    
    
    }catch(error){

        console.error("Error registring user ", error)

        return Response.json({
            success : false,
            message : "Error registering user"
        },
        {
            status : 500
        }
    
    )
    }
}
