import { sendEmail } from "../utils/email";
const fs = require('fs');

export const sendOrderTestConfirmationEmail = async (
  userEmail: string
) => {
  try {
   
    await sendEmail(
      userEmail,
      "Confirming Your Order",
      getOrderTestConfirmationEmailHtml()
    );
    fs.appendFile('my-log-file.log', "mail sent to  " +userEmail+"\n", (err:any) => {
      if (err) throw err;
      console.log('Log message saved to my-log-file.log');
    });
  } catch (err) {
    fs.appendFile('my-log-file.log', "errrror with email "+err+"\n", (err:any) => {
      if (err) throw err;
      console.log('Log message saved to my-log-file.log');
    });
    console.error("Error sending order confirmation email:", err);
  }
};

const getOrderTestConfirmationEmailHtml = () => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order Confirmation</title>
</head>
<body style="background-color:#ffffff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Oxygen-Sans,Ubuntu,Cantarell,'Helvetica Neue',sans-serif;">
    <div style="margin:10px auto;width:600px;max-width:100%;border:1px solid #E5E5E5;">
       
        <hr style="border-color:#E5E5E5;margin:0;">
       
        <hr style="border-color:#E5E5E5;margin:0;">
       
        <hr style="border-color:#E5E5E5;margin:0;">
       
        <hr style="border-color:#E5E5E5;margin:12px 0 0 0;">
        <div style="padding:22px 0;">
            <div style="padding-top:30px;padding-bottom:30px;">
                <p style="margin:0;color:#AFAFAF;font-size:13px;text-align:center;">Please contact us if you have any questions.<br>(If you reply to this email, we won't be able to see it.)</p>
            </div>
            <p style="margin:0;color:#AFAFAF;font-size:13px;text-align:center;">© 2024 mossodor, Inc. All Rights Reserved.</p>
            <p style="margin:0;color:#AFAFAF;font-size:13px;text-align:center;">Mossodor, INC. 31-53 Hunders Rd, Birmingham B19 1DP, United Kingdom.</p>
        </div>
    </div>
</body>
</html>
`;
