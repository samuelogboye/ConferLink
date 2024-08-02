import multer from 'multer';

/**
 * Multer configuration for file uploads
 */
const multerStorage = multer.memoryStorage();

export const multerUpload = multer({
	storage: multerStorage,
});
