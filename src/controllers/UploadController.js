const port = process.env.PORT || 4000;
const { v4: uuidv4 } = require('uuid');
const { sequelize } = require('../config');

class UploadController {
    // [POST] /upload
    async upload(req, res, next) {
        try {
            if (!req.file) {
                return res.status(400).json({ success: 0, message: 'No file uploaded' });
            }

            // Lấy thông tin file
            const { filename, size, mimetype } = req.file;
            const filePath = `images/${filename}`;

            // Tạo UUID cho file_id
            const fileId = uuidv4();

            // Câu lệnh SQL thêm mới bản ghi vào bảng sm_file
            const insertQuery = `
                INSERT INTO sm_file (file_id, file_name, file_path, file_size, file_type)
                VALUES (:file_id, :file_name, :file_path, :file_size, :file_type)
            `;

            // Thực thi câu lệnh SQL
            await sequelize.query(insertQuery, {
                replacements: {
                    file_id: fileId,
                    file_name: filename,
                    file_path: filePath,
                    file_size: size,
                    file_type: mimetype,
                },
                type: sequelize.QueryTypes.INSERT,
            });

            res.json({
                success: true,
                image_url: filePath,
                file_id: fileId, // Trả về file_id để frontend sử dụng tiếp
            });
        } catch (error) {
            res.locals.error = true;
            // Chuyển tiếp tới middleware xóa file
            next();
        }
    }
    // [PATCH]/updateFile
    async updateFile(req, res) {
        try {
            const { file_id, user_id } = req.body;

            if (!file_id || !user_id) {
                return res.status(400).json({ success: false, message: 'file_id and user_id are required' });
            }

            // Câu lệnh SQL cập nhật ref_id trong bảng sm_file
            const updateQuery = `
                UPDATE sm_file 
                SET ref_id = :ref_id 
                WHERE file_id = :file_id
            `;

            // Thực thi câu lệnh SQL
            await sequelize.query(updateQuery, {
                replacements: {
                    ref_id: user_id,
                    file_id: file_id,
                },
                type: sequelize.QueryTypes.UPDATE,
            });

            res.json({
                success: true,
                message: 'File updated successfully with ref_id',
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Failed to update file', error: error.message });
        }
    }
}

module.exports = new UploadController();
