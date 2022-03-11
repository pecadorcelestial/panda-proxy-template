// Módulos.
import { Router, Request, Response } from 'express';
// Controladores.
import { AccountController } from '../controllers/accounts';
import { AccountForcedTermController } from '../controllers/catalogs/accountForcedTerm';
import { AccountLanguageController } from '../controllers/catalogs/accountLanguages';
import { AccountPaymentReferenceController } from '../controllers/catalogs/accountPaymentReferences';
import { AccountProcessesController } from '../controllers/processes/accounts';
import { AccountStatusController } from '../controllers/catalogs/accountStatuses';
import { AccountTypeController } from '../controllers/catalogs/accountTypes';
import { PromoController } from '../controllers/catalogs/promos';
// Funciones.
import { number2Words, currencyFormat } from '../scripts/numbers';
import { date2StringFormat } from '../scripts/dates';
// Multer.
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

// CCCC U   U EEEEE N   N TTTTT  AAA   SSSS
//C     U   U E     NN  N   T   A   A S
//C     U   U EEE   N N N   T   AAAAA  SSS
//C     U   U E     N  NN   T   A   A     S
// CCCC  UUU  EEEEE N   N   T   A   A SSSS

let accountController: AccountController = new AccountController();
let accountStatusController: AccountStatusController = new AccountStatusController();
let accountLanguageController: AccountLanguageController = new AccountLanguageController();
let accountTypeController: AccountTypeController = new AccountTypeController();
let forcedTermController: AccountForcedTermController = new AccountForcedTermController();
let accountPaymentReferencesController: AccountPaymentReferenceController = new AccountPaymentReferenceController();
let promoController: PromoController = new PromoController();

router.route('/')
    .get((request: Request, response: Response) => {
        // let value: number = 34897.44;
        // let value2String: string = number2Words(value);
        // // console.log(value2String);
        // // console.log(currencyFormat.format(value));
        
        
        // response.setHeader('X-MSISDN', 'valor');
        // response.redirect(302, 'https://olimpo.domain.net');

        // let today: Date = new Date();
        // today.setHours(today.getHours() + 10);
        // let date: string = date2StringFormat(today, 'DD de MMM de YYYY, a las hh:mm');
        // console.log(date);
        
        let environment: string = (process.env.NODE_ENV || 'development').toString();
        response.status(200).send({
            message: `[${environment.toUpperCase()}][GET] I am root.`
        });
    })

router.route('/json')
    .get((request: Request, response: Response) => {            
        response.status(200).send({
            message: '[GET] I am JSON.'
        });
    })

router.route('/accounts')
    .get(accountController.getAccounts)
    .post(upload.single('file'), accountController.postAccounts);

// TODO: Eliminar.
// router.route('/accounts/paymentReferencesBatch')
//     .put(upload.single('file'), accountController.putAccountReferencesBatch);

// TODO: Eliminar.
// router.route('/accounts/fixReferences')
//     .put(upload.single('file'), accountController.putAccountFixReferences);

router.route('/account/assignPaymentReferencesAutomatically')
    .put(accountController.putAccountReferencesAutomatically);

router.route('/account/receipt')
    .get(accountController.getAccountReceipt);

router.route('/account')
    .get(accountController.getAccount)
    .post(accountController.postAccount)
    .put(accountController.putAccount)
    .delete(accountController.deleteAccount);

router.route('/account/contract')
    .post(accountController.postContract);

// NOTE: Se deshabilita ya que es recurso de uso interno solamente.
// router.route('/account/contracts/mobile')
//     .post(accountController.createAccountContract);

//EEEEE  SSSS TTTTT  AAA  TTTTT U   U  SSSS
//E     S       T   A   A   T   U   U S
//EEE    SSS    T   AAAAA   T   U   U  SSS
//E         S   T   A   A   T   U   U     S
//EEEEE SSSS    T   A   A   T    UUU  SSSS

router.route('/catalogs/account/statuses')
    .get(accountStatusController.getAccountStatuses);

router.route('/catalogs/account/status')
    .get(accountStatusController.getAccountStatus)
    .post(accountStatusController.postAccountStatus)
    .put(accountStatusController.putAccountStatus)
    .delete(accountStatusController.deleteAccountStatus);

//IIIII DDDD  IIIII  OOO  M   M  AAA   SSSS
//  I   D   D   I   O   O MM MM A   A S
//  I   D   D   I   O   O M M M AAAAA  SSS
//  I   D   D   I   O   O M   M A   A     S
//IIIII DDDD  IIIII  OOO  M   M A   A SSSS

router.route('/catalogs/account/languages')
    .get(accountLanguageController.getAccountLanguages);

router.route('/catalogs/account/language')
    .get(accountLanguageController.getAccountLanguage)
    .post(accountLanguageController.postAccountLanguage)
    .put(accountLanguageController.putAccountLanguage)
    .delete(accountLanguageController.deleteAccountLanguage);

//PPPP  L      AAA  ZZZZZ  OOO       FFFFF  OOO  RRRR  ZZZZZ  OOO   SSSS  OOO
//P   P L     A   A    Z  O   O      F     O   O R   R    Z  O   O S     O   O
//PPPP  L     AAAAA   Z   O   O      FFF   O   O RRRR    Z   O   O  SSS  O   O
//P     L     A   A  Z    O   O      F     O   O R   R  Z    O   O     S O   O
//P     LLLLL A   A ZZZZZ  OOO       F      OOO  R   R ZZZZZ  OOO  SSSS   OOO

router.route('/catalogs/account/forcedTerms')
    .get(forcedTermController.getAccountForcedTerms);

router.route('/catalogs/account/forcedTerm')
    .get(forcedTermController.getAccountForcedTerm)
    .post(forcedTermController.postAccountForcedTerm)
    .put(forcedTermController.putAccountForcedTerm)
    .delete(forcedTermController.deleteAccountForcedTerm);

//TTTTT IIIII PPPP   OOO   SSSS
//  T     I   P   P O   O S
//  T     I   PPPP  O   O  SSS
//  T     I   P     O   O     S
//  T   IIIII P      OOO  SSSS

router.route('/catalogs/account/types')
    .get(accountTypeController.getAccountTypes);
        
router.route('/catalogs/account/type')
    .get(accountTypeController.getAccountType)
    .post(accountTypeController.postAccountType)
    .put(accountTypeController.putAccountType)
    .delete(accountTypeController.deleteAccountType);

//RRRR  EEEEE FFFFF EEEEE RRRR  EEEEE N   N  CCCC IIIII  AAA       DDDD  EEEEE      PPPP   AAA   GGGG  OOO
//R   R E     F     E     R   R E     NN  N C       I   A   A      D   D E          P   P A   A G     O   O
//RRRR  EEE   FFF   EEE   RRRR  EEE   N N N C       I   AAAAA      D   D EEE        PPPP  AAAAA G  GG O   O
//R   R E     F     E     R   R E     N  NN C       I   A   A      D   D E          P     A   A G   G O   O
//R   R EEEEE R     EEEEE R   R EEEEE N   N  CCCC IIIII A   A      DDDD  EEEEE      P     A   A  GGGG  OOO

router.route('/catalogs/account/paymentReferences')
    .get(accountPaymentReferencesController.getAccountPaymentReferences);

router.route('/catalogs/account/paymentReference')
    .get(accountPaymentReferencesController.getAccountPaymentReference)
    .post(accountPaymentReferencesController.postAccountPaymentReference)
    .put(accountPaymentReferencesController.putAccountPaymentReference)
    .delete(accountPaymentReferencesController.deleteAccountPaymentReference);

//PPPP  RRRR   OOO  M   M  OOO   CCCC IIIII  OOO  N   N EEEEE  SSSS
//P   P R   R O   O MM MM O   O C       I   O   O NN  N E     S
//PPPP  RRRR  O   O M M M O   O C       I   O   O N N N EEE    SSS
//P     R   R O   O M   M O   O C       I   O   O N  NN E         S
//P     R   R  OOO  M   M  OOO   CCCC IIIII  OOO  N   N EEEEE SSSS

router.route('/catalogs/account/promos')
    .get(promoController.getPromos);

router.route('/catalogs/account/promo')
    .get(promoController.getPromo)
    .post(promoController.postPromo)
    .put(promoController.putPromo)
    .delete(promoController.deletePromo);
    
//PPPP  RRRR   OOO   CCCC EEEEE  SSSS  OOO   SSSS
//P   P R   R O   O C     E     S     O   O S
//PPPP  RRRR  O   O C     EEE    SSS  O   O  SSS
//P     R   R O   O C     E         S O   O     S
//P     R   R  OOO   CCCC EEEEE SSSS   OOO  SSSS

let accountProcessesController: AccountProcessesController = new AccountProcessesController();

router.route('/processes/accounts/receipts')
    .post(accountProcessesController.postAllAccountsReceipts);

router.route('/processes/accounts/send/openpay')
    .post(accountProcessesController.sendAllAccountsOpenPayFormats);

router.route('/processes/accounts/suspend/mobility')
    .post(accountProcessesController.suspendMobilityService);

// NOTE: Solo para apoyo interno.
// router.route('/processes/accounts/debit')
//     .get(accountProcessesController.getAccountDebit);

//EEEEE M   M  AAA  IIIII L
//E     MM MM A   A   I   L
//EEE   M M M AAAAA   I   L
//E     M   M A   A   I   L
//EEEEE M   M A   A IIIII LLLLL

router.route('/account/sendReferences')
    .post(accountProcessesController.sendReferences);

router.route('/account/sendPastDueBalance')
    .post(accountProcessesController.sendPastDueBalance);

router.route('/account/sendClose2DueDate')
    .post(accountProcessesController.sendClose2DueDate);

router.route('/account/sendEmail')
    .post(accountProcessesController.sendEmail);

router.route('/account/sendBalance')
    .post(accountProcessesController.sendBalance);

// AAA  L     TTTTT  AAA  N   N
//A   A L       T   A   A NN  N
//AAAAA L       T   AAAAA N N N
//A   A L       T   A   A N  NN
//A   A LLLLL   T   A   A N   N

router.route('/account/activateAllComplements')
    .post(accountController.activateAllComplements);

router.route('/account/activateComplements')
    .post(accountController.activateComplements);

export default router;