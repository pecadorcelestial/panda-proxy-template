import { Router } from 'express';
import { ProductController, AltanProductController } from '../controllers/products';
import { BrandController } from '../controllers/catalogs/brands';
import { CategoryController } from '../controllers/catalogs/categories';
import { ProductStatusController } from '../controllers/catalogs/productStatuses';
import { ProductTypeController } from '../controllers/catalogs/productTypes';

import multer from 'multer';
const fileFilter = (request: Express.Request, file: Express.Multer.File, callback: (error: Error | null, acceptFile: boolean) => void) => {
    if (!file.originalname.match(/\.(json)$/)) {
        let error: Error = { 
            message: 'El tipo de archivo no está permitido.' ,
            name: ''
        };
        return callback(error, false);
    }
    return callback(null, true);
};
let upload = multer({ fileFilter });

const router = Router();

//PPPP  RRRR   OOO  DDDD  U   U  CCCC TTTTT  OOO   SSSS
//P   P R   R O   O D   D U   U C       T   O   O S
//PPPP  RRRR  O   O D   D U   U C       T   O   O  SSS
//P     R   R O   O D   D U   U C       T   O   O     S
//P     R   R  OOO  DDDD   UUU   CCCC   T    OOO  SSSS

let productController: ProductController = new ProductController();

router.route('/products')
    .get(productController.getProducts)
    .post(upload.single('file'), productController.postProducts);

router.route('/product/alerts')
    .get(productController.getAlerts);

router.route('/product/alert')
    .post(productController.postAlert)
    .put(productController.putAlert)
    .delete(productController.deleteAlert);

router.route('/product/bundles')
    .get(productController.getBundles);

router.route('/product/bundle')
    .post(productController.postBundle)
    .put(productController.putBundle)
    .delete(productController.deleteBundle);

router.route('/product/specifications')
    .get(productController.getSpecifications);

router.route('/product/specification')
    .post(productController.postSpecification)
    .put(productController.putSpecification)
    .delete(productController.deleteSpecification);

router.route('/product')
    .get(productController.getProduct)
    .post(productController.postProduct)
    .put(productController.putProduct)
    .delete(productController.deleteProduct);
    
//M   M  AAA  RRRR   CCCC  AAA   SSSS
//MM MM A   A R   R C     A   A S
//M M M AAAAA RRRR  C     AAAAA  SSS
//M   M A   A R   R C     A   A     S
//M   M A   A R   R  CCCC A   A SSSS

let brandController: BrandController = new BrandController();

router.route('/catalogs/brands')
    .get(brandController.getBrands);

router.route('/catalogs/brand')
    .get(brandController.getBrand)
    .post(brandController.postBrand)
    .put(brandController.putBrand)
    .delete(brandController.deleteBrand);

// CCCC  AAA  TTTTT EEEEE  GGGG  OOO  RRRR  IIIII  AAA   SSSS
//C     A   A   T   E     G     O   O R   R   I   A   A S
//C     AAAAA   T   EEE   G  GG O   O RRRR    I   AAAAA  SSS
//C     A   A   T   E     G   G O   O R   R   I   A   A     S
// CCCC A   A   T   EEEEE  GGGG  OOO  R   R IIIII A   A SSSS

let categoryController: CategoryController = new CategoryController();

router.route('/catalogs/categories')
    .get(categoryController.getCategories);
        
router.route('/catalogs/category')
    .get(categoryController.getCategory)
    .post(categoryController.postCategory)
    .put(categoryController.putCategory)
    .delete(categoryController.deleteCategory);

//EEEEE  SSSS TTTTT  AAA  TTTTT U   U  SSSS
//E     S       T   A   A   T   U   U S
//EEE    SSS    T   AAAAA   T   U   U  SSS
//E         S   T   A   A   T   U   U     S
//EEEEE SSSS    T   A   A   T    UUU  SSSS

let productStatusController: ProductStatusController = new ProductStatusController();

router.route('/catalogs/product/statuses')
    .get(productStatusController.getProductStatuses);

router.route('/catalogs/product/status')
    .get(productStatusController.getProductStatus)
    .post(productStatusController.postProductStatus)
    .put(productStatusController.putProductStatus)
    .delete(productStatusController.deleteProductStatus);

//TTTTT IIIII PPPP   OOO   SSSS
//  T     I   P   P O   O S
//  T     I   PPPP  O   O  SSS
//  T     I   P     O   O     S
//  T   IIIII P      OOO  SSSS

let productTypeController: ProductTypeController = new ProductTypeController();

router.route('/catalogs/product/types')
    .get(productTypeController.getProductTypes);
        
router.route('/catalogs/product/type')
    .get(productTypeController.getProductType)
    .post(productTypeController.postProductType)
    .put(productTypeController.putProductType)
    .delete(productTypeController.deleteProductType);

// AAA  L     TTTTT  AAA  N   N
//A   A L       T   A   A NN  N
//AAAAA L       T   AAAAA N N N
//A   A L       T   A   A N  NN
//A   A LLLLL   T   A   A N   N

let altanProductController: AltanProductController = new AltanProductController();

router.route('/products/altan')
    .get(altanProductController.getAltanProducts)
    .post(upload.single('file'), altanProductController.postAltanProducts);

router.route('/product/altan')
    .get(altanProductController.getAltanProduct)
    .post(altanProductController.postAltanProduct)
    .put(altanProductController.putAltanProduct)
    .delete(altanProductController.deleteAltanProduct);
    
export default router;