import httpStatus from 'http-status';
import passport from 'passport';
import ApiError from '../utils/ApiError';
import { roleRights } from '../config/roles';

const { UNAUTHORIZED, FORBIDDEN } = httpStatus;

const verifyCallback = (req, resolve, reject, requiredRights) => async (err, user, info) => {
  const serverSecret = process.env.SERVER_SECRET;

  // Check for server-secret header
  if (serverSecret && req.headers['server-secret'] === serverSecret) {
    return resolve();
  }

  if (err || info || !user) {
    return reject(new ApiError(UNAUTHORIZED, 'Please authenticate'));
  }

  req.user = user;

  const userRights = roleRights.get(user.role) || [];

  // Determine if user has the required rights
  const hasRequiredRights = requiredRights.every((requiredRight) => userRights.includes(requiredRight));

  // Check if user is accessing their own resource
  const isOwnResource = req.params.username === user.username;

  if (requiredRights.length) {
    // If rights are required but user doesn't have them, deny access
    if (!hasRequiredRights) {
      return reject(new ApiError(FORBIDDEN, 'Недостаточно прав доступа'));
    }
  } else {
    // If no rights are required, ensure user is accessing their own resource
    if (!isOwnResource) {
      return reject(new ApiError(FORBIDDEN, 'Недостаточно прав доступа'));
    }
  }

  resolve();
};

const auth =
  (...requiredRights) =>
  async (req, res, next) => {
    return new Promise((resolve, reject) => {
      passport.authenticate('jwt', { session: false }, verifyCallback(req, resolve, reject, requiredRights))(req, res, next);
    })
      .then(() => next())
      .catch((err) => next(err));
  };

export default auth;
