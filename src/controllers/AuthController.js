const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

require('dotenv').config();
const SECRET_KEY = process.env.SECRET_KEY;
const { sequelize } = require('../config');

class AuthController {
    // [POST] /login
    async login(req, res) {
        try {
            const { email, password } = req.body;

            // Kiểm tra xem có đủ dữ liệu đầu vào
            if (!email || !password) {
                return res.status(400).json({ success: false, message: 'Email and password are required' });
            }

            // Câu lệnh SQL kiểm tra người dùng
            const userQuery = `
                SELECT id, email, first_name, last_name, password, salt, image, is_active
                FROM sm_user
                WHERE email = :email
                LIMIT 1;
            `;

            const users = await sequelize.query(userQuery, {
                replacements: { email },
                type: sequelize.QueryTypes.SELECT,
            });

            // Kiểm tra nếu người dùng không tồn tại
            if (users.length === 0) {
                return res.json({ success: false, errorField: 'email' });
            }

            const user = users[0];

            if (!user.is_active) {
                return res.json({ success: false, errorField: 'is_active' });
            }

            // So sánh mật khẩu đã mã hóa
            const passCompare = bcrypt.compareSync(password, user.password);
            if (!passCompare) {
                return res.json({ success: false, errorField: 'password' });
            }

            const fullImageUrl = user.image ? `${req.protocol}://${req.get('host')}/${user.image}` : null;

            // Tạo JWT token
            const token = jwt.sign({ id: user.id, email: user.email }, SECRET_KEY, { expiresIn: '1h' });

            res.json({
                success: true,
                token,
                image_url: fullImageUrl,
                email: user.email,
                first_name: user.first_name,
                last_name: user.last_name,
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Login failed', error: error.message });
        }
    }

    // [POST] /signup
    async signup(req, res) {
        try {
            const {
                first_name,
                last_name,
                email = null,
                password = null,
                phone = null,
                position_id = null,
                role_id = null,
                gender = null,
                address = '',
                image_url = null,
            } = req.body;

            // Kiểm tra các trường bắt buộc
            if (!first_name || !last_name) {
                return res.status(400).json({ success: false, message: 'First name and last name are required' });
            }

            // Tạo salt và mã hóa mật khẩu nếu có mật khẩu
            let hashedPassword = null;
            let salt = null;
            if (password) {
                const saltRounds = 10;
                salt = bcrypt.genSaltSync(saltRounds);
                hashedPassword = bcrypt.hashSync(password, salt);
            }

            // Tạo ID mới cho người dùng (UUID/GUID)
            const userId = uuidv4();

            // Câu lệnh SQL thêm mới người dùng vào bảng sm_user
            const insertQuery = `
                INSERT INTO sm_user (id, first_name, last_name, email, password, phone, position_id, role_id, gender, address, image, salt, is_active)
                VALUES (:id, :first_name, :last_name, :email, :password, :phone, :position_id, :role_id, :gender, :address, :image, :salt, :is_active)
            `;

            // Thực thi câu lệnh SQL
            await sequelize.query(insertQuery, {
                replacements: {
                    id: userId,
                    first_name,
                    last_name,
                    email,
                    password: hashedPassword,
                    phone,
                    position_id,
                    role_id,
                    gender,
                    address,
                    image: image_url,
                    salt: salt,
                    is_active: true,
                },
                type: sequelize.QueryTypes.INSERT,
            });

            const fullImageUrl = image_url ? `${req.protocol}://${req.get('host')}/${image_url}` : null;
            // Tạo JWT token
            const token = jwt.sign({ id: userId, email }, process.env.SECRET_KEY, { expiresIn: '1h' });

            res.json({
                success: true,
                message: 'User registered successfully',
                token,
                userId,
                image_url: fullImageUrl,
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Registration failed', error: error.message });
        }
    }
}

module.exports = new AuthController();
