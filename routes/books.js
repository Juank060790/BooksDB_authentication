var express = require("express");
var router = express.Router();
const Book = require("../models/book");

// READ ALL THE BOOKS:
router.get("/", async function (req, res, next) {
  try {
    const books = await Book.find({ isDeleted: false });
    res.json({ status: "ok", data: books });
  } catch (err) {
    console.log(err);
    res.status(500).json({ status: "fail", message: err.message });
  }
});

// CREATE NEW BOOK
router.post("/", async function (req, res, next) {
  try {
    const { title, description } = req.body;

    if (!title || !description) {
      return res
        .status(400)
        .json({ status: "fail", message: "Missing title or description" });
    }

    const book = await Book.create({
      title: title,
      description: description,
    });

    res.status(201).json({ status: "ok", data: book });
  } catch (err) {
    console.log(err);
    res.status(500).json({ status: "fail" });
  }
});

// UPDATE A BOOK USING ID:
// PUT localhsot/books/someIDhere
router.put("/:bookID", async function (req, res, next) {
  try {
    const { bookID } = req.params;
    console.log("bookID", bookID);
    if (!bookID) {
      return res
        .status(400)
        .json({ status: "fail", message: "need to provide book ID" });
    }

    // 2 ways:
    // #1: we use ID to find the book!! => change book value => save back to DB; (using 2 queries) race condition
    // const book = await Book.findById(bookID);
    // for (let key in req.body) {
    //     book[key] = req.body[key]
    // };
    // await book.save();

    // #2: we use ID to find the book and update it right away (using only 1 query)
    const allowedFields = ["description"];
    // req.body = { title, description, khoa };
    // remove keys which were not allowed
    for (let key in req.body) {
      if (!allowedFields.includes(key)) {
        delete req.body[key];
      }
    }
    const book = await Book.findByIdAndUpdate(bookID, req.body, {
      new: true,
    });
    res.json({ status: "ok", data: book });
  } catch (err) {
    console.log(err);
    res.status(500).json({ status: "fail", message: err.message });
  }
});

// DELETE a book:
// 2 options:
// #1: actually delete the doc from database;
// #2: hide it from users => toggle isDeleted => true

router.delete("/:bookID", async function (req, res, next) {
  try {
    const { bookID } = req.params;
    console.log("bookID", bookID);
    if (!bookID) {
      return res
        .status(400)
        .json({ status: "fail", message: "need to provide book ID" });
    }
    // #option 1: actually delete doc;
    // const book = await Book.findByIdAndDelete(bookID);
    // #2: hide it from users => toggle isDeleted => true
    const book = await Book.findByIdAndUpdate(
      bookID,
      {
        isDeleted: true,
      }
      // optional options;
    );
    res.status(204).end();
  } catch (err) {
    console.log(err);
    res.status(500).json({ status: "fail", message: err.message });
  }
});

module.exports = router;
