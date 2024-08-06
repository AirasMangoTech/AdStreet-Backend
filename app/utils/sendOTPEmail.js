const { sendOTPEmail } = require("../utils/sendEmail");

const sendEmail = async (toEmail, otp) => {
    try {

        var body = await getOTPEmailTemplate(...otp.split(''));

        var subject = "OTP by Adstreet";

        var resp = await sendOTPEmail(toEmail, subject, body);

        return resp;

    } catch (error) {
        console.log(error)
        return error;
    }
}

const getOTPEmailTemplate = async (otp1, otp2, otp3, otp4) => {
    try {
        
        return `<table class="table-responsive" width="" border="1" cellspacing="0" cellpadding="0"
        style="border-collapse:collapse;max-width:600px;border-color: #00000047;box-shadow: 20px 20px 10px grey !important;"
        align="center">
        <tr>
            <td>
                <table width="" border="0" cellspacing="0" cellpadding="0" style="background-color:#ffffff;"
                    align="center" bgcolor="#ffffff">
                    <tr>
                        <td height="30" style="height:30px;"></td>
                    </tr>
                    <tr>
                        <td>
                            <table width="100%" border="0" cellspacing="0" cellpadding="0">
                                <tr>
                                    <td width="30" style="width:30px;"></td>
                                    <td>
                                        <img src="https://adstreet.mangotech-api.com/uploads/image-1722004805906.png"
                                            width="200" alt="" style="display: block; border: 0;">
                                    </td>
                                    <td width="30" style="width:30px;"></td>
                                </tr>
                                <tr>
                                    <td colspan="3" height="20" style="height:20px;"></td>
                                </tr>
                                <tr>
                                    <td width="30" style="width:30px;"></td>
                                    <td>
                                        <p
                                            style="font-family:'Segoe UI',Roboto,'Helvetica Neue',Arial,'Noto Sans',sans-serif,'Apple Color Emoji','Segoe UI Emoji','Segoe UI Symbol','Noto Color Emoji'; font-size:24px; font-weight: bold; margin: 0; margin-bottom: 20px; color:#000000;">
                                            Your 4 Digit OTP Code</p>
                                        <p
                                            style="font-family:'Segoe UI',Roboto,'Helvetica Neue',Arial,'Noto Sans',sans-serif,'Apple Color Emoji','Segoe UI Emoji','Segoe UI Symbol','Noto Color Emoji'; font-size:16px; margin: 0; margin-bottom: 20px; color:#000000;">
                                            Hi, Here is your request 4 Digit OTP code
                                        <p style="margin: 0; margin-bottom: 20px;">
                                            <a href="javascript:void(0)"
                                                style="display:inline-block; border:1px solid #ec2028; border-radius: 0px; border-left-width: 15px;border-right-width: 15px; background:#ec2028; font-family:'Segoe UI',Roboto,'Helvetica Neue',Arial,'Noto Sans',sans-serif,'Apple Color Emoji','Segoe UI Emoji','Segoe UI Symbol','Noto Color Emoji'; font-size:18px; line-height:30px; font-weight: bold; color:#ffffff; text-decoration:none;">
                                                ${otp1}</a>

                                            <a href="javascript:void(0)"
                                                style="display:inline-block; border:1px solid #ec2028; border-radius: 0px; border-left-width: 15px;border-right-width: 15px; background:#ec2028; font-family:'Segoe UI',Roboto,'Helvetica Neue',Arial,'Noto Sans',sans-serif,'Apple Color Emoji','Segoe UI Emoji','Segoe UI Symbol','Noto Color Emoji'; font-size:18px; line-height:30px; font-weight: bold; color:#ffffff; text-decoration:none;">
                                                ${otp2}</a>

                                            <a href="javascript:void(0)"
                                                style="display:inline-block; border:1px solid #ec2028; border-radius: 0px; border-left-width: 15px;border-right-width: 15px; background:#ec2028; font-family:'Segoe UI',Roboto,'Helvetica Neue',Arial,'Noto Sans',sans-serif,'Apple Color Emoji','Segoe UI Emoji','Segoe UI Symbol','Noto Color Emoji'; font-size:18px; line-height:30px; font-weight: bold; color:#ffffff; text-decoration:none;">
                                                ${otp3}</a>

                                            <a href="javascript:void(0)"
                                                style="display:inline-block; border:1px solid #ec2028; border-radius: 0px; border-left-width: 15px;border-right-width: 15px; background:#ec2028; font-family:'Segoe UI',Roboto,'Helvetica Neue',Arial,'Noto Sans',sans-serif,'Apple Color Emoji','Segoe UI Emoji','Segoe UI Symbol','Noto Color Emoji'; font-size:18px; line-height:30px; font-weight: bold; color:#ffffff; text-decoration:none;">
                                                ${otp4}</a>

                                        </p>
                                        <p
                                            style="font-family:'Segoe UI',Roboto,'Helvetica Neue',Arial,'Noto Sans',sans-serif,'Apple Color Emoji','Segoe UI Emoji','Segoe UI Symbol','Noto Color Emoji'; font-size:16px; margin: 0; margin-bottom: 20px; color:#000000;">
                                            This code will be expired within 5 minutes of requesting time.
                                            <br /><br /> If you didn't requested the OTP, You can ignore this email.
                                            <br /><br />Thanks, <br />Adstreet Team
                                        </p>
                                    </td>
                                    <td width="30" style="width:30px;"></td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td height="20" style="height:20px;"></td>
                    </tr>
                    <tr>
                        <td></td>
                    </tr>
                    <tr>
                        <td>
                            <table width="100%" border="0" cellspacing="0" cellpadding="0"
                                style="background-color:#ffffff; border:0;" align="center" bgcolor="#ffffff">
                                <tr>
                                    <td>
                                        <table width="100%" border="0" cellspacing="0" cellpadding="0">
                                            <tr bgcolor="#ec2028">
                                                <td align="center" height="70" style="width: 120px;">
                                                    <p
                                                        style="font-size:14px; margin:27px; margin-right: 0; font-family:'Segoe UI',Roboto,'Helvetica Neue',Arial,'Noto Sans',sans-serif,'Apple Color Emoji','Segoe UI Emoji','Segoe UI Symbol','Noto Color Emoji'; font-size:14px; color:#fff;">
                                                        ©
                                                        <script>document.write(new Date().getFullYear());</script>
                                                        Adstreet. All rights reserved.
                                                    </p>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>`;

    } catch (error) {
        console.log(error)
        return error;
    }
}

module.exports = { sendEmail }