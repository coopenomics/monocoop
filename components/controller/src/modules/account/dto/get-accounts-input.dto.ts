import { InputType, Field } from '@nestjs/graphql';

@InputType('GetAccountsInput')
export class GetAccountsInputDTO {
  @Field({ nullable: true })
  username?: string;

  @Field({ nullable: true })
  role?: string;
}