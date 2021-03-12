const sgMail = require('@sendgrid/mail');
const config = require('config');

class MailService {
    constructor() {
        sgMail.setApiKey(config.get('SENDGRID_API_KEY'));
    }

    emailTemplate(to, subject, body){
        let cheers = subject=='URGENT NOTIFICATION'? null:
        `<td align="center" class="footercopy">
            Cheers!
        </td>`

        const msg = {
            to: to,
            from: 'noreply@oceanbuilder.com',
            subject: subject,
            html: `
            <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
            <html xmlns="http://www.w3.org/1999/xhtml">
            
            <head>
            <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
            <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Varela">
            <title>Ocean Builders Email</title>
            <style type="text/css">
            body {margin: 0; padding: 0; min-width: 100%!important;}
            img {height: auto;}
            .content {width: 100%;}
            .header {padding: 40px 30px 20px 30px; background: linear-gradient(180deg, #043D8D 0%, #2C86AC 100%); height: 168px;}
            .header img { width: 165px; height: auto; margin: auto; display: block; }
            .innerpadding {padding: 30px 30px 30px 30px;}
            .borderbottom {border-bottom: 1px solid #f2eeed;}
            .subhead {font-size: 15px; color: #ffffff; font-family: "Varela", sans-serif; letter-spacing: 10px;}
            .h1, .h2, .bodycopy {font-family: "Varela", sans-serif;}
            .h1 {font-size: 33px; line-height: 38px; font-weight: bold;}
            .h2 {padding: 50px 0 20px 0; font-size: 30px; line-height: 28px; font-weight: normal; text-align: center; color: #707070}
            .bodycopy {font-size: 14px; line-height: 22px; font-weight: normal; text-align: center; color: #707070; padding: 40px 0;}
            td.button{margin: 20px;}
            .button {width: 305px; height: 33px; background: #2D68BF; border: 1px solid #2D68BF; border-radius: 28px; text-align: center; font-size: 13px; font-family: "Varela", sans-serif; font-weight: normal; padding: 0 30px 0 30px;}
            .button a {color: #fff; text-transform: uppercase; text-decoration: none!important}
            .footer {padding: 20px 30px 15px 30px;}
            .footercopy {font-family: "Varela", sans-serif; font-size: 14px; color: #707070; padding: 5px;}
            .footercopy a {color: #707070; text-decoration: underline;}

            @media only screen and (max-width: 550px), screen and (max-device-width: 550px) {
            body .hide {display: none!important;}
            body .buttonwrapper {background-color: transparent!important;}
            body .button {padding: 0px!important;}
            body .button a {background-color: #2D68BF;}
            body .unsubscribe {display: block; margin-top: 20px; padding: 10px 50px; background: #2f3942; border-radius: 5px; text-decoration: none!important; font-weight: bold;}
            }

            </style>
            </head>

            <body bgcolor="#fff">
            <table width="100%" bgcolor="#f1f5f8" border="0" cellpadding="0" cellspacing="0">
            <tr>
            <td>
                <table bgcolor="#ffffff" class="content" align="center" cellpadding="0" cellspacing="0" border="0">
                <tr>
                    <td class="header">
                        <img src="https://oceanbuilders-main-app.s3.us-east-2.amazonaws.com/logo.png" width="70" height="70" border="0" alt="" />
                    </td>
                </tr>
                ${body}
                <tr>
                    <td class="footer" bgcolor="#fff">
                    <table width="100%" border="0" cellspacing="0" cellpadding="0">
                        <tr>${cheers}
                        </tr>
                        <tr>
                            <td align="center" class="footercopy">
                                The Ocean Builders Team
                            </td>
                        </tr>
                        <tr>
                        <td align="center" style="padding: 20px 0 0 0;">
                            <table border="0" cellspacing="0" cellpadding="0">
                            <tr>
                            <td width="30" style="text-align: center; padding: 0 5px 0 5px;">
                                <a href="https://www.facebook.com/OceanBuildersOfficial">
                                    <img src="https://oceanbuilders-main-app.s3.us-east-2.amazonaws.com/facebook.png" width="30" height="30" alt="Facebook" border="0" />
                                </a>
                            </td>
                            <td width="30" style="text-align: center; padding: 0 5px 0 5px;">
                                <a href="https://www.instagram.com/ocean_builders/">
                                    <img src="https://oceanbuilders-main-app.s3.us-east-2.amazonaws.com/instagram.png" width="30" height="30" alt="Instagram" border="0" />
                                </a>
                            </td>
                            <td width="30" style="text-align: center; padding: 0 5px 0 5px;">
                                <a href="https://twitter.com/oceanbuilders">
                                    <img src="https://oceanbuilders-main-app.s3.us-east-2.amazonaws.com/twitter.png" width="30" height="30" alt="Twitter" border="0" />
                                </a>
                            </td>
                            <td width="30" style="text-align: center; padding: 0 5px 0 5px;">
                                <a href="https://www.linkedin.com/company/oceanbuilders/">
                                    <img src="https://oceanbuilders-main-app.s3.us-east-2.amazonaws.com/linkedin.png" width="30" height="30" alt="LinkedIn" border="0" />
                                </a>
                            </td>
                            <td width="30" style="text-align: center; padding: 0 5px 0 5px;">
                                <a href="https://www.youtube.com/channel/UCzA2-xKrPZZPmXz7XfoMVIQ">
                                    <img src="https://oceanbuilders-main-app.s3.us-east-2.amazonaws.com/youtube.png" width="30" height="30" alt="YouTube" border="0" />
                                </a>
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
            </body>
            </html>`
        };

        return msg;
    }

    async sendForgetPasswordMail(to, name, url, resetCode) {
        const body = `
        <tr>
            <td class="innerpadding borderbottom">
                <table width="100%" border="0" cellspacing="0" cellpadding="0">
                    <tr>
                        <td class="h2">
                            Password Reset
                        </td>
                    </tr>
                    <tr>
                        <td class="bodycopy">
                            Hi ${name}, <br><br>
                            We recevied a request to reset your Ocean Builders app password.<br>
                            Please click on the button below and follow the instructions
                        </td>
                    </tr>
                </table>
                <table align="center" border="0" cellspacing="0" cellpadding="0">
                    <tr>
                        <td class="button">
                            <a href="${url}">reset password</a>
                        </td>
                    </tr>
                    <tr>
                        <td class="bodycopy">
                            Alternatively, enter the following code in Ocean Builders app:
                        </td>
                    </tr>
                    <tr>
                        <td style="font-family: Varela; font-size: 24px; font-style: normal; font-weight: 400; line-height: 25px; letter-spacing: 0px; text-align: center;">
                            ${resetCode}
                        </td>
                    </tr>
                </table>
                <table align="center" border="0" cellspacing="0" cellpadding="0">    
                    <tr>
                        <td class="bodycopy">
                            If you received this email by mistake, simply delete it. <br>
                            For questions about this, please contact: <a href="mailto:customer@oceanbuilders.com">customer@oceanbuilders.com</a>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>`

        const msg = this.emailTemplate(to, 'Reset Password', body);
        await sgMail.send(msg);
    }

    async sendPasswordChangedMail(to, name) {
        const body = `
        <tr>  
            <td class="innerpadding borderbottom">
                <table width="100%" border="0" cellspacing="0" cellpadding="0">
                    <tr>
                        <td class="h2">
                            Password Changed
                        </td>
                    </tr>
                    <tr>
                        <td class="bodycopy">
                            Hi ${name}, <br><br>
                            This is a confirmation that the password for your account ${to} has just changed.
                        </td>
                    </tr>
                </table>
            </td>
        </tr>`

        const msg = this.emailTemplate(to, 'Password Change Confirmation', body);
        await sgMail.send(msg);
    }

    async sendConfirmationMail(to, name, webUrl, appUrl) {
        const body = `
        <tr>
            <td class="innerpadding borderbottom">
                <table width="100%" border="0" cellspacing="0" cellpadding="0">
                    <tr>
                        <td class="h2">
                            Email Confirmation
                        </td>
                    </tr>
                    <tr>
                        <td class="bodycopy">
                            Hi ${name}. Thanks for joining our community. <br> 
                            Click this button to verify your email address and finish setting up your account.
                        </td>
                    </tr>
                </table>
                <table align="center" border="0" cellspacing="0" cellpadding="0">
                    <tr>
                        <td class="button">
                            <a href="${webUrl}">confirm your email address using browser</a>
                        </td>
                    </tr>
                    <tr>
                        <td> &nbsp;</td>
                    </tr>
                    <tr>
                        <td class="button">
                            <a href="${appUrl}">confirm your email address using app</a>
                        </td>
                    </tr>
                    <tr>
                        <td class="bodycopy">
                            If you received this email by mistake, simply delete it. <br>
                            For questions about this, please contact: <a href="mailto:customer@oceanbuilders.com">customer@oceanbuilders.com</a>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>`;

        const msg = this.emailTemplate(to, 'Confirm Your Email', body);
        await sgMail.send(msg);
    }

    async sendAccessRequestMail(to, name, seapodName, seapodVessalCode, date, ) {
        const body = `
        <tr>
            <td class="innerpadding borderbottom">
                <table width="100%" border="0" cellspacing="0" cellpadding="0">
                    <tr>
                        <td class="h2">
                            Access Request
                        </td>
                    </tr>
                    <tr>
                        <td class="bodycopy">
                            <span style="text-transform: capitalize;">${name}</span> has requested access to your seapod ${seapodName} ( ${seapodVessalCode} )<br> 
                            for permanent access starting on ${date}.<br> <br> 
                            ${name} is awaiting your response.<br> 
                            Please open the OceanBuilder app and respond to this request.
                        </td>
                    </tr>
                </table>
                <table align="center" border="0" cellspacing="0" cellpadding="0">
                    <td>
                        <img src='https://oceanbuilders-main-app.s3.us-east-2.amazonaws.com/QRplacement.png' width="130" height="130" alt="QR code" border="0">
                    </td>
                </table>
            </td>
        </tr>`

        const msg = this.emailTemplate(to, 'Access Request', body);
        await sgMail.send(msg);
    }

    async sendAccessInvitationMail(to, name, seapodName, seapodVessalCode, period, date) {
        const body = `
        <tr>
            <td class="innerpadding borderbottom">
                <table width="100%" border="0" cellspacing="0" cellpadding="0">
                    <tr>
                        <td class="h2">
                            Access Invitation
                        </td>
                    </tr>
                    <tr>
                        <td class="bodycopy">
                            <span style="text-transform: capitalize;">${name}</span> has invited you to access seapod ${seapodName} ( ${seapodVessalCode} )<br> 
                            for ${period} starting on ${date}.<br> <br> 
                            ${name} is awaiting your response.<br> 
                            Please open the OceanBuilder app and respond to this invitation.<br>
                            You will need to introduce the vessal code <span style="color: black;">${seapodVessalCode}</span> or scan the QR code below.
                        </td>
                    </tr>
                </table>
                <table align="center" border="0" cellspacing="0" cellpadding="0">
                    <td>
                        <img src="https://oceanbuilders-main-app.s3.us-east-2.amazonaws.com/QRplacement.png" width="130" height="130" alt="QR code" border="0">
                    </td>
                </table>
            </td>
        </tr>`

        const msg = this.emailTemplate(to, 'Access Inivitaion', body);
        await sgMail.send(msg);
    }

    async sendUrgentNotificationMail(to, name, seapodName, seapodVessalCode, issue, phoneNumber, email) {
        const body = `
        <tr>
            <td class="innerpadding borderbottom">
                <table width="100%" border="0" cellspacing="0" cellpadding="0">
                    <tr>
                        <td class="h2" style="color:#cb2828;">
                            Urgent Notification
                        </td>
                    </tr>
                    <tr>
                        <td class="bodycopy">
                            Hi ${name}, <br><br>
                            Your seapod ${seapodName} (${seapodVessalCode}) is currently having the following issue:<br>
                            <span style="color: black;">${issue}</span><br><br>
                            Please remember that you can contact us any time at ${phoneNumber} or ${email}<br><br>
                            Make sure you have notifications enabled on the Ocean Builders app if you want to be aware of any urgent isues.
                        </td>
                    </tr>
                </table>
            </td>
        </tr>`

        const msg = this.emailTemplate(to, 'URGENT NOTIFICATION', body);
        await sgMail.send(msg);
    }
}

exports.MailService = MailService;