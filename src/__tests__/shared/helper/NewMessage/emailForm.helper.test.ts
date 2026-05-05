import {
  isEmail,
  isValidRabbitEmail,
} from 'presentation/components/NewMessage/EmailForm/email.helper';

const email = 'alex@gmail.com';
const invalidEmail = 'alex@gmail';

const DomainConfigurations: string[] = ['rabbit.co.th', 'rabbitfinance.com'];

const rabbitEmail = 'alex@rabbit.co.th';

test('Valid Email', () => {
  expect(isEmail(email)).toEqual(true);
});

test('Invalid Email', () => {
  expect(isEmail(invalidEmail)).toEqual(false);
});

test('Valid Rabbit Email', () => {
  expect(isValidRabbitEmail(rabbitEmail, DomainConfigurations)).toEqual(1);
});

test('Invalid Rabbit Email', () => {
  expect(isValidRabbitEmail(email, DomainConfigurations)).toEqual(0);
});
