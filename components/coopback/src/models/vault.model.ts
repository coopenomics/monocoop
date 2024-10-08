import mongoose, { Schema, type Model } from 'mongoose';
import { paginate, toJSON } from './plugins';
import { decrypt, encrypt } from '../utils/aes';

export interface IVault {
  username: string;
  permission: wifPermissions;
  wif: string;
}

export enum wifPermissions {
  'Active' = 'active',
}

interface IVaultActions extends Model<IVault> {
  getWif(username: string, permission?: wifPermissions): Promise<string | null>;
  setWif(username: string, wif: string, permission?: wifPermissions): Promise<boolean>;
}

const VaultSchema = new Schema<IVault, IVaultActions>({
  username: { type: String, required: true },
  permission: { type: String, required: true, enum: Object.values(wifPermissions) },
  wif: { type: String, required: true, private: true },
});

// Метод для извлечения WIF с дефолтным значением permission
VaultSchema.statics.getWif = async function (
  username: string,
  permission: wifPermissions = wifPermissions.Active
): Promise<string | null> {
  const vault = await this.findOne({ username, permission });
  if (vault) {
    try {
      return decrypt(vault.wif); // Расшифровываем WIF перед возвратом
    } catch (error) {
      console.error('Ошибка при расшифровке WIF:', error);
      return null;
    }
  }
  return null;
};

// Метод для обновления или создания WIF с дефолтным значением permission
VaultSchema.statics.setWif = async function (
  username: string,
  wif: string,
  permission: wifPermissions = wifPermissions.Active
): Promise<boolean> {
  const encryptedWif = encrypt(wif); // Шифруем WIF перед сохранением

  const result = await this.findOneAndUpdate(
    { username, permission },
    { wif: encryptedWif },
    { new: true, upsert: true } // upsert создает новую запись, если не существует
  );

  return result !== null;
};

VaultSchema.plugin(toJSON);
VaultSchema.plugin(paginate);

const Vault = mongoose.model<IVault, IVaultActions>('Vault', VaultSchema);

export default Vault;
