import { sendEmail } from "../utils/email";
const fs = require('fs');

export const sendOrderConfirmationEmail = async (
  userEmail: string,
  order?: any
) => {
  try {
    if (!order) throw new Error("Can't find order details");

    await sendEmail(
      userEmail,
      "Confirming Your Order",
      getOrderConfirmationEmailHtml(order)
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

const getOrderConfirmationEmailHtml = (order: any) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order Confirmation</title>
</head>
<body style="background-color:#ffffff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Oxygen-Sans,Ubuntu,Cantarell,'Helvetica Neue',sans-serif;">
    <div style="margin:10px auto;width:600px;max-width:100%;border:1px solid #E5E5E5;">
        <p>Helloo ${order.buyerName}</p>
        <div style="padding:30px 74px;text-align:center;">
            <img src="https://firebasestorage.googleapis.com/v0/b/shoppex-fab4e.appspot.com/o/icon-fill.png?alt=media&token=23965e7c-0935-447c-8ff5-eca6d05845d0" width="40" height="50" alt="Mossodor" style="margin:auto;">
            <h1 style="color:black;font-size:28px;line-height:1.3;font-weight:700;text-align:center;letter-spacing:-1px;">It's On Its Way.</h1>
            <p style="margin:0;line-height:1.3;color:#747474;font-weight:400;">Your order's is on its way. Tracking information will be available soon.</p>
            <p style="margin:0;line-height:1.3;color:#747474;font-weight:400;margin-top:24px;">Your payment for <span style="font-weight:bold;">£${
              order.total / 100
            }</span> was successful. For payment details, please visit your <a href="https://mossodor.com/account/orders/${
  order._id
}">Orders</a> page on mossodor.com.</p>
        </div>
        <hr style="border-color:#E5E5E5;margin:0;">
        <div style="padding:22px 30px;color:black;">
            <p style="margin:0;font-size:15px;font-weight:bold;">Shipping Information</p>
            <p style="margin:0;font-size:15px;font-weight:bold;">
                <span style="font-weight:medium;font-size:18px;">${
                  order.buyerName
                }</span><br>
                <span style="font-size:14px;"></span>${order.buyerEmail}<br>
                <span>${order.address.line1}, ${order.address.line2}, ${
  order.address.city
}, ${order.address.state ? `${order.address.state}, ` : ""} ${
  order.address.postal_code
}, ${order.address.country}</span>
            </p>
            <br>
            <div style="display:flex;justify-content:space-between;">
                <p style="margin:0;font-size:15px;font-weight:bold;">${
                  order.shippingMethod
                }</p>
                <p style="margin:0;font-size:15px;font-weight:bold;">£${(
                  order.shipping / 100
                ).toFixed(2)}</p>
            </div>
        </div>
        <hr style="border-color:#E5E5E5;margin:0;">
        <div style="padding:30px 30px;">
            ${
              Array.isArray(order.items)
                ? order.items
                    .map(
                      (item: any, index: any) => `
            <div style="display:flex;align-items:center;margin-bottom:20px;" key="${
              item._id + index
            }">
                <img src="${item.thumpnail}" alt="${
                        item.name
                      }" width="50" height="50" style="float:left;width:100px;">
                <div style="vertical-align:center;padding-left:12px;">
                    <p style="margin:0;line-height:2;font-weight:500;">${
                      item.name
                    }</p>
                    <p style="margin:0;line-height:2;font-weight:bold;">£${
                      item.price
                    }</p>
                </div>
            </div>`
                    )
                    .join("")
                : ""
            }
        </div>
        <hr style="border-color:#E5E5E5;margin:0;">
        <div style="padding:22px 30px;">
            <div>
                <p style="margin:0;line-height:2;font-weight:bold;">Order Number</p>
                <p style="margin:12px 0 0 0;font-weight:500;line-height:1.4;color:#6F6F6F;">${
                  order._id
                }</p>
            </div>
            <div>
                <p style="margin:0;line-height:2;font-weight:bold;">Order Date</p>
                <p style="margin:12px 0 0 0;font-weight:500;line-height:1.4;color:#6F6F6F;">${new Date(
                  order.purchaseDate
                ).toLocaleDateString()}</p>
            </div>
        </div>
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
