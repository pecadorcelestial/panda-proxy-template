import ClientModel, { Client } from "../clients";
import { Contact } from "../contacts";
import { EmailModel, To, FileStructure, Message, EmailWithTemplate } from "../notifications";

export default class ClientProcessesModel {
    
    //EEEEE M   M  AAA  IIIII L
    //E     MM MM A   A   I   L
    //EEE   M M M AAAAA   I   L
    //E     M   M A   A   I   L
    //EEEEE M   M A   A IIIII LLLLL

    // TODO: Generar el CONTROLADOR para este MODELO.
    public sendEmail(body: any): Promise<any> {
        return new Promise( async (resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {
            let { folio, attachments, template, content, subject, ...rest }: { folio: string, attachments: Array<FileStructure>, template: string, content: Array<{ name: string, content: string }>, subject: string } & any = body;
            
            // CCCC L     IIIII EEEEE N   N TTTTT EEEEE
            //C     L       I   E     NN  N   T   E
            //C     L       I   EEE   N N N   T   EEE
            //C     L       I   E     N  NN   T   E
            // CCCC LLLLL IIIII EEEEE N   N   T   EEEEE

            let clientModel: ClientModel = new ClientModel();
            let client: Client = new Client();
            let contacts: Array<Contact> = [];
            try {
                client = await clientModel.getClient({ folio });
                // @ts-ignore
                contacts = client.contacts;
            } catch(error) {
                return reject(error);
            }

            //DDDD  EEEEE  SSSS TTTTT IIIII N   N  AAA  TTTTT  AAA  RRRR  IIIII  OOO   SSSS
            //D   D E     S       T     I   NN  N A   A   T   A   A R   R   I   O   O S
            //D   D EEE    SSS    T     I   N N N AAAAA   T   AAAAA RRRR    I   O   O  SSS
            //D   D E         S   T     I   N  NN A   A   T   A   A R   R   I   O   O     S
            //DDDD  EEEEE SSSS    T   IIIII N   N A   A   T   A   A R   R IIIII  OOO  SSSS
            
            let emailModel: EmailModel = new EmailModel();
            let emailTo: Array<To> = [];
            if(Array.isArray(contacts) && contacts.length > 0) {
                for(const contact of contacts) {
                    if(Array.isArray(contact.contactMeans) && contact.contactMeans.length > 0) {
                        for(const contactMean of contact.contactMeans) {
                            if(contactMean.contactMeanName === 'email' && contactMean.notify) {
                                let environment: string = (process.env.NODE_ENV || 'development').trim().toLowerCase();
                                emailTo.push({
                                    email: environment === 'production' ? contactMean.value : 'frodriguez@domain.com',
                                    // @ts-ignore
                                    name: contactMean.contactMean.name,
                                    type: 'to'
                                });
                            }
                        }
                    }
                }
            } else {
                return reject({
                    status: 404,
                    module: 'Procesos | Clientes',
                    message: 'No se encontraron contactos.'
                });
            }

            //EEEEE M   M  AAA  IIIII L
            //E     MM MM A   A   I   L
            //EEE   M M M AAAAA   I   L
            //E     M   M A   A   I   L
            //EEEEE M   M A   A IIIII LLLLL

            if(emailTo.length > 0) {
                
                //M   M EEEEE N   N  SSSS  AAA  JJJJJ EEEEE
                //MM MM E     NN  N S     A   A   J   E
                //M M M EEE   N N N  SSS  AAAAA   J   EEE
                //M   M E     N  NN     S A   A J J   E
                //M   M EEEEE N   N SSSS  A   A  J    EEEEE

                let message: Message = {
                    html: `<h1>Example HTML content.</h1>`,
                    subject,
                    to: emailTo
                };
                if(Array.isArray(attachments) && attachments.length > 0) message.attachments = attachments;
                let email: EmailWithTemplate = {
                    async: true,
                    message,
                    template_name: template,
                    template_content: content
                };
                try {
                    await emailModel.postEmail(email);
                    return resolve({
                        stauts: 200,
                        message: 'Mensaje enviado con éxito.'
                    });
                } catch(error) {
                    return reject(error);
                }
            } else {
                return reject({
                    status: 404,
                    module: 'Procesos | Clientes',
                    message: 'No se encontraron contactos activos.'
                });
            }
        });
    }

    public sendAdvertising(body: any): Promise<any> {
        return new Promise( async (resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {
            let { template, content, subject, ...rest }: { template: string, content: Array<{ name: string, content: string }>, subject: string } & any = body;

            // CCCC L     IIIII EEEEE N   N TTTTT EEEEE  SSSS
            //C     L       I   E     NN  N   T   E     S
            //C     L       I   EEE   N N N   T   EEE    SSS
            //C     L       I   E     N  NN   T   E         S
            // CCCC LLLLL IIIII EEEEE N   N   T   EEEEE SSSS

            let params = {
                all: true,
                // limit: 3,
                // page: 1,
                statusValue: 'active'
            };
            let getClients: { results: Array<Client>, summary: any } = { results: [], summary: {} };
            let clientModel: ClientModel = new ClientModel();
            try {
                getClients = await clientModel.getClients(params);
            } catch(error) {
                return reject(error);
            }
            let errors: Array<any> = [];
            let emailSent: number = 0;
            console.log(`Total de clientes encontrados: ${getClients.results.length}`);
            for(const client of getClients.results) {

                //EEEEE M   M  AAA  IIIII L
                //E     MM MM A   A   I   L
                //EEE   M M M AAAAA   I   L
                //E     M   M A   A   I   L
                //EEEEE M   M A   A IIIII LLLLL

                let data: any = {
                    folio: client.folio,
                    // attachments,
                    template,
                    content,
                    subject
                };
                try {
                    await this.sendEmail(data);
                    emailSent++;
                    // process.stdout.write(`Mensajes enviados: ${emailSent}\r`);
                    console.log(`Mensajes enviados: ${emailSent}\r`);
                } catch(error) {
                    errors.push();
                }
            }
            
            //RRRR  EEEEE  SSSS U   U L     TTTTT  AAA  DDDD   OOO
            //R   R E     S     U   U L       T   A   A D   D O   O
            //RRRR  EEE    SSS  U   U L       T   AAAAA D   D O   O
            //R   R E         S U   U L       T   A   A D   D O   O
            //R   R EEEEE SSSS   UUU  LLLLL   T   A   A DDDD   OOO
    
            console.log(`Se enviaron ${emailSent} correctamente y hubo ${errors.length} errores.`);
            return resolve({
                status: errors.length > 0 ? 206 : 200,
                message: `Se enviaron ${emailSent} correctamente y hubo ${errors.length} errores.`
            })
        });
    }
}