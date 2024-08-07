import express from 'express'
import multer from 'multer'
import cors from 'cors'
import { config } from 'dotenv';
import mongoose from 'mongoose'
import { checkAuth, handleValidationError } from './utils/index.js'
import {
	registerValidation,
	loginValidation,
	postCreateValidation,
} from './validations.js'
import { UserController, PostController } from './controllers/index.js'

config();

const PORT = process.env.PORT || 4444;
const MONGODB_SERVER_URL = process.env.MONGODB_SERVER_URL;

mongoose
	.connect(MONGODB_SERVER_URL)
	.then(() => console.log('Connected to MongoDB'))
	.catch((error) => console.log('MongoDB error - ', error));

const app = express()

const storage = multer.diskStorage({
	destination: (_, __, cb) => {
		cb(null, 'uploads')
	},
	filename: (_, file, cb) => {
		cb(null, file.originalname)
	},
})

const upload = multer({ storage })
app.use(cors())
app.use(express.json())
app.use('/uploads', express.static('uploads'))

app.post(
	'/auth/login',
	loginValidation,
	handleValidationError,
	UserController.login
)
app.post(
	'/auth/register',
	registerValidation,
	handleValidationError,
	UserController.register
)
app.get('/auth/me', checkAuth, UserController.getMe)

app.post('/upload', checkAuth, upload.single('image'), (req, res) => {
	res.json({
		url: `/uploads/${req.file.originalname}`,
	})
})

app.get('/tags', PostController.getLastTags)

app.get('/posts', PostController.getAll)
app.get('/posts/tags', PostController.getLastTags)
app.get('/posts/:id', PostController.getOne)
app.post(
	'/posts',
	checkAuth,
	postCreateValidation,
	handleValidationError,
	PostController.create
)
app.patch(
	'/posts/:id',
	checkAuth,
	postCreateValidation,
	handleValidationError,
	PostController.update
)
app.delete('/posts/:id', checkAuth, PostController.remove)

app.listen(4444, (err) => {
	if (err) {
		return console.log(err)
	}

	console.log('Server OK')
})
