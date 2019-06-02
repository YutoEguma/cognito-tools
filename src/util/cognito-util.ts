import * as CognitoIdentityServiceProvider from 'aws-sdk/clients/cognitoidentityserviceprovider';

export const adminCreateUser = (cognitoIsp: CognitoIdentityServiceProvider, param: CognitoIdentityServiceProvider.AdminCreateUserRequest) => {
  return cognitoIsp.adminCreateUser(param).promise();
};

export const signUp = (cognitoIsp: CognitoIdentityServiceProvider, param: CognitoIdentityServiceProvider.SignUpRequest) => {
  return cognitoIsp.signUp(param).promise();
};

export const forceCreateUser = (cognitoIsp: CognitoIdentityServiceProvider, data: any, userPoolId: string, clientId: string) => {
  if (data.password === '') {
    const adminParam = createAdminParam(userPoolId, data);
    return cognitoIsp.adminCreateUser(adminParam).promise().then(async value => {
      if (value.User) {
        const uuid = value.User.Username as string;
        if (data.facebookId && data.facebookId !== '') {
          await linkFacebookProvider(cognitoIsp, userPoolId, uuid,
            data.facebookId).catch((err: any) => console.error(err));
        }
        return uuid;
      }
    });
  }
  const signUpParam = createSignUpParam(clientId, data);
  return cognitoIsp.signUp(signUpParam).promise().then(async value => {
    const uuid = value.UserSub;
    if (data.facebookId && data.facebookId !== '') {
      await linkFacebookProvider(cognitoIsp, userPoolId, uuid, data.facebookId).catch(err => console.error(err));
    }
    return uuid;
  });
};

export const createParam = (userPoolId: string, data: any) => {
  const attributes = data.Attributes.filter((a: any) => a.Name !== 'sub' || a.Name !== 'identities');
  const email = data.Attributes.filter((a: any) => a.Name === 'email')[0].Value;
  // Username = email
  return {
    UserPoolId: userPoolId,
    Username: email,
    UserAttributes: attributes,
    DesiredDeliveryMediums: [], // EMAIL or SMS
    MessageAction: 'SUPPRESS', //or RESEND
    ForceAliasCreation: false,
    // TemporaryPassword: tempPassword,
  };
};

const linkFacebookProvider = (cognitoIsp: CognitoIdentityServiceProvider, userPoolId: string, uuid: string, facebookId: string) => {
  const param = {
    DestinationUser: {
      ProviderName: 'Cognito',
      ProviderAttributeName: undefined,
      ProviderAttributeValue: uuid,
    },
    SourceUser: {
      ProviderAttributeName: 'Cognito_Subject',
      ProviderAttributeValue: facebookId.toString(),
      ProviderName: 'Facebook',
    },
    UserPoolId: userPoolId,
  };

  return cognitoIsp.adminLinkProviderForUser(param).promise();
};

const createAdminParam = (userPoolId: string, data: any) => {
  const attributes = Object.keys(data).filter(key => ['password', 'facebookId'].indexOf(key) === -1).map(key => ({
    Name: key,
    Value: data[key],
  }));
  return {
    UserPoolId: userPoolId,
    Username: data.email,
    UserAttributes: [...attributes, {Name: 'email_verified', Value: 'true'}],
    DesiredDeliveryMediums: [], // EMAIL or SMS
    MessageAction: 'SUPPRESS', //or RESEND
    ForceAliasCreation: false,
    // TemporaryPassword: tempPassword,
  };
};

const createSignUpParam = (clientId: string, data: any) => {
  const attributes = Object.keys(data).filter(key => ['email', 'password', 'facebookId'].indexOf(key) === -1).map(key => ({
    Name: key,
    Value: data[key],
  }));
  return {
    ClientId: clientId,
    Username: data.email,
    UserAttributes: attributes,
    Password: data.password,
  };
};