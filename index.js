import express from 'express';
import multer from 'multer';
import cors from 'cors';
import { config } from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';
import { checkAuth, handleValidationError } from './utils/index.js';
import {
	registerValidation,
	loginValidation,
	postCreateValidation,
} from './validations.js';
import { UserController, PostController } from './controllers/index.js';

config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PORT = process.env.PORT || 4444;
const MONGODB_SERVER_URL = process.env.MONGODB_SERVER_URL;

mongoose
	.connect(MONGODB_SERVER_URL)
	.then(() => console.log('Connected to MongoDB'))
	.catch((error) => console.log('MongoDB error - ', error));

const app = express();

const storage = multer.diskStorage({
	destination: (_, file, cb) => {
		const uploadPath = path.join(
			__dirname,
			'uploads',
			file.fieldname === 'avatar' ? 'avatars' : ''
		);
		fs.mkdirSync(uploadPath, { recursive: true });
		cb(null, uploadPath);
	},
	filename: (_, file, cb) => {
		cb(null, file.originalname);
	},
});

const upload = multer({ storage });
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.post(
	'/auth/login',
	loginValidation,
	handleValidationError,
	UserController.login
);
app.post(
	'/auth/register',
	registerValidation,
	handleValidationError,
	UserController.register
);
app.get('/auth/me', checkAuth, UserController.getMe);

app.post('/upload', checkAuth, upload.single('image'), (req, res) => {
	if (!req.file) {
		return res.status(400).json({ error: 'Файл не загружен' });
	}

	res.json({
		url: `/uploads/${req.file.originalname}`,
	});
});

app.post('/upload/avatar', upload.single('image'), (req, res) => {
	if (!req.file) {
		return res.status(400).json({ error: 'Файл не загружен' });
	}

	res.json({
		url: `/uploads/${req.file.originalname}`,
	});
});

app.get('/tags', PostController.getLastTags);

app.get('/posts', PostController.getAll);
app.get('/posts/tags', PostController.getLastTags);
app.get('/posts/:id', PostController.getOne);
app.post(
	'/posts',
	checkAuth,
	postCreateValidation,
	handleValidationError,
	PostController.create
);
app.patch(
	'/posts/:id',
	checkAuth,
	postCreateValidation,
	handleValidationError,
	PostController.update
);
app.delete('/posts/:id', checkAuth, PostController.remove);

app.listen(PORT, (err) => {
	if (err) {
		return console.log(err);
	}

	console.log(`Server running on port ${PORT}`);
});
