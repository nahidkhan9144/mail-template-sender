const db = require("./db_conn");
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { STATUS_CODES } = require("http");
const dummy = (req, res) => {
    res.send("Template added!");
};

const uploadsDir = 'uploads';
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extension = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + extension);
    }
});
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        cb(null, true); // Accept all file types
    }
});
const createTemplate = (req, res) => {
    upload.single('file')(req, res, (err) => {
        const { subject, cover_letter } = req.body;
        const filePath = req.file ? req.file.path : null;
        if (err) {
            console.error('File upload error:', err);
            return res.status(400).json({ error: err.message });
        }
        console.log('Received data:', req.body); // Debug log


        const sql = "INSERT INTO template (subject, cover_letter, file) VALUES (?, ?, ?)";

        db.run(sql, [subject, cover_letter, filePath || null], (err) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ error: err.message });
            }
            res.status(201).json({
                status: STATUS_CODES.CREATED,
                message: "Template created successfully",
                data: { subject, cover_letter }
            });
        });
    });
};

const getSingleTemplate = (req, res) => {
    const templateId = req.params.id;

    const sql = "SELECT * FROM template WHERE id = ?";

    db.get(sql, [templateId], (err, row) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: err.message });
        }

        if (!row) {
            return res.status(404).json({ error: 'Template not found' });
        }

        res.json({
            message: "Template retrieved successfully",
            data: row
        });
    });
};

const deleteTemplate = (req, res) => {
    const { id } = req.params;
    const sql = "UPDATE template SET deleted = 1 WHERE id = ?";
    db.run(sql, [id], (err) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: "Template deleted successfully" });
    });
};

const updateTemplate = (req, res) => {
    console.log('Route params:', req.params);
    console.log('Request body:', req.body);
    console.log('Content-Type:', req.headers['content-type']);
  const templateId = req.params.id;
    upload.single('new_file')(req, res, (err) => {
        if (err) {
            console.error('File upload error:', err);
            return res.status(400).json({ error: err.message });
        }

        if (req.file) {
            console.log('Update request body:', req.body); // Debug log
            const sql = "UPDATE template SET subject = ? , cover_letter = ?, file = ? WHERE id = ?";
            const { subject, cover_letter } = req.body;
            db.run(sql, [subject, cover_letter, req.file.path, templateId], (err) => {
                if (err) {
                    return res.status(500).json({ error: err.message });
                }
                res.json({ message: "Template updated successfully" });
            });
        }else{
            const sql = "UPDATE template SET subject = ? , cover_letter = ? WHERE id = ?";
            const { subject, cover_letter } = req.body;
            db.run(sql, [subject, cover_letter, templateId], (err) => {
                if (err) {
                    return res.status(500).json({ error: err.message });
                }
                res.json({ message: "Template updated successfully" });
            });

        }
        });
};

// Fetch all templates
const getTemplates = (req, res) => {
    const sql = "SELECT id,subject FROM template WHERE deleted = 0 ORDER BY id DESC";
    db.all(sql, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
};

module.exports = {
    dummy,
    createTemplate,
    getTemplates,
    deleteTemplate,
    updateTemplate,
    getSingleTemplate
};