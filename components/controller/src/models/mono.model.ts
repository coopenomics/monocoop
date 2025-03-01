import mongoose, { Schema } from 'mongoose';
import { paginate, toJSON } from './plugins';
import { SystemStatusInterface } from '../types';

export interface IMono {
  coopname: string;
  status: SystemStatusInterface;
}

const Status = {
  Install: 'install',
  Active: 'active',
  Maintenance: 'maintenance',
};

const MonoSchema = new Schema<IMono>({
  coopname: { type: String, required: true },
  status: { type: String, required: true, enum: Object.values(Status) },
});

MonoSchema.plugin(toJSON);
MonoSchema.plugin(paginate);

const MonoModel = mongoose.model<IMono>('Mono', MonoSchema);

export default MonoModel;
