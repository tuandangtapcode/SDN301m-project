import Comic from '../models/comic.js'
import response from '../utils/response-result.js'
import cloudinary from 'cloudinary'
import User from '../models/user.js'
const cloudinaryV2 = cloudinary.v2

const fncGetAllComics = async (req) => {
  try {
    const { TextSearch, CurrentPage, PageSize } = req.body
    const comics = await Comic
      .find({ Title: { $regex: TextSearch, $options: 'i' } })
      .skip((CurrentPage - 1) * PageSize)
      .limit(PageSize)
      .populate('Author', ['_id', 'FullName'])
      .populate('Genres', ['Title'])
    return response(
      { List: comics, Total: comics.length },
      false,
      'Lấy data thành công',
      200
    )
  } catch (error) {
    return response({}, true, error.toString(), 500)
  }
}

const fncGetAllComicsByGenres = async (req) => {
  try {
    const { TextSearch, CurrentPage, PageSize, GenreID } = req.body
    const comics = await Comic
      .find({
        Title: { $regex: TextSearch, $options: 'i' },
        Genres: { $elemMatch: GenreID }
      })
      .skip((CurrentPage - 1) * PageSize)
      .limit(PageSize)
      .populate('Author', ['_id', 'FullName'])
      .populate('Genres', ['Title'])
    if (!comics.length) {
      return response({ List: [], Total: 0 }, false, `Không tìm thấy comic có genre "${GenreID}"`)
    }
    return response(
      { List: comics, Total: comics.length },
      false,
      'Lấy data thành công',
      200
    )
  } catch (error) {
    return response({}, true, error.toString(), 500)
  }
}

const fncGetAllComicsByAuthor = async (req) => {
  try {
    const { TextSearch, CurrentPage, PageSize, UserID, IsPrivated } = req.body
    let data, query
    if (!IsPrivated) {
      query = {
        Title: { $regex: TextSearch, $options: 'i' },
        Author: UserID,
        Status: true
      }
    } else {
      query = {
        Title: { $regex: TextSearch, $options: 'i' },
        Author: UserID,
      }
    }
    const comics = await Comic
      .find(query)
      .skip((CurrentPage - 1) * PageSize)
      .limit(PageSize)
    if (!IsPrivated) data = { List: comics, Total: comics.length, Author: user }
    else data = { List: comics, Total: comics.length }
    return response(data, false, "Lấy data thành công", 200)
  } catch (error) {
    return response({}, true, error.toString(), 500)
  }
}

const fncInsertComic = async (req) => {
  try {
    const { Title } = req.body
    const comic = await Comic.findOne({ Title })
    if (comic) {
      cloudinaryV2.uploader.destroy(req.file.filename)
      return response({}, true, `Truyện: ${Title} đã tồn tại`, 200)
    }
    const create = await Comic.create({ ...req.body, AvatarPath: req.file.path, AvatarPathId: req.file.filename })
    return response(create._id, false, "Thêm mới thành công", 201)
  } catch (error) {
    return response({}, true, error.toString(), 500)
  }
}

const fncUpdateComic = async (req) => {
  try {
    const { ComicID, UserID, Title } = req.body
    const checkExist = await Comic.findOne({ _id: ComicID, Author: UserID })
    if (!checkExist) return response(checkExist, true, 'Truyện không tồn tại', 200)
    const checkExistTitle = await Comic.findOne({ Title })
    if (!!checkExistTitle && checkExist._id !== checkExistTitle._id) {
      cloudinaryV2.uploader.destroy(req.file.filename)
      return response({}, true, `Truyện: ${Title} đã tồn tại`, 200)
    }
    const updateComic = await Comic.updateOne({ _id: ComicID }, {
      ...req.body,
      AvatarPath: !!req.file ? req.file.path : checkExistTitle?.AvatarPath,
      AvatarPathId: !!req.file ? req.file.filename : checkExistTitle?.AvatarPathId,
    })
    return response(updateComic, false, "Cập nhật thành công thành công", 200)
  } catch (error) {
    return response({}, true, error.toString(), 500)
  }
}

const fncDeleteComic = async (req) => {
  try {
    const { ComicID, UserID } = req.body
    const deleteComic = await Comic.deleteOne({ _id: ComicID, Author: UserID })
    if (!deleteComic.deletedCount) return response({}, true, "Có lỗi khi xóa", 200)
    return response(deleteComic, false, "Xóa thành công", 200)
  } catch (error) {
    return response({}, true, error.toString(), 500)
  }
}

const fncGetDetailComic = async (req) => {
  try {
    const id = req.params.ComicID
    const comic = await Comic.findOne({ _id: id })
      .populate('Author', ['_id', 'FullName'])
      .populate('Genres', ['Title'])
    if (!comic) return response({}, true, 'Truyện không tồn tại', 200)
    return response(comic, false, 'Lấy data thành công', 200)
  } catch (error) {
    return response({}, true, error.toString(), 500)
  }
}

const fncChangeStatusComic = async (req) => {
  try {
    const { ComicID, Status } = req.body
    const updateComic = await Comic.findByIdAndUpdate({ _id: ComicID }, { Status: Status })
    if (!updateComic) return response({}, true, 'Truyện không tồn tại', 200)
    return response({}, false, 'Cập nhật thành công', 200)
  } catch (error) {
    return response({}, true, error.toString(), 500)
  }
}

const fncFollowComic = async (req) => {
  try {
    const { ComicID, UserID } = req.body
    if (!UserID || !ComicID) {
      return res.status(400).json({ message: 'Missing required parameters: userID and comicID' });
    }
    const user = await User.findById(UserID);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const comic = await Comic.findById(ComicID);
    if (!comic) {
      return res.status(404).json({ message: 'Comic not found' });
    }
    if (user.Follows.find(followedComic => followedComic.toString() === ComicID)) {
      return res.status(400).json({ message: 'Comic already followed' });
    }
    user.Follows.push(ComicID)
    await user.save();
    return response({ message: 'Comic followed'}, false, 'Cập nhật thành công', 200)
  } catch (error) {
    return response({}, true, error.toString(), 500)
  }
}

const fncUnfollowComic = async (req) => {
  try {
    const { ComicID, UserID } = req.body
    if (!UserID || !ComicID) {
      return res.status(400).json({ message: 'Missing required parameters: userID and comicID' });
    }
    const user = await User.findById(UserID);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const comic = await Comic.findById(ComicID);
    if (!comic) {
      return res.status(404).json({ message: 'Comic not found' });
    }
    if (!user.Follows.find(followedComic => followedComic.toString() === comicID)) {
      return res.status(400).json({ message: 'Comic not followed' });
    }
    user.Follows.pull(comicID);
    await user.save();
    return response({ message: 'Comic unfollowed'}, false, 'Cập nhật thành công', 200)
  } catch (error) {
    return response({}, true, error.toString(), 500)
  }
}

const fncGetAllComicsFollowed = async (req) => {
  try {
    const { userID } = req.body; // Assuming request body contains userID
    if (!userID) {
      return res.status(400).json({ message: 'Missing required parameter: userID' });
    }
    const user = await Users.findById(userID).populate('Follows');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const followedComics = user.Follows.map(comic => {
      return {
        comicID: comic._id,
        title: comic.Title,
        author: comic.Author.FullName,
        coverImage: comic.AvatarPath,
      };
    });
    return response({ followedComics }, false, 'Cập nhật thành công', 200)
  } catch (error) {
    return response({}, true, error.toString(), 500)
  }
}


const ComicService = {
  fncGetAllComics,
  fncInsertComic,
  fncUpdateComic,
  fncDeleteComic,
  fncUpdateComic,
  fncGetAllComicsByGenres,
  fncGetDetailComic,
  fncGetAllComicsByAuthor,
  fncChangeStatusComic,
  fncFollowComic,
  fncUnfollowComic,
  fncGetAllComicsFollowed
}

export default ComicService
