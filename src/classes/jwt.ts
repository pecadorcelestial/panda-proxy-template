import jwt from 'jsonwebtoken';
import { IsDefined, IsString, IsBoolean, validate, IsEnum, IsArray, IsNumber, IsNumberString } from 'class-validator';

import configuration from '../configuration';
import { RemodelErrors } from '../scripts/data-management';

//TTTTT IIIII PPPP   OOO   SSSS
//  T     I   P   P O   O S
//  T     I   PPPP  O   O  SSS
//  T     I   P     O   O     S
//  T   IIIII P      OOO  SSSS

/*
Registered Claim Names:
    "iss" (Issuer)           - The processing of this claim is generally application specific.
    "sub" (Subject)
    "aud" (Audience)
    "exp" (Expiration Time)  - Its value MUST be a number containing a NumericDate value.
    "nbf" (Not Before)       - The "nbf" (not before) claim identifies the time before which the JWT MUST NOT be accepted for processing.
    "iat" (Issued At)        - The "iat" (issued at) claim identifies the time at which the JWT was issued.
    "jti" (JWT ID)           - The identifier value MUST be assigned in a manner that ensures that there is a negligible probability that the same value will be accidentally assigned to a different data object; if the application uses multiple issuers, collisions MUST be prevented among values produced by different issuers as well.  The "jti" claim can be used to prevent the JWT from being replayed.
*/

export enum Algorithm {
    HS256 = 'HS256',
    HS384 = 'HS384',
    HS512 = 'HS512',
    RS256 = 'RS256',
    RS384 = 'RS384',
    RS512 = 'RS512',
    ES256 = 'ES256',
    ES384 = 'ES384',
    ES512 = 'ES512',
    none = 'none'
}

class JWTSignOptions {
    @IsDefined({
        message: 'El campo es requerido.'
    })
    @IsEnum(Algorithm, {
        message: 'El valor asignado a $property no se encuentra dentro del listado válido.'
    })
    algorithm: Algorithm;
    @IsString({
        message: 'El tipo de dato es incorrecto.'
    })
    expiresIn: string;
    @IsNumberString({
        message: 'El tipo de dato es incorrecto.'
    })
    notBefore: string | number;
    @IsString({
        message: 'El tipo de dato es incorrecto.'
    })
    audience: string;
    @IsString({
        message: 'El tipo de dato es incorrecto.'
    })
    issuer: string;
    @IsString({
        message: 'El tipo de dato es incorrecto.'
    })
    jwtid: string;
    @IsString({
        message: 'El tipo de dato es incorrecto.'
    })
    subject: string;
    @IsString({
        message: 'El tipo de dato es incorrecto.'
    })
    noTimestamp: string;
    @IsString({
        message: 'El tipo de dato es incorrecto.'
    })
    header: string;
    @IsString({
        message: 'El tipo de dato es incorrecto.'
    })
    keyid: string;
    @IsBoolean({
        message: 'El tipo de dato es incorrecto.'
    })
    mutatePayload: boolean;
}

class JWTValidateOptions {
    @IsDefined({
        message: 'El campo es requerido.'
    })
    //@IsEnum(Algorithm, {
    //    message: 'El valor asignado a $property no se encuentra dentro del listado válido.'
    //})
    @IsArray({
        message: 'El tipo de dato es incorrecto.'
    })
    algorithms: Algorithm[];
    @IsString({
        message: 'El tipo de dato es incorrecto.'
    })
    audience: string | string[];
    @IsString({
        message: 'El tipo de dato es incorrecto.'
    })
    issuer: string | string[];
    @IsBoolean({
        message: 'El tipo de dato es incorrecto.'
    })
    ignoreExpiration: boolean;
    @IsBoolean({
        message: 'El tipo de dato es incorrecto.'
    })
    ignoreNotBefore: boolean;
    @IsString({
        message: 'El tipo de dato es incorrecto.'
    })
    subject: string;
    @IsNumber({ allowNaN: false }, {
        message: 'El tipo de dato es incorrecto.'
    })
    clockTolerance: number;
    @IsString({
        message: 'El tipo de dato es incorrecto.'
    })
    maxAge: string;
    @IsNumber({ allowNaN: false }, {
        message: 'El tipo de dato es incorrecto.'
    })
    clockTimestamp: number;
    @IsString({
        message: 'El tipo de dato es incorrecto.'
    })
    nonce: string;
}

// CCCC L      AAA   SSSS EEEEE
//C     L     A   A S     E
//C     L     AAAAA  SSS  EEE
//C     L     A   A     S E
// CCCC LLLLL A   A SSSS  EEEEE

export class JWT {

    //PPPP  RRRR   OOO  PPPP  IIIII EEEEE DDDD   AAA  DDDD  EEEEE  SSSS
    //P   P R   R O   O P   P   I   E     D   D A   A D   D E     S
    //PPPP  RRRR  O   O PPPP    I   EEE   D   D AAAAA D   D EEE    SSS
    //P     R   R O   O P       I   E     D   D A   A D   D E         S
    //P     R   R  OOO  P     IIIII EEEEE DDDD  A   A DDDD  EEEEE SSSS

    private token: string;
    private secret: string;

    // CCCC  OOO  N   N  SSSS TTTTT RRRR  U   U  CCCC TTTTT  OOO  RRRR
    //C     O   O NN  N S       T   R   R U   U C       T   O   O R   R
    //C     O   O N N N  SSS    T   RRRR  U   U C       T   O   O RRRR
    //C     O   O N  NN     S   T   R   R U   U C       T   O   O R   R
    // CCCC  OOO  N   N SSSS    T   R   R  UUU   CCCC   T    OOO  R   R

    constructor(jwt?: string) {
        this.secret = configuration.jwt.secret;
        this.token = jwt || '';
    }

    //M   M EEEEE TTTTT  OOO  DDDD   OOO   SSSS
    //MM MM E       T   O   O D   D O   O S
    //M M M EEE     T   O   O D   D O   O  SSS
    //M   M E       T   O   O D   D O   O     S
    //M   M EEEEE   T    OOO  DDDD   OOO  SSSS

    public setToken(token: string) {
        this.token = token;
    }

    public create(options: any, publicClaims: any = {}, privateClaims: any = {}, callback: (error: any, data: any) => void): void {
        let payload: any = (<any>Object).assign({}, publicClaims, privateClaims);
        
        //V   V  AAA  L     IIIII DDDD   AAA   CCCC IIIII  OOO  N   N
        //V   V A   A L       I   D   D A   A C       I   O   O NN  N
        //V   V AAAAA L       I   D   D AAAAA C       I   O   O N N N
        // V V  A   A L       I   D   D A   A C       I   O   O N  NN
        //  V   A   A LLLLL IIIII DDDD  A   A  CCCC IIIII  OOO  N   N

        let optionsToValidate = new JWTSignOptions();
        optionsToValidate.algorithm = options.algorithm;
        optionsToValidate.expiresIn = options.expiresIn;
        optionsToValidate.notBefore = options.notBefore;
        optionsToValidate.audience = options.audience;
        optionsToValidate.issuer = options.issuer;
        optionsToValidate.jwtid = options.jwtid;
        optionsToValidate.subject = options.subject;
        optionsToValidate.noTimestamp = options.noTimestamp;
        optionsToValidate.header = options.header;
        optionsToValidate.keyid = options.keyid;
        optionsToValidate.mutatePayload = options.mutatePayload;
        validate(optionsToValidate, { skipMissingProperties: true })
        .then((errors: any) => {
            if (errors.length > 0) {
                let errorsWithConstraints: any[] = RemodelErrors(errors);
                let error: any = {
                    message: 'La información no es válida.',
                    errors: errorsWithConstraints
                };
                callback(error, null);
                return;
            }
        });

        //RRRR  EEEEE  SSSS U   U L     TTTTT  AAA  DDDD   OOO
        //R   R E     S     U   U L       T   A   A D   D O   O
        //RRRR  EEE    SSS  U   U L       T   AAAAA D   D O   O
        //R   R E         S U   U L       T   A   A D   D O   O
        //R   R EEEEE SSSS   UUU  LLLLL   T   A   A DDDD   OOO

        jwt.sign(payload, this.secret, options, (error: any, encodedJWT: string) => {
            if(error) {
                callback(error, null);
                return;
            }
            callback(null, encodedJWT);
            return;
        });
    }

    public validate(options: any, callback: (error: any, data: any) => void): void {
        
        //V   V  AAA  L     IIIII DDDD   AAA   CCCC IIIII  OOO  N   N
        //V   V A   A L       I   D   D A   A C       I   O   O NN  N
        //V   V AAAAA L       I   D   D AAAAA C       I   O   O N N N
        // V V  A   A L       I   D   D A   A C       I   O   O N  NN
        //  V   A   A LLLLL IIIII DDDD  A   A  CCCC IIIII  OOO  N   N

        let optionsToValidate = new JWTValidateOptions();
        optionsToValidate.algorithms = options.algorithms;
        optionsToValidate.audience = options.audience;
        optionsToValidate.issuer = options.issuer;
        optionsToValidate.ignoreExpiration = options.ignoreExpiration;
        optionsToValidate.ignoreNotBefore = options.ignoreNotBefore;
        optionsToValidate.subject = options.subject;
        optionsToValidate.clockTolerance = options.clockTolerance;
        optionsToValidate.maxAge = options.maxAge;
        optionsToValidate.clockTimestamp = options.clockTimestamp;
        optionsToValidate.nonce = options.nonce;

        validate(optionsToValidate, { skipMissingProperties: true })
        .then((errors: any) => {
            if (errors.length > 0) {
                let errorsWithConstraints: any[] = RemodelErrors(errors);
                let error: any = {
                    message: 'La información no es válida.',
                    errors: errorsWithConstraints
                };
                callback(error, null);
                return;
            }
        });

        //RRRR  EEEEE  SSSS U   U L     TTTTT  AAA  DDDD   OOO
        //R   R E     S     U   U L       T   A   A D   D O   O
        //RRRR  EEE    SSS  U   U L       T   AAAAA D   D O   O
        //R   R E         S U   U L       T   A   A D   D O   O
        //R   R EEEEE SSSS   UUU  LLLLL   T   A   A DDDD   OOO

        try {
            jwt.verify(this.token, this.secret, { algorithms: ['HS256'] }, (error: any, decodedJWT: any) => {
                if(error) {
                    /*
                    error = {
                        name: 'TokenExpiredError',
                        message: 'jwt expired',
                        expiredAt: 1408621000
                    }
                    */
                    callback(error, null);
                    return false;
                }
                callback(null, decodedJWT);
                return;
            });
        } catch(exception) {
            callback(exception, null);
        }
    }
}