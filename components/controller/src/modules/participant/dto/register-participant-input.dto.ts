import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, ValidateNested } from 'class-validator';
import { ParticipantApplicationSignedDocumentInputDTO } from './participant-application-document.dto';
import { SignedDigitalDocumentInputDTO } from '~/modules/document/dto/signed-digital-document-input.dto';

@InputType('RegisterParticipantInput')
export class RegisterParticipantInputDTO {
  @Field({ description: 'Имя аккаунта пайщика' })
  @IsNotEmpty({ message: 'Поле "username" обязательно для заполнения.' })
  username!: string;

  @Field(() => ParticipantApplicationSignedDocumentInputDTO, {
    description: 'Подписанный документ заявления на вступление в кооператив от пайщика',
  })
  @ValidateNested()
  @IsNotEmpty({ message: 'Поле "statement" обязательно для заполнения.' })
  statement!: ParticipantApplicationSignedDocumentInputDTO;

  @Field(() => SignedDigitalDocumentInputDTO, {
    description: 'Подписанный документ политики конфиденциальности от пайщика',
  })
  @ValidateNested()
  @IsNotEmpty({ message: 'Поле "privacy_agreement" обязательно для заполнения.' })
  privacy_agreement!: SignedDigitalDocumentInputDTO;

  @Field(() => SignedDigitalDocumentInputDTO, {
    description: 'Подписанный документ положения о цифровой подписи от пайщика',
  })
  @ValidateNested()
  @IsNotEmpty({ message: 'Поле "signature_agreement" обязательно для заполнения.' })
  signature_agreement!: SignedDigitalDocumentInputDTO;

  @Field(() => SignedDigitalDocumentInputDTO, {
    description: 'Подписанный документ пользовательского соглашения от пайщика',
  })
  @ValidateNested()
  @IsNotEmpty({ message: 'Поле "user_agreement" обязательно для заполнения.' })
  user_agreement!: SignedDigitalDocumentInputDTO;

  @Field(() => SignedDigitalDocumentInputDTO, {
    description: 'Подписанный документ положения целевой потребительской программы "Цифровой Кошелёк" от пайщика',
  })
  @ValidateNested()
  @IsNotEmpty({ message: 'Поле "wallet_agreement" обязательно для заполнения.' })
  wallet_agreement!: SignedDigitalDocumentInputDTO;
}