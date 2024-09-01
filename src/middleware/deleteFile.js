const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const unlinkAsync = promisify(fs.unlink);

async function deleteFileMiddleware(req, res, next) {
    // Kiểm tra xem có lỗi không
    if (res.locals.error) {
        // Tạo đường dẫn đầy đủ tới file cần xóa
        const filePath = path.join(__dirname, '..', 'upload', 'images', req.file.filename);

        try {
            await unlinkAsync(filePath);
            console.log(`Deleted file: ${filePath}`);
        } catch (unlinkError) {
            console.error('Failed to delete the file:', unlinkError);
        }
    }
    // Tiếp tục với các middleware hoặc route handler khác
    next();
}

module.exports = deleteFileMiddleware;
