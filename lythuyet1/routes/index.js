var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient
var ProductModel = require('../models/Products')
var CategoryModel = require('../models/Category')
var multer = require('multer')
const mongoose = require('mongoose');
var storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});
var upload = multer({ storage });
/* GET home page. */
router.get('/', function (req, res, next) {
  // var keyword  = req.query.keyword
  // console.log(keyword)
  ProductModel.find()
    .then((products) => {
      res.render('index', { products, title: 'Trang chủ' })
    })
});

router.get('/chi-tiet/:id', function (req, res, next) {
  // console.req.params.id
  // res.send(req.params.id)
  ProductModel.findOne({ _id: req.params.id }).
    populate('cate_id')
    .exec((err, result) => {
      res.render('detail', { product: result, title: 'Chi tiết' })
    })
  // .then(function (product){
  //   res.render('detail', {product, title:'Chi tiết'})
  // })
})
//them danh muc
router.get('/danh-muc/them', function (req, res, next) {
  res.render('danhmuc/them', { title: 'Thêm danh mục' })
})
router.post('/danh-muc/save-them', upload.single('image'),function (req, res, next) {
  let cate = new CategoryModel({
    _id: new mongoose.Types.ObjectId(),
    name: req.body.name,
    desc: req.body.desc
  })
  cate.save((error) => {
    console.log('luu danh muc thanh cong')
    if (error) console.log(error)
  })
  res.redirect('/')
})
router.get('/danh-muc/sua/:id', function (req, res, next) {
  CategoryModel.findOne({ _id: req.params.id })
    .exec((err, result) => {
      res.render('danhmuc/sua', { category: result, _id: req.params.id, title: 'Sửa danh mục' })
    })
})
router.post('/danh-muc/save-sua/:id', upload.single('image'), function (req, res, next) {
  console.log(req.body.name)
  CategoryModel.updateOne({ _id: req.params.id },
    {
      name: req.body.name,
      desc: req.body.desc
    }, () => console.log('sua thanh cong'))
  res.redirect('/danh-muc/' + req.params.id)
})


//them sanpham
router.get('/san-pham/them/:id', function (req, res, next) {
  res.render('sanpham/them', { _id: req.params.id, title: 'Thêm sản phẩm' })
})
router.post('/san-pham/save-them/:id', upload.single('image'), function (req, res, next) {
  let filename = req.file.path.replace('public\\', '')
  let product = new ProductModel({
    _id: new mongoose.Types.ObjectId(),
    name: req.body.name,
    price: req.body.price,
    old_price: req.body.old_price,
    image: "http://localhost:3000/" + filename,
    cate_id: req.params.id,
  })
  product.save((error) => {
    console.log('luu san pham thanh cong')
    if (error) console.log(error)
  })
  res.redirect('/danh-muc/' + req.params.id)
})

//Xoa san pham
router.get('/san-pham/xoa/:id', function (req, res, next) {
    ProductModel.deleteOne({ _id: req.params.id }, () => {
      res.redirect('/')
    })

})

//Sua san pham
router.get('/san-pham/sua/:id', function (req, res, next) {
  ProductModel.findOne({ _id: req.params.id }).
    populate('cate_id')
    .exec((err, result) => {
      res.render('sanpham/sua', { product: result, _id: req.params.id, title: 'Sửa sản phẩm' })
    })
})
router.post('/san-pham/save-sua/:id', upload.single('image'), function (req, res, next) {
  console.log('id-product', req.params.id)
  let filename
  if (req.file != undefined) {
    filename = req.file.path.replace('public\\', '')
    ProductModel.updateOne({ _id: req.params.id },
      {
        name: req.body.name,
        price: req.body.price,
        old_price: req.body.old_price,
        image: "http://localhost:3000/" + filename
      }, () => console.log('sua thanh cong'))
  } else {
    ProductModel.updateOne({ _id: req.params.id },
      {
        name: req.body.name,
        price: req.body.price,
        old_price: req.body.old_price
      }, () => console.log('sua thanh cong'))
  }
  // let product = new ProductModel({
  //   name: req.body.name,
  //   price: req.body.price,
  //   old_price: req.body.old_price,
  //   image: "http://localhost:3000/" + filename,
  //   cate_id: req.params.id,
  // })
  // product.save((error) => {
  //   console.log('luu san pham thanh cong')
  //   if (error) console.log(error)
  // })
  res.redirect('/chi-tiet/' + req.params.id)
})


// router.post('/upload',{test:'123'},function(req, res, next){
//   res.send(req.body.test)
// })
router.get('/danh-muc/:id', function (req, res, next) {
  // console.req.params.id
  // res.send(req.params.id)
  let cateName
  CategoryModel.findOne({ _id: req.params.id })
    .then(function (category) {
      cateName = category.name
    })
  ProductModel.find({ cate_id: req.params.id })
    .then(function (products) {
      res.render('category', { products, title: 'Danh mục', name: cateName, cate_id: req.params.id })
    })
})

//Danh sach san pham = danh muc
router.get('/api/danh-sach-danh-muc', function (req, res, next) {
  CategoryModel.find().then((cate) => res.json(cate))
})

router.get('/api/san-pham/:id', function (req, res, next) {
  ProductModel.find({ cate_id: req.params.id })
    .then(function (products) {
      res.json(products)
    })
})

router.get('/api/san-pham/detail/:id', function (req, res, next) {
  ProductModel.findOne({ _id: req.params.id }).
    populate('cate_id')
    .exec((err, result) => {
      res.json(result)
    })
})



//Chi tiet san pham

//Dang nhap

//Danh sach danh muc - quan tri


// Xoa danh muc

//Danh sach san pham quan tri

//Them sua san pham

//Xoa san pham

//Danh sach user - quan tri

//Them xoa user
module.exports = router;
