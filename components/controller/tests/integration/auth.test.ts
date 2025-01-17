import request from 'supertest';
import faker from 'faker';
import httpStatus from 'http-status';
import httpMocks from 'node-mocks-http';
import moment from 'moment';
import bcrypt from 'bcryptjs';
import app from '../../src/app';
import config from '../../src/config/config';
import auth from '../../src/middlewares/auth';
import { tokenService, emailService } from '../../src/services';
import ApiError from '../../src/utils/ApiError';
import { setupTestDB } from '../utils/setupTestDB';
import { User, Token } from '../../src/models';
import { roleRights } from '../../src/config/roles';
import { tokenTypes } from '../../src/config/tokens';
import { userOne, admin, insertUsers } from '../fixtures/user.fixture';
import { userOneAccessToken, adminAccessToken } from '../fixtures/token.fixture';
import { generateUsername } from '../../src/utils/generate-username';
import { getBlockchainInfo } from '../../src/services/blockchain.service';
import { Bytes, Checksum256, PrivateKey } from '@wharfkit/session';

setupTestDB();

describe('Auth routes', () => {
  describe('POST /v1/users', () => {
    let newUser;
    beforeEach(() => {
      const email = faker.internet.email().toLowerCase();

      newUser = {
        email,
        role: 'user',
        public_key: 'EOS6MRyAjQq8ud7hVNYcfnVPJqcVpscN5So8BhtHuGYqET5GDW5CV',
        username: generateUsername(),
        referer: '',
        type: 'individual',
        individual_data: {
          first_name: faker.name.firstName(),
          last_name: faker.name.lastName(),
          middle_name: '',
          birthdate: '2023-04-01',
          phone: '+71234567890',
          email: email,
          full_address: 'Russia, Moscow, Tverskaya street, 10',
        },
      };
    });

    test('should return 201 and successfully register user if request data is ok', async () => {
      const res = await request(app).post('/v1/users').send(newUser).expect(httpStatus.CREATED);

      expect(res.body.user).toEqual({
        id: expect.anything(),
        email: newUser.email,
        role: 'user',
        is_email_verified: false,
        has_account: false,
        is_registered: false,
        public_key: newUser.public_key,
        referer: newUser.referer,
        status: 'created',
        type: 'individual',
        username: newUser.username,
        statement: {
          hash: '',
          public_key: '',
          signature: '',
          meta: {},
        },
      });

      const dbUser = await User.findById(res.body.user.id);

      expect(dbUser).toBeDefined();

      expect(dbUser).toMatchObject({ email: newUser.email, role: 'user', is_email_verified: false });

      expect(res.body.tokens).toEqual({
        access: { token: expect.anything(), expires: expect.anything() },
        refresh: { token: expect.anything(), expires: expect.anything() },
      });
    });

    test('should return 400 error if email is invalid', async () => {
      newUser.email = 'invalidEmail';

      await request(app).post('/v1/users').send(newUser).expect(httpStatus.BAD_REQUEST);
    });

    test('should return 400 error if email is already used', async () => {
      await insertUsers([userOne]);
      newUser.email = userOne.email;

      await request(app).post('/v1/users').send(newUser).expect(httpStatus.BAD_REQUEST);
    });
  });

  describe('POST /v1/auth/login', () => {
    test('should return 200 and login user if email and signature match', async () => {
      await insertUsers([userOne]);

      const now = (await getBlockchainInfo()).head_block_time;

      const privateKey = PrivateKey.fromString('5KQwrPbwdL6PhXujxW37FSSQZ1JiwsST4cqQzDeyXtP79zkvFD3');

      const bytes = Bytes.fromString(now, 'utf8');
      const checksum = Checksum256.hash(bytes);
      const signature = privateKey.signDigest(checksum);

      const loginCredentials = {
        email: userOne.email,
        now,
        signature,
      };

      const res = await request(app).post('/v1/auth/login').send(loginCredentials);

      expect(res.status).toEqual(httpStatus.OK);

      expect(res.body.user).toMatchObject({
        id: expect.anything(),
        username: userOne.username,
        email: userOne.email,
        role: userOne.role,
        is_email_verified: userOne.is_email_verified,
      });

      expect(res.body.tokens).toEqual({
        access: { token: expect.anything(), expires: expect.anything() },
        refresh: { token: expect.anything(), expires: expect.anything() },
      });
    });

    test('should return 401 error if there are no users with that email', async () => {
      const now = (await getBlockchainInfo()).head_block_time;

      const privateKey = PrivateKey.fromString('5KQwrPbwdL6PhXujxW37FSSQZ1JiwsST4cqQzDeyXtP79zkvFD3');

      const bytes = Bytes.fromString(now, 'utf8');
      const checksum = Checksum256.hash(bytes);
      const signature = privateKey.signDigest(checksum);

      const loginCredentials = {
        now,
        email: userOne.email,
        signature,
      };

      const res = await request(app).post('/v1/auth/login').send(loginCredentials).expect(httpStatus.UNAUTHORIZED);

      expect(res.body).toEqual({ code: httpStatus.UNAUTHORIZED, message: 'Пользователь не найден' });
    });

    // test('should return 401 error if signature is wrong', async () => {

    // Восстановить проверку. Необходимо подложить аккаунт тестового юзера в коде вместо обращения к блокчейну.

    // await insertUsers([userOne]);
    // const now = (await getBlockchainInfo()).head_block_time;
    // const privateKey = PrivateKey.fromString('5KQwrPbwdL6PhXujxW37FSSQZ1JiwsST4cqQzDeyXtP79zkvFD3');
    // const bytes = Bytes.fromString(now, 'utf8');
    // const checksum = Checksum256.hash(bytes);
    // const signature = privateKey.signDigest(checksum);
    // const now2 = '2024-08-02T11:50:40.000';
    // const loginCredentials = {
    //   email: userOne.email,
    //   now: now2,
    //   signature,
    // };
    // const res = await request(app).post('/v1/auth/login').send(loginCredentials);
    // console.log(res.body);
    // expect(res.status).toBe(httpStatus.UNAUTHORIZED);
    // expect(res.body).toEqual({ code: httpStatus.UNAUTHORIZED, message: 'Incorrect email or password' });
    // });
  });

  describe('POST /v1/auth/logout', () => {
    test('should return 204 if refresh token is valid', async () => {
      await insertUsers([userOne]);
      const expires = moment().add(config.jwt.refreshExpirationDays, 'days');
      const refreshToken = tokenService.generateToken(userOne._id, expires, tokenTypes.REFRESH);
      await tokenService.saveToken(refreshToken, userOne._id, expires, tokenTypes.REFRESH);

      await request(app).post('/v1/auth/logout').send({ refreshToken }).expect(httpStatus.NO_CONTENT);

      const dbRefreshTokenDoc = await Token.findOne({ token: refreshToken });
      expect(dbRefreshTokenDoc).toBe(null);
    });

    test('should return 400 error if refresh token is missing from request body', async () => {
      const res = await request(app).post('/v1/auth/logout').send();
      expect(res.status).toBe(httpStatus.BAD_REQUEST);
    });

    test('should return 404 error if refresh token is not found in the database', async () => {
      await insertUsers([userOne]);
      const expires = moment().add(config.jwt.refreshExpirationDays, 'days');
      const refreshToken = tokenService.generateToken(userOne._id, expires, tokenTypes.REFRESH);

      await request(app).post('/v1/auth/logout').send({ refreshToken }).expect(httpStatus.NOT_FOUND);
    });

    test('should return 404 error if refresh token is blacklisted', async () => {
      await insertUsers([userOne]);
      const expires = moment().add(config.jwt.refreshExpirationDays, 'days');
      const refreshToken = tokenService.generateToken(userOne._id, expires, tokenTypes.REFRESH);
      await tokenService.saveToken(refreshToken, userOne._id, expires, tokenTypes.REFRESH, true);

      await request(app).post('/v1/auth/logout').send({ refreshToken }).expect(httpStatus.NOT_FOUND);
    });
  });

  describe('POST /v1/auth/refresh-tokens', () => {
    test('should return 200 and new auth tokens if refresh token is valid', async () => {
      await insertUsers([userOne]);
      const expires = moment().add(config.jwt.refreshExpirationDays, 'days');
      const refreshToken = tokenService.generateToken(userOne._id, expires, tokenTypes.REFRESH);
      await tokenService.saveToken(refreshToken, userOne._id, expires, tokenTypes.REFRESH);
      const res = await request(app).post('/v1/auth/refresh-tokens').send({ refreshToken });
      expect(res.status).toBe(httpStatus.OK);
      expect(res.body).toEqual({
        access: { token: expect.anything(), expires: expect.anything() },
        refresh: { token: expect.anything(), expires: expect.anything() },
      });
      const dbRefreshTokenDoc = await Token.findOne({ token: res.body.refresh.token });
      expect(dbRefreshTokenDoc).toHaveProperty('blacklisted');
      expect(dbRefreshTokenDoc).toHaveProperty('token');
      expect(dbRefreshTokenDoc).toHaveProperty('user');
      expect(dbRefreshTokenDoc).toHaveProperty('expires');
      expect(dbRefreshTokenDoc).toHaveProperty('type');
      expect(dbRefreshTokenDoc).toHaveProperty('createdAt');
      expect(dbRefreshTokenDoc).toHaveProperty('updatedAt');
      const dbRefreshTokenCount = await Token.countDocuments();
      expect(dbRefreshTokenCount).toBe(1);
    });
    test('should return 400 error if refresh token is missing from request body', async () => {
      await request(app).post('/v1/auth/refresh-tokens').send().expect(httpStatus.BAD_REQUEST);
    });
    test('should return 401 error if refresh token is signed using an invalid secret', async () => {
      await insertUsers([userOne]);
      const expires = moment().add(config.jwt.refreshExpirationDays, 'days');
      const refreshToken = tokenService.generateToken(userOne._id, expires, tokenTypes.REFRESH, 'invalidSecret');
      await tokenService.saveToken(refreshToken, userOne._id, expires, tokenTypes.REFRESH);
      await request(app).post('/v1/auth/refresh-tokens').send({ refreshToken }).expect(httpStatus.UNAUTHORIZED);
    });
    test('should return 401 error if refresh token is not found in the database', async () => {
      await insertUsers([userOne]);
      const expires = moment().add(config.jwt.refreshExpirationDays, 'days');
      const refreshToken = tokenService.generateToken(userOne._id, expires, tokenTypes.REFRESH);
      await request(app).post('/v1/auth/refresh-tokens').send({ refreshToken }).expect(httpStatus.UNAUTHORIZED);
    });
    test('should return 401 error if refresh token is blacklisted', async () => {
      await insertUsers([userOne]);
      const expires = moment().add(config.jwt.refreshExpirationDays, 'days');
      const refreshToken = tokenService.generateToken(userOne._id, expires, tokenTypes.REFRESH);
      await tokenService.saveToken(refreshToken, userOne._id, expires, tokenTypes.REFRESH, true);
      await request(app).post('/v1/auth/refresh-tokens').send({ refreshToken }).expect(httpStatus.UNAUTHORIZED);
    });
    test('should return 401 error if refresh token is expired', async () => {
      await insertUsers([userOne]);
      const expires = moment().subtract(1, 'minutes');
      const refreshToken = tokenService.generateToken(userOne._id, expires, tokenTypes.REFRESH);
      await tokenService.saveToken(refreshToken, userOne._id, expires, tokenTypes.REFRESH);
      await request(app).post('/v1/auth/refresh-tokens').send({ refreshToken }).expect(httpStatus.UNAUTHORIZED);
    });
    test('should return 401 error if user is not found', async () => {
      const expires = moment().add(config.jwt.refreshExpirationDays, 'days');
      const refreshToken = tokenService.generateToken(userOne._id, expires, tokenTypes.REFRESH);
      await tokenService.saveToken(refreshToken, userOne._id, expires, tokenTypes.REFRESH);
      await request(app).post('/v1/auth/refresh-tokens').send({ refreshToken }).expect(httpStatus.UNAUTHORIZED);
    });
  });

  describe('POST /v1/auth/lost-key', () => {
    beforeEach(() => {
      jest.spyOn(emailService.transport, 'sendMail').mockResolvedValue();
    });

    test('should return 204 and send reset key email to the user', async () => {
      await insertUsers([userOne]);
      const sendResetKeyEmailSpy = jest.spyOn(emailService, 'sendResetKeyEmail');

      await request(app).post('/v1/auth/lost-key').send({ email: userOne.email }).expect(httpStatus.NO_CONTENT);

      expect(sendResetKeyEmailSpy).toHaveBeenCalledWith(userOne.email, expect.any(String));
      const resetKeyToken = sendResetKeyEmailSpy.mock.calls[0][1];
      const dbResetPasswordTokenDoc = await Token.findOne({ token: resetKeyToken, user: userOne._id.toString() });
      expect(dbResetPasswordTokenDoc).toBeDefined();
    });

    test('should return 400 if email is missing', async () => {
      await insertUsers([userOne]);

      const res = await request(app).post('/v1/auth/lost-key').send();

      expect(res.status).toBe(httpStatus.BAD_REQUEST);
    });

    test('should return 404 if email does not belong to any user', async () => {
      await request(app).post('/v1/auth/lost-key').send({ email: userOne.email }).expect(httpStatus.NOT_FOUND);
    });
  });

  describe('POST /v1/auth/reset-key', () => {
    test('should return 204 and reset the key', async () => {
      await insertUsers([userOne]);
      const expires = moment().add(config.jwt.resetPasswordExpirationMinutes, 'minutes');
      const resetKeyToken = tokenService.generateToken(userOne._id, expires, tokenTypes.RESET_KEY);
      await tokenService.saveToken(resetKeyToken, userOne._id, expires, tokenTypes.RESET_KEY);

      const res = await request(app)
        .post('/v1/auth/reset-key')
        .send({ token: resetKeyToken, public_key: userOne.public_key });

      expect(res.status).toBe(httpStatus.NO_CONTENT);

      const dbUser = await User.findById(userOne._id);
      expect(dbUser).not.toBeUndefined();

      if (dbUser) {
        const dbResetPasswordTokenCount = await Token.countDocuments({
          user: userOne._id.toString(),
          type: tokenTypes.RESET_KEY,
        });
        expect(dbResetPasswordTokenCount).toBe(0);
      }
    });

    test('should return 400 if reset key token is missing', async () => {
      await insertUsers([userOne]);

      await request(app)
        .post('/v1/auth/reset-key')
        .send({ public_key: 'EOS6MRyAjQq8ud7hVNYcfnVPJqcVpscN5So8BhtHuGYqET5GDW5CV' })
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 401 if reset key token is blacklisted', async () => {
      await insertUsers([userOne]);
      const expires = moment().add(config.jwt.resetPasswordExpirationMinutes, 'minutes');
      const resetKeyToken = tokenService.generateToken(userOne._id, expires, tokenTypes.RESET_KEY);
      await tokenService.saveToken(resetKeyToken, userOne._id, expires, tokenTypes.RESET_KEY, true);

      await request(app)
        .post('/v1/auth/reset-key')
        .send({ token: resetKeyToken, public_key: 'EOS6MRyAjQq8ud7hVNYcfnVPJqcVpscN5So8BhtHuGYqET5GDW5CV' })
        .expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 401 if reset key token is expired', async () => {
      await insertUsers([userOne]);
      const expires = moment().subtract(1, 'minutes');
      const resetKeyToken = tokenService.generateToken(userOne._id, expires, tokenTypes.RESET_KEY);
      await tokenService.saveToken(resetKeyToken, userOne._id, expires, tokenTypes.RESET_KEY);

      await request(app)
        .post('/v1/auth/reset-key')
        .send({ token: resetKeyToken, public_key: 'EOS6MRyAjQq8ud7hVNYcfnVPJqcVpscN5So8BhtHuGYqET5GDW5CV' })
        .expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 401 if user is not found', async () => {
      const expires = moment().add(config.jwt.resetPasswordExpirationMinutes, 'minutes');
      const resetKeyToken = tokenService.generateToken(userOne._id, expires, tokenTypes.RESET_KEY);
      await tokenService.saveToken(resetKeyToken, userOne._id, expires, tokenTypes.RESET_KEY);

      await request(app)
        .post('/v1/auth/reset-key')
        .send({ token: resetKeyToken, public_key: 'EOS6MRyAjQq8ud7hVNYcfnVPJqcVpscN5So8BhtHuGYqET5GDW5CV' })
        .expect(httpStatus.UNAUTHORIZED);
    });
  });

  describe('POST /v1/auth/send-verification-email', () => {
    beforeEach(() => {
      jest.spyOn(emailService.transport, 'sendMail').mockResolvedValue();
    });

    test('should return 204 and send verification email to the user', async () => {
      await insertUsers([userOne]);
      const sendVerificationEmailSpy = jest.spyOn(emailService, 'sendVerificationEmail');

      await request(app)
        .post('/v1/auth/send-verification-email')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .expect(httpStatus.NO_CONTENT);

      expect(sendVerificationEmailSpy).toHaveBeenCalledWith(userOne.email, expect.any(String));
      const verifyEmailToken = sendVerificationEmailSpy.mock.calls[0][1];
      const dbVerifyEmailToken = await Token.findOne({ token: verifyEmailToken, user: userOne._id.toString() });

      expect(dbVerifyEmailToken).toBeDefined();
    });

    test('should return 401 error if access token is missing', async () => {
      await insertUsers([userOne]);

      await request(app).post('/v1/auth/send-verification-email').send().expect(httpStatus.UNAUTHORIZED);
    });
  });

  describe('POST /v1/auth/verify-email', () => {
    test('should return 204 and verify the email', async () => {
      await insertUsers([userOne]);
      const expires = moment().add(config.jwt.verifyEmailExpirationMinutes, 'minutes');
      const verifyEmailToken = tokenService.generateToken(userOne._id, expires, tokenTypes.VERIFY_EMAIL);
      await tokenService.saveToken(verifyEmailToken, userOne._id, expires, tokenTypes.VERIFY_EMAIL);

      await request(app)
        .post('/v1/auth/verify-email')
        .query({ token: verifyEmailToken })
        .send()
        .expect(httpStatus.NO_CONTENT);

      const dbUser = await User.findById(userOne._id);

      expect(dbUser).not.toBeUndefined();

      if (!dbUser) return;

      expect(dbUser.is_email_verified).toBe(true);

      const dbVerifyEmailToken = await Token.countDocuments({
        user: userOne._id.toString(),
        type: tokenTypes.VERIFY_EMAIL,
      });
      expect(dbVerifyEmailToken).toBe(0);
    });

    test('should return 400 if verify email token is missing', async () => {
      await insertUsers([userOne]);

      await request(app).post('/v1/auth/verify-email').send().expect(httpStatus.BAD_REQUEST);
    });

    test('should return 401 if verify email token is blacklisted', async () => {
      await insertUsers([userOne]);
      const expires = moment().add(config.jwt.verifyEmailExpirationMinutes, 'minutes');
      const verifyEmailToken = tokenService.generateToken(userOne._id, expires, tokenTypes.VERIFY_EMAIL);
      await tokenService.saveToken(verifyEmailToken, userOne._id, expires, tokenTypes.VERIFY_EMAIL, true);

      await request(app)
        .post('/v1/auth/verify-email')
        .query({ token: verifyEmailToken })
        .send()
        .expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 401 if verify email token is expired', async () => {
      await insertUsers([userOne]);
      const expires = moment().subtract(1, 'minutes');
      const verifyEmailToken = tokenService.generateToken(userOne._id, expires, tokenTypes.VERIFY_EMAIL);
      await tokenService.saveToken(verifyEmailToken, userOne._id, expires, tokenTypes.VERIFY_EMAIL);

      await request(app)
        .post('/v1/auth/verify-email')
        .query({ token: verifyEmailToken })
        .send()
        .expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 401 if user is not found', async () => {
      const expires = moment().add(config.jwt.verifyEmailExpirationMinutes, 'minutes');
      const verifyEmailToken = tokenService.generateToken(userOne._id, expires, tokenTypes.VERIFY_EMAIL);
      await tokenService.saveToken(verifyEmailToken, userOne._id, expires, tokenTypes.VERIFY_EMAIL);

      await request(app)
        .post('/v1/auth/verify-email')
        .query({ token: verifyEmailToken })
        .send()
        .expect(httpStatus.UNAUTHORIZED);
    });
  });

  describe('Auth middleware', () => {
    test('should call next with no errors if access token is valid', async () => {
      await insertUsers([userOne]);
      const req = httpMocks.createRequest({ headers: { Authorization: `Bearer ${userOneAccessToken}` } });
      const next = jest.fn();

      await auth()(req, httpMocks.createResponse(), next);

      expect(next).toHaveBeenCalledWith();
      expect(req.user._id).toEqual(userOne._id);
    });

    test('should call next with unauthorized error if access token is not found in header', async () => {
      await insertUsers([userOne]);
      const req = httpMocks.createRequest();
      const next = jest.fn();

      await auth()(req, httpMocks.createResponse(), next);

      expect(next).toHaveBeenCalledWith(expect.any(ApiError));
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: httpStatus.UNAUTHORIZED, message: 'Please authenticate' })
      );
    });

    test('should call next with unauthorized error if access token is not a valid jwt token', async () => {
      await insertUsers([userOne]);
      const req = httpMocks.createRequest({ headers: { Authorization: 'Bearer randomToken' } });
      const next = jest.fn();

      await auth()(req, httpMocks.createResponse(), next);

      expect(next).toHaveBeenCalledWith(expect.any(ApiError));
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: httpStatus.UNAUTHORIZED, message: 'Please authenticate' })
      );
    });

    test('should call next with unauthorized error if the token is not an access token', async () => {
      await insertUsers([userOne]);
      const expires = moment().add(config.jwt.accessExpirationMinutes, 'minutes');
      const refreshToken = tokenService.generateToken(userOne._id, expires, tokenTypes.REFRESH);
      const req = httpMocks.createRequest({ headers: { Authorization: `Bearer ${refreshToken}` } });
      const next = jest.fn();

      await auth()(req, httpMocks.createResponse(), next);

      expect(next).toHaveBeenCalledWith(expect.any(ApiError));
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: httpStatus.UNAUTHORIZED, message: 'Please authenticate' })
      );
    });

    test('should call next with unauthorized error if access token is generated with an invalid secret', async () => {
      await insertUsers([userOne]);
      const expires = moment().add(config.jwt.accessExpirationMinutes, 'minutes');
      const accessToken = tokenService.generateToken(userOne._id, expires, tokenTypes.ACCESS, 'invalidSecret');
      const req = httpMocks.createRequest({ headers: { Authorization: `Bearer ${accessToken}` } });
      const next = jest.fn();

      await auth()(req, httpMocks.createResponse(), next);

      expect(next).toHaveBeenCalledWith(expect.any(ApiError));
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: httpStatus.UNAUTHORIZED, message: 'Please authenticate' })
      );
    });

    test('should call next with unauthorized error if access token is expired', async () => {
      await insertUsers([userOne]);
      const expires = moment().subtract(1, 'minutes');
      const accessToken = tokenService.generateToken(userOne._id, expires, tokenTypes.ACCESS);
      const req = httpMocks.createRequest({ headers: { Authorization: `Bearer ${accessToken}` } });
      const next = jest.fn();

      await auth()(req, httpMocks.createResponse(), next);

      expect(next).toHaveBeenCalledWith(expect.any(ApiError));
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: httpStatus.UNAUTHORIZED, message: 'Please authenticate' })
      );
    });

    test('should call next with unauthorized error if user is not found', async () => {
      const req = httpMocks.createRequest({ headers: { Authorization: `Bearer ${userOneAccessToken}` } });
      const next = jest.fn();

      await auth()(req, httpMocks.createResponse(), next);

      expect(next).toHaveBeenCalledWith(expect.any(ApiError));
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: httpStatus.UNAUTHORIZED, message: 'Please authenticate' })
      );
    });

    test('should call next with forbidden error if user does not have required rights and userId is not in params', async () => {
      await insertUsers([userOne]);
      const req = httpMocks.createRequest({ headers: { Authorization: `Bearer ${userOneAccessToken}` } });
      const next = jest.fn();

      await auth('anyRight')(req, httpMocks.createResponse(), next);

      expect(next).toHaveBeenCalledWith(expect.any(ApiError));
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: httpStatus.FORBIDDEN, message: 'Недостаточно прав доступа' })
      );
    });

    test('should call next with no errors if user does not have required rights but username is in params', async () => {
      await insertUsers([userOne]);
      const req = httpMocks.createRequest({
        headers: { Authorization: `Bearer ${userOneAccessToken}` },
        params: { username: userOne.username },
      });
      const next = jest.fn();

      await auth('anyRight')(req, httpMocks.createResponse(), next);

      expect(next).toHaveBeenCalledWith();
    });

    test('should call next with no errors if user has required rights', async () => {
      await insertUsers([admin]);
      const req = httpMocks.createRequest({
        headers: { Authorization: `Bearer ${adminAccessToken}` },
        params: { userId: userOne._id.toHexString() },
      });
      const next = jest.fn();

      const chairmanRights = roleRights.get('chairman') || [];
      await auth(...chairmanRights)(req, httpMocks.createResponse(), next);

      expect(next).toHaveBeenCalledWith();
    });
  });
});
