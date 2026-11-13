interface User {
  email: string;
  password: string;
  username: string;
  fullname: string;
}
type UpdateUser = Partial<User>;
type DuplicateField = "username" | "email";

interface DuplicateError {
  message: string;
  success: boolean;
}

interface Rows {
  email?: string;
  username?: string;
}

type ValidationField = keyof User;



const ErrorValidations  = (
{ username, email, password, fullname,}: UpdateUser,
fields: ValidationField[]
) => {

  const validationErrors = [];

  const userNameRegex = /^[a-zA-Z0-9_]{4,15}$/;
  const passwordRegex = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const fullnameRegex = /^.{3,10}$/

  const rules = {

    username: {
      validate: () =>
        typeof username === "string" &&
        username.trim() !== "" &&
        userNameRegex.test(username),

      message: "Enter your username!",
    },

    email: {
      validate: () =>
        typeof email === "string" &&
        email.trim() !== "" &&
        emailRegex.test(email),

      message: " Enter your Email! "
    },

    password: {
      validate: () =>
        typeof password === "string" &&
        password.trim() !== "" &&
        passwordRegex.test(password),

      message: " Enter your password! "
    },

    fullname: {
      validate: () =>
        typeof fullname === "string" &&
        fullname.trim() !== "" &&
        fullnameRegex.test(fullname),

      message: " Enter your name! "
    }

  }

  type Field = keyof typeof rules;

  for(const field of fields as Field[]) {
    const rule = rules[field];

    if(rule && !rule.validate()){

      validationErrors.push({
        success: false,
        message: rule.message
      });

    }
  }

  return validationErrors;
}

const DuplicateErrors = (
  {username, email}: UpdateUser,
  fields: DuplicateField[],
  rows?: Rows
) => {

    const duplicateErrors: DuplicateError[] = [];

    if(!rows) return duplicateErrors;

    const normalizedUsername = username?.trim().toLowerCase();
    const normalizedEmail = email?.trim().toLowerCase();

    const normalizedUsernameRows = rows.username?.trim().toLowerCase();
    const normalizedEmailRows = rows.email?.trim().toLowerCase();

    const checks = {
        username: () => {
            if(normalizedUsername && normalizedUsernameRows === normalizedUsername){
                duplicateErrors.push({
                    message: "This username is already taken",
                    success: false
                })
            }
        },
        email: () => {
          if(normalizedEmail && normalizedEmailRows === normalizedEmail){
            duplicateErrors.push({
              message: "⚠ An account already exists with this email",
              success: false
            })
          }
        }
    }

    for(const field of fields){
        if(checks[field]){
            checks[field]()
        }
    }

    return duplicateErrors
}

export {
    ErrorValidations,
    DuplicateErrors
}