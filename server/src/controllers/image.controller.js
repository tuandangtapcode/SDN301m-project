import ImageService from '../services/image.service.js'

const insertImage = async (req, res) => {
  try {
    const response = await ImageService.fncInsertImage(req)
    return res.status(response.statusCode).json(response)
  } catch (error) {
    return res.status(500).json(error.toString())
  }
}

const getImagesByChapter = async (req, res) => {
  try {
    const response = await ImageService.fncGetAllImagesByChapter(req)
    return res.status(response.statusCode).json(response)
  } catch (error) {
    return res.status(500).json(error.toString())
  }
}

const getImagesByComic = async (req, res) => {
  try {
    const response = await ImageService.fncGetAllImageByComic(req)
    return res.status(response.statusCode).json(response)
  } catch (error) {
    return res.status(500).json(error.toString())
  }
}


const ImageController = {
  insertImage,
  getImagesByChapter,
  getImagesByComic
}

export default ImageController
