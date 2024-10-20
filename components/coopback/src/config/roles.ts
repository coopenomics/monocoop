const user = [
  'getSelf',
  'initialPayment',
  'generateDocument',
  'getMyDocuments',
  'getMyOrders',
  'sendVerificationEmail',
  'manageMyMethods',
  'createDeposit',
  'joinCooperative',
  'getVars',
];

const member = [...user, 'getUsers', 'manageUsers', 'loadAgenda', 'loadStaff', 'getDocuments', 'loadInfo', 'manageOrders'];

const chairman = [...user, ...member, 'addUser', 'setVars', 'manageSettings', 'setWif', 'setPlugin'];

const allRoles = {
  user,
  member,
  chairman,
};

export const roles = Object.keys(allRoles);
export const roleRights = new Map(Object.entries(allRoles));
