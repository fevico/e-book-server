import BookModel, { BookDoc } from "@/models/book";
import { CreateBookRequestHandler, UpdateBookRequestHandler } from "@/types";
import { uploadBookToLocalDir, UploadCoverToCloudinary } from "@/utils/fileUpload";
import { formatFileSize, sendErrorResponse } from "@/utils/helper";
import { Types } from "mongoose";
import slugify from "slugify";
import AuthorModel from "@/models/author";
import path from "path";
import fs from "fs";
import cloudinary from "@/cloud/cloudinary";

export const createNewBook: CreateBookRequestHandler = async (req, res) => {
  const { body, files, user } = req;
  const {
    title,
    description,
    genre,
    language,
    fileInfo,
    price,
    publicationName,
    publishedAt,
    uploadMethod
  } = body;

  const {cover, book} = files;

  const newBook = new BookModel<BookDoc>({
    title,
    description,
    genre,
    language,
    fileInfo: { size: formatFileSize(fileInfo.size), id: "" },
    price,
    publicationName,
    publishedAt,
    slug: "",
    author: new Types.ObjectId(user.authorId),
  });

  newBook.slug = slugify(`${newBook.title} ${newBook._id}`, {
    lower: true,
    replacement: "-"
  })

  const uniqueFileName = slugify(`${newBook._id} ${newBook.title}.epub`,{
    lower: true,
    replacement: "-"
  });

  if(uploadMethod === 'local' ){

  if(!book || Array.isArray(book) || book.mimetype !=='application/epub+zip'){
    return sendErrorResponse({
      message: "Invalid book file!",
      status: 422,
      res
    })
  }

  
  if(cover && !Array.isArray(cover) && cover.mimetype?.startsWith("image")){
    // if you are using cloudinary 
   newBook.cover = await UploadCoverToCloudinary(cover);

  }

  uploadBookToLocalDir(book, uniqueFileName)
  }
  newBook.fileInfo.id = uniqueFileName;
  
  await AuthorModel.findByIdAndUpdate(user.authorId, { $push: { books: newBook._id } });
  await newBook.save()
  res.send({})

};

export const updateBook: UpdateBookRequestHandler = async (req, res) => {
  const { body, files, user } = req;
  const {
    title,
    description,
    genre,
    language,
    fileInfo,
    price,
    publicationName,
    publishedAt,
    uploadMethod,
    slug
  } = body;

  const {cover, book: bookFiles } = files;
 const book = await BookModel.findOne({slug, author: user.authorId})

 if(!book){
  return sendErrorResponse({
    message: "Book not found!",
    status: 404,
    res
  })
 }
 book.title = title;
 book.description = description;
 book.publicationName = publicationName;
 book.language = language;
 book.genre = genre;
 book.publishedAt = publishedAt;
 book.price = price;

 if(uploadMethod === "local"){
  if(bookFiles && !Array.isArray(bookFiles) && bookFiles.mimetype === 'application/epub+zip'){
      // remove old book from storage
  const uploadPath = path.join(__dirname, '../books')
  const oldBookPath = path.join(uploadPath, book.fileInfo.id);
  if (!fs.existsSync(oldBookPath)) return sendErrorResponse({
    message: "Book not found!",
    status: 404,
    res
  })
  fs.unlinkSync(oldBookPath);
  // upload new book
  const newFileName = slugify(`${book._id} ${book.title}.epub`,{
    lower: true,
    replacement: "-"
  });
  const newFilePath = path.join(uploadPath, newFileName);
  const file = fs.readFileSync(bookFiles.filepath)
  fs.writeFileSync(newFilePath, file);
  book.fileInfo = {
    id: newFileName,
    size: formatFileSize(fileInfo?.size || bookFiles.size)
  };
  }

  if(cover && !Array.isArray(cover) && cover.mimetype?.startsWith("image")){
    // remove old file if exist in cloudinary
    if(book.cover?.id) {
      await cloudinary.uploader.destroy(book.cover.id);
    }
   book.cover = await UploadCoverToCloudinary(cover);

  }
 }
 await book.save()
 res.send()
  }
