const db = require('./db_conn');
const nodemailer = require('nodemailer');
const multer = require('multer');
const upload = multer();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD
    }
});

const sendMail = (req, res) => {
    const { templateId, hr_mail } = req.body;
    db.get("SELECT * FROM template WHERE id = ?", [templateId], (err, template) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!template) {
            return res.status(404).json({ error: "Template not found" });
        }

        const mailOptions = {
            from: process.env.EMAIL,
            to: hr_mail,
            attachments: [
                {
                    filename: 'Nahid-Khan-Resume',
                    path: `./${template.file}`,
                },
            ],

            subject: template.subject,
            text: template.cover_letter
        }

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return res.status(500).json({ error: error.message });
            }
            db.run(
                "INSERT INTO mails_history (template_id, hrs_mail, status) VALUES (?, ?, ?)",
                [templateId, hr_mail, 1],
                (err) => {
                    if (err) {
                        console.error("Error saving to history:", err);
                    }
                    res.json({
                        message: "Email sent successfully",
                        info: info.response
                    });
                }
            );
        });
    });
};

module.exports = { sendMail };
