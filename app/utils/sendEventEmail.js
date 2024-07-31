const { LEGAL_TCP_SOCKET_OPTIONS } = require("mongodb");
const { sendEmail } = require("../utils/sendEmail");

const sendEventEmail = async (toEmail, name, event) => {
    try {

        var body = await getEmailTemplate(event, name);

        var subject = "";

        if (event == "eventDragon") // For event Dragon
        {
            subject = "Thank You for Registering for Dragons Of Pakistan!";
        }
        else  // For event AdVision
        {
            subject = "Thank You for Registering for AdVision 2024!";
        }

        var resp = await sendEmail(toEmail, subject, body);

        return resp;
        
    } catch (error) {
        console.log(error)
        return error;
    }
}



const getEmailTemplate = async (event, customerName) => {
    try {
        if (event == "eventDragon") // For event Dragon
        {
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
                                            width="200" alt="" style="display: block; border: 0; float: left;">
                                            
                                        <img src="https://adstreet.mangotech-api.com/uploads/image-1722426674263.png"
                                            width="150" alt="" style="display: block; border: 0; float: right;">

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
                                            style="font-family:'Segoe UI',Roboto,'Helvetica Neue',Arial,'Noto Sans',sans-serif,'Apple Color Emoji','Segoe UI Emoji','Segoe UI Symbol','Noto Color Emoji'; font-size:16px; font-weight: bold; margin: 0; margin-bottom: 20px; color:#000000;">
                                            Dear ${customerName}</p>
                                        <p
                                            style="font-family:'Segoe UI',Roboto,'Helvetica Neue',Arial,'Noto Sans',sans-serif,'Apple Color Emoji','Segoe UI Emoji','Segoe UI Symbol','Noto Color Emoji'; font-size:16px; margin: 0; margin-bottom: 20px; color:#000000;">
                                            We are thrilled to extend our heartfelt gratitude to you for registering for
                                            our upcoming award show Dragons of Pakistan on Friday 30th August 2024 at
                                            Pearl Continental Hotel Karachi. The event is staged by AdStreet the
                                            official Advertising and marketing partners for Dragons of Pakistan.

                                        <p
                                            style="font-family:'Segoe UI',Roboto,'Helvetica Neue',Arial,'Noto Sans',sans-serif,'Apple Color Emoji','Segoe UI Emoji','Segoe UI Symbol','Noto Color Emoji'; font-size:16px; margin: 0; margin-bottom: 20px; color:#000000;">
                                            Your participation is a testament to the vibrant community we have , and we
                                            are honored to have you as part of this special event.
                                            <br /><br />Adstreet is the Marketing and Event partner of Dragons of
                                            Pakistan and Our team has been working diligently to ensure that this award
                                            show will be an unforgettable experience. We have a fantastic lineup of
                                            Awards for Winners in various categories, performances . Exceptional
                                            Industry Talents and a few surprises in store for you.
                                            <br /><br /> Your presence will undoubtedly add to the excitement and
                                            prestige of the evening.
                                            <br /><br /> We are delighted to host you and look forward to celebrating
                                            the achievements and milestones within our community together at pearl
                                            continental Karachi starting from 6:30 pm- 10pm, Should you have any
                                            questions or need further assistance, please do not hesitate to reach out to
                                            us at [<a style="text-decoration: none; color: #000000;"
                                                href="mailto:info@adstreet.com.pk">info@adstreet.com.pk</a>].
                                            <br /><br /> Thank you once again for your support and enthusiasm. We can't
                                            wait to see you at the Dragons of Pakistan!
                                            <br /><br /> Ps: You’ll get the invoices shortly

                                            <br /><br />Warm regards,

                                            <br /><br />Syed Saad Hashmi<br />CEO <br />Adstreet

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
        }
        else  // For event AdVision
        {
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
                                            style="font-family:'Segoe UI',Roboto,'Helvetica Neue',Arial,'Noto Sans',sans-serif,'Apple Color Emoji','Segoe UI Emoji','Segoe UI Symbol','Noto Color Emoji'; font-size:16px; font-weight: bold; margin: 0; margin-bottom: 20px; color:#000000;">
                                            Dear ${customerName}</p>
                                        <p
                                            style="font-family:'Segoe UI',Roboto,'Helvetica Neue',Arial,'Noto Sans',sans-serif,'Apple Color Emoji','Segoe UI Emoji','Segoe UI Symbol','Noto Color Emoji'; font-size:16px; margin: 0; margin-bottom: 20px; color:#000000;">
                                            We are delighted to extend our gratitude to you for booking your place at AdVision 2024 to discuss the future of Marketing By Adstreet.
                                            <br/>Your participation signifies a commitment to staying ahead in the dynamic world of marketing, and we are excited to have you join us for this landmark event. 

                                        <p
                                            style="font-family:'Segoe UI',Roboto,'Helvetica Neue',Arial,'Noto Sans',sans-serif,'Apple Color Emoji','Segoe UI Emoji','Segoe UI Symbol','Noto Color Emoji'; font-size:16px; margin: 0; margin-bottom: 20px; color:#000000;">
                                            AdVision 2024 promises to be an extraordinary conference where local and global industry leaders, innovators, and visionaries will come together to share their insights and expertise. 
                                            <br /><br />You'll have the opportunity to discover the latest trends, tools, and techniques that are shaping the future of marketing.
                                            <br /><br /> Your presence will undoubtedly add to the excitement and
                                            prestige of the evening.
                                            <br /><br />Our team has meticulously planned an agenda that includes thought-provoking keynote sessions, and panel talks, and ample networking opportunities. 
                                            <br /><br />We are confident that your experience will be both inspiring and enriching.
                                            <br /><br />We are thrilled to host you and look forward to seeing you on July 29th at Pearl Continental Grand Ballroom  starting from 10 am - 2.30 


                                            <br /><br /> Should you have any questions or require further assistance, please do not hesitate to reach out to us at [<a style="text-decoration: none; color: #000000;" href="mailto:info@adstreet.com.pk">info@adstreet.com.pk</a>].
                                            <br /><br /> Thank you once again for your enthusiasm and support. We can't wait to welcome you to AdVision 2024!
                                            <br /><br /> Ps: You’ll get the invoices shortly 
                                            <br /><br />Best regards,

                                            <br /><br />Syed Saad Hashmi<br />CEO <br />Adstreet

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
        }
    } catch (error) {
        console.log(error)
        return error;
    }
}

module.exports = { sendEventEmail }