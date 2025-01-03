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

// const getEmailTemplate = async (event, customerName) => {
//   try {
//     if (event.eventName.includes("meet")) {
//       // For AddMeet
//       return `<table class="table-responsive" width="" border="1" cellspacing="0" cellpadding="0"
//     style="border-collapse:collapse;max-width:600px;border-color: #00000047;box-shadow: 20px 20px 10px grey !important;"
//     align="center">
//     <tr>
//         <td>
//             <table width="" border="0" cellspacing="0" cellpadding="0" style="background-color:#ffffff;"
//                 align="center" bgcolor="#ffffff">
//                 <tr>
//                     <td height="30" style="height:30px;"></td>
//                 </tr>
//                 <tr>
//                     <td>
//                         <table width="100%" border="0" cellspacing="0" cellpadding="0">
//                             <tr>
//                                 <td width="30" style="width:30px;"></td>
//                                 <td>
//                                      <img src="https://adstreet.mangotech-api.com/uploads/image-1722004805906.png"
//                                         width="200" alt="" style="display: block; border: 0; float: left;">

//                                     <img src="https://adstreet.mangotech-api.com/uploads/image-1722426674263.png"
//                                         width="150" alt="" style="display: block; border: 0; float: right;">

//                                 </td>
//                                 <td width="30" style="width:30px;"></td>
//                             </tr>
//                             <tr>
//                                 <td colspan="3" height="20" style="height:20px;"></td>
//                             </tr>
//                             <tr>
//                                 <td width="30" style="width:30px;"></td>
//                                 <td>
//                                     <p
//                                         style="font-family:'Segoe UI',Roboto,'Helvetica Neue',Arial,'Noto Sans',sans-serif,'Apple Color Emoji','Segoe UI Emoji','Segoe UI Symbol','Noto Color Emoji'; font-size:16px; font-weight: bold; margin: 0; margin-bottom: 20px; color:#000000;">
//                                         Dear ${customerName}</p>
//                                     <p
//                                         style="font-family:'Segoe UI',Roboto,'Helvetica Neue',Arial,'Noto Sans',sans-serif,'Apple Color Emoji','Segoe UI Emoji','Segoe UI Symbol','Noto Color Emoji'; font-size:16px; margin: 0; margin-bottom: 20px; color:#000000;">
//                                         Thank you for registering to AdMeet Event on ${event.eventDetails.dayName}, ${event.eventDetails.monthName} ${event.eventDetails.dateNumber}, from ${event.eventStartTime} to ${event.eventEndTime} at ${event.venue}.

//                                     <p
//                                         style="font-family:'Segoe UI',Roboto,'Helvetica Neue',Arial,'Noto Sans',sans-serif,'Apple Color Emoji','Segoe UI Emoji','Segoe UI Symbol','Noto Color Emoji'; font-size:16px; margin: 0; margin-bottom: 20px; color:#000000;">
//                                         Show this email screenshot at event entry.
//                                         <br /><br />Looking forward to welcome you on the event.
//                                         <br /><br />Thank you once again for participating!
//                                         <br /><br />AdStreet (Pvt.) Ltd. would love your feedback. Post a review to our profile.
//                                         <br><a style="text-decoration: none; color: #000000;"
//                                             href="https://g.page/r/CYwLg8i3KYdlEBI/review">Here</a>.

//                                         <br /><br />Warm regards,

//                                         <br /><br />ADSTREET TEAM

//                                     </p>
//                                 </td>
//                                 <td width="30" style="width:30px;"></td>
//                             </tr>
//                         </table>
//                     </td>
//                 </tr>
//                 <tr>
//                     <td height="20" style="height:20px;"></td>
//                 </tr>
//                 <tr>
//                     <td></td>
//                 </tr>
//                 <tr>
//                     <td>
//                         <table width="100%" border="0" cellspacing="0" cellpadding="0"
//                             style="background-color:#ffffff; border:0;" align="center" bgcolor="#ffffff">
//                             <tr>
//                                 <td>
//                                     <table width="100%" border="0" cellspacing="0" cellpadding="0">
//                                         <tr bgcolor="#ec2028">
//                                             <td align="center" height="70" style="width: 120px;">
//                                                 <p
//                                                     style="font-size:14px; margin:27px; margin-right: 0; font-family:'Segoe UI',Roboto,'Helvetica Neue',Arial,'Noto Sans',sans-serif,'Apple Color Emoji','Segoe UI Emoji','Segoe UI Symbol','Noto Color Emoji'; font-size:14px; color:#fff;">
//                                                     ©
//                                                     <script>document.write(new Date().getFullYear());</script>
//                                                     Adstreet. All rights reserved.
//                                                 </p>
//                                             </td>
//                                         </tr>
//                                     </table>
//                                 </td>
//                             </tr>
//                         </table>
//                     </td>
//                 </tr>
//             </table>
//         </td>
//     </tr>
// </table>`;
//     } else if (event.eventName.includes("dragon")) {
//       // For event Dragon
//       return `<table class="table-responsive" width="" border="1" cellspacing="0" cellpadding="0"
//         style="border-collapse:collapse;max-width:600px;border-color: #00000047;box-shadow: 20px 20px 10px grey !important;"
//         align="center">
//         <tr>
//             <td>
//                 <table width="" border="0" cellspacing="0" cellpadding="0" style="background-color:#ffffff;"
//                     align="center" bgcolor="#ffffff">
//                     <tr>
//                         <td height="30" style="height:30px;"></td>
//                     </tr>
//                     <tr>
//                         <td>
//                             <table width="100%" border="0" cellspacing="0" cellpadding="0">
//                                 <tr>
//                                     <td width="30" style="width:30px;"></td>
//                                     <td>
//                                          <img src="https://adstreet.mangotech-api.com/uploads/image-1722004805906.png"
//                                             width="200" alt="" style="display: block; border: 0; float: left;">

//                                         <img src="https://adstreet.mangotech-api.com/uploads/image-1722426674263.png"
//                                             width="150" alt="" style="display: block; border: 0; float: right;">

//                                     </td>
//                                     <td width="30" style="width:30px;"></td>
//                                 </tr>
//                                 <tr>
//                                     <td colspan="3" height="20" style="height:20px;"></td>
//                                 </tr>
//                                 <tr>
//                                     <td width="30" style="width:30px;"></td>
//                                     <td>
//                                         <p
//                                             style="font-family:'Segoe UI',Roboto,'Helvetica Neue',Arial,'Noto Sans',sans-serif,'Apple Color Emoji','Segoe UI Emoji','Segoe UI Symbol','Noto Color Emoji'; font-size:16px; font-weight: bold; margin: 0; margin-bottom: 20px; color:#000000;">
//                                             Dear ${customerName}</p>
//                                         <p
//                                             style="font-family:'Segoe UI',Roboto,'Helvetica Neue',Arial,'Noto Sans',sans-serif,'Apple Color Emoji','Segoe UI Emoji','Segoe UI Symbol','Noto Color Emoji'; font-size:16px; margin: 0; margin-bottom: 20px; color:#000000;">
//                                             We are thrilled to extend our heartfelt gratitude to you for registering for
//                                             our upcoming award show Dragons of Pakistan on ${event.eventDetails.dayName} ${event.eventDetails.dateNumber} ${event.eventDetails.monthName} ${event.eventDetails.year} at
//                                             ${event.venue}. The event is staged by AdStreet the
//                                             official Advertising and marketing partners for Dragons of Pakistan.

//                                         <p
//                                             style="font-family:'Segoe UI',Roboto,'Helvetica Neue',Arial,'Noto Sans',sans-serif,'Apple Color Emoji','Segoe UI Emoji','Segoe UI Symbol','Noto Color Emoji'; font-size:16px; margin: 0; margin-bottom: 20px; color:#000000;">
//                                             Your participation is a testament to the vibrant community we have , and we
//                                             are honored to have you as part of this special event.
//                                             <br /><br />Adstreet is the Marketing and Event partner of Dragons of
//                                             Pakistan and Our team has been working diligently to ensure that this award
//                                             show will be an unforgettable experience. We have a fantastic lineup of
//                                             Awards for Winners in various categories, performances . Exceptional
//                                             Industry Talents and a few surprises in store for you.
//                                             <br /><br /> Your presence will undoubtedly add to the excitement and
//                                             prestige of the evening.
//                                             <br /><br /> We are delighted to host you and look forward to celebrating
//                                             the achievements and milestones within our community together at ${event.venue} starting from ${event.eventStartTime} - ${event.eventEndTime}, Should you have any
//                                             questions or need further assistance, please do not hesitate to reach out to
//                                             us at [<a style="text-decoration: none; color: #000000;"
//                                                 href="mailto:info@adstreet.com.pk">info@adstreet.com.pk</a>].
//                                             <br /><br /> Thank you once again for your support and enthusiasm. We can't
//                                             wait to see you at the Dragons of Pakistan!
//                                             <br /><br /> Ps: You’ll get the invoices shortly

//                                             <br /><br />Warm regards,

//                                             <br /><br />Syed Saad Hashmi<br />CEO <br />Adstreet

//                                         </p>
//                                     </td>
//                                     <td width="30" style="width:30px;"></td>
//                                 </tr>
//                             </table>
//                         </td>
//                     </tr>
//                     <tr>
//                         <td height="20" style="height:20px;"></td>
//                     </tr>
//                     <tr>
//                         <td></td>
//                     </tr>
//                     <tr>
//                         <td>
//                             <table width="100%" border="0" cellspacing="0" cellpadding="0"
//                                 style="background-color:#ffffff; border:0;" align="center" bgcolor="#ffffff">
//                                 <tr>
//                                     <td>
//                                         <table width="100%" border="0" cellspacing="0" cellpadding="0">
//                                             <tr bgcolor="#ec2028">
//                                                 <td align="center" height="70" style="width: 120px;">
//                                                     <p
//                                                         style="font-size:14px; margin:27px; margin-right: 0; font-family:'Segoe UI',Roboto,'Helvetica Neue',Arial,'Noto Sans',sans-serif,'Apple Color Emoji','Segoe UI Emoji','Segoe UI Symbol','Noto Color Emoji'; font-size:14px; color:#fff;">
//                                                         ©
//                                                         <script>document.write(new Date().getFullYear());</script>
//                                                         Adstreet. All rights reserved.
//                                                     </p>
//                                                 </td>
//                                             </tr>
//                                         </table>
//                                     </td>
//                                 </tr>
//                             </table>
//                         </td>
//                     </tr>
//                 </table>
//             </td>
//         </tr>
//     </table>`;
//     } else if (event.eventName.includes("advision")) {
//       // For event AdVision
//       return `<table class="table-responsive" width="" border="1" cellspacing="0" cellpadding="0"
//         style="border-collapse:collapse;max-width:600px;border-color: #00000047;box-shadow: 20px 20px 10px grey !important;"
//         align="center">
//         <tr>
//             <td>
//                 <table width="" border="0" cellspacing="0" cellpadding="0" style="background-color:#ffffff;"
//                     align="center" bgcolor="#ffffff">
//                     <tr>
//                         <td height="30" style="height:30px;"></td>
//                     </tr>
//                     <tr>
//                         <td>
//                             <table width="100%" border="0" cellspacing="0" cellpadding="0">
//                                 <tr>
//                                     <td width="30" style="width:30px;"></td>
//                                     <td>
//                                         <img src="https://adstreet.mangotech-api.com/uploads/image-1722004805906.png"
//                                             width="200" alt="" style="display: block; border: 0;">

//                                     </td>
//                                     <td width="30" style="width:30px;"></td>
//                                 </tr>
//                                 <tr>
//                                     <td colspan="3" height="20" style="height:20px;"></td>
//                                 </tr>
//                                 <tr>
//                                     <td width="30" style="width:30px;"></td>
//                                     <td>
//                                         <p
//                                             style="font-family:'Segoe UI',Roboto,'Helvetica Neue',Arial,'Noto Sans',sans-serif,'Apple Color Emoji','Segoe UI Emoji','Segoe UI Symbol','Noto Color Emoji'; font-size:16px; font-weight: bold; margin: 0; margin-bottom: 20px; color:#000000;">
//                                             Dear ${customerName}</p>
//                                         <p
//                                             style="font-family:'Segoe UI',Roboto,'Helvetica Neue',Arial,'Noto Sans',sans-serif,'Apple Color Emoji','Segoe UI Emoji','Segoe UI Symbol','Noto Color Emoji'; font-size:16px; margin: 0; margin-bottom: 20px; color:#000000;">
//                                             We are delighted to extend our gratitude to you for booking your place at AdVision ${event.eventDetails.year} to discuss the future of Marketing By Adstreet.
//                                             <br/>Your participation signifies a commitment to staying ahead in the dynamic world of marketing, and we are excited to have you join us for this landmark event.

//                                         <p
//                                             style="font-family:'Segoe UI',Roboto,'Helvetica Neue',Arial,'Noto Sans',sans-serif,'Apple Color Emoji','Segoe UI Emoji','Segoe UI Symbol','Noto Color Emoji'; font-size:16px; margin: 0; margin-bottom: 20px; color:#000000;">
//                                             AdVision ${event.eventDetails.year} promises to be an extraordinary conference where local and global industry leaders, innovators, and visionaries will come together to share their insights and expertise.
//                                             <br /><br />You'll have the opportunity to discover the latest trends, tools, and techniques that are shaping the future of marketing.
//                                             <br /><br /> Your presence will undoubtedly add to the excitement and
//                                             prestige of the evening.
//                                             <br /><br />Our team has meticulously planned an agenda that includes thought-provoking keynote sessions, and panel talks, and ample networking opportunities.
//                                             <br /><br />We are confident that your experience will be both inspiring and enriching.
//                                             <br /><br />We are thrilled to host you and look forward to seeing you on ${event.eventDetails.monthName} ${event.eventDetails.dateNumber} at ${event.venue} starting from ${event.eventStartTime} - ${event.eventEndTime}.

//                                             <br /><br /> Should you have any questions or require further assistance, please do not hesitate to reach out to us at [<a style="text-decoration: none; color: #000000;" href="mailto:info@adstreet.com.pk">info@adstreet.com.pk</a>].
//                                             <br /><br /> Thank you once again for your enthusiasm and support. We can't wait to welcome you to AdVision 2024!
//                                             <br /><br /> Ps: You’ll get the invoices shortly
//                                             <br /><br />Best regards,

//                                             <br /><br />Syed Saad Hashmi<br />CEO <br />Adstreet

//                                         </p>
//                                     </td>
//                                     <td width="30" style="width:30px;"></td>
//                                 </tr>
//                             </table>
//                         </td>
//                     </tr>
//                     <tr>
//                         <td height="20" style="height:20px;"></td>
//                     </tr>
//                     <tr>
//                         <td></td>
//                     </tr>
//                     <tr>
//                         <td>
//                             <table width="100%" border="0" cellspacing="0" cellpadding="0"
//                                 style="background-color:#ffffff; border:0;" align="center" bgcolor="#ffffff">
//                                 <tr>
//                                     <td>
//                                         <table width="100%" border="0" cellspacing="0" cellpadding="0">
//                                             <tr bgcolor="#ec2028">
//                                                 <td align="center" height="70" style="width: 120px;">
//                                                     <p
//                                                         style="font-size:14px; margin:27px; margin-right: 0; font-family:'Segoe UI',Roboto,'Helvetica Neue',Arial,'Noto Sans',sans-serif,'Apple Color Emoji','Segoe UI Emoji','Segoe UI Symbol','Noto Color Emoji'; font-size:14px; color:#fff;">
//                                                         ©
//                                                         <script>document.write(new Date().getFullYear());</script>
//                                                         Adstreet. All rights reserved.
//                                                     </p>
//                                                 </td>
//                                             </tr>
//                                         </table>
//                                     </td>
//                                 </tr>
//                             </table>
//                         </td>
//                     </tr>
//                 </table>
//             </td>
//         </tr>
//     </table>`;
//     } else {
//       const eventName =
//         event.eventName.replace(/-/g, " ").charAt(0).toUpperCase() +
//         event.eventName.replace(/-/g, " ").slice(1);

//       return `<table class="table-responsive" width="" border="1" cellspacing="0" cellpadding="0"
//         style="border-collapse:collapse;max-width:600px;border-color:#00000047;box-shadow:20px 20px 10px grey !important;"
//         align="center">
//      <tr>
//          <td>
//              <table width="" border="0" cellspacing="0" cellpadding="0" style="background-color:#ffffff;" align="center">
//                  <tr>
//                      <td height="30" style="height:30px;"></td>
//                  </tr>
//                  <tr>
//                      <td>
//                          <table width="100%" border="0" cellspacing="0" cellpadding="0">
//                              <tr>
//                                  <td width="30" style="width:30px;"></td>
//                                  <td>
//                                      <img src="https://adstreet.mangotech-api.com/uploads/image-1722004805906.png"
//                                           width="200" alt="Adstreet Logo" style="display:block;border:0;">
//                                  </td>
//                                  <td width="30" style="width:30px;"></td>
//                              </tr>
//                              <tr>
//                                  <td colspan="3" height="20" style="height:20px;"></td>
//                              </tr>
//                              <tr>
//                                  <td width="30" style="width:30px;"></td>
//                                  <td>
//                                      <p style="font-family:'Segoe UI',Roboto,'Helvetica Neue',Arial,'Noto Sans',sans-serif; font-size:16px; font-weight:bold; margin:0; margin-bottom:20px; color:#000000;">
//                                          Dear ${customerName},
//                                      </p>
//                                      <p style="font-family:'Segoe UI',Roboto,'Helvetica Neue',Arial,'Noto Sans',sans-serif; font-size:16px; margin:0; margin-bottom:20px; color:#000000;">
//                                          Thank you for reserving your spot at ${eventName} event. We are thrilled to have you join us as we explore new horizons and share valuable insights into the future of our industry.
//                                      </p>
//                                      <p style="font-family:'Segoe UI',Roboto,'Helvetica Neue',Arial,'Noto Sans',sans-serif; font-size:16px; margin:0; margin-bottom:20px; color:#000000;">
//                                          Our event promises to bring together industry leaders, innovators, and visionaries for an enriching experience filled with keynote sessions, panel discussions, and ample networking opportunities. Whether you're here to learn, connect, or share, we're confident it will be a memorable experience.
//                                      </p>
//                                      <p style="font-family:'Segoe UI',Roboto,'Helvetica Neue',Arial,'Noto Sans',sans-serif; font-size:16px; margin:0; margin-bottom:20px; color:#000000;">
//                                          The event details are as follows:
//                                          <br/><br/>
//                                          <strong>Date:</strong> ${event.eventDetails.monthName} ${event.eventDetails.dateNumber} <br/>
//                                          <strong>Time:</strong> ${event.eventStartTime} - ${event.eventEndTime} <br/>
//                                          <strong>Location:</strong> ${event.venue}
//                                      </p>
//                                      <p style="font-family:'Segoe UI',Roboto,'Helvetica Neue',Arial,'Noto Sans',sans-serif; font-size:16px; margin:0; margin-bottom:20px; color:#000000;">
//                                          Should you have any questions or need assistance, feel free to reach out at
//                                          <a style="text-decoration:none;color:#000000;" href="mailto:info@adstreet.com.pk">info@adstreet.com.pk</a>.
//                                      </p>
//                                      <p style="font-family:'Segoe UI',Roboto,'Helvetica Neue',Arial,'Noto Sans',sans-serif; font-size:16px; margin:0; margin-bottom:20px; color:#000000;">
//                                          We look forward to welcoming you and making this event a great success together.
//                                      </p>
//                                      <p style="font-family:'Segoe UI',Roboto,'Helvetica Neue',Arial,'Noto Sans',sans-serif; font-size:16px; margin:0; margin-bottom:20px; color:#000000;">
//                                          Best regards, <br/><br/>
//                                          Syed Saad Hashmi <br/>
//                                          CEO <br/>
//                                          Adstreet
//                                      </p>
//                                  </td>
//                                  <td width="30" style="width:30px;"></td>
//                              </tr>
//                          </table>
//                      </td>
//                  </tr>
//                  <tr>
//                      <td height="20" style="height:20px;"></td>
//                  </tr>
//                  <tr>
//                      <td>
//                          <table width="100%" border="0" cellspacing="0" cellpadding="0"
//                                 style="background-color:#ffffff; border:0;" align="center">
//                              <tr>
//                                  <td>
//                                      <table width="100%" border="0" cellspacing="0" cellpadding="0">
//                                          <tr bgcolor="#ec2028">
//                                              <td align="center" height="70" style="width:120px;">
//                                                  <p style="font-size:14px;margin:27px;margin-right:0;font-family:'Segoe UI',Roboto,'Helvetica Neue',Arial,'Noto Sans',sans-serif;color:#fff;">
//                                                      © <script>document.write(new Date().getFullYear());</script> Adstreet. All rights reserved.
//                                                  </p>
//                                              </td>
//                                          </tr>
//                                      </table>
//                                  </td>
//                              </tr>
//                          </table>
//                      </td>
//                  </tr>
//              </table>
//          </td>
//      </tr>
//  </table>
//  `;
//     }
//   } catch (error) {
//     console.log(error);
//     return error;
//   }
// };

// EVENT BODY FOR EVENT EMAIL TEMPLATE
const getEmailBody = (mailBody, event, username) => {
  let body = mailBody
    .replace("[USER]", username)
    .replace("[EVENT]", event.eventName)
    .replace("[DAY]", event.eventDetails.dayName)
    .replace("[MONTH]", event.eventDetails.monthName)
    .replace("[DATE]", event.eventDetails.dateNumber)
    .replace("[START TIME]", event.eventStartTime)
    .replace("[END TIME]", event.eventEndTime)
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
                                   <p style="font-family:'Segoe UI',Roboto,'Helvetica Neue',Arial,'Noto Sans',sans-serif; font-size:16px; margin:0; margin-bottom:20px; color:#000000;">
                                           Best regards, <br/><br/>
                                           Syed Saad Hashmi <br/>
                                           CEO <br/>
                                           Adstreet
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
