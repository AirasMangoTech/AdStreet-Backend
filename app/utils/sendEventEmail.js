const { sendEventEmailWithCC } = require("../utils/sendEmail");

const sendEventEmail = async (toEmail, name, event, mailBody) => {
  try {
    const eventName =
      event.eventName.replace(/-/g, " ").charAt(0).toUpperCase() +
      event.eventName.replace(/-/g, " ").slice(1);

    event.eventName = eventName;
    let body = await getEmailTemplate(mailBody, event, name);

    let subject = "";

    // FOR ADMEET EVENT
    if (event.eventName.includes("meet")) {
      subject = "Thank You for Registering for to AdMeet";
    }
    // FOR DRAGONS OF PAKISTAN EVENT
    else if (event.eventName.includes("dragon")) {
      subject = "Thank You for Registering for Dragons Of Pakistan!";
    }
    // FOR ADVISION EVENT
    else if (event.eventName.includes("advision")) {
      subject = `Thank You for Registering for AdVision ${event.eventDetails.year}!`;
    } else {
      subject = `Thank You for Registering for ${eventName} ${event.eventDetails.year}`;
    }

    let resp = await sendEventEmailWithCC(toEmail, subject, body);

    return resp;
  } catch (error) {
    console.log(error);
    return error;
  }
};

const sendEmail = async (toEmails, subject, message) => {
  const body = getTemplate(message);
  try {
    const resp = await sendEventEmailWithCC(toEmails, subject, body);
    return resp;
  } catch (err) {
    console.log(err);
    return err;
  }
};

const getEmailBody = (mailBody, event, username) => {
  let body = mailBody
    .replace("[USER]", username)
    .replace("[EVENT]", event.eventName)
    .replace("[DAY]", event.eventDetails.dayName)
    .replace("[MONTH]", event.eventDetails.monthName)
    .replace("[DATE]", event.eventDetails.dateNumber)
    .replace(
      "[START TIME]",
      event.eventStartTime ||
        new Date(event.additional?.start_time)?.toLocaleTimeString()
    )
    .replace(
      "[END TIME]",
      event.eventEndTime ||
        new Date(event.additional?.end_time)?.toLocaleTimeString()
    )
    .replace("[VENUE]", event.venue);

  return body;
};

// EMAIL TEMPLATE FOR EVENTS
const getEmailTemplate = async (mailBody, event, customerName) => {
  try {
    const body = getEmailBody(mailBody, event, customerName);

    return `<table class="table-responsive" width="" border="1" cellspacing="0" cellpadding="0"
          style="border-collapse:collapse;max-width:600px;border-color:#00000047;box-shadow:20px 20px 10px grey !important;"
          align="center">
       <tr>
           <td>
               <table width="" border="0" cellspacing="0" cellpadding="0" style="background-color:#ffffff;" align="center">
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

<img src=${event.logo}
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
                                    ${body}   
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
                       <td>
                           <table width="100%" border="0" cellspacing="0" cellpadding="0"
                                  style="background-color:#ffffff; border:0;" align="center">
                               <tr>
                                   <td>
                                       <table width="100%" border="0" cellspacing="0" cellpadding="0">
                                           <tr bgcolor="#ec2028">
                                               <td align="center" height="70" style="width:120px;">
                                                   <p style="font-size:14px;margin:27px;margin-right:0;font-family:'Segoe UI',Roboto,'Helvetica Neue',Arial,'Noto Sans',sans-serif;color:#fff;">
                                                       © <script>document.write(new Date().getFullYear());</script> Adstreet. All rights reserved.
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
   </table>
   `;
  } catch (error) {
    console.log(error);
    return error;
  }
};

// EMAIL TEMPLATE FOR GENERALISED EMAILS
const getTemplate = (body) => {
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
                                        Dear User</p>
                                        ${body}                                        
                                        <br /><br />Warm regards,

                                        <br /><br />ADSTREET TEAM

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
};

module.exports = { sendEventEmail, sendEmail };
