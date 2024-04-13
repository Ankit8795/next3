import { resend } from "@/lib/resend";

import VerificationEmail from "../../emails/VerificationEmail";

import { ApiResponse } from "@/types/ApiResponse";

export async function sendVerificationEmail(
    email: string,
    username: string,
    verificationCode: string
): Promise<ApiResponse>{


    try{

        await resend.emails.send({
            from: 'onboarding@resend.dev',
            to: email,
            subject: 'Verification code mistry message',

            react: VerificationEmail({username, otp: verificationCode}),
          });


        return{
            success : true ,
            message : "verification email send succesfully"
        }

    }catch(emailerror){
        console.error("Error sending verification email" , emailerror)

        return {success : false, message: 'failed to send verification email'}
    }
}