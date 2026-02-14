import { Response } from "express";
import { ContactRepository } from "./Contact/contact.repository";
import { contactSchema } from "./Contact/contact.schema";
import { HttpError } from "../../../../utils/httpError";
import { sendEmail } from "../../../../utils/email";


export const handleContact = async (req: any, res: Response) => {
  try {
    const { name, email } = req.body; // Destructure the name and email from the request body
    if (!name || !email) {
      throw new HttpError(400, "Name and email are required");
    }
    // const contactRepository = new ContactRepository(
    //   req.connectionKey,
    //   contactSchema,
    //   "ContactForm"
    // );

    // const contactData = {
    //   name,
    //   email,
    // };

    // const contactForm = await contactRepository.addContact(
    //   contactData
    // );
    await sendEmail(
       process.env.SENDER_EMAIL!,
      "New Contact Form Submission",
      `<!DOCTYPE html>
      <html lang="en">
        <head>
          <style>
            .text-2xl { font-size: 1.5rem; }
            .font-bold { font-weight: bold; }
            .text-brand { color: #007291; }
          </style>
        </head>
        <body>
        <div style="color: #000;">
                  <h1 class="text-2xl font-bold">New Contact Form Submission</h1>
          <p>
            Name: ${name}<br />
            Email:  <a
              href="mailto:${email}"
            >${email}</a>
          </p><br />
  
  
          <p>
            
This e-mail was sent from a contact form on Mossodor (https://www.mossodor.com)
          </p>
        </div>

        </body>
      </html>`
    );
    res.status(200).json({ success: true });
  } catch (err: any) {
    console.log(err.message);
    res
      .status(err.status || 500)
      .json({ error: err.message || "Internal server error" });
  }
};

// export const handleGetVisitors = async (req: any, res: Response) => {
//   try {
//     const contactRepository = new ContactRepository(
//       req.connectionKey,
//       contactSchema,
//       "Contact"
//     );

//     const emails = await contactRepository.handleGetVisitors();

//     res.status(200).json({ emails });
//   } catch (err: any) {
//     console.log(err.message);
//     res
//       .status(err.status || 500)
//       .json({ error: err.message || "Internal server error" });
//   }
// };
