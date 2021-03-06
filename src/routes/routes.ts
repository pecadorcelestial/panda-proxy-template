import { Router } from 'express';
import accountRoutes from './accounts.routes';
import addressRoutes from './addresses.routes';
import altanRoutes from './altan.routes';
import authenticationRoutes from './authentication.routes';
import cdrRoutes from './cdr.routes';
import clientRoutes from './clients.routes';
import conectaRoutes from './conekta.routes';
import contactMeanRoutes from './contactMeans.routes';
import contactRoutes from './contacts.routes';
import contractRoutes from './contracts.routes';
import eventsRoutes from './events.routes';
import filesRoutes from './files.routes';
import financeRoutes from './finance.routes';
import generalSettingsRoutes from './generalSettings.routes';
import inventoryRoutes from './inventory.routes';
import locationRoutes from './locations.routes';
import mikronodeRoutes from './mikrotik.routes';
import nineOneOneRoutes from './911.routes';
import notificationRoutes from './notifications.routes';
import odxRoutes from './odxs.routes';
import openPayRoutes from './openPay.routes';
import productRoutes from './products.routes';
import prospectRoutes from './prospects.routes';
import quotationRoutes from './quotations.routes';
import scheduleRoutes from './schedule.routes';
import userRoutes from './users.routes';
import vetcormaxRoutes from './vectormax.routes';
import zendeskRoutes from './zendesk.routes';

const router = Router();

router.use(accountRoutes);
router.use(addressRoutes);
router.use(altanRoutes);
router.use(authenticationRoutes);
router.use(cdrRoutes);
router.use(clientRoutes);
router.use(conectaRoutes);
router.use(contactMeanRoutes);
router.use(contactRoutes);
router.use(contractRoutes);
router.use(eventsRoutes);
router.use(filesRoutes);
router.use(financeRoutes);
router.use(generalSettingsRoutes);
router.use(inventoryRoutes);
router.use(locationRoutes);
router.use(mikronodeRoutes);
router.use(nineOneOneRoutes);
router.use(notificationRoutes);
router.use(odxRoutes);
router.use(openPayRoutes);
router.use(productRoutes);
router.use(prospectRoutes);
router.use(quotationRoutes);
router.use(scheduleRoutes);
router.use(userRoutes);
router.use(vetcormaxRoutes);
router.use(zendeskRoutes);

export default router;
