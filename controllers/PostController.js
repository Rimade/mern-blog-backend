import PostModel from '../models/Post.js';

export const getLastTags = async (req, res) => {
	try {
		const posts = await PostModel.find()
			.limit(5)
			.sort({ viewsCount: 1 })
			.exec();

		const tags = posts
			.map((obj) => obj.tags)
			.flat()
			.slice(0, 7);

		res.json(tags);
	} catch (error) {
		console.log(error);
		res.status(500).json({
			message: 'Не удалось получить статьи',
		});
	}
};

export const getAll = async (req, res) => {
	try {
		const sortBy = req.query.sortBy || 'new'; // Default sort by new
		const sortOrder =
			sortBy === 'popular' ? { viewsCount: -1 } : { createdAt: -1 };
		const posts = await PostModel.find()
			.sort(sortOrder)
			.populate('user')
			.exec();

		res.json(posts);
	} catch (error) {
		console.log(error);
		res.status(500).json({
			message: 'Не удалось получить статьи',
		});
	}
};

export const getOne = async (req, res) => {
	try {
		const postId = req.params.id;

		const doc = await PostModel.findOneAndUpdate(
			{ _id: postId },
			{ $inc: { viewsCount: 1 } },
			{ returnDocument: 'after' }
		).populate('user');

		if (!doc) {
			return res.status(404).json({
				message: 'Статья не найдена',
			});
		}

		res.json(doc);
	} catch (error) {
		console.error(error);
		res.status(500).json({
			message: 'Не удалось вернуть статью',
		});
	}
};

export const remove = async (req, res) => {
	try {
		const postId = req.params.id;

		const doc = await PostModel.findOneAndDelete({ _id: postId });

		if (!doc) {
			return res.status(404).json({
				message: 'Статья не найдена',
			});
		}

		res.json({
			success: true,
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({
			message: 'Не удалось удалить статью',
		});
	}
};

export const create = async (req, res) => {
	try {
		const doc = new PostModel({
			title: req.body.title,
			text: req.body.text,
			imageUrl: req.body.imageUrl,
			tags: req.body.tags.split(','),
			user: req.userId,
		});

		const post = await doc.save();

		res.json(post);
	} catch (error) {
		console.log(error);
		res.status(500).json({
			message: 'Не удалось создать статью',
		});
	}
};

export const update = async (req, res) => {
	try {
		const postId = req.params.id;

		await PostModel.updateOne(
			{
				_id: postId,
			},
			{
				title: req.body.title,
				text: req.body.text,
				imageUrl: req.body.imageUrl,
				user: req.userId,
				tags: req.body.tags.split(','),
			}
		);
		res.json({
			success: true,
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({
			message: 'Не удалось обновить статью',
		});
	}
};
